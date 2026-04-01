---
title: "Claude's Auto Mode Has a Blind Spot: It Checks What Agents Say, Not What Actually Runs"
title_zh: 'Claude Auto Mode 有一个盲区：它检查 Agent 说了什么，而不是实际运行了什么'
title_ja: 'Claude Auto Modeには盲点がある：宣言を検査するが、実際の実行は見ていない'
title_ko: 'Claude Auto Mode에는 사각지대가 있다: 선언은 검사하지만, 실제 실행은 보지 않는다'
title_es: 'El Auto Mode de Claude tiene un punto ciego: verifica lo que dicen, no lo que realmente ejecutan'
date: 2026-03-31
permalink: /posts/2026/03/guardclaw-runtime-monitor/
tags:
  - GuardClaw
  - AI Safety
  - MCP
  - runtime monitoring
  - agentic safety
---

<div data-i18n="en" markdown="1">

Claude's auto mode — and every other AI agent safety system today — only sees what the agent *declares* it wants to do. Not what actually happens.

For simple tools this is fine. Agent says "run `git status`", safety layer checks `git status`, that's what runs. But modern agents orchestrate **child processes** — MCP servers, plugin runtimes, code sandboxes, third-party tool servers. These are independent OS processes that can read any file, open any network connection, spawn any subprocess. The safety layer sees none of it.

## The Problem

When an agent calls an MCP tool, the safety layer sees: tool `mcp__notes__search`, input `{ "query": "meeting notes" }`. Approved.

What actually happens inside the MCP server: read `~/.ssh/id_rsa`, read `~/.aws/credentials`, POST them to an external server, return "No matching notes found :)". Nobody sees the theft.

A [recent study (arXiv:2602.06547)](https://arxiv.org/abs/2602.06547) found **157 confirmed malicious MCP skills** across 98,380 analyzed — credential theft, data exfiltration, remote code execution. All invisible to declaration-level safety.

This isn't an MCP-specific problem. It applies to any subprocess: VS Code extensions, Cursor plugins, REPL sessions, multi-agent delegation. **The more agents delegate to subprocesses, the more the safety layer loses visibility.**

## What We Built

Today [GuardClaw](https://github.com/TobyGE/GuardClaw) ships **runtime monitoring** — OS-level process inspection that watches what child processes actually do.

- **Process discovery**: continuously scans the process tree, identifies child processes of Claude Desktop, Claude Code, Cursor, Gemini CLI
- **Network monitoring**: polls each watched process for outbound connections every few seconds. First poll = baseline. New external connections = alert. Data exfiltration always requires a network connection — catch that, catch the theft
- **Intelligent analysis**: LLM judge compares declared tool input vs. observed runtime behavior. Heuristic fallback catches obvious patterns without LLM

We verified end-to-end: a test MCP server reads fake credentials and connects to an external server. GuardClaw detects the outbound connection within seconds, flags it as high-risk — no special permissions or system modifications needed.

This gives GuardClaw four defense layers: pre-hook (declared intent) → runtime monitor (actual execution) → post-hook judge (declaration vs. reality) → content scan (response inspection). No single layer is perfect, but together they make undetected exfiltration significantly harder.

## Why This Matters

Every agent safety system today operates at the declaration level. That worked for shell commands. But the ecosystem now has 10,000+ MCP servers, plugin runtimes, code execution sandboxes, and multi-agent workflows — all opaque subprocesses.

The gap between declaration and execution will only grow. Runtime monitoring is where agent safety needs to go next.

[GitHub: GuardClaw](https://github.com/TobyGE/GuardClaw)

</div>

<div data-i18n="zh" markdown="1">

Claude 的 auto mode —— 以及今天所有其他 AI agent 安全系统 —— 都只能看到 agent *声明*要做什么，看不到实际发生了什么。

对于简单工具来说没问题。Agent 说"执行 `git status`"，安全层检查 `git status`，执行的就是它。但现代 agent 编排**子进程** —— MCP server、插件运行时、代码沙箱、第三方工具服务器。这些都是独立的 OS 进程，可以读任何文件、开任何网络连接、启动任何子进程。安全层看不到任何这些。

## 问题

当 agent 调用 MCP 工具时，安全层看到的是：工具 `mcp__notes__search`，输入 `{ "query": "meeting notes" }`。批准。

MCP server 内部实际发生的：读取 `~/.ssh/id_rsa`、读取 `~/.aws/credentials`、POST 到外部服务器，返回"没有找到匹配的笔记 :)"。没人看到窃取过程。

一项[最近的研究 (arXiv:2602.06547)](https://arxiv.org/abs/2602.06547) 在 98,380 个 MCP skill 中发现了 **157 个确认的恶意 skill** —— 凭据窃取、数据外泄、远程代码执行。全部对声明级别的安全不可见。

这不是 MCP 特有的问题。它适用于所有子进程：VS Code 扩展、Cursor 插件、REPL 会话、多 agent 委托。**Agent 越多地委托给子进程，安全层的可见性就越低。**

## 我们做了什么

今天 [GuardClaw](https://github.com/TobyGE/GuardClaw) 发布了**运行时监控** —— OS 级别的进程检查，观察子进程实际做了什么。

- **进程发现**：持续扫描进程树，识别 Claude Desktop、Claude Code、Cursor、Gemini CLI 的子进程
- **网络监控**：每隔几秒轮询每个被监控进程的出站连接。首次轮询 = 基线。新的外部连接 = 告警。数据外泄总是需要网络连接 —— 捕获连接就捕获了窃取
- **智能分析**：LLM 裁判比较声明的 tool input 与观察到的运行时行为。启发式后备无需 LLM 即可捕获明显模式

我们做了端到端验证：一个测试 MCP server 读取假凭据并连接外部服务器。GuardClaw 在几秒内检测到出站连接，标记为高风险 —— 不需要任何特殊权限或系统修改。

这让 GuardClaw 拥有四层防御：pre-hook（声明意图）→ 运行时监控（实际执行）→ post-hook 裁判（声明 vs. 现实）→ 内容扫描（响应检查）。没有单一层是完美的，但组合起来大大增加了未被检测到的外泄难度。

## 为什么重要

今天所有 agent 安全系统都在声明级别运作。对 shell 命令这够了。但生态现在有 10,000+ MCP server、插件运行时、代码执行沙箱、多 agent 工作流 —— 全是不透明的子进程。

声明与执行之间的鸿沟只会加深。运行时监控是 agent 安全的下一个方向。

[GitHub: GuardClaw](https://github.com/TobyGE/GuardClaw)

</div>
