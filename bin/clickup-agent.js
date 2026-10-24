#!/usr/bin/env node
/**
 * ClickUp Agent CLI
 * Unified command-line interface for human developers and autonomous agents.
 * Zero external dependencies.
 */

const { spawn } = require('child_process');
const path = require('path');
const ClickUpClient = require('../scripts/clickup_api_helper');

const VERSION = '1.0.0';
const ROOT_DIR = path.resolve(__dirname, '..');

const HELP_TEXT = `
ClickUp Agent CLI (v${VERSION})
Unified toolkit for ClickUp intelligence, sprint orchestration, and MCP server.

USAGE:
  clickup-agent <command> [options]

COMMANDS:
  test-connection    Validate CLICKUP_API_TOKEN and test workspace access
  mcp                Launch the Model Context Protocol (MCP) stdio server
  standup            Generate a daily workspace standup report
  sprint             Run the sprint task & subtask decomposition engine
  webhook [port]     Start the real-time webhook ingress server (default: 3000)
  version, -v        Display CLI version
  help, -h           Show this help message

ENVIRONMENT VARIABLES:
  CLICKUP_API_TOKEN        ClickUp Personal Token or OAuth Token (required for API calls)
  CLICKUP_WEBHOOK_SECRET   Secret key used to verify incoming webhook signatures
  WEBHOOK_PORT             Port for webhook listener (default: 3000)

EXAMPLES:
  $ clickup-agent test-connection
  $ clickup-agent mcp
  $ clickup-agent standup
  $ clickup-agent webhook 8080
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command.toLowerCase()) {
    case 'help':
    case '--help':
    case '-h':
      console.log(HELP_TEXT);
      break;

    case 'version':
    case '--version':
    case '-v':
      console.log(`clickup-agent v${VERSION}`);
      break;

    case 'test-connection':
      await runTestConnection();
      break;

    case 'mcp':
      runChildScript(path.join(ROOT_DIR, 'mcp', 'clickup_mcp_server.js'));
      break;

    case 'standup':
      runChildScript(path.join(ROOT_DIR, 'scripts', 'example_knowledge_search.js'));
      break;

    case 'sprint':
      runChildScript(path.join(ROOT_DIR, 'scripts', 'example_task_sprint_orchestration.js'));
      break;

    case 'webhook':
      if (args[1]) {
        process.env.WEBHOOK_PORT = args[1];
      }
      runChildScript(path.join(ROOT_DIR, 'scripts', 'example_webhook_listener.js'));
      break;

    default:
      console.error(`[-] Unknown command: "${command}"`);
      console.log(HELP_TEXT);
      process.exit(1);
  }
}

async function runTestConnection() {
  const token = process.env.CLICKUP_API_TOKEN;
  console.log('--- Testing ClickUp API Connection ---');

  if (!token) {
    console.error('[-] Error: CLICKUP_API_TOKEN is not defined in environment variables.');
    console.log('    To set token in PowerShell: $env:CLICKUP_API_TOKEN = "pk_your_token"');
    console.log('    To set token in bash:       export CLICKUP_API_TOKEN="pk_your_token"');
    process.exit(1);
  }

  try {
    const client = new ClickUpClient(token);
    console.log('[+] Contacting https://api.clickup.com/api/v2/team...');
    const result = await client.getWorkspaces();

    if (!result.teams || result.teams.length === 0) {
      console.warn('[!] Connection succeeded, but no accessible workspaces were found.');
      return;
    }

    console.log('[✓] Successfully connected to ClickUp API!');
    console.log(`[+] Found ${result.teams.length} accessible workspace(s):`);
    result.teams.forEach(team => {
      console.log(`    • ${team.name} (ID: ${team.id}) - Members: ${team.members.length}`);
    });
  } catch (err) {
    console.error(`[-] Connection failed: ${err.message}`);
    process.exit(1);
  }
}

function runChildScript(scriptPath) {
  const child = spawn(process.execPath, [scriptPath], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[-] Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { main };
