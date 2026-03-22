# Lösungen-Unterseiten – Vorlage & Richtlinien

Verbindliche Vorlage für alle 4 Lösungs-Unterseiten. Der Aufbau kann variieren – `der-performance-audit.astro` dient als Referenz, nicht als Pflicht-Struktur.

---

## URL-Mapping

| Seite | URL | formName |
|---|---|---|
| Der Performance Audit | `/loesungen/der-performance-audit` | `kontakt-performance-audit` |
| Der Wachstums-Motor | `/loesungen/der-wachstums-motor` | `kontakt-wachstums-motor` |
| Das Digitale Vermächtnis | `/loesungen/das-digitale-vermaechtnis` | `kontakt-digitales-vermaechtnis` |
| Das Brand Experience System | `/loesungen/das-brand-experience-system` | `kontakt-brand-experience` |

---

## Seiten-Struktur (Reihenfolge)

```
1. Hero (HeroZone + Hero-Komponente)        ← eyebrow H1, headline H2, subline, Einleitung, CTA
2. Sektion 1                                ← H2 + Subline + Fließtext, section-padding
3. Sektion 2                                ← H2 + Subline + Text + 3-Spalten-Grid, section-padding
4. Sektion 3                                ← H2 + Subline + langer Fließtext, section-padding
5. Sektion 4 (mittig)                       ← H2 + Subline + 3 Absätze links im zentrierten Container, section-padding-lg
6. KontaktSection                           ← außerhalb HeroZone, section-padding-lg
```

---

## Vollständige Astro-Vorlage

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { generateBreadcrumbSchema } from '../../lib/seo';
import Hero from '../../components/global/Hero.astro';
import HeroZone from '../../components/global/HeroZone.astro';
import KontaktSection from '../../components/global/KontaktSection.astro';

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://www.plasticsurf.de/' },
  { name: 'Lösungen', url: 'https://www.plasticsurf.de/loesungen' },
  { name: '[Seitenname]', url: 'https://www.plasticsurf.de/loesungen/[slug]' },
]);

const serviceSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Service-Name]",
  "provider": { "@type": "Organization", "name": "PlasticSurf" },
  "areaServed": "Freiburg im Breisgau",
  "description": "[Kurzbeschreibung der Leistung, 1 Satz]"
});
---

<BaseLayout
  title="[Primary Keyword] – PlasticSurf Freiburg"
  description="Kreativagentur Freiburg: [148–160 Zeichen, Keyword + CTA]"
  image="/images/[slug]-og.webp"
