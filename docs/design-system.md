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
