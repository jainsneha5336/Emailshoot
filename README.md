# 🚀 Gmail Meteor Cleaner — Triage Mode

> **Turn inbox chaos into a retro arcade space shooter.**  
> Destroy clutter email meteors with a red laser beam and safely clean your Gmail in minutes — no installs, no frameworks, just open the page and play.

Built with **Phaser 3** (CDN), **Google Identity Services OAuth 2.0**, and procedural **Web Audio API** chiptune sounds. Zero `node_modules`. Works entirely in-browser.

---

## ▶️ Quick Start — Play Instantly (No Gmail Needed)

1. Double-click **`start-server.bat`** (Windows) — or run `python -m http.server 8000` in this folder.
2. Open **`http://localhost:8000`** in Chrome / Edge / Brave.
3. Click **`PLAY DEMO MODE (5,000 EMAILS)`** → enjoy the full game with mock inbox data.

---

## 📧 Connect Your Real Gmail Account

### One-time Google Cloud Setup
You need a **Google OAuth 2.0 Web Client ID** from [console.cloud.google.com](https://console.cloud.google.com):

| Step | Action |
|------|--------|
| 1 | Create a project (or reuse one) |
| 2 | Enable the **Gmail API** |
| 3 | Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID** |
| 4 | Application type: **Web application** |
| 5 | Add `http://localhost:8000` to **Authorised JavaScript origins** |
| 6 | Add `http://localhost:8000` to **Authorised redirect URIs** |
| 7 | Copy the Client ID (ends in `.apps.googleusercontent.com`) |

> ⚠️ **Important:** The game **must** be served over `http://` (not `file://`). Always use `start-server.bat` first.

### Connecting In-Game
1. Start the local server → open `http://localhost:8000`
2. Click **`CONNECT GMAIL (OAUTH)`**
3. Paste your **Client ID** into the field
4. Click **`CONNECT & SCAN`**
5. Accept the Google consent screen
6. The pre-game triage screen loads automatically — click **`ENTER ORBIT`** to play!

---

## 🕹️ Controls

| Control | Action |
|---------|--------|
| **Mouse** | Aim ship & laser |
| **Hold Left Click / Space** | Fire continuous red laser beam |
| **K / Right-Click** | Keep sender (turns meteor green, protects future emails) |
| **Esc** | Release a frozen yellow meteor |
| **Ctrl + Z** | Undo last trash action |
| **P** | Pause / Resume |
| **M** | Toggle 8-bit sound effects |

---

## ☄️ Meteor Colour Guide

| Colour | Email Type | Action | Result |
|--------|-----------|--------|--------|
| 🔴 **Red** | Promotions, Social, Spam | Hold laser — destroy | Moved to Gmail Trash |
| 🔴 **Red Cluster** | 2–6 emails, same sender | Hold laser | All emails trashed |
| 🔴 **Boss** | Sender with 200+ emails | Sustained fire | Trash + Unsubscribe missile |
| 🟡 **Yellow** | Updates, Forums | Hold 1 s to freeze, then decide | Trash / Keep / Release |
| 🟢 **Green** | Important, Starred, Kept | **Don't shoot!** (costs 1 life) | — |
| ⭐ **Gold** | Round 2 rescues | Hold 1 s to star | Starred in Gmail |

---

## 🛡️ Safety Guarantees

- **No permanent deletion** — emails go to Gmail Trash (recoverable for 30 days).
- **10-second undo buffer** — last 20 trash actions fully reversible via `Ctrl+Z`.
- **DRY_RUN mode** (on by default) — logs all actions to the console, touches nothing real.
- **Zero tracking** — tokens live only in browser RAM; nothing is written to disk or sent to any server.

---

## 📁 File Structure

```
email_shooting game/
├── index.html              ← Main game entry point
├── start-server.bat        ← Launch local HTTP server (Windows)
├── css/
│   └── style.css           ← Retro arcade styling & CRT effects
├── js/
│   ├── config.js           ← All tunable game parameters
│   ├── main.js             ← Phaser init & OAuth wiring
│   ├── sprites.js          ← Procedural pixel-art sprite generator
│   ├── audio.js            ← Web Audio chiptune synthesiser
│   ├── mock-data.js        ← 5,000 realistic demo emails
│   ├── classifier.js       ← Gmail label → meteor colour classifier
│   ├── clusterer.js        ← Cluster & Boss detection engine
│   ├── trash-queue.js      ← Buffered trash queue + undo stack
│   ├── gmail-client.js     ← OAuth token + Gmail REST API client
│   └── scenes/
│       ├── MenuScene.js    ← Title screen
│       ├── PreGameScene.js ← Triage summary & Keep list review
│       ├── GameScene.js    ← Round 1 laser combat engine
│       ├── RescueScene.js  ← Round 2 star rescue
│       └── StatsScene.js   ← Mission debriefing & undo all
├── preview.html            ← Sprite / asset preview tool
└── tests/
    └── test-runner.html    ← In-browser unit test suite (17 tests)
```

---

## 🧪 Unit Tests

Open **`tests/test-runner.html`** directly in any browser — no server needed.  
Covers: email classification, clustering logic, boss detection, undo stack, and score calculation.

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Game Engine | Phaser 3.80 (CDN) |
| Auth | Google Identity Services (GIS) |
| Gmail API | REST via `fetch` — `gmail.modify` scope only |
| Audio | Web Audio API (procedural chiptune) |
| Fonts | Google Fonts — Press Start 2P, VT323 |
| Server | Python `http.server` or `npx http-server` |
| Build | **None** — pure HTML/CSS/JS, works from any static host |

---

*Made with ❤️ — clean your inbox, save the galaxy.*
