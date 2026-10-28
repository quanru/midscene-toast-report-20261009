# Context-driven GitHub App acceptance pilot

This unmerged PR exercises acceptance planning from PR text, linked issue #2, and immutable base/head code. The operator policy supplies the approved preview path and a maximum of two generated criteria; it contains no scripted acceptance steps.

The trusted pilot workflow publishes an isolated preview, then the App collects context, freezes a generated plan, runs real Midscene browser checks, and publishes a new App comment with native HTML replay and Agent JSON. Workflow/engine scaffolding and this README are explicitly excluded from UI acceptance scope; the exclusion list remains visible in the context manifest.

This branch is operator-controlled pilot infrastructure, not a general untrusted-PR execution service. Do not copy its secret-bearing workflow to arbitrary PR branches. The main branch and GitHub Pages remain unchanged.

## Evidence

Read the App comment for exact commit, plan, context manifest, functional result, and native HTML reports. The first revision intentionally omits persistence so automatic verification should detect the mismatch against the linked issue. A follow-up revision will restore persistence and be verified independently.


## Preview registration pilot

The branch-scoped workflow publishes the existing isolated preview, then calls the public Midscene preview-registration Action pinned to `c2b2324d4423f35f878c6a551e7de96fcf6100b9`. It supplies PR 3, the actual deployed head SHA, preview URL and environment. A hosted runner uses the GitHub App identity to consume the signed deployment event and publish verification evidence. The workflow remains operator-controlled integration infrastructure, not a template for executing arbitrary PR code with App secrets. No PR merge or production-site change is required.
