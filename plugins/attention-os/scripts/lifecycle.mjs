#!/usr/bin/env node
import { buildLaunchCard, noteSourceAttempt, readConfig, upsertSessionJob } from "../lib/store.mjs";

async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw.trim() ? JSON.parse(raw) : {};
}

function output(event, additionalContext = "") {
  const payload = { continue: true };
  if (additionalContext) {
    payload.hookSpecificOutput = { hookEventName: event, additionalContext };
  }
  process.stdout.write(JSON.stringify(payload));
}

function routePrompt(prompt) {
  if (/\b(set ?up|install|onboard|configure)\b/i.test(prompt)) {
    return "The user appears to be setting up Attention OS. Use the attention-os-onboarding skill. Preserve existing files and services; make no destructive changes.";
  }
  if (/\b(review|debrief)\b.*\b(today|day|yesterday)\b|\bhow did (?:my|the) day go\b/i.test(prompt)) {
    return "This is a daily reconciliation request. Use the attention-os-daily-reconciliation skill. Do not give a verdict until the relevant time window, intended plan, live systems of record, observed activity coverage, outcomes, and material off-device gaps have been checked.";
  }
  if (/\b(weekly review|review my week|how did .* week)\b/i.test(prompt)) {
    return "This is a weekly review. Compare declared goals, planned commitments, verified outcomes, and evidence gaps across the full week. Do not turn missing evidence into a negative judgment.";
  }
  if (/\b(remember|memory|forget|correction|not what i meant|that's wrong)\b/i.test(prompt)) {
    return "This may contain memory evidence or a correction. Use the attention-os-memory-compiler contract: preserve source provenance, keep facts separate from inference, and implement corrections as new compensating transitions rather than deleting history.";
  }
  if (/\b(priority|priorities|what should i do|focus|plan my day)\b/i.test(prompt)) {
    return "This is a focus decision. Use the attention-os-founder-coach skill. Compare real alternatives against common criteria, state the recommendation and evidence that would reverse it, and do not mutate calendars or task systems unless the user separately asks to apply the plan.";
  }
  return "";
}

try {
  const input = await readInput();
  const event = String(input.hook_event_name || "");
  const config = await readConfig();

  if (event === "SessionStart") {
    if (!config?.setupComplete) {
      output(event, "Attention OS is installed but not configured. When useful, tell the user to say: ‘Set up Attention OS for me.’ Then use the attention-os-onboarding skill. Do not write personal memory before they consent to the setup location and profile.");
    } else {
      output(event, await buildLaunchCard(config));
    }
    process.exit(0);
  }

  if (event === "UserPromptSubmit") {
    output(event, routePrompt(String(input.prompt || "")));
    process.exit(0);
  }

  if (event === "PostToolUse") {
    if (config?.setupComplete) await noteSourceAttempt({ sessionId: input.session_id, toolName: input.tool_name });
    output(event);
    process.exit(0);
  }

  const mapped = event === "Stop" ? "stop" : event === "PreCompact" ? "pre_compact" : event === "SessionEnd" ? "session_end" : null;
  if (mapped && config?.setupComplete) {
    await upsertSessionJob({
      sessionId: input.session_id,
      transcriptPath: input.transcript_path,
      cwd: input.cwd || process.cwd(),
      event: mapped
    });
  }
  output(event || "Unknown");
} catch (error) {
  // Lifecycle capture is advisory and must never block the user's Codex work.
  if (process.env.ATTENTION_OS_DEBUG === "1") process.stderr.write(`${error.stack || error.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
}
