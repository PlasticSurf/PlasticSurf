# Hero-System

Dokumentation der zwei wiederverwendbaren Hero-Komponenten: `Hero.astro` und `HeroZone.astro`.

---

## Übersicht

| Komponente | Datei | Aufgabe |
|------------|-------|---------|
| `HeroZone` | `src/components/global/HeroZone.astro` | Äußerer Wrapper — steuert Hintergrundbild oder Dot-Grid-Textur |
| `Hero` | `src/components/global/Hero.astro` | H1 + Intro-Text + Scroll-Indikator |

**Grundmuster (alle Seiten):**

```astro
<HeroZone>
  <Hero headline="Titel" text="Einleitungstext." layout="left" />
  <!-- Sektion 1 (transparent, Hintergrund scheint durch) -->
  <!-- Sektion 2 (transparent, Hintergrund scheint durch) -->
</HeroZone>
<!-- Weitere Sektionen mit eigenem Hintergrund (außerhalb HeroZone) -->
```

---

## `HeroZone.astro`

Wrapper-Div (`hero-zone`) für den gemeinsamen Hintergrundbereich (Hero + Sektion 1 + Sektion 2).

### Props

```typescript
interface BgImage {
  desktop: string;   // WebP, ≥ 1024px
  tablet?: string;   // WebP, ≥ 768px (Fallback: desktop)
  mobile?: string;   // WebP, < 768px (Fallback: desktop)
  alt?: string;
}

interface Props {
  backgroundImage?: BgImage | string;  // optional
  class?: string;
}
```

### Variante A: Kein Hintergrundbild (Standard)

Rendert ein subtiles Dot-Grid-Muster (via `::before`-Pseudoelement), das nach unten ausblendet.

```astro
<HeroZone>
  <Hero ... />
</HeroZone>
```

### Variante B: Hintergrundbild (responsiv)

```astro
<HeroZone backgroundImage={{
  desktop: '/images/seite-hero-desktop.webp',
  tablet:  '/images/seite-hero-tablet.webp',
  mobile:  '/images/seite-hero-mobile.webp',
}}>
  <Hero ... />
</HeroZone>
```

Auch als einfacher String möglich (nur Desktop):

```astro
<HeroZone backgroundImage="/images/hero.webp">
```

### Hintergrundbild-Verhalten

- Technisch: `<picture>`-Element mit `<source media>` für WebP + Responsive
- `object-none object-top`: Bild wird in Originalgröße, oben ausgerichtet dargestellt
- Klasse `hero-zone--image` wird automatisch gesetzt, wenn ein Bild vorhanden ist
- Sektionen innerhalb der HeroZone erhalten automatisch transparenten Hintergrund:
  ```css
  .hero-zone--image > .relative > section { background-color: transparent; }
  ```
  → Sektionen mit `bg-background` (solid) würden das Bild verdecken — diese Regel verhindert das.

### Bildgrößen-Empfehlung

| Variante | Größe | Breakpoint |
|----------|-------|------------|
| Desktop | 1920 × 1080 px | ≥ 1024px |
| Tablet | 1024 × 768 px | ≥ 768px |
| Mobile | 768 × 1200 px | < 768px |

Alle Bilder als `.webp`, stark komprimiert (Hero < 400 KB).

---

## `Hero.astro`

Vollbild-Hero-Sektion (min-h-screen) mit H1, optionalem Intro-Text und Scroll-Indikator.

### Props

```typescript
interface Props {
  eyebrow?: string;                    // Kleines Label über H1 (text-primary, uppercase, tracking-widest)
  headline: string;                    // H1 — unterstützt HTML via set:html
  subline?: string;                    // Subline unter H1 (font-secondary, gold #927350)
  text?: string;                       // Einleitungstext (font-secondary, größer)
  layout?: 'centered' | 'left';        // Default: 'centered'
  class?: string;
}
// <slot /> — optionale Zusatzinhalte (z. B. CTA-Buttons)
```

### Schriftgrößen

> ⚠️ **REGEL: Immer Tailwind-Standardklassen verwenden.**
> Schriftgrößen in **rem** (`text-xl`, `text-7xl` …), Zeilenabstand als **unitless Multiplikator** (`leading-snug`, `leading-tight` …).
> Arbitrary Values (`text-[…]`) nur wenn kein passender Tailwind-Standard existiert — dann immer in **rem**, nie in `px`.

| Breakpoint | H1 | Tailwind-Klasse | Intro-Text | Tailwind-Klasse |
|------------|----|-----------------|------------|-----------------|
| Mobile (< 768px) | 3rem / ~48px | `text-5xl` | 1.125rem | `text-lg` |
| Tablet (≥ 768px) | 4.5rem / 72px | `md:text-7xl` | 1.5rem | `md:text-2xl` |
| Desktop (≥ 1024px) | 6.25rem / ~100px | `lg:text-[6.25rem]` | 2.125rem | `lg:text-[2.125rem]` |

- H1: `font-heading` (Montserrat Alternates) · `font-black` (900) · `leading-[0.9]` (unitless, kein Standard < 1)
- Intro: `font-secondary` (Playfair Display) · `leading-snug` (unitless 1.375)

### Layout-Varianten

| Wert | Verhalten |
|------|-----------|
| `centered` (Standard) | `max-w-5xl mx-auto text-center` |
| `left` | `max-w-5xl` (linksbündig) |

