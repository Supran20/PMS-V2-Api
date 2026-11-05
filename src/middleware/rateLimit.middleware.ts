import { Request } from "express";
import { rateLimit, ipKeyGenerator, Options } from "express-rate-limit";
import ApiError from "./error-handlers/ApiError";
import { sendError } from "./error-handlers/sendError";

const MINUTE = 60 * 1000;

// Read lazily (limit accepts a function) so the value is picked up after
// dotenv.config() has run, regardless of import order.
const envInt = (name: string, fallback: number) => () => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const createLimiter = (options: Partial<Options>) =>
  rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => process.env.RATE_LIMIT_DISABLED === "true",
    handler: (_req, res) => {
      sendError(res, ApiError.tooManyRequests());
    },
    ...options,
  });

const ipKey = (req: Request) => ipKeyGenerator(req.ip ?? "");

// IP + identifier (e.g. email): limits brute force on one account without
// locking out everyone behind a shared office IP.
const identifierKey = (req: Request, field: string) => {
  const raw = req.body?.[field] ?? req.query?.[field];
  const id =
    typeof raw === "string" ? raw.trim().toLowerCase().slice(0, 254) : "";
  return id ? `${ipKey(req)}|${id}` : ipKey(req);
};

// Authenticated routes: key by user so a whole studio on one IP isn't throttled together.
const userKey = (req: Request) => {
  const userId = (req as Request & { user?: { id?: string | number } }).user
    ?.id;
  return userId ? `user:${userId}` : ipKey(req);
};

export const globalLimiter = createLimiter({
  windowMs: MINUTE,
  limit: envInt("RATE_LIMIT_GLOBAL_MAX", 120),
  keyGenerator: ipKey,
});

export const loginLimiter = createLimiter({
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => identifierKey(req, "email"),
});

export const verifyOtpLimiter = createLimiter({
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => identifierKey(req, "email"),
});

// Sends email/SMS, so it is the strictest one.
export const resendOtpLimiter = createLimiter({
  windowMs: 10 * MINUTE,
  limit: 3,
  keyGenerator: (req) => identifierKey(req, "email"),
});

export const refreshLimiter = createLimiter({
  windowMs: 15 * MINUTE,
  limit: 30,
  keyGenerator: ipKey,
});

export const uploadLimiter = createLimiter({
  windowMs: 10 * MINUTE,
  limit: 20,
  keyGenerator: userKey,
});

export const adminLimiter = createLimiter({
  windowMs: MINUTE,
  limit: 60,
  keyGenerator: userKey,
});
