#!/usr/bin/env bash
# Demo D1: a person adds a `share_target` parameter in lib/analytics.ts, with a small bug
# (the value is sent unescaped and the length cap is off by one). The PR text does not say so.
# Usage: scripts/demo-prs/d1-share-target.sh      (then, after the review: d1-fix.sh)
# Re-running resets demo/d1-share-target to origin/main and updates the same PR.
. "$(dirname "$0")/lib.sh"
BRANCH=demo/d1-share-target

demo_init
demo_reset_branch "$BRANCH"

cat >> lib/analytics.ts <<'TS'

// Where a share went (x, copy, native sheet), so the reports show which channel people use.
const SHARE_TARGET_MAX = 32;

export function trackShare(shareTarget: string, params: EventParams = {}) {
  // Keep the label short so the reports stay readable.
  track("share", { ...params, share_target: shareTarget.slice(0, SHARE_TARGET_MAX + 1) });
}
TS

demo_commit "Track which channel a share goes to (share_target)"
demo_push "$BRANCH"
demo_open_pr "$BRANCH" "[demo D1] Add share_target to share analytics" \
"Demo D1 (spec/07 section 7.6). Adds a \`share_target\` parameter in \`lib/analytics.ts\`.

Opened by scripts/demo-prs/d1-share-target.sh (demo PR; the README in that folder says what to expect)."
