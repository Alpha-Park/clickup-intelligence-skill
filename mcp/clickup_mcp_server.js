#!/usr/bin/env node
/**
 * ClickUp Model Context Protocol (MCP) Server
 * Standard JSON-RPC 2.0 stdio server implementation adhering to the Model Context Protocol (MCP) spec.
 * Provides autonomous AI agents with direct, interactive tool invocation for ClickUp API v2.
 * Zero external dependencies.
 */

const readline = require('readline');
const ClickUpClient = require('../scripts/clickup_api_helper');

const SERVER_NAME = 'clickup-mcp-server';
const SERVER_VERSION = '1.0.0';
const PROTOCOL_VERSION = '2024-11-05';

// Define available ClickUp MCP tools
const TOOLS = [
  {
    name: 'clickup_get_workspaces',
    description: 'Retrieve all authorized ClickUp Workspaces (Teams) accessible to the authenticated token.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'clickup_get_spaces',
    description: 'Retrieve all Spaces inside a specific Workspace (Team).',
    inputSchema: {
      type: 'object',
      properties: {
        team_id: { type: 'string', description: 'The Workspace (Team) ID' }
      },
      required: ['team_id']
    }
  },
  {
    name: 'clickup_get_folders',
    description: 'Retrieve all Folders inside a specific Space.',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'The Space ID' }
      },
      required: ['space_id']
    }
  },
  {
    name: 'clickup_get_lists',
    description: 'Retrieve all Lists inside a Folder or folderless Lists inside a Space.',
    inputSchema: {
      type: 'object',
      properties: {
        folder_id: { type: 'string', description: 'The Folder ID (if querying folder lists)' },
        space_id: { type: 'string', description: 'The Space ID (if querying folderless lists)' }
      }
    }
  },
  {
    name: 'clickup_get_tasks',
    description: 'Retrieve tasks in a specific List with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        list_id: { type: 'string', description: 'The List ID' },
        archived: { type: 'boolean', description: 'Whether to include archived tasks' },
        subtasks: { type: 'boolean', description: 'Whether to include subtasks' }
      },
      required: ['list_id']
    }
  },
  {
    name: 'clickup_create_task',
    description: 'Create a new task in a specified List.',
    inputSchema: {
      type: 'object',
      properties: {
        list_id: { type: 'string', description: 'The target List ID' },
        name: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Detailed Markdown task description' },
        priority: { type: 'number', description: '1 (Urgent), 2 (High), 3 (Normal), 4 (Low)' },
        status: { type: 'string', description: 'Target status name' }
      },
      required: ['list_id', 'name']
    }
  },
  {
    name: 'clickup_create_subtask',
    description: 'Create a granular subtask under an existing parent task.',
    inputSchema: {
      type: 'object',
      properties: {
        list_id: { type: 'string', description: 'The parent List ID' },
        parent_task_id: { type: 'string', description: 'The ID of the parent task' },
        name: { type: 'string', description: 'Subtask title' },
        description: { type: 'string', description: 'Subtask description' },
        priority: { type: 'number', description: '1 (Urgent), 2 (High), 3 (Normal), 4 (Low)' }
      },
      required: ['list_id', 'parent_task_id', 'name']
    }
  },
  {
    name: 'clickup_add_comment',
    description: 'Post a comment or blocker resolution note on a task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'The Task ID' },
        comment_text: { type: 'string', description: 'Comment body text' },
        notify_all: { type: 'boolean', description: 'Notify all task watchers' }
      },
      required: ['task_id', 'comment_text']
    }
  },
  {
    name: 'clickup_get_comments',
    description: 'Retrieve comment history and conversation threads for a task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'The Task ID' }
      },
      required: ['task_id']
    }
  },
  {
    name: 'clickup_set_custom_field',
    description: 'Set custom field values (e.g. Story Points, Bug Category) on a task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'The Task ID' },
        field_id: { type: 'string', description: 'The UUID of the Custom Field' },
        value: { description: 'The value to assign (string, number, or array)' }
      },
      required: ['task_id', 'field_id', 'value']
    }
  }
];

