#!/usr/bin/env bash
# Demo A1: a new joke in lib/epitaphs.ts. No team's path matches; every AI reviewer reads it, and
# with nothing found and CI green it merges with no person asked (merge_when_ready: true).
# Usage: scripts/demo-prs/a1-epitaph.sh
# Re-running resets demo/a1-epitaph to origin/main and updates the same PR, with an unused joke.
. "$(dirname "$0")/lib.sh"
BRANCH=demo/a1-epitaph

demo_init
demo_reset_branch "$BRANCH"

# Candidate jokes, in order. The first one not already in lib/epitaphs.ts is used, so a re-run
# never adds a duplicate of an earlier A1. Add more here when they are all used.
CANDIDATES=(
  "Closed as stale by a bot it never met."
  "Its README promised a roadmap."
  "Last commit: fix typo. Next commit: never."
  "Outlived by its own TODO comments."
  "Forked once, by a bot."
)
JOKE=
for c in "${CANDIDATES[@]}"; do
  if ! grep -qF -- "\"$c\"" lib/epitaphs.ts; then JOKE=$c; break; fi
done
[ -n "$JOKE" ] || demo_die "every candidate joke is already in lib/epitaphs.ts; add new ones to CANDIDATES in $0"

demo_replace lib/epitaphs.ts \
  '  "Pushed to main, then to the grave.",' \
  "  \"Pushed to main, then to the grave.\",
  \"$JOKE\","

demo_commit "Add an epitaph: $JOKE"
demo_push "$BRANCH"
demo_open_pr "$BRANCH" "[demo A1] New epitaph joke" \
"Demo A1 (spec/07 section 7.6, slice 3). Adds one joke to \`lib/epitaphs.ts\`. No team is on it: every AI reviewer reads it, and with nothing found and CI green it should merge with no person asked.

Opened by scripts/demo-prs/a1-epitaph.sh."
