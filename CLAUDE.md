# PlasticSurf – KI Richtlinien für Claude

Lies zu Beginn jeder Session folgende Dateien vollständig:

1. `README.md` — Design-System, Typografie, Farben, Bildgrößen, Projektstruktur
2. `docs/seo-richtlinien.md` — SEO-Pflichtfelder, Keywords, Headings, Link-Titel, Structured Data, OG-Images, Checkliste
3. `docs/hero-system.md` — Hero-Komponenten
4. `docs/blog-mdx-vorlage.md` — Blog-Struktur und Komponenten
5. `docs/formulare.md` — Formular-Architektur (Astro API + Nodemailer + Brevo + Turnstile), formName-Konventionen, KontaktSection-Props
6. `docs/loesungen-unterseiten-vorlage.md` — Vollständige Vorlage für Lösungs-Unterseiten, Bilder-Checkliste, SEO-Pflichtfelder
7. `docs/hosting-analytics.md` — Vercel-Deployment, Google Analytics, Cookie Banner, Env-Variablen

---

## Wichtigste Regeln (Kurzfassung)

### Texte
Originaltexte **exakt unverändert** übernehmen — kein Wort ändern, nichts kürzen, keine Umformulierung. Fehler dem Nutzer vorlegen, nicht eigenständig korrigieren.

### Tailwind-Einheiten
- Schriftgrößen → immer `rem` (Tailwind-Standardklassen bevorzugen), nie `px`
- Zeilenabstand → immer unitless (`leading-tight`, `leading-relaxed` etc.), nie `px` oder `rem`

### Farben
| Name | Hex | Verwendung |
|------|-----|------------|
| `background` | #080D19 | Seiten-Hintergrund |
| `primary` | #FF4E56 | CTAs, Akzente, Eyebrow-Labels |
| `text` | #E0D8D2 | Fließtext auf dunkel |

### Schriften
| Klasse | Font | Verwendung |
|--------|------|------------|
| `font-primary` | Montserrat Alternates | Alle Überschriften |
| `font-secondary` | Playfair Display | Lead, Zitate, Sublines |
| `font-body` | Roboto | Fließtext |

### Typografie-Muster (verbindlich)
```html
<p class="font-secondary text-primary text-sm uppercase tracking-widest mb-2">Eyebrow</p>
<h2 class="font-primary text-[3.125rem] font-black leading-tight mb-1">Headline</h2>
<p class="font-secondary text-2xl text-[#927350] mb-8">Subline</p>
```

### Bilder
- Format: `.webp`, Qualität 80–85%
- Dateinamen: `keyword-beschreibung.webp` (Kleinbuchstaben, Bindestriche, keine Umlaute)

| Bereich | Größe |
|---------|-------|
| Erlebnisse Large (Bento, 2 Spalten) | 1680 × 1200 px |
| Erlebnisse Medium (Bento, 1 Spalte) | 840 × 1200 px |
| Erlebnisse Slider-Karte | 600 × 720 px |
| Blog Cover / OG | 1200 × 630 px |
| Hero-Hintergrund | 1920 × 1080 px |

Erlebnisse-Bilder immer in `public/images/erlebnisse/` ablegen.

### Container & Abstände
- `container-custom` = `max-w-screen-2xl` (1536px), `mx-auto`, mit Padding
- `section-padding` = `py-16 md:py-24`

### DSGVO
- Keine Google Fonts CDN — Fonts kommen ausschließlich via `@fontsource` (lokal)
- `@import` in `global.css` muss **vor** `@tailwind` stehen

### Astro-Hinweise
- Variablen in `<script>`-Tags auf oberster Ebene deklarieren, nicht in Funktionen
- Scroll-Container: Parent auf `overflow-x: clip` setzen, nicht `overflow-hidden`
- Kommentare in MDX: `{/* */}` — kein `<!-- -->`
- `<p>` Tags in MDX immer einzeilig schreiben
