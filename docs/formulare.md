# Formulare – PlasticSurf

Verbindliche Regeln für alle Kontaktformulare auf der Website.

---

## 1. Architektur (Stand: März 2026)

**Ein einheitliches System** für alle 7 Formulare:

```
Browser → POST /api/kontakt → Turnstile-Validierung → Nodemailer → mk@plasticsurf.de
```

| Baustein | Aufgabe |
|----------|---------|
| `src/pages/api/kontakt.ts` | API-Endpoint (serverseitig, Astro SSR) |
| Cloudflare Turnstile | Spam-Schutz (unsichtbar, DSGVO-konform, kein Cookie) |
| Nodemailer + Brevo SMTP | E-Mail-Versand an mk@plasticsurf.de |

> ⚠️ **Vorher:** Typ A = Netlify Forms, Typ B = Formspree — beide abgelöst.

---

## 2. Zwei Formular-Komponenten

### Typ A – KontaktSection (3 Felder)
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

**Felder:** Name · E-Mail · Nachricht · Turnstile-Widget (unsichtbar)

---

### Typ B – ContactForm (5 Felder)
Wird nur auf der **Kontakt-Seite** (`/kontakt`) verwendet.

**Komponente:** `src/components/forms/ContactForm.astro`

```astro
<ContactForm formName="kontakt-kontaktseite" />
```

**Felder:** Name · E-Mail · Firma · Telefon · Nachricht · Datenschutz-Checkbox · Turnstile-Widget

---

## 3. API-Endpoint `/api/kontakt.ts`

```typescript
export const prerender = false;  // SSR innerhalb statischer Site

export async function POST({ request }) {
  const data = await request.formData();

  // 1. Turnstile-Token validieren
  const token = data.get('cf-turnstile-response');
  const turnstileOk = await validateTurnstile(token);
  if (!turnstileOk) return new Response(JSON.stringify({ error: 'Spam' }), { status: 400 });

  // 2. Felder auslesen (seite-Feld für Tracking)
  const seite = data.get('seite');
  const name = data.get('name');
  const email = data.get('email');
  // ...

  // 3. E-Mail senden via Nodemailer → Brevo SMTP
  await transporter.sendMail({
    from: `"PlasticSurf" <mk@plasticsurf.de>`,
    to: 'mk@plasticsurf.de',
    subject: `[${seite}] Neue Anfrage – ${name}`,
    text: `...`,
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```

---

## 4. Cloudflare Turnstile

Spam-Schutz ohne Cookie, DSGVO-konform, für den Nutzer unsichtbar.

```html
<!-- Widget (wird automatisch von beiden Formular-Komponenten eingebunden) -->
<div class="cf-turnstile" data-sitekey={sitekey} data-theme="dark"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

Das Token wird beim Submit automatisch als `cf-turnstile-response`-Feld an den Server gesendet und dort serverseitig validiert.

---

## 5. SMTP-Konfiguration (Brevo)

| Variable | Wert |
|----------|------|
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Brevo-Login (aus `.env`) |
| `SMTP_PASS` | Brevo SMTP API Key (aus `.env`) |
| `SMTP_FROM` | `mk@plasticsurf.de` |
| `SMTP_TO` | `mk@plasticsurf.de` |

Alle SMTP-Variablen liegen in `.env` (nie committen). Brevo: 300 Mails/Tag kostenlos, EU-Server, DSGVO-konform.

---

## 6. Formular-Tracking (Seiten-Markierung)

Jedes Formular enthält ein verstecktes `seite`-Feld. Der Wert landet in der E-Mail-Betreffzeile:

```html
<input type="hidden" name="seite" value="kontakt-performance-audit" />
```

→ Betreff der E-Mail: `[kontakt-performance-audit] Neue Anfrage – Max Mustermann`

---

## 7. Naming-Konvention für formName / seite

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

## 8. Alle Seiten mit Formular

| Seite | Typ | formName |
|---|---|---|
| `/` | A – KontaktSection | `kontakt-startseite` |
| `/loesungen` | A – KontaktSection | `kontakt-loesungen` |
| `/loesungen/der-performance-audit` | A – KontaktSection | `kontakt-performance-audit` |
| `/loesungen/der-wachstums-motor` | A – KontaktSection | `kontakt-wachstums-motor` |
| `/loesungen/das-digitale-vermaechtnis` | A – KontaktSection | `kontakt-digitales-vermaechtnis` |
| `/loesungen/das-brand-experience-system` | A – KontaktSection | `kontakt-brand-experience` |
| `/kontakt` | B – ContactForm | `kontakt-kontaktseite` |

---

## 9. KontaktSection – Props Referenz

| Prop | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `formName` | `string` | ✅ | Tracking-Wert im `seite`-Hidden-Field |
| `headline` | `string` | ✅ | H2 links (font-primary, 50px, font-black) |
| `subline` | `string` | ✅ | Subline links (font-secondary, gold, 24px) |
| `text` | `string` | ✅ | Fließtext links. Absätze mit `\n\n` trennen |
| `placeholder` | `string` | ❌ | Textarea-Placeholder. Default: "Wo spüren Sie aktuell den größten Widerstand?" |

---

## 10. Installation (einmalig)

```bash
npm install nodemailer @astrojs/vercel@8
npm install @types/nodemailer -D
```

> ⚠️ `@astrojs/vercel@8` — nicht `@latest` (v10+ erfordert Astro v6).

---

## 11. Umgebungsvariablen (.env)

```env
# Cloudflare Turnstile
PUBLIC_TURNSTILE_SITE_KEY=0x...    # Öffentlich (Browser)
TURNSTILE_SECRET_KEY=0x...         # Server only

# SMTP via Brevo
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...                      # Brevo SMTP Login
SMTP_PASS=...                      # Brevo SMTP API Key
SMTP_FROM=mk@plasticsurf.de
SMTP_TO=mk@plasticsurf.de
```
