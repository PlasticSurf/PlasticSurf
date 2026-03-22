# Formulare – PlasticSurf

Verbindliche Regeln für alle Kontaktformulare auf der Website.

---

## 1. Zwei Formular-Typen

### Typ A – KontaktSection (Netlify, 3 Felder)
Wird auf allen **Inhaltsseiten** verwendet: Startseite, Lösungen-Übersicht, jede Lösungs-Unterseite.

**Komponente:** `src/components/global/KontaktSection.astro`

```astro
<KontaktSection
  formName="kontakt-[seitenname]"
  headline="Headline links"
  subline="Subline links (gold)"
  text="Fließtext links. Mehrere Absätze mit \n\n trennen."
  placeholder="Optional: Textarea-Placeholder"
/>
```

**Felder:** Name · E-Mail · Nachricht

---

### Typ B – ContactForm (Formspree, 5 Felder)
Wird nur auf der **Kontakt-Seite** (`/kontakt`) verwendet.

**Komponente:** `src/components/forms/ContactForm.astro`

```astro
<ContactForm formName="kontakt-kontaktseite" />
```

**Felder:** Name · E-Mail · Firma · Telefon · Nachricht · Datenschutz-Checkbox

---

## 2. Formular-Tracking (Seitenmarkierung)

Jedes Formular hat zwei Tracking-Mechanismen:

### Netlify (Typ A)
Das `name`-Attribut auf `<form>` erzeugt **automatisch einen separaten Posteingang** im Netlify-Dashboard. Kein Plugin, kein Extra-Setup nötig.

```html
<form name="kontakt-performance-audit" data-netlify="true">
```
→ Im Dashboard unter **Forms → kontakt-performance-audit** sichtbar.

Zusätzlich enthält jedes Formular ein verstecktes Tracking-Feld:
```html
<input type="hidden" name="seite" value="kontakt-performance-audit" />
```
→ Steht in jedem Eintrag als eigene Spalte. Nützlich für Exports und Webhooks.

### Formspree (Typ B)
Der `_subject`-Header enthält den Seitennamen. Zusätzlich `seite`-Hidden-Field:
```html
<input type="hidden" name="_subject" value="[kontakt-kontaktseite] Neue Kontaktanfrage" />
<input type="hidden" name="seite" value="kontakt-kontaktseite" />
```

---

## 3. Naming-Konvention für formName

| Seite | formName |
|---|---|
| Startseite `/` | `kontakt-startseite` |
| Lösungen-Übersicht `/loesungen` | `kontakt-loesungen` |
| Der Performance Audit | `kontakt-performance-audit` |
| Der Wachstums-Motor | `kontakt-wachstums-motor` |
| Das Digitale Vermächtnis | `kontakt-digitales-vermaechtnis` |
| Das Brand Experience System | `kontakt-brand-experience` |
| Kontakt-Seite `/kontakt` | `kontakt-kontaktseite` |

**Regel:** Immer `kontakt-` als Präfix · Kleinbuchstaben · Bindestriche · keine Umlaute.

---

## 4. Alle Seiten mit Formular (aktueller Stand)

| Seite | Typ | formName | KontaktSection | Tracking |
|---|---|---|---|---|
| `/` | A – Netlify | `kontakt-startseite` | ✅ | ✅ |
| `/loesungen` | A – Netlify | `kontakt-loesungen` | ✅ | ✅ |
| `/loesungen/der-performance-audit` | A – Netlify | `kontakt-performance-audit` | ✅ | ✅ |
| `/loesungen/der-wachstums-motor` | A – Netlify | `kontakt-wachstums-motor` | ✅ | ✅ (einbauen) |
| `/loesungen/das-digitale-vermaechtnis` | A – Netlify | `kontakt-digitales-vermaechtnis` | ✅ | ✅ (einbauen) |
| `/loesungen/das-brand-experience-system` | A – Netlify | `kontakt-brand-experience` | ✅ | ✅ (einbauen) |
| `/kontakt` | B – Formspree | `kontakt-kontaktseite` | — | ✅ |

---

## 5. KontaktSection – Props Referenz

| Prop | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `formName` | `string` | ✅ | Netlify-Formularname + seite-Tracking-Wert |
| `headline` | `string` | ✅ | H2 links (font-primary, 50px, font-black) |
| `subline` | `string` | ✅ | Subline links (font-secondary, gold, 24px) |
| `text` | `string` | ✅ | Fließtext links. Absätze mit `\n\n` trennen |
| `placeholder` | `string` | ❌ | Textarea-Placeholder. Default: "Wo spüren Sie aktuell den größten Widerstand?" |
