# Judge0 on Railway (CodeHive)

Your Railway Judge0 endpoint is reachable (e.g. `/languages` works) but execution can fail with:

- `No such file or directory @ rb_sysopen - /box/script.py`

That typically means Judge0 is running without the sandbox prerequisites (the official compose uses `privileged: true`), so `/box` is never mounted/created for executions.

## Recommended fix (works on unprivileged PaaS)

Deploy a custom Judge0 image that replaces `isolate` with `mock_isolate.sh`.
This repo includes a Dockerfile for that:

- `judge0/Dockerfile`

### Railway build settings (important)
In each Railway service settings:

- If **Root Directory** is the repo root, set **Dockerfile Path** to `judge0/Dockerfile`.
- If **Root Directory** is `judge0/`, set **Dockerfile Path** to `Dockerfile`.

### Railway services
Create **two Railway services** from this repo:

1) **Judge0 API (server)**
- Dockerfile path: `judge0/Dockerfile`
- Expose port: `8080`
- Start command: *(leave default)*

2) **Judge0 worker**
- Dockerfile path: `judge0/Dockerfile`
- Start command: `./scripts/workers`
- No port exposure needed

Also create:

3) **Postgres** (Railway Postgres plugin)
4) **Redis** (Railway Redis plugin)

Both server + worker must point at the same Redis/Postgres.

### Environment variables
Set these on BOTH server and worker services:

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `ENABLE_WAIT_RESULT=true`
- `ENABLE_NETWORK=false`
- `ALLOW_ORIGIN=*` (or your frontend URL)

On Railway, the Redis plugin won’t affect Judge0 unless you map the plugin vars onto these names. For example:

- `REDIS_HOST=${{ Redis.REDIS_HOST }}`
- `REDIS_PORT=${{ Redis.REDIS_PORT }}`
- `REDIS_PASSWORD=${{ Redis.REDIS_PASSWORD }}`

If `REDIS_HOST` is missing, Judge0 defaults to `localhost` and background jobs will sit forever as `In Queue`.

Optional hardening (recommended):

- `ENABLE_COMPILER_OPTIONS=false`
- `ENABLE_COMMAND_LINE_ARGUMENTS=false`
- `ENABLE_CALLBACKS=false`

## Validate
From this repo root, run:

```bash
JUDGE0_URL=https://<your-judge0-domain> node scripts/judge0-smoke-test.mjs
```

Expected:
- `/languages` returns a list
- `/submissions?wait=true` returns `Accepted` and prints `judge0 smoke test ok`

To confirm the worker is actually running, also test the async path:

- Submit with `wait=false` and poll `/submissions/<token>` until it leaves `In Queue`.

If `/workers` still returns `[]`, the worker service is not running or not connected to Redis.
