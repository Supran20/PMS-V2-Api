import helmet from "helmet";

// CORP must be cross-origin: the Next.js frontend (different origin) loads
// images from /uploads. HSTS is left at the default; browsers ignore it over
// plain HTTP, so it only takes effect once the API is served over HTTPS.
export const securityMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});