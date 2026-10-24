# ClickUp Intelligence Skill Suite

[![GenPark Agent Skills](https://img.shields.io/badge/GenPark-Agent%20Skills-6366f1.svg)](https://github.com/Alpha-Park)
[![CI](https://github.com/Alpha-Park/clickup-intelligence-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/Alpha-Park/clickup-intelligence-skill/actions)
[![ClickUp API v2](https://img.shields.io/badge/ClickUp-API%20v2-7b68ee.svg)](https://clickup.com/api)
[![ClickUp Brain](https://img.shields.io/badge/ClickUp-Brain%20AI-ff007f.svg)](https://clickup.com/features/ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, modular skill suite empowering autonomous AI agents to orchestrate project workflows, automate agile sprint lifecycles, listen to event-driven webhooks, and query centralized organizational knowledge bases using the **ClickUp API v2** and **ClickUp Brain**.

---

## 🏛 Architecture Overview

ClickUp structures work into an unambiguous hierarchy:

```
Workspace (Team)
 └── Spaces (Departments / Workflows)
      ├── Folders (Projects / Sprints)
      │    └── Lists (Task Backlogs / Boards)
      │         └── Tasks & Subtasks
      └── Folderless Lists
```

The **ClickUp Intelligence Skill Suite** equips autonomous agents with structured operational capabilities mapped directly to this hierarchy and ClickUp Brain's cognitive pillars.

```
                              ┌───────────────────────────────────┐
                              │     GenPark Autonomous Agents     │
                              └─────────────────┬─────────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         │                  │                   │                   │                  │
         ▼                  ▼                   ▼                   ▼                  ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│ clickup-pm-sprint││  clickup-brain   ││ clickup-auto-hook││clickup-docs-wiki ││clickup-resource │
│ (Sprint & Task)  ││ (Knowledge Query)││ (Webhooks/Events)││ (SOPs & Docs)    ││(Workload & Time) │
└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
         │                   │                   │                   │                   │
         └───────────────────┴───────────────────┼───────────────────┴───────────────────┘
                                                 │
                                                 ▼
                              ┌───────────────────────────────────┐
                              │     ClickUp API v2 & Webhooks     │
                              │    (api.clickup.com / brain)      │
                              └───────────────────────────────────┘
```

---

## 📦 Modular Skills Breakdown

| Skill | Directory | Core Agent | Description |
|---|---|---|---|
| **ClickUp PM & Sprint** | [`skills/clickup-pm-sprint`](skills/clickup-pm-sprint/SKILL.md) | `Coordinator` | Automated sprint planning, task breakdown, status lifecycle, and backlog triage. |
| **ClickUp Brain Knowledge** | [`skills/clickup-brain-knowledge`](skills/clickup-brain-knowledge/SKILL.md) | `Librarian` | Multi-source knowledge search, standup digest generation, and comment blocker synthesis. |
| **ClickUp Automations & Webhooks** | [`skills/clickup-automations-webhooks`](skills/clickup-automations-webhooks/SKILL.md) | `Sentinel` | Event-driven webhook processing, bi-directional sync (GitHub/Slack), and real-time triggers. |
| **ClickUp Docs & Wiki** | [`skills/clickup-docs-wiki`](skills/clickup-docs-wiki/SKILL.md) | `Scribe` | SOP generation, engineering runbook maintenance, document linking, and markdown publishing. |
| **ClickUp Resource & Capacity** | [`skills/clickup-resource-capacity`](skills/clickup-resource-capacity/SKILL.md) | `Strategist` | Time tracking analytics, capacity planning, workload heatmaps, and bottleneck mitigation. |

---

## ⚡ Model Context Protocol (MCP) Server

This repository includes a production-ready, zero-dependency **ClickUp MCP Server** (`mcp/clickup_mcp_server.js`) compliant with the Model Context Protocol (MCP) `2024-11-05` standard.

### Features
* **10 Native Tools**: `clickup_get_workspaces`, `clickup_get_spaces`, `clickup_get_lists`, `clickup_get_tasks`, `clickup_create_task`, `clickup_create_subtask`, `clickup_add_comment`, `clickup_get_comments`, `clickup_set_custom_field`.
* **Zero External Dependencies**: Operates over stdio JSON-RPC 2.0 using Node.js built-ins.
* **Universal Compatibility**: Plug-and-play with Claude Desktop, Cursor, Antigravity, and GenPark agents.

See the [ClickUp MCP Integration Guide](references/clickup_mcp_integration.md) for full configuration steps.

---

## 💻 CLI & npm Usage

The suite features an interactive unified CLI tool (`bin/clickup-agent.js`):

```bash
# Test connection & retrieve workspace details
node bin/clickup-agent.js test-connection

# Launch the Model Context Protocol (MCP) server
node bin/clickup-agent.js mcp

# Generate automated daily standup digest
node bin/clickup-agent.js standup

# Orchestrate sprint tasks and epic decomposition
node bin/clickup-agent.js sprint

# Run local webhook ingress receiver
node bin/clickup-agent.js webhook 3000

# Run automated unit & integration test suite
npm test
```

---

## 🚀 Quick Start

### 1. Environment Configuration

Export your ClickUp Personal API Token or OAuth Token:

```bash
# Linux / macOS
export CLICKUP_API_TOKEN="pk_your_clickup_token_here"

# Windows (PowerShell)
$env:CLICKUP_API_TOKEN = "pk_your_clickup_token_here"
```

### 2. Using the Native API Client Helper

The suite includes a zero-dependency, native Node.js client helper located at [`scripts/clickup_api_helper.js`](scripts/clickup_api_helper.js):

```javascript
const ClickUpClient = require('./scripts/clickup_api_helper');

const client = new ClickUpClient(process.env.CLICKUP_API_TOKEN);

async function run() {
  // 1. Fetch authorized workspaces
  const { teams } = await client.getWorkspaces();
  console.log(`Workspace: ${teams[0].name} (ID: ${teams[0].id})`);

  // 2. Query tasks in a list
  const listId = "YOUR_LIST_ID";
  const tasks = await client.getTasks(listId, { archived: false });
  console.log(`Retrieved ${tasks.tasks.length} active tasks.`);

  // 3. Create a task with automatic subtask breakdown
  const newTask = await client.createTask(listId, {
    name: "Implement Auth Flow",
    description: "Build OAuth authentication integration",
    priority: 2 // High
  });

  await client.createSubtask(listId, newTask.id, {
    name: "Configure client ID & secret"
  });
}

run().catch(console.error);
```

---

## 🛠 Repository Directory Structure

```
clickup-intelligence-skill/
├── README.md                              # Main suite overview and quickstart
├── SKILL.md                               # Unified top-level skill definition
├── mcp/
│   └── clickup_mcp_server.js              # Standard MCP stdio server (JSON-RPC 2.0)
├── references/
│   ├── clickup_api_reference.md           # API v2 endpoint specifications
│   ├── clickup_webhooks_guide.md          # Webhook events and payload schemas
│   ├── clickup_brain_architecture.md      # ClickUp Brain AI integration patterns
│   └── clickup_mcp_integration.md         # MCP server setup for Claude/Cursor/Antigravity
├── scripts/
│   ├── clickup_api_helper.js              # Native Node.js HTTPS client wrapper
│   ├── example_task_sprint_orchestration.js # Sprint board generator & task decomposing
│   ├── example_knowledge_search.js        # Knowledge search and standup digest
│   └── example_webhook_listener.js        # Webhook listener and event dispatcher
└── skills/
    ├── clickup-pm-sprint/
    │   └── SKILL.md                       # PM & Agile sprint automation skill
    ├── clickup-brain-knowledge/
    │   └── SKILL.md                       # Brain knowledge query & standup skill
    ├── clickup-automations-webhooks/
    │   └── SKILL.md                       # Event-driven webhook handler skill
    ├── clickup-docs-wiki/
    │   └── SKILL.md                       # Docs & SOP knowledge graph skill
    └── clickup-resource-capacity/
        └── SKILL.md                       # Workload & time tracking capacity skill
```

---

## 🔒 Safety, Governance & Best Practices

1. **Token Protection**: Never check personal tokens (`pk_...`) or OAuth secrets into git commits. Store secrets in environment variables or cloud secret managers.
2. **Rate Limit Handling**: ClickUp API enforces a limit of **100 requests/minute** per token. The included client helper handles HTTP `429 Too Many Requests` responses with exponential backoff.
3. **Auditing**: All agent actions prepend standard audit signatures (e.g. `[GenPark AI]: Created task`) in descriptions and comments to maintain human-verifiable provenance.
4. **Data Privacy**: PII and sensitive internal credentials are automatically sanitized before posting to task descriptions or public comments.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
