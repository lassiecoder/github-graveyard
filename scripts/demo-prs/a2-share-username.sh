#!/usr/bin/env bash
# Demo A2: ShareBar adds a `data-track-username` attribute (the viewer's login) to the X share button,
# so every share event sends the username to analytics. components/ShareBar.tsx is not a floor path of
# data-privacy-egress, so only the classifier can add Security. See README.md for what to look for.
# Usage: scripts/demo-prs/a2-share-username.sh
# Re-running resets demo/a2-share-username to origin/main and updates the same PR.
. "$(dirname "$0")/lib.sh"
BRANCH=demo/a2-share-username

demo_init
demo_reset_branch "$BRANCH"

demo_replace components/ShareBar.tsx \
  '          data-track-mine={String(mine)}' \
  '          data-track-mine={String(mine)}
          data-track-username={login}'

demo_commit "Track the username on share clicks"
demo_push "$BRANCH"
demo_open_pr "$BRANCH" "[demo A2] Add username to share tracking" \
"Demo A2 (spec/12 section 12.1). Adds a \`data-track-username\` attribute to the share button in \`components/ShareBar.tsx\`.

Opened by scripts/demo-prs/a2-share-username.sh (demo PR; the README in that folder says what to expect)."
