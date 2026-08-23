const express = require("express");
const mongoose = require("mongoose");
const Client = require("../models/client-model.js");
const {
  hashPassword,
  requireClientAccess,
} = require("../middlewares/auth-middleware.js");

const router = express.Router();

const EDITABLE_FIELDS = new Set([
  "companyName",
  "name",
  "clientName",
  "designation",
  "description",
  "address",
  "location",
  "phone01",
  "whatsapp01",
  "email",
  "website",
  "googleMapLink",
  "googleMapName",
  "googleReviewLink",
  "googleReviewName",
  "logo",
  "images",
  "img01",
  "img02",
  "img03",
  "img04",
  "img05",
  "img06",
  "img07",
  "img08",
  "img09",
  "img10",
]);

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSlug = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const cleanPayload = (body) => {
  const payload = {};

  for (const [key, value] of Object.entries(body || {})) {
    if (!EDITABLE_FIELDS.has(key)) continue;
    payload[key] = String(value ?? "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "companyName")) {
    payload.companyName = normalizeSlug(payload.companyName);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "email")) {
    payload.email = payload.email.toLowerCase();
  }

  return payload;
};

const validObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid profile ID." });
  }
  next();
};

const requireProfileCreateKey = (req, res, next) => {
  const expected = String(process.env.PROFILE_CREATE_KEY || "").trim();
  if (!expected) return next();

  const provided = String(req.get("x-profile-create-key") || "").trim();
  if (!provided || provided !== expected) {
    return res.status(401).json({
      message: "A valid profile creation key is required.",
    });
  }

  next();
};

