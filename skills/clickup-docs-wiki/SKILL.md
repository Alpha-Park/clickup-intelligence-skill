---
name: clickup-docs-wiki
description: ClickUp Docs, Wikis & SOP Management Skill — Builds, structures, and synchronizes technical documentation, engineering runbooks, standard operating procedures (SOPs), and nested wiki pages embedded directly in ClickUp.
version: 1.0.0
agent: Scribe
group: technical-writing-group
license: MIT
---

# ClickUp Docs & Wiki Skill

## Overview
The **ClickUp Docs & Wiki Skill** enables the **Scribe** agent to manage company-wide documentation, project wikis, and technical runbooks natively inside ClickUp Docs. The agent creates hierarchical pages, applies standardized documentation templates, keeps architecture runbooks updated from codebase commits, and links documentation bidirectionally to actionable tasks.

---

## Core Capabilities

### 1. Document Creation & Page Hierarchy
* Create top-level ClickUp Docs within designated Spaces or Folders.
* Structure multi-level nested subpages (e.g. `Engineering Wiki` > `Microservices` > `Auth Service Runbook`).
* Embed rich-text formatting, Markdown tables, callout blocks, and code blocks with syntax highlighting.

### 2. Standard Operating Procedure (SOP) Automation
* Generate standardized SOPs from engineering discussion threads and incident post-mortems.
* Enforce review cadence by adding review due dates and tagging document owners.

### 3. Bidirectional Task & Doc Embedding
* Automatically embed links to relevant Docs into ClickUp task descriptions.
* Mention task cards inside Docs to provide live progress widgets for stakeholders viewing documentation.

### 4. Git-to-Docs Knowledge Sync
* Ingest repository Markdown documentation (e.g. `/docs` or `README.md`) and sync updates directly to ClickUp Docs to prevent stale internal wikis.

---

## Agent Usage Instructions

### Input Directive
```json
{
  "action": "create_sop" | "sync_repo_docs" | "update_wiki_page",
  "workspace_id": "12345678",
  "doc_title": "Incident Response Runbook: Database Failover",
  "content_markdown": "# Incident Response Runbook\n\n## 1. Severity Classification\n- P0: Full production outage...",
  "target_space_id": "87654321"
}
```

### Output Report
```json
{
  "status": "published",
  "doc_id": "doc_9918237",
  "url": "https://app.clickup.com/d/doc_9918237",
  "pages_created": 1,
  "embedded_in_tasks": ["86a12bc", "86a12bd"]
}
```

---

## Safety Controls
* **Version Backups**: Store previous document revisions before executing bulk overwrites.
* **Sensitive Data Scrubbing**: Automatically detect and strip hardcoded secrets, staging passwords, and internal infrastructure IP addresses before publishing docs.
