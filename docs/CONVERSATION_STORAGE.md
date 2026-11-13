# Conversation storage boundaries

SomaGPT distinguishes **device-only conversations** from **account conversations**.

- Device-only chats are saved under `somagpt-local-chats` in the current browser.
- Conversations fetched from Supabase are marked as account-owned in memory and are not copied back into browser storage.
- When a user signs in, the UI keeps device-only chats visible alongside account chats. A device-only chat stays on that device when continued; starting a new chat creates an account conversation.
- When a user signs out or switches accounts, account chats are removed from the in-memory list and the device-only list is restored.
- The previous `somagpt-chats` key is migrated to the new device-only key without deleting the old value, so existing browser data is not silently discarded.
- If local storage is unavailable or full, the application keeps the current session usable but cannot guarantee persistence. Users should preserve important work before clearing browser data.

This is a storage boundary, not an automatic cloud migration. The app must never upload old device-only conversations to an account without an explicit user action. Legacy browser data may include cached copies from an earlier release; on a shared device, review local history before handing the browser to another person.

## Verification

Run the storage tests with Node.js 22.6 or later:

```bash
npm test
```
