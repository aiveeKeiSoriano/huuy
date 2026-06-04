import { EmailMessage } from "cloudflare:email";

export async function onRequestPost(context) {
  const { request, env } = context;

  let email, feedback;
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim() : "";
    feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!email || !/.+@.+\..+/.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  if (!feedback) {
    return json({ error: "Feedback is required" }, 400);
  }

  const from = "contact@aiveekei.com";
  const to = "aiveekei@gmail.com";

  const raw = [
    `From: Huuy <${from}>`,
    `To: ${to}`,
    `Subject: Huuy Feedback`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    `New feedback from: ${email}\n\n${feedback}`,
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
