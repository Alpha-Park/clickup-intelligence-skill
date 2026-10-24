---
name: clickup-resource-capacity
description: ClickUp Resource Allocation & Time Tracking Skill — Monitors member workloads, analyzes estimated vs. actual logged time, detects project bottlenecks, and optimizes sprint capacity distribution.
version: 1.0.0
agent: Strategist
group: operations-group
license: MIT
---

# ClickUp Resource & Capacity Skill

## Overview
The **ClickUp Resource & Capacity Skill** equips the **Strategist** agent to manage engineering workload, monitor time tracking data, and optimize team velocity. By analyzing task estimates against logged hours and member capacity thresholds, the agent identifies upcoming burnouts, predicts milestone delays, and recommends optimal task reallocations.

---

## Core Capabilities

### 1. Workload & Capacity Analysis
* Fetch active team member allocations across all lists within a Space.
* Calculate total allocated hours versus standard weekly availability (e.g. 40h/week per engineer).
* Flag overloaded team members and highlight unallocated bandwidth.

### 2. Time Tracking & Variance Auditing
* Query ClickUp Time Tracking API to collect logged time entries by task, list, and team member.
* Calculate estimate-to-actual variance ratios to improve future sprint story point accuracy.
* Identify high-variance tasks indicating architectural friction or scope creep.

### 3. Bottleneck Prediction & Task Rebalancing
* Detect tasks stuck in review or QA stages exceeding standard SLA thresholds (e.g. >48 hours).
* Suggest automated task reassignments based on member expertise and current load.

---

## Agent Usage Instructions

### Input Directive
```json
{
  "operation": "analyze_sprint_workload" | "audit_time_entries" | "rebalance_assignments",
  "team_id": "12345678",
  "space_id": "87654321",
  "sprint_due_date": "2026-11-01"
}
```

### Output Report
```json
{
  "sprint_health": "At Risk",
  "capacity_summary": {
    "total_team_capacity_hours": 160,
    "total_estimated_hours": 185,
    "utilization_percentage": 115.6
  },
  "bottlenecks": [
    {
      "member": "Alice Chen",
      "allocated_hours": 52,
      "capacity_hours": 40,
      "risk": "Overallocated by 12 hours"
    }
  ],
  "recommendations": [
    "Reassign task #86a341 (8h, Low Priority) from Alice Chen to Bob Smith (currently at 24/40h load)."
  ]
}
```

---

## Safety Controls
* **Read-Only Capacity Audits**: Changes to task assignments require confirmation mode when rebalancing more than 3 tasks simultaneously.
* **Privacy Controls**: Maintain confidentiality around individual time tracking metrics; aggregate performance summaries to team-level retrospectives.
