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

Important for the worker on Railway:

- Ensure the worker service is **not** running in a mode that scales to zero when idle (e.g. Railway **Serverless**). A worker that scales to zero will never receive HTTP traffic to “wake up”, so queued `wait=false` jobs will sit `In Queue` forever.
- Set a low `COUNT` (see below). Judge0 defaults to `COUNT=(nproc*2)`, which commonly OOM-kills small containers.

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

- `REDIS_HOST=${{ Redis.REDISHOST }}`
- `REDIS_PORT=${{ Redis.REDISPORT }}`
- `REDIS_PASSWORD=${{ Redis.REDISPASSWORD }}`

Alternatively (simpler), set `REDIS_URL=${{ Redis.REDIS_URL }}`. This repo’s Judge0 Dockerfile includes a small startup shim that parses `REDIS_URL` and fills in `REDIS_HOST/REDIS_PORT/REDIS_PASSWORD` automatically.

If `REDIS_HOST` is missing/blank, Judge0 defaults to `localhost` and `/workers` will return 500.

Optional hardening (recommended):

- `ENABLE_COMPILER_OPTIONS=false`
- `ENABLE_COMMAND_LINE_ARGUMENTS=false`
- `ENABLE_CALLBACKS=false`

Worker stability (recommended):

- On the worker service set `COUNT=1` (or `2`) to avoid OOM-kills.
- If you still see the worker crash, also try setting `RAILS_MAX_THREADS=4` on the worker.

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

About `/workers`:

- `/workers` only lists queues that exist in Redis (it iterates `Resque.queues`), so it can return `[]` if you’ve never created an async submission yet.
- After you submit at least one `wait=false` job, `/workers` should include the queue and show `available >= 1` while the worker is healthy.
- If `/workers` shows `available: 0` with `size > 0`, the worker is down (crashed) or scaled-to-zero.
