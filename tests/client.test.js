const test = require('node:test');
const assert = require('node:assert/strict');
const ClickUpClient = require('../scripts/clickup_api_helper');

test('ClickUpClient - Initialization', (t) => {
  assert.throws(
    () => new ClickUpClient(),
    /Authorization Token is required/,
    'Should throw error if token is missing'
  );

  const client = new ClickUpClient('pk_test_token_12345');
  assert.equal(client.token, 'pk_test_token_12345');
  assert.equal(client.baseUrl, 'api.clickup.com');
  assert.equal(client.basePath, '/api/v2');
});

test('ClickUpClient - API methods presence', (t) => {
  const client = new ClickUpClient('pk_test_token_12345');

  assert.equal(typeof client.getWorkspaces, 'function');
  assert.equal(typeof client.getSpaces, 'function');
  assert.equal(typeof client.getFolders, 'function');
  assert.equal(typeof client.getListsInFolder, 'function');
  assert.equal(typeof client.getFolderlessLists, 'function');
  assert.equal(typeof client.getTasks, 'function');
  assert.equal(typeof client.createTask, 'function');
  assert.equal(typeof client.createSubtask, 'function');
  assert.equal(typeof client.addComment, 'function');
  assert.equal(typeof client.getComments, 'function');
  assert.equal(typeof client.getCustomFields, 'function');
  assert.equal(typeof client.setCustomField, 'function');
});
