/**
 * Example: Sprint Task Orchestration & Subtask Decomposition
 * Demonstrates how the Coordinator agent automates sprint planning and task breakdowns.
 */

const ClickUpClient = require('./clickup_api_helper');

async function main() {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    console.log('[-] CLICKUP_API_TOKEN environment variable not set.');
    console.log('    Run: $env:CLICKUP_API_TOKEN = "pk_your_token"');
    console.log('\n[Demo Mode] Displaying planned task decomposition:\n');
    simulateDecomposition();
    return;
  }

  const client = new ClickUpClient(token);

  console.log('[+] Connecting to ClickUp API...');
  const { teams } = await client.getWorkspaces();
  if (!teams || teams.length === 0) {
    console.log('[-] No authorized workspaces found.');
    return;
  }

  const teamId = teams[0].id;
  console.log(`[+] Authorized Workspace: "${teams[0].name}" (ID: ${teamId})`);

  const { spaces } = await client.getSpaces(teamId);
  if (!spaces || spaces.length === 0) {
    console.log('[-] No spaces found in this workspace.');
    return;
  }

  const targetSpace = spaces[0];
  console.log(`[+] Using Space: "${targetSpace.name}" (ID: ${targetSpace.id})`);

  // Locate first available list
  const folderless = await client.getFolderlessLists(targetSpace.id);
  let targetList = folderless.lists && folderless.lists[0];

  if (!targetList) {
    const { folders } = await client.getFolders(targetSpace.id);
    if (folders && folders.length > 0) {
      const folderLists = await client.getListsInFolder(folders[0].id);
      targetList = folderLists.lists && folderLists.lists[0];
    }
  }

  if (!targetList) {
    console.log('[-] No list found to attach tasks. Please create a list in ClickUp first.');
    return;
  }

  console.log(`[+] Selected Target List: "${targetList.name}" (ID: ${targetList.id})`);

  // Create Parent Story
  console.log('[+] Creating Epic Task: "Implement Zero-Trust API Gateway Auth"...');
  const parentTask = await client.createTask(targetList.id, {
    name: 'Implement Zero-Trust API Gateway Auth',
    description: '[Coordinator AI]: Implement mutual TLS and JWT token verification at the API Gateway level.',
    priority: 2, // High
    tags: ['security', 'auth', 'sprint-33']
  });

  console.log(`[✓] Parent Task Created! ID: ${parentTask.id} | URL: ${parentTask.url}`);

  // Create Subtasks
  const subtasks = [
    'Define OpenAPI v3 security scheme for Bearer JWT',
    'Deploy Envoy proxy mTLS filter configuration',
    'Write unit and integration tests for expired token rejection',
    'Update API security documentation in ClickUp Docs'
  ];

  for (const subName of subtasks) {
    console.log(`  --> Generating Subtask: "${subName}"...`);
    const sub = await client.createSubtask(targetList.id, parentTask.id, {
      name: subName,
      priority: 3
    });
    console.log(`      [✓] Subtask ID: ${sub.id}`);
  }

  console.log('\n[✓] Sprint Orchestration and Subtask Decomposition Completed Successfully.');
}

function simulateDecomposition() {
  const epic = 'Migrate Redis Cluster to AWS ElastiCache';
  const subtasks = [
    { title: 'Provision VPC peering between EKS and ElastiCache subnet', priority: 'High', points: 3 },
    { title: 'Configure Redis AUTH and TLS encryption in transit', priority: 'High', points: 2 },
    { title: 'Deploy dual-cache write layer to sync session data', priority: 'Urgent', points: 5 },
    { title: 'Execute read traffic switch and monitor cache hit ratio', priority: 'High', points: 3 }
  ];

  console.log(`Epic: "${epic}"`);
  console.log('Proposed Subtasks Breakdown:');
  subtasks.forEach((t, i) => {
    console.log(`  ${i + 1}. [${t.priority}] ${t.title} (${t.points} pts)`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}
