# SEO-Richtlinien – PlasticSurf

Verbindliche Regeln für alle Seiten, Blog-Beiträge und Komponenten.
Der SEO-Skill wird nur für detaillierte Audits eingesetzt — diese Datei deckt die Pflichtbasis ab.

---

## 1. Pflichtfelder — jede Seite (BaseLayout-Props)

Jede Seite MUSS explizite Props setzen. Nie auf den Fallback im BaseLayout verlassen.

```astro
<BaseLayout
  title="Primary Keyword – Kreativagentur Freiburg | PlasticSurf"
  description="Freiburg-Fokus zuerst: ... (148–160 Zeichen, Keyword + CTA)"
  image="/images/seitenname-og.webp"
>
```

| Prop          | Regel                                                        |
|---------------|--------------------------------------------------------------|
| `title`       | 50–60 Zeichen · Primary Keyword + Freiburg + PlasticSurf     |
| `description` | 148–160 Zeichen · „Kreativagentur Freiburg" am Anfang · CTA  |
| `image`       | Seitenspezifisch, 1200 × 630 px WebP · nie `/og-image.jpg`  |

---

## 2. Keyword-Strategie

Pro Seite maximal **1 Primary + 2–3 Secondary Keywords** — Fokus schlägt Streuung.

| Ebene     | Platzierung                                   |
|-----------|-----------------------------------------------|
| Primary   | H1 (Eyebrow), `<title>`, `description`, erster Absatz |
| Secondary | H2-Überschriften, Subline, Fließtext (natürlich) |

**Freiburg-Fokus:** „Kreativagentur Freiburg" oder „Werbeagentur Freiburg" gehört in H1, Title und Description-Anfang jeder Hauptseite.

**Keyword-Dichte:** 1–2 % des Gesamttextes — Keywords fließen natürlich, nie gestopft.

---

## 3. Semantik & Heading-Hierarchie

### Eyebrow-Muster (Pflicht für poetische Headlines)

```astro
<Hero
  eyebrow="Primary Keyword – Kreativagentur Freiburg"
  headline='<span class="text-primary">Poetischer</span> Titel.'
  subline="Sekundärer Keyword-Kontext hier"
  layout="left"
/>
```

- `eyebrow` → rendert als **H1** (SEO, klein, uppercase, `text-primary`)
- `headline` → rendert als **H2** wenn eyebrow gesetzt (visuell dominant)
- `subline` → Secondary Keyword unterbringen

### Heading-Regeln

- **Genau eine H1** pro Seite (immer der Eyebrow-Text)
- Keine Level-Sprünge: H1 → H2 → H3 (nie H1 → H3)
- H2 und H3 enthalten Secondary Keywords
- **Kein Heading als reines Designelement** — semantisch korrekt bleiben

---

## 4. Link-Titel (häufig vergessen!)

Jeder interne `<a>`-Tag mit Navigationsfunktion braucht ein `title`-Attribut.

```astro
<!-- Bento/Karten-Links -->
<a href={ref.href} title={`${ref.category}: ${ref.client} – ${ref.project}`}>

<!-- Navigation / CTA-Buttons -->
<a href="/kontakt" title="Kontakt aufnehmen – Kreativagentur PlasticSurf Freiburg">

<!-- Blog-Links im Fließtext -->
<a href="/gedanken/slug" title="Artikel: Titel des Beitrags – PlasticSurf Blog">
```

**Externe Links** — Pflicht-Attribute:
```html
<a href="https://..." target="_blank" rel="noopener noreferrer" title="Beschreibender Titel">
  Anchor-Text
</a>
```

**Interne Links pro Seite:** 3–6 im Fließtext, nie als Block am Ende, nie „hier klicken".

---

## 5. Bilder

### Dateinamen (SEO-optimiert)
- Format: `keyword-beschreibung.webp` — Kleinbuchstaben, Bindestriche, keine Umlaute
- ✅ `kreativagentur-freiburg-referenzen-hero.webp`
- ❌ `Hero_Bild_Freiburg.jpg`

### Bildgrößen

