# Hosting, Deployment & Analytics – PlasticSurf

---

## 1. Hosting: Vercel

Plattform: **Vercel** (Hobby Plan)
Auto-Deploy: Push auf `main` → Vercel baut und deployt automatisch
Region: `fra1` (Frankfurt, DSGVO-konform)
Repo: GitHub `PlasticSurf/PlasticSurf`

### Adapter-Konfiguration (`astro.config.mjs`)

```javascript
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',           // nicht 'hybrid' — in Astro v5 entfernt
  adapter: vercel({
    functionPerRoute: false,
    edgeMiddleware: false,
  }),
  // ...
});
```

> ⚠️ **Versionskompatibilität:** `@astrojs/vercel@8` für Astro v5.
> `@astrojs/vercel@10+` erfordert Astro v6 — nicht installieren.

### API-Endpoints (SSR innerhalb statischer Site)

Astro erlaubt einzelne serverseitige Endpoints in einer sonst statischen Site:

```typescript
// src/pages/api/kontakt.ts
export const prerender = false;  // Diese Datei wird nicht vorgerendert
```

Alle anderen Seiten bleiben statisch. Nur Dateien mit `export const prerender = false` laufen als Serverless Function.

### Git-Authentifizierung (macOS, einmalig)

Für `git push` via HTTPS auf macOS mit 2FA muss GitHub CLI eingerichtet sein:

```bash
brew install gh
gh auth login  # Browser-Flow folgen, HTTPS wählen
```

Danach funktioniert `git push` ohne Passwort-Prompt.

### Deployment-Workflow

```bash
git add datei.astro
git commit -m "Kurzbeschreibung der Änderung"
git push
# → Vercel deployt automatisch (ca. 1–2 Min.)
```

### Limits (Hobby Plan)

| Ressource | Limit | Relevant für PlasticSurf |
|-----------|-------|--------------------------|
| Bandwidth | 100 GB/Monat | Ausreichend (B2B-Site) |
| Serverless Executions | 100.000/Monat | Ausreichend (Formulare) |
| Build Minutes | 6.000/Monat | Ausreichend |

**Bilder und statische Assets** liegen in GitHub (unter `public/`) — kein separater CDN nötig. Videos: extern via YouTube einbetten.

### Benötigte npm-Pakete (Formular-System)

```bash
npm install nodemailer @astrojs/vercel@8
npm install @types/nodemailer -D
```

> ⚠️ Immer `@astrojs/vercel@8` — nicht `@latest`, da v10+ Astro v6 voraussetzt.

---

## 2. Sitemap & robots.txt

### Sitemap (`@astrojs/sitemap`)

Integration ist in `astro.config.mjs` eingetragen und generiert beim Build automatisch:
- `https://www.plasticsurf.de/sitemap-index.xml` — Index-Datei
- `https://www.plasticsurf.de/sitemap-0.xml` — alle URLs der Website (aktuell ~103)

**Kein manuelles Pflegen nötig** — jede neue Seite erscheint automatisch beim nächsten Deploy.

In Google Search Console eintragen: `Sitemaps → https://www.plasticsurf.de/sitemap-index.xml`

### robots.txt (`/public/robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://www.plasticsurf.de/sitemap-index.xml
```

Alle Crawler sind erlaubt. Die Datei liegt unter `public/robots.txt` und wird von Vercel automatisch unter `/robots.txt` ausgeliefert. Google liest sie selbstständig — kein Upload nötig.

### 404-Seite (`src/pages/404.astro`)

Astro und Vercel erkennen `src/pages/404.astro` automatisch als Custom-Error-Page. Die Seite zeigt:
- Große "404"-Zahl in Primärfarbe
- Headline + Subline auf Deutsch
- CTAs zur Startseite und zu Erlebnissen
- Die 3 neuesten Blog-Posts als Orientierungshilfe

---

## 3. Google Analytics

**ID:** `G-5GD5V55QDF`
**Komponente:** `src/components/analytics/GoogleAnalytics.astro`

GA wird **nur nach Cookie-Zustimmung** geladen — nie automatisch:

```javascript
// Beim Laden prüfen (Rückkehr auf Seite / neuer Tab)
if (localStorage.getItem('cookie-consent') === 'accepted') {
  loadGA();
}

// Im selben Tab nach Zustimmung (Custom Event vom CookieBanner)
window.addEventListener('cookie-consent-accepted', loadGA);
```

> ⚠️ **Wichtig:** `localStorage`-Events feuern **nicht** im selben Tab.
> Deshalb verwendet `CookieBanner.astro` ein Custom DOM Event (`cookie-consent-accepted`), kein `storage`-Event.

---

## 3. Cookie Banner (`src/components/global/CookieBanner.astro`)

### Verhalten

| Zustand | Anzeige |
|---------|---------|
| Kein Eintrag in `localStorage` | Banner erscheint nach 1s Delay |
| `cookie-consent: 'accepted'` | Banner versteckt, GA geladen, Widerruf-Button sichtbar |
| `cookie-consent: 'declined'` | Banner versteckt, GA nicht geladen, Widerruf-Button sichtbar |

### Storage Key

```javascript
localStorage.setItem('cookie-consent', 'accepted');  // oder 'declined'
```

### Widerruf

Kleiner Button „Cookie-Einstellungen" erscheint nach Entscheidung unten rechts (`fixed bottom-4 right-4`). Klick entfernt den localStorage-Eintrag und zeigt den Banner erneut.

### Custom Event (wichtig!)

```javascript
// CookieBanner.astro — bei Akzeptieren:
window.dispatchEvent(new CustomEvent('cookie-consent-accepted'));

// GoogleAnalytics.astro — hört darauf:
window.addEventListener('cookie-consent-accepted', loadGA);
```

---

## 4. Env-Variablen (`.env`)

```env
# Google Analytics
GOOGLE_ANALYTICS_ID=G-5GD5V55QDF

# Cloudflare Turnstile (Formulare)
PUBLIC_TURNSTILE_SITE_KEY=0x...    # Öffentlich (Browser)
TURNSTILE_SECRET_KEY=0x...         # Server only

# SMTP via Brevo (Formulare)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=mk@plasticsurf.de
SMTP_TO=mk@plasticsurf.de
```

> `.env` wird **nie** committet — liegt in `.gitignore`.
> Auf Vercel die gleichen Variablen unter **Project Settings → Environment Variables** eintragen.
