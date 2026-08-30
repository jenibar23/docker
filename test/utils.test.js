const test = require('node:test');
const assert = require('node:assert');
const { formatVisitMessage, isHealthy } = require('../src/utils');

test('formatVisitMessage returns trimmed message when valid string given', () => {
  assert.strictEqual(formatVisitMessage('  hello world  '), 'hello world');
});

test('formatVisitMessage falls back to default when empty string given', () => {
  assert.strictEqual(formatVisitMessage(''), 'hello from task3');
});

test('formatVisitMessage falls back to default when undefined given', () => {
  assert.strictEqual(formatVisitMessage(undefined), 'hello from task3');
});

test('isHealthy returns true only when db check result is exactly true', () => {
  assert.strictEqual(isHealthy(true), true);
  assert.strictEqual(isHealthy(false), false);
  assert.strictEqual(isHealthy(undefined), false);
});
