---
title: "Deterministic Android & Flutter Reverse Engineering: AES-128 Key Entropy & ART Heap Forensics"
date: 2026-10-28
summary: "Field methodology for extracting static symmetric AES-128-GCM keys from decompiled Android/Flutter packages using JADX, APKTool, MobSF, Shannon entropy scanning, and ART .hprof object-graph analysis."
tags: [android, security, writeup, tools]
slug: android-apk-entropy-and-hprof-forensics
---

## 01 // Operational Context

During mobile application security assessments and law-enforcement APK triage, a recurring anti-analysis pattern is the combination of **multi-DEX/Flutter packaging** with client-side payload encryption (`AES/GCM/NoPadding` or `AES/CBC/PKCS5Padding`). When developers embed symmetric keys directly inside bytecode or native `.so` sections, static signature scanners often miss keys that are split across byte arrays or reconstructed in `Application.attachBaseContext()`.

This dispatch outlines a reproducible two-stage workflow combining **Shannon entropy window scanning** over `JADX` / `APKTool` outputs with **Android ART `.hprof` heap object-graph reconstruction**.

## 02 // Stage 1: Static Decompilation & Entropy Key Isolation

We begin by unpacking the container with `APKTool` and decompiling all `classes*.dex` archives using `JADX`:

```bash
apktool d target_sample.apk -o ./unpacked_apk
jadx -d ./jadx_out --show-bad-code --deobf target_sample.apk
```

To locate candidate 16-byte (`128-bit`) and 32-byte (`256-bit`) cryptographic keys hidden inside `rodata` or constant pools without relying on variable names, we scan contiguous byte slices for high Shannon entropy $H(X)$:

```python
import math
from collections import Counter

def shannon_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = Counter(data)
    length = len(data)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())

def scan_candidates(blob: bytes, window: int = 16, threshold: float = 3.75):
    for offset in range(0, len(blob) - window, 4):
        chunk = blob[offset : offset + window]
        if shannon_entropy(chunk) >= threshold:
            yield offset, chunk.hex()
```

Cross-referencing high-entropy slices against `javax.crypto.spec.SecretKeySpec` and `GCMParameterSpec` call sites in JADX immediately isolates hardcoded AES-128-GCM keys used to encrypt local SQLite tables and REST API request bodies.

## 03 // Stage 2: Runtime ART `.hprof` Object-Graph Reconstruction

When an application unpacks secondary `DEX` payloads in memory via `InMemoryDexClassLoader` or decrypts endpoint URLs lazily at runtime:

1. Capture the process heap via `am dumpheap <pid> /data/local/tmp/heap.hprof`.
2. Parse `HEAP_DUMP_SEGMENT` (`0x1C`) records to reconstruct `java.lang.String` instances (both UTF-16 `char[]` and Android ART Latin-1 `byte[]` representations) alongside `android.app.SharedPreferencesImpl` in-memory `HashMap$Node` entries.
3. Carve any `PRIMITIVE_ARRAY_DUMP` (`byte[]`) containing `dex\n035\x00` or `cdex001` headers and trace shortest GC-root paths via Breadth-First Search (`ROOT_STATIC_FIELD` $\rightarrow$ holding class $\rightarrow$ decrypted C2/API field).

## 04 // Remediation Architecture

- Never embed static symmetric keys in DEX bytecode, Flutter `libapp.so` blobs, or `BuildConfig` constants.
- Derive session encryption keys dynamically via authenticated **ECDH key exchange** backed by hardware-attested **Android Keystore (`KeyGenParameterSpec`)** storage.
- Enforce `EncryptedSharedPreferences` (`AES256_SIV` key encryption + `AES256_GCM` value encryption) for all local session tokens.
