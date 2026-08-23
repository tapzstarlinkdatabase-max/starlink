const Client = require("../models/client-model.js");
const {
  createAuthSession,
  destroyAuthSession,
  hashPassword,
  loadAuth,
  verifyPassword,
} = require("../middlewares/auth-middleware.js");

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await Client.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
    }).select("+password");

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!/^\$2[aby]\$\d{2}\$/.test(user.password || "")) {
      const passwordHash = await hashPassword(password);
      await Client.collection.updateOne(
        { _id: user._id },
        { $set: { password: passwordHash }, $unset: { flag: "" } },
      );
    }

    await destroyAuthSession(req, res);
    await createAuthSession(res, { role: "client", clientId: user._id });

    return res.status(200).json({
      message: "Login successful.",
      role: "client",
      userId: String(user._id),
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await destroyAuthSession(req, res);
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return next(error);
  }
};

const session = async (req, res, next) => {
  try {
    const auth = await loadAuth(req);
    if (!auth) return res.status(200).json({ authenticated: false });

    return res.status(200).json({
      authenticated: true,
      role: auth.role,
      userId: auth.clientId,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, logout, session };
