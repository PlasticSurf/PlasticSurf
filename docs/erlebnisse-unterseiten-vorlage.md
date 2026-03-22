# Erlebnisse Unterseiten – Vorlage & Workflow

Erarbeitet auf Basis der Testseite **Ahoj-Brause** (`/erlebnisse/ahoj-brause-brause`).
Dieses Dokument ist die verbindliche Vorlage für alle 22 Erlebnisse-Unterseiten.

---

## Seitenstruktur (von oben nach unten)

```
1. Hero-Bild          ← <picture> flexibel, natürliche Höhe, kein Overlay
2. Breadcrumb         ← Haus-Icon / Erlebnisse / Seitenname (text-xs, kein Border)
3. Zweispalter        ← Links: Bilder | Rechts: Eyebrow + H1 + Absatz + H2 + Absatz
4. Galerie-Sektion    ← H2 + Einleitungstext + Bilder-Grid (1–3 Spalten)
5. ErlebnisCTA        ← Komponente, immer gleich
```

---

## Astro-Datei Vorlage

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { generateBreadcrumbSchema } from '../../lib/seo';
import ErlebnisCTA from '../../components/global/ErlebnisCTA.astro';

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://www.plasticsurf.de/' },
  { name: 'Erlebnisse', url: 'https://www.plasticsurf.de/erlebnisse' },
  { name: '[SEITENNAME]', url: 'https://www.plasticsurf.de/erlebnisse/[SLUG]' },
]);
---

<BaseLayout
  title="[SEO TITLE aus WP-Yoast] – PlasticSurf"
  description="[META DESCRIPTION aus WP-Yoast]"
  image="/images/erlebnisse/[SLUG]/[projektname]-[kategorie]-hero-desktop.webp"
  canonicalURL="https://www.plasticsurf.de/erlebnisse/[SLUG]/"
>
  <script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema)} />

  <!-- 1. Hero: flexibles Vollbild, natürliche Höhe -->
  <picture>
    <source media="(min-width: 1024px)" srcset="/images/erlebnisse/[SLUG]/[projektname]-[kategorie]-hero-desktop.webp" type="image/webp" />
    <source media="(min-width: 768px)"  srcset="/images/erlebnisse/[SLUG]/[projektname]-[kategorie]-hero-tablet.webp"  type="image/webp" />
    <img
      src="/images/erlebnisse/[SLUG]/[projektname]-[kategorie]-hero-mobile.webp"
      alt="[ALT TEXT – Marke + Projekt-Kontext]"
      class="w-full h-auto block"
      loading="eager"
    />
  </picture>

  <!-- 2. Breadcrumb -->
  <div class="bg-background">
    <div class="container-custom py-3">
      <nav aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 font-body text-xs text-text/50">
          <li>
            <a href="/" class="hover:text-primary transition-colors" aria-label="Startseite">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
              </svg>
            </a>
          </li>
          <li class="text-text/30">/</li>
          <li><a href="/erlebnisse" class="hover:text-primary transition-colors">Erlebnisse</a></li>
          <li class="text-text/30">/</li>
          <li class="text-text/70">[KURZNAME]</li>
        </ol>
      </nav>
    </div>
  </div>

  <!-- 3. Zweispalter -->
  <section class="section-padding bg-background">
    <div class="container-custom">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        <!-- Linke Spalte: Bilder (gestapelt) -->
        <div class="flex flex-col gap-6">
          <img
            src="/images/erlebnisse/[SLUG]/[BILD-1].webp"
            alt="[ALT TEXT]"
            class="w-full reveal"
            loading="eager"
          />
          <!-- weitere Bilder mit reveal-delay-100, reveal-delay-200 etc. -->
        </div>

        <!-- Rechte Spalte: Text -->
        <div>
          <p class="reveal font-secondary text-primary text-sm uppercase tracking-widest mb-3">
            [KATEGORIE z.B. Marketing & Design]
          </p>
          <h1 class="reveal reveal-delay-100 font-primary text-[3.125rem] font-black leading-tight mb-6">
            [H1 – Seitentitel aus WP]
          </h1>
          <p class="reveal reveal-delay-200 font-body text-base text-text/80 leading-relaxed mb-10">
            [Erster Absatz aus WP]
          </p>
          <h2 class="reveal reveal-delay-300 font-primary text-3xl font-black leading-tight mb-4">
            [H2 – Zweiter Abschnitt aus WP]
          </h2>
          <p class="reveal reveal-delay-400 font-body text-base text-text/80 leading-relaxed">
            [Zweiter Absatz aus WP]
          </p>
          <!-- weitere H2 + P Paare wenn vorhanden -->
        </div>

      </div>
    </div>
  </section>

  <!-- 4. Galerie-Sektion (wenn weitere Bilder vorhanden) -->
  <section class="section-padding bg-background border-t border-text/5">
    <div class="container-custom">
      <h2 class="reveal font-primary text-3xl font-black leading-tight mb-6">
        [H2 Galerie-Titel]
      </h2>
      <p class="reveal reveal-delay-100 font-body text-base text-text/80 leading-relaxed mb-10 max-w-2xl">
        [Einleitungstext Galerie aus WP]
      </p>
      <!-- 2 Bilder nebeneinander – gleiche Höhe, kein Verzerren -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="aspect-[3/2] overflow-hidden reveal">
          <img src="/images/erlebnisse/[SLUG]/[BILD-A].webp" alt="[ALT]" class="w-full h-full object-cover" loading="lazy" />
        </div>
        <div class="aspect-[3/2] overflow-hidden reveal reveal-delay-100">
          <img src="/images/erlebnisse/[SLUG]/[BILD-B].webp" alt="[ALT]" class="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
      <!-- 3 Bilder: sm:grid-cols-3, gleiche Struktur -->
      <!-- Bilder mit reveal + reveal-delay-100/200 -->
    </div>
  </section>

  <!-- 5. CTA -->
  <ErlebnisCTA />

