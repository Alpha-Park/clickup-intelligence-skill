/**
 * Example: Real-Time ClickUp Webhook Ingress Listener
 * A zero-dependency, native Node.js HTTP server demonstrating how the Sentinel agent
 * receives, validates (HMAC SHA-256), deduplicates, and dispatches ClickUp events.
 */

const http = require('http');
const crypto = require('crypto');

const PORT = process.env.WEBHOOK_PORT || 3000;
const WEBHOOK_SECRET = process.env.CLICKUP_WEBHOOK_SECRET || 'sample_secret_key_12345';

// Memory cache for event deduplication
const processedEvents = new Set();

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  try {
    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(computed, 'utf8'),
      Buffer.from(signatureHeader, 'utf8')
    );
  } catch (e) {
    return false;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', agent: 'Sentinel Webhook Listener' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/webhook/clickup') {
    let rawBody = '';

    req.on('data', chunk => {
      rawBody += chunk;
      // Prevent payload flooding (> 1MB)
      if (rawBody.length > 1e6) {
        req.socket.destroy();
      }
    });

    req.on('end', () => {
      const signature = req.headers['x-signature'];

      // Signature verification
      if (process.env.CLICKUP_WEBHOOK_SECRET && !verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
        console.warn('[-] [SECURITY WARNING] Invalid Webhook Signature Rejected.');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid HMAC signature' }));
        return;
      }

      let payload;
      try {
        payload = JSON.parse(rawBody);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return;
      }

      const eventKey = `${payload.webhook_id}_${payload.event}_${payload.task_id}`;
      if (processedEvents.has(eventKey)) {
        console.log(`[~] Ignored duplicate event: ${eventKey}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'duplicate_ignored' }));
        return;
      }

      processedEvents.add(eventKey);
      // Clean cache after 5 minutes
      setTimeout(() => processedEvents.delete(eventKey), 300000);

      // Dispatch event to agent handlers
      handleEvent(payload);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'accepted', event: payload.event }));
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

function handleEvent(payload) {
  console.log(`\n[⚡ EVENT RECEIVED] Type: "${payload.event}" on Task: [${payload.task_id}]`);

  switch (payload.event) {
    case 'taskStatusUpdated':
      const statusChange = payload.history_items && payload.history_items.find(h => h.field === 'status');
      if (statusChange) {
        console.log(`   [Workflow State] "${statusChange.before?.status}" ──> "${statusChange.after?.status}"`);
        if (statusChange.after?.status === 'Code Review') {
          console.log('   [Agent Action] Triggering PR linkage validation & CI verification.');
        }
      }
      break;

    case 'taskPriorityUpdated':
      const priorityChange = payload.history_items && payload.history_items.find(h => h.field === 'priority');
      console.log(`   [Priority Change] New Priority Level: ${priorityChange?.after?.priority || 'Custom'}`);
      break;

    case 'taskCommentPosted':
      console.log('   [Comment Activity] Synthesizing comment context for potential blockers.');
      break;

    default:
      console.log(`   [Info] Event logged by Sentinel agent.`);
      break;
  }
}

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡ ClickUp Sentinel Webhook Listener Active`);
    console.log(`   Listening on: http://localhost:${PORT}/webhook/clickup`);
    console.log(`   Health Check: http://localhost:${PORT}/health`);
    console.log(`====================================================`);
  });
}

module.exports = { server, verifySignature };
