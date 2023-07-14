FROM ubuntu:22.04

USER root

COPY . /opt/hereditary-stratigraph-concept

RUN \
  apt-get update -q --allow-unauthenticated \
    && \
  apt-get install -qy --no-install-recommends \
    gawk \
    libgmp3-dev \
    npm \
    python3-pip \
    git \
    && \
  rm -rf /var/lib/apt/lists/*

RUN \
  npm install -g \
    bibtex-tidy@1.8.5 \
    && \
  echo "installed npm dependencies"

RUN \
  python3 -m pip install -r /opt/hereditary-stratigraph-concept/requirements.txt \
    && \
  echo "installed python dependencies"

USER user

# Define default working directory.
WORKDIR /opt/hereditary-stratigraph-concept