</BaseLayout>
```

---

## Typografie-Regeln (verbindlich)

| Element | Klassen |
|---|---|
| Eyebrow | `font-secondary text-primary text-sm uppercase tracking-widest` |
| H1 | `font-primary text-[3.125rem] font-black leading-tight` |
| H2 | `font-primary text-3xl font-black leading-tight` |
| Fließtext | `font-body text-base text-text/80 leading-relaxed` |
| Breadcrumb | `font-body text-xs text-text/50` |

**Reveal-Reihenfolge im Zweispalter:**
- Eyebrow: `reveal`
- H1: `reveal reveal-delay-100`
- Erster Absatz: `reveal reveal-delay-200`
- H2: `reveal reveal-delay-300`
- Zweiter Absatz: `reveal reveal-delay-400`

---

## Bilder-Workflow

### Ordnerstruktur
```
public/images/erlebnisse/[SLUG]/
  [projektname]-[kategorie]-hero-desktop.webp     ← 1920×1080px (aus WP-Bild croppen)
  [projektname]-[kategorie]-hero-tablet.webp      ← 1280×720px
  [projektname]-[kategorie]-hero-mobile.webp      ← 768×432px
  [projektname]-[kategorie]-[motiv].webp          ← Inhaltsbilder, max 1200px Breite, natürliche Proportion
```

### Download + Konvertierung (Node/Sharp)
```bash
# Bild vom alten WP-Server laden
curl -s -L "https://www.plasticsurf.de/wp-content/uploads/[PFAD]/[DATEI].jpg" -o "tmp.jpg"