>
  <script type="application/ld+json" set:html={breadcrumbSchema} />
  <script type="application/ld+json" set:html={serviceSchema} />

  <HeroZone backgroundImage={{
    desktop: '/images/[slug]-hero-desktop.webp',
    tablet:  '/images/[slug]-hero-tablet.webp',
    mobile:  '/images/[slug]-hero-mobile.webp',
  }}>
    <Hero
      eyebrow="[Primary Keyword – entspricht URL-Slug]"
      headline="[Visuell dominante H2-Headline]"
      subline="[Gold-Subline, 1 Zeile]"
      layout="left"
    >
      <p class="reveal reveal-delay-200 mt-8 font-body text-base text-text/80 leading-relaxed max-w-3xl">
        [Einleitungstext – 3–5 Sätze Body-Text]
      </p>
      <a
        href="#kontakt"
        title="[Leistung] anfragen – PlasticSurf Freiburg"
        class="reveal reveal-delay-400 btn-primary mt-10 inline-flex items-center gap-2"
      >
        [CTA-Text]
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </a>
    </Hero>

    <!-- Sektion 1: [Titel] -->
    <section class="section-padding bg-background">
      <div class="container-custom">
        <div class="max-w-3xl">
          <h2 class="reveal font-primary text-[3.125rem] font-black leading-tight mb-1">[H2]</h2>
          <p class="reveal reveal-delay-100 font-secondary text-2xl text-[#927350] mb-8">[Subline]</p>
          <p class="reveal reveal-delay-200 font-body text-base text-text/80 leading-relaxed">
            [Fließtext]
          </p>
        </div>
      </div>
    </section>

    <!-- Sektion 2: [Titel] + 3 Spalten -->
    <section class="section-padding bg-background border-t border-white/5">
      <div class="container-custom">
        <div class="max-w-3xl mb-12">
          <h2 class="reveal font-primary text-[3.125rem] font-black leading-tight mb-1">[H2]</h2>
          <p class="reveal reveal-delay-100 font-secondary text-2xl text-[#927350] mb-8">[Subline]</p>
          <p class="reveal reveal-delay-200 font-body text-base text-text/80 leading-relaxed">
            [Intro-Text vor Grid]
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div class="reveal reveal-delay-100">
            <h3 class="font-primary text-2xl font-black text-text mb-1">[H3 Spalte 1]</h3>
            <p class="font-secondary text-base text-[#927350] mb-4">[Subline Spalte 1]</p>
            <p class="font-body text-base text-text/80 leading-relaxed">[Text Spalte 1]</p>
          </div>
          <div class="reveal reveal-delay-200">
            <h3 class="font-primary text-2xl font-black text-text mb-1">[H3 Spalte 2]</h3>
            <p class="font-secondary text-base text-[#927350] mb-4">[Subline Spalte 2]</p>
            <p class="font-body text-base text-text/80 leading-relaxed">[Text Spalte 2]</p>
          </div>
          <div class="reveal reveal-delay-300">
            <h3 class="font-primary text-2xl font-black text-text mb-1">[H3 Spalte 3]</h3>
            <p class="font-secondary text-base text-[#927350] mb-4">[Subline Spalte 3]</p>
            <p class="font-body text-base text-text/80 leading-relaxed">[Text Spalte 3]</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sektion 3: [Titel] -->
    <section class="section-padding bg-background border-t border-white/5">
      <div class="container-custom">
        <div class="max-w-3xl">
          <h2 class="reveal font-primary text-[3.125rem] font-black leading-tight mb-1">[H2]</h2>
          <p class="reveal reveal-delay-100 font-secondary text-2xl text-[#927350] mb-8">[Subline]</p>
          <p class="reveal reveal-delay-200 font-body text-base text-text/80 leading-relaxed">
            [Langer Fließtext – Ergebnis/Nutzen]
          </p>
        </div>
      </div>
    </section>

    <!-- Sektion 4: Zielgruppe (mittig) -->
    <section class="section-padding-lg bg-background border-t border-white/5">
      <div class="container-custom">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="reveal font-primary text-[3.125rem] font-black leading-tight mb-1">[H2]</h2>
          <p class="reveal reveal-delay-100 font-secondary text-2xl text-[#927350] mb-8">[Subline]</p>
          <div class="reveal reveal-delay-200 font-body text-base text-text/80 leading-relaxed space-y-4 text-left">
            <p>[Absatz 1]</p>
            <p>[Absatz 2]</p>
            <p>[Absatz 3]</p>
          </div>
        </div>
      </div>
    </section>

  </HeroZone>

  <KontaktSection
    formName="kontakt-[seitenname]"
    headline="[Leistung] anfragen."
    subline="[Kurze, prägnante Subline]"
    text="[Fließtext links neben dem Formular]"
  />

</BaseLayout>
```

---

## Bilder-Checkliste pro Seite

| Datei | Größe | Pfad |
|---|---|---|
| Hero Desktop | 1920 × 1080 px | `public/images/[slug]-hero-desktop.webp` |
| Hero Tablet | 1024 × 768 px | `public/images/[slug]-hero-tablet.webp` |
| Hero Mobile | 768 × 1200 px | `public/images/[slug]-hero-mobile.webp` |
| OG-Image | 1200 × 630 px | `public/images/[slug]-og.webp` |

**ALT-Text-Schema:** `"[Leistungsname] – [Kurzbeschreibung] für Unternehmen in Freiburg"` (max. 125 Zeichen)

**OG-Image erstellen:** Python/Pillow + canvas-design Skill → siehe `docs/seo-richtlinien.md` Abschnitt „OG-Images".

---

## SEO-Pflichtfelder

| Feld | Regel |
|---|---|
| `title` | 50–60 Z. · `[Primary Keyword] – PlasticSurf Freiburg` |
| `description` | 148–160 Z. · beginnt mit „Kreativagentur Freiburg:" |
| `image` | Seitenspezifisches OG-Bild, nie Fallback |
| Eyebrow (H1) | Primary Keyword = URL-Slug-Kern |
| `formName` | `kontakt-[seitenname]` (siehe `docs/formulare.md`) |
| JSON-LD | `BreadcrumbList` + `Service` |

---

## Interne Links

Nach Fertigstellung aller 4 Lösungsseiten: **3–6 interne Links** im Fließtext ergänzen.
Sinnvolle Ziele pro Seite: `/loesungen` · `/die-dna` · `/kontakt` · andere Lösungsseiten.
→ Ohne interne Links gilt die Seite als SEO-unvollständig.

---

## Typografie-Regeln (Kurzfassung)

| Element | Klassen |
|---|---|
| H2 Sektion | `font-primary text-[3.125rem] font-black leading-tight mb-1` |
| Subline | `font-secondary text-2xl text-[#927350] mb-8` |
| H3 Karte | `font-primary text-2xl font-black text-text mb-1` |
| Subline Karte | `font-secondary text-base text-[#927350] mb-4` |
| Fließtext | `font-body text-base text-text/80 leading-relaxed` |
| Sektionsabstand | `section-padding` (regulär) · `section-padding-lg` (Sektion 4 + Kontakt) |
| Intro-Abstand vor Grid | `mb-12` |
