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

### Deployment-Workflow

```
git add ...
git commit -m "..."
git push
→ Vercel deployt automatisch (ca. 1–2 Min.)
```

### Limits (Hobby Plan)

| Ressource | Limit | Relevant für PlasticSurf |
|-----------|-------|--------------------------|
| Bandwidth | 100 GB/Monat | Ausreichend (B2B-Site) |
| Serverless Executions | 100.000/Monat | Ausreichend (Formulare) |
| Build Minutes | 6.000/Monat | Ausreichend |

**Bilder und statische Assets** liegen in GitHub (unter `public/`) — kein separater CDN nötig. Videos: extern via YouTube einbetten.

---

## 2. Google Analytics

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
