#!/usr/bin/env node
import path from "node:path";
import { defaultMemoryDir, expandHome, initializeMemory, readConfig, writeConfig } from "../lib/store.mjs";

function parseArgs(args) {
  const options = { resume: false };
  for (let index = 0; index < args.length; index += 1) {
    const part = args[index];
    if (part === "--resume") options.resume = true;
    else if (part.startsWith("--")) options[part.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = args[++index];
  }
  return options;
}

function required(value, name) {
  if (!String(value || "").trim()) throw new Error(`Missing --${name}`);
  return String(value).trim();
}

async function main() {
  const command = process.argv[2] || "init";
  if (command === "status") {
    process.stdout.write(`${JSON.stringify(await readConfig(), null, 2)}\n`);
    return;
  }
  if (command === "product") {
    const [, product, state] = process.argv.slice(2);
    const config = await readConfig();
    if (!config?.setupComplete) throw new Error("Run setup before configuring products");
    if (!(product in config.products)) throw new Error(`Unknown product: ${product}`);
    if (!["on", "off"].includes(state)) throw new Error("Product state must be on or off");
    config.products[product] = state === "on";
    config.updatedAt = new Date().toISOString();
    await writeConfig(config);
    process.stdout.write(`${JSON.stringify({ ok: true, product, enabled: config.products[product] }, null, 2)}\n`);
    return;
  }
  if (command !== "init") throw new Error(`Unknown setup command: ${command}`);

  const options = parseArgs(process.argv.slice(3));
  const profile = {
    name: required(options.name, "name"),
    timezone: required(options.timezone, "timezone"),
    primaryGoal: required(options.primaryGoal, "primary-goal"),
    role: required(options.role, "role"),
    coachingStyle: required(options.coachingStyle, "coaching-style")
  };
  const memoryDir = expandHome(options.memoryDir || defaultMemoryDir());
  const result = await initializeMemory({ memoryDir, profile, resume: options.resume });
  const config = {
    schemaVersion: 1,
    setupComplete: true,
    configuredAt: new Date().toISOString(),
    memoryDir: path.resolve(result.target),
    profile,
    products: {
      founderCoach: true,
      memoryReview: true,
      dailyReconciliation: true,
      eveningReview: true,
      morningBriefing: false,
      contentScout: false
    },
    integrations: {},
    automations: {}
  };
  await writeConfig(config);
  process.stdout.write(`${JSON.stringify({ ok: true, ...result, config }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`Attention OS setup failed: ${error.message}\n`);
  process.exitCode = 1;
});
