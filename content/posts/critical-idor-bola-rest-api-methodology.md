---
title: "Hunting Critical IDOR & BOLA in Enterprise REST APIs: From Traffic Interception to CERT-In Disclosure (CVSS 10.0)"
date: 2026-10-19
summary: "Systematic methodology for discovering Broken Object Level Authorization (BOLA) and Critical IDOR (CVSS v3.1: 10.0) vulnerabilities across web and mobile REST APIs using HTTP Toolkit, Burp Suite, and Python parameter fuzzing."
tags: [security, writeup, tools]
slug: critical-idor-bola-rest-api-methodology
---

## 01 // Anatomy of Broken Object Level Authorization (OWASP API1:2023)

Across modern single-page web applications and mobile backends, authentication (`who you are`) is frequently decoupled from object-level authorization (`which records your token may read or mutate`). When an API controller trusts a client-supplied identifier (`account_id`, `org_id`, `document_id`) after verifying only that the JWT signature is valid, any authenticated — or in misconfigured gateway routes, unauthenticated — requester can traverse the entire multi-tenant dataset.

## 02 // Endpoint Mapping & Differential Role Replay

During authorized VAPT operations, our workflow pairs **HTTP Toolkit** (for mobile TLS-unpinned traffic capture) and **Burp Suite** with a custom multi-role Python replay harness:

```python
import requests

ENDPOINTS = [
    ("GET", "/api/v2/accounts/records?org_id={target_id}"),
    ("PATCH", "/api/v1/user/profile/{target_id}/settings"),
]

def differential_probe(base_url: str, token_low_priv: str, target_id: int):
    headers = {"Authorization": f"Bearer {token_low_priv}", "Accept": "application/json"}
    for method, route in ENDPOINTS:
        url = base_url + route.format(target_id=target_id)
        resp = requests.request(method, url, headers=headers, timeout=10)
        print(f"[{method}] {url} -> HTTP {resp.status_code} ({len(resp.content)} bytes)")
```

## 03 // Root-Cause Analysis & CERT-In Coordinated Remediation

In our **CVSS v3.1: 10.0 (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N`)** disclosure coordinated through **CERT-In**:

1. **Root Cause:** The API gateway validated route-level token presence but forwarded the client-supplied tenant/object parameter directly to the data-access layer without scoping the query (`WHERE id = :id AND owner_tenant_id = :jwt_tenant_id`).
2. **Fix Verification:** Enforced mandatory server-side ownership predicates inside the repository layer, replaced predictable sequential integers with scoped UUIDs, and added automated regression tests asserting `HTTP 403 Forbidden` on cross-tenant object references.
