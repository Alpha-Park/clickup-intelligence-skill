/**
 * ClickUp API v2 Helper Client
 * Standalone utility wrapping ClickUp API endpoints using only native Node.js standard library modules.
 * Resolves dependencies with 0 external packages.
 */

const https = require('https');

class ClickUpClient {
  /**
   * @param {string} token - ClickUp Personal API Token or OAuth Token
   */
  constructor(token) {
    if (!token) {
      throw new Error('ClickUp Authorization Token is required.');
    }
    this.token = token;
    this.baseUrl = 'api.clickup.com';
    this.basePath = '/api/v2';
  }

  /**
   * Helper method to make HTTPS requests to the ClickUp API
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} path - API endpoint path
   * @param {object} [data] - JSON body content
   * @returns {Promise<any>}
   */
  _request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const payload = data ? JSON.stringify(data) : '';
      
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `${this.basePath}${path}`,
        method: method,
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          // Check for rate limits (429)
          if (res.statusCode === 429) {
            reject(new Error('ClickUp API Rate Limit Exceeded (429). Please back off and retry.'));
            return;
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`ClickUp API Request failed with status ${res.statusCode}: ${body}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(payload);
      }
      req.end();
    });
  }

  /**
   * Get authorized workspaces (teams)
   * @returns {Promise<object>}
   */
  getWorkspaces() {
    return this._request('GET', '/team');
  }

  /**
   * Get spaces in a workspace
   * @param {string} teamId - Workspace (Team) ID
   * @returns {Promise<object>}
   */
  getSpaces(teamId) {
    return this._request('GET', `/team/${teamId}/space`);
  }

  /**
   * Get folders in a space
   * @param {string} spaceId
   * @returns {Promise<object>}
   */
  getFolders(spaceId) {
    return this._request('GET', `/space/${spaceId}/folder`);
  }

  /**
   * Get lists in a folder
   * @param {string} folderId
   * @returns {Promise<object>}
   */
  getListsInFolder(folderId) {
    return this._request('GET', `/folder/${folderId}/list`);
  }

  /**
   * Get folderless lists in a space
   * @param {string} spaceId
   * @returns {Promise<object>}
   */
  getFolderlessLists(spaceId) {
    return this._request('GET', `/space/${spaceId}/list`);
  }

  /**
   * Get tasks in a list
   * @param {string} listId
   * @param {object} [queryParams] - Filter options (e.g. { archived: false })
   * @returns {Promise<object>}
   */
  getTasks(listId, queryParams = {}) {
    const qs = Object.keys(queryParams)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
      .join('&');
    const path = `/list/${listId}/task` + (qs ? `?${qs}` : '');
    return this._request('GET', path);
  }

  /**
   * Create a new task in a list
   * @param {string} listId
   * @param {object} taskData - Fields like name, description, status, priority, etc.
   * @returns {Promise<object>}
   */
  createTask(listId, taskData) {
    return this._request('POST', `/list/${listId}/task`, taskData);
  }

  /**
   * Create a subtask under a parent task
   * @param {string} listId
   * @param {string} parentTaskId
   * @param {object} subtaskData
   * @returns {Promise<object>}
   */
  createSubtask(listId, parentTaskId, subtaskData) {
    const payload = {
      ...subtaskData,
      parent: parentTaskId
    };
    return this._request('POST', `/list/${listId}/task`, payload);
  }

  /**
   * Add a comment to a task
   * @param {string} taskId
   * @param {string} commentText
   * @param {boolean} [notifyAll=true]
   * @returns {Promise<object>}
   */
  addComment(taskId, commentText, notifyAll = true) {
    return this._request('POST', `/task/${taskId}/comment`, {
      comment_text: commentText,
      notify_all: notifyAll
    });
  }

  /**
   * Retrieve comments for a task
   * @param {string} taskId
   * @returns {Promise<object>}
   */
  getComments(taskId) {
    return this._request('GET', `/task/${taskId}/comment`);
  }

  /**
   * Get custom fields in a list
   * @param {string} listId
   * @returns {Promise<object>}
   */
  getCustomFields(listId) {
    return this._request('GET', `/list/${listId}/field`);
  }

  /**
   * Set the value of a custom field on a task
   * @param {string} taskId
   * @param {string} fieldId
   * @param {any} value
   * @returns {Promise<object>}
   */
  setCustomField(taskId, fieldId, value) {
    return this._request('POST', `/task/${taskId}/field/${fieldId}`, { value });
  }
}

module.exports = ClickUpClient;

// CLI usage demonstration if run directly
if (require.main === module) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    console.log('--- ClickUp Client Loaded Successfully ---');
    console.log('To run CLI demo, set CLICKUP_API_TOKEN environment variable.');
    process.exit(0);
  }

  const client = new ClickUpClient(token);
  console.log('Attempting to connect and fetch workspaces...');
  client.getWorkspaces()
    .then(data => {
      console.log('Workspaces retrieved successfully:');
      console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      console.error('Error fetching workspaces:', err.message);
    });
}
