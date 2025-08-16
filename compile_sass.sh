#!/bin/bash

set -euo pipefail

# Compile SASS with the correct load path, stripping Jekyll front matter first
TMP_SCSS="$(mktemp)"
awk 'BEGIN{skip=0} {
  if (NR==1 && $0 ~ /^---$/) {skip=1; next}
  if (skip==1 && $0 ~ /^---$/) {skip=0; next}
  if (skip==0) print $0
}' style.scss > "$TMP_SCSS"

sass --style=compressed --no-source-map --load-path=_sass "$TMP_SCSS" style.css

rm -f "$TMP_SCSS"

echo "SASS compilation complete!" 