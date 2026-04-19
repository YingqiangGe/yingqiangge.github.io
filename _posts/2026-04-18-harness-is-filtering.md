---
title: "Harness: Amplify Through Filtering"
title_zh: 'Harness：过滤即放大'
title_ja: 'ハーネス：フィルタリングによる増幅'
title_ko: '하네스: 필터링을 통한 증폭'
title_es: 'Harness: amplificar filtrando'
date: 2026-04-18
permalink: /posts/2026/04/harness-is-filtering/
tags:
  - Harness
  - LLM
  - AI Agents
  - Claude Code
  - reflection
---

<div data-i18n="en" markdown="1">

> *You don't amplify a model by giving it more. You amplify it by giving it less, better.*

Human brains and LLMs fail the same way.

Here's how [a trader I follow](https://www.youtube.com/watch?v=GaaYGaOFqDg) lost money on US equities last week — three mistakes, in his own words:

1. **Wrong narrative frame** — every new signal got bent to fit a fixed model.
2. **Gossip overload** — he drowned in war-news details and lost the fundamentals.
3. **Ego over updating** — once he'd said it publicly, defending the call beat revising it.

Read these as LLM harness failure modes and it still works.

## Same Machine, Different Substrate

Both are prediction engines: context in, next step out. The only real difference is that an LLM's context is plain-text and editable, while a human's lives in the subconscious. So the failure paths line up one-to-one:

- **Bad narrative frame** ↔ bad system prompt. Once the frame is anchored, evidence gets bent to fit it.
- **Gossip overload** ↔ untrimmed tool output. `Read` dumps 2000 lines, `Grep` dumps a pile of irrelevant matches, and the throughline gets buried.
- **Ego over updating** ↔ confidence miscalibration. Once a judgment is emitted, continued reasoning defends it rather than revises it.

Different substrate, same bug.

## Looks Like Addition, Really Subtraction

My earlier take on "harness" — the shell around a model, like Claude Code — was about adding: more tools, more memory, more planning. On the surface it always looks like addition.

Look again. The real job of every piece is **deciding what the model doesn't see**:

- `Read` caps at 2000 lines. `Grep` caps at 250 matches.
- Sub-agents run 20 searches and return only the conclusion.
- Memory and plans pull long-horizon state out of context, reload on demand.
- "Don't do X" in a system prompt matters more than "Do Y" — because it narrows the search space.

Every one of these looks like capability. It's actually stripping — stripping noise, stripping history, stripping paths that shouldn't be taken. A harness isn't a reasoner. It's an **information curator**.

## The Harder You Try, the More You're Wrong

The trader ended with a Jesse Livermore line: *the harder you try to predict the short term, the more likely you are to be wrong*. His fix: just dollar-cost average.

The same logic hits LLMs harder than most people admit. Longer chain-of-thought isn't always better, because a good reasoner in a high-noise setting will **weave noise into a coherent story**. "Strong reasoning" becomes a liability — it just makes the model better at rationalizing. Good harnesses cut, refuse, or fall back at critical points. Not pile on.

Algorithmic echo chambers swallow people. They swallow models too. The defense isn't stronger reasoning. It's a better filter.

The stronger the model gets, the lighter I want the harness — compress and curate, don't decide. The bottleneck isn't the brain. It's the ears.

Less is more. Works for buildings. Works for minds.

</div>

<div data-i18n="zh" markdown="1">

> *放大一个模型，不是靠给它更多，而是靠给它更少、更好的东西。*

人脑和 LLM 的失败方式其实是一样的。

[我关注的一个博主](https://www.youtube.com/watch?v=GaaYGaOFqDg)最近复盘了自己在美股上的一次判断失误——三条错误，他自己的话：

1. **叙事框架错了** —— 每条新信号都被塞进一个固定的世界模型。
2. **吃瓜信息淹没** —— 他沉迷战争细节和感性叙事，离开了基本面。
3. **Ego 不纠错** —— 一旦公开说过，维护判断的冲动压过更新判断。

把这三条当 LLM harness 的失败模式读，也完全成立。

## 同一台机器，不同介质

两者都是预测引擎：context 进，下一步出。唯一的区别是 LLM 的 context 明码、可编辑，人的 context 藏在潜意识里。所以失败路径一一对应：

- **坏叙事框架** ↔ 糟糕的 system prompt。框架一锚定，后续证据都被强行塞进来。
- **吃瓜信息淹没** ↔ 工具结果不裁剪。`Read` 返回 2000 行、`Grep` 一堆无关匹配，主线就丢了。
- **Ego 不纠错** ↔ confidence miscalibration。判断一输出，后续推理倾向于维护它，而不是推翻它。

介质不同，bug 一样。

## 表面是加法，本质是减法

我以前理解 harness（Claude Code 这类外壳）偏"加"：加工具、加记忆、加 plan。表面看都是加法。

再看一眼。每一项真正做的事都是**决定什么不给模型看**：

- `Read` 默认截 2000 行，`Grep` 默认截 250 条
- 子 agent 是压缩器——跑 20 次搜索，只把结论带回主对话
- Memory / Plan 把长程状态从 context 搬出去，用时再加载
- 系统提示里的"不要做 X"比"要做 Y"更重要——因为它在收窄搜索空间

每一项看上去是能力，实际都在**剥离** —— 剥离噪音、剥离无关历史、剥离不该走的路径。harness 不是推理器，是**信息策展人**。

## 越努力越容易错

博主最后引了利弗莫尔一句话：**越努力（去预测短期）越容易错**。他的结论是定投。

LLM 上逻辑一样，而且更狠。给模型更长的 chain-of-thought 未必更好，因为好的 reasoner 在高噪音环境下会**把噪音编织成故事**。"推理能力强"反而成了缺点——它让模型更擅长自圆其说。好的 harness 在关键节点截断、拒答、fallback，不是堆更多 reasoning。

算法的回音室会吞掉人，也会吞掉模型。抵抗它的方式不是更强的推理，而是更好的过滤器。

模型越强，我越觉得 harness 应该越"轻"——只做压缩和筛选，不做决策。真正的瓶颈不在脑子，在耳朵。

少即是多——对建筑如此，对心智也如此。

</div>
