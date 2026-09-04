---
name: attention-os-memory-review
description: Show, audit, correct, or explain what Attention OS remembers and where each claim came from. Use when a user asks what is remembered, disputes a memory, or wants a memory health review.
---

# Attention OS memory review

Read the private repository's `AGENTS.md` and `index.md`. Present the smallest
relevant set of claims with their status and provenance. Distinguish declarations,
observations, inferences, and unknowns.

For a local visual view, run `node "$PLUGIN_ROOT/scripts/attention-os.mjs" serve`
and open the loopback URL. It is read-only.

For a correction, briefly reflect the proposed semantic change. Seek confirmation
only when materially ambiguous; otherwise the explicit correction is authority.
Apply it as a new Git-backed transition. Never erase history, expose source
content, or alter external systems as part of a memory correction.
