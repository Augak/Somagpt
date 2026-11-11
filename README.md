# SomaGPT

SomaGPT is an East Africa-focused learning platform for students and educators.

## Current foundation

- React 18, TypeScript and Vite
- Mobile-first learning interface
- Installable PWA manifest
- Lightweight service worker for app-shell and static-asset caching
- Offline shell fallback after the first successful visit

## Local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Important implementation status

The current release is a frontend foundation. The chat interface does not yet call an AI model, and selecting a document does not yet upload or extract its contents. Authentication, database persistence, curriculum retrieval, subscription enforcement and payment processing are not implemented.

The service worker caches the application shell and same-origin static assets after they are first fetched. It does not yet provide offline AI, offline document processing, or offline synchronization.

## Product principles

- Support Uganda's Primary, O-Level, A-Level, TVET and higher-education pathways.
- Keep Luganda, Runyankole and Rutooro as distinct language options.
- Distinguish official past papers from teacher-created and AI-generated practice.
- Keep the core experience usable on affordable Android phones and low-bandwidth connections.
- Enforce plan limits and permissions on the server, never only in the interface.
- Do not rank schools by payment.
