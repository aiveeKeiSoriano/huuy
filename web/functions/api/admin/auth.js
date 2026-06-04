export async function onRequestPost(context) {
  const { request, env } = context;

  let password;
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!password) {
    return json({ error: "Password required" }, 400);
  }

  if (password !== env.ADMIN_PASSWORD) {
    return json({ error: "Unauthorized" }, 401);
  }

  return json({ ok: true }, 200);
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
