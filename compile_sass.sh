#!/bin/bash

set -euo pipefail

# Compile SASS with the correct load path, stripping Jekyll front matter first
TMP_SCSS="$(mktemp)"
awk 'BEGIN{skip=0} {
  if (NR==1 && $0 ~ /^---$/) {skip=1; next}
  if (skip==1 && $0 ~ /^---$/) {skip=0; next}
  if (skip==0) print $0
}' style.scss > "$TMP_SCSS"

if command -v sass >/dev/null 2>&1; then
  SASS_CMD=(sass)
elif npx --offline --yes sass --version >/dev/null 2>&1; then
  # Prefer a cached Sass package when the network is unavailable.
  SASS_CMD=(npx --offline --yes sass)
else
  SASS_CMD=(npx --yes sass)
fi

"${SASS_CMD[@]}" --style=compressed --no-source-map --load-path=_sass "$TMP_SCSS" style.css

rm -f "$TMP_SCSS"

echo "SASS compilation complete!"