| Bereich                          | Größe             |
|----------------------------------|-------------------|
| OG-Image / Blog Cover            | 1200 × 630 px     |
| Hero-Hintergrund Desktop         | 1920 × 1080 px    |
| Erlebnisse Large (Bento 2-sp.)   | 1680 × 1200 px    |
| Erlebnisse Medium (Bento 1-sp.)  | 840 × 1200 px     |
| Erlebnisse Slider-Karte          | 600 × 720 px      |
| Portrait / Personen              | 800 × 800 px      |
| Blog Content-Bilder              | max. 760 px Breite|
| Autor-Avatar                     | 200 × 200 px      |

Komprimierung: **80–85 % WebP** · Cover < 200 KB · Content < 100 KB · Hero < 400 KB

### OG-Images erstellen (programmatisch)

OG-Images für Lösungs- und andere Unterseiten werden mit **Python + Pillow** und dem **canvas-design Skill** generiert.

**Dateiname-Schema:** `[seiten-slug]-og.webp` → z. B. `performance-audit-ki-fahrplan-og.webp`

**Workflow:**
1. Canvas-Design Skill aufrufen mit Brand-Briefing (Farben, Fonts, Layout)
2. Skill erstellt PNG via Pillow-Script
3. PNG → WebP konvertieren (`quality=85`) und PNG entfernen
4. Datei landet in `public/images/[dateiname]-og.webp`

**Brand-Konstanten für alle OG-Images:**
```
Hintergrund:  #080D19
Akzentfarbe:  #FF4E56 (Label, Akzent-Elemente)
Subline:      #927350 (Gold, Playfair italic)
Textfarbe:    #E0D8D2 (Headline)
Headline:     BigShoulders-Bold ~88px (aus canvas-fonts/)
Subline-Font: Lora-Italic ~27px (aus canvas-fonts/)
Label-Font:   InstrumentSans-Regular ~11px (aus canvas-fonts/)
Layout:       Linksbündig, Kategorie-Label oben links, URL unten links
              Geometrischer Akzent (Strahlen) rechts, sehr dezent
```

**Beispiel-Aufruf:**
```
canvas-design Skill: "OG-Image 1200×630px für [Seitenname],
Brand: #080D19 BG, #FF4E56 Akzent, #927350 Gold, #E0D8D2 Text.
Label oben links: [KATEGORIE]. Headline: [Titel]. Subline italic: [Subline].
URL unten links: plasticsurf.de. Geometrischer Akzent rechts.
Save as: public/images/[slug]-og.png"
```
→ Dann PNG → WebP konvertieren.

### Alt-Texte

```astro
<!-- Inhaltsbild: beschreibend, max. 125 Zeichen, Keyword natürlich einbauen -->
alt={ref.alt ?? ref.client}

<!-- Dekorativ: leer + aria-hidden -->
alt="" aria-hidden="true"
```

- ✅ `"KaffeeShop 24 eCommerce Referenz – ERP und CRM-Anbindung"`
- ❌ `"Bild von einer Website"` oder nur `"KaffeeShop 24"`

---

## 6. Structured Data (JSON-LD)

### Welches Schema auf welcher Seite?

| Seite                    | Schema-Typen                                          |
|--------------------------|-------------------------------------------------------|
| Alle Seiten              | `BreadcrumbList`                                      |
| Startseite               | `Organization`, `WebSite`, `LocalBusiness`            |
| Erlebnisse (Übersicht)   | `ItemList`                                            |
| Erlebnisse (Unterseite)  | `CreativeWork` oder `Service`                         |
| Blog (Übersicht)         | `Blog`                                                |
| Blog (Artikel)           | `Article`, `Person` (Autor)                           |
| Lösungen-Unterseiten     | `Service`                                             |
| Kontakt                  | `LocalBusiness` (mit Freiburg-Adresse!)               |
| FAQ-Abschnitte           | `FAQPage`                                             |
| Testimonials-Abschnitte  | `AggregateRating`                                     |

### BreadcrumbList (Pflicht, via Helper)

```astro
import { generateBreadcrumbSchema } from '../lib/seo';

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://www.plasticsurf.de/' },
  { name: 'Seitenname', url: 'https://www.plasticsurf.de/pfad' },
]);
```

```astro
<script type="application/ld+json" set:html={breadcrumbSchema} />
```

### Service-Schema (Lösungen-Unterseiten)

Jede Lösungs-Unterseite bekommt **zusätzlich zum BreadcrumbList** ein Service-Schema.

