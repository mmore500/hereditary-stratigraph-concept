FROM ubuntu:18.04

USER root

ENV DEBIAN_FRONTEND=noninteractive

COPY . /opt/hereditary-stratigraph-concept

RUN \
  apt-get update -q --allow-unauthenticated \
    && \
  apt-get install -qy --no-install-recommends \
    build-essential \
    gawk \
    libgmp3-dev \
    python3-dev \
    python3-dev \
    python3-setuptools \
    npm \
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