class ClickUpMcpServer {
  constructor() {
    this.token = process.env.CLICKUP_API_TOKEN;
    this.client = this.token ? new ClickUpClient(this.token) : null;
    this.rl = null;
  }

  start() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch (err) {
        this.sendError(null, -32700, 'Parse error', err.message);
      }
    });

    process.stderr.write(`[${SERVER_NAME}] MCP Server started on stdio\n`);
  }

  close() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id: id,
      result: result
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  sendError(id, code, message, data = null) {
    const response = {
      jsonrpc: '2.0',
      id: id,
      error: {
        code: code,
        message: message,
        data: data
      }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  async handleMessage(message) {
    const { id, method, params } = message;

    // Notifications (no id)
    if (id === undefined || id === null) {
      if (method === 'notifications/initialized') {
        process.stderr.write(`[${SERVER_NAME}] Client confirmed initialization.\n`);
      }
      return;
    }

    switch (method) {
      case 'initialize':
        this.sendResponse(id, {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION
          },
          capabilities: {
            tools: {}
          }
        });
        break;

      case 'tools/list':
        this.sendResponse(id, {
          tools: TOOLS
        });
        break;

      case 'tools/call':
        await this.handleToolCall(id, params);
        break;

      case 'ping':
        this.sendResponse(id, {});
        break;

      default:
        this.sendError(id, -32601, 'Method not found', `Method '${method}' is not supported.`);
        break;
    }
  }

  async handleToolCall(id, params) {
    const { name, arguments: args } = params || {};

    if (!this.client) {
      this.sendResponse(id, {
        content: [
          {
            type: 'text',
            text: 'Error: CLICKUP_API_TOKEN environment variable is not configured. Please set the token to execute ClickUp API actions.'
          }
        ],
        isError: true
      });
      return;
    }

    try {
      let data;
      switch (name) {
        case 'clickup_get_workspaces':
          data = await this.client.getWorkspaces();
          break;

        case 'clickup_get_spaces':
          data = await this.client.getSpaces(args.team_id);
          break;

        case 'clickup_get_folders':
          data = await this.client.getFolders(args.space_id);
          break;

        case 'clickup_get_lists':
          if (args.folder_id) {
            data = await this.client.getListsInFolder(args.folder_id);
          } else if (args.space_id) {
            data = await this.client.getFolderlessLists(args.space_id);
          } else {
            throw new Error('Either folder_id or space_id must be provided.');
          }
          break;

        case 'clickup_get_tasks':
          data = await this.client.getTasks(args.list_id, {
            archived: args.archived || false,
            subtasks: args.subtasks || true
          });
          break;

        case 'clickup_create_task':
          data = await this.client.createTask(args.list_id, {
            name: args.name,
            description: args.description || '',
            priority: args.priority,
            status: args.status
          });
          break;

        case 'clickup_create_subtask':
          data = await this.client.createSubtask(args.list_id, args.parent_task_id, {
            name: args.name,
            description: args.description || '',
            priority: args.priority
          });
          break;

        case 'clickup_add_comment':
          data = await this.client.addComment(args.task_id, args.comment_text, args.notify_all !== false);
          break;

        case 'clickup_get_comments':
          data = await this.client.getComments(args.task_id);
          break;

        case 'clickup_set_custom_field':
          data = await this.client.setCustomField(args.task_id, args.field_id, args.value);
          break;

        default:
          this.sendError(id, -32601, 'Tool not found', `Tool '${name}' is not recognized.`);
          return;
      }

      this.sendResponse(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      });
    } catch (err) {
      this.sendResponse(id, {
        content: [
          {
            type: 'text',
            text: `ClickUp API Execution Error: ${err.message}`
          }
        ],
        isError: true
      });
    }
  }
}

if (require.main === module) {
  const server = new ClickUpMcpServer();
  server.start();
}

module.exports = ClickUpMcpServer;
