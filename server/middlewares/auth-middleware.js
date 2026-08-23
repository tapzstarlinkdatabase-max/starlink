const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const AuthSession = require("../models/auth-session-model");

const COOKIE_NAME = "starlink_session";
const SESSION_DAYS = Math.max(
  1,
  Number.parseInt(process.env.SESSION_DAYS || "7", 10),
);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const readCookie = (req, name) => {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return "";
};

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure:
    process.env.AUTH_COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
});

const clearAuthCookie = (res) => {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(COOKIE_NAME, options);
};

const createAuthSession = async (res, { role, clientId = null }) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  );

  await AuthSession.create({
    tokenHash: hashToken(token),
    role,
    clientId,
    expiresAt,
  });

  res.cookie(COOKIE_NAME, token, cookieOptions());
};

const destroyAuthSession = async (req, res) => {
  const token = readCookie(req, COOKIE_NAME);
  if (token) {
    await AuthSession.deleteOne({ tokenHash: hashToken(token) });
  }
  clearAuthCookie(res);
};

const loadAuth = async (req) => {
  if (req.auth !== undefined) return req.auth;

  const token = readCookie(req, COOKIE_NAME);
  if (!token) {
    req.auth = null;
    return null;
  }

  const session = await AuthSession.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!session) {
    req.auth = null;
    return null;
  }

  req.auth = {
    role: session.role,
    clientId: session.clientId ? String(session.clientId) : null,
  };
  return req.auth;
};

const requireClientAccess = async (req, res, next) => {
  try {
    const auth = await loadAuth(req);
    if (!auth) {
      return res.status(401).json({
        message: "Please log in before editing this profile.",
      });
    }

    if (
      auth.role !== "admin" &&
      String(auth.clientId) !== String(req.params.id)
    ) {
      return res.status(403).json({
        message: "You are not authorized to change this profile.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const requireAdminAccess = async (req, res, next) => {
  try {
    const auth = await loadAuth(req);
    if (!auth) {
      return res.status(401).json({
        message: "Administrator login is required.",
      });
    }

    if (auth.role !== "admin") {
      return res.status(403).json({
        message: "Administrator access is required.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const hashPassword = (password) => bcrypt.hash(String(password), 12);

const verifyPassword = async (provided, stored) => {
  if (!stored || !provided) return false;
  if (/^\$2[aby]\$\d{2}\$/.test(stored)) {
    return bcrypt.compare(String(provided), stored);
  }

  const left = Buffer.from(String(provided));
  const right = Buffer.from(String(stored));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

module.exports = {
  clearAuthCookie,
  createAuthSession,
  destroyAuthSession,
  hashPassword,
  loadAuth,
  requireAdminAccess,
  requireClientAccess,
  verifyPassword,
};
