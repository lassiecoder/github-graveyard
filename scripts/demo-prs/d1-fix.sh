#!/usr/bin/env bash
# Demo D1, step 2: push the fix for the share_target bug (copy-link label) to the same branch (a new commit, same PR).
# Usage: scripts/demo-prs/d1-fix.sh   (after d1-share-target.sh, once the defect thread is posted)
. "$(dirname "$0")/lib.sh"
BRANCH=demo/d1-share-target

demo_init
demo_checkout_existing "$BRANCH"

demo_replace lib/analytics.ts \
  '  copy: "download_image",' \
  '  copy: "copy_link",'

demo_commit "Record copy-link shares as copy_link"
demo_push_follow_up "$BRANCH"
echo "Pushed the D1 fix to $BRANCH."
