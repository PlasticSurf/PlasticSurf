/**
 * md-to-mdx.mjs
 * Konvertiert alle .md-Dateien in scripts/output/ zu .mdx-Dateien
 * in src/content/blog/ – im MDX-Format der Vorlage (blog-mdx-vorlage.md).
 *
 * Ausführen:
 *   node scripts/md-to-mdx.mjs
 *
 * Überspringt Dateien, wenn:
 *   - eine .mdx-Datei mit gleichem Slug bereits in src/content/blog/ existiert
 *   - die Datei im SKIP_SLUGS-Set ist (bereits manuell konvertiert)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MD_DIR  = join(__dirname, 'output');
const MDX_DIR = join(__dirname, '..', 'src', 'content', 'blog');

// ── Standard-Autor-Felder (für alle konvertierten Beiträge) ───────────────────

const AUTHOR_BIO    = 'Martin Kalinowski ist Gründer und Creative Director von PlasticSurf, einer Design- und Markenagentur aus Freiburg im Breisgau.';
const AUTHOR_AVATAR = '/images/avatar-martin.webp';
const AUTHOR_EMAIL  = 'web@plasticsurf.eu';
const AUTHOR_LI     = 'https://linkedin.com/in/martin-kalinowski';

// ── Bereits manuell konvertierte Slugs überspringen ───────────────────────────
// Schlüssel = Slug-Name der .md-Datei in scripts/output/ (ohne .md)

const SKIP_SLUGS = new Set([
  // physik-des-wertes Teil 3 → bereits als begehrlichkeit-kaufen-aufhoert.mdx
  'warum-begehrlichkeit-dort-beginnt-wo-das-kaufen-aufhoert',
]);

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

/**
 * Parst Frontmatter aus .md-Inhalt.
 * Gibt { frontmatterRaw, body } zurück.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Kein Frontmatter gefunden');
  return { frontmatterRaw: match[1], body: match[2] };
}

/**
 * Konvertiert Text zu einem URL-sicheren ID-Slug für H2/H3-Attribute.
 * Stellt sicher, dass IDs nicht mit einer Zahl beginnen (CSS-Selektor-Problem).
 */
function slugifyId(text) {
  let id = text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (/^\d/.test(id)) id = 'h-' + id;
  return id || 'section';
}

/**
 * Extrahiert YouTube-Video-ID aus einer URL.
 */
function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * Escaped problematische HTML-Tag-Muster im Fließtext:
 * 1. Malformed Tags (Tag-Name direkt gefolgt von `=`, z.B. `<title="foo">`)
 * 2. Unpaarige Tags (kein schließendes Gegenstück im gleichen Textblock)
 *
 * Bewusst ausgelassen: <a>, <img>, <strong>, <em>, <code>, <br> — diese werden
 * von inlineToJsx selbst erzeugt und müssen unberührt bleiben.
 */
function preEscapeHtmlTagRefs(text) {
  return text.replace(/<([a-zA-Z][^>]*)>/g, (match, content) => {
    // Tag-Name = erster Token (vor Space oder =)
    const tagName = content.split(/[\s=]/)[0].toLowerCase();

    // Malformed: Tag-Name direkt gefolgt von = (z.B. title="...", wird="...")
    if (content.startsWith(tagName + '=')) {
      return `&lt;${content}&gt;`;
    }

    // Selbstschließende Tags (kein Close-Tag erwartet)
    const selfClosing = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
    if (selfClosing.has(tagName)) return match;
    // <a> und <code> fast nie als ungematchte Text-Referenz → immer sicher
    if (tagName === 'a' || tagName === 'code') return match;

    // Balance-Check: offene vs. schließende Tags zählen
    const openCount  = (text.match(new RegExp(`<${tagName}(?:[\\s>])`, 'gi')) || []).length;
    const closeCount = (text.match(new RegExp(`</${tagName}>`, 'gi')) || []).length;
    if (openCount !== closeCount) {
      return `&lt;${content}&gt;`; // Unpaarig → escapen
    }

    return match; // Ausgewogen → unverändert lassen
  });
}

