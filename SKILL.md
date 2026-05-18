---
name: clickup-intelligence
description: ClickUp Intelligence Skill — Empowers autonomous agents to manage enterprise projects, automate sprint workflows, and query centralized organizational knowledge bases using ClickUp APIs and Brain capabilities.
version: 1.0.0
agents:
  - Coordinator (PM Agent)
  - Librarian (Knowledge Agent)
groups:
  - pm-operations-group
  - knowledge-retrieval-group
license: MIT
---

# ClickUp Intelligence Skill

## Overview
The ClickUp Intelligence Skill bridges the gap between agentic reasoning and enterprise workflow execution. It allows autonomous GenPark agents to act as expert project managers and knowledge stewards. By leveraging ClickUp's highly structured workspace hierarchy and API endpoints, agents can automate administrative operations, orchestrate complex software development lifecycles, and extract contextually relevant information from corporate knowledge repositories.

This skill is divided into two major agent profiles:
1. **ClickUp Project Manager (`clickup-pm-automation`)**: Handled by the **Coordinator** agent, managing tasks, dependencies, subtask breakdowns, and custom fields to keep project boards accurate and active.
2. **ClickUp Knowledge Librarian (`clickup-brain-integration`)**: Handled by the **Librarian** agent, searching workspace documents, summarizing task activity/comments, generating standup reports, and retrieving information from connected apps.

---

## Capabilities

### 1. ClickUp Project Manager (`clickup-pm-automation`)
* **Dynamic Hierarchy Navigation**: Retrieve and traverse authorized Workspaces (Teams), Spaces, Folders, and Lists to establish where actions should occur.
* **Intelligent Task & Subtask Lifecycle**: Create, update, transition, and archive tasks using standardized statuses and assignees. Automatically generate logical subtasks and checklist items from high-level objectives.
* **Custom Field & Metadata Mapping**: Read and write structured custom fields (e.g., story points, billing codes, external links, impact scoring) to enforce organizational data standards.
* **View & Backlog Organization**: Query list and board views, prioritize task backlogs, assign workload based on capacity, and link tasks to establish structural dependencies.

### 2. ClickUp Knowledge Librarian (`clickup-brain-integration`)
* **Workspace Knowledge Search**: Search for and retrieve text content from ClickUp Docs, wiki pages, and task descriptions based on natural language queries.
* **Activity & Comment Synthesis**: Scan task transaction logs and comment threads to extract decision-making history, highlight unresolved blockers, and summarize current status.
* **Automated Reporting & Standups**: Collect daily updates and task events to compile structured standup summaries, progress reports, and executive updates.
* **Multi-Tool Context Merging**: Connect Slack channels, Google Docs, and GitHub commits referenced in ClickUp tasks into a single semantic context block.

---

## Usage Instructions

### Coordinator Agent (Project Manager)
To execute PM actions, provide: `action` (e.g., `create_task`, `update_status`, `generate_subtasks`), `target_list_id`, and `task_details` (title, description, custom fields).
* **Sample Input**:
  ```json
  {
    "action": "generate_subtasks",
    "parent_task_id": "864u1xyz",
    "description": "Implement authentication screen using Clerk and Next.js"
  }
  ```
* **Sample Output**:
  ```json
  {
    "status": "success",
    "created_subtasks": [
      { "id": "864u1abc", "name": "Set up Clerk environment variables and provider" },
      { "id": "864u1def", "name": "Create SignUp and SignIn component layouts" },
      { "id": "864u1ghi", "name": "Write middleware matcher rules for protected routes" }
    ]
  }
  ```

### Librarian Agent (Knowledge Management)
To query workspace information, provide: `query_type` (e.g., `search_docs`, `summarize_comments`, `generate_daily_standup`), and parameters like `workspace_id` or `task_id`.
* **Sample Input**:
  ```json
  {
    "query_type": "summarize_comments",
    "task_id": "864u1xyz",
    "focus": "unresolved_blockers"
  }
  ```
* **Sample Output**:
  ```json
  {
    "task_id": "864u1xyz",
    "summary": "Development is currently blocked by API rate-limiting on the staging gateway. The frontend team is waiting for the backend team (assigned to @JohnDoe) to whitelist the client IP. No updates have been posted for 14 hours.",
    "blocker_identified": true,
    "blocker_owner": "JohnDoe"
  }
  ```

---

## Safety & Governance Controls
* **Data Scoping & Sandboxing**: Restrict agent access to specific Spaces and Folders defined in the agent's initialization configuration. Avoid workspace-wide operations unless explicitly authorized.
* **PII & Credential Scrubbing**: Automatically sanitize task descriptions and comment drafts to remove passwords, API keys, or personal customer data before submitting to public endpoints.
* **Audit Trail Logs**: Write all agent-created actions (such as creating tasks or changing statuses) with a clear agent signature (e.g., `[GenPark Coordinator AI]: Completed task allocation`) to maintain clear human audit trails.
* **Rate-Limit Management**: Gracefully handle ClickUp API's rate limits (100 requests per minute per token) using queueing and exponential backoff.

---

## Real-World Examples

### 1. Backlog Grooming & Allocation
> **User Prompt**: "Check our 'Mobile App' list, find any tasks in 'Needs Triage' status, assign them to @DevLead, set custom field 'Complexity' to Medium, and add a checklist item to write unit tests."
> **Coordinator Action**: Fetches the list, filters tasks with the matching status, updates each task with the assignee and custom field value, and appends the checklist item via API calls.

### 2. Standup Summarization
> **User Prompt**: "Summarize what was completed yesterday in our Marketing Space, and list any tickets that are currently marked high priority and have had no activity for 3 days."
> **Librarian Action**: Queries tasks updated within the last 24 hours, aggregates status changes, queries unresolved high-priority tasks, and compiles a clean markdown report for the team.

---

## Ownership
* **clickup-pm-automation** is owned by the **Coordinator** agent (PM Operations Group).
* **clickup-brain-integration** is owned by the **Librarian** agent (Knowledge Retrieval Group).
