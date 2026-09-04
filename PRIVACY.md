# Privacy

Attention OS is local-first. The public repository contains code, templates,
synthetic examples, and the product explainer. It contains no user memory,
transcripts, credentials, browsing data, communications, or activity history.

After setup, personal configuration and runtime state live in the writable
plugin data directory supplied by Codex. The generated memory repository is
private by default. Attention OS never makes it public or adds a remote.

The lifecycle hook stores transcript file references and byte positions. It
does not copy raw transcripts into Git. A memory compiler may read a bounded
source range when the user has enabled compilation. Canonical memory should
contain the minimum durable understanding required for future work and a link
to provenance, not raw private evidence.

External sources are opt-in. Each connected service retains its own terms and
permissions. API keys must be entered through a local terminal or the
provider's authorization interface, never pasted into a chat, committed, or
written to canonical memory.

Uninstalling the plugin does not delete the user's private memory. Deletion is
a separate explicit operation so uninstall cannot silently destroy user data.
