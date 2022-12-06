FROM mmore500/docker-texlive-full:sha-ea45eb5

COPY . /opt/hereditary-stratigraph-concept/tex

SHELL ["/bin/bash", "-c"]

# Define default working directory.
WORKDIR /opt/hereditary-stratigraph-concept/tex

# Prevent interactive time zone config.
# adapted from https://askubuntu.com/a/1013396
ENV DEBIAN_FRONTEND=noninteractive

RUN \
  echo 'Acquire::http::Timeout "60";' >> "/etc/apt/apt.conf.d/99timeout" \
    && \
  echo 'Acquire::ftp::Timeout "60";' >> "/etc/apt/apt.conf.d/99timeout" \
    && \
  echo 'Acquire::Retries "100";' >> "/etc/apt/apt.conf.d/99timeout" \
    && \
  echo "buffed apt-get resiliency"

RUN \
  find /etc/apt -type f -name '*.list' -exec sed -i 's/\(^deb.*-backports.*\)/#\1/; s/\(^deb.*-updates.*\)/#\1/; s/\(^deb.*-proposed.*\)/#\1/; s/\(^deb.*-security.*\)/#\1/' {} + \
    && \
  rm -rf /var/lib/apt/lists/* \
    && \
  echo "removed -backports, -updates, -proposed, -security repositories"

RUN \
  apt-get update -q --allow-unauthenticated \
    && \
  apt-get install -qy --no-install-recommends \
    bibtool \
    git \
    make \
    moreutils \
    nodejs \
    && \
  rm -rf /var/lib/apt/lists/*

CMD ["bash"]
