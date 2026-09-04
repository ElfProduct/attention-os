# Architecture

```text
Codex task
  -> plugin skill selects the workflow
  -> lifecycle hook stores a bounded source pointer
  -> private runtime job becomes ready at SessionEnd
  -> memory compiler skill reconciles durable evidence
  -> user-owned Markdown + one local Git commit
  -> bounded launch card informs the next relevant task

Fresh Calendar / tasks / activity / documents
  -> explicit connector authorization
  -> daily review or morning briefing
  -> source-labelled output
  -> canonical memory only when durable
```

## Storage

- Plugin code is read-only after installation.
- `PLUGIN_DATA` stores configuration and transient lifecycle jobs.
- The generated memory repository lives at the user-approved location and has no
  remote by default.
- Runtime jobs store transcript paths and byte boundaries, not copied transcripts.
- Credentials belong in provider authorization or an OS credential store.

## Reliability boundaries

Hooks fail open so memory capture cannot block ordinary work. `Stop` and
`PreCompact` checkpoint only. `SessionEnd` makes a job eligible; semantic memory
writing occurs later through the compiler skill. The compiler acknowledges a job
only after a validated memory commit or an explicit no-op.

This alpha relies on Codex to execute semantic workflows. It is not a standalone
daemon and does not promise identical behavior across other harnesses yet.
