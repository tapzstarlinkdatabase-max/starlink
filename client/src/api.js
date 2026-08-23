const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3500/api",
).replace(/\/$/, "");

export const PUBLIC_BASE_URL = String(
  import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin,
).replace(/\/$/, "");

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      body?.message || `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  return body;
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
};

export const getPublicProfile = (slug) =>
  apiRequest(`/data/client/${encodeURIComponent(slug)}`);

export const getEditableProfile = (id) =>
  apiRequest(`/data/profile/${encodeURIComponent(id)}`);

export const updateProfile = (id, payload) =>
  apiRequest(`/data/profile/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const incrementVisit = (id) =>
  apiRequest(`/visit/${encodeURIComponent(id)}`, { method: "POST" });

export const login = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const logout = () => apiRequest("/auth/logout", { method: "POST" });

export const uploadProfileImage = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: data },
  );

  if (!response.ok) {
    throw new Error("Image upload failed. Please try again.");
  }

  const result = await response.json();
  const url = result.secure_url || result.url;
  if (!url) throw new Error("Image upload did not return a URL.");
  return url;
};
