# Demo D3: a reviewer requests changes on D1 (manual)

Needs a second account: a member of the Security team (see `.triforce/security/team.yml` and the
people in `.triforce/config.yml`). The author of the PR is the account that ran the D1 script.

1. Run `scripts/demo-prs/d1-share-target.sh`. Wait for the review to finish. Optionally run
   `scripts/demo-prs/d1-fix.sh` and wait again, until Security has been asked.
2. As the Security member, open the `[demo D1]` PR, choose Review changes, pick **Request
   changes**, write a short comment such as "Please don't send raw share targets to analytics", and
   submit.
3. Look at the Triforce comment and check:
   - [ ] "Waiting on @author".
   - [ ] The review is quoted under "Reviewers asked you to".
4. As the author, push any commit to `demo/d1-share-target` (for example run `d1-fix.sh` if you
   have not yet, or add an empty commit: `git checkout demo/d1-share-target &&
   git commit --allow-empty -m "Address review" && git push origin demo/d1-share-target`).
5. Check:
   - [ ] The PR goes back to the "ready" view.
   - [ ] The Security reviewer is requested again.

Do not merge the PR by hand.
