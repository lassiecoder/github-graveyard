#!/usr/bin/env bash
# Demo D2, step 2: push a commit that removes the data-track-* lines Security was tagged in for.
# Security should stay on the PR. Usage: scripts/demo-prs/d2-push.sh (after d2-data-track.sh).
. "$(dirname "$0")/lib.sh"
BRANCH=demo/d2-data-track

demo_init
demo_checkout_existing "$BRANCH"

demo_replace app/page.tsx '            data-track="section_view"' '            id="famously-deceased"'
demo_replace app/page.tsx '            data-track-section="famously_deceased"' ''
demo_replace app/page.tsx '            data-track-viewer_login="anonymous"' ''
# Drop the two blank lines the replacements left behind.
perl -0pi -e 's/(id="famously-deceased"\n)\n\n/$1/' app/page.tsx

demo_commit "Drop the data-track attributes, keep an anchor id

Co-Authored-By: Claude <noreply@anthropic.com>"
demo_push_follow_up "$BRANCH"
echo "Pushed a commit removing the data-track lines to $BRANCH."
