import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// API routes that don't require authentication
const PUBLIC_API_PATHS = ["/", "/api/users/login", "/api/users/register"];

export function authMiddleware(req, res, next) {
  const { path } = req;

  console.log("🔍 Middleware checking:", path);

  // ✅ Skip auth check for public APIs
  if (PUBLIC_API_PATHS.includes(path)) {
    console.log("✅ Public path/API, allowing access");
    return next();
  }

  // ✅ Get token from cookies or headers
  let cookieAuth = req.cookies?.authorization;

  if (cookieAuth) {
    cookieAuth = decodeURIComponent(cookieAuth);
  }

  const auth = cookieAuth;

  console.log("🔑 Auth value:", auth ? auth.substring(0, 20) + "..." : "none");

  if (!auth || !auth.startsWith("Bearer ")) {
    console.log("🚫 No valid auth token, redirecting to /login");
    return res.redirect("/login");
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified for:", decoded.email);

    // ✅ Attach user info to request headers (so frontend sees same structure)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    // Continue to next handler
    next();
  } catch (err) {
    console.log("🚫 Token verification failed:", err.message);
    return res.redirect("/login");
  }
}
