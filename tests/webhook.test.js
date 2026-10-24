const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { verifySignature } = require('../scripts/example_webhook_listener');

test('Webhook Listener - HMAC SHA-256 Signature Verification', (t) => {
  const secret = 'super_secret_webhook_key_9988';
  const payload = JSON.stringify({
    event: 'taskStatusUpdated',
    task_id: '86a12bc',
    timestamp: Date.now()
  });

  // Generate valid signature
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Verify valid signature returns true
  const isValid = verifySignature(payload, validSignature, secret);
  assert.equal(isValid, true, 'Valid signature must be verified as true');

  // Verify tampered signature returns false
  const isInvalid = verifySignature(payload, 'deadbeef1234567890abcdef', secret);
  assert.equal(isInvalid, false, 'Invalid signature must return false');

  // Verify missing signature returns false
  assert.equal(verifySignature(payload, '', secret), false);
  assert.equal(verifySignature(payload, null, secret), false);
});
