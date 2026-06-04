import { onRequestPost as signup } from "../functions/api/signup.js";
import { onRequestPost as feedback } from "../functions/api/feedback.js";
import { onRequestPost as sendInvite } from "../functions/api/send-invite.js";
import { onRequestPost as adminAuth } from "../functions/api/admin/auth.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST") {
      if (url.pathname === "/api/signup")       return signup({ request, env });
      if (url.pathname === "/api/feedback")     return feedback({ request, env });
      if (url.pathname === "/api/send-invite")  return sendInvite({ request, env });
      if (url.pathname === "/api/admin/auth")   return adminAuth({ request, env });
    }

    return env.ASSETS.fetch(request);
  },
};
