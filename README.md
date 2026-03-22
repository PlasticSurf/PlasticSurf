# PlasticSurf Website

Astro-Website mit Tailwind CSS, MDX und TypeScript.

---

## ⚠️ Wichtigste Regel für KI: Originaltexte 100% unverändert übernehmen

Texte werden **exakt so übernommen wie sie vorliegen** – kein Wort verändern, keine Anrede wechseln (du/Sie), nichts kürzen, nichts umformulieren.

Nur die **MDX-Formatierung** wird angepasst (Absätze wrappen, Überschriften mit `id`, Zitate in `<Quote>`).

**Ausnahme:** Fehler oder Verbesserungen dem Nutzer **vorlegen** – nicht eigenständig umsetzen.

---

## ⚠️ Pflicht-Regel für KI: Tailwind-Einheiten — gilt für alle Dateien, alle Aufgaben

**Schriftgrößen → immer `rem` (Tailwind-Standardklassen bevorzugen)**

| Klasse | Wert | Klasse | Wert |
|--------|------|--------|------|
| `text-sm` | 0.875rem | `text-4xl` | 2.25rem |
| `text-base` | 1rem | `text-5xl` | 3rem |
| `text-lg` | 1.125rem | `text-6xl` | 3.75rem |
| `text-xl` | 1.25rem | `text-7xl` | 4.5rem |
| `text-2xl` | 1.5rem | `text-8xl` | 6rem |
| `text-3xl` | 1.875rem | `text-9xl` | 8rem |

Gibt es keinen passenden Standard → Arbitrary Value in **rem**: `text-[6.25rem]` ✅ — **nie `px`**: `text-[100px]` ❌

**Zeilenabstand → immer unitless (Multiplikator, kein rem, kein px)**

| Klasse | Wert | Klasse | Wert |
|--------|------|--------|------|
| `leading-none` | 1 | `leading-relaxed` | 1.625 |
| `leading-tight` | 1.25 | `leading-loose` | 2 |
| `leading-snug` | 1.375 | | |
| `leading-normal` | 1.5 | | |

Gibt es keinen passenden Standard → Arbitrary Value **ohne Einheit**: `leading-[0.9]` ✅ — **nie px/rem**: `leading-[24px]` ❌

> Unitless line-height ist best practice: skaliert relativ zur Schriftgröße und vererbt sich korrekt.

---

## 🚀 Projektstruktur

```
src/
├── components/
│   ├── analytics/       # Google Analytics Komponente
│   ├── blog/            # Blog-Komponenten (AuthorBio, CTA, FAQ, InfoBox, Quote, RelatedPosts, SeriesNav, TableOfContents)
│   ├── forms/           # Kontaktformular
│   ├── global/          # Header, Footer, CookieBanner, Hero, HeroZone
│   └── utils/           # ScrollReveal
├── content/
│   └── blog/            # MDX Blog-Beiträge
├── layouts/
│   └── BaseLayout.astro # Hauptlayout (OG-Tags, Twitter-Card, Schema.org, DSGVO-Fonts)
├── lib/
│   └── seo.ts           # Schema.org JSON-LD Generatoren
├── pages/
│   ├── index.astro      # Home
│   ├── kontakt.astro    # Kontakt
│   ├── die-dna.astro    # Über mich
│   ├── erlebnisse.astro # Referenzen
│   ├── loesungen/       # Lösungs-Seiten
│   └── gedanken/        # Blog ([slug].astro — enthält zentrales Blog-Styling)
└── styles/
    └── global.css       # Globale Styles, Fonts (@fontsource), section-padding
```

---

## 📋 Setup

### 1. Dependencies installieren

```bash
cd plastic-surf-website
npm install
```

### 2. Environment Variables

`.env`-Datei im Projektordner erstellen:

```
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
FORMSPREE_FORM_ID=xxxxxxxx
```

### 3. Fonts (DSGVO-konform via @fontsource)

Fonts sind als npm-Pakete installiert und werden **lokal ausgeliefert** — kein Google Fonts CDN.
Die Einbindung erfolgt automatisch über `src/styles/global.css`.

> ⚠️ **Kein Google Fonts CDN in BaseLayout.astro einfügen!**
> Das wäre eine DSGVO-Verletzung und würde Fonts doppelt laden.

