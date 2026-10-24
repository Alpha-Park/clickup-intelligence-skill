---
name: clickup-brain-knowledge
description: ClickUp Brain & Enterprise Knowledge Search Skill — Leverages ClickUp Brain AI patterns to index, search, and synthesize knowledge from tasks, docs, comment threads, and cross-platform integrations into executive standups and blocker analysis.
version: 1.0.0
agent: Librarian
group: knowledge-retrieval-group
license: MIT
---

# ClickUp Brain Knowledge Skill

## Overview
The **ClickUp Brain Knowledge Skill** enables the **Librarian** agent to act as an autonomous organization-wide research assistant and knowledge steward. Mirroring the capabilities of ClickUp Brain (AI Knowledge Manager & AI Writer), this skill aggregates contextual insights across tasks, nested ClickUp Docs, comment threads, and external connected data sources to produce answers, standup digests, and blocker notifications.

---

## Core Capabilities

### 1. Cross-Workspace Knowledge Retrieval
* Query task descriptions, subtasks, and custom field notes across multiple spaces and folders.
* Retrieve rich-text documentation stored in ClickUp Docs and company wikis.
* Resolve semantic ambiguities using contextual search filters (assignee, tag, date modified).

### 2. Comment Thread Blocker Extraction
* Analyze conversations inside active tickets to extract unassigned blockers, technical hurdles, or waiting dependencies.
* Summarize dispute or consensus threads into crisp decision logs.

### 3. Automated Standup & Executive Digest Generation
* Aggregate completed work, in-progress items, and blocked tickets for any given timeframe (e.g. daily standup, weekly sprint review).
* Format updates into clean, scannable Markdown reports formatted for Slack, email, or executive summaries.

### 4. Meeting Notes & Action Item Parsing
* Ingest meeting transcripts or raw bullet points and map them into actionable tasks with assigned owners and due dates.

---

## Agent Usage Instructions

### Input Parameters
```json
{
  "operation": "generate_daily_standup" | "search_knowledge" | "extract_blockers",
  "scope": {
    "space_id": "12345678",
    "timeframe_hours": 24
  },
  "query": "What is our current rollout plan for European GDPR data residency?"
}
```

### Output Response
```json
{
  "summary": "European GDPR data residency rollout is scheduled for Stage 2 (Sprint 33). The primary architecture doc 'EU Data Sovereignty v2' details the Frankfurt AWS cluster setup. One active blocker exists on ticket #86a987 regarding DB encryption keys.",
  "sources": [
    { "type": "doc", "title": "EU Data Sovereignty v2", "url": "https://app.clickup.com/d/doc-981273" },
    { "type": "task", "title": "Generate KMS keys in eu-central-1", "id": "86a987", "status": "Blocked" }
  ],
  "action_items": [
    "Follow up with DevOps lead regarding KMS permission elevation"
  ]
}
```

---

## Safety & Governance
* **Permission Isolation**: Restrict retrieval exclusively to documents and spaces the agent has been granted read permissions for.
* **PII Redaction**: Redact API keys, customer names, credit card numbers, and secret tokens before outputting summaries.
* **Source Attribution**: Always include canonical ClickUp URLs for every referenced fact or decision.
