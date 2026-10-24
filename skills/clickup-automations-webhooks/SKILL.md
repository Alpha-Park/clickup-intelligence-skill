---
name: clickup-automations-webhooks
description: Event-Driven Automations & Webhooks Skill — Listens to real-time ClickUp webhook events (task creation, status change, comments), runs trigger rules, and synchronizes state bi-directionally with GitHub, Slack, and external services.
version: 1.0.0
agent: Sentinel
group: integrations-group
license: MIT
---

# ClickUp Automations & Webhooks Skill

## Overview
The **ClickUp Automations & Webhooks Skill** equips the **Sentinel** agent with real-time, event-driven reactive capabilities. Rather than polling ClickUp APIs, the agent manages webhooks, validates incoming event signatures, routes task events (such as `taskCreated`, `taskStatusUpdated`, `taskPriorityUpdated`, and `taskCommentPosted`), and triggers automated downstream pipelines—including bi-directional GitHub PR linking and instant Slack alerts.

---

## Core Capabilities

### 1. Webhook Lifecycle Management
* Programmatically register, list, and delete webhooks on specific Workspaces (Teams), Spaces, Folders, or Lists.
* Validate webhook payloads using HMAC SHA-256 signatures to ensure authenticity.

### 2. Event-Driven Workflow Automation
* Intercept `taskStatusUpdated` events: When a task moves to `Code Review`, automatically verify pull request linkage and trigger CI/CD checks.
* Intercept `taskPriorityUpdated` events: When priority escalates to `Urgent` (1), broadcast an immediate incident alert to Slack/Teams on-call channels.
* Intercept `taskCreated` events: Automatically validate required custom fields (e.g. `Release Milestone`), auto-tagging or requesting clarification if missing.

### 3. Bi-Directional GitHub Synchronization
* Parse task IDs (e.g. `CU-86a12bc`) from Git branch names and PR titles.
* Update ClickUp task statuses automatically when a GitHub PR is opened, approved, or merged.

---

## Webhook Registration Example

```http
POST https://api.clickup.com/api/v2/team/{team_id}/webhook
Authorization: {token}
Content-Type: application/json

{
  "endpoint": "https://api.yourdomain.com/webhooks/clickup",
  "events": [
    "taskCreated",
    "taskUpdated",
    "taskStatusUpdated",
    "taskPriorityUpdated",
    "taskCommentPosted"
  ]
}
```

---

## Agent Usage Instructions

### Incoming Webhook Event Processing
```json
{
  "event": "taskStatusUpdated",
  "task_id": "86a12bc",
  "history_items": [
    {
      "field": "status",
      "before": { "status": "In Progress" },
      "after": { "status": "Code Review" }
    }
  ]
}
```

### Automated Handler Execution
The Sentinel agent checks linked repositories, verifies PR status, leaves a confirmation comment on the ClickUp ticket, and notifies reviewers.

---

## Safety & Security Protocols
* **Signature Verification**: Reject any webhook payload whose signature header does not match the shared webhook secret.
* **Idempotency**: Maintain an in-memory or Redis event deduplication cache (`event_id` or timestamp hash) to prevent duplicate processing from network retries.
* **Rate-Limit Throttling**: Throttle outbound actions triggered by high-volume batch imports.
