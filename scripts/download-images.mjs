/**
 * download-images.mjs
 * Liest alle .md-Dateien in scripts/output/, sammelt alle Bild-URLs
 * von plasticsurf.de, lädt sie herunter und aktualisiert die URLs
 * in den .md-Dateien auf lokale Pfade (/images/blog/...).
 *
 * Ausführen:
 *   node scripts/download-images.mjs
 *
 * Bilder landen in: public/images/blog/YYYY/MM/dateiname.webp
 * URLs werden ersetzt: https://www.plasticsurf.de/wp-content/uploads/... → /images/blog/...
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Konfiguration ──────────────────────────────────────────────────────────────

const MD_DIR    = join(__dirname, 'output');
const PUBLIC_DIR = join(__dirname, '..', 'public', 'images', 'blog');
const WP_BASE   = 'https://www.plasticsurf.de/wp-content/uploads/';
const LOCAL_BASE = '/images/blog/';

// Gleichzeitige Downloads begrenzen (Serverfreundlich)
const CONCURRENCY = 3;

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

/**
 * Extrahiert alle WP-Bild-URLs aus einem Datei-Inhalt.
 * Erfasst:
 *   - featuredImage: "https://www.plasticsurf.de/wp-content/uploads/..."
 *   - ![alt](https://www.plasticsurf.de/wp-content/uploads/...)
 */
function extractImageUrls(content) {
  const urls = new Set();

  // Frontmatter: featuredImage: "URL"
  const fmMatch = content.match(/^featuredImage:\s*"(https:\/\/www\.plasticsurf\.de\/wp-content\/uploads\/[^"]+)"/m);
  if (fmMatch) urls.add(fmMatch[1]);

  // Markdown-Inline-Bilder: ![alt](URL)
  const mdRegex = /!\[[^\]]*\]\((https:\/\/www\.plasticsurf\.de\/wp-content\/uploads\/[^)"\s]+)/g;
  let m;
  while ((m = mdRegex.exec(content)) !== null) {
    urls.add(m[1]);
  }

  return [...urls];
}

/**
 * Konvertiert eine WP-Upload-URL in einen lokalen Pfad.
 * https://www.plasticsurf.de/wp-content/uploads/2024/09/bild.webp
 * → public/images/blog/2024/09/bild.webp  (Dateisystem)
 * → /images/blog/2024/09/bild.webp        (URL im Frontmatter)
 */
function urlToLocalPath(url) {
  const relative = url.replace(WP_BASE, ''); // "2024/09/bild.webp"
  return {
    fsPath:   join(PUBLIC_DIR, relative),
    urlPath:  LOCAL_BASE + relative,
    relative,
  };
}

/**
 * Lädt eine einzelne Datei per HTTP/HTTPS herunter.
 * Folgt Weiterleitungen (max. 5).
 */
function downloadFile(url, destPath, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Zu viele Weiterleitungen'));

    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath, redirectCount + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} für ${url}`));
      }

      // Zielordner anlegen
      const dir = dirname(destPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        writeFileSync(destPath, Buffer.concat(chunks));
        resolve();
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Verarbeitet eine Warteschlange mit begrenzter Parallelität.
 */
async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ── Alle .md-Dateien lesen ────────────────────────────────────────────────────

const mdFiles = readdirSync(MD_DIR).filter(f => f.endsWith('.md'));
console.log(`📄 ${mdFiles.length} .md-Dateien gefunden\n`);

// ── Alle Bild-URLs sammeln ────────────────────────────────────────────────────

const urlToFiles = new Map(); // url → [mdFilename, ...]

for (const filename of mdFiles) {
  const content = readFileSync(join(MD_DIR, filename), 'utf-8');
  const urls = extractImageUrls(content);
  for (const url of urls) {
    if (!urlToFiles.has(url)) urlToFiles.set(url, []);
    urlToFiles.get(url).push(filename);
  }
}

console.log(`🖼  ${urlToFiles.size} einzigartige Bild-URLs gefunden\n`);

// ── Bilder herunterladen ──────────────────────────────────────────────────────

let downloaded = 0;
let alreadyExists = 0;
let failed = 0;
const failedUrls = [];

const downloadTasks = [...urlToFiles.keys()].map(url => async () => {
  const { fsPath, relative } = urlToLocalPath(url);

  if (existsSync(fsPath)) {
    process.stdout.write(`  ⏭ ${relative}\n`);
    alreadyExists++;
    return;
  }

  try {
    await downloadFile(url, fsPath);
    process.stdout.write(`  ✓ ${relative}\n`);
    downloaded++;
  } catch (err) {
    process.stdout.write(`  ✗ ${relative} — ${err.message}\n`);
    failedUrls.push({ url, error: err.message });
    failed++;
  }
});

await runWithConcurrency(downloadTasks, CONCURRENCY);

console.log('\n──────────────────────────────────────');
console.log(`✓ Heruntergeladen: ${downloaded}`);
console.log(`⏭ Bereits vorhanden: ${alreadyExists}`);
if (failed > 0) {
  console.log(`✗ Fehlgeschlagen:  ${failed}`);
  failedUrls.forEach(({ url, error }) => console.log(`   → ${url}\n     ${error}`));
}
console.log('──────────────────────────────────────\n');

if (failed > 0) {
  console.log('⚠ Fehlgeschlagene Bilder bleiben als externe URL in den .md-Dateien.');
  console.log('  Diese Dateien werden NICHT aktualisiert.\n');
}

// ── URLs in .md-Dateien aktualisieren ────────────────────────────────────────

console.log('🔄 Aktualisiere Bild-URLs in .md-Dateien...\n');

const failedUrlSet = new Set(failedUrls.map(f => f.url));
let updatedFiles = 0;

for (const filename of mdFiles) {
  const filePath = join(MD_DIR, filename);
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;

  for (const [wpUrl] of urlToFiles) {
    if (failedUrlSet.has(wpUrl)) continue; // Nur erfolgreich heruntergeladene ersetzen

    const { urlPath } = urlToLocalPath(wpUrl);
    if (content.includes(wpUrl)) {
      content = content.replaceAll(wpUrl, urlPath);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${filename}`);
    updatedFiles++;
  }
}

console.log('\n──────────────────────────────────────');
console.log(`✓ .md-Dateien aktualisiert: ${updatedFiles}`);
console.log(`📁 Bilder in: public/images/blog/`);
console.log('──────────────────────────────────────');
