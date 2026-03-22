---
title: 'GuardClaw: Smart Permission Control for Claude Code'
title_zh: 'GuardClaw：Claude Code 的智能权限控制'
title_ja: 'GuardClaw：Claude Code のスマート権限制御'
title_ko: 'GuardClaw: Claude Code를 위한 스마트 권한 제어'
title_es: 'GuardClaw: Control Inteligente de Permisos para Claude Code'
date: 2026-03-01
permalink: /posts/2026/03/guardclaw-claude-code/
tags:
  - agentic safety
  - Claude Code
  - GuardClaw
---

<div data-i18n="en" markdown="1">

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

</div>

<div data-i18n="zh" markdown="1">

在[上一篇文章](/posts/2026/02/guardclaw-openclaw/)中，我介绍了 [GuardClaw](https://github.com/TobyGE/GuardClaw) 如何保障 OpenClaw 上多智能体工作流的安全。今天我想聚焦一个更简单但同样常见的使用场景：**Claude Code**。

如果你使用 Claude Code，你可能面临过一个常见的两难困境：默认的权限模式会在每一个 shell 命令和文件写入时打断你，导致自主工作流极其缓慢。而另一种选择 —— `--dangerously-skip-permissions` —— 则完全移除所有安全防护，正如这个标志的名字所暗示的那样危险。开箱即用的方案中没有中间地带。

[GuardClaw](https://github.com/TobyGE/GuardClaw) 是我构建的一个开源工具，用于填补这一空白。它作为一个智能权限层，自动批准安全操作，只将真正危险的操作提交人工审核。

## 问题：非此即彼

Claude Code 提供了两种权限模式：

**默认模式**几乎在每次工具调用时都要求批准。一个典型的编程会话涉及数十个 `git status`、`ls`、`cat` 和 `npm install` 命令——全都是安全的，却都需要手动点击确认。这种摩擦打断了工作流，使得让智能体在多步骤任务上自主工作变得不切实际。

**`--dangerously-skip-permissions`** 走向了另一个极端：每个工具调用都在零监督下自动批准。这意味着 `rm -rf /`、读取你的 SSH 密钥、或将你的凭据 curl 到外部服务器都会默默执行。对于任何严肃的开发环境来说，这是不可接受的。

我们真正需要的是**与风险成比例的权限控制**——一个能区分 `git status` 和 `rm -rf ~` 并据此做出响应的系统。

## GuardClaw 的工作原理

GuardClaw 作为本地服务运行，通过 [HTTP hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) 机制与 Claude Code 集成。每个工具调用在执行前都会经过 GuardClaw：

```
Claude Code Tool Call
       │
       ▼
   GuardClaw
       │
       ├── 评分 1-7：自动批准（安全）
       │     "git status", "ls -la", "npm install"
       │
       ├── 评分 8：交由用户（需要判断）
       │     "reading ~/.aws/credentials"
       │
       └── 评分 9-10：阻止（危险）
             "curl ... | bash", 反向 shell
```

评分引擎结合了两个层次：

**基于规则的快速路径。**常见的安全命令（`git log`、`cat`、`grep`、`npm test`）会被即时识别并自动批准，无需任何 LLM 调用。已知的危险模式（反向 shell、fork 炸弹、凭据窃取）会被立即阻止。该层以亚毫秒级延迟处理约 80% 的工具调用。

**本地 LLM 裁判。**落入灰色地带的命令会被发送到一个小型本地模型（我使用通过 [LM Studio](https://lmstudio.ai/) 运行的 Qwen3-4B）进行上下文分析。模型可以看到命令、其参数以及最近的工具调用链——因此它可以检测多步攻击，例如"读取一个秘密文件，然后将其 curl 到外部服务器"。这增加了约 2 秒的延迟，但仅针对少数模糊命令。

## 实际使用效果

启动 GuardClaw 后，典型的 Claude Code 会话感觉几乎像 `--dangerously-skip-permissions`——安全命令畅通无阻：

```
⛨ GuardClaw: auto-approved (score: 1) — "git status" is a read-only Git operation
⛨ GuardClaw: auto-approved (score: 1) — Search/list command "ls" only reads the filesystem
⛨ GuardClaw: auto-approved (score: 2) — npm install runs locally within the project
```

但当真正有风险的操作发生时，GuardClaw 会标记它并给出清晰的解释，让你做出决定：

```
⛨ GuardClaw: (score: 8) — Reading sensitive file: SSH credentials — ~/.ssh/id_rsa
[Claude Code asks for your approval]
```

## 关键设计决策

**本地优先。**所有分析都在你的机器上运行。没有凭据、命令或代码会离开你的笔记本电脑。LLM 裁判通过 LM Studio 或 Ollama 在本地运行——安全分析不涉及任何云 API 调用。

**默认故障开放。**如果 GuardClaw 崩溃或不可用，Claude Code 会回退到正常的权限流程。你的工作流永远不会因为 GuardClaw 宕机而被阻断。（高安全环境可使用故障关闭模式。）

**链式分析。**GuardClaw 跟踪每个会话中最近工具调用的序列。单独的 `curl` 命令可能是安全的，但在读取 `~/.aws/credentials` 之后紧接着执行 `curl POST` 则会被标记为潜在的数据窃取。单命令分析会遗漏这些模式。

**自适应记忆。**当你批准或拒绝一个被标记的命令时，GuardClaw 会从你的决策中学习。你持续批准的模式将在未来被自动批准；你拒绝的模式将受到更严格的审查。系统会适应你特定的工作流程。

## 安装设置

GuardClaw 通过 `~/.claude/settings.json` 中的简单 hooks 配置与 Claude Code 集成。无论你从终端还是 VS Code 扩展使用 Claude Code，它的工作方式完全相同。完整的安装说明请参阅 [README](https://github.com/TobyGE/GuardClaw)。

## 为什么这很重要

随着 AI 编程智能体变得越来越强大，它们需要更多的自主权才能发挥作用——但没有相应安全控制的更多自主权就是一种隐患。在"手动批准一切"和"盲目信任一切"之间的二元选择无法扩展。

GuardClaw 是我们对实用中间方案的尝试：一个透明、本地化、自适应且开源的智能体安全层。它是[智能体安全](/posts/2025/07/agentic-safety/)更广泛研究议程的一部分，我认为随着智能体从编写代码转向部署代码，这一研究方向将变得越来越关键。

如果你正在使用 Claude Code 构建项目，并希望获得更智能的权限控制，请试试 [GuardClaw](https://github.com/TobyGE/GuardClaw)。欢迎贡献和反馈。

</div>

<div data-i18n="ja" markdown="1">

[前回の記事](/posts/2026/02/guardclaw-openclaw/)では、[GuardClaw](https://github.com/TobyGE/GuardClaw) が OpenClaw 上のマルチエージェントワークフローをどのように保護するかについて説明しました。今日は、よりシンプルながら同様に一般的なユースケースである **Claude Code** に焦点を当てたいと思います。

Claude Code を使用している方なら、おなじみのジレンマに直面したことがあるでしょう。デフォルトの権限モードでは、すべてのシェルコマンドとファイル書き込みのたびに中断され、自律的なワークフローが非常に遅くなります。もう一つの選択肢である `--dangerously-skip-permissions` は、すべてのガードレールを完全に削除します。これはフラグ名が示す通りに危険です。すぐに使える中間的な選択肢はありません。

[GuardClaw](https://github.com/TobyGE/GuardClaw) は、このギャップを埋めるために私が構築したオープンソースツールです。安全な操作を自動承認し、本当に危険なものだけを人間のレビューに提示するインテリジェントな権限レイヤーとして機能します。

## 問題：オール・オア・ナッシング

Claude Code には2つの権限モードがあります：

**デフォルトモード**では、ほぼすべてのツール呼び出しで承認を求められます。典型的なコーディングセッションでは、`git status`、`ls`、`cat`、`npm install` など数十のコマンドが実行されますが、すべて安全であるにもかかわらず、手動でのクリックが必要です。この摩擦はフローを中断し、エージェントにマルチステップタスクを自律的に作業させることを非現実的にします。

**`--dangerously-skip-permissions`** は反対の極端に走ります。すべてのツール呼び出しが監視なしで自動承認されます。これは `rm -rf /`、SSH キーの読み取り、または資格情報を外部サーバーに curl することがすべてサイレントに実行されることを意味します。真剣な開発環境では、これは受け入れられません。

私たちが実際に必要としているのは、**リスクに比例した権限制御** — `git status` と `rm -rf ~` の違いを理解し、それに応じて行動するシステムです。

## GuardClaw の仕組み

GuardClaw は、[HTTP hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) メカニズムを通じて Claude Code と統合するローカルサービスとして動作します。すべてのツール呼び出しは実行前に GuardClaw を通過します：

```
Claude Code Tool Call
       │
       ▼
   GuardClaw
       │
       ├── スコア 1-7：自動承認（安全）
       │     "git status", "ls -la", "npm install"
       │
       ├── スコア 8：ユーザーに転送（判断が必要）
       │     "reading ~/.aws/credentials"
       │
       └── スコア 9-10：ブロック（危険）
             "curl ... | bash", リバースシェル
```

スコアリングエンジンは2つのレイヤーを組み合わせています：

**ルールベースの高速パス。**一般的な安全なコマンド（`git log`、`cat`、`grep`、`npm test`）は即座に認識され、LLM 呼び出しなしで自動承認されます。既知の危険なパターン（リバースシェル、fork 爆弾、資格情報の窃取）は即座にブロックされます。このレイヤーはサブミリ秒のレイテンシでツール呼び出しの約80%を処理します。

**ローカル LLM ジャッジ。**グレーゾーンに該当するコマンドは、コンテキスト分析のために小さなローカルモデル（私は [LM Studio](https://lmstudio.ai/) 経由で Qwen3-4B を使用）に送信されます。モデルはコマンド、そのパラメータ、および最近のツール呼び出しチェーンを確認できるため、「秘密ファイルを読み取り、それを外部サーバーに curl する」といったマルチステップ攻撃を検出できます。これにより約2秒のレイテンシが追加されますが、曖昧なコマンドの少数にのみ適用されます。

## 実際の使用感

GuardClaw を実行すると、典型的な Claude Code セッションはほぼ `--dangerously-skip-permissions` のように感じられます — 安全なコマンドは中断なく通過します：

```
⛨ GuardClaw: auto-approved (score: 1) — "git status" is a read-only Git operation
⛨ GuardClaw: auto-approved (score: 1) — Search/list command "ls" only reads the filesystem
⛨ GuardClaw: auto-approved (score: 2) — npm install runs locally within the project
```

しかし、本当にリスクのあることが発生した場合、GuardClaw は明確な説明とともにフラグを立て、判断を委ねます：

```
⛨ GuardClaw: (score: 8) — Reading sensitive file: SSH credentials — ~/.ssh/id_rsa
[Claude Code asks for your approval]
```

## 主要な設計上の決定

**ローカルファースト。**すべての分析はあなたのマシン上で実行されます。資格情報、コマンド、コードがラップトップの外に出ることはありません。LLM ジャッジは LM Studio または Ollama を介してローカルで実行されます — セキュリティ分析のためのクラウド API 呼び出しはありません。

**デフォルトでフェイルオープン。**GuardClaw がクラッシュまたは利用不可になった場合、Claude Code は通常の権限フローにフォールバックします。GuardClaw がダウンしてもワークフローがブロックされることはありません。（高セキュリティ環境向けにフェイルクローズドモードも利用可能です。）

**チェーン分析。**GuardClaw はセッションごとに最近のツール呼び出しのシーケンスを追跡します。`curl` コマンド単体は安全かもしれませんが、`~/.aws/credentials` の読み取り直後の `curl POST` は潜在的なデータ窃取としてフラグが立てられます。単一コマンドの分析ではこれらのパターンを見逃します。

**適応型メモリ。**フラグが立てられたコマンドを承認または拒否すると、GuardClaw はあなたの決定から学習します。一貫して承認するパターンは将来自動承認され、拒否するパターンはより厳しい精査を受けます。システムはあなた固有のワークフローに適応します。

## セットアップ

GuardClaw は `~/.claude/settings.json` のシンプルな hooks 設定を通じて Claude Code と統合されます。ターミナルからでも VS Code 拡張機能からでも Claude Code を使用する場合、動作は完全に同じです。完全なセットアップ手順は [README](https://github.com/TobyGE/GuardClaw) にあります。

## なぜこれが重要なのか

AI コーディングエージェントがより高度になるにつれ、有用であるためにはより多くの自律性が必要になります。しかし、それに比例した安全制御なしの自律性の拡大はリスクです。「すべてを手動で承認する」と「すべてを盲目的に信頼する」の二者択一はスケールしません。

GuardClaw は実用的な中間地点への私たちの試みです。透明性があり、ローカルで動作し、適応的で、オープンソースのエージェントセーフティレイヤーです。これは[エージェントの安全性](/posts/2025/07/agentic-safety/)に関するより広範な研究アジェンダの一部であり、エージェントがコードの作成からデプロイに移行するにつれて、ますます重要になると私は考えています。

Claude Code で構築していて、よりスマートな権限制御が必要な方は、ぜひ [GuardClaw](https://github.com/TobyGE/GuardClaw) をお試しください。貢献とフィードバックを歓迎します。

</div>

<div data-i18n="ko" markdown="1">

[이전 게시물](/posts/2026/02/guardclaw-openclaw/)에서 [GuardClaw](https://github.com/TobyGE/GuardClaw)가 OpenClaw의 멀티 에이전트 워크플로를 어떻게 보호하는지 설명했습니다. 오늘은 더 간단하지만 마찬가지로 흔한 사용 사례인 **Claude Code**에 초점을 맞추려 합니다.

Claude Code를 사용해 본 적이 있다면, 익숙한 딜레마에 직면한 경험이 있을 것입니다. 기본 권한 모드는 모든 셸 명령과 파일 쓰기마다 중단되어 자율 워크플로를 극도로 느리게 만듭니다. 대안인 `--dangerously-skip-permissions`는 모든 가드레일을 완전히 제거하며, 플래그 이름이 시사하는 그대로 위험합니다. 기본 제공되는 중간 지대는 없습니다.

[GuardClaw](https://github.com/TobyGE/GuardClaw)는 이 격차를 메우기 위해 제가 만든 오픈소스 도구입니다. 안전한 작업은 자동 승인하고 진정으로 위험한 작업만 사람의 검토를 위해 표시하는 지능형 권한 레이어로 작동합니다.

## 문제: 전부 아니면 전무

Claude Code는 두 가지 권한 모드를 제공합니다:

**기본 모드**는 거의 모든 도구 호출에서 승인을 요청합니다. 일반적인 코딩 세션에는 수십 개의 `git status`, `ls`, `cat`, `npm install` 명령이 포함되는데, 모두 안전함에도 불구하고 수동 클릭이 필요합니다. 이러한 마찰은 흐름을 깨뜨리고 에이전트가 다단계 작업에서 자율적으로 작업하는 것을 비현실적으로 만듭니다.

**`--dangerously-skip-permissions`**는 반대 극단으로 치닫습니다. 모든 도구 호출이 감독 없이 자동 승인됩니다. 이는 `rm -rf /`, SSH 키 읽기, 또는 자격 증명을 외부 서버로 curl하는 것이 모두 조용히 실행됨을 의미합니다. 진지한 개발 환경에서 이는 받아들일 수 없습니다.

우리가 실제로 필요한 것은 **위험에 비례하는 권한 제어** — `git status`와 `rm -rf ~`의 차이를 이해하고 그에 따라 행동하는 시스템입니다.

## GuardClaw 작동 방식

GuardClaw는 [HTTP hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) 메커니즘을 통해 Claude Code와 통합되는 로컬 서비스로 실행됩니다. 모든 도구 호출은 실행 전에 GuardClaw를 거칩니다:

```
Claude Code Tool Call
       │
       ▼
   GuardClaw
       │
       ├── 점수 1-7: 자동 승인 (안전)
       │     "git status", "ls -la", "npm install"
       │
       ├── 점수 8: 사용자에게 전달 (판단 필요)
       │     "reading ~/.aws/credentials"
       │
       └── 점수 9-10: 차단 (위험)
             "curl ... | bash", 리버스 셸
```

스코어링 엔진은 두 개의 레이어를 결합합니다:

**규칙 기반 빠른 경로.** 일반적인 안전 명령(`git log`, `cat`, `grep`, `npm test`)은 즉시 인식되어 LLM 호출 없이 자동 승인됩니다. 알려진 위험 패턴(리버스 셸, fork 폭탄, 자격 증명 탈취)은 즉시 차단됩니다. 이 레이어는 서브밀리초 지연 시간으로 도구 호출의 약 80%를 처리합니다.

**로컬 LLM 심판.** 회색 지대에 해당하는 명령은 맥락 분석을 위해 소형 로컬 모델(저는 [LM Studio](https://lmstudio.ai/)를 통한 Qwen3-4B를 사용합니다)로 전송됩니다. 모델은 명령, 매개변수, 그리고 최근 도구 호출 체인을 확인할 수 있어 "비밀 파일을 읽은 다음 외부 서버로 curl하는" 것과 같은 다단계 공격을 탐지할 수 있습니다. 이로 인해 약 2초의 지연이 추가되지만, 소수의 모호한 명령에만 해당됩니다.

## 실제 사용 모습

GuardClaw를 실행하면, 일반적인 Claude Code 세션은 거의 `--dangerously-skip-permissions`처럼 느껴집니다 — 안전한 명령은 중단 없이 통과합니다:

```
⛨ GuardClaw: auto-approved (score: 1) — "git status" is a read-only Git operation
⛨ GuardClaw: auto-approved (score: 1) — Search/list command "ls" only reads the filesystem
⛨ GuardClaw: auto-approved (score: 2) — npm install runs locally within the project
```

하지만 진정으로 위험한 일이 발생하면, GuardClaw는 명확한 설명과 함께 플래그를 표시하고 여러분이 결정하도록 합니다:

```
⛨ GuardClaw: (score: 8) — Reading sensitive file: SSH credentials — ~/.ssh/id_rsa
[Claude Code asks for your approval]
```

## 핵심 설계 결정

**로컬 우선.** 모든 분석은 여러분의 머신에서 실행됩니다. 자격 증명, 명령, 코드가 노트북 밖으로 나가지 않습니다. LLM 심판은 LM Studio 또는 Ollama를 통해 로컬에서 실행됩니다 — 보안 분석을 위한 클라우드 API 호출이 없습니다.

**기본 페일 오픈.** GuardClaw가 충돌하거나 사용할 수 없는 경우, Claude Code는 정상적인 권한 흐름으로 폴백합니다. GuardClaw가 다운되어도 워크플로가 차단되지 않습니다. (고보안 환경을 위한 페일 클로즈드 모드도 사용 가능합니다.)

**체인 분석.** GuardClaw는 세션별로 최근 도구 호출 시퀀스를 추적합니다. `curl` 명령 단독으로는 안전할 수 있지만, `~/.aws/credentials`를 읽은 직후의 `curl POST`는 잠재적 데이터 탈취로 플래그됩니다. 단일 명령 분석으로는 이러한 패턴을 놓칩니다.

**적응형 메모리.** 플래그된 명령을 승인하거나 거부하면, GuardClaw는 여러분의 결정에서 학습합니다. 일관되게 승인하는 패턴은 향후 자동 승인되고, 거부하는 패턴은 더 엄격한 검토를 받습니다. 시스템은 여러분의 특정 워크플로에 적응합니다.

## 설정

GuardClaw는 `~/.claude/settings.json`의 간단한 hooks 설정을 통해 Claude Code와 통합됩니다. 터미널에서든 VS Code 확장에서든 Claude Code를 사용하든 동일하게 작동합니다. 전체 설정 지침은 [README](https://github.com/TobyGE/GuardClaw)에 있습니다.

## 왜 이것이 중요한가

AI 코딩 에이전트가 더욱 강력해짐에 따라, 유용하려면 더 많은 자율성이 필요합니다 — 하지만 그에 비례하는 안전 제어 없는 자율성 확대는 위험 요소입니다. "모든 것을 수동으로 승인"과 "모든 것을 맹목적으로 신뢰" 사이의 이분법적 선택은 확장되지 않습니다.

GuardClaw는 실용적인 중간 지점을 향한 우리의 시도입니다: 투명하고, 로컬에서 실행되며, 적응적이고, 오픈소스인 에이전트 안전 레이어입니다. 이것은 [에이전트 안전성](/posts/2025/07/agentic-safety/)에 관한 더 넓은 연구 의제의 일부이며, 에이전트가 코드 작성에서 배포로 전환함에 따라 점점 더 중요해질 것이라고 믿습니다.

Claude Code로 구축하면서 더 스마트한 권한 제어를 원하신다면, [GuardClaw](https://github.com/TobyGE/GuardClaw)를 사용해 보세요. 기여와 피드백을 환영합니다.

</div>

<div data-i18n="es" markdown="1">

En una [publicación anterior](/posts/2026/02/guardclaw-openclaw/), describí cómo [GuardClaw](https://github.com/TobyGE/GuardClaw) asegura los flujos de trabajo multi-agente en OpenClaw. Hoy quiero centrarme en un caso de uso más simple pero igualmente común: **Claude Code**.

Si usas Claude Code, probablemente te hayas enfrentado a un dilema familiar: el modo de permisos predeterminado te interrumpe en cada comando de shell y escritura de archivo, haciendo que los flujos de trabajo autónomos sean dolorosamente lentos. La alternativa — `--dangerously-skip-permissions` — elimina todas las protecciones por completo, lo cual es exactamente tan arriesgado como sugiere el nombre del flag. No hay término medio disponible de fábrica.

[GuardClaw](https://github.com/TobyGE/GuardClaw) es una herramienta de código abierto que construí para llenar este vacío. Actúa como una capa de permisos inteligente que aprueba automáticamente las operaciones seguras y solo presenta las genuinamente peligrosas para revisión humana.

## El Problema: Todo o Nada

Claude Code viene con dos modos de permisos:

**El modo predeterminado** pide aprobación en casi cada llamada de herramienta. Una sesión de programación típica involucra docenas de comandos `git status`, `ls`, `cat` y `npm install` — todos seguros, todos requiriendo un clic manual. Esta fricción rompe el flujo y hace impracticable dejar que el agente trabaje autónomamente en tareas de múltiples pasos.

**`--dangerously-skip-permissions`** va al otro extremo: cada llamada de herramienta se aprueba automáticamente sin supervisión alguna. Esto significa que `rm -rf /`, leer tus claves SSH, o enviar tus credenciales con curl a un servidor externo se ejecutarían silenciosamente. Para cualquier entorno de desarrollo serio, esto es inaceptable.

Lo que realmente necesitamos es un **control de permisos proporcional al riesgo** — un sistema que entienda la diferencia entre `git status` y `rm -rf ~`, y actúe en consecuencia.

## Cómo Funciona GuardClaw

GuardClaw se ejecuta como un servicio local que se integra con Claude Code a través de su mecanismo de [HTTP hooks](https://docs.anthropic.com/en/docs/claude-code/hooks). Cada llamada de herramienta pasa por GuardClaw antes de la ejecución:

```
Claude Code Tool Call
       │
       ▼
   GuardClaw
       │
       ├── Puntuación 1-7: Auto-aprobado (seguro)
       │     "git status", "ls -la", "npm install"
       │
       ├── Puntuación 8: Pasar al usuario (requiere juicio)
       │     "reading ~/.aws/credentials"
       │
       └── Puntuación 9-10: Bloquear (peligroso)
             "curl ... | bash", reverse shells
```

El motor de puntuación combina dos capas:

**Ruta rápida basada en reglas.** Los comandos seguros comunes (`git log`, `cat`, `grep`, `npm test`) se reconocen instantáneamente y se aprueban automáticamente sin ninguna llamada a LLM. Los patrones peligrosos conocidos (reverse shells, fork bombs, exfiltración de credenciales) se bloquean inmediatamente. Esta capa maneja aproximadamente el 80% de las llamadas de herramientas con latencia inferior al milisegundo.

**Juez LLM local.** Los comandos que caen en la zona gris se envían a un modelo local pequeño (yo uso Qwen3-4B a través de [LM Studio](https://lmstudio.ai/)) para análisis contextual. El modelo ve el comando, sus parámetros y la cadena reciente de llamadas de herramientas — por lo que puede detectar ataques de múltiples pasos como "leer un archivo secreto, luego enviarlo con curl a un servidor externo". Esto añade ~2 segundos de latencia, pero solo para la minoría de comandos ambiguos.

## Cómo Se Ve en la Práctica

Con GuardClaw ejecutándose, una sesión típica de Claude Code se siente casi como `--dangerously-skip-permissions` — los comandos seguros pasan sin interrupción:

```
⛨ GuardClaw: auto-approved (score: 1) — "git status" is a read-only Git operation
⛨ GuardClaw: auto-approved (score: 1) — Search/list command "ls" only reads the filesystem
⛨ GuardClaw: auto-approved (score: 2) — npm install runs locally within the project
```

Pero cuando algo genuinamente arriesgado ocurre, GuardClaw lo señala con una explicación clara y te deja decidir:

```
⛨ GuardClaw: (score: 8) — Reading sensitive file: SSH credentials — ~/.ssh/id_rsa
[Claude Code asks for your approval]
```

## Decisiones de Diseño Clave

**Local primero.** Todo el análisis se ejecuta en tu máquina. Ninguna credencial, comando o código sale de tu portátil. El juez LLM se ejecuta localmente a través de LM Studio u Ollama — sin llamadas a API en la nube para el análisis de seguridad.

**Fallo abierto por defecto.** Si GuardClaw se cae o no está disponible, Claude Code vuelve a su flujo de permisos normal. Tu flujo de trabajo nunca se bloquea por una caída de GuardClaw. (Un modo de fallo cerrado está disponible para entornos de alta seguridad.)

**Análisis de cadena.** GuardClaw rastrea la secuencia de llamadas de herramientas recientes por sesión. Un comando `curl` solo puede ser seguro, pero un `curl POST` justo después de leer `~/.aws/credentials` se marca como posible exfiltración de datos. El análisis de comando único no detecta estos patrones.

**Memoria adaptativa.** Cuando apruebas o rechazas un comando marcado, GuardClaw aprende de tus decisiones. Los patrones que apruebas consistentemente se aprueban automáticamente en el futuro; los patrones que rechazas reciben un escrutinio más estricto. El sistema se adapta a tu flujo de trabajo específico.

## Configuración

GuardClaw se integra con Claude Code a través de una simple configuración de hooks en `~/.claude/settings.json`. Funciona de manera idéntica tanto si usas Claude Code desde la terminal como desde la extensión de VS Code. Las instrucciones completas de configuración están en el [README](https://github.com/TobyGE/GuardClaw).

## Por Qué Esto Importa

A medida que los agentes de codificación con IA se vuelven más capaces, necesitan más autonomía para ser útiles — pero más autonomía sin controles de seguridad proporcionales es un riesgo. La elección binaria entre "aprobar todo manualmente" y "confiar en todo ciegamente" no escala.

GuardClaw es nuestro intento de un punto medio práctico: una capa de seguridad para agentes que es transparente, local, adaptativa y de código abierto. Es parte de una agenda de investigación más amplia sobre [seguridad de agentes](/posts/2025/07/agentic-safety/) que creo será cada vez más crítica a medida que los agentes pasen de escribir código a desplegarlo.

Si estás construyendo con Claude Code y quieres un control de permisos más inteligente, prueba [GuardClaw](https://github.com/TobyGE/GuardClaw). Las contribuciones y comentarios son bienvenidos.

</div>
