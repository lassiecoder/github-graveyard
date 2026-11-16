#!/usr/bin/env bash
# Demo A1: a new joke in lib/epitaphs.ts. No team's path matches; every AI reviewer reads it, and
# with nothing found and CI green it merges with no person asked (merge_when_ready: true).
# Usage: scripts/demo-prs/a1-epitaph.sh
# Re-running resets demo/a1-epitaph to origin/main and updates the same PR.
. "$(dirname "$0")/lib.sh"
BRANCH=demo/a1-epitaph

demo_init
demo_reset_branch "$BRANCH"

demo_replace lib/epitaphs.ts \
  '  "Pushed to main, then to the grave.",' \
  '  "Pushed to main, then to the grave.",
  "Closed as stale by a bot it never met.",'

demo_commit "Add an epitaph: closed as stale by a bot it never met"
demo_push "$BRANCH"
demo_open_pr "$BRANCH" "[demo A1] New epitaph joke" \
"Demo A1 (spec/07 section 7.6, slice 3). Adds one joke to \`lib/epitaphs.ts\`. No team is on it: every AI reviewer reads it, and with nothing found and CI green it should merge with no person asked.

Opened by scripts/demo-prs/a1-epitaph.sh."
