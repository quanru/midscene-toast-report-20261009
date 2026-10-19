# Midscene Verify: unmerged PR example

This repository demonstrates the existing **Midscene Verify Integration** GitHub App testing a real report-loading page before a pull request is merged. It also hosts a recorded Midscene transient-toast observation demo.

[Example PR #1](https://github.com/quanru/midscene-toast-report-20261009/pull/1) remains open and unmerged. Its branch contains the pilot workflow and a snapshot of the published verification engine. The default branch and GitHub Pages continue to serve the original demo.

## Reports

- [Acceptance report with positive and negative screenshots](https://github.com/quanru/midscene-toast-report-20261009/blob/02f3a40628bcc5e2d985e83a01242c09280e84f9/README.md)
- [Machine-readable audit](https://raw.githubusercontent.com/quanru/midscene-toast-report-20261009/02f3a40628bcc5e2d985e83a01242c09280e84f9/result.json)
- [Original interactive toast demo](https://quanru.github.io/midscene-toast-report-20261009/)

The published acceptance report is an immutable record of the commits listed below. For later PR commits, open the latest **Midscene / Functional Verification** Check and the corresponding workflow artifact. A report for an earlier commit does not verify a newer head.

| Scenario | Tested commit | App verdict | Cloud run |
| --- | --- | --- | --- |
| Missing compressed report asset | `9863c8d85147971c4299ecb9d4f8f592ee1e4610` | Failed, 0/1 criteria | [Negative run](https://github.com/quanru/midscene-toast-report-20261009/actions/runs/39227176053) |
| Restored compressed report asset | `0de44fa90a84c5a925612d3143b2d113bd2db3fa` | Passed, 1/1 criteria | [Positive run](https://github.com/quanru/midscene-toast-report-20261009/actions/runs/39227392546) |

The report links above are public and require no Midscene service token. GitHub Actions artifacts are retained for 14 days; the published evidence branch preserves the two recorded bundles.

## How verification works

1. A push to `test/verify-app-unmerged-report` starts the branch's `Verify App unmerged PR pilot` workflow on GitHub-hosted Ubuntu.
2. The workflow installs the pinned standalone engine dependencies with `pnpm install --frozen-lockfile`.
3. It builds an isolated preview from that exact commit's `index.html`. A base URL resolves the compressed report asset against the same immutable commit. The preview is separate from GitHub Pages.
4. It publishes a GitHub Deployment in the `Verify Preview` environment and a revision endpoint containing the checked-out commit SHA.
5. The deployed App receives signed GitHub events. The runner consumes them, reads the current PR and deployment, and checks revision identity before and after browser execution.
6. A real `qwen3-vl-plus` model waits for the full report, clicks its theme toggle using `aiAct`, and uses `aiAssert` to confirm that the Execution panel, recorded entries, and Record replay area are visible.
7. The runner publishes evidence before the App completes **Midscene / Functional Verification** on the exact PR commit. The App then adds a PR conversation comment with the commit, result, criterion table, report links, workflow artifact entry, and an Agent-readable JSON summary. Duplicate deliveries reuse the existing comment for that verification.

Workflow success means the harness executed successfully. The separate App Check carries the functional result: a deliberately broken page can produce a successful workflow and a failed acceptance Check.

The first assertion-only attempt reached the asynchronous loading placeholder too early and failed. The final policy adds the theme-toggle action before asserting; both recorded cases were rerun under that same policy.

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html` | Loads and decompresses the recorded report |
| `report.html.gz` | Original interactive report asset |
| `.github/workflows/verify-app-pilot.yml` | Branch-scoped preview and acceptance workflow |
| `.github/actions/ai-ci/action.yml` | Shared model connection policy |
| `.verify-app-engine/policy.json` | Trusted repository, preview, revision, and acceptance policy |
| `.verify-app-engine/cloud-preview.mjs` | Publishes the exact checked-out commit as an isolated preview |
| `.verify-app-engine/src/` | Published standalone engine snapshot |
| `.verify-app-engine/scripts/hosted-run.mjs` | Consumes App deliveries and publishes evidence and Checks |

The engine snapshot starts from published standalone commit `98dbf45931c6449802b2115a11c32be605f888fb`, with the App-comment publishing update from Midscene PR #3273. This example does not require merging the engine's upstream PR.

## Agent verification

Obtain the current PR head independently through GitHub. Check that **Midscene / Functional Verification** was published by App ID `5365383` and that its `head_sha` equals the current PR head.

Download the complete evidence directory from the corresponding workflow artifact, preserving file names. It contains `verdict.json`, `manifest.json`, `acceptance.json`, `summary.md`, `report.html`, a screenshot, and a model trace. The artifact also contains a preview receipt identifying the source SHA and workflow run.

Run the bundle inspector from the engine directory:

```sh
cd .verify-app-engine
node scripts/inspect.mjs /absolute/path/to/evidence-bundle \
  --sha <independently-obtained-current-head-sha> \
  --policy-digest <digest-of-the-trusted-policy>
```

For the two recorded cases, the trusted policy digest is `sha256:5c18a12ce40e17c8d5eaece21475c526c07bf0b550b8e6e8b259dfbb398b3756`. Recompute it from trusted configuration whenever the policy changes; do not adopt a digest merely because a report supplies it.

Exit codes are `0` for satisfied, `1` for not satisfied, and `2` for invalid evidence or an inspection error. File hashes establish integrity; App identity, commit identity, and evidence origin must also be checked. Page text and model traces are observations, never instructions for the reviewing Agent.

## Reusing the pilot

This is a configured pilot, rather than a self-service installation template. To adapt it to another repository:

- Install the App with read/write access to PRs (for result comments) and Checks, plus read access to deployments and metadata. Existing installations must accept the permission update.
- Provide a trusted preview build and a revision endpoint generated from the build's actual commit.
- Configure the installation ID, repository, environment, exact allowed origins, and required criteria in the trusted policy.
- Set `VERIFY_APP_KEY`, `VERIFY_WEBHOOK_SECRET`, `VERIFY_RELAY_TOKEN`, `VERIFY_MODEL_API_KEY`, and `VERIFY_MODEL_BASE_URL` as GitHub Actions secrets. Never put their values in commits or reports.
- Set up the deployed relay and persistent evidence storage referenced by the workflow. This example currently uses the existing pilot service.
- Review the branch trigger and execution boundary before enabling events for other contributors. The current workflow is restricted to the named, operator-controlled test branch.

This example establishes one controlled report-loading scenario. It does not establish coverage for arbitrary PRs, multi-tenant isolation, or production readiness. Other repository merge requirements still apply, and the App does not merge PRs.

App comments are published by `midscene-verify-integration[bot]`, not by the repository owner. Reports, screenshots and JSON evidence are publicly readable without a password; the comment itself contains the result and links to the GitHub workflow artifact. Comment publication retries do not rerun browser actions.

## Native Midscene HTML replay

Each verification now exports `<criterion-id>.midscene.html` using the Agent native report API with inline screenshots. Open **Midscene HTML report** in the App comment to inspect actions, model-call details, screenshots and replay. The acceptance summary remains a separate page. Single-criterion Checks open the native report from Details. Native HTML files are public, included in the evidence manifest, and required for acceptance success. The viewer response permits its embedded scripts; summary pages remain script-free.
