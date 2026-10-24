---
name: clickup-pm-sprint
description: Automated Agile & Sprint Project Management Skill — Handles sprint lifecycle, task estimation, subtask decomposition, status state machines, and backlog triage across ClickUp Spaces, Folders, and Lists.
version: 1.0.0
agent: Coordinator
group: pm-operations-group
license: MIT
---

# ClickUp PM & Sprint Automation Skill

## Overview
The **ClickUp PM & Sprint Automation Skill** empowers the **Coordinator** agent to function as an autonomous technical project manager and Scrum master. The agent interacts directly with ClickUp's hierarchical structures (Spaces, Folders, Sprint Lists, and Tasks) to organize backlogs, plan sprints, break epics into granular subtasks, estimate story points, and enforce workflow status transitions.

---

## Core Capabilities

### 1. Hierarchy Exploration & Context Scoping
* Introspect available Workspaces, Spaces, and Folders to locate relevant sprint boards.
* Dynamically resolve custom statuses (`To Do`, `In Progress`, `Code Review`, `QA Ready`, `Done`) mapped to specific team spaces.

### 2. Autonomous Task Decomposition
* Convert high-level engineering user stories or customer requests into actionable tasks.
* Automatically generate nested subtasks with acceptance criteria and checklist items.
* Assign tasks based on member skill tags and current sprint allocations.

### 3. Sprint Planning & Backlog Grooming
* Calculate sprint velocity based on historical completion rates.
* Triage unassigned, blocked, or stale tasks lingering in backlog lists.
* Adjust due dates, priority tiers (Urgent = 1, High = 2, Normal = 3, Low = 4), and sprint milestones.

### 4. Custom Field Management
* Populate and validate custom field metadata such as Story Points, Bug Severity, Feature Categories, and Release Versions.

---

## Agent Usage Instructions

### Input Parameters
When activating this skill, provide a structured directive:
```json
{
  "action": "plan_sprint" | "decompose_epic" | "triage_backlog" | "update_task_status",
  "list_id": "90120012345",
  "payload": {
    "title": "Migrate Database to PostgreSQL 16",
    "description": "Perform non-breaking migration with zero downtime using logical replication.",
    "priority": 2,
    "points": 8
  }
}
```

### Output Response
The agent executes the required API calls and returns an execution report:
```json
{
  "status": "success",
  "parent_task": {
    "id": "86a12bc",
    "name": "Migrate Database to PostgreSQL 16",
    "url": "https://app.clickup.com/t/86a12bc"
  },
  "created_subtasks": [
    { "id": "86a12bd", "name": "Set up Postgres 16 replica and verify CDC stream" },
    { "id": "86a12be", "name": "Deploy dual-write database adapter in staging" },
    { "id": "86a12bf", "name": "Run load testing and verify replication latency" },
    { "id": "86a12bg", "name": "Execute cutover DNS switch and verify error logs" }
  ],
  "assigned_sprint": "Sprint 32"
}
```

---

## Safety Controls & Verification

* **Status Verification**: Ensure tasks are only transitioned to valid statuses defined in the parent list.
* **Assignee Existence Checks**: Verify user IDs against workspace members prior to assignment to avoid silent assignment failures.
* **Non-Destructive Operations**: Archive instead of hard-deleting tasks; preserve task comment history.
* **Audit Footprint**: Automatically prepend `[Coordinator PM Agent]` signature to all auto-generated tasks and subtasks.
