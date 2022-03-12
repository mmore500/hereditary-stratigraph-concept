#!/bin/bash
set -e

# enforce use of GNU version of coreutils
. ./tidy/util/enforce_gnu_utils.sh

# greq -qI tests if file is binary
# adapted from https://stackoverflow.com/a/29689345
TARGETS=$(find . -type f ! -path "./cpp/third-party/*" ! -path "./.git/*"  ! -path "./.gitmodules" ! -path "*/assets/*" ! -path "*Makefile" ! -path "*Maketemplate*" ! -path "*/node_modules/*" ! -path "./tex/submodules/*" -exec grep -qI . {} ';' -print)

for filename in ${TARGETS}
do
  sed -i 's/\t/  /g' "${filename}"
done