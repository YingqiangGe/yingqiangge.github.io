---
title: 'Why Agentic Safety Is the Next Frontier'
title_zh: '为什么智能体安全是下一个前沿'
title_ja: 'なぜエージェント安全性が次のフロンティアなのか'
title_ko: '에이전트 안전이 왜 다음 프론티어인가'
title_es: 'Por Qué la Seguridad Agéntica Es la Próxima Frontera'
date: 2026-02-01
permalink: /posts/2026/02/agentic-safety/
tags:
  - agentic safety
  - LLM agents
  - AI safety
---

<div data-i18n="en" markdown="1">

As large language models evolve from passive question-answerers into autonomous agents that execute code, call APIs, and manage real-world infrastructure, the safety landscape shifts fundamentally. Traditional AI safety focuses on what models *say*; agentic safety must address what they *do*.

## From Outputs to Actions

A chatbot that hallucinates a wrong answer is annoying. An agent that hallucinates a wrong API call can delete production data, send unintended emails, or authorize financial transactions. The stakes are categorically different when models have agency.

This distinction motivates a new safety paradigm — one where we reason not just about model alignment, but about **action-level risk**: What is the blast radius of each tool call? Is the action reversible? Does it require human approval?

## Three Pillars of Agentic Safety

Based on my research building systems like [AIOS](https://github.com/agiresearch/AIOS) and [GuardClaw](https://github.com/TobyGE), I see three core pillars:

**1. Permission and Scope Control.** Agents should operate under the principle of least privilege. Just as operating systems sandbox processes, an agent operating system should constrain which tools an agent can invoke and what data it can access.

**2. Real-Time Interception.** Static safety checks before deployment are insufficient. Agents encounter novel situations at runtime — a safety layer must be able to intercept, evaluate, and block dangerous actions in real time, without introducing unacceptable latency.

**3. Transparency and Auditability.** Every action an agent takes should be logged with full context: the reasoning chain, the tool called, the parameters used, and the outcome. This audit trail is essential for debugging failures and building trust.

## The Road Ahead

We are still in the early days. Most agent frameworks today have minimal safety infrastructure — it is the equivalent of deploying web applications without authentication or input validation. As agents become more capable and more widely deployed, building robust safety mechanisms is not optional; it is the prerequisite for responsible adoption.

I believe open-source tooling will play a critical role here. Safety should not be a proprietary moat — it should be shared infrastructure that the entire community can build on and improve. That is why projects like AIOS and GuardClaw are open source, and why I will continue sharing what I learn on this blog.

If you are working on similar problems, I would love to connect. The challenges ahead are too large for any single team.

</div>

<div data-i18n="zh" markdown="1">

随着大语言模型从被动的问答工具演变为能够执行代码、调用 API 并管理现实世界基础设施的自主智能体，安全格局发生了根本性的转变。传统的 AI 安全关注的是模型*说*了什么；而智能体安全必须解决的是它们*做*了什么。

## 从输出到行动

一个产生幻觉给出错误答案的聊天机器人只是令人烦恼。但一个产生幻觉发出错误 API 调用的智能体可能会删除生产数据、发送意外的邮件，或授权金融交易。当模型拥有自主行动能力时，风险的性质截然不同。

这一区别催生了一种新的安全范式——我们不仅需要考虑模型对齐，更要关注**行动级别的风险**：每个工具调用的影响范围有多大？该操作是否可逆？是否需要人工审批？

## 智能体安全的三大支柱

基于我在构建 [AIOS](https://github.com/agiresearch/AIOS) 和 [GuardClaw](https://github.com/TobyGE) 等系统时的研究，我总结出三个核心支柱：

**1. 权限与作用域控制。** 智能体应遵循最小权限原则。正如操作系统对进程进行沙箱隔离一样，智能体操作系统也应限制智能体可以调用的工具及其可访问的数据。

**2. 实时拦截。** 部署前的静态安全检查是不够的。智能体在运行时会遇到各种新情况——安全层必须能够实时拦截、评估并阻止危险操作，且不能引入不可接受的延迟。

**3. 透明性与可审计性。** 智能体采取的每个行动都应记录完整的上下文：推理链、调用的工具、使用的参数和执行结果。这一审计轨迹对于调试故障和建立信任至关重要。

## 前路展望

我们仍处于早期阶段。当今大多数智能体框架的安全基础设施极为薄弱——这相当于在没有身份验证或输入校验的情况下部署 Web 应用。随着智能体变得更强大、部署更广泛，构建稳健的安全机制不是可选项，而是负责任地推广应用的先决条件。

我相信开源工具将在其中发挥关键作用。安全不应成为专有壁垒——它应该是整个社区都可以基于其构建和改进的共享基础设施。这就是 AIOS 和 GuardClaw 等项目开源的原因，也是我将继续在这个博客上分享所学的原因。

如果你也在研究类似的问题，我非常期待与你交流。前方的挑战太大，不是任何单独一个团队能够独自应对的。

</div>

<div data-i18n="ja" markdown="1">

大規模言語モデルが受動的な質問応答ツールから、コードを実行し、APIを呼び出し、現実世界のインフラを管理する自律的なエージェントへと進化するにつれ、安全性の状況は根本的に変化しています。従来のAI安全性はモデルが*言う*ことに焦点を当てていますが、エージェントの安全性はモデルが*行う*ことに対処しなければなりません。

## 出力から行動へ

誤った回答を幻覚するチャットボットは煩わしいだけです。しかし、誤ったAPI呼び出しを幻覚するエージェントは、本番データを削除したり、意図しないメールを送信したり、金融取引を承認してしまう可能性があります。モデルがエージェンシーを持つとき、リスクの性質は根本的に異なります。

この違いが新しい安全性パラダイムを動機付けます。モデルのアライメントだけでなく、**アクションレベルのリスク**について推論するパラダイムです。各ツール呼び出しの影響範囲はどの程度か？その操作は元に戻せるか？人間の承認が必要か？

## エージェント安全性の三つの柱

[AIOS](https://github.com/agiresearch/AIOS)や[GuardClaw](https://github.com/TobyGE)などのシステム構築における研究に基づき、私は三つの核心的な柱を提唱します。

**1. 権限とスコープの制御。** エージェントは最小権限の原則に基づいて動作すべきです。オペレーティングシステムがプロセスをサンドボックス化するように、エージェントオペレーティングシステムもエージェントが呼び出せるツールとアクセスできるデータを制限すべきです。

**2. リアルタイムでの介入。** デプロイ前の静的な安全性チェックでは不十分です。エージェントは実行時に新しい状況に遭遇します。安全性レイヤーは、許容できない遅延を導入することなく、危険な操作をリアルタイムで傍受、評価、ブロックできなければなりません。

**3. 透明性と監査可能性。** エージェントが行うすべてのアクションは、完全なコンテキストとともにログに記録されるべきです。推論チェーン、呼び出されたツール、使用されたパラメータ、そして結果です。この監査証跡は、障害のデバッグと信頼の構築に不可欠です。

## 今後の道のり

私たちはまだ初期段階にいます。今日のほとんどのエージェントフレームワークは最小限の安全性インフラしか持っていません。これは認証や入力バリデーションなしにWebアプリケーションをデプロイするのと同等です。エージェントがより高性能になり、より広く展開されるにつれ、堅牢な安全メカニズムの構築はオプションではなく、責任ある普及のための前提条件です。

オープンソースのツールがここで重要な役割を果たすと信じています。安全性は独自の堀であるべきではなく、コミュニティ全体が構築し改善できる共有インフラであるべきです。これが、AIOSやGuardClawなどのプロジェクトがオープンソースである理由であり、私がこのブログで学んだことを共有し続ける理由です。

同様の課題に取り組んでいる方がいらっしゃれば、ぜひ繋がりたいと思います。今後の課題は、一つのチームだけで取り組むには大きすぎます。

</div>

<div data-i18n="ko" markdown="1">

대규모 언어 모델이 수동적인 질의응답 도구에서 코드를 실행하고, API를 호출하며, 실제 인프라를 관리하는 자율 에이전트로 진화함에 따라 안전성 환경은 근본적으로 변화하고 있습니다. 전통적인 AI 안전성은 모델이 *말하는* 것에 초점을 맞추지만, 에이전트 안전성은 모델이 *행하는* 것을 다루어야 합니다.

## 출력에서 행동으로

잘못된 답변을 환각하는 챗봇은 성가실 뿐입니다. 하지만 잘못된 API 호출을 환각하는 에이전트는 프로덕션 데이터를 삭제하거나, 의도하지 않은 이메일을 보내거나, 금융 거래를 승인할 수 있습니다. 모델이 행위 주체성을 가질 때, 위험의 성격은 본질적으로 다릅니다.

이러한 차이는 새로운 안전성 패러다임을 요구합니다. 모델 정렬뿐만 아니라 **행동 수준의 위험**에 대해 추론하는 패러다임입니다. 각 도구 호출의 영향 범위는 어느 정도인가? 해당 작업은 되돌릴 수 있는가? 인간의 승인이 필요한가?

## 에이전트 안전성의 세 가지 기둥

[AIOS](https://github.com/agiresearch/AIOS)와 [GuardClaw](https://github.com/TobyGE) 같은 시스템을 구축하면서 진행한 연구를 바탕으로, 저는 세 가지 핵심 기둥을 제시합니다.

**1. 권한 및 범위 제어.** 에이전트는 최소 권한 원칙에 따라 작동해야 합니다. 운영 체제가 프로세스를 샌드박스로 격리하듯이, 에이전트 운영 체제도 에이전트가 호출할 수 있는 도구와 접근할 수 있는 데이터를 제한해야 합니다.

**2. 실시간 차단.** 배포 전 정적 안전성 검사만으로는 충분하지 않습니다. 에이전트는 런타임에 새로운 상황을 마주합니다. 안전성 계층은 허용 불가능한 지연 없이 위험한 작업을 실시간으로 가로채고, 평가하고, 차단할 수 있어야 합니다.

**3. 투명성 및 감사 가능성.** 에이전트가 수행하는 모든 작업은 완전한 컨텍스트와 함께 기록되어야 합니다. 추론 체인, 호출된 도구, 사용된 매개변수, 그리고 결과입니다. 이 감사 추적은 장애 디버깅과 신뢰 구축에 필수적입니다.

## 앞으로의 길

우리는 아직 초기 단계에 있습니다. 오늘날 대부분의 에이전트 프레임워크는 최소한의 안전성 인프라만 갖추고 있습니다. 이는 인증이나 입력 검증 없이 웹 애플리케이션을 배포하는 것과 같습니다. 에이전트가 더욱 강력해지고 더 널리 배포됨에 따라, 견고한 안전 메커니즘을 구축하는 것은 선택이 아닌, 책임 있는 도입을 위한 전제 조건입니다.

저는 오픈소스 도구가 여기서 중요한 역할을 할 것이라고 믿습니다. 안전성은 독점적인 해자가 되어서는 안 됩니다. 커뮤니티 전체가 기반으로 삼고 개선할 수 있는 공유 인프라여야 합니다. 이것이 AIOS와 GuardClaw 같은 프로젝트가 오픈소스인 이유이며, 제가 이 블로그에서 배운 것을 계속 공유하는 이유입니다.

비슷한 문제를 연구하고 계신다면, 꼭 연락 주시기 바랍니다. 앞으로의 도전은 어떤 단일 팀이 혼자 감당하기에는 너무 큽니다.

</div>

<div data-i18n="es" markdown="1">

A medida que los grandes modelos de lenguaje evolucionan de simples herramientas de preguntas y respuestas a agentes autónomos que ejecutan código, llaman a APIs y gestionan infraestructura del mundo real, el panorama de la seguridad cambia fundamentalmente. La seguridad tradicional de la IA se centra en lo que los modelos *dicen*; la seguridad agéntica debe abordar lo que *hacen*.

## De las salidas a las acciones

Un chatbot que alucina una respuesta incorrecta es molesto. Un agente que alucina una llamada API incorrecta puede eliminar datos de producción, enviar correos electrónicos no deseados o autorizar transacciones financieras. Los riesgos son categóricamente diferentes cuando los modelos tienen agencia.

Esta distinción motiva un nuevo paradigma de seguridad: uno en el que razonamos no solo sobre la alineación del modelo, sino sobre el **riesgo a nivel de acción**: ¿Cuál es el radio de impacto de cada llamada a una herramienta? ¿Es la acción reversible? ¿Requiere aprobación humana?

## Los tres pilares de la seguridad agéntica

Basándome en mi investigación construyendo sistemas como [AIOS](https://github.com/agiresearch/AIOS) y [GuardClaw](https://github.com/TobyGE), identifico tres pilares fundamentales:

**1. Control de permisos y alcance.** Los agentes deben operar bajo el principio de mínimo privilegio. Así como los sistemas operativos aíslan los procesos en sandboxes, un sistema operativo para agentes debe restringir qué herramientas puede invocar un agente y a qué datos puede acceder.

**2. Intercepción en tiempo real.** Las verificaciones de seguridad estáticas previas al despliegue son insuficientes. Los agentes encuentran situaciones nuevas en tiempo de ejecución: una capa de seguridad debe ser capaz de interceptar, evaluar y bloquear acciones peligrosas en tiempo real, sin introducir una latencia inaceptable.

**3. Transparencia y auditabilidad.** Cada acción que un agente realiza debe registrarse con contexto completo: la cadena de razonamiento, la herramienta invocada, los parámetros utilizados y el resultado. Este registro de auditoría es esencial para depurar fallos y generar confianza.

## El camino por delante

Aún estamos en los primeros días. La mayoría de los frameworks de agentes actuales tienen una infraestructura de seguridad mínima, lo que equivale a desplegar aplicaciones web sin autenticación ni validación de entradas. A medida que los agentes se vuelven más capaces y se despliegan más ampliamente, construir mecanismos de seguridad robustos no es opcional; es el requisito previo para una adopción responsable.

Creo que las herramientas de código abierto desempeñarán un papel fundamental aquí. La seguridad no debería ser un foso propietario, sino una infraestructura compartida sobre la que toda la comunidad pueda construir y mejorar. Por eso proyectos como AIOS y GuardClaw son de código abierto, y por eso seguiré compartiendo lo que aprenda en este blog.

Si estás trabajando en problemas similares, me encantaría conectar. Los desafíos que tenemos por delante son demasiado grandes para un solo equipo.

</div>
