#!/usr/bin/env bash
# sync_visual_methodology.sh
# Obsidian (正本) -> project (読み取り copy) 片方向同期
#
# 運用ルール (INDEX.md):
#   - 正本: C:/Users/oioce/OneDrive/obsidian_vault/tech-knowledge/岡田斗司夫アニメ方法論/
#   - project (mychannel/visual-methodology/): 読み取り専用 copy
#   - 編集は Obsidian 側で行い、この script で project に sync する
#
# Prompt file (_extract_prompt.md, _batch_*.txt, _axis_*.txt, _principles_prompt.txt 等) は
# project 側のみに残し、Obsidian には sync しない (再生成用 prompt template)

set -euo pipefail

OBSIDIAN_SRC="C:/Users/oioce/OneDrive/obsidian_vault/tech-knowledge/岡田斗司夫アニメ方法論"
PROJECT_DST="C:/Users/oioce/dev/youtube-automation-agent/mychannel/visual-methodology"

if [ ! -d "$OBSIDIAN_SRC" ]; then
  echo "ERROR: source not found: $OBSIDIAN_SRC" >&2
  exit 1
fi

if [ ! -d "$PROJECT_DST" ]; then
  echo "ERROR: destination not found: $PROJECT_DST" >&2
  exit 1
fi

echo "Syncing: $OBSIDIAN_SRC -> $PROJECT_DST"

# Top-level files
for f in INDEX.md PRINCIPLES.md PLAYBOOK.md _inventory.md _backtest_report.md; do
  if [ -f "$OBSIDIAN_SRC/$f" ]; then
    cp -f "$OBSIDIAN_SRC/$f" "$PROJECT_DST/$f"
    echo "  [top] $f"
  fi
done

# axis/
mkdir -p "$PROJECT_DST/axis"
if [ -d "$OBSIDIAN_SRC/axis" ]; then
  cp -f "$OBSIDIAN_SRC/axis"/*.md "$PROJECT_DST/axis/" 2>/dev/null || true
  axis_count=$(ls -1 "$PROJECT_DST/axis"/*.md 2>/dev/null | wc -l)
  echo "  [axis] $axis_count file"
fi

# extracted/
mkdir -p "$PROJECT_DST/extracted"
if [ -d "$OBSIDIAN_SRC/extracted" ]; then
  cp -f "$OBSIDIAN_SRC/extracted"/*.md "$PROJECT_DST/extracted/" 2>/dev/null || true
  ext_count=$(ls -1 "$PROJECT_DST/extracted"/*.md 2>/dev/null | wc -l)
  echo "  [extracted] $ext_count file"
fi

echo "Sync complete."
