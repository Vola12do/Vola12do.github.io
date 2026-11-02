---
title: "Engineering Passive NTAG213 RFID/NFC Micro-Tags for Forensic Disaster Victim Identification"
date: 2026-09-14
summary: "Hardware and cryptographic memory-mapping notes from designing the Smart Denture NFC Scanner with Vikram Dental Care and National Forensic Sciences University (NFSU), Gandhinagar."
tags: [hardware, security, writeup]
slug: forensic-nfc-rfid-smart-denture-nfsu
---

## 01 // Forensic Problem Statement

In mass-disaster scenarios involving extreme thermal or physical trauma, conventional biometric identifiers often degrade, while acrylic and ceramic dental prosthetics survive intact. During my appointment as **Technical Project Associate** with **Vikram Dental Care & National Forensic Sciences University (NFSU), Gandhinagar**, we engineered the **Smart Denture NFC Scanner** — embedding passive `13.56 MHz` (`ISO/IEC 14443 Type A`) `NTAG213` micro-transponders directly into dental prosthetics.

## 02 // Hardware Architecture & NTAG213 Memory Layout

Using **Arduino microcontrollers** interfaced over `SPI` with **`MFRC522` (`RC522`)** reader/writer modules, we characterized read/write coupling distance, prosthetic resin attenuation, and thermal survival:

```text
NTAG213 EEPROM MEMORY MAP (180 Bytes / 45 Pages of 4 Bytes):
+--------------------+---------------------------------------------------+
| Page 00h .. 02h    | 7-Byte Factory UID + Check Bytes (Read-Only Lock) |
| Page 03h           | Capability Container (CC) — NDEF Version & Size   |
| Page 04h .. 24h    | 132-Byte User Payload (Signed Forensic Case Record)|
| Page 28h           | Dynamic Lock Bytes                                |
| Page 2Bh .. 2Ch    | 32-Bit Password (PWD) + 16-Bit PACK Auth          |
+--------------------+---------------------------------------------------+
```

## 03 // Evidence Admissibility & Cryptographic Integrity

To satisfy forensic chain-of-custody and evidence admissibility standards reviewed with NFSU faculty:

- **Immutable Hardware Binding:** The forensic record stored in Pages `04h..24h` binds the patient identifier and dental clinic code to the factory-burned 7-byte `UID` in Pages `00h..01h` using a compact keyed digest (`HMAC-SHA256` truncated to 128 bits), preventing tag cloning onto blank NTAG213 transponders.
- **Write-Once Lock Enforcement:** After clinical provisioning, Password Authentication (`PWD` / `AUTH0`) and irreversible static/dynamic lock bits are blown so field recovery scanners can verify the record offline without risking accidental overwrite.
