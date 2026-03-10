---
name: Integrate Council AI Assistant from Lovable into Mobile Template
overview: Extract features from the Lovable Council AI Assistant app (memory system, AI chat, etc.) and integrate them into the current Expo + Convex mobile template, ensuring mobile-first architecture that's easily convertible to web.
todos:
  - id: start-convex-backend-terminal-1-using-bunx-convex-dev
    content: Start Convex backend in Terminal 1 using 'bunx convex dev'
    status: completed
  - id: start-expo-server-in-terminal-2-using-bun-dev-lan
    content: Start Expo server in Terminal 2 using 'bun dev -- --lan'
    status: completed
  - id: scan-qr-code-with-expo-go-on-android-phone-same-wi-fi
    content: Scan QR code with Expo Go on Android phone (same Wi-Fi)
    status: completed
---

# Plan: Integrate Council AI Assistant into Mobile Template

## Overview

Extract features from the Lovable-built Council AI Assistant (web app) and integrate them into the current Expo + Convex mobile template. The app will be mobile-first but designed for easy web conversion.

## Phase 1: Analyze Lovable App Structure

### 1.1 Extract and Examine Source Code

- Extract the ZIP file provided by the user
- Identify technology stack (likely Next.js + Supabase + Edge Functions)
- Map key features:
  - Memory system (semantic, episodic, procedural, emotional, general)
  - AI chat/assistant interface
  - Memory extraction from conversations
  - Salience scoring and decay
  - Memory visualization components
  - Any other unique features

### 1.2 Document Component Structure

- List all React components and their dependencies
- Identify UI libraries used (shadcn/ui, Tailwind, etc.)
- Map API endpoints and edge functions
- Document database schema (Supabase tables → Convex schema)

## Phase 2: Convert Backend (Supabase → Convex)

### 2.1 Memory System Schema Migration

Create Convex schema in [`convex/schema.ts`](convex/schema.ts):

```typescript
memories: defineTable({
  userId: v.id("users"),
  content: v.string(),
  sector: v.union(
    v.literal("semantic"),
    v.literal("episodic"),
    v.literal("procedural"),
    v.literal("emotional"),
    v.literal("general")
  ),
  salience: v.number(), // 0-1 importance score
  decayRate: v.number(), // how fast salience decreases
  lastAccessed: v.number(), // timestamp
  accessCount: v.number(),
  metadata: v.optional(v.any()),
  embeddingHash: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### 2.2 Convert Edge Functions to Convex Actions

Create [`convex/memories.ts`](convex/memories.ts) with actions:

- `add` - Store new memories
- `query` - Retrieve memories (sorted by salience)
- `updateSalience` - Reinforce/weaken memories
- `delete` - Remove memories
- `decay` - Apply time-based decay to salience
- `extract` - AI-powered extraction from conversations (using API keys)

### 2.3 AI Integration Setup

- Create [`convex/ai.ts`](convex/ai.ts) for AI API calls (Gemini/OpenAI)
- Add environment variable placeholders in `.env`:
  - `EXPO_PUBLIC_AI_API_KEY` (for client-side if needed)
  - `AI_PROVIDER` (gemini/openai)
  - `AI_MODEL` (e.g., gemini-2.5-flash)
- Create secure Convex actions that use API keys server-side only

## Phase 3: Convert Frontend (Web → React Native)

### 3.1 Create Memory System Components

Convert web components to React Native in [`components/memory/`](components/memory/):

- `MemoryPanel.tsx` - Collapsible panel with Brain icon (use `lucide-react-native`)
- `MemorySectorsViz.tsx` - Visual breakdown (use `react-native-svg` for charts)
- `MemoryList.tsx` - List of memories with filters
- `MemoryItem.tsx` - Individual memory card

### 3.2 Create Custom Hook

Create [`hooks/useMemory.ts`](hooks/useMemory.ts):

- Wrap Convex queries/mutations
- Provide memory operations (add, query, update, delete)
- Handle loading and error states
- Auto-refresh on changes

### 3.3 Convert Chat Interface

Create `[app/(authenticated)/chat/](app/\\\\\\(authenticated)/chat/)`:

- `index.tsx` - Main chat screen
- `MessageList.tsx` - Scrollable message history
- `MessageInput.tsx` - Text input with send button
- `MessageBubble.tsx` - Individual message component
- Integrate memory panel into chat screen

### 3.4 UI Component Conversions

Replace web-specific components:

- `div` → `View` from `react-native`
- `button` → `Pressable` or `TouchableOpacity`
- `input` → `TextInput` from `react-native`
- `img` → `Image` from `expo-image`
- Web icons → `lucide-react-native` or `@expo/vector-icons`
- Keep Tailwind/NativeWind styling (already configured)

## Phase 4: Implement Core Features

### 4.1 Memory Extraction System

- Create [`convex/memoryExtraction.ts`](convex/memoryExtraction.ts) action
- Use AI API to analyze conversation messages
- Extract: facts, preferences, context, emotional state
- Auto-categorize into memory sectors
- Calculate initial salience based on importance

### 4.2 Auto-Extraction After Conversations

- Add hook in chat screen to trigger extraction
- Run extraction action after conversation ends
- Show notification when memories are extracted
- Allow user to review/edit extracted memories

### 4.3 Semantic Search

- Add vector embeddings for memories (if API supports)
- Create [`convex/memorySearch.ts`](convex/memorySearch.ts) action
- Implement search UI in [`components/memory/MemorySearch.tsx`](components/memory/MemorySearch.tsx)
- Search by content, sector, or semantic similarity

### 4.4 Memory Context Injection

- Create [`convex/getRelevantMemories.ts`](convex/getRelevantMemories.ts) query
- Before sending chat message, fetch relevant memories
- Inject context into AI prompt automatically
- Show which memories were used (optional UI indicator)

### 4.5 Memory Consolidation

- Create [`convex/consolidateMemories.ts`](convex/consolidateMemories.ts) action
- Detect similar/duplicate memories
- Merge or suggest merging to user
- Reduce redundancy in memory database

## Phase 5: Mobile-First Optimizations

### 5.1 Navigation Structure

Update `[app/(authenticated)/_layout.tsx](app/\\\\\\(authenticated)/_layout.tsx)`:

- Add chat route to bottom tab navigator
- Add memory management screen
- Keep existing pages (page1, page2, settings)

### 5.2 Mobile UI Enhancements

- Add swipe gestures for memory actions
- Implement pull-to-refresh for memory list
- Add haptic feedback for important actions
- Optimize for one-handed use (bottom-aligned inputs)

### 5.3 Performance Optimizations

- Use Convex real-time subscriptions efficiently
- Implement pagination for memory lists
- Cache frequently accessed memories
- Lazy load memory visualization components

## Phase 6: Web-Ready Architecture

### 6.1 Platform Detection

Create [`lib/platform.ts`](lib/platform.ts):

```typescript
export const isWeb = Platform.OS === 'web';
export const isMobile = !isWeb;
```

### 6.2 Responsive Components

- Use conditional rendering for web vs mobile
- Web: wider layouts, hover states, keyboard shortcuts
- Mobile: touch gestures, bottom sheets, native animations

### 6.3 Shared Component Library

- Keep components in [`components/`](components/) that work on both platforms
- Use React Native Web compatibility (already supported by Expo)
- Test components in both mobile and web views

## Phase 7: Configuration & API Keys

### 7.1 Environment Variables

Update `.env` template with:

```env
# AI Configuration
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
AI_API_KEY=your_api_key_here

