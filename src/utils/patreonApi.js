import { fetchWithTimeout } from "./fetchWithTimeout.js";
import { createPatreonNostrProof } from "./patreonNostrProof.js";

const API_ROOT = "/api/patreon";

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Patreon request failed (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function request(path, { method = "GET", npub, body, timeoutMs } = {}) {
  const headers = { Accept: "application/json" };
  if (npub) headers["X-RBE-Npub"] = npub;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetchWithTimeout(
    `${API_ROOT}${path}`,
    {
      method,
      credentials: "include",
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
    timeoutMs,
  );
  return readJson(response);
}

export function getPatreonStatus(npub) {
  return request("/status", { npub });
}

export async function restorePatreonSession(npub, { allowExtension = true } = {}) {
  const proof = await createPatreonNostrProof({
    npub,
    action: "restore",
    allowExtension,
  });
  return request("/key-status", { method: "POST", body: proof });
}

export async function startPatreonLink(
  npub,
  plan = "annual",
  { returnMode = "page", language = "en" } = {},
) {
  const proof = await createPatreonNostrProof({ npub, action: "link" });
  return request("/link-start", {
    method: "POST",
    body: {
      ...proof,
      plan: ["annual", "monthly"].includes(plan) ? plan : "annual",
      returnMode: returnMode === "modal" ? "modal" : "page",
      language: language === "es" ? "es" : "en",
    },
  });
}

export function refreshPatreonStatus(npub) {
  return request("/refresh-status", { method: "POST", npub });
}

export async function replacePatreonLink(npub) {
  const proof = await createPatreonNostrProof({ npub, action: "replace" });
  return request("/replace-link", {
    method: "POST",
    body: proof,
    timeoutMs: 30_000,
  });
}

export async function cancelPatreonReplacement(npub) {
  const proof = npub
    ? await createPatreonNostrProof({ npub, action: "restore" })
    : undefined;
  return request("/cancel-replacement", {
    method: "POST",
    ...(proof ? { body: proof } : {}),
  });
}

export async function disconnectPatreon(npub) {
  const proof = await createPatreonNostrProof({ npub, action: "disconnect" });
  return request("/disconnect", { method: "POST", npub, body: proof });
}
