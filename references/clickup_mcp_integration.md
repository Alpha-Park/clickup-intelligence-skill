# ClickUp Model Context Protocol (MCP) Server Integration Guide

This guide details how to integrate the zero-dependency ClickUp MCP Server (`mcp/clickup_mcp_server.js`) into modern AI agent hosts such as Claude Desktop, Cursor, Antigravity, and GenPark.

---

## 1. Overview

The ClickUp MCP Server exposes 10 structured ClickUp API tools directly to large language model agents via standard input/output (`stdio`) following the Model Context Protocol specification (`2024-11-05`).

### Available MCP Tools

| Tool Name | Parameters | Purpose |
|---|---|---|
| `clickup_get_workspaces` | `{}` | Discover accessible Workspaces (Team IDs) |
| `clickup_get_spaces` | `team_id` | List Spaces inside a Workspace |
| `clickup_get_folders` | `space_id` | List Folders in a Space |
| `clickup_get_lists` | `folder_id` or `space_id` | List task Lists (Folder or Space level) |
| `clickup_get_tasks` | `list_id`, `archived`, `subtasks` | Query tasks and backlog items |
| `clickup_create_task` | `list_id`, `name`, `description`, `priority`, `status` | Create new top-level tasks |
| `clickup_create_subtask` | `list_id`, `parent_task_id`, `name`, `description`, `priority` | Decompose work into granular subtasks |
| `clickup_add_comment` | `task_id`, `comment_text`, `notify_all` | Post comments and blocker updates |
| `clickup_get_comments` | `task_id` | Extract task discussions & blockers |
| `clickup_set_custom_field` | `task_id`, `field_id`, `value` | Assign story points, tags, categories |

---

## 2. Configuration for Claude Desktop

Add the following to your `claude_desktop_config.json`:

* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "clickup": {
      "command": "node",
      "args": [
        "C:\\Users\\NORMCORN\\.gemini\\antigravity\\scratch\\clickup-intelligence-skill\\mcp\\clickup_mcp_server.js"
      ],
      "env": {
        "CLICKUP_API_TOKEN": "pk_your_personal_api_token_here"
      }
    }
  }
}
```

---

## 3. Configuration for Cursor / VS Code / Antigravity

In your agent or workspace settings:

```json
{
  "mcp": {
    "servers": {
      "clickup": {
        "command": "node",
        "args": ["./mcp/clickup_mcp_server.js"],
        "env": {
          "CLICKUP_API_TOKEN": "${env:CLICKUP_API_TOKEN}"
        }
      }
    }
  }
}
```

---

## 4. Manual Testing via Terminal

You can test the server directly from PowerShell or bash:

```powershell
# Initialize handshake
'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node mcp/clickup_mcp_server.js

# List tools
'{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node mcp/clickup_mcp_server.js
```
