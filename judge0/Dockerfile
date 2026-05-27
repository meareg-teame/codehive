FROM judge0/judge0:1.13.1

USER root

WORKDIR /api

# Railway (and many PaaS) don't allow privileged containers.
# Judge0's default sandbox relies on isolate/mount namespaces; for PaaS we
# replace isolate with a safe mock that runs without kernel sandbox features.
#
# Copy from `mock_isolate.sh` so this works whether the build context is the
# repo root (uses ./mock_isolate.sh) or the judge0/ folder (uses ./mock_isolate.sh
# inside that folder).
COPY --chmod=0755 mock_isolate.sh /usr/local/bin/isolate

# Judge0 API listens on 8080 in this image.
EXPOSE 8080

# Make sure the default working directory used by some runners exists.
RUN mkdir -p /box && chmod 777 /box

# Switch back to the original runtime user from the base image.
USER judge0
