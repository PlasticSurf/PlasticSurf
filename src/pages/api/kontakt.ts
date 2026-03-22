export const prerender = false;

import type { APIRoute } from 'astro';

async function validateTurnstile(token: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: import.meta.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });
  const data = await res.json();
  return data.success === true;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    // Turnstile validieren
    const token = data.get('cf-turnstile-response') as string;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Sicherheitsprüfung fehlgeschlagen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const valid = await validateTurnstile(token);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Spam-Schutz fehlgeschlagen. Bitte Seite neu laden.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Felder auslesen
    const seite     = (data.get('seite')     as string) || 'unbekannt';
    const name      = (data.get('name')      as string) || '';
    const email     = (data.get('email')     as string) || '';
    const company   = (data.get('company')   as string) || '';
    const phone     = (data.get('phone')     as string) || '';
    const nachricht = (data.get('nachricht') as string) || (data.get('message') as string) || '';

    if (!name || !email || !nachricht) {
      return new Response(JSON.stringify({ error: 'Pflichtfelder fehlen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // E-Mail-Text aufbauen
    const lines = [
      `Von: ${name}`,
      `E-Mail: ${email}`,
      company   ? `Firma: ${company}`   : null,
      phone     ? `Telefon: ${phone}`   : null,
      `Seite: ${seite}`,
      ``,
      `Nachricht:`,
      nachricht,
    ].filter(Boolean).join('\n');

    // Brevo HTTP API
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

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      console.error('Brevo Fehler:', brevoRes.status, errBody);
      return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Kontaktformular Fehler:', err);
    return new Response(JSON.stringify({ error: 'Server-Fehler. Bitte versuche es später nochmal.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
