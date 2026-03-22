---
title: 'Personalized LLMs: Towards Models That Truly Know You'
title_zh: '个性化LLM：迈向真正了解你的模型'
title_ja: 'パーソナライズドLLM：あなたを本当に理解するモデルへ'
title_ko: '개인화된 LLM: 당신을 진정으로 이해하는 모델을 향해'
title_es: 'LLMs Personalizados: Hacia Modelos Que Realmente Te Conozcan'
date: 2025-03-27
permalink: /posts/2025/03/personalized-llm/
tags:
  - personalized LLM
  - recommendation
  - user modeling
---

<div data-i18n="en" markdown="1">

With the rapid progress of models like GPT-4, Claude, and Llama 2, large language models have demonstrated remarkable capability across a wide range of tasks. Yet they remain fundamentally generic — they give the same answer to the same question regardless of who is asking. As LLMs move from research demos to daily tools, the gap between generic intelligence and personalized intelligence is emerging as one of the most important open challenges.

## Why Personalization Matters

Consider two users asking an LLM to "explain gradient descent." A machine learning researcher expects a precise, mathematical treatment. A product manager wants intuition and analogy. Today's LLMs either guess or ask follow-up questions — neither scales well.

Personalization goes far beyond style adaptation. It encompasses:
- **Knowledge calibration**: adjusting depth and assumed background based on the user's expertise.
- **Preference alignment**: reflecting individual values, communication style, and decision-making patterns.
- **Context continuity**: remembering past interactions to build a coherent, long-term relationship.

Current systems like ChatGPT's custom instructions and memory features represent early steps in this direction, but they are still rudimentary — essentially key-value stores with limited reasoning about user context.

## Key Technical Approaches

From my perspective working at the intersection of recommendation systems and LLMs, I see several promising directions emerging in the research community:

**1. Retrieval-Augmented User Profiles.** Rather than fine-tuning a separate model per user, we can maintain a structured user profile and retrieve relevant context at inference time. This is analogous to how modern recommender systems maintain user embeddings — but the "items" being recommended are now response strategies, tone, and content depth. The success of RAG (Retrieval-Augmented Generation) over the past year suggests this is a viable path.

**2. Preference Learning from Feedback.** RLHF has proven effective at aligning models to aggregate human preferences. A natural next step is personalized RLHF — learning individual reward models rather than a single population-level one. Recent work on Direct Preference Optimization (DPO) makes this more tractable, but the core challenge remains data efficiency: most users provide sparse feedback, and the system must generalize from limited signals.

**3. Memory-Augmented Architectures.** External memory modules that allow LLMs to store and retrieve user-specific information across sessions are gaining attention. The design choices here — what to remember, when to forget, how to handle conflicting information — mirror classic problems in user modeling and collaborative filtering that the RecSys community has studied for decades.

**4. Parameter-Efficient Personalization.** With techniques like LoRA and QLoRA maturing, it becomes feasible to maintain lightweight per-user or per-group adapters on top of a shared foundation model. This provides a scalable middle ground between full per-user fine-tuning (prohibitively expensive) and no personalization at all.

## The Fairness Dimension

