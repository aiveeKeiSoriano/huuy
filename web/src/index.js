import { onRequestPost as signup } from "../functions/api/signup.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/signup" && request.method === "POST") {
      return signup({ request, env });
    }

    return env.ASSETS.fetch(request);
  },
};
