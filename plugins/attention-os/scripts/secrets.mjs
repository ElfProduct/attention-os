#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const [command, key] = process.argv.slice(2);
const allowed = new Set(["ELEVENLABS_API_KEY"]);

if (process.platform !== "darwin") {
  process.stderr.write("This alpha only automates macOS Keychain. On other systems, use the provider's secure credential store and expose the key only to the scheduled task.\n");
  process.exit(1);
}
if (!allowed.has(key)) {
  process.stderr.write(`Supported secret names: ${[...allowed].join(", ")}\n`);
  process.exit(1);
}

if (command === "set") {
  if (!process.stdin.isTTY) {
    process.stderr.write("Run this command in a local interactive terminal. Do not pipe or paste the key into a Codex chat.\n");
    process.exit(1);
  }
  await execFileAsync("security", ["add-generic-password", "-U", "-a", process.env.USER || "attention-os", "-s", `Attention OS ${key}`, "-w"], { stdio: "inherit" });
  process.stdout.write(`${key} was stored in macOS Keychain.\n`);
} else if (command === "delete") {
  await execFileAsync("security", ["delete-generic-password", "-a", process.env.USER || "attention-os", "-s", `Attention OS ${key}`]);
  process.stdout.write(`${key} was removed from macOS Keychain.\n`);
} else {
  process.stderr.write("Usage: secrets.mjs set|delete ELEVENLABS_API_KEY\n");
  process.exit(1);
}
