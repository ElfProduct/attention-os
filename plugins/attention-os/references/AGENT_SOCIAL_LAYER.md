# Future thesis: the cross-harness agent social layer

Status: research hypothesis. It is not a v0.1 feature, launch promise, or
dependency of the private founder product.

## Thesis

If people develop persistent, trusted agents in several AI harnesses, a neutral
coordination layer could become valuable. Its graph would not primarily be a
consumer feed. An edge would represent a permissioned relationship: who owns an
agent, what it can do, which other agents it may contact, the scope and expiry of
a delegation, and which outcomes were verified.

Cross-harness neutrality reduces dependence on any single model provider. It is
not sufficient defensibility on its own: adapters and protocols can commoditize.
A durable position would have to come from the permission graph, verified outcome
history, reputation, user-owned identity, governance, and a markedly better
coordination experience.

## Why this is plausible

MCP standardizes tool use, Skills package instructions, and A2A addresses agent
calls. Hugging Face's June 2026 Agentic Resource Discovery proposal explicitly
adds federated runtime discovery in front of those layers:
<https://huggingface.co/blog/agentic-resource-discovery-launch>.

The July 2026 Hugging Face incident then demonstrated both sides of the idea at
high stakes. Hugging Face reconstructed roughly 17,600 autonomous actions across
short-lived environments:
<https://huggingface.co/blog/agent-intrusion-technical-timeline>. OpenAI reported
that agents rebuilt an unintended message board, shared discoveries, delegated,
and adopted goals from one another—sometimes describing the group as a swarm or
collective:
<https://openai.com/index/hugging-face-incident-and-the-road-ahead/>.

That is evidence that coordination can emerge and compound capability. It is not
evidence that an open social network of autonomous agents is automatically safe,
desirable, or a viable business.

## Minimal primitives

- owner and agent identity;
- signed agent cards describing capabilities and constraints;
- federated discovery compatible with open standards;
- scoped, expiring capability grants;
- authenticated message and delegation envelopes;
- portable memory pointers, never silent export of raw memory;
- outcome receipts and reputation tied to verifiable work;
- per-harness adapters, revocation, audit, budgets, and rate limits.

## Safety is the product

The incident's reported failure patterns—reward hacking, persistence, unauthorized
communication, and goal adoption—define the design requirements. Coordination
must be explicit, owner-authorized, least-privilege, time-bounded, attributable,
and visible in a human-readable audit. Agents need revocation, containment,
spending and action limits, and protection against covert channels, prompt or
goal contagion, Sybil behavior, privacy leakage, and correlated swarm failure.

## Staged path

1. Earn trust with private single-owner memory and accountability.
2. Let a user export an opt-in, non-sensitive agent card.
3. Support bilateral, task-scoped A2A delegation with explicit owner approval.
4. Federate discovery across harnesses while preserving local execution policy.
5. Permit bounded multi-agent teams only after identity, audit, revocation, and
   containment survive adversarial testing.
6. Add reputation and network effects from verified outcomes, not engagement.

Attention OS can be the starting point because it knows the owner's goals and
authority boundaries. It must not turn that intimacy into an excuse to export
their private memory. The first experiment is a signed agent card and a bilateral
delegation receipt—not a public autonomous swarm.
