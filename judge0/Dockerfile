FROM judge0/judge0:1.13.1

# Railway (and many PaaS) don't allow privileged containers.
# Judge0's default sandbox relies on isolate/mount namespaces; for PaaS we
# replace isolate with a safe mock that runs without kernel sandbox features.
#
# Copy from `mock_isolate.sh` so this works whether the build context is the
# repo root (uses ./mock_isolate.sh) or the judge0/ folder (uses ./mock_isolate.sh
# inside that folder).
COPY mock_isolate.sh /usr/local/bin/isolate
RUN chmod +x /usr/local/bin/isolate

EXPOSE 2358

# Make sure the default working directory used by some runners exists.
RUN mkdir -p /box && chmod 777 /box
