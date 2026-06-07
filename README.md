# Data Agent

**A 10MS OriginLabs initiative**

## Overview

Data Agent is a conversational data-assistant application built around natural-language analytics workflows. It lets authorised users query operational metrics through a chat interface backed by an AI agent, with support for tables, charts, persistent sessions, feedback, and governed data access patterns.

This repository is an early-stage reference implementation and is under active development.

## Key Features

- **Chat Interface** — conversational Q&A with Data Agent; supports text input and image attachments
- **Simulated Streaming** — assistant responses are rendered with a typewriter-style streaming animation
- **Embedded BI Dashboard** — Metabase dashboards embedded via signed JWT tokens for at-a-glance reporting
- **Session Management** — persistent chat sessions with history sidebar, session titles, and message feedback (like/dislike)
- **SQL & BigQuery Inspection** — BI users can view the executed SQL and raw BigQuery results behind any agent answer
- **Authentication** — email/password and Google OAuth via Supabase Auth
- **Dark / Light Mode** — full theme support with a toggle in the header
- **Mobile Responsive** — optimised layout for narrow screens with collapsible sidebar and horizontal-scroll tables/charts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui, Radix primitives, Tailwind CSS |
| Charts | Recharts (lazy-loaded) |
| Export | xlsx (lazy-loaded) |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions) |
| Agent | n8n webhook (`ec-data-agent`) via Supabase Edge Function proxy |
| BI Embed | Metabase (JWT-signed iframe) |

## Project Structure

```
src/
  pages/          — Auth, Chat, Dashboard, Index, NotFound
  hooks/          — useChat, useProfile, useMobile, useToast
  components/
    chat/         — ChatInput, ChatSidebar, ChatMessageBubble, SuggestedMessages, MarkdownChartLazy
    dashboard/    — MetabaseDashboard
    layout/       — Header, Footer
    profile/      — ProfileDropdown
    ui/           — shadcn/ui primitives
  integrations/
    supabase/     — client, types
  lib/            — utils
supabase/
  functions/
    chat-with-agent/         — proxies chat requests to the n8n webhook
    generate-metabase-token/ — signs Metabase embed JWTs
```

## Getting Started

```sh
# Install dependencies
npm install

# Start local dev server
npm run dev

# Production build
npm run build
```

Environment variables required (`.env` or Vite env):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Supabase Edge Function secrets:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `METABASE_SECRET_KEY`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local development and pull request guidelines.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

This project is available under the [MIT License](LICENSE).
