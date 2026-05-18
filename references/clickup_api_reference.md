# ClickUp API v2 Integration & Reference Guide

This reference provides a structured mapping of ClickUp Public API v2 endpoints, payload schemas, and authentication guidelines used by GenPark agents to execute project management and knowledge retrieval operations.

---

## 1. Authentication

ClickUp API v2 supports two forms of authentication:
1. **Personal API Tokens**: Used for single-user scripting and custom integrations.
2. **OAuth2 Flow**: Used for production multi-tenant applications.

### Headers Setup
All API requests must include the `Authorization` header populated with your token:

```http
Authorization: <YOUR_PERSONAL_TOKEN_OR_OAUTH_TOKEN>
Content-Type: application/json
```

---

## 2. ClickUp Hierarchy Overview

The API requests are scoped down the hierarchy. Most endpoints require the parent node's ID:
```
Workspace (Team ID) ──> Space ID ──> Folder ID ──> List ID ──> Task ID ──> Subtask ID
```

---

## 3. Core API Endpoints

### 3.1 Workspaces (Teams)
Retrieve the workspaces the authenticated user has access to. This is the starting point to discover your `team_id` / `workspace_id`.

* **Endpoint**: `GET https://api.clickup.com/api/v2/team`
* **Response Example**:
  ```json
  {
    "teams": [
      {
        "id": "1234567",
        "name": "GenPark Hub Workspace",
        "members": [
          {
            "user": {
              "id": 8899,
              "username": "krispang",
              "email": "krispang1020@gmail.com"
            }
          }
        ]
      }
    ]
  }
  ```

### 3.2 Spaces
Create, retrieve, or update spaces. Spaces group related departments or workflows.

* **Get Spaces**: `GET https://api.clickup.com/api/v2/team/{team_id}/space`
* **Create Space**: `POST https://api.clickup.com/api/v2/team/{team_id}/space`
* **Payload**:
  ```json
  {
    "name": "Engineering Operations",
    "multiple_assignees": true,
    "features": {
      "due_dates": {
        "enabled": true,
        "start_date": true,
        "remap_due_dates": true,
        "remap_closed_due_dates": false
      },
      "time_tracking": { "enabled": true }
    }
  }
  ```

### 3.3 Folders
Folders reside within Spaces and hold multiple Lists.

* **Get Folders**: `GET https://api.clickup.com/api/v2/space/{space_id}/folder`
* **Create Folder**: `POST https://api.clickup.com/api/v2/space/{space_id}/folder`
* **Payload**:
  ```json
  {
    "name": "Sprint 24 Planning"
  }
  ```

### 3.4 Lists
Lists act as the direct parents for Tasks. A list can reside inside a Folder or directly inside a Space (Folderless List).

* **Get Folder Lists**: `GET https://api.clickup.com/api/v2/folder/{folder_id}/list`
* **Get Folderless Lists**: `GET https://api.clickup.com/api/v2/space/{space_id}/list`
* **Create List**: `POST https://api.clickup.com/api/v2/folder/{folder_id}/list` (or Space endpoint for folderless)
* **Payload**:
  ```json
  {
    "name": "Product Backlog",
    "content": "Core backlog containing all feature requests",
    "status": "active"
  }
  ```

### 3.5 Tasks & Subtasks
Tasks are the primary units of work. Subtasks are created by targeting a specific parent task ID.

* **Get Tasks**: `GET https://api.clickup.com/api/v2/list/{list_id}/task?archived=false&subtasks=true`
* **Create Task**: `POST https://api.clickup.com/api/v2/list/{list_id}/task`
* **Payload**:
  ```json
  {
    "name": "Configure Clerk Authentication",
    "description": "Integrate Clerk authentication into the Next.js App Router workspace.",
    "assignees": [8899],
    "status": "To Do",
    "priority": 2,
    "due_date": 1606780800000,
    "start_date": 1606694400000
  }
  ```
  *(Note: Timestamps are in Unix milliseconds)*

* **Create Subtask**: `POST https://api.clickup.com/api/v2/list/{list_id}/task` (Include `"parent": "{parent_task_id}"` inside the JSON payload to mark it as a subtask).

### 3.6 Task Comments & Activity
Used by the Librarian agent to scan activity logs and extract team discussion contexts.

* **Get Task Comments**: `GET https://api.clickup.com/api/v2/task/{task_id}/comment`
* **Add Comment**: `POST https://api.clickup.com/api/v2/task/{task_id}/comment`
* **Payload**:
  ```json
  {
    "comment_text": "Blocker resolved: Whitelisted client IPs on dev gateway.",
    "assignee_id": 8899,
    "notify_all": true
  }
  ```

### 3.7 Custom Fields
Used to get and set metadata tags on specific tasks.

* **Get Accessible Custom Fields**: `GET https://api.clickup.com/api/v2/list/{list_id}/field`
* **Set Custom Field Value**: `POST https://api.clickup.com/api/v2/task/{task_id}/field/{field_id}`
* **Payload**:
  ```json
  {
    "value": "Medium"
  }
  ```

---

## 4. API Limits & Best Practices

* **Rate Limits**:
  * ClickUp enforces a limit of **100 requests per minute** per personal token/auth key.
  * Payloads exceeding limits will receive a `429 Too Many Requests` status. Agents must listen for this and retry with exponential backoff.
* **Date Formats**: ClickUp APIs require Unix epoch timestamps in **milliseconds** (e.g., `Date.now()` in Javascript).
* **Pagination**: Task retrieval endpoints utilize the `page` query parameter (0-indexed) and default to 100 items per page.
