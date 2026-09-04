import { execFile } from "node:child_process";
import { access, cp, mkdir, open, readFile, rename, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function pluginRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

export function dataRoot() {
  const configured = process.env.ATTENTION_OS_DATA_DIR || process.env.PLUGIN_DATA;
  if (!configured) throw new Error("PLUGIN_DATA is unavailable. Run through Codex or set ATTENTION_OS_DATA_DIR for testing.");
  return path.resolve(configured);
}

export function configPath() {
  return path.join(dataRoot(), "config.json");
}

export async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(target, fallback = null) {
  try {
    return JSON.parse(await readFile(target, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function atomicWriteJson(target, value) {
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, target);
}

export async function readConfig() {
  return readJson(configPath(), null);
}

export async function writeConfig(config) {
  await atomicWriteJson(configPath(), config);
}

export function expandHome(value) {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return path.resolve(value);
}

export function defaultMemoryDir() {
  return path.join(os.homedir(), "Documents", "Attention OS", "memory");
}

export function assertSafeMemoryDir(target) {
  const resolved = path.resolve(target);
  const forbidden = new Set([path.parse(resolved).root, os.homedir(), pluginRoot(), dataRoot()]);
  if (forbidden.has(resolved)) throw new Error(`Refusing unsafe memory directory: ${resolved}`);
  return resolved;
}

export async function initializeMemory({ memoryDir, profile, resume = false }) {
  const target = assertSafeMemoryDir(memoryDir);
  const marker = path.join(target, ".attention-os.json");
  if (await pathExists(target)) {
    if (!(resume && await pathExists(marker))) {
      throw new Error(`Memory directory already exists. Choose a new directory or use --resume for an Attention OS directory: ${target}`);
    }
    return { target, created: false };
  }

  await mkdir(target, { recursive: true, mode: 0o700 });
  await cp(path.join(pluginRoot(), "assets", "memory-template"), target, { recursive: true, errorOnExist: true });
  const replacements = new Map([
    ["{{NAME}}", profile.name],
    ["{{TIMEZONE}}", profile.timezone],
    ["{{PRIMARY_GOAL}}", profile.primaryGoal],
    ["{{ROLE}}", profile.role],
    ["{{COACHING_STYLE}}", profile.coachingStyle],
    ["{{CREATED_AT}}", new Date().toISOString()]
  ]);
  for (const relative of ["AGENTS.md", "index.md", "profile.md", "goals/index.md", "coaching/framework.md", "coaching/current.md"]) {
    const file = path.join(target, relative);
    let body = await readFile(file, "utf8");
    for (const [token, replacement] of replacements) body = body.replaceAll(token, replacement);
    await writeFile(file, body, { mode: 0o600 });
  }
  await atomicWriteJson(marker, { schemaVersion: 1, createdAt: new Date().toISOString() });

  let gitInitialized = false;
  try {
    await execFileAsync("git", ["init", "-q"], { cwd: target });
    await execFileAsync("git", ["config", "user.name", "Attention OS"], { cwd: target });
    await execFileAsync("git", ["config", "user.email", "attention-os@local.invalid"], { cwd: target });
    await execFileAsync("git", ["add", "."], { cwd: target });
    await execFileAsync("git", ["commit", "-qm", "Initialize private Attention OS memory"], { cwd: target });
    gitInitialized = true;
  } catch {
    // Git is helpful provenance, but setup remains usable without it.
  }
  return { target, created: true, gitInitialized };
}

function jobPath(sessionId) {
  const safeId = String(sessionId).replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(dataRoot(), "runtime", "jobs", `${safeId}.json`);
}

async function fileSize(target) {
  if (!target) return 0;
  try {
    return (await stat(target)).size;
  } catch {
    return 0;
  }
}

export async function upsertSessionJob({ sessionId, transcriptPath = "", cwd = "", event }) {
  if (!sessionId) return null;
  const target = jobPath(sessionId);
  const previous = await readJson(target, {});
  const observedBytes = await fileSize(transcriptPath);
  const now = new Date().toISOString();
  const next = {
    schemaVersion: 1,
    sessionId,
    cwd,
    transcriptPath,
    fromByte: Number(previous.processedBytes || 0),
    observedBytes: Math.max(Number(previous.observedBytes || 0), observedBytes),
    processedBytes: Number(previous.processedBytes || 0),
    state: event === "session_end" ? "ready" : "dirty",
    lastEvent: event,
    createdAt: previous.createdAt || now,
    updatedAt: now,
    sourceAttempts: previous.sourceAttempts || []
  };
  await atomicWriteJson(target, next);
  return next;
}

export async function noteSourceAttempt({ sessionId, toolName }) {
  if (!sessionId) return null;
  const target = jobPath(sessionId);
  const job = await readJson(target, { schemaVersion: 1, sessionId, sourceAttempts: [] });
  const name = String(toolName || "unknown");
  const family = /calendar/i.test(name) ? "calendar"
    : /linear/i.test(name) ? "tasks"
      : /computer.?history/i.test(name) ? "activity"
        : /browser|web/i.test(name) ? "web"
          : /drive|docs|sheets|slides/i.test(name) ? "documents"
            : /bash|exec|terminal/i.test(name) ? "workspace"
              : "other";
  const attempts = new Set(job.sourceAttempts || []);
  attempts.add(family);
  job.sourceAttempts = [...attempts].sort();
  job.updatedAt = new Date().toISOString();
  await atomicWriteJson(target, job);
  return job;
}

export async function listJobs() {
  const directory = path.join(dataRoot(), "runtime", "jobs");
  const { readdir } = await import("node:fs/promises");
  try {
    const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
    return Promise.all(names.map((name) => readJson(path.join(directory, name))));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function readJob(sessionId) {
  return readJson(jobPath(sessionId), null);
}

export async function acknowledgeJob(sessionId) {
  const target = jobPath(sessionId);
  const job = await readJson(target, null);
  if (!job) throw new Error(`Unknown session job: ${sessionId}`);
  job.processedBytes = job.observedBytes;
  job.fromByte = job.observedBytes;
  job.state = "processed";
  job.processedAt = new Date().toISOString();
  await atomicWriteJson(target, job);
  return job;
}

async function readBounded(target, limit = 1800) {
  try {
    const handle = await open(target, "r");
    const buffer = Buffer.alloc(limit);
    const { bytesRead } = await handle.read(buffer, 0, limit, 0);
    await handle.close();
    return buffer.subarray(0, bytesRead).toString("utf8").trim();
  } catch {
    return "";
  }
}

export async function buildLaunchCard(config) {
  config ||= await readConfig();
  if (!config?.memoryDir) return "";
  const sections = await Promise.all([
    ["GOALS", "goals/index.md"],
    ["ACTIVE PROJECTS", "projects/index.md"],
    ["COACHING CONTINUITY", "coaching/current.md"],
    ["LATEST REVIEW", "reviews/latest.md"]
  ].map(async ([label, relative]) => {
    const body = await readBounded(path.join(config.memoryDir, relative));
    return body ? `${label}\n${body}` : "";
  }));
  return [
    "ATTENTION OS LAUNCH CARD (private user-owned memory; retrieve deeper files only when relevant)",
    ...sections.filter(Boolean),
    "Treat declarations and corrections as stronger evidence than observed behavior. Verify volatile facts in their live source before consequential action."
  ].join("\n\n").slice(0, 6500);
}
