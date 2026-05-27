FROM judge0/judge0:1.13.1

USER root

WORKDIR /api

COPY --chmod=0755 judge0/railway-env-shim.sh /usr/local/bin/railway-env-shim

# Railway (and many PaaS) don't allow privileged containers.
# Judge0's default sandbox relies on isolate/mount namespaces; for PaaS we
# replace isolate with a safe mock that runs without kernel sandbox features.
COPY --chmod=0755 judge0/mock_isolate.sh /usr/local/bin/isolate

# Judge0 API listens on 8080 in this image.
EXPOSE 8080

# Ensure Rails binds to the expected port even if the platform doesn't inject PORT.
ENV PORT=8080

# Avoid accidentally running in development on PaaS.
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=true

# Make sure common runtime paths exist and are writable.
RUN mkdir -p /box /api/log \
	&& chmod 777 /box /api/log

# Switch back to the original runtime user from the base image.
USER judge0

# Wrap the upstream entrypoint to normalize Railway Redis env vars.
ENTRYPOINT ["/usr/local/bin/railway-env-shim"]
