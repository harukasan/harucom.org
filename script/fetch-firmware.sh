#!/usr/bin/env bash
#
# Downloads the Harucom OS firmware that /flash/ writes.
#
# GitHub release assets do not send CORS headers, so the browser cannot fetch
# them directly. The UF2 is pulled in here instead and served from the site
# itself, which makes it same-origin. The file keeps the name it has in the
# release so that every version gets its own URL and no cache can go stale.
#
# Run it by hand before `bundle exec jekyll serve`, or let the Pages workflow
# run it before the build. Needs the gh CLI, unzip and python3.
#
# Usage: script/fetch-firmware.sh [tag]   (defaults to the latest release)

set -euo pipefail
cd "$(dirname "$0")/.."

REPO="harukasan/harucom-os"
TAG="${1:-}"

if [ -z "$TAG" ]; then
  TAG=$(gh release list --repo "$REPO" --limit 1 \
        --exclude-drafts --exclude-pre-releases --json tagName -q '.[0].tagName')
fi
[ -n "$TAG" ] || { echo "no release found in $REPO" >&2; exit 1; }
echo "==> $REPO $TAG"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

gh release download "$TAG" --repo "$REPO" --pattern '*.zip' --dir "$WORK"
unzip -q "$WORK"/*.zip -d "$WORK/extracted"

SOURCE=$(find "$WORK/extracted" -name 'harucom_os_full-*.uf2' -print -quit)
[ -n "$SOURCE" ] || { echo "no harucom_os_full-*.uf2 in the release archive" >&2; exit 1; }

mkdir -p assets/firmware
rm -f assets/firmware/*.uf2
DEST="assets/firmware/$(basename "$SOURCE")"
cp "$SOURCE" "$DEST"

# Refuse to ship an image the page would reject anyway. The checks mirror
# assets/js/uf2.js: block structure, RP2350 family, firmware area only.
python3 - "$DEST" <<'PY'
import struct, sys

path = sys.argv[1]
data = open(path, 'rb').read()
if not data or len(data) % 512:
    sys.exit(f'{path}: size {len(data)} is not a multiple of 512')

families, payload, segments, cursor = set(), 0, 0, None
for index in range(len(data) // 512):
    block = data[index * 512:(index + 1) * 512]
    magic0, magic1, flags, addr, size, _, _, family = struct.unpack_from('<8I', block)
    if magic0 != 0x0A324655 or magic1 != 0x9E5D5157 or struct.unpack_from('<I', block, 508)[0] != 0x0AB16F30:
        sys.exit(f'{path}: bad magic in block {index}')
    if not flags & 0x2000:
        sys.exit(f'{path}: block {index} carries no family id')
    if not 0 < size <= 476:
        sys.exit(f'{path}: bad payload size {size} in block {index}')
    if addr < 0x10000000 or addr + size > 0x10800000:
        sys.exit(f'{path}: block {index} targets 0x{addr:08x}, outside the firmware area')
    families.add(family)
    payload += size
    if addr != cursor:
        segments += 1
    cursor = addr + size

if families != {0xE48BFF59}:
    sys.exit(f'{path}: unexpected family ids {[hex(f) for f in families]}')

print(f'    {len(data) // 512} blocks, {payload} bytes of payload, {segments} segments, RP2350 ARM-S')
PY

SIZE=$(stat -c%s "$DEST" 2>/dev/null || stat -f%z "$DEST")
SHA=$(sha256sum "$DEST" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$DEST" | cut -d' ' -f1)

mkdir -p _data
cat > _data/firmware.yml <<EOF
# Written by script/fetch-firmware.sh. Not checked in: the Pages workflow
# regenerates it on every build, alongside the UF2 it describes.
version: "${TAG}"
file: "/${DEST}"
size: ${SIZE}
sha256: "${SHA}"
release_url: "https://github.com/${REPO}/releases/tag/${TAG}"
EOF

echo "==> $DEST ($SIZE bytes)"