/**
 * Verarbeitet Bold/Italic auf einem Textfragment (ohne Links).
 * Wird sowohl für Link-Text als auch für freien Text aufgerufen.
 */
function processBoldItalic(text) {
  // Führende/nachfolgende ungematchte Sternenblöcke (WP-Artefakte wie ****text:) entfernen
  text = text.replace(/\*{4,}(?=[^\s*])/g, '');
  text = text.replace(/(?<=[^\s*])\*{4,}/g, '');

  // 4+ Sterne (gematchte Paare) → Bold
  text = text.replace(/\*{4,}(.+?)\*{4,}/g, '<strong>$1</strong>');
  // Bold + Italic: ***text***
  text = text.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Verbleibende ungematchte ** entfernen (nach Bold-Konvertierung)
  text = text.replace(/\*{2,}/g, '');
  // Italic: *text*
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // Italic: _text_
  text = text.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  return text;
}

/**
 * Konvertiert Inline-Markdown zu JSX/HTML.
 * Reihenfolge: Links zuerst (um crossing-Tag-Probleme zu vermeiden), dann Bold/Italic.
 */
function inlineToJsx(text) {
  // Unpaarige HTML-Tags escapen (Text-Referenzen wie "<strong>" oder "<title=...>")
  text = preEscapeHtmlTagRefs(text);

  // Backslash-Escapes bereinigen (z.B. 1\. → 1.)
  text = text.replace(/\\([.\[\]{}()*+?^$|#\-_!])/g, '$1');

  // ── Schritt 1: Links konvertieren (inkl. Bold/Italic im Link-Text) ──────────
  // Markdown-Link-Regex: [text](url) oder [text](url "title") oder [text](url 'title')
  // Die URL endet vor dem ersten Leerzeichen oder `)`.
  // Externe Links (nicht plasticsurf.de) → target="_blank"
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/(?!www\.plasticsurf\.de)[^\s)]+)(?:\s+["'][^"']*["'])?\)/g,
    (_, linkText, url) => {
      const cleanText = processBoldItalic(linkText);
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${cleanText}</a>`;
    }
  );
  // Plasticsurf-Links → relative URL
  text = text.replace(/\[([^\]]+)\]\(https?:\/\/www\.plasticsurf\.de\/([^\s)]*)\)/g,
    (_, linkText, path) => `<a href="/${path}">${processBoldItalic(linkText)}</a>`
  );
  // Relative und Anker-Links (URL endet vor Leerzeichen/Klammer)
  text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g,
    (_, linkText, url) => `<a href="${url}">${processBoldItalic(linkText)}</a>`
  );

  // ── Schritt 2: Bold/Italic nur in Textknoten (nicht in HTML-Tag-Attributen) ─
  // Aufgeteilt nach HTML-Tags: processBoldItalic greift nur auf die Text-Segmente
  // zwischen den Tags (nicht auf href="...", target="_blank" etc.)
  const segments = text.split(/(<[^>]*>)/);
  text = segments.map((seg, i) => i % 2 === 0 ? processBoldItalic(seg) : seg).join('');

  // ── Schritt 3: Inline-Code ───────────────────────────────────────────────────
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // ── Schritt 4: JSX-Sonderzeichen escapen ────────────────────────────────────
  // Nur außerhalb von HTML-Attributen (href="...") – daher nach Link-Konvertierung
  text = text.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

  return text;
}

/**
 * Erkennt WP-Werbeblöcke (Promo-CTAs die durch unsere CTA-Komponente ersetzt werden).
 */
function isWpPromoBlock(block) {
  return (
    /suchst du unterstützung/i.test(block) ||
    /dann lass uns gemeinsam an deinem branding/i.test(block) ||
    /\bjetzt anfragen\b/i.test(block) ||
    /die brücke\s*\(.*angebot/i.test(block) ||
    /\[zum angebot\].*\/loesungen\//i.test(block) ||
    /^#{1,6}\s+(der audit|das brand experience system)[.\s]/im.test(block) ||
    /schritt\s+[12]:\s+die\s+(diagnose|konstruktion)/i.test(block) ||
    /ich kartografiere\s+ihre\s+welt/i.test(block) ||
    /ich gebe ihrer welt einen namen/i.test(block)
  );
}

/**
 * Konvertiert einen Markdown-Block zu Plain-Text (für FAQ-Antworten).
 */
function faqAnswerToPlain(block) {
  return block
    // Bold/Italic Marker entfernen
    .replace(/\*{4,}(.+?)\*{4,}/gs, '$1')
    .replace(/\*{3}(.+?)\*{3}/gs, '$1')
    .replace(/\*{2}(.+?)\*{2}/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    // Links → nur Text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Inline-Code
    .replace(/`([^`]+)`/g, '$1')
    // Backslash-Escapes
    .replace(/\\(.)/g, '$1')
    // HTML-Tags
    .replace(/<[^>]+>/g, '')
    // Whitespace normalisieren
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Escaped einen String für JSX-Prop-Werte (innerhalb doppelter Anführungszeichen).
 * Nutzt &quot; statt \" — JSX akzeptiert kein Backslash-Escaping in Attribut-Strings.
 */
function escapeForProp(str) {
  return str
    .replace(/\\/g, '')          // Backslashes entfernen (Turndown-Artefakte)
    .replace(/"/g, '&quot;')     // " → &quot; (JSX-safe)
    .replace(/[„"]/g, '&quot;')  // typografische Anführungszeichen normalisieren
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

/**
 * Parst einen Blockquote-Block und extrahiert Inhalt + Autor.
 * Gibt { content, author } zurück.
 */
function parseBlockquote(block) {
  // > prefix entfernen, Zeilen bereinigen
  const lines = block.replace(/^>\s*/gm, '').split('\n').map(l => l.trim()).filter(l => l);

  if (lines.length === 0) return { content: '', author: '' };

  // Erste Zeile = Zitattext
  let content = lines[0]
    // **_..._** Bold-Italic-Wrapper entfernen
    .replace(/^\*{2,}_+\s*/g, '')
    .replace(/\s*_+\*{2,}$/g, '')
    // Verbleibende **_ oder _** an Grenzen
    .replace(/\*{2,}_+/g, '').replace(/_+\*{2,}/g, '')
    // Bold/Italic-Marker entfernen
    .replace(/\*{2,}(.+?)\*{2,}/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Anführungszeichen normalisieren
    .replace(/[„"'"]/g, '"')
    // Backslash-Escapes
    .replace(/\\(.)/g, '$1')
    .trim();

  // Letzte Zeile = Autor?
  let author = '';
  if (lines.length > 1) {
    const lastLine = lines[lines.length - 1];
    // Erkennung: startet mit — (Em-Dash) ODER sieht aus wie ein Name (1-4 Wörter, Großbuchstaben)
    const hasEmDash  = /^[–—]\s*/.test(lastLine);
    const looksLikeName = /^[A-ZÄÖÜ][\wäöüÄÖÜ.]+(?:\s+[\wäöüÄÖÜ.]+){0,3}$/.test(lastLine);
    if (hasEmDash || looksLikeName) {
      author = lastLine.replace(/^[–—]\s*/, '').trim();
    }
  }

  return { content, author };
}

/**
 * Konvertiert den Markdown-Body zu MDX-Blöcken.
 * Gibt { mdxBlocks, hasYouTube, hasCTA } zurück.
 */
function convertBody(body) {
  // ── WP-Artefakte entfernen ────────────────────────────────────────────────
  // "Inhalt" (WP-TOC-Plugin-Artefakt)
  body = body.replace(/^Inhalt\s*$/gm, '');
  // Serien-Hinweis-Zeile ("Dieser Beitrag ist Teil...")
  body = body.replace(/\*?\*?Dieser Beitrag ist Teil.*?\n/g, '');
  // Trailing whitespace auf jeder Zeile
  body = body.replace(/[ \t]+$/gm, '');

  // In Blöcke aufteilen (getrennt durch Leerzeile, auch mit Leerzeichen)
  const rawBlocks = body.split(/\n[ \t]*\n+/);
  const allBlocks = rawBlocks.map(b => b.trim()).filter(Boolean);

  // ── WP-Promo-CTA-Blöcke herausfiltern ─────────────────────────────────────
  // Erkennt Werbeblöcke wie "Suchst du Unterstützung..." und die Brücke-Sektion,
  // entfernt sie aus dem Content und setzt hasCTA = true.
  let hasCTA = false;
  const cleanBlocks = [];
  let skipMode = false; // Aktiv für "Die Brücke"-Sektion (mehrere Blöcke überspringen)

  for (let j = 0; j < allBlocks.length; j++) {
    const b = allBlocks[j];

    if (skipMode) {
      // Im Skip-Modus: alles überspringen bis zum nächsten "echten" H2
      // Ein "echtes" H2 ist ein einfaches `## Überschrift` ohne Promo-Inhalt
      const isRealH2 = /^##\s[^#]/.test(b) && !isWpPromoBlock(b);
      if (isRealH2) {
        skipMode = false;
        cleanBlocks.push(b); // Dieses H2 in den Content aufnehmen
      }
      // Sonst: Block überspringen (skipMode bleibt aktiv)
      continue;
    }

    if (isWpPromoBlock(b)) {
      hasCTA = true;

      // "Die Brücke"-Sektion: mehrteilig → Skip-Modus aktivieren
      if (/brücke\s*\(.*angebot/i.test(b)) {
        skipMode = true;
      } else {
        // Einfacher Promo-Block (Heading + Antwort-Absatz):
        // nachfolgende Promo-Blöcke direkt ebenfalls überspringen
        while (j + 1 < allBlocks.length && isWpPromoBlock(allBlocks[j + 1])) {
          j++;
        }
      }
      continue; // diesen Block überspringen
    }

    cleanBlocks.push(b);
  }

  // ── Haupt-Loop (index-basiert für FAQ Look-ahead) ──────────────────────────
  const mdxBlocks = [];
  let hasYouTube  = false;
  let i = 0;

  while (i < cleanBlocks.length) {
    const block = cleanBlocks[i];

    // ── Roher HTML-Block (aus WP-Editor: <ul>, <li>, <h3>, </ul> etc.) ───────
    // Direkt übernehmen — nicht in <p> wrappen (würde invalid nesting erzeugen)
    if (/^<\/?[a-zA-Z]/.test(block) && !/^<(strong|em|a|code|br)\b/i.test(block)) {
      mdxBlocks.push(block);
      i++; continue;
    }

    // ── YouTube-URL (standalone) ────────────────────────────────────────────
    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/\S+$/.test(block)) {
      const videoId = extractYouTubeId(block);
      if (videoId) {
        hasYouTube = true;
        mdxBlocks.push(`<YouTubeEmbed videoId="${videoId}" title="" />`);
      }
      i++; continue;
    }

    // ── Standalone-Bild (eigene Zeile, mit Alt-Text) ────────────────────────
    if (/^!\[[^\]]+\]\([^)]+\)$/.test(block)) {
      const m = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (m && m[1].trim()) {
        mdxBlocks.push(`![${m[1]}](${m[2]})`);
      }
      // Leere Alt-Texte (Elementor-Hintergrundbilder) → überspringen
      i++; continue;
    }

    // ── H1 ─── (sollte eigentlich nicht vorkommen, aber sicher ist sicher) ──
    if (/^#\s/.test(block) && !block.includes('\n')) {
      const text = block.replace(/^#\s+/, '').trim();
      if (!text || text === 'Inhalt') { i++; continue; }
      const id = slugifyId(text);
      mdxBlocks.push(`<h2 id="${id}">${inlineToJsx(text)}</h2>`);
      i++; continue;
    }

    // ── FAQ Format A: Nummeriertes H2 als Frage (## 1\. Frage?) ─────────────
    // Erkennt Muster: ## 1\. Frage? und sammelt alle aufeinanderfolgenden Q&A-Paare
    {
      const faqMatch = block.match(/^##\s+(\d+)\\?\.\s+(.+\?)\s*$/);
      if (faqMatch && !block.includes('\n')) {
        const faqItems = [];
        let fi = i;

        while (fi < cleanBlocks.length) {
          const qBlock = cleanBlocks[fi];
          const qm = qBlock.match(/^##\s+\d+\\?\.\s+(.+\?)\s*$/);
          if (!qm || qBlock.includes('\n')) break;

          const question = qm[1].trim();
          fi++;

          // Nächster Block = Antwort (wenn kein Heading)
          let answer = '';
          if (fi < cleanBlocks.length && !/^#{1,6}\s/.test(cleanBlocks[fi])) {
            answer = faqAnswerToPlain(cleanBlocks[fi]);
            fi++;
          }
          faqItems.push({ q: question, a: answer });
        }

        if (faqItems.length >= 1) {
          i = fi; // Alle FAQ-Blöcke verbraucht
          const questionsStr = faqItems
            .map(item => `    { q: "${escapeForProp(item.q)}", a: "${escapeForProp(item.a)}" }`)
            .join(',\n');
          mdxBlocks.push(`<FAQ\n  title="Häufig gestellte Fragen"\n  questions={[\n${questionsStr}\n  ]}\n/>`);
          continue;
        }
        // Kein FAQ erkannt → als normales H2 behandeln (fall through)
      }
    }

    // ── FAQ Format B: Intro-Heading + unnummerierte H2-Fragen ────────────────
    // Erkennt: ## FAQ – Titel (oder ## FAQs / ## Häufige Fragen)
    // Danach folgen unnummerierte ## Frage? H2-Blöcke mit Antwort-Absätzen.
    // Wenn die Fragen dagegen nummeriert sind (Format A), wird das Intro-Heading
    // als normales H2 gerendert und Format A kümmert sich um die Fragen.
    {
      const isFaqIntro = /^##\s+.*(FAQ|FAQs|Häufige Fragen|Häufig gestellte)/i.test(block)
        && !block.includes('\n')
        && !/\?\s*$/.test(block); // kein Fragezeichen am Ende (wäre selbst eine Frage)

      if (isFaqIntro) {
        const faqTitle = block.replace(/^##\s+/, '').trim();
        let fi = i + 1;

        // Optionalen Intro-Absatz überspringen (kein Heading)
        if (fi < cleanBlocks.length && !/^#/.test(cleanBlocks[fi])) {
          fi++;
        }

        // Prüfen: Sind die Fragen nummeriert (Format A)? → Intro-Heading als H2 rendern
        const nextBlock   = cleanBlocks[fi];
        const isFormatA   = nextBlock && /^##\s+\d+\\?\.\s+/.test(nextBlock);

        if (!isFormatA) {
          // Unnummerierte H2-Fragen sammeln (enden alle mit ?)
          const faqItems = [];
          while (fi < cleanBlocks.length) {
            const qBlock = cleanBlocks[fi];
            if (qBlock.includes('\n')) break;
            const qm = qBlock.match(/^##\s+(.+\?)\s*$/);
            if (!qm) break;

            const question = qm[1].trim();
            fi++;

            let answer = '';
            if (fi < cleanBlocks.length && !/^#/.test(cleanBlocks[fi])) {
              answer = faqAnswerToPlain(cleanBlocks[fi]);
              fi++;
            }
            faqItems.push({ q: question, a: answer });
          }

          if (faqItems.length >= 1) {
            i = fi;
            const questionsStr = faqItems
              .map(item => `    { q: "${escapeForProp(item.q)}", a: "${escapeForProp(item.a)}" }`)
              .join(',\n');
            mdxBlocks.push(`<FAQ\n  title="${escapeForProp(faqTitle)}"\n  questions={[\n${questionsStr}\n  ]}\n/>`);
            continue;
          }
        }
        // Fall through zu regulärem H2-Handler
      }
    }

    // ── H2 ──────────────────────────────────────────────────────────────────
    if (/^##\s/.test(block) && !block.includes('\n')) {
      const text = block.replace(/^##\s+/, '').trim();
      if (!text || text === 'Inhalt') { i++; continue; }
      const id = slugifyId(text);
      mdxBlocks.push(`<h2 id="${id}">${inlineToJsx(text)}</h2>`);
      i++; continue;
    }

    // ── H2 mit Folgezeile (Turndown-Artefakt: "## Heading\n\nSubzeile") ─────
    if (/^##\s/.test(block) && block.includes('\n')) {
      const lines = block.split('\n');
      const headText = lines[0].replace(/^##\s+/, '').trim();
      if (headText && headText !== 'Inhalt') {
        const id = slugifyId(headText);
        mdxBlocks.push(`<h2 id="${id}">${inlineToJsx(headText)}</h2>`);
      }
      const rest = lines.slice(1).join(' ').trim();
      if (rest) {
        mdxBlocks.push(`<p class="mb-6">${inlineToJsx(rest)}</p>`);
      }
      i++; continue;
    }

    // ── H3 ──────────────────────────────────────────────────────────────────
    if (/^###\s/.test(block) && !block.includes('\n')) {
      const text = block.replace(/^###\s+/, '').trim();
      if (!text) { i++; continue; }
      const id = slugifyId(text);
      mdxBlocks.push(`<h3 id="${id}">${inlineToJsx(text)}</h3>`);
      i++; continue;
    }

    // ── H3 mit Folgezeile ────────────────────────────────────────────────────
    if (/^###\s/.test(block) && block.includes('\n')) {
      const lines = block.split('\n');
      const headText = lines[0].replace(/^###\s+/, '').trim();
      if (headText) {
        const id = slugifyId(headText);
        mdxBlocks.push(`<h3 id="${id}">${inlineToJsx(headText)}</h3>`);
      }
      const rest = lines.slice(1).join(' ').trim();
      if (rest) {
        mdxBlocks.push(`<p class="mb-6">${inlineToJsx(rest)}</p>`);
      }
      i++; continue;
    }

    // ── H4+ → als H3 behandeln ──────────────────────────────────────────────
    if (/^####\s/.test(block)) {
      const lines  = block.split('\n');
      const first  = lines[0].replace(/^#+\s+/, '').trim();
      if (first) {
        const id = slugifyId(first);
        mdxBlocks.push(`<h3 id="${id}">${inlineToJsx(first)}</h3>`);
      }
      const rest = lines.slice(1).join(' ').trim();
      if (rest) {
        mdxBlocks.push(`<p class="mb-6">${inlineToJsx(rest)}</p>`);
      }
      i++; continue;
    }

    // ── Aufzählung (ungeordnet) ──────────────────────────────────────────────
    if (/^[-*]\s/.test(block)) {
      const lines = block.split('\n');
      const items = [];
      let current = null;

      for (const line of lines) {
        if (/^[-*]\s/.test(line)) {
          if (current !== null) items.push(current);
          current = line.replace(/^[-*]\s+/, '').trim();
        } else if (line.trim() && current !== null) {
          current += ' ' + line.trim();
        }
      }
      if (current !== null) items.push(current);

      if (items.length > 0) {
        const liLines = items.map(item => `  <li>${inlineToJsx(item)}</li>`).join('\n');
        mdxBlocks.push(`<ul>\n${liLines}\n</ul>`);
      }
      i++; continue;
    }

    // ── Geordnete Liste ──────────────────────────────────────────────────────
    if (/^\d+\.\s/.test(block)) {
      const lines = block.split('\n');
      const items = [];
      let current = null;

      for (const line of lines) {
        if (/^\d+\.\s/.test(line)) {
          if (current !== null) items.push(current);
          current = line.replace(/^\d+\.\s+/, '').trim();
        } else if (line.trim() && current !== null) {
          current += ' ' + line.trim();
        }
      }
      if (current !== null) items.push(current);

      if (items.length > 0) {
        const liLines = items.map(item => `  <li>${inlineToJsx(item)}</li>`).join('\n');
        mdxBlocks.push(`<ol>\n${liLines}\n</ol>`);
      }
      i++; continue;
    }

    // ── Blockquote → <Quote> Komponente ─────────────────────────────────────
    if (/^>\s/.test(block)) {
      const { content, author } = parseBlockquote(block);
      if (content) {
        const contentAttr = `content="${escapeForProp(content)}"`;
        const authorAttr  = author ? `\n  author="${escapeForProp(author)}"` : '';
        mdxBlocks.push(`<Quote\n  ${contentAttr}${authorAttr}\n/>`);
      }
      i++; continue;
    }

    // ── Regulärer Absatz (mehrzeilig = Soft-Wraps → zusammenführen) ─────────
    // Zeilen, die mit einem Bild beginnen, separat behandeln
    const lines = block.split('\n');
    let accumulator = '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Standalone-Bild in einem Mischblock
      if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) {
        // Vorherigen Akkumulator als Absatz schreiben
        if (accumulator.trim()) {
          mdxBlocks.push(`<p class="mb-6">${inlineToJsx(accumulator.trim())}</p>`);
          accumulator = '';
        }
        const m = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (m && m[1].trim()) {
          mdxBlocks.push(`![${m[1]}](${m[2]})`);
        }
        continue;
      }

      // YouTube-URL in Mischblock
      if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/\S+$/.test(trimmed)) {
        if (accumulator.trim()) {
          mdxBlocks.push(`<p class="mb-6">${inlineToJsx(accumulator.trim())}</p>`);
          accumulator = '';
        }
        const videoId = extractYouTubeId(trimmed);
        if (videoId) {
          hasYouTube = true;
          mdxBlocks.push(`<YouTubeEmbed videoId="${videoId}" title="" />`);
        }
        continue;
      }

      accumulator += (accumulator ? ' ' : '') + trimmed;
    }

    if (accumulator.trim()) {
      mdxBlocks.push(`<p class="mb-6">${inlineToJsx(accumulator.trim())}</p>`);
    }
    i++;
  }

  return { mdxBlocks, hasYouTube, hasCTA };
}

/**
 * Baut das vollständige MDX-Dokument zusammen.
 */
function buildMdx(frontmatterRaw, body) {
  const { mdxBlocks, hasYouTube, hasCTA } = convertBody(body);

  // Frontmatter: Author-Felder ergänzen wenn nicht vorhanden
  let fm = frontmatterRaw;
  if (!fm.includes('authorBio:')) {
    fm += `\nauthorBio: "${AUTHOR_BIO}"`;
  }
  if (!fm.includes('authorAvatar:')) {
    fm += `\nauthorAvatar: "${AUTHOR_AVATAR}"`;
  }
  if (!fm.includes('authorSocial:')) {
    fm += `\nauthorSocial:\n  email: "${AUTHOR_EMAIL}"\n  linkedin: "${AUTHOR_LI}"`;
  }

  // Imports
  const youtubeImport = hasYouTube
    ? `import YouTubeEmbed from '../../components/blog/YouTubeEmbed.astro';\n`
    : '';

  const imports = [
    `import InfoBox from '../../components/blog/InfoBox.astro';`,
    `import Quote from '../../components/blog/Quote.astro';`,
    `import CTA from '../../components/blog/CTA.astro';`,
    `import FAQ from '../../components/blog/FAQ.astro';`,
    `import AuthorBio from '../../components/blog/AuthorBio.astro';`,
    `import RelatedPosts from '../../components/blog/RelatedPosts.astro';`,
    youtubeImport.trim(),
  ].filter(Boolean).join('\n');

  // Hauptinhalt
  const content = mdxBlocks.join('\n\n');

  // CTA-Komponente (wenn WP-Promo-Block erkannt und ersetzt wurde)
  const ctaBlock = hasCTA ? `<CTA
  title="Bereit für den nächsten Schritt?"
  description="Lassen Sie uns gemeinsam Ihr Projekt starten."
  buttonText="Jetzt Gespräch vereinbaren"
  href="/kontakt"
  variant="primary"
/>` : '';

  // Abschluss-Komponenten
  const closing = `<div class="mt-24 md:mt-32">
<AuthorBio
  name={frontmatter.author}
  bio={frontmatter.authorBio}
  avatar={frontmatter.authorAvatar}
  social={frontmatter.authorSocial}
/>

<RelatedPosts
  title="Das könnte Sie auch interessieren"
  posts={[
    {
      title: "TODO: Verwandter Beitrag 1",
      excerpt: "Kurze Beschreibung des Beitrags.",
      href: "/gedanken/TODO",
      category: "TODO"
    },
    {
      title: "TODO: Verwandter Beitrag 2",
      excerpt: "Kurze Beschreibung des Beitrags.",
      href: "/gedanken/TODO",
      category: "TODO"
    },
    {
      title: "TODO: Verwandter Beitrag 3",
      excerpt: "Kurze Beschreibung des Beitrags.",
      href: "/gedanken/TODO",
      category: "TODO"
    }
  ]}
/>
</div>`;

  const fullContent = ctaBlock
    ? `${content}\n\n${ctaBlock}`
    : content;

  return `---\n${fm}\n---\n${imports}\n\n${fullContent}\n\n${closing}\n`;
}

// ── Haupt-Loop ────────────────────────────────────────────────────────────────

const mdFiles = readdirSync(MD_DIR).filter(f => f.endsWith('.md'));
console.log(`📄 ${mdFiles.length} .md-Dateien gefunden\n`);

let converted    = 0;
let skipped      = 0;
let errors       = 0;
const errorList  = [];

for (const filename of mdFiles) {
  const slug    = filename.replace(/\.md$/, '');
  const mdxPath = join(MDX_DIR, `${slug}.mdx`);
  const noExtPath = join(MDX_DIR, slug); // z.B. das-10-millionen-euro-geraeusch (ohne Extension)

  // Manuell übersprungene Slugs
  if (SKIP_SLUGS.has(slug)) {
    console.log(`  ⏭  ${slug} (manuell konvertiert — übersprungen)`);
    skipped++;
    continue;
  }

  // Bereits existierende .mdx-Datei
  if (existsSync(mdxPath)) {
    console.log(`  ⏭  ${slug}.mdx (bereits vorhanden)`);
    skipped++;
    continue;
  }

  // Datei ohne Extension bereits vorhanden (z.B. das-10-millionen-euro-geraeusch)
  if (existsSync(noExtPath)) {
    console.log(`  ⏭  ${slug} (Datei ohne Extension bereits vorhanden)`);
    skipped++;
    continue;
  }

  try {
    const content = readFileSync(join(MD_DIR, filename), 'utf-8');
    const { frontmatterRaw, body } = parseFrontmatter(content);
    const mdxContent = buildMdx(frontmatterRaw, body);
    writeFileSync(mdxPath, mdxContent, 'utf-8');
    console.log(`  ✓  ${slug}.mdx`);
    converted++;
  } catch (err) {
    console.error(`  ✗  ${slug} — ${err.message}`);
    errorList.push({ slug, error: err.message });
    errors++;
  }
}

console.log('\n──────────────────────────────────────');
console.log(`✓ Konvertiert:   ${converted}`);
console.log(`⏭ Übersprungen:  ${skipped}`);
if (errors > 0) {
  console.log(`✗ Fehler:        ${errors}`);
  errorList.forEach(({ slug, error }) => console.log(`   → ${slug}: ${error}`));
}
console.log('──────────────────────────────────────');
console.log('\n⚠ RelatedPosts in allen neuen .mdx-Dateien noch mit echten Beiträgen befüllen!');
