#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { acknowledgeJob, buildLaunchCard, listJobs, readConfig, readJob } from "../lib/store.mjs";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

async function status() {
  const config = await readConfig();
  const jobs = await listJobs();
  process.stdout.write(`${JSON.stringify({
    installed: true,
    setupComplete: Boolean(config?.setupComplete),
    memoryDir: config?.memoryDir || null,
    products: config?.products || {},
    pendingJobs: jobs.filter((job) => job.state === "ready").length,
    dirtyJobs: jobs.filter((job) => job.state === "dirty").length
  }, null, 2)}\n`);
}

async function serve() {
  const config = await readConfig();
  if (!config?.memoryDir) return fail("Run Attention OS setup first.");
  const port = Number(process.env.ATTENTION_OS_PORT || 4318);
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (request.method !== "GET" || request.url !== "/") {
      response.writeHead(404).end("Not found");
      return;
    }
    const files = ["index.md", "profile.md", "goals/index.md", "projects/index.md", "coaching/current.md", "reviews/latest.md"];
    const blocks = [];
    for (const relative of files) {
      try {
        blocks.push(`<section><h2>${escapeHtml(relative)}</h2><pre>${escapeHtml(await readFile(path.join(config.memoryDir, relative), "utf8"))}</pre></section>`);
      } catch {}
    }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(`<!doctype html><meta charset="utf-8"><title>Attention OS Memory Review</title><style>body{max-width:1000px;margin:48px auto;padding:0 24px;background:#f5f2eb;color:#182033;font:16px system-ui}h1{font-size:44px}section{background:#fff;border:1px solid #d8d3c8;border-radius:16px;padding:20px;margin:18px 0}pre{white-space:pre-wrap;font:15px/1.55 ui-monospace}</style><h1>Attention OS · Memory Review</h1><p>Read-only local view. Canonical files remain in your private memory repository.</p>${blocks.join("")}`);
  });
  server.listen(port, "127.0.0.1", () => process.stdout.write(`Memory Review: http://127.0.0.1:${port}/\n`));
}

const [command = "status", subcommand, id] = process.argv.slice(2);
if (command === "status") await status();
else if (command === "launch-card") process.stdout.write(`${await buildLaunchCard()}\n`);
else if (command === "jobs" && subcommand === "list") process.stdout.write(`${JSON.stringify(await listJobs(), null, 2)}\n`);
else if (command === "jobs" && subcommand === "show" && id) process.stdout.write(`${JSON.stringify(await readJob(id), null, 2)}\n`);
else if (command === "jobs" && subcommand === "ack" && id) process.stdout.write(`${JSON.stringify(await acknowledgeJob(id), null, 2)}\n`);
else if (command === "serve") await serve();
else fail("Usage: attention-os.mjs status | launch-card | jobs list | jobs show <id> | jobs ack <id> | serve");