### Mit HTML im Headline (Farbakzent)

```astro
<Hero
  headline='Technologie ohne Charakter ist <span class="text-primary">wertlos</span>'
  text="Einleitungstext..."
/>
```

### Mit CTA-Buttons via Slot

```astro
<Hero headline="Titel" text="Text">
  <div class="reveal reveal-delay-400 flex flex-col sm:flex-row gap-4 justify-center mt-16">
    <a href="/loesungen" class="btn-primary">Lösungen entdecken</a>
    <a href="/kontakt" class="btn-secondary">Kontakt aufnehmen</a>
  </div>
</Hero>
```

> `mt-16` (4rem / 64px) — Abstand zwischen Intro-Text und Buttons. Nicht `mt-8`.

### Scroll-Indikator

Chevron-Down-Icon, animiert (bounce). Automatisch sichtbar auf Tablet und Desktop (`hidden md:flex`), auf Mobile versteckt.

CSS-Animation: `.scroll-chevron` in `global.css`.

---

## Seiten-Übersicht

| Seite | HeroZone | Desktop | Tablet | Mobile | Layout |
|-------|----------|---------|--------|--------|--------|
| `index.astro` | ✅ | `startseite-hero-desktop.webp` | `startseite-hero-tablet.webp` | `startseite-hero-mobile.webp` | centered |
| `loesungen/index.astro` | ✅ | `loesungen-hero-desktop.webp` | `loesungen-hero-tablet.webp` | `loesungen-hero-mobile.webp` | left |
| `die-dna.astro` | ✅ | `die-dna-hero-desktop.webp` | `die-dna-hero-tablet.webp` | `die-dna-hero-mobile.webp` | left |
| `erlebnisse.astro` | ✅ | `erlebnisse-hero-desktop.webp` | `erlebnisse-hero-tablet.webp` | `erlebnisse-hero-mobile.webp` | centered |
| `kontakt.astro` | ✅ | `kontakt-hero-desktop.webp` | `kontakt-hero-tablet.webp` | `kontakt-hero-mobile.webp` | left |
| `loesungen/der-performance-audit.astro` | ✅ | `performance-audit-hero-desktop.webp` | `performance-audit-hero-tablet.webp` | `performance-audit-hero-mobile.webp` | left |
| `loesungen/der-wachstums-motor.astro` | ✅ | `wachstums-motor-hero-desktop.webp` | `wachstums-motor-hero-tablet.webp` | `wachstums-motor-hero-mobile.webp` | left |
| `loesungen/das-digitale-vermaechtnis.astro` | ✅ | `digitales-vermaechtnis-hero-desktop.webp` | `digitales-vermaechtnis-hero-tablet.webp` | `digitales-vermaechtnis-hero-mobile.webp` | left |
| `loesungen/das-brand-experience-system.astro` | ✅ | `brand-experience-hero-desktop.webp` | `brand-experience-hero-tablet.webp` | `brand-experience-hero-mobile.webp` | left |

Alle Bilder liegen unter `public/images/`.

---

## CSS (global.css)

```css
/* Wrapper */
.hero-zone { position: relative; overflow: hidden; }

/* Dot-Grid-Textur (nur ohne Bild) */
.hero-zone:not(.hero-zone--image)::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.04;
  mask-image: linear-gradient(to bottom, black 0%, black 40%, transparent 100%);
  pointer-events: none; z-index: 1;
}

/* Sektionen innerhalb HeroZone mit Bild: transparent */
.hero-zone--image > .relative > section { background-color: transparent; }

/* Scroll-Indikator */
@keyframes hero-scroll-bounce {
  0%, 100% { transform: translateY(0);   opacity: 0.4; }
  50%       { transform: translateY(7px); opacity: 0.65; }
}
.scroll-chevron { animation: hero-scroll-bounce 2.2s ease-in-out infinite; }
```

---

## Bekannte Fallstricke

### `@import` in global.css vor `@tailwind`

PostCSS verarbeitet `@import`-Regeln nur, wenn sie **ganz oben** in der CSS-Datei stehen.
Stehen sie nach `@tailwind base`, werden sie stillschweigend ignoriert — keine Fonts geladen.

```css
/* ✅ Richtig */
@import '@fontsource/montserrat-alternates/900.css';
@tailwind base;

/* ❌ Falsch — Font wird nicht geladen */
@tailwind base;
@import '@fontsource/montserrat-alternates/900.css';
```

Im lokalen Dev fällt das nicht auf, wenn die Schrift als System-Font installiert ist — in Produktion fehlt sie dann.

### Sektionen mit `bg-background` innerhalb HeroZone

Sektionen mit einem opaken Hintergrund (z.B. `bg-background`) verdecken das Hintergrundbild.
Lösung: Die CSS-Regel `.hero-zone--image > .relative > section { background-color: transparent; }` in `global.css` sorgt automatisch dafür. Nur für direkte Kind-Sektionen innerhalb des `div.relative.z-10`-Wrappers.

### `overflow: hidden` auf Parent blockiert Scroll

Wenn ein Scroll-Container (`overflow-x: auto`) innerhalb der HeroZone liegt, kein `overflow-hidden` am Parent verwenden — das blockiert den Scroll. Stattdessen `overflow-x: clip`.
