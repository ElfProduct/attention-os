#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8"
}).trim();
const expected = JSON.parse(readFileSync(path.join(root, ".github", "identity.json"), "utf8"));

const argumentsList = process.argv.slice(2);
let tip = "HEAD";
let exclude = null;
for (let index = 0; index < argumentsList.length; index += 1) {
  if (argumentsList[index] === "--tip") tip = argumentsList[++index];
  else if (argumentsList[index] === "--exclude") exclude = argumentsList[++index];
  else throw new Error(`Unknown argument: ${argumentsList[index]}`);
}

const apiResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(expected.login)}`, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": `${expected.repository}-identity-check`
  },
  signal: AbortSignal.timeout(10000)
});
if (!apiResponse.ok) throw new Error(`GitHub identity lookup failed with HTTP ${apiResponse.status}`);
const account = await apiResponse.json();
if (account.login !== expected.login || account.id !== expected.accountId) {
  throw new Error(`GitHub account mismatch: expected ${expected.login} (${expected.accountId}), received ${account.login} (${account.id})`);
}

const expectedNoreply = `${expected.accountId}+${expected.login}@users.noreply.github.com`;
if (expected.noreplyEmail !== expectedNoreply) {
  throw new Error(`Configured noreply address does not match GitHub's ID+USERNAME format: ${expectedNoreply}`);
}

const origin = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
if (!origin.includes(`${expected.repository}.git`) && !origin.endsWith(expected.repository)) {
  throw new Error(`Origin does not point to ${expected.repository}: ${origin}`);
}

const revisionArguments = [tip];
if (exclude && !/^0+$/.test(exclude)) revisionArguments.push(`^${exclude}`);
const commits = execFileSync("git", ["rev-list", ...revisionArguments], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

for (const commit of commits) {
  const [authorName, authorEmail, committerName, committerEmail] = execFileSync(
    "git",
    ["show", "-s", "--format=%an%x00%ae%x00%cn%x00%ce", commit],
    { encoding: "utf8" }
  ).trim().split("\0");
  const actual = { authorName, authorEmail, committerName, committerEmail };
  const wanted = {
    authorName: expected.name,
    authorEmail: expected.noreplyEmail,
    committerName: expected.name,
    committerEmail: expected.noreplyEmail
  };
  for (const field of Object.keys(wanted)) {
    if (actual[field] !== wanted[field]) {
      throw new Error(`${commit.slice(0, 12)} has ${field}=${JSON.stringify(actual[field])}; expected ${JSON.stringify(wanted[field])}`);
    }
  }
}

process.stdout.write(`Verified ${commits.length} outgoing commit${commits.length === 1 ? "" : "s"} as ${expected.login} (${expected.accountId}) using ${expected.noreplyEmail}.\n`);
