# Blog MDX-Vorlage für KI

Diese Vorlage dient als Struktur-Leitfaden für die KI-generierte Erstellung von Blog-Beiträgen im MDX-Format.

---

## ⚠️ Wichtigste Regel: Originaltexte 100% unverändert übernehmen

Texte werden **exakt so übernommen wie sie vorliegen** – kein Wort verändern, keine Anrede wechseln (du/Sie), nichts kürzen, nichts umformulieren.

Nur die **MDX-Formatierung** wird angepasst:
- Absätze in `<p class="mb-6">` wrappen
- Überschriften mit `id`-Attributen versehen
- Zitate in `<Quote>`-Komponenten überführen

**Ausnahme:** Wenn Fehler oder Verbesserungspotenzial auffällt, diese dem Nutzer **vorlegen** – nicht eigenständig umsetzen.

---

## 📋 Blog-Übersicht (`gedanken/index.astro`)

### Architektur-Entscheidung: Alle Posts auf einmal

Die Blog-Übersicht zeigt **alle Beiträge gleichzeitig** in einem 3-spaltigen Grid. Kein Infinite Scroll, kein Pagination.

**Warum:**
- SEO: Alle Beiträge sind sofort crawlbar ohne JavaScript
- Einfachheit: keine API-Routen, kein Client-State
- Performance: `loading="lazy"` auf Bilder übernimmt die nötige Optimierung

**Kein Infinite Scroll** — wurde erwogen und bewusst abgelehnt. Der Mehraufwand (Client-Side-State, Intersection Observer) bringt bei einem B2B-Blog mit moderater Beitragszahl keinen Mehrwert.

### Bild-Einbindung in Blog-Karten

```astro
<img
  src={post.data.featuredImage}
  alt={post.data.featuredImageAlt || post.data.title}
  loading="lazy"
  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
/>
```

- `loading="lazy"` — Browser lädt Bilder erst wenn sie in den Viewport scrollen
- `featuredImageAlt` hat Vorrang vor `title` als `alt`-Text

---

## 📏 Länge & Struktur langer Beiträge

### Empfehlung: Immer eine Seite — nie paginieren

Lange Blogbeiträge bleiben auf **einer einzigen Seite**. Pagination (Aufteilen in Seite 1, Seite 2 ...) ist für einzelne Blogartikel **nicht empfehlenswert**:

- **PageRank verdünnt sich** — Backlinks landen fast nur auf Seite 1, tiefere Seiten werden kaum verlinkt und verlieren SEO-Kraft
- **Indexierungsprobleme** — Google ignoriert paginierte Folgeseiten zunehmend oder entfernt sie aus dem Index
- **User Experience leidet** — Leser brechen beim Seitenwechsel ab; Bookmarken einer bestimmten Stelle ist nicht möglich
- **rel="next/prev" ist abgeschafft** — Google unterstützt diese Pagination-Hinweise seit 2019 nicht mehr

### Navigation bei langen Beiträgen — das bereits eingebaute ToC

Das Inhaltsverzeichnis (ToC) in der rechten Sidebar übernimmt die Navigationsfunktion vollständig: Jeder H2-Abschnitt wird automatisch verlinkt. Der Leser kann direkt zu jedem Abschnitt springen — das macht Pagination überflüssig.

**Voraussetzung:** Alle `<h2>`-Tags haben ein `id`-Attribut.

### Ideale Länge 2025

| Beitragstyp | Empfohlene Länge | Hinweis |
|-------------|-----------------|---------|
| Regulärer Beitrag | 1.500–2.500 Wörter | Für die meisten Themen optimal |
| How-to / Anleitung | ab 1.800 Wörter | Braucht ausreichend Tiefe |
| Pillar-Artikel (Ankerthema) | 3.000–5.000 Wörter | Bleibt auf einer Seite, verlinkt auf Cluster-Beiträge |

Länge ist **kein Ranking-Faktor** — Qualität, Struktur und Suchintent entscheiden. Kein Füllen auf Wortzahl.

### Bei wirklich sehr langen Inhalten: Blog-Serie statt Pagination

Wenn ein Thema so umfangreich ist, dass ein einzelner Beitrag unhandlich wird, besser als **Blog-Serie** aufteilen:

- Jeder Beitrag behandelt einen Teilaspekt als eigenständigen Artikel mit eigenem Titel und eigener URL
- Die Beiträge verlinken wechselseitig aufeinander (intern)
- Der erste Beitrag kann als Pillar-Artikel fungieren und alle Teile überblicksartig zusammenfassen

**Vorteil:** Jeder Teil ist indexierbar, hat seinen eigenen Suchintent, und das gesamte Thema bildet einen Content-Cluster mit starker interner Verlinkung.

### Serien-Frontmatter (zwei Felder genügen)

Damit Teile einer Serie automatisch in der Sidebar gruppiert werden, diese zwei Felder ins Frontmatter:

```yaml
series: "ki-im-handwerk"   # Gemeinsamer Slug aller Teile — identisch in jedem Teil!
seriesPart: 1              # Teilnummer für die Reihenfolge (1, 2, 3 ...)
```

- `series` verbindet alle Teile — muss in jedem Teil **exakt gleich** geschrieben sein
- `seriesPart` bestimmt die Anzeigereihenfolge
- Beiträge **ohne** diese Felder sind normale Einzelbeiträge — keine Seiteneffekte

Die `SeriesNav`-Komponente erscheint **automatisch** unter dem Inhaltsverzeichnis in der rechten Sidebar, sobald mindestens 2 Beiträge denselben `series`-Wert haben. Kein Import, kein manuelles Einbinden nötig.

> ⚠️ **Wichtig:** Die SeriesNav zeigt nur Teile, die als MDX-Dateien im Astro-Blog existieren. Teile, die noch auf einer externen Quelle liegen, erscheinen nicht in der Navigation — auch wenn `series` + `seriesPart` korrekt gesetzt sind. Solange nur 1 Teil im Blog ist, bleibt die SeriesNav unsichtbar. Ab 2 Teilen erscheint sie automatisch.

### Bestehende Serien (Stand: März 2026)

| `series`-Slug | Anzeigename | Teile |
|---|---|---|
| `ki-revolution-agenten` | Die Revolution der KI-Agenten | 5 |
| `personalisierung-ki-marketing` | Personalisierung im KI-Marketing | 2 |
| `unkopierbare-faktor` | Der unkopierbare Faktor | 2 |
| `physik-des-wertes` | Die Physik des Wertes | 4 |

> **Hinweis:** Bei neuen Serien den Slug hier eintragen, damit er konsistent über alle Teile verwendet wird. Der Slug muss in **jedem Teil exakt gleich** geschrieben sein — Tippfehler verhindern die automatische Gruppierung.

---

## 🖼️ Blog-Bilder – Optimierung und Einbindung

