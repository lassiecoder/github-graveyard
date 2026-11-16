#!/usr/bin/env bash
# Shared helpers for the demo-PR scripts. Source it; do not run it.
# Needs: git, gh (authenticated for this repo). Nothing here ever pushes to main.

set -euo pipefail

DEMO_BASE=main

demo_die() { echo "demo: $*" >&2; exit 1; }

# demo_init: check we are in the demo repo with a clean tree, fetch origin/main,
# and arrange to return to the branch the person started on.
demo_init() {
  command -v git >/dev/null || demo_die "git is required"
  command -v gh >/dev/null || demo_die "gh is required"
  git rev-parse --show-toplevel >/dev/null 2>&1 || demo_die "run this inside a clone of github-graveyard-cloud"
  cd "$(git rev-parse --show-toplevel)"
  local url
  url=$(git remote get-url origin 2>/dev/null) || demo_die "no 'origin' remote"
  case "$url" in
    *github-graveyard-cloud*) ;;
    *) demo_die "origin is $url; these scripts are for github-graveyard-cloud only" ;;
  esac
  DEMO_REPO=${DEMO_REPO:-$(printf '%s' "$url" | sed -E 's#(\.git)?$##; s#^.*[:/]([^/:]+/[^/]+)$#\1#')}
  if [ -n "$(git status --porcelain)" ]; then
    demo_die "working tree is not clean; commit, stash or remove your changes first"
  fi
  DEMO_START=$(git symbolic-ref --short -q HEAD || git rev-parse HEAD)
  trap 'git checkout -q "$DEMO_START" 2>/dev/null || true' EXIT
  git fetch -q origin "$DEMO_BASE"
}

# demo_guard_branch <branch>: demo branches live under demo/ and are never main.
demo_guard_branch() {
  case "$1" in
    demo/*) ;;
    *) demo_die "refusing branch '$1': demo branches must be named demo/..." ;;
  esac
}

# demo_reset_branch <branch>: (re)create the branch from origin/main, discarding any earlier run.
demo_reset_branch() {
  demo_guard_branch "$1"
  git checkout -q -B "$1" "origin/$DEMO_BASE"
}

# demo_checkout_existing <branch>: check out the demo branch as it is on origin (for follow-up pushes).
demo_checkout_existing() {
  demo_guard_branch "$1"
  git fetch -q origin "$1" 2>/dev/null || demo_die "origin/$1 not found; run the script that opens the demo first"
  git checkout -q -B "$1" "origin/$1"
}

# demo_replace <file> <old> <new>: replace the single-line text <old> with <new>; <old> must occur exactly once.
demo_replace() {
  local n
  n=$(grep -cF -- "$2" "$1" || true)
  [ "$n" = 1 ] || demo_die "expected exactly one match for '$2' in $1, found $n (has main drifted?)"
  OLD=$2 NEW=$3 perl -0pi -e 's/\Q$ENV{OLD}\E/$ENV{NEW}/' "$1"
}

# demo_commit <message> [extra git-commit args]: commit everything; fail if the script changed nothing.
demo_commit() {
  local msg=$1; shift
  git add -A
  git diff --cached --quiet && demo_die "the change produced no diff; nothing to commit"
  git commit -q -m "$msg" "$@"
}

# demo_push <branch>: reset the remote demo branch to this commit (re-runs replace the earlier run).
demo_push() {
  demo_guard_branch "$1"
  git push -q --force-with-lease="$1" origin "HEAD:refs/heads/$1"
}

# demo_push_follow_up <branch>: plain fast-forward push for a follow-up commit.
demo_push_follow_up() {
  demo_guard_branch "$1"
  git push -q origin "HEAD:refs/heads/$1"
}

# demo_open_pr <branch> <title> <body>: create the PR, or update the open one for this branch.
demo_open_pr() {
  local branch=$1 title=$2 body=$3 num
  num=$(gh pr list -R "$DEMO_REPO" --head "$branch" --base "$DEMO_BASE" --state open --json number --jq '.[0].number // empty')
  if [ -n "$num" ]; then
    gh pr edit "$num" -R "$DEMO_REPO" --title "$title" --body "$body" >/dev/null
    echo "Updated existing PR #$num: $(gh pr view "$num" -R "$DEMO_REPO" --json url --jq .url)"
  else
    gh pr create -R "$DEMO_REPO" --base "$DEMO_BASE" --head "$branch" --title "$title" --body "$body"
  fi
}
