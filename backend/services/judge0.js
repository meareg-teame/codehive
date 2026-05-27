import axios from "axios";

const JUDGE0_URL = (process.env.JUDGE0_URL || "http://localhost:2358").replace(
  /\/+$/,
  ""
);

const LANGUAGE_MATCHERS = {
  bash: [/^Bash \(/i],
  c: [/^C \(/i],
  cpp: [/^C\+\+ \(/i],
  csharp: [/^C# \(/i],
  go: [/^Go \(/i],
  java: [/^Java \(/i],
  kotlin: [/^Kotlin \(/i],
  nodejs: [/^JavaScript \(Node\.js /i],
  php: [/^PHP \(/i],
  python: [/^Python \(/i],
  ruby: [/^Ruby \(/i],
  rust: [/^Rust \(/i],
  swift: [/^Swift \(/i],
  typescript: [/^TypeScript \(/i],
};

let cachedLanguages = null;
let cacheLoadedAt = 0;

function buildJudge0Headers() {
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

function createRunnerError(message, statusCode = 503) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function fetchJudge0Languages(forceRefresh = false) {
  const cacheAge = Date.now() - cacheLoadedAt;
  if (!forceRefresh && cachedLanguages && cacheAge < 5 * 60 * 1000) {
    return cachedLanguages;
  }

  try {
    const response = await axios.get(`${JUDGE0_URL}/languages`, {
      headers: buildJudge0Headers(),
      timeout: 5000,
    });

    cachedLanguages = Array.isArray(response.data) ? response.data : [];
    cacheLoadedAt = Date.now();
    return cachedLanguages;
  } catch (error) {
    throw createRunnerError(
      "Judge0 is not reachable. Start the Judge0 service before running code."
    );
  }
}

function resolveLanguageId(languageKey, judge0Languages) {
  const matchers = LANGUAGE_MATCHERS[languageKey];

  if (!matchers) {
    throw createRunnerError(
      `Language "${languageKey}" is not configured in CodeHive.`,
      400
    );
  }

  const matches = judge0Languages
    .filter((language) =>
      matchers.some((matcher) => matcher.test(language.name || ""))
    )
    .sort((a, b) => b.id - a.id);

  if (matches.length === 0) {
    throw createRunnerError(
      `Language "${languageKey}" is not available on the connected Judge0 instance.`,
      400
    );
  }

  return matches[0].id;
}

export async function executeWithJudge0({
  language,
  sourceCode,
  stdin = "",
}) {
  const judge0Languages = await fetchJudge0Languages();
  const languageId = resolveLanguageId(language, judge0Languages);

  try {
    const response = await axios.post(
      `${JUDGE0_URL}/submissions`,
      {
        language_id: languageId,
        source_code: sourceCode,
        stdin,
        cpu_time_limit: Number(process.env.CODE_RUNNER_CPU_TIME_LIMIT || 5),
        wall_time_limit: Number(process.env.CODE_RUNNER_WALL_TIME_LIMIT || 10),
        memory_limit: Number(process.env.CODE_RUNNER_MEMORY_LIMIT_KB || 512000),
      },
      {
        params: {
          base64_encoded: "false",
          wait: "true",
          fields:
            "stdout,stderr,compile_output,message,status,time,memory,language_id",
        },
        headers: buildJudge0Headers(),
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    const judge0Message = error.response?.data?.message;
    throw createRunnerError(
      judge0Message ||
        "Judge0 execution failed. Check that the service is healthy and reachable."
    );
  }
}