const publicProfileUrl = (companyName) => {
  const base = String(
    process.env.PUBLIC_APP_URL || "http://localhost:5173",
  ).replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(companyName)}`;
};

const MAX_BULK_PROFILES = Math.max(
  1,
  Math.min(
    Number.parseInt(process.env.PROFILE_BULK_LIMIT || "100", 10) || 100,
    500,
  ),
);

const BULK_CREATE_CONCURRENCY = Math.max(
  1,
  Math.min(
    Number.parseInt(process.env.PROFILE_BULK_CONCURRENCY || "4", 10) || 4,
    10,
  ),
);

const isProfileObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const createProfileRecord = async (input) => {
  if (!isProfileObject(input)) {
    return {
      ok: false,
      status: 400,
      message: "Each profile must be a JSON object.",
    };
  }

  const payload = cleanPayload(input);
  const password = String(input.password || "");

  if (!payload.companyName || !payload.email || !password) {
    return {
      ok: false,
      status: 400,
      companyName: payload.companyName || "",
      email: payload.email || "",
      message: "companyName, email and password are required.",
    };
  }

  const [duplicateSlug, duplicateEmail] = await Promise.all([
    Client.exists({
      companyName: {
        $regex: `^${escapeRegex(payload.companyName)}$`,
        $options: "i",
      },
    }),
    Client.exists({
      email: {
        $regex: `^${escapeRegex(payload.email)}$`,
        $options: "i",
      },
    }),
  ]);

  if (duplicateSlug) {
    return {
      ok: false,
      status: 409,
      companyName: payload.companyName,
      email: payload.email,
      message: "This companyName is already in use.",
    };
  }

  if (duplicateEmail) {
    return {
      ok: false,
      status: 409,
      companyName: payload.companyName,
      email: payload.email,
      message: "This email is already used by another profile.",
    };
  }

  payload.password = await hashPassword(password);
  const client = await Client.create(payload);
  const profile = client.toJSON();

  return {
    ok: true,
    status: 201,
    profile,
    publicUrl: publicProfileUrl(profile.companyName),
    editId: String(client._id),
  };
};

const findBulkInputDuplicates = (profiles) => {
  const duplicateIndexes = new Map();
  const companyNames = new Map();
  const emails = new Map();

  profiles.forEach((input, index) => {
    if (!isProfileObject(input)) return;

    const payload = cleanPayload(input);
    const companyName = String(payload.companyName || "").toLowerCase();
    const email = String(payload.email || "").toLowerCase();

    const register = (map, key, label) => {
      if (!key) return;
      if (map.has(key)) {
        const firstIndex = map.get(key);
        if (!duplicateIndexes.has(firstIndex)) {
          duplicateIndexes.set(
            firstIndex,
            `Duplicate ${label} appears more than once in this bulk request.`,
          );
        }
        duplicateIndexes.set(
          index,
          `Duplicate ${label} appears more than once in this bulk request.`,
        );
        return;
      }
      map.set(key, index);
    };

    register(companyNames, companyName, "companyName");
    register(emails, email, "email");
  });

  return duplicateIndexes;
};

const mapWithConcurrency = async (items, concurrency, worker) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runWorker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
};

router.post("/profile", requireProfileCreateKey, async (req, res, next) => {
  try {
    const isBulk = Array.isArray(req.body);

    if (!isBulk) {
      const result = await createProfileRecord(req.body);

      if (!result.ok) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(201).json({
        message: "Profile created successfully.",
        profile: result.profile,
        publicUrl: result.publicUrl,
        editId: result.editId,
      });
    }

    if (req.body.length === 0) {
      return res.status(400).json({
        message: "Bulk profile payload must contain at least one profile.",
      });
    }

    if (req.body.length > MAX_BULK_PROFILES) {
      return res.status(413).json({
        message: `Bulk profile payload is limited to ${MAX_BULK_PROFILES} profiles per request.`,
      });
    }

    const duplicateIndexes = findBulkInputDuplicates(req.body);

    const results = await mapWithConcurrency(
      req.body,
      BULK_CREATE_CONCURRENCY,
      async (input, index) => {
        if (duplicateIndexes.has(index)) {
          const payload = isProfileObject(input) ? cleanPayload(input) : {};
          return {
            index,
            success: false,
            status: 409,
            companyName: payload.companyName || "",
            email: payload.email || "",
            message: duplicateIndexes.get(index),
          };
        }

        const result = await createProfileRecord(input);

        if (!result.ok) {
          return {
            index,
            success: false,
            status: result.status,
            companyName: result.companyName || "",
            email: result.email || "",
            message: result.message,
          };
        }

        return {
          index,
          success: true,
          status: 201,
          companyName: result.profile.companyName,
          email: result.profile.email,
          publicUrl: result.publicUrl,
          editId: result.editId,
        };
      },
    );

    const created = results.filter((item) => item.success).length;
    const failed = results.length - created;
    const status = failed === 0 ? 201 : 207;

    return res.status(status).json({
      message:
        failed === 0
          ? "All profiles created successfully."
          : "Bulk profile creation completed with some failures.",
      total: results.length,
      created,
      failed,
      results,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/client/:companyName", async (req, res, next) => {
  try {
    const companyName = normalizeSlug(req.params.companyName);
    if (!companyName) {
      return res.status(400).json({ message: "Profile name is required." });
    }

    const client = await Client.findOne({
      companyName: {
        $regex: `^${escapeRegex(companyName)}$`,
        $options: "i",
      },
    })
      .select("-password -flag")
      .lean();

    if (!client) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json(client);
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/profile/:id",
  validObjectId,
  requireClientAccess,
  async (req, res, next) => {
    try {
      const client = await Client.findById(req.params.id)
        .select("-password -flag")
        .lean();

      if (!client) {
        return res.status(404).json({ message: "Profile not found." });
      }

      return res.status(200).json(client);
    } catch (error) {
      return next(error);
    }
  },
);

router.patch(
  "/profile/:id",
  validObjectId,
  requireClientAccess,
  async (req, res, next) => {
    try {
      const payload = cleanPayload(req.body);
      const current = await Client.findById(req.params.id)
        .select("companyName email")
        .lean();

      if (!current) {
        return res.status(404).json({ message: "Profile not found." });
      }

      const nextCompanyName = Object.prototype.hasOwnProperty.call(
        payload,
        "companyName",
      )
        ? payload.companyName
        : current.companyName;
      const nextEmail = Object.prototype.hasOwnProperty.call(payload, "email")
        ? payload.email
        : current.email;

      if (!nextCompanyName) {
        return res.status(400).json({ message: "Profile URL name is required." });
      }
      if (!nextEmail) {
        return res.status(400).json({ message: "Email is required for login." });
      }

      if (
        payload.companyName &&
        payload.companyName.toLowerCase() !==
          String(current.companyName || "").toLowerCase()
      ) {
        const duplicateSlug = await Client.exists({
          _id: { $ne: current._id },
          companyName: {
            $regex: `^${escapeRegex(payload.companyName)}$`,
            $options: "i",
          },
        });
        if (duplicateSlug) {
          return res.status(409).json({
            message: "This profile URL name is already in use.",
          });
        }
      }

      if (
        payload.email &&
        payload.email.toLowerCase() !== String(current.email || "").toLowerCase()
      ) {
        const duplicateEmail = await Client.exists({
          _id: { $ne: current._id },
          email: {
            $regex: `^${escapeRegex(payload.email)}$`,
            $options: "i",
          },
        });
        if (duplicateEmail) {
          return res.status(409).json({
            message: "This email is already used by another profile.",
          });
        }
      }

      const updated = await Client.findByIdAndUpdate(
        req.params.id,
        { $set: payload },
        { new: true, runValidators: true },
      ).select("-password -flag");

      return res.status(200).json({
        message: "Profile updated successfully.",
        profile: updated.toJSON(),
      });
    } catch (error) {
      return next(error);
    }
  },
);

module.exports = router;