### Format

Alle Blog-Bilder ausschließlich als **`.webp`** ablegen. Keine PNG oder JPG committen.

**Konvertierung mit `cwebp` (macOS):**
```bash
brew install webp  # einmalig installieren
cwebp -q 82 input.png -o output.webp
cwebp -q 82 input.jpg -o output.webp
```

### Ablagestruktur

```
public/images/blog/
  2024/03/vitra-design-museum-scaled.webp
  2025/02/namae-koi-album-me-machine.webp
  2025/12/frankenstein-monster-plasticsurf.webp
  2026/01/beitragsname-bild.webp
```

### Frontmatter-Pflichtfelder für Bilder

```yaml
featuredImage: "/images/blog/2026/01/beitragsname-bild.webp"
featuredImageAlt: "Beschreibender Alt-Text für SEO und Screenreader"
```

- `featuredImage` → Pfad mit führendem `/`, immer `.webp`
- `featuredImageAlt` → Konkret beschreibend, nicht nur den Titel wiederholen

### Blog-Card-Übersicht (`gedanken/index.astro`)

Blog-Karten nutzen `featuredImageAlt` als `alt`-Text und haben `loading="lazy"`:

```astro
<img
  src={post.data.featuredImage}
  alt={post.data.featuredImageAlt || post.data.title}
  loading="lazy"
  class="w-full h-full object-cover ..."
/>
```

### Empfohlene Bildgröße

| Zweck | Größe | Dateiname-Muster |
|-------|-------|-----------------|
| Blog Cover / OG-Image | 1200 × 630 px | `keyword-beschreibung.webp` |
| Inline im Artikel | max. 1200px Breite | `keyword-beschreibung-inline.webp` |

---

## ⚠️ Wichtiger Hinweis zum Styling

**Das Blog-Styling ist auf zwei Dateien verteilt:**

📁 `src/styles/global.css` → **Überschriften-Typografie** (font-size, line-height, font-family für h2, h3 im Blog)
📁 `src/pages/gedanken/[slug].astro` → **Layout, Farben, Abstände, Fließtext-Styling**

**Warum zwei Dateien?**
Astro-Scoped-Styles (in `.astro`-Dateien) greifen nicht zuverlässig auf MDX-gerenderte Elemente (h2, h3 etc.). Deshalb werden font-size und line-height der Blog-Überschriften global in `global.css` gesetzt.

**Vorteil:** Bei Änderungen dieser beiden Dateien übernehmen alle Blogbeiträge die Änderungen automatisch!

**Verwenden Sie in den MDX-Dateien nur diese einfachen Klassen:**
- `<div class="lead">` – Für den einleitenden Haken (Lead-Text)
- `<h2 id="...">` – Für Hauptüberschriften (erscheinen im ToC)
- `<h3 id="...">` – Für Unterüberschriften
- `<p class="mb-6">Text</p>` – Für Absätze **(immer einzeilig! — siehe Hinweis unten)**
- `<ul><li>` – Für Aufzählungen
- `<strong>` – Für Fettdruck
- `<em>` – Für Kursivdruck
- `<a href="...">` – Für Links (intern und extern)

- `<div class="mt-24 md:mt-32">...</div>` – Abstand vor Bottom-Sektionen (CTA, FAQ, AuthorBio, RelatedPosts)

**Keine weiteren Inline-Styles oder Tailwind-Klassen in MDX-Dateien verwenden!**

> ⚠️ **Kommentare in MDX: nur `{/* */}` — kein `<!-- -->`**
>
> MDX basiert auf JSX. HTML-Kommentare (`<!-- -->`) sind auf oberster Ebene **syntaktisch ungültig** und führen zu einem Build-Fehler:
> `Unexpected character ! (U+0021)`
>
> ✅ Richtig (JSX-Kommentar):
> ```mdx
> {/* ================================================ */}
> {/* Sektion: Call-to-Action                        */}
> {/* ================================================ */}
> ```
>
> ❌ Falsch (HTML-Kommentar):
> ```mdx
> <!-- Sektion: Call-to-Action -->
> ```
>
> JSX-Kommentare erscheinen **nicht** im Browser-Source. Sie dienen ausschließlich als Strukturmarker im MDX-Quellcode.

> ⚠️ **Kritisch: Typografische Anführungszeichen in JSX-Attributen verboten**
>
> Text-Editoren und KI-Tools ersetzen gerade Anführungszeichen oft durch „typografische" Varianten:
> - `"` (U+201C, linkes geschwungenes Anführungszeichen)
> - `"` (U+201D, rechtes geschwungenes Anführungszeichen)
>
> In JSX-Attributwerten sind **ausschließlich gerade Anführungszeichen** (`"` U+0022) erlaubt.
> Typografische Zeichen verursachen sofort einen Build-Fehler:
> `Unexpected character " (U+201D) before attribute value`
>
> ❌ Falsch (typografische Quotes — z. B. aus KI-generiertem Code):
> ```mdx
> <InfoBox eyebrow="Kurz erklärt" title="Begriff" icon="info">
> ```
>
> ✅ Richtig (gerade Anführungszeichen):
> ```mdx
> <InfoBox eyebrow="Kurz erklärt" title="Begriff" icon="info">
> ```
>
> **Prüfen:** Wenn nach einem Bulk-Edit oder KI-generierten Einfügen MDX-Fehler auftreten,
> zuerst nach U+201C/U+201D in Attributpositionen suchen.

> ⚠️ **Kritisch: `<p>` Tags in MDX IMMER einzeilig schreiben**
>
> MDX parst Inhalt, der auf einer neuen Zeile nach einem JSX-Tag beginnt, als Markdown-Absatz.
> Das erzeugt einen **verschachtelten** `<p>` im DOM → der Browser schließt den äußeren `<p>` sofort
> → leerer `<p class="mb-6"></p>` + separater `<p>Text</p>` ohne Klasse.
>
> ✅ Richtig (einzeilig):
> ```mdx
> <p class="mb-6">Der vollständige Text des Absatzes steht hier auf einer Zeile.</p>
> ```
>
> ❌ Falsch (mehrzeilig):
> ```mdx
> <p class="mb-6">
>   Text auf neuer Zeile — MDX erzeugt hier einen nested p-Tag.
> </p>
> ```
>
> Langen Text einfach auf einer Zeile lassen — MDX-Dateien müssen nicht „schön" umbrechen.

---

## 🎨 Blog-Styling Richtlinien

### Hintergrundfarbe
- **Seiten- und Content-Hintergrund:** Off-White `#f9fafb` — `bg-gray-50`
- **Box-Hintergrund** (Blockquote, ToC, SeriesNav, AuthorBio, Quote, FAQ, RelatedPosts, ServiceTeaser, Tabellen-Header): eine Stufe dunkler — `#f3f4f6` — `bg-gray-100`
- Kein reines Weiß (`#ffffff`) — wirkt zu hart und weniger hochwertig

