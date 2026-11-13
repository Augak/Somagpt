# SomaGPT

SomaGPT is an East Africa-focused learning assistant for students and educators. The current application provides a mobile-first chat workspace and Supabase-backed account history; AI answer generation and document processing are not yet connected.

## Current functionality

- React 18, TypeScript and Vite.
- Mobile-first chat interface with dark/light appearance.
- Browser-only conversations for visitors, without forced sign-in.
- Supabase email authentication and account conversation history.
- Separate device-only and account conversation storage.
- Conversation search, deletion and local history migration.
- PWA manifest and service-worker app-shell caching.
- Attachment selection and metadata capture (the file itself is **not** uploaded or extracted yet).

## Product principles

- Support Uganda's Primary, O-Level, A-Level, TVET and higher-education pathways.
- Keep Luganda, Runyankole and Rutooro as distinct language options.
- Distinguish official past papers from teacher-created and AI-generated practice.
- Keep the core experience usable on affordable Android phones and low-bandwidth connections.
- Enforce plan limits and permissions on the server, never only in the interface.
- Do not rank schools by payment.

## Requirements

- Node.js 22.6 or later.
- npm.
- A Supabase project with the `conversations` and `messages` tables and row-level security policies that restrict account records to their owner.

## Local development

```bash
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a local `.env` file when using a different Supabase project. These are browser-safe public values; **never** put a service-role key in Vite variables or commit secrets.

## Tests and production build

```bash
npm test
npm run build
npm run preview
```

The storage test suite uses Node's built-in test runner and does not require extra test dependencies.

## Conversation storage behaviour

- Visitor conversations are saved in the current browser under `somagpt-local-chats`.
- Existing data in the earlier `somagpt-chats` key is migrated without deleting the old value.
- Account conversations are loaded from Supabase and are not copied back into local browser storage.
- Device-only chats remain device-only after sign-in. Starting a new chat while signed in creates an account conversation.
- Signing out or switching accounts removes the previous account's conversations from the in-memory list.

See [docs/CONVERSATION_STORAGE.md](docs/CONVERSATION_STORAGE.md) for the storage boundary and shared-device caveat.

## Deployment

For a static host such as Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build environment variables.
- Configure the Supabase authentication redirect URLs for the deployed origin.
- Verify database RLS policies before inviting real users.

## Not yet implemented

- AI model responses and streaming.
- Secure server-side AI provider integration.
- Actual file upload, OCR, PDF parsing and document-grounded answers.
- Curriculum retrieval and verified past-paper library.
- Subscription enforcement and payment processing.
- Cross-device synchronization of device-only conversations (there is intentionally no silent migration).
- Complete TalkBack and physical Android device verification.

The current interface saves messages but does not yet generate assistant answers. Do not present it as a working AI tutor until the server-side model and safety layers have been integrated and tested.
