---
title: "Harness Isn't Augmentation. It's Filtering."
title_zh: 'Harness 的本质不是增强，是过滤'
title_ja: 'ハーネスは拡張ではなく、フィルタリングである'
title_ko: '하네스는 증강이 아니다. 필터링이다'
title_es: 'El harness no es aumento. Es filtrado.'
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

A few days ago I watched a reflection video by the creator **UponlyTech (霍比特小灰)** — ["The market hit new highs — what have I been going through? (personal reflection)"](https://www.youtube.com/watch?v=GaaYGaOFqDg). He walks through a misjudgment he made on US equities during the Israel–Iran conflict: bullish when the war started, then dragged into panic by a media narrative, then blindsided when Trump pivoted to a ceasefire and the market ripped.

He boiled his mistakes down to three things:

1. **A wrong narrative frame** — every new piece of information got forced into a fixed model of the world.
2. **Drowning in gossip** — he got absorbed by war details and emotional storytelling, drifting away from fundamentals.
3. **Ego over updating** — once he'd said it publicly, the urge to defend the call overrode the urge to revise it.

My first reaction: these three map almost one-to-one onto LLM harness failure modes.

## Not a Coincidence

Human brains and LLMs are both **systems that predict the next step from context**. The difference is that an LLM's context is plain-text and editable; a human's lives in the subconscious. But the failure paths line up:

- **Bad narrative frame** ↔ bad system prompt: once the frame is anchored, subsequent evidence gets bent to fit it.
- **Gossip overload** ↔ untrimmed tool output: `Read` dumps 2000 lines, `Grep` dumps a pile of irrelevant matches, and the throughline gets buried.
- **Ego over updating** ↔ model confidence miscalibration: once a judgment is emitted, continued reasoning tends toward self-justification rather than self-overturning.

Structurally these two systems are almost identical — context in, prediction out. So their failure modes align.

## Looks Like Addition, Really Subtraction

My earlier take on "harness" (shells like Claude Code) was framed around adding: add tools, add memory, add planning. On the surface a harness keeps doing addition.

But look through those features and the real job is **deciding what the model doesn't see**:

- Tool outputs get capped — `Read` defaults to 2000 lines, `Grep` to 250 matches.
- Sub-agents are compressors — they run 20 searches and return only the conclusion to the main thread.
- Memory and plans pull long-horizon state out of the context and reload it on demand.
- The "don't do X" lines in a system prompt matter more than the "do Y" ones, because they narrow the search space.

Each of these looks like it's handing the model more capability. Actually they're **stripping** — stripping noise, stripping irrelevant history, stripping paths that shouldn't be taken. A harness isn't a reasoner. It's an **information curator**.

## The Harder You Try, the More You're Wrong

At the end of the video, the creator quotes Jesse Livermore: *the harder you try to predict the short term, the more likely you are to be wrong*. His conclusion: just dollar-cost average.

The same logic holds for LLMs. Longer chain-of-thought isn't always better, because the model will **weave noise into a coherent story**. What we call "strong reasoning" can be a liability in a high-noise setting — it just makes the model better at rationalizing. Good harnesses tend to cut, refuse, or fall back at critical points instead of piling on more reasoning steps.

Algorithmic echo chambers swallow people. They swallow models too. The defense isn't stronger reasoning — it's a better filter.

The stronger the model gets, the lighter I want the harness to be — compress and curate, don't decide. The bottleneck isn't the brain. It's the ears.

</div>

<div data-i18n="zh" markdown="1">

前几天看了 **UponlyTech 霍比特小灰**的一支反思视频 ——[《市场竟然创了新高，这些天我都经历了什么？（个人反思）》](https://www.youtube.com/watch?v=GaaYGaOFqDg)。博主复盘自己在以伊冲突期间对美股的判断失误：战争开始时他看涨，中途被某些媒体叙事带进恐慌，川普转向停火后市场大涨，他才反应过来。

他把自己的错误归结为三条：

1. **错误的叙事框架** —— 把所有新信息塞进一个固定模型。
2. **过度关注吃瓜信息** —— 沉迷战争细节和感性叙事，离开基本面。
3. **Ego / 爱面子不纠错** —— 一旦公开说错，维护判断的冲动压过了更新判断。

看完我的第一反应是：这三条几乎一对一映射到 LLM harness 的失败模式。

## 不是巧合

人脑和 LLM 都是**基于 context 做下一步预测的系统**。区别是 LLM 的 context 是明码、可编辑的，人的 context 藏在潜意识里。但失败路径高度一致：

- **坏叙事框架** ↔ 糟糕的 system prompt：一旦框架锚定，后续证据都被强行塞进来。
- **吃瓜信息淹没** ↔ 工具结果不做裁剪：`Read` 返回 2000 行、`Grep` 一堆无关匹配，主线就丢了。
- **Ego 不纠错** ↔ 模型的 confidence miscalibration：输出过判断后，继续推理倾向于自我维护而不是自我推翻。

两个系统在结构上几乎没差别 —— 都是把 context 灌进一个预测引擎。所以它们的 failure mode 也对齐。

## 表面是加法，本质是减法

我以前对 harness（Claude Code 这类外壳）的理解偏"加功能"：加工具、加记忆、加 plan。表面上 harness 一直在做加法。

但透过这些功能看进去，它们真正的作用都是**决定什么不给模型看**：

- 工具结果要裁剪 —— `Read` 默认 2000 行、`Grep` 默认 250 条截断
- 子 agent 是压缩器 —— 跑 20 次搜索，只把结论带回主对话
- Memory / Plan 把长程状态从上下文里搬出去，用时再加载
- 系统提示里的"不要做 X"比"要做 Y"更重要，因为前者是在收窄搜索空间

每一项看上去是在"给模型更多能力"，实际都在**剥离** —— 剥离噪音、剥离无关历史、剥离不该走的路径。harness 不是推理器，是**信息策展人**。

## 越努力越容易错

博主最后引了利弗莫尔一句话：**越努力（去预测短期）越容易错**。他的结论是定投。

放到 LLM 上逻辑一样 —— 给模型更长的 chain-of-thought 未必更好，因为它会**把噪音编织成故事**。所谓"推理能力强"，在高噪音场景下可能反而是缺点 —— 它让你更擅长自圆其说。好的 harness 往往是在关键节点截断、拒答、fallback，而不是加更多 reasoning step。

算法的回音室会吞掉人，也会吞掉模型。抵抗它的方式不是更强的推理，而是更好的过滤器。

模型越强，我越觉得 harness 应该越"轻" —— 只做压缩和筛选，不做决策。真正的瓶颈不在脑子，在耳朵。

</div>
