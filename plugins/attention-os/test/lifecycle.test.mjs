import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const script = path.resolve("scripts/lifecycle.mjs");

async function invoke(input, dataDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: path.dirname(path.dirname(script)),
      env: { ...process.env, ATTENTION_OS_DATA_DIR: dataDir },
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr)));
    child.stdin.end(JSON.stringify(input));
  });
}

test("unconfigured SessionStart routes to guided setup without blocking", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "attention-os-hook-"));
  const result = JSON.parse((await invoke({ hook_event_name: "SessionStart" }, path.join(root, "data"))).stdout);
  assert.equal(result.continue, true);
  assert.match(result.hookSpecificOutput.additionalContext, /Set up Attention OS/);
});

test("focus prompt receives bounded coaching guidance", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "attention-os-hook-"));
  const result = JSON.parse((await invoke({ hook_event_name: "UserPromptSubmit", prompt: "What should I focus on today?" }, path.join(root, "data"))).stdout);
  assert.equal(result.continue, true);
  assert.match(result.hookSpecificOutput.additionalContext, /focus decision/i);
});