### Hero-Bereich
- Höhe: `min-h-[75vh]`
- H1: `tracking-tight`, `font-extrabold`, weiß auf Hintergrundbild

### Schriftarten
- **Überschriften (h1-h6):** Montserrat Alternates (font-primary)
- **Fließtext:** font-body
- **Lead-Text (Excerpt):** Playfair Display (font-secondary, kursiv)

### Schriftgrößen & Abstände

> ⚠️ **Dieses Projekt verwendet custom Tailwind-Schriftgrößen (+4px gegenüber Standard)**
> `text-xs`=16px · `text-sm`=18px · `text-base`=20px · `text-lg`=22px · `text-xl`=24px · `text-2xl`=28px · `text-3xl`=34px

| Element | Projektgröße | Quelle | Letter-Spacing |
|---------|-------------|--------|----------------|
| H1 | 40–64 px | `text-4xl md:text-5xl lg:text-6xl` in `[slug].astro` | `tracking-tight` |
| H2 | **36 px** = 2.25rem | `font-size: 2.25rem` in `global.css` | `tracking-tight` |
| H3 | **28 px** = 1.75rem | `font-size: 1.75rem` in `global.css` | `tracking-tight` |
| H4–H6 | Browser-Standard | `font-semibold` in `[slug].astro` | — |
| Fließtext (p) | **20 px** = 1.25rem | `font-size: 1.25rem` in `global.css` | — |
| Listen (li) | 20 px = 1.25rem | CSS in `[slug].astro` | — |
| Einleitung (Excerpt) | **22 px** | `text-lg` in `[slug].astro` | — |
| Sidebar-Titel | 20 px | `text-base` in ToC/SeriesNav | — |
| Sidebar-Links / TOC | 16 px | `text-xs` in ToC/SeriesNav | — |

### Zeilenabstand (line-height)
| Element | Wert |
|---------|------|
| Fließtext (p, ul, ol) | **1.7** (CSS override) |
| Einleitung (Excerpt) | **1.7** (Inline-Style) |

> **Hinweis:** Tailwind hat kein `leading-[1.7]` als Standard-Klasse.
> Nächste Optionen: `leading-relaxed` = 1.625, `leading-loose` = 2.0.
> Deshalb direkt als CSS-Wert 1.7 gesetzt.

### Textfarben (dunkle Grautöne, kein Schwarz!)
Alle Texte im Blog-Beitrag verwenden dunkle Grautöne für optimale Lesbarkeit:

| Element | Farbe | Hex-Code | Tailwind |
|---------|-------|----------|----------|
| Überschriften (h1-h6) | Dunkles Grau | #111827 | `text-gray-900` |
| Fließtext (p) | Dunkles Grau | #1f2937 | `text-gray-800` |
| Listen (li) | Dunkles Grau | #1f2937 | `text-gray-800` |
| Einleitung (Excerpt) | Dunkles Grau | #1f2937 | `text-gray-800` |
| Fettdruck (strong) | Dunkles Grau | #111827 | `text-gray-900` |
| Links (a) | Blau | #2563eb | `text-blue-600` |
| Blockquotes | Grau | #374151 | `text-gray-700` |
| Sekundärtext / Meta | Grau | #6b7280 | `text-gray-500` |

