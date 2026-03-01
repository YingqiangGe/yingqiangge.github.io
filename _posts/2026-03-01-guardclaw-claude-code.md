---
title: 'GuardClaw: Smart Permission Control for Claude Code'
date: 2026-03-01
permalink: /posts/2026/03/guardclaw-claude-code/
tags:
  - agentic safety
  - Claude Code
  - GuardClaw
---

In a [previous post](/posts/2026/02/guardclaw-openclaw/), I described how [GuardClaw](https://github.com/TobyGE/GuardClaw) secures multi-agent workflows on OpenClaw. Today I want to focus on a simpler but equally common use case: **Claude Code**.

If you use Claude Code, you have probably faced a familiar dilemma: the default permission mode interrupts you for every shell command and file write, making autonomous workflows painfully slow. The alternative — `--dangerously-skip-permissions` — removes all guardrails entirely, which is exactly as risky as the flag name suggests. There is no middle ground out of the box.

[GuardClaw](https://github.com/TobyGE/GuardClaw) is an open-source tool I built to fill this gap. It acts as an intelligent permission layer that auto-approves safe operations and only surfaces genuinely dangerous ones for human review.

## The Problem: All or Nothing

Claude Code ships with two permission modes:

**Default mode** asks for approval on nearly every tool call. A typical coding session involves dozens of `git status`, `ls`, `cat`, and `npm install` commands — all safe, all requiring a manual click. This friction breaks flow and makes it impractical to let the agent work autonomously on multi-step tasks.

**`--dangerously-skip-permissions`** goes to the other extreme: every tool call is auto-approved with zero oversight. This means `rm -rf /`, reading your SSH keys, or curling your credentials to an external server would all execute silently. For any serious development environment, this is unacceptable.

What we actually need is **risk-proportional permission control** — a system that understands the difference between `git status` and `rm -rf ~`, and acts accordingly.

## How GuardClaw Works

GuardClaw runs as a local service that integrates with Claude Code via its [HTTP hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) mechanism. Every tool call passes through GuardClaw before execution:

```
Claude Code Tool Call
       │
       ▼
   GuardClaw
       │
       ├── Score 1-7: Auto-approve (safe)
       │     "git status", "ls -la", "npm install"
       │
       ├── Score 8: Pass to user (needs judgment)
       │     "reading ~/.aws/credentials"
       │
       └── Score 9-10: Block (dangerous)
             "curl ... | bash", reverse shells
```

The scoring engine combines two layers:

**Rule-based fast path.** Common safe commands (`git log`, `cat`, `grep`, `npm test`) are recognized instantly and auto-approved without any LLM call. Known dangerous patterns (reverse shells, fork bombs, credential exfiltration) are blocked immediately. This layer handles ~80% of tool calls with sub-millisecond latency.

**Local LLM judge.** Commands that fall in the gray area are sent to a small local model (I use Qwen3-4B via [LM Studio](https://lmstudio.ai/)) for contextual analysis. The model sees the command, its parameters, and the recent chain of tool calls — so it can detect multi-step attacks like "read a secret file, then curl it to an external server." This adds ~2 seconds of latency, but only for the minority of ambiguous commands.

## What It Looks Like in Practice

With GuardClaw running, a typical Claude Code session feels almost like `--dangerously-skip-permissions` — safe commands fly through without interruption:

```
⛨ GuardClaw: auto-approved (score: 1) — "git status" is a read-only Git operation
⛨ GuardClaw: auto-approved (score: 1) — Search/list command "ls" only reads the filesystem
⛨ GuardClaw: auto-approved (score: 2) — npm install runs locally within the project
```

But when something genuinely risky happens, GuardClaw flags it with a clear explanation and lets you decide:

```
⛨ GuardClaw: (score: 8) — Reading sensitive file: SSH credentials — ~/.ssh/id_rsa
[Claude Code asks for your approval]
```

## Key Design Decisions

**Local-first.** All analysis runs on your machine. No credentials, commands, or code leave your laptop. The LLM judge runs locally via LM Studio or Ollama — no cloud API calls for security analysis.

**Fail-open by default.** If GuardClaw crashes or is unavailable, Claude Code falls back to its normal permission flow. Your workflow is never blocked by GuardClaw being down. (A fail-closed mode is available for high-security environments.)

**Chain analysis.** GuardClaw tracks the sequence of recent tool calls per session. A `curl` command alone might be safe, but a `curl POST` right after reading `~/.aws/credentials` is flagged as potential data exfiltration. Single-command analysis misses these patterns.

**Adaptive memory.** When you approve or deny a flagged command, GuardClaw learns from your decisions. Patterns you consistently approve get auto-approved in the future; patterns you deny get stricter scrutiny. The system adapts to your specific workflow.

## Setup

GuardClaw integrates with Claude Code through a simple hooks configuration in `~/.claude/settings.json`. It works identically whether you use Claude Code from the terminal or the VS Code extension. Full setup instructions are in the [README](https://github.com/TobyGE/GuardClaw).

## Why This Matters

As AI coding agents become more capable, they need more autonomy to be useful — but more autonomy without proportional safety controls is a liability. The binary choice between "approve everything manually" and "trust everything blindly" does not scale.

GuardClaw is our attempt at a practical middle ground: an agent safety layer that is transparent, local, adaptive, and open source. It is part of a broader research agenda on [agentic safety](/posts/2025/07/agentic-safety/) that I believe will become increasingly critical as agents move from writing code to deploying it.

If you are building with Claude Code and want smarter permission control, give [GuardClaw](https://github.com/TobyGE/GuardClaw) a try. Contributions and feedback are welcome.
