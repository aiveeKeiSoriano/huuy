import { EmailMessage } from "cloudflare:email";

export async function onRequestPost(context) {
  const { request, env } = context;

  let email;
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!email || !/.+@.+\..+/.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  const from = "contact@aiveekei.com";
  const to = "aiveekei@gmail.com";

  const raw = [
    `From: Huuy <${from}>`,
    `To: ${to}`,
    `Subject: New Huuy Beta Signup`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    `New beta signup request:\n\n${email}\n\nAdd them to the Google Play closed testing list.`,
  ].join("\r\n");

  const encoded = new TextEncoder().encode(raw);
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(encoded);
      c.close();
    },
  });

  try {
    await env.EMAIL.send(new EmailMessage(from, to, stream));
  } catch (err) {
    console.error("Email send failed:", err?.message ?? err);
    return json({ error: "Failed to send email" }, 500);
  }

  return json({ ok: true }, 200);
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
