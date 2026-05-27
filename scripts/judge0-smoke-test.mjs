#!/usr/bin/env node

const JUDGE0_URL = (process.env.JUDGE0_URL || "").replace(/\/+$/, "");

if (!JUDGE0_URL) {
  console.error("Missing JUDGE0_URL. Example: JUDGE0_URL=https://your-judge0.up.railway.app");
  process.exit(2);
}

function buildHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.JUDGE0_AUTH_TOKEN) {
    headers["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
  }

  if (process.env.JUDGE0_AUTH_USER) {
    headers["X-Auth-User"] = process.env.JUDGE0_AUTH_USER;
  }

  return headers;
}

async function requestJson(path, { method = "GET", body, params } = {}) {
  const url = new URL(`${JUDGE0_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = typeof data === "object" && data && "message" in data ? data.message : text;
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${message}`);
  }

  return data;
}

function resolveLanguageId(languages, desired) {
  const forced = process.env.JUDGE0_LANGUAGE_ID;
  if (forced) return Number(forced);

  const key = (desired || process.env.LANG_KEY || "python").toLowerCase();
  const matchers = {
    python: [/^Python \(/i],
    nodejs: [/^JavaScript \(Node\.js /i],
    typescript: [/^TypeScript \(/i],
    cpp: [/^C\+\+ \(/i],
    c: [/^C \(/i],
    java: [/^Java \(/i],
    go: [/^Go \(/i],
    rust: [/^Rust \(/i],
  };

  const patterns = matchers[key] || matchers.python;
  const matches = (languages || [])
    .filter((lang) => patterns.some((re) => re.test(lang.name || "")))
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  if (matches.length === 0) {
    const sample = (languages || []).slice(0, 10).map((l) => `${l.id}:${l.name}`).join(" | ");
    throw new Error(
      `Could not find language for key "${key}". Set JUDGE0_LANGUAGE_ID explicitly. Sample languages: ${sample}`
    );
  }

  return matches[0].id;
}

async function main() {
  console.log(`Judge0 URL: ${JUDGE0_URL}`);

  console.log("Checking /languages...");
  const languages = await requestJson("/languages", { method: "GET" });
  if (!Array.isArray(languages) || languages.length === 0) {
    throw new Error("/languages returned no languages");
  }
  console.log(`Languages OK (${languages.length})`);

  const languageId = resolveLanguageId(languages);
  console.log(`Using language_id=${languageId}`);

  const sourceCode =
    process.env.SOURCE_CODE ||
    "print('judge0 smoke test ok')\n";

  console.log("Submitting code to /submissions (wait=true)...");
  const submission = await requestJson("/submissions", {
    method: "POST",
    body: {
      language_id: languageId,
      source_code: sourceCode,
      stdin: process.env.STDIN || "",
      cpu_time_limit: Number(process.env.CODE_RUNNER_CPU_TIME_LIMIT || 5),
      wall_time_limit: Number(process.env.CODE_RUNNER_WALL_TIME_LIMIT || 10),
      memory_limit: Number(process.env.CODE_RUNNER_MEMORY_LIMIT_KB || 512000),
    },
    params: {
      base64_encoded: "false",
      wait: "true",
      fields: "stdout,stderr,compile_output,message,status,time,memory,language_id",
    },
  });

  const status = submission?.status?.description || submission?.status || "unknown";
  console.log(`Status: ${status}`);
  if (submission?.stdout) console.log(`stdout:\n${submission.stdout}`);
  if (submission?.stderr) console.log(`stderr:\n${submission.stderr}`);
  if (submission?.compile_output) console.log(`compile_output:\n${submission.compile_output}`);
  if (submission?.message) console.log(`message:\n${submission.message}`);

  if (!submission || (submission.status && submission.status?.id && submission.status.id >= 6)) {
    // Judge0: statuses >=6 often indicate runtime/compilation errors.
    process.exit(1);
  }

  console.log("Smoke test passed.");
}

main().catch((error) => {
  console.error("Smoke test failed:", error.message);
  process.exit(1);
});
