export const LOCAL_CONVERSATIONS_KEY = 'somagpt-local-chats';
export const LEGACY_CONVERSATIONS_KEY = 'somagpt-chats';

export type ConversationSnapshot = {
  id: string;
  title: string;
  messages: Array<{ id: string; role: 'user' | 'assistant'; text: string; time: number }>;
  updatedAt: number;
  storage?: 'local' | 'cloud';
};

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function parseConversationList(value: string | null): ConversationSnapshot[] | null {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is ConversationSnapshot =>
      !!item && typeof item === 'object' &&
      typeof (item as ConversationSnapshot).id === 'string' &&
      typeof (item as ConversationSnapshot).title === 'string' &&
      Array.isArray((item as ConversationSnapshot).messages) &&
      typeof (item as ConversationSnapshot).updatedAt === 'number'
    ).map(item => ({ ...item, storage: 'local' }));
  } catch {
    return null;
  }
}

/** Read device-only chats, migrating the previous shared cache without deleting it. */
export function readLocalConversations(storage: StorageLike): ConversationSnapshot[] {
  const current = parseConversationList(storage.getItem(LOCAL_CONVERSATIONS_KEY));
  if (current !== null) return current;

  const legacy = parseConversationList(storage.getItem(LEGACY_CONVERSATIONS_KEY));
  if (legacy === null) return [];

  try {
    storage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(legacy));
  } catch {
    // Keep the in-memory copy available if browser storage is temporarily unavailable.
  }
  return legacy;
}

/** Persist only device-only conversations; account conversations remain server-owned. */
export function writeLocalConversations(storage: StorageLike, conversations: ConversationSnapshot[]): boolean {
  const local = conversations
    .filter(conversation => conversation.storage !== 'cloud')
    .map(conversation => ({ ...conversation, storage: 'local' as const }));
  try {
    storage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(local));
    return true;
  } catch {
    return false;
  }
}

/** Keep local-only chats while allowing the signed-in account's server copy to win ID collisions. */
export function mergeConversationSources(
  local: ConversationSnapshot[],
  remote: ConversationSnapshot[]
): ConversationSnapshot[] {
  const remoteIds = new Set(remote.map(conversation => conversation.id));
  const localOnly = local
    .filter(conversation => !remoteIds.has(conversation.id))
    .map(conversation => ({ ...conversation, storage: 'local' as const }));
  const accountChats = remote.map(conversation => ({ ...conversation, storage: 'cloud' as const }));
  return [...localOnly, ...accountChats].sort((a, b) => b.updatedAt - a.updatedAt);
}
