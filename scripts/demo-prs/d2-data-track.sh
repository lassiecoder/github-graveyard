#!/usr/bin/env bash
# Demo D2: a bot-style PR adds a data-track-* attribute in app/page.tsx. No Security path matches;
# Security should be added by the classifier or tagged in by its AI reviewer.
# Usage: scripts/demo-prs/d2-data-track.sh <prompter-login>      (or DEMO_PROMPTER=<login>)
# The prompter is the GitHub login recorded in the commit's `Prompted-by:` line; use the login of
# whoever should be named in "Waiting on". Then, to remove the line: d2-push.sh.
. "$(dirname "$0")/lib.sh"
BRANCH=demo/d2-data-track

PROMPTER=${1:-${DEMO_PROMPTER:-}}
PROMPTER=${PROMPTER#@}
[ -n "$PROMPTER" ] || demo_die "usage: d2-data-track.sh <prompter-github-login> (or set DEMO_PROMPTER)"
printf '%s' "$PROMPTER" | grep -Eq '^[A-Za-z0-9]([A-Za-z0-9-]{0,38})$' || demo_die "'$PROMPTER' is not a GitHub login"

demo_init
demo_reset_branch "$BRANCH"

demo_replace app/page.tsx \
  '          <h2 className="text-center uppercase">' \
  '          <h2
            className="text-center uppercase"
            data-track="section_view"
            data-track-section="famously_deceased"
            data-track-viewer_login="anonymous"
          >'

demo_commit "Track how often the Famously deceased section is clicked

Adds data-track attributes to the section heading so the click is sent to analytics.

Prompted-by: @$PROMPTER
Co-Authored-By: Claude <noreply@anthropic.com>"
demo_push "$BRANCH"
demo_open_pr "$BRANCH" "[demo D2] Track clicks on the Famously deceased heading" \
"Demo D2 (spec/07 section 7.6). Opened as if by a bot: the commit has a \`Co-Authored-By: Claude\` trailer and \`Prompted-by: @$PROMPTER\`.

Adds a \`data-track-*\` attribute in \`app/page.tsx\`.

Opened by scripts/demo-prs/d2-data-track.sh."
