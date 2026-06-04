export async function onRequestPost(context) {
  const { request, env } = context;

  const PLAY_STORE_LINK =
    "https://play.google.com/store/apps/details?id=com.huuy";
  const TESTING_LINK = "https://play.google.com/apps/testing/com.huuy";

  let password, email;
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!password || !email) {
    return json({ error: "All fields are required" }, 400);
  }

  if (!/.+@.+\..+/.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  if (password !== env.ADMIN_PASSWORD) {
    return json({ error: "Unauthorized" }, 401);
  }

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;">
  <div style="max-width:520px;margin:0 auto;padding:40px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="background-color:#333f58;border-radius:20px;padding:36px 32px;color:#fbbbad;">
      <img src="https://huuy.aiveekei.com/public/text-logo.png" alt="huuy" width="96" style="display:block;margin:0 0 28px;" />
      <h1 style="font-size:24px;color:#ee8695;margin:0 0 16px;">You're in!</h1>
      <p style="font-size:16px;line-height:1.7;margin:0 0 28px;opacity:0.85;">
        Thanks for joining the Huuy closed beta. Huuy is a simple one-time reminder alarm —
        no accounts, no clutter, just a single reminder for your temporary thoughts. Remembered and trashed.
      </p>
      <a href="${PLAY_STORE_LINK}" style="display:block;border:none;text-align:center;">
        <img src="https://huuy.aiveekei.com/public/install-from-gps.png" alt="Install on Google Play" width="300" style="display:block;margin:0 auto;" />
      </a>
      <p style="font-size:12px;margin:16px 0 0;line-height:1.6;color:#fbbbad;opacity:0.8;">
        Or copy this link to your browser:<br />
        <a href="${PLAY_STORE_LINK}" style="word-break:break-all;color:#ee8695;text-decoration:none;">${PLAY_STORE_LINK}</a>
      </p>
      <hr style="border:none;border-top:1px solid rgba(251,187,173,0.15);margin:24px 0;" />
      <p style="font-size:13px;margin:0 0 12px;line-height:1.6;color:#fbbbad;opacity:0.85;">
        Make sure you are signed in to your browser using <a href="mailto:${email}" style="color:#ee8695;text-decoration:none;">${email}</a> before opening the link.
      </p>
      <p style="font-size:13px;margin:0 0 12px;line-height:1.6;color:#fbbbad;opacity:0.85;">
        Once you install, you must stay opted in to the closed test for at least
        <strong style="color:#fbbbad;opacity:1;">14 consecutive days</strong> for your participation to count.
      </p>
      <p style="font-size:13px;margin:0;line-height:1.6;color:#fbbbad;opacity:0.85;">
        If you'd like to open the app page on the web instead, use this link:<br />
        <a href="${TESTING_LINK}" style="color:#ee8695;word-break:break-all;">${TESTING_LINK}</a>
      </p>
      <hr style="border:none;border-top:1px solid rgba(251,187,173,0.15);margin:24px 0;" />
      <p style="font-size:13px;margin:0 0 12px;line-height:1.6;color:#fbbbad;opacity:0.85;">
        Tried the app? We'd love to hear what you think.
      </p>
      <a href="https://huuy.aiveekei.com/feedback.html" style="display:inline-block;border:none;">
        <img src="https://huuy.aiveekei.com/public/leave-feedback.png" alt="Leave Feedback" width="160" style="display:block;" />
      </a>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Huuy <contact@aiveekei.com>",
        to: [email],
        subject: "You're in — Huuy Beta",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return json({ error: "Failed to send email" }, 500);
    }
  } catch (err) {
    console.error("Resend fetch failed:", err?.message ?? err);
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
