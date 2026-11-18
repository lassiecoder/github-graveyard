#!/usr/bin/env bash
# Demo D1: a person adds a `share_target` parameter in lib/analytics.ts, with a small bug
# (copy-link shares are recorded as download_image). The PR text does not say so.
# Usage: scripts/demo-prs/d1-share-target.sh      (then, after the review: d1-fix.sh)
# Re-running resets demo/d1-share-target to origin/main and updates the same PR.
. "$(dirname "$0")/lib.sh"
BRANCH=demo/d1-share-target

demo_init
demo_reset_branch "$BRANCH"

cat >> lib/analytics.ts <<'TS'

// Which share button was used, in the same words as ShareBar's data-track-method, so the reports line up.
export type ShareTarget = "x" | "native" | "download" | "copy";

const SHARE_TARGET_LABELS: Record<ShareTarget, string> = {
  x: "x",
  native: "native_share",
  download: "download_image",
  copy: "download_image",
};

export function trackShare(target: ShareTarget) {
  track("share", { share_target: SHARE_TARGET_LABELS[target] });
}
TS

demo_commit "Track which share button was used (share_target)"
demo_push "$BRANCH"
demo_open_pr "$BRANCH" "[demo D1] Add share_target to share analytics" \
"Demo D1 (spec/07 section 7.6). Adds a \`share_target\` parameter in \`lib/analytics.ts\`.

Opened by scripts/demo-prs/d1-share-target.sh (demo PR; the README in that folder says what to expect)."
