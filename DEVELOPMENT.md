# Development

## Plugin checks

From `plugins/attention-os`:

```bash
npm test
npm run check
python3 /path/to/plugin-creator/scripts/validate_plugin.py .
```

Validate each directory under `skills/` with the Codex skill creator's
`quick_validate.py` script. The validators require PyYAML.

## Public commit identity

This repository uses `.githooks/pre-push` and
`scripts/verify-github-identity.mjs` to fail closed unless every outgoing
commit's author and committer resolve to the repository owner. Enable the
tracked hooks after cloning:

```bash
git config core.hooksPath .githooks
node scripts/verify-github-identity.mjs
```

The expected account ID and GitHub-provided noreply address live in
`.github/identity.json`. The verifier reads GitHub's public user endpoint before
every push and checks the ID-based noreply format. Do not substitute a short
username-only noreply address: it may resolve to another GitHub account.

## Video checks

From `video`:

```bash
npm install
npm run typecheck
npm run poster
npm run render
```

Verify the MP4 with `ffprobe`: H.264 video, AAC audio, 1440×810, 30 fps, and a
duration matching `src/data.json`. Inspect representative frames and confirm
that every narrated word is present in the caption data.

Do not use a real user's memory, task transcript, connectors, credentials, or
private voice configuration as a fixture.
