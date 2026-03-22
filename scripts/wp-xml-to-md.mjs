/**
 * wp-xml-to-md.mjs
 * Konvertiert einen WordPress WXR-Export zu einzelnen Markdown-Dateien.
 *
 * Ausführen:
 *   node scripts/wp-xml-to-md.mjs
 *
 * Ausgabe: scripts/output/<slug>.md
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Konfiguration ──────────────────────────────────────────────────────────────

const XML_PATH = '/Users/tinelli/Documents/Workstation/PlasticSurf/02 Online/WebSite/PS Web 2024/Blog/ -- Beiträge/werbeagenturfreiburg.WordPress.2026-03-16.xml';
const OUTPUT_DIR = join(__dirname, 'output');

// ── Turndown-Konfiguration ─────────────────────────────────────────────────────

const td = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// Bilder vollständig erhalten (mit alt-Text)
td.addRule('images', {
  filter: 'img',
  replacement(content, node) {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('src') || '';
    const title = node.getAttribute('title') || '';
    return src ? `\n\n![${alt}](${src}${title ? ` "${title}"` : ''})\n\n` : '';
  },
});

// Leere Divs/Spans ignorieren
td.addRule('emptyElements', {
  filter(node) {
    return ['div', 'span', 'section'].includes(node.nodeName.toLowerCase()) &&
      !node.textContent.trim() && !node.querySelector('img');
  },
  replacement: () => '',
});

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

function getPostMeta($, item, key) {
  let result = '';
  item.find('wp\\:postmeta').each((_, meta) => {
    const metaEl = $(meta);
    const metaKey = metaEl.find('wp\\:meta_key').text().trim();
    if (metaKey === key) {
      result = metaEl.find('wp\\:meta_value').text().trim();
    }
  });
  return result;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

function yamlString(str) {
  if (!str) return '""';
  const decoded = decodeEntities(str);
  const escaped = decoded.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function formatDate(dateStr) {
  // "2023-12-09 16:01:49" → "2023-12-09"
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
}

// ── Serien-Map: slug → { seriesSlug, seriesPart } ─────────────────────────────
//
// Neue Serie ergänzen: Eintrag in SERIES_MAP hinzufügen.
// Für zukünftige Teile (noch nicht in XML): nach Veröffentlichung + neuem Export eintragen.
//
const SERIES_MAP = {

  // Serie 1: Die Revolution der KI-Agenten (5 Teile)
  'ki-agenten-der-groesste-umbruch-seit-dem-internet':
    { seriesSlug: 'ki-revolution-agenten', seriesPart: 1 },
  'die-revolution-der-ki-agenten-teil-2-so-genial-wird-dein-alltag-mit-ki-agenten-2030':
    { seriesSlug: 'ki-revolution-agenten', seriesPart: 2 },
  'die-revolution-der-ki-agenten-teil-3-der-historische-kontext-warum-ki-agenten-unvermeidlich-sind':
    { seriesSlug: 'ki-revolution-agenten', seriesPart: 3 },
  'die-revolution-der-ki-agenten-teil-4-die-funktionsweise-von-ki-agenten-was-steckt-dahinter':
    { seriesSlug: 'ki-revolution-agenten', seriesPart: 4 },
  'zukunft-der-mensch-maschine-schnittstelle-von-sprache-zu-gedanken':
    { seriesSlug: 'ki-revolution-agenten', seriesPart: 5 },

  // Serie 2: Personalisierung im KI Marketing (2 Teile)
  'personalisierung-auf-autopilot-so-funktioniert-ki-marketing-teil-1':
    { seriesSlug: 'personalisierung-ki-marketing', seriesPart: 1 },
  'personalisierung-im-ki-marketing-so-verstehst-du-deine-kunden-wirklich-teil-2':
    { seriesSlug: 'personalisierung-ki-marketing', seriesPart: 2 },

  // Serie 3: Der unkopierbare Faktor (2 Teile)
  'jagged-frontier-warum-erfahrung-und-intuition-zur-haertesten-waehrung-der-ki-aera-werden':
    { seriesSlug: 'unkopierbare-faktor', seriesPart: 1 },
  'agency-decay-die-demenz-der-kompetenz-warum-bequemlichkeit-dein-groesstes-bilanzrisiko-wird':
    { seriesSlug: 'unkopierbare-faktor', seriesPart: 2 },

  // Serie 4: Die Physik des Wertes (3 Teile in XML + Teil 4 bereits als MDX)
  'das-plaedoyer-fuer-die-verschwendung-der-mann-mit-dem-eichhoernchenhaar-pinsel':
    { seriesSlug: 'physik-des-wertes', seriesPart: 1 },
  'die-architektur-der-wahrnehmung-warum-wir-das-teurere-paket-kaufen-bevor-wir-den-inhalt-kennen':
    { seriesSlug: 'physik-des-wertes', seriesPart: 2 },
  'warum-begehrlichkeit-dort-beginnt-wo-das-kaufen-aufhoert':
    { seriesSlug: 'physik-des-wertes', seriesPart: 3 },
  // Teil 4 "Das 10-Millionen-Euro-Geräusch" → bereits MDX, dort manuell eintragen:
  //   series: "physik-des-wertes"
  //   seriesPart: 4

};

// ── XML einlesen und parsen ────────────────────────────────────────────────────

console.log('Lese XML...');
const xml = readFileSync(XML_PATH, 'utf-8');

const $ = cheerio.load(xml, { xmlMode: true });

// ── Autoren-Map aufbauen: login → display_name ────────────────────────────────

const authorMap = {};
$('wp\\:author').each((_, el) => {
  const login = $(el).find('wp\\:author_login').text().trim();
  const displayName = $(el).find('wp\\:author_display_name').text().trim();
  if (login && displayName) {
    authorMap[login] = displayName;
  }
});

console.log(`Autoren-Map: ${Object.keys(authorMap).length} Autoren gefunden`);

// ── Attachment-Map aufbauen: post_id → guid (Bild-URL) ────────────────────────

// Map: id → { url, alt }
const attachmentMap = {};
$('item').each((_, el) => {
  const item = $(el);
  const postType = item.find('wp\\:post_type').text().trim();
  if (postType === 'attachment') {
    const id = item.find('wp\\:post_id').text().trim();
    // wp:attachment_url enthält die direkte Bild-URL (guid hat nur die Permalink-URL)
    const url = item.find('wp\\:attachment_url').text().trim()
             || item.find('guid').text().trim();
    // Alt-Text aus WordPress-Attachment-Meta
    const alt = getPostMeta($, item, '_wp_attachment_image_alt');
    if (id && url) {
      attachmentMap[id] = { url, alt };
    }
  }
});

console.log(`Attachment-Map: ${Object.keys(attachmentMap).length} Bilder gefunden`);

// ── Output-Verzeichnis sicherstellen ──────────────────────────────────────────

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ── Posts verarbeiten ─────────────────────────────────────────────────────────

let created = 0;
let skipped = 0;
let errors = 0;

$('item').each((_, el) => {
  const item = $(el);

  // Nur veröffentlichte Beiträge
  const postType = item.find('wp\\:post_type').text().trim();
  const status = item.find('wp\\:status').text().trim();
  if (postType !== 'post' || status !== 'publish') return;

  try {
    // ── Basis-Felder ──
    const title = item.find('title').first().text().trim();
    const sourceUrl = item.find('link').first().text().trim();
    const slug = item.find('wp\\:post_name').text().trim();
    const date = formatDate(item.find('wp\\:post_date').first().text().trim());
    const updated = formatDate(item.find('wp\\:post_modified').first().text().trim());
    const authorLogin = item.find('dc\\:creator').text().trim();
    const author = authorMap[authorLogin] || authorLogin;

    if (!slug) {
      console.warn(`  ⚠ Post ohne Slug übersprungen: "${title}"`);
      skipped++;
      return;
    }

    // ── Kategorien und Tags ──
    const categories = [];
    const tags = [];
    item.find('category').each((_, catEl) => {
      const domain = $(catEl).attr('domain') || '';
      const text = $(catEl).text().trim();
      if (!text) return;
      if (domain === 'post_tag') {
        tags.push(text);
      } else if (domain === 'category') {
        categories.push(text);
      }
    });

    const primaryCategory = categories[0] || '';
    // Weitere Kategorien als zusätzliche Tags
    const allTags = [...new Set([...tags, ...categories.slice(1)])];

    // ── Postmeta ──
    // metaDescription: explizites SEO-Feld (Yoast/RankMath)
    const metaDescription = getPostMeta($, item, '_yoast_wpseo_metadesc') ||
                            getPostMeta($, item, 'rank_math_description') || '';
    // excerpt: identisch mit metaDescription beim WP-Import — später ggf. anpassen
    const excerpt = metaDescription;
    // focusKeyword: Primary Keyword aus Yoast — nachträglich korrigierbar
    const focusKeyword = getPostMeta($, item, '_yoast_wpseo_focuskw') ||
                         getPostMeta($, item, 'rank_math_focus_keyword') || '';
    const readingTimeRaw = getPostMeta($, item, '_yoast_wpseo_estimated-reading-time-minutes');
    const readingTime = readingTimeRaw ? parseInt(readingTimeRaw, 10) : '';
    const thumbnailId = getPostMeta($, item, '_thumbnail_id');
    const attachment = thumbnailId ? attachmentMap[thumbnailId] : null;
    const featuredImage = attachment ? attachment.url : '';
    const featuredImageAlt = attachment ? attachment.alt : '';

    // ── Serien-Zuordnung ──
    const seriesInfo = SERIES_MAP[slug] || null;

    // ── Inhalt: HTML → Markdown ──
    const rawHtml = item.find('content\\:encoded').text();
    let markdown = '';
    if (rawHtml && rawHtml.trim()) {
      markdown = td.turndown(rawHtml.trim());
      // Übermäßige Leerzeilen reduzieren
      markdown = markdown.replace(/\n{4,}/g, '\n\n').trim();
    }

    // ── Elementor-Bilder ergänzen ──
    // Bilder aus _elementor_data extrahieren (background_image + image-Widgets),
    // die NICHT bereits im markdown oder als featuredImage vorhanden sind.
    const elementorDataRaw = getPostMeta($, item, '_elementor_data');
    if (elementorDataRaw) {
      const alreadyKnown = new Set();
      if (featuredImage) alreadyKnown.add(featuredImage);
      // Bereits im Markdown enthaltene URLs einsammeln
      const mdUrlRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
      let mu;
      while ((mu = mdUrlRegex.exec(markdown)) !== null) alreadyKnown.add(mu[1]);

      // In der XML sind URLs JSON-escaped: https:\/\/www.plasticsurf.de\/wp-content\/...
      // new RegExp() verwenden, um Konflikte mit Regex-Literal-Syntax zu vermeiden
      const elRegex = new RegExp(
        '"url"\\s*:\\s*"(https?:\\\\/\\\\/www\\.plasticsurf\\.de\\\\/wp-content\\\\/uploads\\\\/[^"]+)"',
        'g'
      );
      const extraImages = [];
      let em;
      while ((em = elRegex.exec(elementorDataRaw)) !== null) {
        // JSON-escaped Slashes (\/) zurück zu normalen Slashes (/) konvertieren
        const url = em[1].replace(/\\\//g, '/');
        if (!alreadyKnown.has(url)) {
          alreadyKnown.add(url);
          extraImages.push(url);
        }
      }

      if (extraImages.length > 0) {
        // Als Bildblöcke ans Ende des Markdown-Inhalts anhängen
        // (werden beim MD→MDX-Schritt an die richtige Position gesetzt)
        const extraBlock = extraImages
          .map(url => `![](${url})`)
          .join('\n\n');
        markdown = markdown + '\n\n' + extraBlock;
      }
    }

    // ── YAML-Frontmatter zusammensetzen ──
    const tagsYaml = allTags.length > 0
      ? `[${allTags.map(t => yamlString(t)).join(', ')}]`
      : '[]';

    const frontmatter = [
      '---',
      `title: ${yamlString(title)}`,
      // metaTitle: initial leer — muss manuell auf max. 45 Zeichen optimiert werden
      'metaTitle: ""',
      metaDescription ? `metaDescription: ${yamlString(metaDescription)}` : 'metaDescription: ""',
      `date: "${date}"`,
      updated && updated !== date ? `updated: "${updated}"` : null,
      `author: ${yamlString(author)}`,
      primaryCategory ? `category: ${yamlString(primaryCategory)}` : null,
      `tags: ${tagsYaml}`,
      focusKeyword ? `focusKeyword: ${yamlString(focusKeyword)}` : 'focusKeyword: ""',
      // keywords: Secondary Keywords — initial leer, schrittweise ergänzen
      'keywords: []',
      excerpt ? `excerpt: ${yamlString(excerpt)}` : 'excerpt: ""',
      readingTime ? `readingTime: ${readingTime}` : null,
      seriesInfo ? `series: "${seriesInfo.seriesSlug}"` : null,
      seriesInfo ? `seriesPart: ${seriesInfo.seriesPart}` : null,
      featuredImage ? `featuredImage: "${featuredImage}"` : 'featuredImage: ""',
      featuredImageAlt ? `featuredImageAlt: ${yamlString(featuredImageAlt)}` : 'featuredImageAlt: ""',
      `sourceUrl: "${sourceUrl}"`,
      '---',
    ].filter(line => line !== null).join('\n');

    const fileContent = `${frontmatter}\n\n${markdown}\n`;

    // ── Datei schreiben ──
    const outputPath = join(OUTPUT_DIR, `${slug}.md`);

    if (existsSync(outputPath)) {
      console.log(`  ⏭ Übersprungen (existiert bereits): ${slug}.md`);
      skipped++;
      return;
    }

    writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`  ✓ ${slug}.md`);
    created++;

  } catch (err) {
    console.error(`  ✗ Fehler bei Post:`, err.message);
    errors++;
  }
});

// ── Abschlussmeldung ──────────────────────────────────────────────────────────

console.log('\n──────────────────────────────────────');
console.log(`✓ Erstellt:     ${created}`);
console.log(`⏭ Übersprungen: ${skipped}`);
if (errors > 0) console.log(`✗ Fehler:       ${errors}`);
console.log(`📁 Ausgabe:      ${OUTPUT_DIR}`);
console.log('──────────────────────────────────────');
