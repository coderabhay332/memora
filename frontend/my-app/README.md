# Memora - AI Notes + Chat

Memora is a full‑stack application that lets you store notes/content and chat with an AI assistant grounded in your content. It includes a modern React UI, an Express backend, and RAG capabilities to answer questions with source attribution.

## Core Features

- Notes/content management
  - Create, view, edit, and delete notes
  - Grid/list views, search and sorting
  - Source linking for AI answers

- AI chat (per‑user, multi‑conversation)
  - Create/delete chats, select active chat in a sidebar
  - Send messages and receive AI responses
  - Auto-scroll, typing indicator, quick prompts
  - New chats start with an assistant greeting

- RAG (Retrieval‑Augmented Generation)
  - Sends queries to the backend RAG pipeline
  - Returns answers with `contentId`, `sourceInfo`, attribution, and context stats
  - Links back to source content from messages

## Tech Stack

- Frontend: React + TypeScript, Tailwind CSS, RTK Query
- Backend: Node.js + Express + TypeScript
- Database: MongoDB (Mongoose models for `Chat` and `Message`)
- Icons/UI: `lucide-react`, modern responsive layout

## Project Structure

- `frontend/my-app/src/components`
  - `Chat.tsx` – chat container (load chats, select/create/delete, send)
  - `ChatInterface.tsx` – chat window + messages + input
  - `ChatInput.tsx` – textarea, quick prompts, send/record UI
  - Other UI components (sidebar, content viewer, auth forms, etc.)

- `frontend/my-app/src/services`
  - `api.ts` – RTK Query endpoints (auth, content, chat, RAG)
  - `baseQuery.ts` – fetch layer with auth/refresh handling

- `backend/src/chat`
  - `chat.schema.ts` – `Chat` and `Message` Mongoose models
  - `chat.service.ts` – chat CRUD, add message; adds starter message on create
  - `chat.controller.ts` / `chat.route.ts` – REST endpoints

## Getting Started (Frontend)

1. Install deps:
   - `npm install`
2. Configure environment (see `.env`):
   - `REACT_APP_API_BASE` – backend base URL (e.g. `http://localhost:4000/api`)
3. Run:
   - `npm start` – dev server at `http://localhost:3000`
4. Build:
   - `npm run build` – production bundle in `build/`

## Getting Started (Backend)

1. From `backend/` install deps and set env vars for MongoDB and JWT
2. Run server (dev or prod):
   - `npm run dev` (or use `docker-compose.dev.yml`)
3. API base path: `/api`

### Key API Endpoints

- `POST /api/chat/create` – create a chat (adds starter assistant message)
- `GET  /api/chat` – list user chats
- `GET  /api/chat/:id` – get a chat with populated messages
- `DELETE /api/chat/:id` – delete a chat
- `POST /api/content/chat/:id` – RAG chat message for chat `:id`

## Development Notes

- The chat list is cached/tagged with RTK Query. Creating/deleting messages invalidates `Chat` tags and refreshes lists where needed.
- The chat input is always visible; layout uses `flex` with `min-h-0` and `flex-shrink-0` to avoid overflow issues.
- The backend now seeds a new chat with a friendly assistant greeting so the UI never looks empty when a conversation starts.

## Scripts

- `npm start` – start frontend dev server
- `npm run build` – build production bundle
- `npm test` – run tests (if configured)

---

If you run into issues, check the browser console and server logs. Ensure your `.env` values for API base and backend environment are set correctly.
