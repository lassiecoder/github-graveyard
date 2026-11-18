# Demo PRs

Scripts that open the demo pull requests from spec/07 section 7.6 on this repo, so a person can run a
slice's demo by hand. Nothing here runs by itself: the PR that adds these scripts does not run them.

## Use

- Run from a clean clone of `github-graveyard-cloud` with `git` and an authenticated `gh`.
- Each script refuses to run on a dirty tree, creates its branch from `origin/main`, commits the
  change, force-resets its own `demo/...` branch on origin, and opens the PR (or updates the one
  that is already open, so re-running never opens a second). It never pushes to `main`, and returns
  you to the branch you started on.
- Each PR is titled `[demo D1] ...`, `[demo D2] ...`, `[demo A1] ...`.
- Running the scripts makes the live Triforce service evaluate the PRs, which spends model tokens.
- Close or merge a demo PR before re-running its script if you want a fresh PR rather than an update.

Two accounts are needed: the **author** (runs the scripts) and, for the Security steps, a **second
account** that is a Security team member (D3, and approvals in D1/D2).

## D1: `d1-share-target.sh`, then `d1-fix.sh`

Adds a `share_target` parameter in `lib/analytics.ts` with one small bug: copy-link shares are recorded as `download_image` (ShareBar's `data-track-method` calls them `copy_link`). `lib/analytics.ts` is a path of `data-privacy-egress` (Security, required, high tier).

Run `d1-share-target.sh`, and look for:

- [ ] Security required by path, high tier.
- [ ] The check is in progress ("Preparing your review") until the AI reviewers finish.
- [ ] Then "Waiting on @author", with the defect as an inline thread and "1 defect outstanding" in the author comment.
- [ ] Nobody else is notified.

Then run `d1-fix.sh` (pushes the fix to the same branch) and look for:

- [ ] The defect thread is resolved with "Fixed in <short sha>".
- [ ] One Security role comment.
- [ ] A decision thread from the privacy lens.
- [ ] Two people requested, and the second-person row.

Whether the AI reviewers raise anything else (for example, the privacy lens's point as a defect rather than a decision, or that `trackShare` runs alongside ShareBar's existing `share` event) is model judgement. A second defect thread means the planted code needs another look, not that Triforce miscounted. The privacy-lens decision check may not appear when nothing is left to decide.

Who must act: the second account approves (twice, for a high-tier PR) to see the gate pass.

## D2: `d2-data-track.sh <prompter-login>`, then `d2-push.sh`

Pass the GitHub login of the person who should count as the prompter, or set `DEMO_PROMPTER`. The
script commits with `Co-Authored-By: Claude <noreply@anthropic.com>` and `Prompted-by: @<login>` as
if a bot opened it, and adds `data-track-*` attributes to the heading in `app/page.tsx`. The commit is
made with your own git identity, so the PR author is you: to see it fully as a bot PR, run the script
from the bot account's checkout.

Note: "Waiting on @prompter" and the prompter ping need a Bot-authored PR with a defect, which this
script does not produce. The D2 tag-in part (the checks below other than the prompter one) still demos.
The prompter behaviour is proven by tests (`packages/worker/test/review/feedback.test.ts`, S2.9, in
aitriforce-cloud).

Look for:

- [ ] No Security path matches (`app/page.tsx` is not one).
- [ ] Security is added by the classifier or tagged in by its AI reviewer, with a `path:line` reason.
- [ ] "Waiting on" names the prompter, who is pinged.

Then run `d2-push.sh` (removes the `data-track-*` lines) and look for:

- [ ] Security is still on the PR after the line is gone.

Who must act: the prompter account (to see the ping); a Security member to approve.

## D3: `d3-request-changes.md` (manual)

A Security member requests changes on the D1 PR. See the file for steps. Look for:

- [ ] "Waiting on @author", with the review quoted under "Reviewers asked you to".
- [ ] The author's next push re-requests that reviewer.

Who must act: the second account (the Security reviewer), then the author.

## A1: `a1-epitaph.sh`

Adds one joke to `lib/epitaphs.ts`. No team is on it. Re-runs pick a joke that is not already in the
file (the first unused one from the script's list), and fail if every candidate is used.

- [ ] Read by every AI reviewer.
- [ ] With nothing found and CI green, merges with no person asked (`merge_when_ready: true`).

Who must act: nobody.

## A2: `a2-share-username.sh`

Adds `data-track-username={login}` to the X share button in `components/ShareBar.tsx`, so each share
sends the viewer's username to analytics. No comment says so. `components/ShareBar.tsx` is not one of
the floor paths of `data-privacy-egress` (Security's paths for it are `lib/github.ts`, `lib/digs.ts`,
`lib/analytics.ts`, `lib/site.ts`, `components/Analytics.tsx`, `app/api/dig/**`), so only the
classifier can add Security here.

Look for:

- [ ] The classifier adds `data-privacy-egress`, with a `file:line` reason (not a path match).
- [ ] High tier.
- [ ] An IE decision thread from the privacy lens.
- [ ] Two people requested, and the second-person row.

Who must act: a Security member approves, twice (high tier), to see the gate pass.

## Known limit

CI runs on this repo (GitHub-hosted), so D1's CI wait and A1's auto-merge on green CI can be shown.