# Optional: OpenAI alternative
OPENAI_API_KEY=your_openai_key_here
```

### 7.2 API Key Management

- Store API keys in Convex dashboard (not in code)
- Use Convex environment variables for server-side only
- Create setup guide in [`docs/AI_SETUP.md`](docs/AI_SETUP.md)

### 7.3 Feature Flags

Add to [`config/appConfig.ts`](config/appConfig.ts):

- `MEMORY_SYSTEM_ENABLED`
- `AUTO_EXTRACTION_ENABLED`
- `SEMANTIC_SEARCH_ENABLED`

## Phase 8: Testing & Documentation

### 8.1 Testing Checklist

- [ ] Memory CRUD operations work
- [ ] AI extraction extracts correctly
- [ ] Chat interface sends/receives messages
- [ ] Memory context injection works
- [ ] Mobile UI is responsive
- [ ] Web version renders correctly (Expo web)

### 8.2 Documentation

- Update [`README.md`](README.md) with new features
- Create [`docs/MEMORY_SYSTEM.md`](docs/MEMORY_SYSTEM.md)
- Create [`docs/AI_SETUP.md`](docs/AI_SETUP.md)
- Document API key setup process

## Implementation Order

1. **Phase 1** - Analyze source code (extract ZIP, document structure)
2. **Phase 2** - Set up Convex schema and actions (backend foundation)
3. **Phase 3** - Convert basic UI components (memory panel, list)
4. **Phase 4.1-4.2** - Core memory system (add, query, extract)
5. **Phase 3.3** - Chat interface
6. **Phase 4.3-4.5** - Advanced features (search, consolidation, context)
7. **Phase 5** - Mobile optimizations
8. **Phase 6** - Web compatibility
9. **Phase 7** - API key integration
10. **Phase 8** - Testing and docs

## Key Files to Create/Modify

**New Files:**

- `convex/schema.ts` (update with memories table)
- `convex/memories.ts` (memory actions)
- `convex/ai.ts` (AI API integration)
- `convex/memoryExtraction.ts` (extraction logic)
- `convex/memorySearch.ts` (semantic search)
- `components/memory/MemoryPanel.tsx`
- `components/memory/MemorySectorsViz.tsx`
- `components/memory/MemoryList.tsx`
- `hooks/useMemory.ts`
- `app/(authenticated)/chat/index.tsx`
- `docs/MEMORY_SYSTEM.md`
- `docs/AI_SETUP.md`

**Modified Files:**

- `convex/schema.ts` (add memories table)
- `app/(authenticated)/_layout.tsx` (add chat route)
- `config/appConfig.ts` (add feature flags)
- `.env` (add AI API keys)
- `README.md` (update with new features)

## Success Criteria

- ✅ Memory system fully functional (CRUD operations)
- ✅ AI extraction works from conversations
- ✅ Chat interface sends/receives messages with memory context
- ✅ App runs on Android via Expo Go
- ✅ All features work on mobile
- ✅ Code structure allows easy web conversion
- ✅ API keys securely stored and used
- ✅ Documentation complete