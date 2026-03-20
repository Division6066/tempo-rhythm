# TEMPO - ADHD-Friendly AI Daily Planner

## Overview
TEMPO is a calm, minimalist, ADHD-friendly planning application designed to consolidate daily planning, tasks, notes, projects, folders, tags, and AI-assisted planning into a single, cohesive tool. Its core purpose is to provide an intuitive and low-cognitive-load environment for users, particularly those with ADHD, to manage their daily lives and projects effectively. Key capabilities include a Calendar View, Period Notes, Bi-directional Note Linking, an AI Staging Pattern for suggestions, and comprehensive task/note management. The project aims to offer a unified, intelligent planning experience that adapts to individual user needs and preferences.

## User Preferences
I want iterative development.
I prefer to be asked before any major changes are made.
I like clear and concise explanations.
I prefer detailed explanations for complex issues.
I prefer to use simple language.
I prefer functional programming paradigms where appropriate.
I prefer to use modern JavaScript/TypeScript features.
Do not make changes to files in the `artifacts/tempo-marketing/` directory.
Do not make changes to files in the `tempo-app/apps/mobile/` directory.
Do not make changes to the `TEMPO_Infrastructure_Setup_Guide.md` file.

## System Architecture
TEMPO is built as a pnpm workspace monorepo. The primary web application (`artifacts/tempo/`) is a Vite React SPA utilizing wouter for routing and React Query for data fetching. The backend (`artifacts/api-server/`) is an Express REST API with PostgreSQL and Drizzle ORM. A separate Next.js web application (`tempo-app/apps/web/`) integrates advanced AI features and Convex Auth, with a comprehensive Playwright e2e test suite.

**UI/UX Decisions:**
The design emphasizes a warm light theme with a primary violet color scheme, aiming for an ADHD-friendly experience with low cognitive load. It uses shadcn/ui components for a consistent design system. Priority labels are "Now/Soon/Later" instead of traditional "High/Medium/Low," and tasks include energy level icons.

**Technical Implementations:**
- **API Layer:** OpenAPI 3.0 specification (`lib/api-spec/openapi.yaml`) serves as the source of truth, generating React Query hooks and Zod validators via Orval codegen.
- **Database:** PostgreSQL with Drizzle ORM for schema definition and interaction.
- **AI Features:** Implemented with an OpenAI-compatible API (Ollama Cloud), supporting model fallback, "council mode" (parallel querying of multiple models for synthesis), and AI action logging for cost and performance tracking. Voice note transcription is handled server-side via OpenAI Whisper.
- **Search:** Hybrid search combining pgvector, PostgreSQL full-text search, and pg_trgm for efficient and relevant results across notes, tasks, and memories.
- **Authentication:** Primarily uses Convex Auth with email/password for the web app, while the Express API uses a token-based system for beta phase.
- **Monorepo Structure:** Organizes the main app, API server, and shared libraries for efficient development and dependency management.

**Feature Specifications:**
- **Calendar View:** Full-featured calendar using `react-big-calendar` with `dateFnsLocalizer`, month/week views, drag-and-drop rescheduling via `withDragAndDrop` addon, click-to-create events, and click-to-edit tasks.
- **Period Notes:** Auto-generated weekly/monthly/yearly notes.
- **Bi-directional Note Linking:** Automatically creates and manages links between notes based on `[[Note Title]]` syntax.
- **Command Bar:** Global Cmd+K for search and navigation.
- **Time Blocking & Recurring Tasks:** Scheduling tasks with duration and automated recurrence.
- **Advanced Task Filters:** Customizable and savable filter presets.
- **Templates:** Built-in and custom note templates with variable substitution.
- **AI Staging Pattern:** A workflow for accepting, editing, or rejecting AI-generated suggestions. Includes drag-to-reorder with @dnd-kit.
- **AI Daily Plan:** Pre-generation energy input (Low/Medium/High), per-block rationale from AI, drag-to-reorder blocks before accepting, inline edit (time, task, remove), and mood log (emoji picker) after accepting.
- **AI Memory:** A tiered memory system (warm/cold) for personalized AI interactions.
- **Onboarding:** A 6-step setup process for personalized configuration based on user preferences and ADHD considerations.
- **Settings:** Full settings page with sections: Profile & Navigation, Appearance (ADHD mode, theme, date/time format), Planning & Schedule (wake/sleep, focus, energy peaks), Calendar (layout, view, snap interval, working hours, weekends, first day), Notifications (master toggle with browser permission, lead time, daily reminder), AI (auto-categorize, model, deep think, memory auto-update, voice prompt), Templates (default per period type), Data & Privacy (export JSON, reset memories, delete account), and Lore Pack Import. Desktop has left sidebar nav; mobile uses chip navigation.