# Mit Sharp konvertieren (im node_modules des Projekts)
node -e "
const sharp = require('./node_modules/sharp');
const dest = './public/images/erlebnisse/[SLUG]/';
// Hero-Größen – SEO-Dateinamen mit Projektname + Kategorie
sharp('tmp.jpg').resize(1920,1080,{fit:'cover',position:'center'}).webp({quality:82}).toFile(dest+'[projektname]-[kategorie]-hero-desktop.webp');
sharp('tmp.jpg').resize(1280,720,{fit:'cover',position:'center'}).webp({quality:82}).toFile(dest+'[projektname]-[kategorie]-hero-tablet.webp');
sharp('tmp.jpg').resize(768,432,{fit:'cover',position:'center'}).webp({quality:82}).toFile(dest+'[projektname]-[kategorie]-hero-mobile.webp');
// Inhaltsbild
sharp('tmp.jpg').resize(1200,null,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(dest+'[projektname]-[kategorie]-[motiv].webp');
"
```

### Dateinamen – SEO-Pflichtregeln

**Jeder Dateiname muss Projektname UND Kategorie enthalten – auch Hero-Bilder. Keine Ausnahmen.**

Generische Namen wie `hero-desktop.webp`, `BN-eCommerce-design-Marketing-Freiburg-1.jpg` oder `image001.jpg` sind nicht erlaubt.

- Kleinbuchstaben, Bindestriche, keine Umlaute (ä→ae, ö→oe, ü→ue)
- Schema: `[projektname]-[kategorie]-[motiv].webp`
- Hero-Schema: `[projektname]-[kategorie]-hero-[desktop|tablet|mobile].webp`
- Beispiele:
  - `dr-pepper-energy-marketing-hero-desktop.webp`
  - `ahoj-brause-marketing-hero-desktop.webp`
  - `kaffeeshop-24-ecommerce-shop-layout.webp`
  - `ahoj-brause-marketing-dose-display.webp`
  - `focuswater-webshop-produktseite.webp`

**Checkliste vor dem Einbinden:**
- [ ] Enthält der Dateiname den Projektnamen?
- [ ] Enthält der Dateiname die Kategorie (ecommerce / marketing / design / webshop / etc.)?
- [ ] Ist die Datei im WebP-Format?

### Format: Immer WebP – keine Ausnahmen

**Alle Bilder auf der Website müssen als `.webp` eingebunden werden.** JPG/PNG-Originaldateien dienen nur als Vorlage für die Konvertierung und werden nicht direkt referenziert.

- Qualität: 82 % (Hero und große Bilder), 80 % (Galerie)
- Inhaltsbilder: max. 1200 px Breite, natürliche Proportion (nicht beschneiden)

### ALT-Texte
- Immer aus dem Seitentext ableiten: `[Projektname] [Kategorie] [Motiv] – [Kontext aus Text]`
- Beispiele:
  - `KaffeeShop 24 eCommerce Shop Layout – B2B & B2C Plattform mit ERP-Anbindung`
  - `Ahoj-Brause Marketing Dose Display – Verkaufs-Display für die Markteinführung in Deutschland`

---

## SEO-Checkliste je Seite

| Feld | Quelle | Pflicht |
|---|---|---|
| `<title>` | `wpseo_title` oder `rank_math_title` aus XML | ✅ |
| `<meta description>` | `wpseo_metadesc` oder `rank_math_description` aus XML – **keine typografischen Anführungszeichen** `„"` im Attribut-Wert, da Astro diese als schließendes Quote interpretiert. Ersetzen durch gerade `"` oder weglassen. | ✅ |
| `canonicalURL` | `https://www.plasticsurf.de/erlebnisse/[SLUG]/` | ✅ |
| `image` (OG) | `/images/erlebnisse/[SLUG]/hero-desktop.webp` | ✅ |
| BreadcrumbList JSON-LD | `generateBreadcrumbSchema()` | ✅ |
| Hero-Bild `alt` | Marke + Projekt aus Seitentext | ✅ |
| Inhaltsbilder `alt` | Aus Seitentext generiert | ✅ |

---

## Bento-Kachel verlinken (`erlebnisse.astro`)

Wenn die Unterseite fertig ist, in `src/pages/erlebnisse.astro` die entsprechende Kachel verlinken:

```ts
// In featuredRefs[] oder smallRefs[]
{
  client: 'Ahoj-Brause',
  // ... bestehende Felder ...
  href: '/erlebnisse/[SLUG]',   // ← NEU hinzufügen
}
```

Die Render-Logik erkennt `href` automatisch und rendert die Kachel als `<a>` statt `<article>`.

---

## Komponenten

| Komponente | Pfad | Verwendung |
|---|---|---|
| `ErlebnisCTA` | `src/components/global/ErlebnisCTA.astro` | Immer am Ende jeder Unterseite. Props: `headline`, `subline` (optional, haben Defaults) |
| `BaseLayout` | `src/layouts/BaseLayout.astro` | Wrapper für alle Seiten. Props: `title`, `description`, `image`, `canonicalURL` |

---

## URL-Mapping: alle 22 Seiten

Alle Seiten liegen unter `src/pages/erlebnisse/`. WP-Slugs exakt übernehmen (keine Änderung!).

| WP-Titel | WP-Slug (= Astro-Dateiname ohne .astro) | Meta Description (aus Yoast/RankMath) | Bento-Bild | Status |
|---|---|---|---|---|
| Ahoj-Brause Brause | `ahoj-brause-brause` | Ich habe die Markteinführung von Ahoj-Brause in Deutschland begleitet. Entdecke mein Ahoj-Brause Marketing & Design. | ✅ | ✅ fertig |
| AriZona Eistee | `arizona-eistee-2` | AriZona Eistee - Ich habe die Kult Marke bei der Deutschland Markteinführung mit Design und Marketing begleitet | ✅ | ⬜ offen |
| Brands of Soul WebShop | `brands-of-soul-webshop` | Brands of Shop Shopware Shop beim Shop Usability Award 2015 | ✅ | ⬜ offen |
| Coffee To-Go Becher | `coffee-to-go-becher` | Designs und Marketing für Heißgetränkebecher in der Gastronomie, Doppelwandbecher aus Papier | ✅ | ⬜ offen |
| Dr Pepper Energy | `dr-pepper-energy` | Ich habe die Markteinführung von Dr Pepper Energy mit Marketing & Design begleitet | ✅ | ✅ fertig |
| Drinks & More WebShop | `drinks-and-more-webshop` | Ich habe Drinks and More mit Marketing, Design & eCommerce B2B, B2C unterstützt | ✅ | ⬜ offen |
| encarta Coffee Cup To-Go | `encarta-coffee-cup-to-go` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| FocusWater VitaminWasser | `focuswater-vitaminwasser` | Die Markteinführung von FocusWater in Deutschland: WebShop, Design, Produktfotos & Influencer Marketing | ✅ | ✅ fertig |
| KaffeeShop 24 Online Shop | `kaffeeshop-24-online-shop` | eCommerce B2B & B2C Lösung für KaffeeShop 24 – mit ERP & CRM-Anbindung, UX-Design, SEO, Online Marketing | ✅ | ⬜ offen |
| KaffeeShop 24 Corporate Design | `kaffeeshop-24-corporate-design` | Für KaffeeShop 24 habe ich eine Brand Strategie mit Corporate Identity & Design entwickelt | ❌ | ⬜ offen |
| KaffeeShop 24 Eco Verpackungen | `kaffeeshop-24-eco-kaffee-verpackungen` | Verpackungsdesign für den nachhaltigen Bio-Kaffee von KaffeeShop 24 – 100 % kompostierbar | ❌ | ⬜ offen |
| KaffeeShop 24 Klassische Werbung | `kaffeeshop-24-klassische-werbung` | *(leer – aus Text generieren)* | ❌ | ⬜ offen |
| Market Grounds WebShop | `market-grounds-webshop` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| one&only | `oneonly-2` | *(leer – aus Text generieren)* | ❌ | ⬜ offen |
| Simon Scheibe Konzert Plakate | `simon-scheibe-konzert-plakate` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| Snapple Limonade | `snapple-limonade` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| Soul of Cocoa Verpackungen | `soul-of-cocoa-verpackungen` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| Soul of Coffee Verpackungen | `soul-of-coffee-verpackungen` | *(leer – aus Text generieren)* | ❌ | ⬜ offen |
| Soul of Frappé Verpackungen | `soul-of-frappe-verpackungen` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| SyrienHilfe Flyer | `syrienhilfe-flyer` | *(leer – aus Text generieren)* | ✅ | ⬜ offen |
| Tee von Teahouse Exclusives | `tee-von-teahouse-exclusives` | Für Teahouse Exclusives habe ich eine animierte, mehrsprachige Website entwickelt | ✅ | ✅ fertig |
| TM LimousinenService Hamburg | `tm-limousinenservice-hamburg` | *(leer – aus Text generieren)* | ✅ | ✅ fertig |

> **Legende:** ✅ Bento-Bild = Übersichtsbild in `public/images/erlebnisse/` vorhanden | ❌ = fehlt noch
> Status ⬜ offen / ✅ fertig nach Abschluss der Seite aktualisieren.

### Bento-Bilder ohne passende WP-Unterseite
Diese Bilder sind im Bento-Grid aber haben **keine** eigene WP-Seite in der XML:
- `fiji-artesian-water-design-marketing.webp`
- `roses-juice-webdesign-marketing-design.webp`
- `syrienhilfe-webdesign-marketing-design.webp`
- `voss-artesian-water-markteinfuehrung-deutschland.webp`
- `wunderhand-vertriebsagentur-webdesign.webp`

→ Diese Kacheln bleiben vorerst ohne Link (`href` nicht setzen).

---

## Design-Entscheidungen aus dieser Session

- **H1 NICHT im Hero-Banner** – zu unruhig über dem Bild. H1 sitzt in der rechten Spalte des Zweispalters.
- **Erste H2 im Zweispalter entfällt** – würde direkt nach H1 auftauchen (schlechte Hierarchie). Ab dem zweiten Textabschnitt kommen H2s wieder.
- **Hero-Bild ohne feste Höhe** – `h-auto`, natürliche Proportionen. Nicht alle Bilder haben gleiche Maße.
- **HeroZone-Komponente wird nicht verwendet** – für Unterseiten wird ein einfaches `<picture>` direkt im Template genutzt (kein absolut-positioniertes Hintergrundbild das in Content-Bereiche blendet).
- **Breadcrumb ohne Trennlinie** – `border-b` entfernt, nur `py-3` Abstand.
- **Keine Ordner-Duplikate** – das Hero-Bild nicht nochmal in der linken Spalte zeigen.
- **CTA als Komponente** – `ErlebnisCTA.astro` mit Props `headline` und `subline` (mit Defaults). Texte können später zentral oder pro Seite angepasst werden.
- **Erstes Inhaltsbild ≠ Hero-Bild** – das erste Bild in der linken Spalte des Zweispalters darf nicht dasselbe sein wie das Hero-Bild. Immer ein anderes, inhaltlich passendes Bild wählen.
- **Bilder in Text-Sektionen sparsam einsetzen** – ein Bild das direkt zwischen Absatz und Bullet-Liste sitzt wirkt unruhig. Bilder besser in die Galerie-Sektion auslagern oder gar nicht einbinden.
- **Galerie kuratieren, nicht alles zeigen** – nicht jedes heruntergeladene Bild muss auf der Seite erscheinen. Qualität vor Quantität: lieber 2 starke Bilder als 4 mittelmäßige.
- **Hero-Bild aus WordPress oft identisch mit Bento-Kachel-Bild** – beim Laden der Bilder prüfen ob `hero-desktop.webp` und das erste Inhaltsbild nicht dasselbe Motiv haben.
- **Zwei Bilder nebeneinander – gleiche Höhe ohne Verzerrung** – `aspect-[3/2]`-Container mit `overflow-hidden` + `w-full h-full object-cover` auf dem `<img>`. Niemals `h-80 object-contain` verwenden (Bilder wirken dann zu klein und uneinheitlich). Aspect Ratio `3/2` passt für Landscape-Bilder; für Portrait `aspect-[1929/2560]` wie bei KaffeeShop 24.
- **Cursor bei verlinkten Slider-Kacheln** – `.ref-slider-card` setzt `cursor: default`. Bei `href`-Kacheln im Slider muss `style="cursor: pointer;"` direkt am `<a>`-Element gesetzt werden, sonst überschreibt `.ref-slider-card` die `.bento-card--link`-Regel.
