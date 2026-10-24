const test = require('node:test');
const assert = require('node:assert/strict');
const ClickUpMcpServer = require('../mcp/clickup_mcp_server');

test('ClickUpMcpServer - Initialization & Tools List', async (t) => {
  const server = new ClickUpMcpServer();

  let captured = null;
  server.sendResponse = (id, result) => {
    captured = { id, result };
  };

  // 1. Initialize
  await server.handleMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-suite', version: '1.0' }
    }
  });

  assert.equal(captured.id, 1);
  assert.equal(captured.result.serverInfo.name, 'clickup-mcp-server');
  assert.equal(captured.result.protocolVersion, '2024-11-05');

  // 2. Tools list
  await server.handleMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });

  assert.equal(captured.id, 2);
  const tools = captured.result.tools;
  assert.equal(Array.isArray(tools), true);
  assert.equal(tools.length, 10);

  const toolNames = tools.map(tool => tool.name);
  assert.ok(toolNames.includes('clickup_get_workspaces'));
  assert.ok(toolNames.includes('clickup_get_spaces'));
  assert.ok(toolNames.includes('clickup_get_lists'));
  assert.ok(toolNames.includes('clickup_get_tasks'));
  assert.ok(toolNames.includes('clickup_create_task'));
  assert.ok(toolNames.includes('clickup_create_subtask'));
  assert.ok(toolNames.includes('clickup_add_comment'));
  assert.ok(toolNames.includes('clickup_get_comments'));
  assert.ok(toolNames.includes('clickup_set_custom_field'));

  // 3. Ping
  await server.handleMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'ping'
  });
  assert.equal(captured.id, 3);
});

test('ClickUpMcpServer - Graceful Error on Missing Token', async (t) => {
  // Ensure token is empty
  const oldToken = process.env.CLICKUP_API_TOKEN;
  delete process.env.CLICKUP_API_TOKEN;

  const server = new ClickUpMcpServer();
  let captured = null;
  server.sendResponse = (id, result) => {
    captured = { id, result };
  };

  await server.handleToolCall(4, {
    name: 'clickup_get_workspaces',
    arguments: {}
  });

  assert.equal(captured.id, 4);
  assert.equal(captured.result.isError, true);
  assert.match(captured.result.content[0].text, /CLICKUP_API_TOKEN environment variable is not configured/);

  // Restore token
  if (oldToken) process.env.CLICKUP_API_TOKEN = oldToken;
});
