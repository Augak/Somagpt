import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCAL_CONVERSATIONS_KEY,
  LEGACY_CONVERSATIONS_KEY,
  readLocalConversations,
  writeLocalConversations,
  mergeConversationSources
} from '../src/lib/conversation-storage.ts';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const chat = (id, updatedAt, storage = 'local') => ({
  id, title: `Chat ${id}`, messages: [], updatedAt, storage
});

test('migrates the legacy conversation cache without deleting it', () => {
  const storage = new MemoryStorage();
  storage.setItem(LEGACY_CONVERSATIONS_KEY, JSON.stringify([chat('old', 1)]));
  const result = readLocalConversations(storage);
  assert.equal(result.length, 1);
  assert.equal(result[0].storage, 'local');
  assert.ok(storage.getItem(LOCAL_CONVERSATIONS_KEY));
  assert.ok(storage.getItem(LEGACY_CONVERSATIONS_KEY));
});

test('prefers the new device-only key when it already exists', () => {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify([chat('new', 2)]));
  storage.setItem(LEGACY_CONVERSATIONS_KEY, JSON.stringify([chat('old', 1)]));
  assert.deepEqual(readLocalConversations(storage).map(item => item.id), ['new']);
});

test('merges device-only chats with account chats and lets account copies win collisions', () => {
  const merged = mergeConversationSources(
    [chat('shared', 1), chat('device', 3)],
    [chat('shared', 2, 'cloud'), chat('account', 4, 'cloud')]
  );
  assert.deepEqual(merged.map(item => item.id), ['account', 'device', 'shared']);
  assert.equal(merged.find(item => item.id === 'shared').updatedAt, 2);
  assert.equal(merged.find(item => item.id === 'shared').storage, 'cloud');
  assert.equal(merged.find(item => item.id === 'device').storage, 'local');
});

test('persists local chats but never writes cloud chats into browser storage', () => {
  const storage = new MemoryStorage();
  const ok = writeLocalConversations(storage, [chat('device', 1), chat('account', 2, 'cloud')]);
  const saved = JSON.parse(storage.getItem(LOCAL_CONVERSATIONS_KEY));
  assert.equal(ok, true);
  assert.deepEqual(saved.map(item => item.id), ['device']);
});

test('returns an empty list for invalid cached data without throwing', () => {
  const storage = new MemoryStorage();
  storage.setItem(LOCAL_CONVERSATIONS_KEY, '{broken');
  storage.setItem(LEGACY_CONVERSATIONS_KEY, 'not-json');
  assert.deepEqual(readLocalConversations(storage), []);
});

test('reports a storage quota failure without throwing', () => {
  const storage = new MemoryStorage();
  storage.setItem = () => { throw new Error('quota exceeded'); };
  assert.equal(writeLocalConversations(storage, [chat('device', 1)]), false);
});
