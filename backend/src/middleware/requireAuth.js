import { auth } from "../config/auth.js";
import { fromNodeHeaders } from "better-auth/node";

/**
 * Validates the session cookie / Bearer token from the request.
 * Attaches req.user and req.session on success.
 */
export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
