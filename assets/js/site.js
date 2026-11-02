/* ═══════════════════════════════════════════════════════════════════════════
   VISHWASH TANK // VOLA12DO — FIELD CONSOLE INTERACTIVE TELEMETRY ENGINE
   Powers:
   1. Nothing-style 28x7 LED Dot-Matrix Glyph Renderer + Mouse Reactive Trail
   2. Teenage Engineering WebAudio Mechanical Relay Click Synthesizer
   3. Interactive Vulnerability Dossier Explorer (CVSS 10.0 CERT-In .. #05)
   4. Interactive CLI Shell (vola12do@field-console:~$)
   5. Theme Switcher (Stealth Carbon <-> Field Paper) & Live Coordinate HUD
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── 1. MECHANICAL RELAY AUDIO SYNTHESIZER (TEENAGE ENGINEERING TICK) ─── */
  var audioEnabled = true;
  var audioCtx = null;

  function playMechanicalTick(freq, durationMs) {
    if (!audioEnabled) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq || 1350, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + (durationMs || 14) / 1000);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (durationMs || 14) / 1000);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (durationMs || 14) / 1000);
    } catch (_) {}
  }

  /* ── 2. THEME SWITCHER (STEALTH CARBON <-> FIELD PAPER) ───────────────── */
  function initTheme() {
    var saved = localStorage.getItem("vola12do.theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeBtn(saved);

    var btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "dark";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("vola12do.theme", next);
        updateThemeBtn(next);
        playMechanicalTick(1600, 16);
      });
    }

    var soundBtn = document.getElementById("sound-toggle-btn");
    if (soundBtn) {
      soundBtn.addEventListener("click", function () {
        audioEnabled = !audioEnabled;
        soundBtn.textContent = audioEnabled ? "CLICK: ON" : "CLICK: MUTE";
        if (audioEnabled) playMechanicalTick(1800, 15);
      });
    }
  }

  function updateThemeBtn(mode) {
    var btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.textContent = mode === "dark" ? "SURFACE: CARBON [DARK]" : "SURFACE: PAPER [LIGHT]";
    }
  }

  /* ── 3. NOTHING OS 28x7 LED DOT-MATRIX DISPLAY ENGINE ─────────────────── */
  var FONT_4X5 = {
    "A": ["0110","1001","1111","1001","1001"],
    "B": ["1110","1001","1110","1001","1110"],
    "C": ["0111","1000","1000","1000","0111"],
    "D": ["1110","1001","1001","1001","1110"],
    "E": ["1111","1000","1110","1000","1111"],
    "F": ["1111","1000","1110","1000","1000"],
    "G": ["0111","1000","1011","1001","0111"],
    "H": ["1001","1001","1111","1001","1001"],
    "I": ["1110","0100","0100","0100","1110"],
    "J": ["0011","0001","0001","1001","0110"],
    "K": ["1001","1010","1100","1010","1001"],
    "L": ["1000","1000","1000","1000","1111"],
    "M": ["1001","1111","1111","1001","1001"],
    "N": ["1001","1101","1011","1001","1001"],
    "O": ["0110","1001","1001","1001","0110"],
    "P": ["1110","1001","1110","1000","1000"],
    "R": ["1110","1001","1110","1010","1001"],
    "S": ["0111","1000","0110","0001","1110"],
    "T": ["1111","0100","0100","0100","0100"],
    "U": ["1001","1001","1001","1001","0110"],
    "V": ["1001","1001","1001","0110","0110"],
    "W": ["1001","1001","1111","1111","1001"],
    "X": ["1001","0110","0110","0110","1001"],
    "Y": ["1001","1001","0110","0100","0100"],
    "0": ["0110","1001","1001","1001","0110"],
    "1": ["0100","1100","0100","0100","1110"],
    "2": ["1110","0001","0110","1000","1111"],
    "3": ["1110","0001","0110","0001","1110"],
    "4": ["1001","1001","1111","0001","0001"],
    "7": ["1111","0001","0010","0100","0100"],
    "8": ["0110","1001","0110","1001","0110"],
    ".": ["0000","0000","0000","0000","0100"],
    "-": ["0000","0000","1110","0000","0000"],
    " ": ["0000","0000","0000","0000","0000"]
  };

  function initDotMatrix() {
    var container = document.getElementById("dot-matrix-canvas");
    var labelEl = document.getElementById("dm-mode-label");
    if (!container) return;

    var COLS = 28;
    var ROWS = 7;
    var cells = [];
    container.innerHTML = "";

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var div = document.createElement("div");
        div.className = "dm-cell";
        div.dataset.r = r;
        div.dataset.c = c;
        div.addEventListener("mouseenter", function () {
          this.classList.add("green");
          playMechanicalTick(2100, 8);
          var self = this;
          setTimeout(function () { self.classList.remove("green"); }, 480);
        });
        container.appendChild(div);
        cells.push(div);
      }
    }

    var words = [
      { text: "CVSS10", sub: "SIGNAL // CERT-IN CVSS 10.0" },
      { text: "VAPT01", sub: "SIGNAL // WEB & REST API SEC" },
      { text: "AES128", sub: "SIGNAL // APK & FLUTTER RE" },
      { text: "NOCTF",  sub: "SIGNAL // PATENT FILED LABS" },
      { text: "ESP32",  sub: "SIGNAL // 2.4GHZ RF & BLE LAB" }
    ];
    var idx = 0;

    function renderWord(item) {
      cells.forEach(function (el) { el.classList.remove("on"); });
      var str = item.text.toUpperCase();
      var colCursor = 1;
      for (var i = 0; i < str.length; i++) {
        var glyph = FONT_4X5[str[i]] || FONT_4X5[" "];
        for (var gr = 0; gr < 5; gr++) {
          for (var gc = 0; gc < 4; gc++) {
            if (glyph[gr][gc] === "1") {
              var targetR = gr + 1;
              var targetC = colCursor + gc;
              if (targetC < COLS) {
                cells[targetR * COLS + targetC].classList.add("on");
              }
            }
          }
        }
        colCursor += 4;
        if (str[i] !== ".") colCursor += 1;
      }
      if (labelEl) labelEl.textContent = item.sub;
    }

    renderWord(words[0]);
    setInterval(function () {
      idx = (idx + 1) % words.length;
      renderWord(words[idx]);
    }, 3200);
  }

  /* ── 4. INTERACTIVE VULNERABILITY DISCOVERIES EXPLORER ────────────────── */
  var VULN_DATA = [
    {
      id: "VULN-01",
      cvss: "CVSS v3.1: 10.0 (CRITICAL)",
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N",
      disclosure: "Coordinated via CERT-In",
      category: "OWASP API1:2023 / Broken Access Control",
      title: "Critical IDOR & Authorization Bypass in Enterprise Web Application",
      summary: "Identified a critical authorization bypass across multi-tenant REST API endpoints where object identifiers were evaluated without binding the session bearer token to the owning tenant hierarchy.",
      trace: "[REQUEST TRACE // REDACTED]\nGET /api/v2/accounts/records?org_id=10482 HTTP/1.1\nHost: [REDACTED-ENTERPRISE-TARGET]\nAuthorization: Bearer <low_privilege_session_jwt>\n\n[IMPACT & REMEDIATION]\n• Impact: Unauthenticated / cross-tenant horizontal & vertical access to sensitive PII records.\n• Remediation: Enforced server-side RBAC ownership assertions at the middleware controller layer and migrated sequential integer keys to scoped UUIDv4 references.\n• Status: Documented full root-cause analysis (RCA) and coordinated disclosure via CERT-In."
    },
    {
      id: "VULN-02",
      cvss: "HIGH SEVERITY",
      vector: "OWASP MASVS-CRYPTO-1 / CWE-321",
      disclosure: "Internal Law-Enforcement Triage",
      category: "Android & Flutter Reverse Engineering",
      title: "Hardcoded AES-128-GCM Cryptographic Keys in Decompiled Mobile Bytecode",
      summary: "Reverse-engineered production Android and Flutter application packages using MobSF, JADX, and APKTool; isolated static symmetric AES-128 keys and IV material via Shannon entropy scanning.",
      trace: "[STATIC & ENTROPY EXTRACT // JADX + PYTHON]\nTarget Artifact : classes2.dex / libapp.so\nShannon Entropy : 7.84 bits/byte @ offset 0x0014A8C0\nCipher Spec     : AES/GCM/NoPadding (128-bit static key embedded in helper class)\n\n[IMPACT & REMEDIATION]\n• Impact: Complete offline decryption of intercepted API payloads and local encrypted SQLite databases.\n• Remediation: Migrated key derivation to Android Keystore Hardware-Backed Keymaster with per-session ECDH ephemeral exchange."
    },
    {
      id: "VULN-03",
      cvss: "HIGH SEVERITY",
      vector: "OWASP API1:2023 / CWE-639",
      disclosure: "Authorized API VAPT",
      category: "REST API Security Testing",
      title: "Broken Object Level Authorization (BOLA) Across Mobile REST Endpoints",
      summary: "Intercepted pinned mobile API traffic using HTTP Toolkit and Burp Suite; systematically mapped undocumented endpoints and proved cross-account state mutation.",
      trace: "[BURP SUITE / PYTHON FUZZER TRACE]\nPATCH /api/v1/user/profile/49102/settings HTTP/2\nX-Session-Role: standard_user\nContent-Type: application/json\n\n{\"phone_verified\": true, \"account_tier\": \"verified\"}\n\n[IMPACT & REMEDIATION]\n• Impact: Cross-account record read/write across 14 REST endpoints.\n• Remediation: Implemented resource-level policy guards verifying `req.user.id === resource.owner_id` before ORM serialization."
    },
    {
      id: "VULN-04",
      cvss: "MEDIUM-HIGH SEVERITY",
      vector: "OWASP MASVS-STORAGE-1 / CWE-312",
      disclosure: "Mobile Application Audit",
      category: "Local Data Forensics",
      title: "Insecure Cleartext Local Storage of Bearer Tokens & Session Artifacts",
      summary: "Discovered long-lived JWT refresh tokens, session cookies, and user PII persisted in unencrypted SharedPreferences XML and world-readable SQLite tables on device storage.",
      trace: "[ADB FORENSIC EXTRACTION]\n/data/data/<package_name>/shared_prefs/auth_session.xml\n  <string name=\"jwt_refresh_token\">eyJhbGciOiJIUzI1NiIsInR5cCI...</string>\n  <string name=\"cleartext_pin\">****</string>\n\n[IMPACT & REMEDIATION]\n• Impact: Instant session hijacking via physical device extraction, ADB backup, or rogue root process.\n• Remediation: Enforced EncryptedSharedPreferences (AES-256-SIV / AES-256-GCM) and short-lived rotating tokens."
    },
    {
      id: "VULN-05",
      cvss: "HIGH SEVERITY",
      vector: "OWASP API5:2023 / CWE-269",
      disclosure: "Authorized Web & API VAPT",
      category: "Broken Function Level Authorization",
      title: "Vertical Privilege Escalation via Role Parameter Mass Assignment",
      summary: "Bypassed client-side role restrictions by injecting administrative role attributes during account state update requests, escalating a standard user session to administrative privileges.",
      trace: "[MASS ASSIGNMENT PAYLOAD]\nPOST /api/v1/member/update-preferences HTTP/1.1\nContent-Type: application/json\n\n{\"notifications\": true, \"role\": \"super_admin\", \"is_staff\": 1}\n\n[IMPACT & REMEDIATION]\n• Impact: Full administrative dashboard takeover from an unprivileged account.\n• Remediation: Enforced strict schema allow-listing (Pydantic/DTO strict mode) stripping privileged fields from user-supplied payloads."
    }
  ];

  function initVulnExplorer() {
    var buttons = document.querySelectorAll(".vuln-item");
    if (!buttons.length) return;

    function selectVuln(index) {
      var item = VULN_DATA[index];
      if (!item) return;
      buttons.forEach(function (b, i) {
        b.classList.toggle("active", i === index);
      });
      var idEl = document.getElementById("vd-id");
      var titleEl = document.getElementById("vd-title");
      var cvssEl = document.getElementById("vd-cvss");
      var discEl = document.getElementById("vd-disc");
      var catEl = document.getElementById("vd-cat");
      var sumEl = document.getElementById("vd-summary");
      var traceEl = document.getElementById("vd-trace");

      if (idEl) idEl.textContent = item.id + " // " + item.vector;
      if (titleEl) titleEl.textContent = item.title;
      if (cvssEl) cvssEl.textContent = item.cvss;
      if (discEl) discEl.textContent = item.disclosure;
      if (catEl) catEl.textContent = item.category;
      if (sumEl) sumEl.textContent = item.summary;
      if (traceEl) traceEl.textContent = item.trace;
    }

    buttons.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        playMechanicalTick(1420, 14);
        selectVuln(idx);
      });
    });

    selectVuln(0);
  }

  /* ── 5. INTERACTIVE FIELD TERMINAL (vola12do@field-console:~$) ────────── */
  function initTerminal() {
    var out = document.getElementById("term-output");
    var input = document.getElementById("term-input");
    var chips = document.querySelectorAll(".term-cmd-chip");
    if (!out || !input) return;

    var COMMANDS = {
      "help": [
        "AVAILABLE FIELD CONSOLE COMMANDS:",
        "  whoami        — Operator identity, role & clearance summary",
        "  vulns         — List disclosed CVEs / CERT-In findings (CVSS 10.0)",
        "  experience    — Chronological field operations (Rajasthan Police HQ, NFSU)",
        "  projects      — Engineered systems (PEAK, NoCTF Patent, SOARX, ESP32 RF)",
        "  skills        — Full offensive & defensive technical stack",
        "  cv            — Download official PDF curriculum vitae",
        "  contact       — Direct communication channels",
        "  theme         — Toggle Stealth Carbon / Field Paper surface",
        "  clear         — Clear terminal buffer"
      ].join("\n"),
      "whoami": [
        "OPERATOR   : Vishwash Tank (@Vola12do)",
        "SPECIALTY  : Application Security, VAPT, API & Mobile Forensics, Python & RF Lab",
        "CURRENT OP : Cyber Crime Intern @ Rajasthan Police HQ (SP Cyber Crime, Jaipur)",
        "PRIOR OP   : Technical Project Associate @ NFSU Gandhinagar (Forensic NFC Lab)",
        "EDUCATION  : B.Sc. Computer Science — Gujarat University (CGPA: 7.48 • Distinction)",
        "CERT-IN    : Critical IDOR Disclosure (CVSS v3.1: 10.0) | Patent Filed: NoCTF"
      ].join("\n"),
      "vulns": [
        "[01] CVSS 10.0 CRITICAL — IDOR & Broken Access Control (Disclosed via CERT-In)",
        "[02] HIGH SEVERITY      — Hardcoded AES-128-GCM Keys in Mobile/Flutter Bytecode",
        "[03] HIGH SEVERITY      — Broken Object Level Authorization (BOLA) in REST APIs",
        "[04] MEDIUM-HIGH        — Insecure Cleartext Local Token Storage (Android)",
        "[05] HIGH SEVERITY      — Vertical Privilege Escalation via Role Manipulation"
      ].join("\n"),
      "experience": [
        "• May 2026 – Present  | Cyber Crime Intern @ Rajasthan Police Headquarters (Jaipur)",
        "• Dec 2025 – Apr 2026 | Technical Project Associate @ Vikram Dental Care & NFSU Gandhinagar",
        "• Aug 2024 – Feb 2025 | Junior Cybersecurity Trainer @ Cyber Octet Pvt. Ltd. (Ahmedabad)"
      ].join("\n"),
      "projects": [
        "• PEAK Platform  — Deterministic Android APK Static/Dynamic Forensics & Cloud Batch Engine",
        "• NoCTF          — Containerized Labs-as-a-Service on GCP & Docker [PATENT FILED]",
        "• SOARX          — Real-time Python Host & Daemon Security Telemetry Dashboard",
        "• GTD Intel      — Global Terrorism Database Threat Intelligence Visualizer",
        "• WiFi Deauther  — Custom C++ ESP8266 802.11 Management Frame Audit Firmware",
        "• BLE Jammer/Audit— ESP32 + nRF24L01 2.4GHz & GATT Security Auditor",
        "• Smart Denture  — NTAG213 RFID/NFC Forensic Disaster Victim ID System (NFSU)"
      ].join("\n"),
      "skills": [
        "APPSEC   : Web & API VAPT, Android RE, OWASP Top 10, API Top 10, MASVS, CVSS v3.1",
        "TOOLS    : Burp Suite, OWASP ZAP, MobSF, JADX, APKTool, HTTP Toolkit, Wireshark, Nmap",
        "SIEM/OPS : Splunk, Elastic Stack (ELK), Suricata IDS, Linux auditd, Docker, GCP",
        "CODE     : Python (Scapy, PyShark, Sockets, Threading), C++, Bash, SQL",
        "HARDWARE : ESP32, ESP8266, Arduino, nRF24L01, NTAG213 RFID, RC522, Rubber Ducky HID"
      ].join("\n"),
      "contact": [
        "EMAIL    : vishwashtank@gmail.com",
        "PHONE    : +91 82003 64523",
        "GITHUB   : https://github.com/Vola12do",
        "LINKEDIN : https://www.linkedin.com/in/vishwash-tank-89308b28b",
        "MEDIUM   : https://medium.com/@vishwashtank"
      ].join("\n")
    };

    function runCommand(raw) {
      var cmd = (raw || "").trim().toLowerCase();
      if (!cmd) return;
      playMechanicalTick(1280, 12);

      if (cmd === "clear") {
        out.innerHTML = "";
        return;
      }

      var line = document.createElement("div");
      line.className = "term-line";
      line.innerHTML = '<span class="term-prompt">vola12do@field-console:~$</span> ' + escapeHtml(raw);
      out.appendChild(line);

      var resp = document.createElement("div");
      resp.className = "term-line";

      if (cmd === "cv") {
        resp.textContent = "Opening official CV: assets/Vishwash_Tank_CV.pdf ...";
        window.open("assets/Vishwash_Tank_CV.pdf", "_blank");
      } else if (cmd === "theme") {
        document.getElementById("theme-toggle-btn")?.click();
        resp.textContent = "Surface mode toggled.";
      } else if (COMMANDS[cmd]) {
        resp.textContent = COMMANDS[cmd];
      } else {
        resp.textContent = "Command not recognized: '" + raw + "'. Type 'help' for available commands.";
      }

      out.appendChild(resp);
      out.scrollTop = out.scrollHeight;
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var val = input.value;
        input.value = "";
        runCommand(val);
      }
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        runCommand(chip.dataset.cmd);
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ── 6. LIVE COORDINATE & JAIPUR IST CLOCK HUD ────────────────────────── */
  function initHud() {
    var coordEl = document.getElementById("hud-coords");
    var clockEl = document.getElementById("hud-clock");

    window.addEventListener("mousemove", function (e) {
      if (coordEl) {
        var x = String(e.clientX).padStart(4, "0");
        var y = String(e.clientY).padStart(4, "0");
        coordEl.textContent = "CURSOR // X:" + x + " Y:" + y;
      }
    });

    function updateClock() {
      if (!clockEl) return;
      try {
        var now = new Date();
        var ist = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
        clockEl.textContent = "JAIPUR, IN // " + ist + " IST (UTC+05:30)";
      } catch (_) {}
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initDotMatrix();
    initVulnExplorer();
    initTerminal();
    initHud();
  });
})();
