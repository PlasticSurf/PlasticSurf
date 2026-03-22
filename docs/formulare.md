# Formulare – PlasticSurf

Verbindliche Regeln für alle Kontaktformulare auf der Website.

---

## 1. Architektur (Stand: März 2026)

**Ein einheitliches System** für alle 7 Formulare:

```
Browser → POST /api/kontakt → Turnstile-Validierung → Brevo HTTP API → mk@plasticsurf.de
```

| Baustein | Aufgabe |
|----------|---------|
| `src/pages/api/kontakt.ts` | API-Endpoint (serverseitig, Astro SSR) |
| Cloudflare Turnstile | Spam-Schutz (unsichtbar, DSGVO-konform, kein Cookie) |
| Brevo HTTP API v3 | E-Mail-Versand an mk@plasticsurf.de |

> ⚠️ **Kein nodemailer/SMTP** – Vercel blockiert ausgehende SMTP-Verbindungen (Port 587). Stattdessen Brevo HTTP API per `fetch()`.

---

## 2. Pflicht: astro.config.mjs

```js
export default defineConfig({
  site: 'https://www.plasticsurf.de',
  output: 'static',
  adapter: vercel({ functionPerRoute: false, edgeMiddleware: false }),
  security: {
    checkOrigin: false  // ⚠️ PFLICHT – ohne das blockiert Astro alle POST-Requests mit 403
  },
  // ...
});
```

> Astro's eingebauter CSRF-Schutz (`checkOrigin`) liefert 403 mit `"Cross-site POST form submissions are forbidden"` wenn diese Option fehlt. CSRF-Schutz übernimmt Turnstile.

---

## 3. Zwei Formular-Komponenten

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

**Felder:** Name · E-Mail · Nachricht · Datenschutz-Checkbox · Turnstile-Widget

---

### Typ B – ContactForm (5 Felder)
Wird nur auf der **Kontakt-Seite** (`/kontakt`) verwendet.

**Komponente:** `src/components/forms/ContactForm.astro`

```astro
<ContactForm formName="kontakt-kontaktseite" />
```

**Felder:** Name · E-Mail · Firma · Telefon · Nachricht · Datenschutz-Checkbox · Turnstile-Widget

---

## 4. API-Endpoint `/api/kontakt.ts`

```typescript
export const prerender = false;  // SSR innerhalb statischer Site

export async function POST({ request }) {
  const data = await request.formData();

  // 1. Turnstile-Token validieren
  const token = data.get('cf-turnstile-response');
  const turnstileOk = await validateTurnstile(token);
  if (!turnstileOk) return new Response(JSON.stringify({ error: 'Spam' }), { status: 400 });

  // 2. Felder auslesen
  const seite = data.get('seite');
  const name = data.get('name');
  const email = data.get('email');
  // ...

  // 3. E-Mail senden via Brevo HTTP API
  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': import.meta.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender:      { name: 'PlasticSurf Website', email: import.meta.env.MAIL_FROM },
      to:          [{ email: import.meta.env.MAIL_TO }],
      replyTo:     { email },
      subject:     `[${seite}] Neue Anfrage – ${name}`,
      textContent: lines,
    }),
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```

---

## 5. Cloudflare Turnstile

Spam-Schutz ohne Cookie, DSGVO-konform, für den Nutzer unsichtbar.

```html
<!-- Widget (wird automatisch von beiden Formular-Komponenten eingebunden) -->
<div class="cf-turnstile" data-sitekey={sitekey} data-theme="dark"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

Das Token wird beim Submit automatisch als `cf-turnstile-response`-Feld an den Server gesendet und dort serverseitig validiert.

---

## 6. Umgebungsvariablen

### `.env` (lokal, nie committen)

```env
# Cloudflare Turnstile
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAACudnOwMrg-AvR0d
TURNSTILE_SECRET_KEY=0x4AAAAAACudnD2yCvygVMSIv5_2hIPCM60

# Brevo HTTP API
BREVO_API_KEY=xkeysib-...
MAIL_FROM=mk@plasticsurf.de
MAIL_TO=mk@plasticsurf.de
```

### Vercel Environment Variables (Produktion)

| Variable | Beschreibung |
|---|---|
| `BREVO_API_KEY` | Brevo API Key (xkeysib-...) |
| `MAIL_FROM` | Absender-Adresse |
| `MAIL_TO` | Empfänger-Adresse |
| `PUBLIC_TURNSTILE_SITE_KEY` | Öffentlich (Browser) |
| `TURNSTILE_SECRET_KEY` | Server only |
| `GOOGLE_ANALYTICS_ID` | GA4 Measurement ID |

---

## 7. Formular-Tracking (Seiten-Markierung)

Jedes Formular enthält ein verstecktes `seite`-Feld. Der Wert landet in der E-Mail-Betreffzeile:

```html
<input type="hidden" name="seite" value="kontakt-performance-audit" />
```

→ Betreff der E-Mail: `[kontakt-performance-audit] Neue Anfrage – Max Mustermann`

---

## 8. Naming-Konvention für formName / seite

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

## 9. Alle Seiten mit Formular

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

## 10. KontaktSection – Props Referenz

| Prop | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `formName` | `string` | ✅ | Tracking-Wert im `seite`-Hidden-Field |
| `headline` | `string` | ✅ | H2 links (font-primary, 50px, font-black) |
| `subline` | `string` | ✅ | Subline links (font-secondary, gold, 24px) |
| `text` | `string` | ✅ | Fließtext links. Absätze mit `\n\n` trennen |
| `placeholder` | `string` | ❌ | Textarea-Placeholder. Default: "Wo spüren Sie aktuell den größten Widerstand?" |

---

## 11. Diagnose-Checkliste bei Formular-Fehlern

| Symptom | Ursache | Fix |
|---|---|---|
| `"Cross-site POST form submissions are forbidden"` (403) | Astro `checkOrigin` | `security: { checkOrigin: false }` in astro.config.mjs |
| Verbindungsfehler, Brevo nie aufgerufen | SMTP statt HTTP API | Brevo HTTP API verwenden (kein nodemailer) |
| 403, Function läuft 7ms, keine External APIs | Vercel Auth Middleware | Vercel Authentication deaktivieren + Redeploy |
| Brevo „Zuletzt verwendet: --" | Code wird nie erreicht | Response-Body im Network-Tab prüfen |

> **Wichtigster Diagnoseschritt:** Browser DevTools → Network → Request anklicken → **"Antwort"-Tab** → Response-Body lesen.