## External Dependencies
- **PostgreSQL:** Primary database for persistent storage.
- **Convex:** Backend as a service, specifically for the Next.js web app's schema, functions, and authentication.
- **OpenAI-compatible API (Ollama Cloud):** Used for all AI functionalities including chat, planning, extraction, chunking, and voice transcription (via OpenAI Whisper proxy).
- **Vercel:** Hosting platform for the main web application (`tempo-web`) and the marketing website (`tempo-marketing`).
- **React Query:** Data fetching and state management in the frontend.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **shadcn/ui:** UI component library.
- **@uiw/react-md-editor:** Markdown editor with split-pane view and wiki-link support.
- **Milkdown:** Rich Markdown editor (WYSIWYG) with GFM support, Nord theme. Component at `artifacts/tempo/src/components/MilkdownEditor.tsx`.
- **CodeMirror:** Low-level editor packages (`@codemirror/view`, `@codemirror/state`, `@codemirror/lang-markdown`) available for standalone code editing surfaces.
- **unified/remark/rehype:** Markdown processing pipeline at `artifacts/tempo/src/lib/markdown-processing.ts`.
- **LlamaIndex:** Document ingestion and RAG pipeline SDK. Init module at `artifacts/api-server/src/lib/llamaindex.ts`.
- **LangChain.js:** Document transform chains and text splitting. Utility at `artifacts/api-server/src/lib/langchain.ts`.
- **instructor-js:** Structured AI extraction with Zod schemas. Utility at `artifacts/api-server/src/lib/instructor.ts`.
- **BullMQ:** Background job queue with Redis. Queue/worker setup at `artifacts/api-server/src/lib/bullmq.ts`.
- **Turborepo:** Monorepo build orchestration. Config at `turbo.json`. Root scripts `build` and `typecheck` use `turbo run`.
- **Lucide React:** Icon library.
- **date-fns:** Date utility library.
- **react-big-calendar:** Full-featured calendar component with drag-and-drop support.

## Mobile App Offline Support
- **Network Detection:** `@react-native-community/netinfo` monitors connectivity in real-time via `useNetworkStatus` hook
- **Offline Banner:** Global `OfflineBanner` component in root layout shows "You're offline" / "Back online" / "Syncing..." states
- **Data Caching:** AsyncStorage caches today's tasks, inbox tasks, all tasks, projects, and daily plans on each successful fetch; cached data displayed when offline
- **Offline Write Queue:** Pending mutations (createTask, updateTask) queued in AsyncStorage with serialized/locked access to prevent race conditions; synced automatically on reconnect
- **AI Feature Gating:** Chat, brain dump extraction, and plan generation show "Requires Connection" disabled states when offline
- **Global Sync:** `NetworkProvider` in root layout handles queue replay on reconnect regardless of active screen

## Performance Optimizations
- **Code Splitting:** All page components in `artifacts/tempo/src/App.tsx` use `React.lazy()` with a shared `Suspense`/`PageLoader` fallback for route-based code splitting.
- **Service Worker:** PWA service worker (`artifacts/tempo/public/sw.js`) caches static assets with stale-while-revalidate strategy, excludes `/api/` and Convex WebSocket requests from caching, and provides offline fallback to `index.html` for navigation requests.
- **PWA Manifest:** Full PWA manifest with 192x192 and 512x512 icons, standalone display mode, and dark theme colors.

## Polish & UI Features (Stage 6)
- **Dark Mode:** Full dark theme with CSS variables, toggle persisted to localStorage via ThemeProvider context.
- **Navbar:** Top navbar with "Tempo Flow" branding, search button, dark/light toggle, and user dropdown menu (preferences, logout).
- **Mobile Sidebar:** Hamburger menu opens a slide-in sidebar overlay on mobile (<768px) with 44px touch targets.
- **Error Boundary:** React error boundary wrapping the app with friendly error message and reload button.
- **Loading States:** Skeleton loaders for task lists, notes grid, and calendar. Spinner with "Saving…" text on mutation buttons.
- **Empty States:** Inbox, Calendar, and Notes all show friendly empty-state messages with icon, description, and "Create first [item]" CTA button.
- **Responsive:** Modals go fullscreen on mobile via `max-md:min-h-screen max-md:min-w-full` classes. All touch targets meet 44px minimum.

## Mobile App (Expo)
- **Theme System:** `lib/theme.ts` exports `ThemeContext` with dark/light color sets. `ThemeProvider` persists mode to AsyncStorage. Screens use `useThemeColors()` hook for dynamic colors. Static `colors` export remains for backward compatibility.
- **Settings:** Theme toggle, ADHD mode, notification preference toggles (persisted to AsyncStorage), profile display name editing (AsyncStorage), data export via Share sheet, sign-out with haptic confirmation.
- **Note Editor:** Tab-based Edit/Preview mode with `SimpleMarkdown` renderer supporting headers, bold, italic, lists, blockquotes, inline code.
- **Task Detail:** Subtasks section (list, add inline, toggle completion), tag assignment picker from existing tags, project reassignment via modal picker. Tasks update mutation supports `projectId` and `folderId` args.
- **Calendar:** Week/Month view toggle. Month view shows compact day grid with dots for items. Event detail modal supports editing and deleting events.
- **AI Chat:** Conversation history persisted to Convex `chatMessages` table (loaded on mount, max 50 messages). Memories indicator shows count from Convex memories table. Clear history button clears both local state and Convex records.
- **Project Detail:** `app/project/[id].tsx` shows project tasks, notes, and progress stats (active/done/total with progress bar). Linked from projects list.
- **Haptic Feedback:** `expo-haptics` — impact on task completion toggles, notification on destructive actions (delete/sign-out), selection on pull-to-refresh.