export function getFrontendUrl(rawValue, fallback = "http://localhost:5173") {
  const candidate = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!candidate) return fallback;

  let normalized = candidate.replace(/^FRONTEND_URL\s*=\s*/i, "").trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'")) ||
    (normalized.startsWith("`") && normalized.endsWith("`"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  normalized = normalized.replace(/\/+$/, "");
  return normalized || fallback;
}