> ⚠️ **`@import` muss VOR `@tailwind` stehen — sonst werden Fonts nicht geladen!**
> PostCSS verarbeitet `@import`-Regeln nur, wenn sie ganz oben in der CSS-Datei stehen (vor allen anderen Regeln).
> Stehen sie nach `@tailwind base/components/utilities`, werden die Imports **stillschweigend ignoriert** —
> kein Fehler, keine Warnung, aber keine `@font-face`-Regeln im Browser.
> Im lokalen Dev fällt das nicht auf, wenn die Schrift als System-Font installiert ist.
>
> ✅ Korrekte Reihenfolge in `global.css`:
> ```css
> @import '@fontsource/montserrat-alternates/900.css'; /* zuerst */
> @tailwind base;   /* danach */
> ```

### 4. Entwicklung

```bash
npm run dev       # http://localhost:4321
npm run build     # Produktions-Build
npm run preview   # Build lokal vorschauen
```

---

## 🎨 Design-System

### Farben

| Name | Hex | Verwendung |
|------|-----|------------|
| `background` | #080D19 | Dunkler Seiten-Hintergrund |
| `primary` | #FF4E56 | Corporate-Farbe, CTAs, Akzente |
| `text` | #E0D8D2 | Heller Fließtext auf dunkel |
| Blog-Hintergrund | #f9fafb | Blog-Seite Off-White (`bg-gray-50`) — kein reines Weiß |
| Blog-Box-Hintergrund | #f3f4f6 | Boxen im Blog (`bg-gray-100`): ToC, AuthorBio, Quote, FAQ, SeriesNav, RelatedPosts, Blockquote, th |

### Schriftarten

| Klasse | Font | Verwendung |
|--------|------|------------|
| `font-primary` / `font-heading` | Montserrat Alternates | Alle Überschriften (h1–h6) |
| `font-secondary` / `font-display` | Playfair Display | Lead-Text, Zitate, Akzente |
| `font-body` | Roboto | Gesamter Fließtext |

### Schriftgrößen (alle +4px gegenüber Tailwind-Standard)

| Klasse | Pixel | Verwendung |
|--------|-------|------------|
| `text-xs` | 16px | Kleinster Text |
| `text-sm` | 18px | Kleiner Text |
| `text-base` | 20px | Standard-Fließtext, Blog |
| `text-lg` | 22px | Leicht größerer Text |
| `text-xl` | 24px | Kleine Überschrift |
| `text-2xl` | 28px | Mittlere Überschrift |
| `text-3xl` | 34px | Große Überschrift |
| `text-4xl` | 40px | Hero-Titel klein |
| `text-5xl` | 52px | Hero-Titel mittel |
| `text-6xl` | 64px | Hero-Titel groß |
| `text-7xl` | 76px | Hero-Titel maximal |

### Typografische Muster

#### Vollständiges Sektions-Muster (verbindlich für alle Seiten)

Jede Sektion mit H2 + Subline + Text folgt exakt diesem Aufbau:

```html
<!-- Optional: Eyebrow-Label über H2 -->
<p class="font-secondary text-primary text-sm uppercase tracking-widest mb-2">Label</p>

<!-- H2: leading-tight mb-1 — IMMER, wenn Subline folgt -->
<h2 class="font-primary text-[3.125rem] font-black leading-tight mb-1">Headline</h2>

<!-- Subline: direkt unter H2, kein Uppercase -->
<p class="font-secondary text-2xl text-[#927350] mb-8">Subline</p>

<!-- Body-Text -->
<p class="font-body text-text/80 text-base leading-relaxed">Fließtext...</p>
```

#### Abstände im Detail

| Element | Klassen | Abstand nach unten |
|---------|---------|-------------------|
| Eyebrow-Label | `font-secondary text-primary text-sm uppercase tracking-widest mb-2` | 8px |
| H2 (vor Subline) | `font-primary text-[3.125rem] font-black leading-tight mb-1` | 4px |
| Subline | `font-secondary text-2xl text-[#927350] mb-8` | 32px |

#### Unterschied: Eyebrow-Label vs. Subline

| | Eyebrow-Label | Subline |
|---|---|---|
| Farbe | `text-primary` (Rot) | `text-[#927350]` (Gold) |
| Größe | `text-sm` | `text-2xl` |
| Stil | `uppercase tracking-widest` | normal |
| Position | **über** H2 | **unter** H2 |