Personalization inevitably raises fairness concerns — a theme central to [my prior work](https://arxiv.org/pdf/2204.11159.pdf) on explainable fairness in recommendation. If a model adapts differently for different user groups, it may inadvertently amplify biases. A personalized LLM that assumes less technical depth for certain demographics, or that reinforces filter bubbles by only presenting agreeable viewpoints, would be harmful.

Building personalized LLMs responsibly requires:
- **Transparency**: users should understand what the model "knows" about them and how it influences responses.
- **User control**: individuals must be able to inspect, edit, and delete their profiles.
- **Fairness auditing**: systematic evaluation to ensure personalization does not degrade service quality for underrepresented groups.

## Looking Forward

I believe personalized LLMs will follow a trajectory similar to recommender systems — starting with simple heuristics (system prompts and custom instructions), evolving through collaborative and content-based methods (learning from user communities), and ultimately reaching deeply contextual personalization that respects individual autonomy.

The key insight from decades of recommendation research is that personalization is not just a feature — it is a paradigm. The same shift is beginning to happen for LLMs. As the field matures beyond the current focus on scaling and benchmarks, the models that win long-term adoption will not just be the most capable; they will be the ones that understand their users the best, while respecting their agency and privacy.

</div>

<div data-i18n="zh" markdown="1">

随着 GPT-4、Claude 和 Llama 2 等模型的飞速发展，大语言模型已经在各种任务中展现出卓越的能力。然而，它们本质上仍然是通用的——无论是谁在提问，对同一个问题给出的都是相同的答案。随着 LLM 从研究演示走向日常工具，通用智能与个性化智能之间的鸿沟正成为最重要的开放性挑战之一。

## 个性化为何重要

设想两位用户向 LLM 提问"解释梯度下降"。一位机器学习研究者期望获得精确的数学阐述，而一位产品经理则希望得到直觉性的类比说明。当前的 LLM 要么靠猜测，要么追问更多问题——两者都难以规模化。

个性化远不止于风格适配，它涵盖：
- **知识校准**：根据用户的专业水平调整深度和预设背景。
- **偏好对齐**：反映个人价值观、沟通风格和决策模式。
- **上下文连续性**：记住过去的交互，构建连贯的长期关系。

当前诸如 ChatGPT 的自定义指令和记忆功能等系统代表了这一方向的初步尝试，但它们仍然十分初级——本质上是带有有限用户上下文推理能力的键值存储。

## 关键技术路径

从我在推荐系统与 LLM 交叉领域的研究视角出发，我看到研究社区中涌现出几个有前景的方向：

**1. 检索增强的用户画像。** 与其为每个用户微调一个独立模型，我们可以维护结构化的用户画像，并在推理时检索相关上下文。这类似于现代推荐系统维护用户嵌入的方式——只不过被"推荐"的"物品"变成了回复策略、语气和内容深度。过去一年 RAG（Retrieval-Augmented Generation）的成功表明这是一条可行之路。

**2. 基于反馈的偏好学习。** RLHF 已被证明能有效地将模型与群体人类偏好对齐。自然的下一步是个性化 RLHF——学习个体奖励模型，而非单一的群体级奖励模型。近期关于 Direct Preference Optimization（DPO）的工作使这变得更加可行，但核心挑战仍在于数据效率：大多数用户提供的反馈十分稀疏，系统必须从有限的信号中进行泛化。

**3. 记忆增强架构。** 允许 LLM 跨会话存储和检索用户特定信息的外部记忆模块正受到越来越多的关注。这里的设计选择——记住什么、何时遗忘、如何处理矛盾信息——反映了用户建模和协同过滤中的经典问题，推荐系统（RecSys）社区已研究了数十年。

**4. 参数高效的个性化。** 随着 LoRA 和 QLoRA 等技术的成熟，在共享基础模型之上维护轻量级的逐用户或逐群体适配器变得可行。这提供了一种可扩展的中间方案，介于完全逐用户微调（成本过高）和完全不个性化之间。

## 公平性维度

个性化不可避免地引发公平性问题——这也是我在推荐系统中可解释公平性方面[前期工作](https://arxiv.org/pdf/2204.11159.pdf)的核心主题。如果模型对不同用户群体进行差异化适配，就可能无意中放大偏见。一个对某些群体预设较低技术深度，或通过只呈现迎合性观点来强化信息茧房的个性化 LLM，将是有害的。

负责任地构建个性化 LLM 需要：
- **透明度**：用户应了解模型"知道"关于他们的哪些信息，以及这些信息如何影响回复。
- **用户控制**：个人必须能够查看、编辑和删除其画像。
- **公平性审计**：系统性评估以确保个性化不会降低对弱势群体的服务质量。

## 展望未来

我相信个性化 LLM 将遵循与推荐系统类似的发展轨迹——从简单启发式方法（系统提示和自定义指令）开始，经历协同和基于内容的方法（从用户社区中学习），最终实现尊重个体自主权的深度上下文个性化。

推荐研究数十年积累的关键洞见是：个性化不仅是一个功能——它是一种范式。同样的转变正在 LLM 领域开始发生。随着该领域超越当前对规模和基准的关注而走向成熟，赢得长期用户的模型将不仅是最强大的，而是最能理解用户、同时尊重用户自主性和隐私的模型。

</div>

<div data-i18n="ja" markdown="1">

GPT-4、Claude、Llama 2 などのモデルの急速な進歩に伴い、大規模言語モデルは幅広いタスクにおいて卓越した能力を示してきました。しかし、根本的に汎用的なままであり、誰が質問しているかに関係なく、同じ質問に同じ回答を返します。LLM が研究デモから日常ツールへと移行する中、汎用知能とパーソナライズ知能の間のギャップは、最も重要なオープンチャレンジの一つとして浮上しています。

## パーソナライゼーションが重要な理由

2人のユーザーが LLM に「勾配降下法を説明してください」と尋ねる場面を考えてみましょう。機械学習の研究者は正確で数学的な説明を期待します。プロダクトマネージャーは直感的な類推を求めます。現在の LLM は推測するか、追加の質問をするかのどちらかですが、いずれもスケーラブルではありません。

パーソナライゼーションはスタイルの適応をはるかに超えます。それは以下を包含します：
- **知識の較正**：ユーザーの専門知識に基づいて深さと前提となる背景知識を調整する。
- **嗜好の整合**：個人の価値観、コミュニケーションスタイル、意思決定パターンを反映する。
- **コンテキストの継続性**：過去のインタラクションを記憶し、一貫した長期的な関係を構築する。

ChatGPT のカスタム指示やメモリ機能のような現在のシステムは、この方向への初期的な取り組みですが、まだ初歩的なものです。本質的には、ユーザーコンテキストに対する推論能力が限られたキーバリューストアに過ぎません。

## 主要な技術的アプローチ

推薦システムと LLM の交差領域で研究する私の視点から、研究コミュニティでいくつかの有望な方向性が生まれていると考えます：

**1. 検索拡張ユーザープロファイル。** ユーザーごとに個別のモデルをファインチューニングするのではなく、構造化されたユーザープロファイルを維持し、推論時に関連するコンテキストを検索できます。これは、現代の推薦システムがユーザー埋め込みを維持する方法と類似していますが、「推薦」される「アイテム」は応答戦略、トーン、コンテンツの深さになります。過去1年の RAG（Retrieval-Augmented Generation）の成功は、これが実行可能な道であることを示唆しています。

**2. フィードバックからの嗜好学習。** RLHF は、モデルを集約された人間の嗜好に整合させるのに効果的であることが証明されています。自然な次のステップは、パーソナライズされた RLHF です。単一の集団レベルではなく、個人の報酬モデルを学習することです。Direct Preference Optimization（DPO）に関する最近の研究はこれをより扱いやすくしていますが、中核的な課題はデータ効率にあります。ほとんどのユーザーが提供するフィードバックは疎であり、システムは限られたシグナルから汎化する必要があります。

**3. メモリ拡張アーキテクチャ。** LLM がセッション間でユーザー固有の情報を保存・検索できる外部メモリモジュールが注目を集めています。ここでの設計上の選択——何を記憶するか、いつ忘れるか、矛盾する情報をどう扱うか——は、RecSys コミュニティが数十年にわたって研究してきたユーザーモデリングと協調フィルタリングの古典的な問題を反映しています。

**4. パラメータ効率的なパーソナライゼーション。** LoRA や QLoRA などの技術の成熟に伴い、共有基盤モデルの上に軽量なユーザーごとまたはグループごとのアダプターを維持することが実現可能になっています。これは、完全なユーザーごとのファインチューニング（コストが高すぎる）とパーソナライゼーションなしの間のスケーラブルな中間地点を提供します。

## 公平性の次元

パーソナライゼーションは必然的に公平性の懸念を引き起こします。これは、推薦における説明可能な公平性に関する[私の先行研究](https://arxiv.org/pdf/2204.11159.pdf)の中心的テーマです。モデルが異なるユーザーグループに対して異なる適応を行う場合、意図せずバイアスを増幅する可能性があります。特定の人口統計グループに対して技術的深さが低いと仮定するパーソナライズされた LLM や、同調的な視点のみを提示してフィルターバブルを強化する LLM は有害です。

パーソナライズされた LLM を責任を持って構築するには以下が必要です：
- **透明性**：ユーザーは、モデルが自分について何を「知っている」か、そしてそれが応答にどう影響するかを理解できるべきです。
- **ユーザー制御**：個人は自分のプロファイルを検査、編集、削除できなければなりません。
- **公平性監査**：パーソナライゼーションが過小代表グループへのサービス品質を低下させないことを確認するための体系的な評価。

## 今後の展望

パーソナライズされた LLM は推薦システムと同様の軌跡をたどると考えています。シンプルなヒューリスティクス（システムプロンプトとカスタム指示）から始まり、協調的およびコンテンツベースの方法（ユーザーコミュニティからの学習）を経て、最終的には個人の自律性を尊重する深い文脈的パーソナライゼーションに到達するでしょう。

推薦研究の数十年からの重要な洞察は、パーソナライゼーションは単なる機能ではなく、パラダイムであるということです。同じ変化が LLM でも始まっています。この分野がスケーリングとベンチマークへの現在の注力を超えて成熟するにつれ、長期的な採用を勝ち取るモデルは、最も高性能なものだけではなく、ユーザーの自主性とプライバシーを尊重しながら、ユーザーを最もよく理解するモデルになるでしょう。

</div>

<div data-i18n="ko" markdown="1">

GPT-4, Claude, Llama 2 등의 모델이 급속히 발전하면서 대규모 언어 모델은 광범위한 과제에서 뛰어난 능력을 입증해 왔습니다. 그러나 근본적으로 범용적인 상태를 유지하고 있으며, 누가 질문하든 같은 질문에 같은 답변을 내놓습니다. LLM이 연구 데모에서 일상 도구로 전환됨에 따라, 범용 지능과 개인화 지능 사이의 격차가 가장 중요한 미해결 과제 중 하나로 부상하고 있습니다.

## 개인화가 중요한 이유

두 명의 사용자가 LLM에게 "경사 하강법을 설명해 주세요"라고 묻는 상황을 생각해 봅시다. 머신러닝 연구자는 정밀하고 수학적인 설명을 기대합니다. 제품 관리자는 직관과 비유를 원합니다. 오늘날의 LLM은 추측하거나 후속 질문을 하는데, 어느 쪽도 확장성이 좋지 않습니다.

개인화는 단순한 스타일 적응을 훨씬 넘어서며 다음을 포함합니다:
- **지식 교정**: 사용자의 전문 수준에 따라 깊이와 전제 배경을 조정합니다.
- **선호 정렬**: 개인의 가치관, 커뮤니케이션 스타일, 의사결정 패턴을 반영합니다.
- **맥락 연속성**: 과거 상호작용을 기억하여 일관된 장기적 관계를 구축합니다.

ChatGPT의 사용자 지정 지침과 메모리 기능 같은 현재 시스템은 이 방향의 초기 단계를 대표하지만, 여전히 초보적입니다. 본질적으로 사용자 맥락에 대한 추론 능력이 제한된 키-값 저장소에 불과합니다.

## 핵심 기술 접근법

추천 시스템과 LLM의 교차점에서 연구하는 제 관점에서, 연구 커뮤니티에서 몇 가지 유망한 방향이 나타나고 있습니다:

**1. 검색 증강 사용자 프로필.** 사용자별로 별도의 모델을 파인튜닝하는 대신, 구조화된 사용자 프로필을 유지하고 추론 시 관련 맥락을 검색할 수 있습니다. 이는 현대 추천 시스템이 사용자 임베딩을 유지하는 방식과 유사하지만, "추천"되는 "아이템"이 응답 전략, 어조, 콘텐츠 깊이가 됩니다. 지난 1년간 RAG(Retrieval-Augmented Generation)의 성공은 이것이 실현 가능한 경로임을 시사합니다.

**2. 피드백을 통한 선호 학습.** RLHF는 모델을 집합적 인간 선호에 정렬하는 데 효과적임이 입증되었습니다. 자연스러운 다음 단계는 개인화된 RLHF, 즉 단일 집단 수준이 아닌 개별 보상 모델을 학습하는 것입니다. Direct Preference Optimization(DPO)에 대한 최근 연구는 이를 더 다루기 쉽게 만들었지만, 핵심 과제는 데이터 효율성에 있습니다. 대부분의 사용자는 희소한 피드백을 제공하며, 시스템은 제한된 신호로부터 일반화해야 합니다.

**3. 메모리 증강 아키텍처.** LLM이 세션 간에 사용자별 정보를 저장하고 검색할 수 있는 외부 메모리 모듈이 주목받고 있습니다. 여기서의 설계 선택 — 무엇을 기억할지, 언제 잊을지, 상충하는 정보를 어떻게 처리할지 — 은 RecSys 커뮤니티가 수십 년간 연구해 온 사용자 모델링과 협업 필터링의 고전적 문제를 반영합니다.

**4. 파라미터 효율적 개인화.** LoRA와 QLoRA 같은 기술이 성숙함에 따라, 공유 기반 모델 위에 경량의 사용자별 또는 그룹별 어댑터를 유지하는 것이 가능해지고 있습니다. 이는 완전한 사용자별 파인튜닝(비용이 지나치게 높음)과 개인화 없음 사이의 확장 가능한 중간 지점을 제공합니다.

## 공정성 차원

개인화는 필연적으로 공정성 우려를 제기하며, 이는 추천에서의 설명 가능한 공정성에 관한 [제 이전 연구](https://arxiv.org/pdf/2204.11159.pdf)의 핵심 주제이기도 합니다. 모델이 서로 다른 사용자 그룹에 대해 다르게 적응한다면, 의도치 않게 편향을 증폭시킬 수 있습니다. 특정 인구 집단에 대해 낮은 기술적 깊이를 가정하거나, 동의하는 관점만 제시하여 필터 버블을 강화하는 개인화된 LLM은 해로울 것입니다.

개인화된 LLM을 책임감 있게 구축하려면 다음이 필요합니다:
- **투명성**: 사용자는 모델이 자신에 대해 무엇을 "알고" 있는지, 그리고 그것이 응답에 어떻게 영향을 미치는지 이해할 수 있어야 합니다.
- **사용자 제어**: 개인은 자신의 프로필을 검사, 편집, 삭제할 수 있어야 합니다.
- **공정성 감사**: 개인화가 과소 대표 그룹에 대한 서비스 품질을 저하시키지 않도록 체계적인 평가가 필요합니다.

## 앞으로의 전망

저는 개인화된 LLM이 추천 시스템과 유사한 궤적을 따를 것이라고 믿습니다. 단순한 휴리스틱(시스템 프롬프트와 사용자 지정 지침)에서 시작하여, 협업 및 콘텐츠 기반 방법(사용자 커뮤니티로부터의 학습)을 거쳐, 궁극적으로 개인의 자율성을 존중하는 깊은 맥락적 개인화에 도달할 것입니다.

추천 연구 수십 년의 핵심 통찰은 개인화가 단순한 기능이 아니라 패러다임이라는 것입니다. 같은 변화가 LLM에서도 시작되고 있습니다. 이 분야가 현재의 스케일링과 벤치마크에 대한 집중을 넘어 성숙해짐에 따라, 장기적 채택을 이끄는 모델은 가장 강력한 모델만이 아닌, 사용자의 자율성과 프라이버시를 존중하면서 사용자를 가장 잘 이해하는 모델이 될 것입니다.

</div>

<div data-i18n="es" markdown="1">

Con el rápido avance de modelos como GPT-4, Claude y Llama 2, los modelos de lenguaje de gran escala han demostrado una capacidad notable en una amplia gama de tareas. Sin embargo, siguen siendo fundamentalmente genéricos: dan la misma respuesta a la misma pregunta sin importar quién la haga. A medida que los LLM pasan de demostraciones de investigación a herramientas cotidianas, la brecha entre la inteligencia genérica y la inteligencia personalizada está emergiendo como uno de los desafíos abiertos más importantes.

## Por qué importa la personalización

Consideremos dos usuarios que piden a un LLM que "explique el descenso de gradiente". Un investigador de aprendizaje automático espera un tratamiento preciso y matemático. Un gerente de producto quiere intuición y analogías. Los LLM actuales adivinan o hacen preguntas de seguimiento; ninguna de las dos opciones escala bien.

La personalización va mucho más allá de la adaptación de estilo. Abarca:
- **Calibración del conocimiento**: ajustar la profundidad y los conocimientos previos asumidos según la experiencia del usuario.
- **Alineación de preferencias**: reflejar los valores individuales, el estilo de comunicación y los patrones de toma de decisiones.
- **Continuidad del contexto**: recordar interacciones pasadas para construir una relación coherente a largo plazo.

Los sistemas actuales, como las instrucciones personalizadas y las funciones de memoria de ChatGPT, representan pasos iniciales en esta dirección, pero siguen siendo rudimentarios: esencialmente almacenes clave-valor con capacidad limitada de razonamiento sobre el contexto del usuario.

## Enfoques técnicos clave

Desde mi perspectiva trabajando en la intersección de los sistemas de recomendación y los LLM, veo varias direcciones prometedoras que están surgiendo en la comunidad investigadora:

**1. Perfiles de usuario con recuperación aumentada.** En lugar de ajustar finamente un modelo separado por usuario, podemos mantener un perfil de usuario estructurado y recuperar contexto relevante en el momento de la inferencia. Esto es análogo a cómo los sistemas de recomendación modernos mantienen embeddings de usuario, pero los "elementos" que se recomiendan son ahora estrategias de respuesta, tono y profundidad del contenido. El éxito de RAG (Retrieval-Augmented Generation) durante el último año sugiere que este es un camino viable.

**2. Aprendizaje de preferencias a partir de retroalimentación.** RLHF ha demostrado ser eficaz para alinear modelos con preferencias humanas agregadas. Un siguiente paso natural es el RLHF personalizado: aprender modelos de recompensa individuales en lugar de uno único a nivel poblacional. Los trabajos recientes sobre Direct Preference Optimization (DPO) hacen esto más manejable, pero el desafío central sigue siendo la eficiencia de datos: la mayoría de los usuarios proporcionan retroalimentación escasa, y el sistema debe generalizar a partir de señales limitadas.

**3. Arquitecturas con memoria aumentada.** Los módulos de memoria externa que permiten a los LLM almacenar y recuperar información específica del usuario entre sesiones están ganando atención. Las decisiones de diseño aquí — qué recordar, cuándo olvidar, cómo manejar información contradictoria — reflejan problemas clásicos en el modelado de usuarios y el filtrado colaborativo que la comunidad de RecSys ha estudiado durante décadas.

**4. Personalización eficiente en parámetros.** Con la maduración de técnicas como LoRA y QLoRA, resulta factible mantener adaptadores ligeros por usuario o por grupo sobre un modelo fundacional compartido. Esto proporciona un punto intermedio escalable entre el ajuste fino completo por usuario (prohibitivamente costoso) y la ausencia total de personalización.

## La dimensión de equidad

La personalización inevitablemente plantea preocupaciones de equidad, un tema central en [mi trabajo previo](https://arxiv.org/pdf/2204.11159.pdf) sobre equidad explicable en recomendación. Si un modelo se adapta de manera diferente para distintos grupos de usuarios, puede amplificar sesgos de forma inadvertida. Un LLM personalizado que asuma menor profundidad técnica para ciertos grupos demográficos, o que refuerce las burbujas de filtro presentando solo puntos de vista afines, sería perjudicial.

Construir LLM personalizados de manera responsable requiere:
- **Transparencia**: los usuarios deben comprender qué "sabe" el modelo sobre ellos y cómo influye en las respuestas.
- **Control del usuario**: las personas deben poder inspeccionar, editar y eliminar sus perfiles.
- **Auditoría de equidad**: evaluación sistemática para garantizar que la personalización no degrade la calidad del servicio para grupos subrepresentados.

## Mirando hacia adelante

Creo que los LLM personalizados seguirán una trayectoria similar a la de los sistemas de recomendación: comenzando con heurísticas simples (prompts de sistema e instrucciones personalizadas), evolucionando a través de métodos colaborativos y basados en contenido (aprendizaje a partir de comunidades de usuarios), y alcanzando finalmente una personalización profundamente contextual que respete la autonomía individual.

La idea clave de décadas de investigación en recomendación es que la personalización no es solo una funcionalidad, es un paradigma. El mismo cambio está comenzando a ocurrir en los LLM. A medida que el campo madure más allá del enfoque actual en escalado y benchmarks, los modelos que ganen la adopción a largo plazo no serán solo los más capaces; serán los que mejor comprendan a sus usuarios, respetando al mismo tiempo su autonomía y privacidad.

</div>