**Wichtig:** Kein reines Schwarz (#000000) und kein `style="color: …"` in MDX! Immer Tailwind-Klasse verwenden.

### Max-Breite
- Content-Bereich: `max-w-3xl` (768px) — für optimale Lesbarkeit
- Einleitung (Excerpt): `max-w-screen-2xl` — bewusst breiter als Lead-Text
- Äußerer Container: `max-w-screen-2xl` (**1536px**) — inkl. ToC-Sidebar rechts

### Styling-Dateien und Verantwortlichkeiten

**`src/styles/global.css`** — Typografie für Blog-Überschriften und Fließtext:

| Element | font-size | line-height | font-weight | Farbe |
|---------|-----------|-------------|-------------|-------|
| `h2` | 2.25rem (36px) | 1.2 | 700 (bold) | #111827 |
| `h3` | 1.75rem (28px) | 1.3 | 600 (semibold) | #111827 |
| `p` | 1.25rem (20px) | 1.7 | — | #1f2937 |

**`src/pages/gedanken/[slug].astro`** — Layout, Farben, Restliches Styling:

| Klasse/Element | Styling |
|----------------|---------|
| `.lead` | text-base, font-secondary, kursiv, #1f2937 |
| `h2`, `h3` | tracking-tight, font-primary (font-family + font-weight aus global.css) |
| `h4-h6` | font-semibold, font-primary, #111827 |
| `ul`, `ol` | 1.25rem (20px), line-height 1.7, #1f2937 |
| `li` | #1f2937 |
| `strong` | font-semibold, #111827 |
| `a` | #2563eb (Blau), Unterstreichung |
| `blockquote` | #374151 auf #f3f4f6 |

---

## 🔍 SEO-Felder auf einen Blick

| Feld | Pflicht | Zeichengrenze | Hinweis |
|------|---------|---------------|---------|
| `title` | ✅ | — | H1 + Schema — vollständiger Titel |
| `date` | ✅ | — | **Veröffentlichungsdatum** — wird in der Meta-Leiste angezeigt. Einmalig gesetzt, **niemals nachträglich ändern**. Format: `YYYY-MM-DD` |
| `updated` | — | — | **Aktualisierungsdatum** — wird als „Aktualisiert: …" in der Meta-Leiste angezeigt. **Bei jeder Bearbeitung auf das aktuelle Datum setzen.** Format: `YYYY-MM-DD` |
| `metaTitle` | ✅ | **max. 45** | `+ " - PlasticSurf"` = 60 Zeichen im SERP. Primary-Keyword möglichst vorne. Wird beim WP-Import initial aus dem Titel gekürzt — nachträglich optimieren. |
| `metaDescription` | ✅ | **120–155** | Primary-Keyword + Nutzenversprechen + CTA. Beim WP-Import aus Yoast-Metabeschreibung befüllt — ggf. nachträglich optimieren. |
| `focusKeyword` | ✅ | 1 Begriff | **Primary Keyword** — der eine Suchbegriff, für den dieser Beitrag ranken soll. Taucht in URL, H1, ersten 100 Wörtern, metaTitle und metaDescription auf. Beim WP-Import aus Yoast extrahiert — nachträglich korrigieren wenn nötig. |
| `keywords` | — | 3–5 Begriffe | **Secondary Keywords** — semantisch verwandte Begriffe (Synonyme, Long-Tails, Unterthemen). Tauchen in H2-Überschriften und Fließtext auf. Beim WP-Import initial leer — schrittweise ergänzen. |
| `excerpt` | ✅ | 1–2 Sätze | **Plain text, kein HTML** — ausschließlich für SEO (`metaDescription`-Fallback), Blog-Index und RelatedPosts-Karten. Wird **nicht** mehr als Einleitungstext auf der Blogpost-Seite verwendet — dafür ist `lead` zuständig. |
| `lead` | ✅ | 1 bis mehrere Absätze | **HTML-fähig — Pflichtfeld** — wird als Einleitung (Sektion 2) auf der Blogpost-Seite angezeigt, noch vor der Meta-Leiste. Unterstützt `<strong>`, `<em>`, `<a href>`. YAML-Block `\|` verwenden, Absätze durch Leerzeile trennen. Der MDX-Body beginnt danach immer direkt mit dem ersten `<h2>` — **keine `<p>`-Absätze vor `<h2>` in den MDX-Body schreiben.** |
| `featuredImage` | ✅ | — | Pfad zu `.webp`, 1200 × 630 px |
| `featuredImageAlt` | ✅ | max. 125 | Bildbeschreibung, kein "Bild von..." — Secondary Keyword natürlich einbauen. Beim WP-Import aus WordPress-Attachment-Alt extrahiert. |
| `tags` | ✅ | 3–5 Tags | Relevante Schlagwörter, kleingeschrieben |
| `category` | ✅ | — | Exakt einen der folgenden Werte verwenden (siehe Liste unten) |

### Erlaubte Kategorien (verbindliche Liste)

| Kategorie | Verwendung |
|-----------|------------|
| `Marketing & Kommunikation` | SEO, GEO, Content, Social Media, E-Commerce, Werbung |
| `Design & Branding` | Markendesign, Identität, visuelle Kommunikation, Wahrnehmung |
| `Mensch im Mittelpunkt` | Kreativität, Gesellschaft, Philosophie, Mensch & Maschine |
| `Zukunft & Innovation` | KI-Agenten, Technologietrends, digitale Transformation |
| `Business, Tech & Systeme` | ERP, CRM, E-Commerce-Systeme, B2B, Prozesse |
| `WerbeAgentur Insights & Case Studies` | Agentur-Perspektive, eigene Projekte, Fallstudien |

> **Wichtig:** Keine anderen Werte verwenden. Passt ein Beitrag nicht eindeutig, die nächstliegende Kategorie wählen und hier eintragen, wenn eine neue wirklich nötig ist.

### Keyword-Strategie pro Beitrag

**Faustregel: 1 Primary + 3–4 Secondary = max. 5 Keywords fokussiert bearbeiten.**

| Typ | Anzahl | Einsatzort |
|-----|--------|------------|
| **Primary Keyword** (`focusKeyword`) | 1 | URL-Slug, H1 (title), erste 100 Wörter, metaTitle, metaDescription, 1× im Alt-Text |
| **Secondary Keywords** (`keywords`) | 3–4 | H2-Überschriften, Fließtext, Alt-Texte von Inline-Bildern |
| **LSI / Semantik** | organisch | entstehen von selbst durch natürlichen, themenreichen Text |

> **Wichtig:** Keyword-Dichte ist kein Ziel. Google 2025 bewertet Themenrelevanz, Nutzerintent und E-E-A-T — nicht Wiederholungszahl. Keywords sind Orientierung, kein Füllzwang.

### Workflow für nachträgliche Keyword-Optimierung

1. `focusKeyword` prüfen — passt es zum tatsächlichen Suchbegriff der Zielgruppe?
2. `keywords`-Array ergänzen (3–4 Secondary Keywords aus dem Themenfeld)
3. `metaTitle` auf max. 45 Zeichen kürzen — Primary Keyword vorne
4. `metaDescription` prüfen: Primary Keyword + konkretes Nutzenversprechen + subtiler CTA
5. Textstellen mit Secondary Keywords gezielt nachoptimieren — **immer vorlegen, nie eigenständig ändern**

### URL-Slug (Dateiname der MDX-Datei = URL)

Der Dateiname wird direkt zur URL: `ki-im-handwerk.mdx` → `/gedanken/ki-im-handwerk`

**Regeln:**
- **Keyword-reich**: Primary-Keyword an erster Stelle
- **Kurz**: 3–5 aussagekräftige Wörter (keine Füllwörter: der, die, das, und, mit, für)
- **Keine Datumsangaben** in der URL (veraltet schnell)
- **Nur Kleinbuchstaben**, Bindestriche als Trenner, keine Umlaute (ä→ae, ö→oe, ü→ue)
- ✅ `ki-tools-handwerksbetrieb.mdx`
- ✅ `digitale-souveraenitaet-verstehen.mdx`
- ❌ `2024-03-15-ein-beitrag-ueber-ki.mdx`
- ❌ `Der_Unkopierbarer_Faktor.mdx`

---

## 🖼️ Bildgrößen & Formate

### Allgemeine Regel: Immer `.webp`

Alle Bilder auf der Website (Blog und allgemeine Seiten) werden im **WebP-Format** gespeichert.
WebP ist kleiner als JPG/PNG bei gleicher oder besserer Qualität und verbessert die Ladegeschwindigkeit (Core Web Vitals / SEO).

```
public/images/blog/      → Blog-Bilder
public/images/           → Allgemeine Bilder (Hero, Avatar, Referenzen ...)
```

### Ordnerstruktur Blog-Bilder: `YYYY/MM/`

Blog-Bilder werden nach **Jahr und Monat** sortiert — exakt wie WordPress es organisiert:

```
public/images/blog/
  2024/
    09/
      branding-agentur-freiburg.webp
    11/
      ki-agenten-revolution.webp
  2025/
    02/
      cover-design-marke.webp
```

**URL im Frontmatter / MDX:**
```
featuredImage: "/images/blog/2024/09/branding-agentur-freiburg.webp"
```

**Warum `YYYY/MM/` und nicht nur `YYYY/`?**
- Verhindert Namenskollisionen (zwei Bilder `cover.webp` aus verschiedenen Monaten)
- Spiegelt die originale WP-Upload-Struktur — wichtig für das Import-Skript (`download-images.mjs`)
- Mit 100+ Bildern und wachsendem Blog bleibt jeder Monatsordner überschaubar

> ⚠️ **Nicht ändern** — das Import-Skript (`scripts/download-images.mjs`) baut die Pfade automatisch nach diesem Schema auf. Manuelle Abweichungen brechen die URL-Zuordnung.

---

### Bildgrößen für Blog-Beiträge

| Verwendung | Breite × Höhe | Seitenverhältnis | Hinweis |
|------------|---------------|-----------------|---------|
| **Cover / Featured Image** | **1200 × 630 px** | 1.91:1 (Open Graph) | Pflicht — wird als OG-Bild und Hero-Hintergrund verwendet |
| **Thumbnail (Übersichtsseite)** | **800 × 450 px** | 16:9 | Wird aus `featuredImage` skaliert — kein separates Feld |
| **Content-Bilder (im Text)** | **max. 760 px Breite** | Flexibel | Passt exakt in den `max-w-3xl`-Content-Bereich |
| **Autor-Avatar** | **200 × 200 px** | 1:1 (quadratisch) | Rund dargestellt via CSS |

> **Thumbnail-Hinweis:** Für die Blog-Übersichtsseite (`/gedanken`) wird das `featuredImage` als Thumbnail verwendet — CSS skaliert es auf Kartengröße. Es ist **kein separates Thumbnail-Feld** nötig.

---

### Bildgrößen für allgemeine Seiten (responsive)

Die Website nutzt ein **1536px-Grid** (`max-w-screen-2xl`). Bilder werden responsiv ausgeliefert — eine einzige Quelldatei reicht, wenn sie für Desktop ausgelegt ist.

| Bereich | Empfohlene Breite | Seitenverhältnis | Hinweis |
|---------|-------------------|-----------------|---------|
| **Hero-Hintergrundbild** | **1920 × 1080 px** | 16:9 | Wird gestreckt — große Datei, daher stark komprimieren |
| **Portrait / Personen** | **800 × 800 px** | 1:1 oder 3:4 | Für die DNA-Seite o.ä. |
| **Referenz-Bilder** | **800 × 533 px** | 3:2 | Karten/Grid-Darstellung |
| **OG-Image (Startseite)** | **1200 × 630 px** | 1.91:1 | `/public/og-image.webp` |
| **Favicon** | **32 × 32 px** | 1:1 | `.ico` oder `.png` (kein WebP) |

#### Breiten-Referenz für responsive Design

| Viewport | Breakpoint | Maximale Bildbreite |
|----------|------------|---------------------|
| Mobile | < 768px | 375–767 px |
| Tablet | 768px – 1279px | 768–1023 px |
| Desktop | ≥ 1280px | max. 1536 px (Container) |

---

### Komprimierung & Export

- **Format:** WebP (bevorzugt) — Tools: Squoosh, ImageOptim, Figma-Export
- **Qualität:** 80–85 % (gute Balance aus Schärfe und Dateigröße)
- **Zielgröße:** Cover < 200 KB · Content-Bilder < 100 KB · Hero < 400 KB
- **Dateinamen:** Kleinbuchstaben, Bindestriche, keyword-reich (siehe SEO-Richtlinien)
  - ✅ `ki-tools-handwerk-cover.webp`
  - ❌ `IMG_4521.webp`, `Bild 1.webp`
- **Alt-Text:** Immer setzen — max. 125 Zeichen, kein "Bild von..." (SEO + Barrierefreiheit)

---

## 📋 Vorlage kopieren und anpassen

```mdx
---
title: "Der vollständige Titel des Beitrags"
metaTitle: "SEO-Titel (max. 45 Zeichen — wird zu '… - PlasticSurf' = 60 gesamt)"
metaDescription: "Beschreibung für Suchmaschinen, 120–155 Zeichen, Primary-Keyword + Nutzenversprechen + CTA"
date: "YYYY-MM-DD"
updated: "YYYY-MM-DD"  # Bei jeder Bearbeitung auf heutiges Datum setzen
author: "Martin Kalinowski"
category: "Business"
tags: ["Tag1", "Tag2", "Tag3"]
focusKeyword: "primary keyword"        # 1 Begriff — für den dieser Beitrag ranken soll
keywords: ["secondary 1", "secondary 2", "secondary 3"]  # 3–4 verwandte Begriffe
featuredImage: "/images/blog/YYYY/MM/dateiname-cover.webp"   # z. B. /images/blog/2024/09/ki-agenten-cover.webp
featuredImageAlt: "Beschreibender Alt-Text — Secondary Keyword natürlich einbauen, max. 125 Zeichen"
excerpt: "Kurze Zusammenfassung (plain text) – für Blog-Index, RelatedPosts und SEO-Fallback"
lead: |
  Erster Einleitungsabsatz – HTML-fähig, wird als Sektion 2 auf der Blogpost-Seite angezeigt.

  Zweiter Absatz mit optionalem <a href="https://example.com" target="_blank" rel="noopener noreferrer" title="Beschreibender Titel">externen Link</a>. Optional – ohne dieses Feld wird excerpt als Fallback verwendet.
readingTime: 8
authorBio: "Ich bin der Gründer von PlasticSurf. Als Digital Strategy Consultant entwickle ich für Unternehmen ganzheitliche Digitalstrategien und Lösungskonzepte für deren individuelle Herausforderungen. Schon lange fasziniert mich die Entwicklung der Künstlichen Intelligenz und ihre Auswirkungen. Ein besonderer Fokus liegt dabei auf den Themenwelten Design, Digital-Strategie & Transformation, Digital Marketing und Künstliche Intelligenz mit dem Ziel, diese Themenwelten miteinander zu verknüpfen und den größtmöglichen Nutzen für Unternehmen zu erzielen."
authorAvatar: "/images/avatar-martin.webp"
authorSocial:
  email: "web@plasticsurf.eu"
  linkedin: "https://linkedin.com/in/martin-kalinowski"
---

<!-- ============================================ -->
<!-- KOMPONENTEN IMPORTIEREN                      -->
<!-- Nur noch Komponenten importieren, die im    -->
<!-- MDX-Inhalt selbst verwendet werden.         -->
<!-- CTA, AuthorBio, RelatedPosts entfallen —    -->
<!-- diese rendert [slug].astro automatisch      -->
<!-- außerhalb des Grids in voller Seitenbreite. -->
<!-- ============================================ -->
import InfoBox from '../../components/blog/InfoBox.astro';
import Quote from '../../components/blog/Quote.astro';
import FAQ from '../../components/blog/FAQ.astro';

<!-- ============================================ -->
<!-- HAUPTINHALT BEGINNT HIER                     -->
<!-- Metainfos (Autor, Datum, Kategorie) werden   -->
<!-- automatisch vom Layout gerendert             -->
<!-- Das Inhaltsverzeichnis erscheint automatisch -->
<!-- rechts im Layout und nutzt nur H2-Tags       -->
<!-- ============================================ -->

<!-- ============================================ -->
<!-- HAKEN (Pflicht)                              -->
<!-- Einstieg mit einem Zustand oder einer Frage, -->
<!-- nicht mit dem Thema. Leser muss sich         -->
<!-- wiedererkennen oder neugierig werden.        -->
<!-- Wird als div.lead gerendert (kursiv).        -->
<!-- ============================================ -->
<div class="lead">
  Haken: Ein Zustand, eine Situation oder eine provokante Frage — der Leser
  soll sofort merken: Das ist meins. Kein Themenansatz, kein "In diesem Artikel".
</div>

<!-- ============================================ -->
<!-- KONTEXT (Pflicht)                            -->
<!-- 1 Absatz direkt nach dem Haken.              -->
<!-- Zentrale These: Was wird in diesem Text      -->
<!-- klar? Was verspricht der Beitrag?            -->
<!-- Macht den Pakt mit dem Leser.                -->
<!-- ============================================ -->
<p class="mb-6">Kontext-Absatz: Worum geht es wirklich? Welche Frage beantwortet dieser Text, und was nimmt der Leser am Ende mit? Hier steht die zentrale These — klar und direkt, ohne Umschweife.</p>

<!-- ============================================ -->
<!-- REISE (Pflicht): 3–6 H2-Abschnitte          -->
<!-- Jeder H2 = ein Aha-Moment oder eine Stufe.  -->
<!-- Kette von Erkenntnissen, nicht Punkte einer -->
<!-- Liste. H2-IDs erscheinen im ToC rechts.     -->
<!-- Links im Fließtext platzieren:              -->
<!--   Interne Links: 3–6 pro Beitrag            -->
<!--   Externe Links: bei der Aussage, die belegt-->
<!--     werden soll (Primärquellen bevorzugen)  -->
<!-- Linktexte sprechend wählen, nicht "hier".   -->
<!-- ============================================ -->

<h2 id="erste-ueberschrift">Erste Überschrift (H2)</h2>
<p class="mb-6">Hier beginnt der Fließtext. Jeder Absatz wird in p-Tags geschrieben. Kurze, prägnante Sätze. Interne Links natürlich im Text platzieren, z. B. zu einem <a href="/gedanken/verwandter-beitrag">verwandten Beitrag</a>.</p>

<p class="mb-6">Ein weiterer Absatz. Sie können auch <strong>fett</strong> oder <em>kursiv</em> formatieren. Externe Links direkt bei der Aussage, z. B. laut <a href="https://example.com/studie" target="_blank" rel="noopener">Studie XY</a>.</p>

<!-- InfoBox: max. 1–2 zentrale Begriffe pro Beitrag -->
<!-- Struktur: Definition → Abgrenzung → Beispiel → Fehlannahme → warum es hier zählt -->
<!-- Kurze Sätze, kein Jargon. -->
<InfoBox eyebrow="Kurz erklärt" title="Wichtiger Begriff" icon="info">
  <strong>Begriff:</strong> Was es ist in einem Satz. Was es nicht ist (Abgrenzung).
  Beispiel aus der Praxis. Häufige Fehlannahme. Warum das hier relevant ist.
</InfoBox>

<h3 id="unterueberschrift">Unterüberschrift (H3)</h3>
<p class="mb-6">Inhalt der Untersektion...</p>

<!-- Aufzählung -->
<ul>
  <li><strong>Punkt 1:</strong> Beschreibung des ersten Punktes.</li>
  <li><strong>Punkt 2:</strong> Beschreibung des zweiten Punktes.</li>
  <li><strong>Punkt 3:</strong> Beschreibung des dritten Punktes.</li>
</ul>

<!-- Quote: verstreut im Fließtext platzieren, wo sie inhaltlich passt -->
<Quote
  author="Name des Autors"
  content="Das Zitat, das hervorgehoben werden soll."
  source="Quelle des Zitats (optional)"
/>

<h2 id="zweite-hauptueberschrift">Zweite Hauptüberschrift</h2>
<p class="mb-6">Weiterer Inhalt...</p>

<!-- Warnung oder Tipp -->
<InfoBox eyebrow="Tipp" title="Praktischer Hinweis" icon="tip">
  Ein nützlicher Tipp für den Leser.
</InfoBox>

<InfoBox eyebrow="Warnung" title="Wichtige Warnung" icon="warning">
  Eine wichtige Warnung, die der Leser beachten sollte.
</InfoBox>

<!-- Stand-Hinweis (optional): bei schnelllebigen Themen (KI, Tools, Gesetze ...) -->
<!-- <p><em>Stand: MM/JJJJ</em></p> -->

<!-- ============================================ -->
<!-- GIPFEL (Pflicht)                             -->
<!-- Letzter H2-Abschnitt der Reise.             -->
<!-- Stärkste Verdichtung — die wichtigste        -->
<!-- Erkenntnis des gesamten Beitrags.            -->
<!-- Kein Anhang, keine Ergänzung — der Höhepunkt.-->
<!-- ============================================ -->

<h2 id="gipfel-ueberschrift">Inhaltlicher Gipfel-Titel</h2>
<p class="mb-6">Die stärkste Erkenntnis des Beitrags. Keine neue Information — die Essenz aus allem Vorherigen, verdichtet auf das Wesentliche.</p>

<!-- ============================================ -->
<!-- STILLER IMPULS (Pflicht)                     -->
<!-- Kein "Fazit"! Kein Zusammenfassen.           -->
<!-- Ein subtiles H2 mit inhaltlichem Titel,      -->
<!-- nicht generisch. Danach 1–2 Absätze:         -->
<!-- ein abschließender Gedanke, eine offene      -->
<!-- Frage oder ein leiser Nachhall.              -->
<!-- ID und Titel sind inhaltlich zu wählen.      -->
<!-- ============================================ -->

<h2 id="inhaltlicher-titel">Inhaltlicher Titel (kein "Fazit")</h2>
<p class="mb-6">Ein abschließender Gedanke, der nachwirkt. Keine Zusammenfassung, kein Rückblick auf alle Punkte. Eine Frage, ein Bild, ein stiller Gedanke — der Leser geht mit etwas, das bleibt.</p>

{/* ============================================ */}
{/* FAQ (Optional) — letztes Element im MDX     */}
{/* Sidebar endet hier. Danach volle Breite.    */}
{/* ============================================ */}
<div class="mt-24 md:mt-32">
<FAQ
  title="Häufig gestellte Fragen"
  questions={[
    { q: "Erste Frage?", a: "Antwort auf die erste Frage." },
    { q: "Zweite Frage?", a: "Antwort auf die zweite Frage." },
    { q: "Dritte Frage?", a: "Antwort auf die dritte Frage." }
  ]}
/>
</div>

{/* ============================================ */}
{/* HINWEIS: CTA, AuthorBio und RelatedPosts    */}
{/* werden NICHT mehr in MDX eingebunden.       */}
{/* [slug].astro rendert diese automatisch      */}
{/* außerhalb des 2-Spalten-Grids in voller     */}
{/* Seitenbreite — nach dem letzten MDX-Element.*/}
{/* RelatedPosts: automatischer Scoring-        */}
{/* Algorithmus (Kategorie +3, Tags +2, Keywords*/}
{/* +1, focusKeyword +2). Serie-Posts werden    */}
{/* ausgeschlossen (erscheinen in der Sidebar). */}
{/* ============================================ */}
```

---

## 🎯 Verfügbare Komponenten

### InfoBox
Hervorgehobene Boxen für Tipps, Warnungen, Definitionen.

**Icon-Optionen:** `info`, `tip`, `warning`, `note`, `none`

**Einsatz:** Max. 1–2 InfoBoxen pro Beitrag. Struktur des Inhalts:
Definition → Abgrenzung → Beispiel → Fehlannahme → warum es hier zählt.
Kurze Sätze, kein Jargon.

```mdx
<InfoBox eyebrow="Kurz erklärt" title="Titel" icon="info">
  Inhalt der Box...
</InfoBox>
```

### Quote
Zitat-Box mit Autor und Quelle. Verstreut im Fließtext platzieren — dort, wo das Zitat inhaltlich passt.

> ⚠️ **Keine Anführungszeichen im `content`-Prop!**
>
> Die `Quote`-Komponente setzt automatisch `"..."` um den Inhalt (in `Quote.astro` Zeile 14: `"{content}"`).
> Anführungszeichen im `content`-Wert führen zu doppelten Zeichen: `""Zitat""`.
>
> ✅ Richtig:
> ```mdx
> <Quote content="Das Zitat ohne Anführungszeichen." />
> ```
>
> ❌ Falsch:
> ```mdx
> <Quote content="&quot;Das Zitat mit Anführungszeichen.&quot;" />
> <Quote content=""Das Zitat mit Anführungszeichen."" />
> ```

> ⚠️ **Trailing `"` — häufige Fehlerquelle bei importierten Texten**
>
> Wenn der Originaltext mit einem schließenden Anführungszeichen endet (z. B. `Text."`) und direkt als `content`-Wert eingefügt wird, entsteht folgendes Muster:
>
> ```mdx
> content="Text.""   ← zwei " am Ende: das erste aus dem Text, das zweite schließt das Attribut
> ```
>
> Der MDX-Parser wirft dann: `Unexpected character " (U+0022) before attribute name`
>
> ✅ Fix: das letzte `"` entfernen — der Zitattext endet ohne Anführungszeichen:
> ```mdx
> content="Text."
> ```

> ⚠️ **`author`-Prop mit internen Anführungszeichen → einfache Hochkommas als Delimiter**
>
> Enthält der Autorenname selbst einen Werktitel in Anführungszeichen (z. B. Autor von "Solaris"),
> bricht ein inneres `"` das JSX-Attribut vorzeitig ab.
>
> ✅ Lösung: Attribut-Delimiter auf einfache Hochkommas wechseln:
> ```mdx
> author='Stanislaw Lem (Autor von "Solaris")'
> ```
>
> ❌ Falsch:
> ```mdx
> author="Stanislaw Lem (Autor von &quot;Solaris")"   ← bricht nach Solaris ab
> ```

```mdx
<Quote
  author="Albert Einstein"
  content="Das Zitat."
  source="Quelle"
/>
```

### CTA
> ⚠️ **Nicht mehr in MDX einbinden.** Wird automatisch vom Template (`[slug].astro`) außerhalb des Grids gerendert.

### FAQ
Akkordeon für häufig gestellte Fragen. **Letztes Element im MDX-Inhalt** — danach endet die Sidebar natürlich.

```mdx
<div class="mt-24 md:mt-32">
<FAQ
  title="Häufig gestellte Fragen"
  questions={[
    { q: "Frage?", a: "Antwort." }
  ]}
/>
</div>
```

> ⚠️ **FAQ-Strings mit inneren Anführungszeichen → einfache Hochkommas als Delimiter**
>
> Das `questions`-Array ist ein JavaScript-Ausdruck (`{[...]}`). Wenn eine Frage oder Antwort
> selbst Anführungszeichen enthält (z. B. Fachbegriffe wie `"Agency Decay"`), bricht ein inneres
> `"` den JS-String vorzeitig ab.
>
> ✅ Lösung: Den äußeren String-Delimiter auf einfache Hochkommas wechseln:
> ```mdx
> { q: 'Was ist "Agency Decay"?', a: 'Antwort ohne Problem.' }
> ```
>
> ❌ Falsch:
> ```mdx
> { q: "Was ist "Agency Decay"?", a: "..." }   ← bricht nach dem zweiten " ab
> ```

### AuthorBio
> ⚠️ **Nicht mehr in MDX einbinden.** Wird automatisch vom Template aus den Frontmatter-Feldern `authorBio`, `authorAvatar`, `authorSocial` gerendert.

### RelatedPosts
> ⚠️ **Nicht mehr in MDX einbinden.** Wird automatisch vom Template generiert — Scoring-Algorithmus nach Kategorie (+3), Tags (+2 pro Match), Keywords (+1 pro Match), focusKeyword (+2). Posts aus derselben Serie werden ausgeschlossen (erscheinen bereits in der Sidebar-SeriesNav).

**Thumbnails in den Related-Posts-Karten:**
Das `featuredImage`-Feld aus dem Frontmatter wird automatisch als Thumbnail in den RelatedPosts-Karten angezeigt. Es ist **kein separates Feld** nötig — `featuredImage` wird für Hero-Bild, Blog-Übersicht und RelatedPosts gleichermaßen verwendet.

```yaml
featuredImage: "/images/blog/YYYY/MM/dateiname-cover.webp"   # wird automatisch als Thumbnail verwendet
```

### FullWidthImage
Bild über die volle Spaltenbreite (außerhalb des normalen Content-Flows). Kein separates Feld im Frontmatter — wird direkt im MDX platziert.

```mdx
import FullWidthImage from '../../components/blog/FullWidthImage.astro';

<FullWidthImage
  src="/images/blog/dateiname.webp"
  alt="Beschreibender Alt-Text"
/>
```

> Bildgröße: mind. 1200 px Breite · Format: `.webp`

### YouTubeEmbed

DSGVO-konformes YouTube-Video mit Consent-Overlay. **Niemals ein rohes `<iframe>` direkt in MDX einbauen** — immer diese Komponente verwenden.

#### Warum die Komponente?

Ein direktes YouTube-Iframe lädt beim Seitenaufruf Google-Ressourcen und setzt Cookies — ohne Zustimmung eine DSGVO-Verletzung. Die `YouTubeEmbed`-Komponente löst das so:

1. **Beim Laden der Seite:** Nur das YouTube-Thumbnail wird geladen (statisches Bild von `img.youtube.com`) + ein Datenschutz-Hinweis mit Link zur Datenschutzerklärung
2. **Nach Klick auf „Video abspielen":** Erst jetzt wird das Iframe geladen — mit `youtube-nocookie.com` (Privacy-Enhanced Mode, keine Cookies ohne Wiedergabe)

#### Schritt-für-Schritt

**1. Video-ID aus der YouTube-URL extrahieren:**

| YouTube-URL | Video-ID |
|-------------|----------|
| `https://youtu.be/vr8NwCFjGa0` | `vr8NwCFjGa0` |
| `https://www.youtube.com/watch?v=vr8NwCFjGa0` | `vr8NwCFjGa0` |
| `https://www.youtube.com/watch?v=vr8NwCFjGa0&t=30s` | `vr8NwCFjGa0` (alles nach `&` ignorieren) |

**2. Import am Anfang der MDX-Datei (bei den anderen Imports):**

```mdx
import YouTubeEmbed from '../../components/blog/YouTubeEmbed.astro';
```

**3. Komponente im Fließtext platzieren:**

```mdx
<YouTubeEmbed videoId="vr8NwCFjGa0" title="Beschreibender Titel des Videos" />
```

#### Props

| Prop | Pflicht | Beschreibung |
|------|---------|--------------|
| `videoId` | ✅ | Die YouTube-Video-ID (nicht die vollständige URL) |
| `title` | ✅ | Beschreibung des Videos — erscheint im Datenschutz-Overlay und im iframe-`title`-Attribut (Accessibility + SEO) |

#### Vollständiges Beispiel (wie im Artikel)

```mdx
import YouTubeEmbed from '../../components/blog/YouTubeEmbed.astro';

<YouTubeEmbed
  videoId="vr8NwCFjGa0"
  title="Ferrari – Die Kultur des Qualified Buyer"
/>
```

#### Technische Details (Komponente: `src/components/blog/YouTubeEmbed.astro`)

- Thumbnail: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg` — lädt ohne Google-Tracking
- Video nach Zustimmung: `https://www.youtube-nocookie.com/embed/{videoId}?autoplay=1`
- Datenschutz-Link zeigt auf `/datenschutz`
- Responsives 16:9-Format (padding-bottom: 56.25%)
- Autoplay nach Zustimmung (UX: Nutzer hat gerade geklickt)

> ⚠️ **Wichtig:** Den Link zur Datenschutzerklärung (`/datenschutz`) in der Komponente nur ändern, wenn sich die URL der Datenschutzseite ändert. Datei: `src/components/blog/YouTubeEmbed.astro`

### ServiceTeaser
Teaser-Element für eine Leistungsseite — wird als inhaltlicher Übergang im Artikel eingesetzt.

```mdx
import ServiceTeaser from '../../components/blog/ServiceTeaser.astro';

<ServiceTeaser
  headline="Titel der Leistung"
  subline="Kurze Beschreibung der Leistung."
  highlight="/loesungen/slug-der-leistung"
/>
```

---

## 📐 Struktur-Übersicht

```
━━━ MDX-INHALT (im 2-Spalten-Grid mit Sidebar) ━━━━━━━━━━

Frontmatter (YAML)
Component Imports (nur: InfoBox, Quote, FAQ + optionale)

── HAKEN (Pflicht) ──────────────────────────────
  div.lead: Einstieg mit Zustand, nicht Thema

── KONTEXT (Pflicht) ────────────────────────────
  p: Zentrale These — was wird klar?

── REISE (Pflicht): 3–6 H2-Abschnitte ──────────
  H2 → H3 → p → ul/li → InfoBox → Quote
  Links: 3–6 intern + extern im Fließtext

── GIPFEL (Pflicht) ─────────────────────────────
  Letzter H2 der Reise — stärkste Verdichtung

── STILLER IMPULS (Pflicht) ─────────────────────
  Inhaltliches H2 (kein "Fazit") + 1–2 p
  Nachwirkender Gedanke oder offene Frage

── FAQ (Optional) ───────────────────────────────
  Letztes Element im MDX — Sidebar endet hier

━━━ VOLLE SEITENBREITE (außerhalb Grid, [slug].astro) ━━━

── CTA (automatisch) ────────────────────────────
  Standard-CTA → /kontakt
  Sidebar läuft hier nicht mehr mit

── AuthorBio (automatisch aus Frontmatter) ──────
  authorBio, authorAvatar, authorSocial

── RelatedPosts (automatisch, Scoring) ──────────
  Kategorie +3 · Tags +2 · Keywords +1 · focusKW +2
  Serie-Posts ausgeschlossen (bereits in Sidebar)

━━━ Immer automatisch vom Layout gerendert ━━━━━━━━━━━━━━

- Hero-Bild + H1
- Metainfos (Autor, Datum, Kategorie, Lesezeit)
- Inhaltsverzeichnis (rechte Sidebar, nutzt H2-IDs)
- SeriesNav (Sidebar, wenn post.data.series gesetzt)
```

---

## ✅ Checkliste vor Veröffentlichung

**Frontmatter & SEO**
- [ ] `title` — vollständiger Titel gesetzt
- [ ] `metaTitle` — max. 45 Zeichen, Primary Keyword vorne
- [ ] `metaDescription` — 120–155 Zeichen, Primary Keyword + Nutzenversprechen + CTA
- [ ] `focusKeyword` — 1 Primary Keyword definiert
- [ ] `keywords` — 3–4 Secondary Keywords ergänzt
- [ ] `featuredImage` — WebP, 1200 × 630 px, Pfad korrekt
- [ ] `featuredImageAlt` — max. 125 Zeichen, kein "Bild von...", Secondary Keyword eingebaut
- [ ] `excerpt` — plain text, kurze SEO-Zusammenfassung (kein HTML, keine Intro-Kopie)
- [ ] `lead` — HTML-fähige Einleitung gesetzt; Absätze mit Leerzeile getrennt (YAML `|`-Block)
- [ ] `updated` — auf heutiges Datum gesetzt
- [ ] `readingTime` — realistischer Wert in Minuten (Richtwert: 200 Wörter/Min. → 1.000 Wörter = 5 Min.)

**Inhalt & Struktur**
- [ ] MDX-Body beginnt direkt mit `<h2>` — **keine `<p>`-Absätze vor dem ersten `<h2>`**
- [ ] Alle H2-Überschriften haben `id`-Attribute
- [ ] Interne Links (3–6) im Fließtext gesetzt, sprechende Linktexte
- [ ] Externe Links im Fließtext bei der jeweiligen Aussage gesetzt
- [ ] Bilder im Text haben Alt-Texte (Secondary Keyword einbauen)
- [ ] Stiller Impuls: kein "Fazit"-Label, inhaltlicher H2-Titel
- [ ] Stand-Hinweis gesetzt (wenn zeitkritisches Thema)
- [ ] Kein CTA / AuthorBio / RelatedPosts in MDX — diese kommen automatisch vom Template
- [ ] FAQ (falls vorhanden): letztes Element im MDX, in `<div class="mt-24 md:mt-32">` gewrappt
