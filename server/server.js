require("dotenv").config();

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const path = require("path");
const Client = require("./models/client-model.js");
const authRoute = require("./router/auth-router.js");
const detailRoute = require("./router/detail-router.js");
const connectDb = require("./utils/db.js");
const errorMiddleware = require("./middlewares/error-middleware.js");

const app = express();
const port = Number(process.env.PORT || 3500);
const clientDist = path.resolve(__dirname, "..", "client", "dist");

app.set("trust proxy", 1);

const normalizeOrigin = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
};

const allowedOrigins = new Set(
  String(process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean),
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "starlink-profile" });
});
app.use("/api/auth", authRoute);
app.use("/api/data", detailRoute);

app.post("/api/visit/:clientId", async (req, res, next) => {
  try {
    if (!req.params.clientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid profile ID." });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.clientId,
      { $inc: { visitCount: 1 } },
      { new: true },
    ).select("visitCount");

    if (!client) return res.status(404).json({ message: "Profile not found." });
    return res.status(200).json({ count: client.visitCount || 0 });
  } catch (error) {
    return next(error);
  }
});

const isCrawler = (userAgent = "") =>
  /facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|discordbot|telegrambot/i.test(
    String(userAgent),
  );

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

app.get("/:id", async (req, res, next) => {
  if (!isCrawler(req.get("user-agent"))) return next();

  try {
    const requestedCompanyName = String(req.params.id || "").trim();
    const escapedCompanyName = requestedCompanyName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const client = await Client.findOne({
      companyName: {
        $regex: `^${escapedCompanyName}$`,
        $options: "i",
      },
    }).lean();
    if (!client) return next();

    const publicBase = String(process.env.PUBLIC_APP_URL || "").replace(/\/$/, "");
    const requestBase = `${req.protocol}://${req.get("host")}`;
    const base = publicBase || requestBase;
    const url = `${base}/${encodeURIComponent(req.params.id)}`;
    const title = client.clientName || client.name || "Starlink Profile";
    const description = client.designation || client.description || client.name || "Starlink digital profile";
    const image = client.logo || client.images || "";

    return res.type("html").send(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Starlink">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${escapeHtml(url)}">
</head><body><a href="${escapeHtml(url)}">Open profile</a></body></html>`);
  } catch (error) {
    return next(error);
  }
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: "1h", index: false }));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(errorMiddleware);

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Starlink profile server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database startup failed:", error.message);
    process.exit(1);
  });
