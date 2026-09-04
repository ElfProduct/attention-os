# Security

Please report security issues privately through GitHub Security Advisories.
Do not open a public issue containing credentials, transcripts, private memory,
connector output, or another person's information.

The plugin follows these boundaries:

- hooks are advisory and must fail open rather than block a Codex turn;
- hooks write only under `PLUGIN_DATA` unless the user explicitly chooses a
  separate private-memory directory during onboarding;
- local interfaces bind only to loopback;
- secrets are stored in the operating-system keychain or provider-managed
  authorization flow;
- external writes require explicit authority in the current conversation;
- memory updates are auditable Git commits and undo uses a compensating commit;
- raw evidence, credentials, and third-party private information do not enter
  canonical memory or the public repository.

The bundled hooks are intentionally subject to Codex's normal trust review.
Do not bypass that review in installation instructions.