Beispiele im Einsatz (Startseite):
- Eyebrow: „The Proof" (über „Die DNA")
- Subline: „25 Jahre Erfahrung kann man nicht prompten." (unter „Die DNA")
- Subline: „Vier Module. Jedes löst einen Engpass. Keines ist zufällig."
- Subline: „Kein Sales-Team. Ein Gespräch unter Strategen."

> ⚠️ **`leading-tight mb-1` ist Pflicht auf jedem H2, dem eine Subline folgt.**
> Ohne `leading-tight` erzeugt die große Schriftgröße durch die Standard-Zeilenhöhe (1.5) ~12px unsichtbaren Puffer unterhalb — der Abstandswert des `mb` hat dann kaum Wirkung.

---

### Container-Breite

- `container-custom` = `max-w-screen-2xl` (**1536px**) — Tailwind `2xl`-Standard
- Definiert in `src/styles/global.css` als `@apply max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8;`
- Gilt global für **alle Seiten** — eine Änderung wirkt überall

> Vorher `max-w-7xl` (1280px) — im März 2026 auf 1536px umgestellt.

### Abstände

- `section-padding` = `@apply py-16 md:py-24;` (64px / 96px)
- Definiert in `src/styles/global.css`

---

## 🖼️ Bilder & Formate

**Pflichtformat: `.webp`** für alle neuen Bilder.

### Blog-Bilder (`public/images/blog/`)

| Verwendung | Größe | Hinweis |
|------------|-------|---------|
| Cover / Featured Image | **1200 × 630 px** | OG-Bild + Hero — 1.91:1 |
| Thumbnail (Übersichtsseite) | **800 × 450 px** | Wird aus `featuredImage` skaliert |
| Content-Bilder (im Text) | **max. 760 px Breite** | Passt in `max-w-3xl`-Spalte |
| Autor-Avatar | **200 × 200 px** | 1:1, rund via CSS |

### Allgemeine Bilder (`public/images/`)

| Verwendung | Größe | Hinweis |
|------------|-------|---------|
| Hero-Hintergrund | **1920 × 1080 px** | Stark komprimieren (< 400 KB) |
| Portrait / Personen | **800 × 800 px** | 1:1 oder 3:4 |
| OG-Image Startseite | **1200 × 630 px** | `/public/og-image.webp` |

### Erlebnisse-Bilder (`public/images/erlebnisse/`)

| Kacheltyp | Größe | Hinweis |
|-----------|-------|---------|
| Large (2 Spalten) | **1680 × 1200 px** | Querformat ~1.4:1 |
| Medium (1 Spalte) | **840 × 1200 px** | Hochformat ~0.7:1 – ideal für Flaschen/Verpackungen |

Dateinamen: `client-name-kategorie.webp` (Kleinbuchstaben, Bindestriche, keine Umlaute)

### Komprimierung

- WebP-Qualität: **80–85 %** (Tools: Squoosh, ImageOptim)
- Cover < 200 KB · Content < 100 KB · Hero < 400 KB
- Dateinamen: `keyword-beschreibung.webp` (Kleinbuchstaben, Bindestriche)

---

## 📝 Blog-Beitrag erstellen

MDX-Datei in `src/content/blog/` anlegen.

### Frontmatter (vollständig)

```yaml
---
title: "Der vollständige Titel des Beitrags"
metaTitle: "SEO-Titel (max. 45 Zeichen)"
# ↑ [slug].astro hängt " - PlasticSurf" an → 60 Zeichen gesamt im SERP
metaDescription: "120–155 Zeichen, Primary-Keyword + Nutzenversprechen + CTA"
date: "YYYY-MM-DD"
updated: "YYYY-MM-DD"       # optional: Datum der letzten Aktualisierung
author: "Vorname Nachname"
category: "Business"        # Business | Technologie | Strategie | Wissensmanagement
tags: ["KI", "Digitalisierung", "Strategie"]
featuredImage: "/images/blog/dateiname-cover.webp"
featuredImageAlt: "Beschreibender Alt-Text (max. 125 Zeichen, kein 'Bild von...')"
excerpt: "1–2 Sätze (plain text) — für Blog-Index, RelatedPosts und OG-Description-Fallback"
lead: |
  Erster Einleitungsabsatz — HTML-fähig, wird als Sektion 2 auf der Blogpost-Seite angezeigt.

  Zweiter Absatz mit optionalem <a href="https://example.com" target="_blank" rel="noopener noreferrer" title="Titel">Link</a>. Optional — ohne dieses Feld wird excerpt als Fallback verwendet.
readingTime: 8
authorBio: "Kurzbiografie des Autors (1–2 Sätze)"
authorAvatar: "/images/avatar-vorname.webp"
authorSocial:
  email: "email@plasticsurf.de"
  linkedin: "https://linkedin.com/in/profil"
# --- Nur für Blog-Serien ---
series: "serie-slug"        # optional: verbindet alle Teile einer Serie
seriesPart: 1               # optional: Reihenfolge innerhalb der Serie
---
```

