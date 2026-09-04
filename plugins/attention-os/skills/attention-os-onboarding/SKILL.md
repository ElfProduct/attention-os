---
name: attention-os-onboarding
description: Set up Attention OS after installation by creating a private memory repository, configuring founder coaching, enabling chosen products, and scheduling recurring reviews. Use when a user asks to install, configure, or set up Attention OS.
---

# Attention OS onboarding

Create a working personal system without unexpectedly modifying an existing
memory, calendar, task manager, repository, or credential store.

Ask no more than three compact questions covering: name and timezone; primary
goal and present role; preferred coaching style, desired recurring briefing and
review times, and optional sources or video narration. State that the default
private memory location is `~/Documents/Attention OS/memory`. Never overwrite
an existing path; resume only after verifying its `.attention-os.json` marker.

Run:

```bash
node "$PLUGIN_ROOT/scripts/setup.mjs" init \
  --name "<name>" --timezone "<IANA timezone>" \
  --primary-goal "<goal>" --role "<role>" \
  --coaching-style "<style>" --memory-dir "<approved location>"
```

Verify the memory files, local Git commit when Git is available, and absence of
a Git remote. Never copy the installer's memory or configuration.

Explain each requested external source and permission before connecting. Use
provider authorization UI where available. Never ask for an API key in chat;
for ElevenLabs on macOS, direct the user to the plugin's interactive
`scripts/secrets.mjs` command in their own terminal.

Enable or disable optional products with
`node "$PLUGIN_ROOT/scripts/setup.mjs" product <product-name> on|off` after
initialization. Do not mark a product enabled until its required local runtime
and authorization checks pass.

Use Codex scheduled tasks for only the routines the user chose. Recommended
defaults are a morning briefing, evening reconciliation, and weekly review in
their timezone. Each prompt must invoke the relevant Attention OS skill, use the
private memory, verify volatile claims in live sources, and stay quiet when no
action is needed. Explain hook trust or connector approval and respect denial.

Finish with `attention-os.mjs status` and one launch-card read. Separate fully
configured features from optional ones still waiting on permission or credentials.
