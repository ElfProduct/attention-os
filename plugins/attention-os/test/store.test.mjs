import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  acknowledgeJob,
  buildLaunchCard,
  initializeMemory,
  listJobs,
  readConfig,
  upsertSessionJob,
  writeConfig
} from "../lib/store.mjs";

async function isolated() {
  const root = await mkdtemp(path.join(os.tmpdir(), "attention-os-test-"));
  process.env.ATTENTION_OS_DATA_DIR = path.join(root, "data");
  return root;
}

test("setup creates generic private memory and local git metadata", async () => {
  const root = await isolated();
  const memoryDir = path.join(root, "memory");
  const profile = {
    name: "Avery",
    timezone: "Europe/London",
    primaryGoal: "Reach ten paying customers",
    role: "solo founder",
    coachingStyle: "direct and evidence-led"
  };
  const result = await initializeMemory({ memoryDir, profile });
  assert.equal(result.created, true);
  assert.match(await readFile(path.join(memoryDir, "profile.md"), "utf8"), /Avery/);
  assert.doesNotMatch(await readFile(path.join(memoryDir, "profile.md"), "utf8"), /\{\{/);
  await assert.rejects(() => initializeMemory({ memoryDir, profile }), /already exists/);
});

test("config and launch card remain inside the isolated data root", async () => {
  const root = await isolated();
  const memoryDir = path.join(root, "memory");
  await initializeMemory({
    memoryDir,
    profile: { name: "Sam", timezone: "UTC", primaryGoal: "Ship", role: "founder", coachingStyle: "plain" }
  });
  await writeConfig({ setupComplete: true, memoryDir });
  assert.equal((await readConfig()).memoryDir, memoryDir);
  assert.match(await buildLaunchCard(), /Ship/);
});

test("lifecycle jobs store source boundaries and acknowledge only on request", async () => {
  const root = await isolated();
  const transcriptPath = path.join(root, "transcript.jsonl");
  await import("node:fs/promises").then(({ writeFile }) => writeFile(transcriptPath, "one\ntwo\n"));
  await upsertSessionJob({ sessionId: "session/1", transcriptPath, cwd: root, event: "stop" });
  let [job] = await listJobs();
  assert.equal(job.state, "dirty");
  assert.equal(job.observedBytes, 8);
  await upsertSessionJob({ sessionId: "session/1", transcriptPath, cwd: root, event: "session_end" });
  [job] = await listJobs();
  assert.equal(job.state, "ready");
  await acknowledgeJob("session/1");
  [job] = await listJobs();
  assert.equal(job.state, "processed");
  assert.equal(job.processedBytes, 8);
});
