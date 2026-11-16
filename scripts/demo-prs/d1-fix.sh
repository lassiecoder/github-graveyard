#!/usr/bin/env bash
# Demo D1, step 2: push the fix for the share_target bug to the same branch (a new commit, same PR).
# Usage: scripts/demo-prs/d1-fix.sh   (after d1-share-target.sh, once the defect thread is posted)
. "$(dirname "$0")/lib.sh"
BRANCH=demo/d1-share-target

demo_init
demo_checkout_existing "$BRANCH"

demo_replace lib/analytics.ts \
  '  track("share", { ...params, share_target: shareTarget.slice(0, SHARE_TARGET_MAX + 1) });' \
  '  const clean = encodeURIComponent(shareTarget.trim().toLowerCase()).slice(0, SHARE_TARGET_MAX);
  track("share", { ...params, share_target: clean });'
demo_replace lib/analytics.ts \
  '  // Keep the label short so the reports stay readable.' \
  '  // Trimmed, lower-cased and escaped, and capped at SHARE_TARGET_MAX characters.'

demo_commit "Escape share_target and fix the length cap"
demo_push_follow_up "$BRANCH"
echo "Pushed the D1 fix to $BRANCH."
