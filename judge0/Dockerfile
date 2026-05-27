FROM judge0/judge0:1.13.1

# Railway (and many PaaS) don't allow privileged containers.
# Judge0's default sandbox relies on isolate/mount namespaces; for PaaS we
# replace isolate with a safe mock that runs without kernel sandbox features.
#
# NOTE: We copy from judge0/mock_isolate.sh so this Dockerfile works whether
# Railway sets the build context to repo root or to the judge0/ folder.
COPY judge0/mock_isolate.sh /usr/local/bin/isolate
RUN chmod +x /usr/local/bin/isolate

# Make sure the default working directory used by some runners exists.
RUN mkdir -p /box && chmod 777 /box