```astro
const serviceSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Service-Name, z. B. Performance Audit & KI-Fahrplan]",
  "provider": { "@type": "Organization", "name": "PlasticSurf" },
  "areaServed": "Freiburg im Breisgau",
  "description": "[1 Satz, Primary Keyword natürlich eingebaut]"
});
```

```astro
<script type="application/ld+json" set:html={serviceSchema} />
```

**Beispiel (der-performance-audit.astro):**
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Performance Audit & KI-Fahrplan",
  "provider": { "@type": "Organization", "name": "PlasticSurf" },
  "areaServed": "Freiburg im Breisgau",
  "description": "Digitale Standortbestimmung: Daten, Kanäle und Performance in einem klaren Lagebild – mit priorisierten Handlungsempfehlungen."
}
```

---

### LocalBusiness (Kontakt + Startseite)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "PlasticSurf",
  "description": "Kreativagentur aus Freiburg – eCommerce, Verpackungsdesign, Marketing & WebDesign",
  "url": "https://www.plasticsurf.de",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Freiburg im Breisgau",
    "addressRegion": "Baden-Württemberg",
    "addressCountry": "DE"
  },
  "areaServed": "Freiburg im Breisgau"
}
```

---

## 7. Technisches SEO

| Punkt           | Status / Regel                                                  |
|-----------------|-----------------------------------------------------------------|
| Canonical       | Auto via `Astro.url` im BaseLayout ✅                           |
| Sitemap         | Astro `@astrojs/sitemap` prüfen — alle Seiten gelistet?         |
| robots.txt      | `/public/robots.txt` vorhanden? `Disallow` korrekt gesetzt?     |
| URL-Struktur    | Deutsch, Bindestriche, Keywords enthalten (z. B. `/erlebnisse`) |
| Interne Links   | Keine Orphan Pages — jede Seite mind. 2× intern verlinkt        |
| Core Web Vitals | Hero-Bilder mit `loading="eager"`, Rest `loading="lazy"`        |
| HTTPS           | Pflicht, canonical immer mit `https://`                         |

---

## 8. Blog-Frontmatter (MDX-Pflichtfelder)

```yaml
---
title: "Der vollständige Titel des Beitrags"
metaTitle: "Primary Keyword – Kreativagentur Freiburg (max. 45 Z. → wird zu 60 im SERP)"
metaDescription: "Freiburg zuerst: Beschreibung (148–160 Zeichen, Primary-Keyword + CTA)"
date: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
author: "Vorname Nachname"
category: "Business"
tags: ["Kreativagentur", "Freiburg", "Strategie"]
featuredImage: "/images/blog/keyword-beschreibung-cover.webp"
featuredImageAlt: "Beschreibender Alt-Text (max. 125 Zeichen, Keyword natürlich einbauen)"
excerpt: "Kurze Zusammenfassung (plain text) – für Blog-Index, RelatedPosts und SEO-Fallback"
lead: |
  Erster Absatz der Einleitung – HTML-fähig.
readingTime: 8
authorBio: "Kurzbiografie des Autors"
authorAvatar: "/images/avatar-vorname.webp"
authorSocial:
  email: "email@plasticsurf.de"
  linkedin: "https://linkedin.com/in/profil"
---
```

### Interne Links im Blog
```md
[Aussagekräftiger Linktext](/pfad/zur-seite)
```
- 3–6 interne Links pro Artikel, im Fließtext platziert
- Nie: „hier klicken", „mehr erfahren" ohne Kontext

---

## 9. SEO-Checkliste vor Go-live einer neuen Seite

- [ ] `title` gesetzt (50–60 Z., Primary Keyword + Freiburg + PlasticSurf)
- [ ] `description` gesetzt (148–160 Z., Freiburg am Anfang, CTA)
- [ ] `image` (OG) seitenspezifisch gesetzt (1200 × 630 px WebP, via canvas-design Skill generiert)
- [ ] Genau eine H1 (Eyebrow mit Primary Keyword)
- [ ] H2 trägt Secondary Keyword
- [ ] Alle `<a>`-Tags haben `title`-Attribut
- [ ] Alle Bilder haben beschreibenden `alt`-Text
- [ ] `BreadcrumbList` Schema eingebunden
- [ ] Seitenspezifisches Schema eingebunden (ItemList / Article / Service etc.)
- [ ] Mind. 2 interne Links auf diese Seite von anderen Seiten
- [ ] Dateinamen SEO-optimiert (keine Umlaute, Bindestriche)
