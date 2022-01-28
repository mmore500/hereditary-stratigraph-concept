FROM mmore500/dishtiny:sha-7f3f5c8

USER root

COPY . /opt/hereditary-stratigraph-concept

RUN \
  npm install -g \
    bibtex-tidy@1.8.5 \
    && \
  echo "installed npm dependencies"

RUN \
  python3 -m pip install -r /opt/hereditary-stratigraph-concept/requirements.txt \
    && \
  echo "installed python dependencies"

RUN \
  apt-get update -q --allow-unauthenticated \
    && \
  apt-get install -qy --no-install-recommends \
    gawk \
    && \
  rm -rf /var/lib/apt/lists/*

USER user

# Define default working directory.
WORKDIR /opt/hereditary-stratigraph-concept