### SEO-Felder im Überblick

| Feld | Limit | Pflicht |
|------|-------|---------|
| `metaTitle` | **max. 45 Zeichen** | ✅ |
| `metaDescription` | **120–155 Zeichen** | ✅ |
| `featuredImageAlt` | max. 125 Zeichen | ✅ |
| `excerpt` | 1–2 Sätze | ✅ | plain text — Blog-Index, RelatedPosts, OG-Fallback |
| `lead` | 1–2 Absätze | — | HTML-fähig — Einleitung auf der Blogpost-Seite; unterstützt `<a>`-Links; Fallback: `excerpt` |

### URL-Slug (= Dateiname der MDX-Datei)

`ki-tools-handwerk.mdx` → URL: `/gedanken/ki-tools-handwerk`

- Keyword-reich, 3–5 Wörter, keine Füllwörter (der/die/das/und)
- Kleinbuchstaben, Bindestriche, keine Umlaute (ä→ae, ö→oe, ü→ue)
- Keine Datumsangaben

Vollständige Anleitung: `docs/blog-mdx-vorlage.md`

---

## 🔧 Blog-Komponenten

Vollständige Dokumentation und Vorlage: `docs/blog-mdx-vorlage.md`

```mdx
import InfoBox from '../../components/blog/InfoBox.astro';
import Quote from '../../components/blog/Quote.astro';
import CTA from '../../components/blog/CTA.astro';
import FAQ from '../../components/blog/FAQ.astro';
import AuthorBio from '../../components/blog/AuthorBio.astro';
import RelatedPosts from '../../components/blog/RelatedPosts.astro';
```

| Komponente | Verwendung | Pflicht |
|------------|------------|---------|
| `InfoBox` | Hervorgehobene Boxen (Tipp, Warnung, Definition) | Optional |
| `Quote` | Zitat-Boxen im Fließtext | Optional |
| `CTA` | Call-to-Action am Artikelende | Optional |
| `FAQ` | Akkordeon für häufige Fragen | Optional |
| `AuthorBio` | Autor-Box am Artikelende | ✅ Pflicht |
| `RelatedPosts` | Thematisch ähnliche Beiträge | ✅ Pflicht |
| `SeriesNav` | Serien-Navigation in der Sidebar | Automatisch |
| `TableOfContents` | Inhaltsverzeichnis in der Sidebar | Automatisch |
| `FullWidthImage` | Bild über volle Spaltenbreite im Artikel | Optional |
| `ServiceTeaser` | Teaser für Leistungsseite im Artikel | Optional |
| `YouTubeEmbed` | DSGVO-konformes YouTube-Video mit Consent-Overlay | Optional |

> **SeriesNav** erscheint automatisch unter dem ToC, wenn `series` + `seriesPart` im Frontmatter gesetzt sind und ≥ 2 Beiträge dieselbe Serie teilen. Kein manueller Import nötig.

> **RelatedPosts** = thematische Empfehlungen (manuell). **Nicht** für Serien-Navigation verwenden.

---

## 🎯 Blog-Styling

Das gesamte Blog-Styling ist zentral in **`src/pages/gedanken/[slug].astro`** definiert. Alle MDX-Dateien erben das Styling automatisch.

### Layout

- Äußerer Container: `max-w-screen-2xl` (**1536px**) — Tailwind `2xl`
- **Content-Spalte: `max-w-3xl` (768px / ~760px)** — für optimale Lesbarkeit
- ToC-Sidebar: rechts, `col-span-4`, sticky
- Grid: `lg:grid-cols-12` (content: 8 Spalten, Sidebar: 4 Spalten)

### Überschriftengrößen im Blog

