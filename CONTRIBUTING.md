# Contributing

Attention OS is built around one standard: improve the lived founder loop
without weakening privacy, provenance, correction, or user control.

Before opening a pull request:

1. Enable the tracked hooks with `git config core.hooksPath .githooks`.
2. Use only synthetic fixtures.
3. Run `npm test` from `plugins/attention-os`.
4. Run the plugin validator documented in `DEVELOPMENT.md`.
5. Explain the user-visible failure the change solves.
6. Keep experimental products separable until their experience is accepted.

Never contribute personal transcripts, memory repositories, connector exports,
real communications, access tokens, private voice IDs, or generated artifacts
containing another person's information.
