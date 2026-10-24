# ClickUp Webhooks Engineering Guide

This guide provides end-to-end specifications for registering, handling, and verifying real-time webhooks using ClickUp API v2.

---

## 1. Webhook Architecture

ClickUp webhooks push real-time JSON payloads to your HTTPS endpoint when specific events occur in your Workspace, Space, Folder, or List.

```
ClickUp Event (e.g. Task Created)
         │
         ▼
ClickUp Webhook Dispatcher
         │  (HTTPS POST + HMAC-SHA256 Signature)
         ▼
Your Webhook Ingress Server
         │
   [Verify Signature]
         │
   [Deduplicate Event]
         │
         ▼
GenPark Agent Trigger (Sentinel / Coordinator)
```

---

## 2. Supported Events

| Event Name | Trigger Condition |
|---|---|
| `taskCreated` | A new task or subtask is created |
| `taskUpdated` | Any task attribute (name, description, etc.) is updated |
| `taskDeleted` | A task is deleted |
| `taskPriorityUpdated` | Task priority level changed |
| `taskStatusUpdated` | Task moved to a new workflow status |
| `taskAssigneeUpdated` | Assignees added or removed |
| `taskDueDateUpdated` | Due date or start date modified |
| `taskTagUpdated` | Tags added or removed |
| `taskMoved` | Task moved to a different List |
| `taskCommentPosted` | A new comment is left on a task |
| `taskCommentUpdated` | An existing comment is edited |
| `taskTimeEstimateUpdated` | Estimated time changed |
| `taskTimeTrackedUpdated` | Time logged on a task |
| `listCreated` | New list created |
| `folderCreated` | New folder created |
| `spaceCreated` | New space created |

---

## 3. Webhook Registration API

### Register Webhook on Workspace (Team)
```http
POST https://api.clickup.com/api/v2/team/{team_id}/webhook
Authorization: {personal_or_oauth_token}
Content-Type: application/json

{
  "endpoint": "https://agent.yourdomain.com/webhooks/clickup",
  "events": [
    "taskCreated",
    "taskStatusUpdated",
    "taskPriorityUpdated",
    "taskCommentPosted"
  ]
}
```

### Response Example
```json
{
  "id": "4b92b678-8314-4112-9844-323b6329e46a",
  "webhook": {
    "id": "4b92b678-8314-4112-9844-323b6329e46a",
    "userid": 8899,
    "team_id": 1234567,
    "endpoint": "https://agent.yourdomain.com/webhooks/clickup",
    "client_id": "YOUR_CLIENT_ID",
    "events": [
      "taskCreated",
      "taskStatusUpdated",
      "taskPriorityUpdated",
      "taskCommentPosted"
    ],
    "task_id": null,
    "list_id": null,
    "folder_id": null,
    "space_id": null,
    "health": {
      "status": "active",
      "fail_count": 0
    },
    "secret": "W12A34B56C78D90E..."
  }
}
```
> [!IMPORTANT]
> Save the `secret` value immediately upon creation. It is required to verify the HMAC-SHA256 signature of incoming webhooks.

---

## 4. Webhook Payload Structure

When an event triggers, ClickUp posts a payload structured as follows:

```json
{
  "event": "taskStatusUpdated",
  "history_items": [
    {
      "id": "hist_12984712",
      "type": 1,
      "date": "1730000000000",
      "field": "status",
      "parent_id": "86a12bc",
      "data": {
        "status_type": "open"
      },
      "source": null,
      "user": {
        "id": 8899,
        "username": "krispang",
        "email": "krispang1020@gmail.com",
        "color": "#7b68ee",
        "initials": "KP",
        "profilePicture": null
      },
      "before": {
        "status": "In Progress",
        "color": "#f9d900",
        "orderindex": 1,
        "type": "custom"
      },
      "after": {
        "status": "Code Review",
        "color": "#6bc950",
        "orderindex": 2,
        "type": "custom"
      }
    }
  ],
  "task_id": "86a12bc",
  "webhook_id": "4b92b678-8314-4112-9844-323b6329e46a"
}
```

---

## 5. Security & Signature Verification

ClickUp sends the SHA-256 signature in the `X-Signature` HTTP header.

### Node.js Verification Example
```javascript
const crypto = require('crypto');

function verifyClickUpSignature(rawBody, signatureHeader, webhookSecret) {
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'utf8'),
    Buffer.from(signatureHeader, 'utf8')
  );
}
```