| Element | Quelle | Projektgröße |
|---------|--------|--------------|
| H2 | `font-size: 2.25rem` in `global.css` | 36px |
| H3 | `font-size: 1.75rem` in `global.css` | 28px |
| H4–H6 | `font-semibold` in `[slug].astro` | Browser-Standard |
| Fließtext | `font-size: 1.25rem` in `global.css` | 20px |

### Textfarben im Blog

| Element | Farbe | Hex |
|---------|-------|-----|
| Überschriften (h1–h6) | Dunkles Grau | #111827 |
| Fließtext (p, li) | Dunkles Grau | #1f2937 |
| Links (a) | Blau | #2563eb |
| Blockquotes | Grau | #374151 auf #f3f4f6 |
| Code (inline) | Dunkles Grau | #1f2937 auf #f3f4f6 |

**Kein reines Schwarz (#000000) verwenden.**

### Klassen in MDX verwenden

In MDX-Dateien nur diese Elemente verwenden:

```
<div class="lead">              → Lead-Text (kursiv, Playfair Display)
<h2 id="slug">                  → H2 (erscheint im ToC)
<h3 id="slug">                  → H3
<p class="mb-6">Text</p>        → Absatz — IMMER einzeilig!
<ul><li>                        → Liste
<strong>                        → Fettdruck
<em>                            → Kursiv
<a href="...">                  → Link
<div class="mt-24 md:mt-32">    → Abstand vor Bottom-Sektionen (CTA, FAQ, AuthorBio, RelatedPosts)
```

> ⚠️ **`<p>` Tags in MDX immer einzeilig schreiben.**
> MDX parst mehrzeiligen Inhalt in einem `<p>` als Markdown → erzeugt nested `<p>` → Browser
> schließt äußeren `<p>` sofort → leeres Tag ohne Klasse + Textabsatz ohne `mb-6`.
> Einzige Ausnahme: `mb-6` als Klasse direkt auf dem `<p>` ist erlaubt und nötig.

> ⚠️ **Kommentare in MDX: nur `{/* */}` — kein `<!-- -->`**
> MDX basiert auf JSX. HTML-Kommentare (`<!-- -->`) sind auf oberster Ebene syntaktisch ungültig
> und führen zu einem Build-Fehler (`Unexpected character ! (U+0021)`).
> JSX-Kommentare erscheinen nicht im Browser-Source — sie dienen nur als Strukturmarker im Quellcode.

---

## 🔗 Links im Blog

- **Interne Links:** 3–6 pro Beitrag, im Fließtext direkt bei der Aussage
- **Externe Links:** Absolute URL mit `https://`, `target="_blank"`, `rel="noopener noreferrer"`, `title`-Attribut — direkt bei der belegten Aussage. Links im `excerpt` nicht möglich (plain text) → `lead`-Feld verwenden
- **Linktexte:** Immer sprechend — keine generischen Texte ("hier", "mehr", "klicken")

Details: `docs/seo-richtlinien.md`

### YouTube-Videos einbetten

**Niemals ein rohes `<iframe>` verwenden** — immer die `YouTubeEmbed`-Komponente:

```mdx
import YouTubeEmbed from '../../components/blog/YouTubeEmbed.astro';

<YouTubeEmbed videoId="VIDEO_ID" title="Beschreibender Titel" />
```

Die Video-ID steht in der URL: `https://youtu.be/**VIDEO_ID**`

Die Komponente zeigt zuerst ein Datenschutz-Overlay — das Video lädt erst nach Zustimmung. Vollständige Anleitung: `docs/blog-mdx-vorlage.md` → Abschnitt „YouTubeEmbed".

---

## 🔍 SEO-Architektur

### BaseLayout.astro

- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale` (de_DE)
- Twitter Card (summary_large_image)
- Canonical URL
- `ogType` Prop: `'website'` (Standard) oder `'article'` (Blog-Beiträge)

### Blog-Beiträge ([slug].astro)

- `ogType="article"` wird automatisch gesetzt
- `featuredImage` wird als OG-Bild übergeben
- Schema.org JSON-LD: `BlogPosting` + `BreadcrumbList`
- `inLanguage: 'de'` im Schema

### Schema.org Generatoren (src/lib/seo.ts)

- `generateOrganizationSchema()`
- `generateWebSiteSchema()`
- `generateBlogPostingSchema()` — inkl. `inLanguage: 'de'`
- `generateBreadcrumbSchema()`
- `generateLocalBusinessSchema()`

---

## 🏗️ Seitenstruktur & Layout-Patterns

### Startseite (`index.astro`)

| Sektion | Layout | Inhalt |
|---------|--------|--------|
| Hero | Vollbild | Headline + Text + 2 Buttons |
| Module | Container | Intro + 4 Cards (2×2 Grid) + Überleitung + CTA-Button |
| Die DNA | 1/3 + 2/3 Grid | Bild links (`Martin-Kalinowski.webp`) + Text rechts + Button |
| Blog-Scroll | Horizontal-Scroll | H2 + Text + 5 neueste Posts (Apple-Stil) + Pfeil-Buttons |
| Kontakt | 2/3 + 1/3 Grid | Text links + Formular rechts (`id="kontakt"`) |

### Lösungen (`loesungen/index.astro`)

| Sektion | Layout | Inhalt |
|---------|--------|--------|
| Hero | Container | H1 + Einleitungstext |
| Vier Säulen | Container | H2 + Subline + Text + 4 Cards (2×2 Grid) |
| Synthese | Container | H2 + Subline + 2 Textabsätze |
| Strategischer Dialog | 2/3 + 1/3 Grid | Text links + Formular rechts (`id="kontakt"`) |

### Wiederverwendbare Patterns

**Zweispalten-Layout (Text + Formular):**
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
  <div class="md:col-span-2"><!-- Text 2/3 --></div>
  <div><!-- Formular 1/3 --></div>
</div>
```

**Kontaktformular (Standard):**
- Felder: Name, E-Mail, Nachricht
- Placeholder Nachricht: `"Wo spüren Sie aktuell den größten Widerstand?"`
- `data-netlify="true"` für Netlify Forms
- Button: `btn-primary w-full`

**Horizontaler Blog-Scroll (Apple-Stil):**
- Track-Element: `id="blog-scroll-track"`, `overflow-x: auto`, `display: flex`
- Parent-Section: `overflow-x: clip` (nicht `overflow-hidden` — das blockiert Scroll!)
- Left-Padding via JS: misst `container-custom` Left-Edge + paddingLeft dynamisch
- Pfeil-Buttons: `onclick` inline (nicht `addEventListener` — Astro-Script-Scope-Problem)
- Scroll per Pfeil: `track.scrollBy({ left: ±cardWidth, behavior: 'smooth' })`

### Astro-Script-Hinweise

> ⚠️ **Variablen-Scope in Astro `<script>`-Tags:**
> Variablen müssen auf der **obersten Script-Ebene** deklariert werden, nicht innerhalb von Funktionen. Sonst sind sie in anderen Funktionen nicht verfügbar.
> ```js
> // ✅ Richtig
> const track = document.getElementById('blog-scroll-track');
> const fn = () => { track.scrollBy(...) }; // track verfügbar
>
> // ❌ Falsch
> const init = () => { const track = document.getElementById('...'); };
> const fn = () => { track.scrollBy(...) }; // track ist undefined!
> ```

> ⚠️ **`overflow-hidden` auf Parent blockiert Kindelement-Scroll:**
> Wenn ein Scroll-Container (`overflow-x: auto`) innerhalb eines `overflow-hidden`-Parents sitzt, kann er nicht scrollen. Fix: Parent auf `overflow-x: clip` setzen — das clippt visuell, blockiert aber keinen Scroll.

---

## 📚 Dokumentation

| Datei | Inhalt |
|-------|--------|
| `docs/blog-mdx-vorlage.md` | Vollständige Blog-Vorlage für KI: Struktur, Frontmatter, Komponenten, Bildgrößen, Checkliste |
| `docs/seo-richtlinien.md` | SEO-Referenz: Dateinamen, Bildgrößen, Alt-Texte, Links, OG-Images, Structured Data, Checkliste |
| `docs/hero-system.md` | Hero-Komponenten (`Hero.astro`, `HeroZone.astro`): Props, Verwendung, Hintergrundbild, Responsive |
| `docs/formulare.md` | Formular-System: Typ A (KontaktSection/Netlify) + Typ B (ContactForm/Formspree), formName-Konventionen, Tracking |
| `docs/loesungen-unterseiten-vorlage.md` | Vollständige Astro-Vorlage für alle 4 Lösungs-Unterseiten inkl. Bilder, SEO und formName |
| `docs/design-system.md` | Abstände, Container, Typografie-Hierarchie, Farbpalette |
