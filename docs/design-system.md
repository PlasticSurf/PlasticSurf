# PlasticSurf Design System

## Abstände & Layout

### Sektions-Padding

Alle Seiten verwenden einheitliche Abstände über CSS-Utility-Klassen, die in `src/styles/global.css` definiert sind.

| Klasse               | Mobile       | Desktop (md+) | Verwendung                                              |
|----------------------|--------------|---------------|---------------------------------------------------------|
| `section-padding`    | `py-16` (64px) | `py-24` (96px) | Standard – alle Sektionen                              |
| `section-padding-lg` | `py-32` (128px) | `py-40` (160px) | Schlüssel-Sektionen, die mehr Atemraum brauchen      |

**Regel:** Immer eine dieser beiden Klassen verwenden – nie manuell `py-*` auf Sektionsebene setzen.

| Sektionstyp                          | Klasse               |
|--------------------------------------|----------------------|
| Reguläre Inhalt-Sektionen            | `section-padding`    |
| CTA / Kontakt / letzte Seiten-Sektion | `section-padding-lg` |
| Synthese / Schlüssel-Aussagen        | `section-padding-lg` |

```html
<!-- Reguläre Sektion -->
<section class="section-padding bg-background">

<!-- CTA / Kontakt / Schlüssel-Sektion -->
<section class="section-padding-lg bg-background">
```

---

### Container

| Klasse             | Definition                                      | Verwendung           |
|--------------------|-------------------------------------------------|----------------------|
| `container-custom` | `max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8` | Alle Inhalts-Wrapper |

```html
<div class="container-custom">
  <!-- Inhalt -->
</div>
```

---

### Interne Abstände (innerhalb einer Sektion)

| Tailwind-Klasse | Wert     | Verwendung                                          |
|-----------------|----------|-----------------------------------------------------|
| `mb-1`          | 4px      | Zwischen H2 und Subline                             |
| `mb-8`          | 32px     | Zwischen Subline und Fließtext                      |
| `mb-12`         | 48px     | Kleiner Abstand unter Einleitungstext               |
| `mb-40`         | 160px    | Großer Abstand zwischen Intro-Block und Kacheln     |
| `mt-40`         | 160px    | Abstand über abschließenden Übergangs-Absätzen      |
| `gap-8`         | 32px     | Standard Grid-Gap                                   |
| `gap-12`        | 48px     | Grid-Gap für größere Abstände (z. B. Footer-Spalten)|

---

### Typografie-Hierarchie

| Element        | Klasse                                                  |
|----------------|---------------------------------------------------------|
| H1 / Hero      | `font-primary text-[3.125rem] font-black leading-tight` |
| H2 Sektion     | `font-primary text-[3.125rem] font-black leading-tight` |
| Subline        | `font-secondary text-2xl text-[#927350]`                |
| Fließtext      | `font-body text-base text-text/80 leading-relaxed`      |
| Label / Tag    | `font-secondary text-primary text-sm uppercase tracking-widest` |

---

### Farben

| Token         | Hex       | Verwendung                    |
|---------------|-----------|-------------------------------|
| `background`  | `#080D19` | Seitenhintergrund             |
| `primary`     | `#FF4E56` | Akzentfarbe, CTAs, Links      |
| `text`        | `#E0D8D2` | Fließtext                     |
| `subline`     | `#927350` | Sublines, Highlights          |

---

### Border-Radius

| Klasse | Wert | Verwendung |
|--------|------|------------|
| `rounded-md` | 6px | Buttons (`btn-primary`, `btn-secondary`), Formularfelder |
| `rounded-lg` | 8px | Karten, Boxen, Bild-Container, Panels |
| `rounded-xl` | 12px | Größere Boxen (z.B. CTA-Komponente) |
| `rounded-full` | 9999px | Kreisförmige Elemente (Icons, Dots, Scroll-Buttons) |

**Regel:** Für interaktive Boxen und Content-Panels immer `rounded-lg`. Für Buttons immer `rounded-md` (automatisch via `btn-primary`/`btn-secondary`).

---

### Buttons

Alle Buttons verwenden die Utility-Klassen `btn-primary` oder `btn-secondary` aus `src/styles/global.css`. **Keine eigenen Button-Styles** inline definieren.

#### `btn-primary` — Primär-Button (gefüllt)

```html
<a href="/kontakt" class="btn-primary">Text</a>
<!-- oder mit Icon -->
<a href="/kontakt" class="btn-primary inline-flex items-center gap-2">
  Text
  <svg .../>
</a>
<!-- als Span (wenn innerhalb eines <a>-Tags) -->
<span class="btn-primary inline-flex items-center gap-2">Text</span>
```

Styles: `bg-primary text-white px-6 py-3 rounded-md font-heading font-semibold transition-all duration-200 hover:bg-primary/90 hover:shadow-lg`

#### `btn-secondary` — Sekundär-Button (Outline)

```html
<a href="/erlebnisse" class="btn-secondary">Text</a>
```

Styles: `border-2 border-primary text-primary px-6 py-3 rounded-md font-heading font-semibold transition-all duration-200 hover:bg-primary hover:text-white`

#### Wichtig: `<a>`-Tags und Hover-Opacity

Globaler Style in `global.css`: `a { hover:opacity-80 }`. Wenn ein Button oder Panel vollständig als `<a>` umgesetzt ist und die Opacity-Reduktion unerwünscht ist, `hover:opacity-100` als Utility-Klasse ergänzen:

```html
<a href="..." class="block ... hover:opacity-100">...</a>
```

---

### Footer – Soziale Medien

**Aktiv:** LinkedIn (Icon-Link, `aria-label` + `title` beide gesetzt)
**Nicht vorhanden:** Instagram — wurde entfernt (kein aktiver Account)

```astro
<!-- Komponente: src/components/global/Footer.astro -->
<a href="https://linkedin.com/..." target="_blank" rel="noopener noreferrer"
   aria-label="PlasticSurf auf LinkedIn"
   title="PlasticSurf auf LinkedIn">
  <svg ...>LinkedIn-Icon</svg>
</a>
```

> Kein Facebook, kein Twitter/X, kein Instagram. Neue Plattformen hier eintragen und die tatsächliche Profil-URL verwenden.
