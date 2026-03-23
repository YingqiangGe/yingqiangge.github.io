---
title: 'QLoRA on Quantized Models: The Gap CUDA Left Open and MLX Filled'
title_zh: '量化模型上的 QLoRA：CUDA 留下的空白，MLX 填上了'
title_ja: '量子化モデルでのQLoRA：CUDAが残したギャップをMLXが埋める'
title_ko: '양자화 모델의 QLoRA: CUDA가 남긴 빈자리를 MLX가 채우다'
title_es: 'QLoRA en Modelos Cuantizados: El Vacío que CUDA Dejó y MLX Llenó'
date: 2026-03-23
permalink: /posts/2026/03/mlx-quantization-finetuning/
tags:
  - MLX
  - Apple Silicon
  - quantization
  - fine-tuning
  - LLM
---

<div data-i18n="en" markdown="1">

You want to fine-tune a small LLM on your own data. A safety classifier, a code reviewer, a domain expert. The plan is obvious: take an open-weight model, quantize it to INT4, LoRA it, deploy locally. No cloud. No API costs.

Then you try to actually do it.

## The CUDA Gap: Quantization and Training Don't Mix

QLoRA is one of the most important techniques in modern LLM training. The idea is simple: freeze a quantized base model, train only the tiny LoRA adapter matrices. Memory-efficient, fast, and you keep most of the base model's quality.

But here's what nobody tells you upfront: **on CUDA, QLoRA only works with the worst quantization method available.**

The CUDA quantization landscape has three major players:

**AWQ** — the gold standard for INT4 quality. Uses activation-aware calibration to preserve the channels that matter most. Excellent models. But AWQ's CUDA kernels (`WQLinear_GEMM`) are hand-written, fused, and have **no backward pass**. No autograd, no gradients, no training. Period.

**GPTQ** — calibration-based, high quality. Technically supports LoRA training through PEFT, but you must disable the fast kernels (ExLlama, Marlin) and fall back to a slow dequantize path. It works, but at a significant performance penalty, and it's far from turnkey.

**bitsandbytes NF4** — the only quantization specifically designed for training. This is what powers QLoRA in practice. But NF4 uses Round-To-Nearest quantization — the simplest, lowest-quality method. No calibration data, no activation-aware optimization. And it's CUDA-only: no Mac, no AMD.

The irony: **the quantization methods that produce the best models can't train. The one that can train produces the worst quantization.** You're forced to choose between model quality and trainability.

Why? Because AWQ and GPTQ were built for **deployment**. Their quantized linear layers are opaque, fused CUDA kernels optimized purely for inference throughput. Gradients can't flow through them. Nobody's going to rewrite those kernels with backward passes — it's hard, it would slow down inference, and bitsandbytes already "solved" the training case. So the gap persists.

## Why MLX Doesn't Have This Problem

MLX solves this architecturally, not with patches:

```
CUDA ecosystem:
  nn.Linear (FP16)          ← training ✓
  WQLinear_GEMM (INT4/AWQ)  ← inference only, black box
  QuantLinear (INT4/GPTQ)   ← training possible, but slow fallback

MLX:
  nn.QuantizedLinear (INT4)  ← both training and inference ✓
```

MLX's quantized layer is transparent. It dequantizes INT4 weights to FP16, does a standard matmul, and the entire operation stays in the computation graph:

```python
w = dequantize(self.weight, self.scales, self.biases)  # INT4 → FP16
return x @ w.T  # standard matmul, gradients flow naturally
```

LoRA adapters don't need gradients through the frozen quantized weights — they just need the forward pass to be in the computation graph so the adapter matrices receive gradient signal. Since MLX's dequant → matmul isn't a fused black box, this works out of the box. No PEFT hacks. No kernel downgrades. The same quantized model you use for inference is the one you fine-tune on.

And this applies to **every** quantization method MLX supports — RTN, DWQ, mixed-precision — all trainable by default.

## Unified Memory: The Mac Advantage

Apple Silicon's unified memory eliminates the GPU VRAM bottleneck:

```
NVIDIA:  CPU RAM (64GB) ←PCIe→ GPU VRAM (24GB)
         Model + optimizer + activations must fit in VRAM

Apple:   Unified memory (36/64/128/192GB)
         CPU and GPU share the same pool, zero-copy
```

For a 4B INT4 model with QLoRA, total training memory is under 4 GB. Any Mac with 16GB handles this. A 64GB+ Mac can train models that would OOM on a 24GB RTX 4090.

## The Full Pipeline

```bash
# 1. Quantize (seconds, BF16 → INT4)
mlx_lm.convert --model Qwen/Qwen3-4B-Instruct \
    -q --q-bits 4 --q-group-size 64 --mlx-path ./qwen3-4b-int4

# 2. Fine-tune (INT4 base frozen, only LoRA adapters train)
mlx_lm.lora --model ./qwen3-4b-int4 --data ./training-data \
    --train --batch-size 2 --lora-layers 16 --lora-rank 8 \
    --iters 1000 --adapter-path ./my-adapter

# 3. Fuse and serve
mlx_lm.fuse --model ./qwen3-4b-int4 \
    --adapter-path ./my-adapter --save-path ./qwen3-4b-finetuned
mlx_lm.server --model ./qwen3-4b-finetuned --port 8080
```

Quantize, train, deploy — one machine, zero cloud cost. Both RTN and DWQ quantized models are trainable — you don't sacrifice quality for trainability.

For more advanced workflows beyond SFT and QLoRA, the community project [mlx-tune](https://github.com/ARahim3/mlx-tune) adds DPO, GRPO, RLHF/PPO, and vision model fine-tuning on MLX, with an Unsloth-compatible API.

## Honest Trade-Offs

**Speed.** Apple Silicon is slower than H100s. For small models and small datasets, it's hours vs. minutes — acceptable when the alternative is paying for cloud GPUs.

**Apple Silicon only.** MLX runs only on Mac. Trained adapters can be exported to safetensors for cross-platform deployment.

**Ecosystem maturity.** Younger than PyTorch. Most workflows are covered; edge cases may need custom code.

</div>
