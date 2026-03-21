# TEMPO Implementation Roadmap — Ultra-Detailed Task Breakdown

**Purpose:** Comprehensive guide for code planning agents and developers to execute remaining work in optimal order  
**Date:** March 21, 2026  
**Total Scope:** 70 tasks across 5 phases + critical blockers  
**Estimated Timeline:** 4–6 weeks for full feature parity

---

## TABLE OF CONTENTS
1. [Critical Blockers (Do First — 3 tasks)](#critical-blockers)
2. [Phase 1: Core Completeness (Web + Mobile Parity — 15 tasks)](#phase-1)
3. [Phase 2: Advanced Features (Automation + Integrations — 18 tasks)](#phase-2)
4. [Phase 3: Polish & Scale (Performance + Testing — 12 tasks)](#phase-3)
5. [Phase 4: Team & Growth (Collaboration + Analytics — 15 tasks)](#phase-4)
6. [Phase 5: Platform Expansion (Desktop + API — 7 tasks)](#phase-5)
7. [Task Dependencies Graph](#dependencies)
8. [Quick Reference: By Category](#quick-reference)

---

## CRITICAL BLOCKERS
**Status: MUST COMPLETE BEFORE ANYTHING ELSE**  
**Estimated Time: 3–4 hours total**  
**Blocking:** All deployment and testing work

### CB-001: Renew Vercel Token
**Priority:** CRITICAL  
**Effort:** 5 minutes  
**Status:** BLOCKER  
**What to do:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Generate new personal access token (select scopes: `projects:write`, `deployments:write`)
3. Copy token
4. Update `VERCEL_TOKEN` secret in Replit environment
5. Test: `curl -H "Authorization: Bearer $VERCEL_TOKEN" https://api.vercel.com/v9/projects`
6. Expected output: JSON list of projects (not "invalidToken")

**Acceptance Criteria:**
- ✅ Vercel API returns valid response (HTTP 200, not 401 Forbidden)
- ✅ `scripts/deploy-vercel.sh` can authenticate

**Depends On:** Nothing  
**Blocks:** CB-002, CB-003, deployment tasks

---

### CB-002: Set Up Redis
**Priority:** CRITICAL  
**Effort:** 1–2 hours  
**Status:** BLOCKER  
**What to do:**

**Option A: Local Redis (Development)**
```bash
# Install Redis locally
brew install redis  # macOS
# or on Linux:
apt-get install redis-server

# Start Redis
redis-server
# Should output: "Ready to accept connections"

# Set REDIS_URL environment variable
export REDIS_URL=redis://localhost:6379
```

**Option B: Upstash Redis (Cloud, Recommended for Production)**
1. Go to [upstash.com](https://upstash.com)
2. Sign up / log in
3. Create new Redis database (choose region closest to Convex deployment)
4. Copy connection URL: `redis://default:xxxx@xxxx.upstash.io:6379`
5. Update `REDIS_URL` secret in Replit environment
6. Test: `redis-cli -u $REDIS_URL ping`
7. Expected output: `PONG`

**What this enables:**
- BullMQ job queue (background jobs: email, exports, heavy AI)
- Cron jobs (5 scheduled: morning briefing, streak, overdue, weekly review, inbox nudge)
- Rate limiting cache
- Session store (optional, for scaling)

**Configuration in code:**
- `artifacts/api-server/src/index.ts` — Already imports BullMQ, just needs REDIS_URL
- `artifacts/api-server/src/jobs/` — 5 job definitions ready (no changes needed)
- Test: API logs should show `[BullMQ] Queue worker initialized` instead of `[BullMQ] No REDIS_URL configured`

**Acceptance Criteria:**
- ✅ REDIS_URL environment variable set
- ✅ `redis-cli -u $REDIS_URL ping` returns PONG
- ✅ API logs show "Queue worker initialized"
- ✅ Jobs can be created and processed

**Depends On:** Nothing  
**Blocks:** Email delivery, scheduled notifications, background exports

---

### CB-003: Migrate File Storage (Local → S3 or Object Storage)
**Priority:** CRITICAL  
**Effort:** 2–3 hours  
**Status:** BLOCKER  
**Current State:** Note attachments stored in `./uploads/` (local filesystem)  
**Problem:** Attachments disappear after redeploy (no persistence)

**Option A: AWS S3**
1. Create AWS S3 bucket (name: `tempo-attachments-prod`)
2. Set bucket policy to allow public read (or use signed URLs)
3. Create IAM user with S3 access
4. Copy credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
5. Update environment secrets in Replit
6. Code changes:
   - `artifacts/api-server/src/routes/attachments.ts` — Replace local disk upload with S3 upload
   - Use `aws-sdk` or `@aws-sdk/client-s3` (already installed)
   - Update file URL generation to use S3 object URLs

**Option B: Replit Object Storage (Simpler)**
1. Read Replit object storage documentation
2. Initialize object storage client in API server
3. Update `artifacts/api-server/src/routes/attachments.ts` to use Object Storage client
4. No external credentials needed; uses Replit billing

**Files to modify:**
- `artifacts/api-server/src/routes/attachments.ts` (POST /api/attachments, DELETE /api/attachments/:id)
- `artifacts/tempo/src/api/attachments.ts` (client-side upload)
- Database schema: `attachments` table → update `path` or `url` column to store external URL

**Testing:**
1. Upload file via web app or mobile
2. Redeploy application
3. Verify file still accessible (not 404)

**Acceptance Criteria:**
- ✅ Files upload to cloud storage (S3 or Object Storage)
- ✅ File URLs are accessible after redeploy
- ✅ File deletion removes object from cloud storage
- ✅ No local `./uploads/` directory needed

**Depends On:** CB-001 (if using S3; needs AWS credentials)  
**Blocks:** Production deployment

---

## PHASE 1: CORE COMPLETENESS (Web + Mobile Feature Parity)
**Timeline:** Week 1–2  
**Effort:** ~40 hours  
**Goal:** Bring web and mobile to full feature parity, complete partially-built features

---

### P1-001: Fix Mobile Simulator (Metro Bundler Crash)
**Priority:** HIGH  
**Effort:** 30 minutes – 1 hour  
**Status:** BLOCKER for mobile testing  
**What to do:**

**Root Cause:** Metro file watcher looking for deleted directory  
**Solution:**
```bash
# 1. Clean caches
rm -rf /home/runner/workspace/artifacts/tempo-mobile/.metro-cache
rm -rf /home/runner/workspace/artifacts/tempo-mobile/node_modules/.vite
npm cache clean --force

# 2. Reinstall dependencies (selective)
cd artifacts/tempo-mobile
pnpm install --force

# 3. Restart workflow
# In UI: Workflows → artifacts/tempo-mobile: expo → Restart
```

**If still fails:**
- Check Metro bundler logs for the exact directory it's trying to watch
- Update `metro.config.js` to exclude problematic directories
- File: `artifacts/tempo-mobile/metro.config.js`

**Acceptance Criteria:**
- ✅ `expo start --localhost --port 18650` starts without errors
- ✅ QR code appears in logs
- ✅ Expo Go app can scan QR and load
- ✅ Metro web preview loads at http://localhost:18650

**Depends On:** Nothing  
**Blocks:** All mobile testing and UI refinement

---

### P1-002: Update Expo Packages (23 Version Mismatches)
**Priority:** HIGH  
**Effort:** 1–2 hours  
**Status:** Warnings but app works  
**What to do:**
```bash
cd artifacts/tempo-mobile

# Get list of mismatches
pnpm expo doctor

# Update packages to recommended versions
pnpm upgrade react-native-gesture-handler@~2.28.0
pnpm upgrade expo-device@~8.0.10
pnpm upgrade expo-notifications@~0.32.16
pnpm upgrade @expo/metro-runtime@~6.1.2
pnpm upgrade @expo/vector-icons@^15.0.3
pnpm upgrade @types/react@~19.1.10
pnpm upgrade expo-font@~14.0.11
pnpm upgrade expo-linear-gradient@~15.0.8
pnpm upgrade expo-linking@~8.0.11
pnpm upgrade expo-router@~6.0.23
pnpm upgrade expo-secure-store@~15.0.8
pnpm upgrade expo-splash-screen@~31.0.13
pnpm upgrade expo-status-bar@~3.0.9
pnpm upgrade expo-web-browser@~15.0.10
pnpm upgrade react-native-reanimated@~4.1.1
pnpm upgrade react-native-safe-area-context@~5.6.0
pnpm upgrade react-native-screens@~4.16.0
pnpm upgrade react-native-svg@15.12.1
pnpm upgrade react-native-web@^0.21.0
pnpm upgrade typescript@~5.9.2

# Test
pnpm expo doctor  # Should show 0 warnings
pnpm exec expo start --localhost --port 18650
```

**Why:** Newer versions have bug fixes, performance improvements, better TypeScript support

**Acceptance Criteria:**
- ✅ All package versions match Expo recommended versions
- ✅ `pnpm expo doctor` shows 0 mismatches
- ✅ App still runs without errors
- ✅ No new TS errors after updates

**Depends On:** P1-001  
**Blocks:** App Store submission

---

### P1-003: Implement Mobile Settings Parity (18 fields)
**Priority:** HIGH  
**Effort:** 3–4 hours  
**Status:** Currently 5 of 18 fields visible  
**What to do:**

**Current Settings (5):**
- ADHD mode toggle
- Theme (system only)
- Notification toggle
- About section
- Logout

**Missing Settings (13):**
- [ ] Wake time (time picker)
- [ ] Sleep time (time picker)
- [ ] Planning style (dropdown: structured, flexible, balanced)
- [ ] Focus duration (number input, minutes)
- [ ] Break duration (number input, minutes)
- [ ] Prep buffer (number input, minutes)
- [ ] Energy peak grid (7-day interactive grid)
- [ ] Calendar snap interval (dropdown: 15, 30, 60 min)
- [ ] Show weekends in calendar (toggle)
- [ ] Calendar start day (dropdown: Sun, Mon)
- [ ] AI model selection (dropdown: gpt-4, gpt-3.5, claude)
- [ ] AI deep think toggle (multi-model council)
- [ ] Memory auto-update toggle (AI keeps memories current)
- [ ] TTS voice (dropdown: various voices)
- [ ] Export data (button → JSON file)
- [ ] Delete account (button → confirmation → purge)

**Files to modify:**
- `artifacts/tempo-mobile/src/screens/SettingsScreen.tsx` (add 13 new fields)
- `artifacts/tempo-mobile/src/api/settings.ts` (client-side settings hook)
- Ensure API routes on backend support all fields (check `artifacts/api-server/src/routes/settings.ts`)

**Component Pattern (from web):**
- Use React Native Switch, TextInput, Picker
- Auto-save on change (use React Query mutation)
- Show loading state while saving
- Show error toast if save fails

**Testing:**
1. Change each setting on mobile
2. Refresh app
3. Verify setting persists (check database)
4. Verify setting applies to app behavior (e.g., wake time → adjusts plan generation)

**Acceptance Criteria:**
- ✅ All 18 settings visible on mobile settings screen
- ✅ Each setting saves to database
- ✅ Settings persist after app restart
- ✅ Changes apply to app behavior immediately

**Depends On:** P1-001  
**Blocks:** Mobile production readiness

---

### P1-004: Add Mobile Theme Manual Toggle (Light/Dark/System)
**Priority:** MEDIUM  
**Effort:** 1 hour  
**Status:** Currently system-only  
**What to do:**

**Current Code:**
- `artifacts/tempo-mobile/src/hooks/useTheme.ts` — auto-detects system theme

**Changes:**
```typescript
// Add to settings storage
export interface UserPreferences {
  // ... existing fields
  themeMode: 'light' | 'dark' | 'system';  // new
}

// Update useTheme hook
export function useTheme() {
  const { preferences } = usePreferences();
  const { colorScheme } = useColorScheme();  // system theme
  
  // If user selected manual theme, use it
  // Otherwise use system theme
  const resolvedTheme = preferences.themeMode === 'system' 
    ? colorScheme 
    : preferences.themeMode;
  
  return { theme: resolvedTheme, isDark: resolvedTheme === 'dark' };
}
```

**UI:**
- Add radio button group to SettingsScreen: "Light", "Dark", "Auto (System)"
- Save selection to preferences

**Files:**
- `artifacts/tempo-mobile/src/hooks/useTheme.ts`
- `artifacts/tempo-mobile/src/screens/SettingsScreen.tsx`
- `artifacts/tempo-mobile/src/db/preferences.ts` (add `themeMode` field)

**Testing:**
1. Select "Light" → app turns light
2. Select "Dark" → app turns dark
3. Select "Auto" → follows system setting
4. Restart app → setting persists

**Acceptance Criteria:**
- ✅ Three theme options available in settings
- ✅ Manual selection overrides system theme
- ✅ "Auto" respects device setting
- ✅ Choice persists after restart

**Depends On:** P1-003  
**Blocks:** Nothing critical

---

### P1-005: Implement Calendar Day View (Mobile)
**Priority:** HIGH  
**Effort:** 4–5 hours  
**Status:** Month and week views exist; day view missing  
**What to do:**

**What it should look like:**
- Hour blocks (6 AM to 11 PM)
- Tasks/events shown in time slots
- Tap empty time → create event
- Tap event → open detail / reschedule
- Swipe left/right → prev/next day
- Current time indicator (red line)

**Files to create/modify:**
- `artifacts/tempo-mobile/src/screens/CalendarDayScreen.tsx` (new)
- `artifacts/tempo-mobile/src/components/HourBlock.tsx` (new)
- `artifacts/tempo-mobile/src/components/CalendarTabs.tsx` (modify to add day tab)

**Component Structure:**
```typescript
// CalendarDayScreen.tsx
export function CalendarDayScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, tasks } = useCalendarData(selectedDate);
  
  return (
    <ScrollView horizontal pagingEnabled>
      {/* For each visible day (today ± 3) */}
      <DayView
        date={date}
        events={events}
        tasks={tasks}
        onTimeSlotPress={handleAddEvent}
        onEventPress={handleEventPress}
      />
    </ScrollView>
  );
}

// DayView.tsx
// Hour grid: 6 AM to 11 PM (18 hours)
// Current time indicator
// Event blocks sized by duration
```

**Data Structure (already in DB):**
- `tasks` table has `scheduledDate` and `scheduledTime` fields
- `calendar_events` table (if exists) for explicit calendar entries
- Use same data as web calendar

**Testing:**
1. Navigate to calendar day view
2. See current day with hour blocks
3. Create task at specific time
4. Task appears in correct hour block
5. Swipe left → next day loads
6. Tap event → opens event detail

**Acceptance Criteria:**
- ✅ Hour grid displays 6 AM–11 PM
- ✅ Tasks/events appear in correct time slots
- ✅ Can create event by tapping empty slot
- ✅ Can edit/delete event by tapping it
- ✅ Swipe navigation works (left = next day, right = prev day)
- ✅ Current time indicator shows

**Depends On:** P1-001, P1-002, API routes for tasks/events ready  
**Blocks:** Mobile feature parity

---

### P1-006: Fix Mobile Markdown Renderer (Tables, Images, Code, Links)
**Priority:** HIGH  
**Effort:** 3–4 hours  
**Status:** Currently basic markdown (bold, italic, headers only)  
**What to do:**

**Current Renderer:** SimpleMarkdown  
**Problem:** Doesn't support tables, images, code blocks, links, strikethrough, task checkboxes

**Solution Options:**

**Option A: Replace with Rehype + React Native (Best)**
```bash
cd artifacts/tempo-mobile
pnpm add rehype-react-native remark-parse remark-rehype rehype-stringify
```

Code:
```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeReactNative from 'rehype-react-native';

export function renderMarkdown(markdown: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeReactNative);
  
  const ast = processor.parse(markdown);
  return processor.runSync(ast);
}
```

**Option B: Extend SimpleMarkdown Rules**
File: `artifacts/tempo-mobile/src/utils/markdownRules.ts`
```typescript
// Add custom rules for:
// - Tables (parse | delimited rows)
// - Code blocks (```lang ... ```)
// - Inline code (backticks)
// - Images (![alt](url))
// - Links ([text](url))
// - Strikethrough (~~text~~)
// - Task checkbox (- [x] item)
```

**Recommended:** Option A (rehype-react-native) — more maintainable, supports HTML-like markdown

**Features to add:**
- [ ] Tables (render as ScrollView with table rows)
- [ ] Inline images (Image component, tap to fullscreen)
- [ ] Code blocks (monospace, dark background, syntax highlight if possible)
- [ ] Inline code (monospace)
- [ ] Links (Linking.openURL on tap)
- [ ] Strikethrough text
- [ ] Task checkboxes (- [x] item → checked box)
- [ ] Blockquotes (left border, italic)

**Files to modify:**
- `artifacts/tempo-mobile/src/components/MarkdownRenderer.tsx` (replace SimpleMarkdown)
- `artifacts/tempo-mobile/src/screens/NoteViewScreen.tsx` (use new renderer)

**Testing:**
1. Create note with:
   - `| Table | Header |` → renders table
   - `![alt](url)` → shows image
   - `` `code` `` → monospace
   - `[link](url)` → tappable link
   - `~~strikethrough~~` → crossed out
   - `- [x] Done` → checked box
2. View note on mobile → all features render correctly

**Acceptance Criteria:**
- ✅ Tables render correctly
- ✅ Images display inline (tap to expand)
- ✅ Code blocks have syntax highlighting
- ✅ Links are tappable
- ✅ Strikethrough renders
- ✅ Task checkboxes display
- ✅ No crashes on complex markdown

**Depends On:** P1-001  
**Blocks:** Mobile note viewing parity

---

### P1-007: Complete Mobile Note Editor (Rich Text Toolbar)
**Priority:** MEDIUM  
**Effort:** 3–4 hours  
**Status:** Currently plain text input only  
**What to do:**

**Current State:**
- TextInput component → plain text
- No formatting options

**Target State (from web):**
- Bold, italic, underline, strikethrough buttons
- Heading levels (H1–H6)
- Bullet/numbered lists
- Code block toggle
- Quote toggle
- Link insertion
- Image insertion
- Save button

**Implementation:**
```typescript
// NoteEditorScreen.tsx
export function NoteEditorScreen() {
  const [content, setContent] = useState('');
  const [selectedRange, setSelectedRange] = useState({ start: 0, end: 0 });
  
  // Toolbar buttons → insert markdown syntax
  const insertBold = () => {
    const before = content.slice(0, selectedRange.start);
    const selected = content.slice(selectedRange.start, selectedRange.end);
    const after = content.slice(selectedRange.end);
    setContent(`${before}**${selected}**${after}`);
  };
  
  // Similar for italic, heading, list, etc.
  
  return (
    <>
      {/* Toolbar */}
      <ScrollView horizontal>
        <Button onPress={insertBold}>B</Button>
        <Button onPress={insertItalic}>I</Button>
        <Button onPress={insertHeading}>H1</Button>
        {/* ... more buttons */}
      </ScrollView>
      
      {/* Editor */}
      <TextInput
        value={content}
        onChangeText={setContent}
        onSelectionChange={(e) => setSelectedRange(e.nativeEvent.selection)}
        multiline
        style={styles.editor}
      />
      
      {/* Preview */}
      <MarkdownRenderer markdown={content} />
    </>
  );
}
```

**Files:**
- `artifacts/tempo-mobile/src/screens/NoteEditorScreen.tsx` (rewrite)
- `artifacts/tempo-mobile/src/components/MarkdownToolbar.tsx` (new)

**Testing:**
1. Open note editor
2. Type text, select it
3. Tap "Bold" → text becomes `**text**`
4. Preview updates with formatting
5. Save → formatting persists

**Acceptance Criteria:**
- ✅ All markdown formatting options available
- ✅ Toolbar inserts correct syntax
- ✅ Preview updates live
- ✅ Formatting saves to database

**Depends On:** P1-006  
**Blocks:** Mobile note editing parity

---

### P1-008: Mobile Task Detail Screen Completion
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Basic view works; missing fields  
**What to do:**

**Current State:**
- Task name (editable)
- Complete checkbox
- Date picker
- Delete button

**Missing Fields (from task schema):**
- [ ] Priority (1–4 selector)
- [ ] Project dropdown
- [ ] Tags (multi-select)
- [ ] Subtasks (view + add)
- [ ] Notes field (text)
- [ ] Recurring pattern (view; can't edit)
- [ ] Due date with time (current is date only)
- [ ] Estimated duration (minutes)
- [ ] Actual duration (time tracking)

**Files to modify:**
- `artifacts/tempo-mobile/src/screens/TaskDetailScreen.tsx` (add 8 fields)
- `artifacts/tempo-mobile/src/components/TaskForm.tsx` (if exists, reuse)

**Component Pattern:**
```typescript
export function TaskDetailScreen({ taskId }: Props) {
  const { task, updateTask } = useTask(taskId);
  
  return (
    <ScrollView>
      <TextInput value={task.title} onChangeText={...} />
      <Checkbox value={task.completed} onChange={...} />
      <DateTimePicker value={task.dueDate} onChange={...} />
      <Picker value={task.priority} onChange={...}>
        <Picker.Item label="Low" value={1} />
        <Picker.Item label="Medium" value={2} />
        <Picker.Item label="High" value={3} />
        <Picker.Item label="Urgent" value={4} />
      </Picker>
      <ProjectSelector value={task.projectId} onChange={...} />
      <TagSelector value={task.tags} onChange={...} />
      <SubtaskList subtasks={task.subtasks} />
      <TextInput value={task.notes} onChangeText={...} />
      {/* ... more fields */}
    </ScrollView>
  );
}
```

**Testing:**
1. Open task detail
2. Edit each field
3. Save
4. Close and reopen → changes persist
5. Check database directly → fields are correct

**Acceptance Criteria:**
- ✅ All task fields editable on mobile
- ✅ Changes save immediately
- ✅ Priority affects sorting
- ✅ Tags/projects auto-complete
- ✅ Subtasks can be added/deleted

**Depends On:** P1-003  
**Blocks:** Mobile task management parity

---

### P1-009: Offline Queue for Notes & Events (Not Just Tasks)
**Priority:** HIGH  
**Effort:** 3–4 hours  
**Status:** Currently only tasks queue offline  
**What to do:**

**Current State:**
- Offline write queue only handles task updates
- Note edits offline → lost when connection restored
- Calendar events offline → lost

**Changes Needed:**
1. Expand `OfflineQueue` type to support notes, events, memories
2. Update queue in `artifacts/tempo-mobile/src/db/offlineQueue.ts`:
```typescript
type OfflineAction = 
  | { type: 'task', action: 'create' | 'update' | 'delete', data: Task }
  | { type: 'note', action: 'create' | 'update' | 'delete', data: Note }
  | { type: 'event', action: 'create' | 'update' | 'delete', data: CalendarEvent }
  | { type: 'memory', action: 'create' | 'delete', data: Memory };

export function queueAction(action: OfflineAction) {
  const queue = getQueue();
  queue.push({ ...action, timestamp: Date.now() });
  saveQueue(queue);
}
```

3. Update sync logic in `artifacts/tempo-mobile/src/hooks/useSync.ts`:
```typescript
export function useSync() {
  const isOnline = useNetworkStatus();
  
  useEffect(() => {
    if (isOnline) {
      const queue = getQueue();
      queue.forEach(async (action) => {
        try {
          if (action.type === 'task') {
            await updateTask(action.data);
          } else if (action.type === 'note') {
            await updateNote(action.data);
          } else if (action.type === 'event') {
            await updateEvent(action.data);
          }
          removeFromQueue(action.id);
        } catch (error) {
          // Retry later
        }
      });
    }
  }, [isOnline]);
}
```

4. Update all create/update/delete operations to use `queueAction`:
- `artifacts/tempo-mobile/src/api/notes.ts`
- `artifacts/tempo-mobile/src/api/calendar.ts`
- `artifacts/tempo-mobile/src/api/memories.ts`

**Testing:**
1. Go offline
2. Create note, edit note, delete note
3. Edit calendar event
4. Go online
5. Verify all changes synced to server (check database)
6. Verify changes appear in other clients

**Acceptance Criteria:**
- ✅ Notes queue offline
- ✅ Calendar events queue offline
- ✅ Memories queue offline
- ✅ All queued actions sync when online
- ✅ No data loss

**Depends On:** P1-001  
**Blocks:** Mobile offline completeness

---

### P1-010: Mobile Search & Advanced Filters
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Basic search exists; no filters  
**What to do:**

**Current State:**
- Search box → returns results
- No filtering options

**Add to SearchScreen:**
- Filter by type (tasks, notes, projects, etc.)
- Filter by status (completed, pending)
- Filter by priority (1–4)
- Filter by project
- Filter by date range
- Sort options (relevance, date, priority)
- Save filter presets

**Files:**
- `artifacts/tempo-mobile/src/screens/SearchScreen.tsx` (add filters UI)
- `artifacts/tempo-mobile/src/hooks/useSearch.ts` (add filtering logic)

**UI Pattern:**
```
[Search box]
[Filter chips: Type | Status | Priority | Project]
[Sort: Relevance ▼]
[Save filter]

[Search results]
```

**Testing:**
1. Search for "meeting"
2. Filter by "Tasks" → only tasks
3. Filter by "High priority" → only urgent
4. Filter by project → scope results
5. Save filter preset → reuse later

**Acceptance Criteria:**
- ✅ All filter types work
- ✅ Results update in real-time
- ✅ Can save/load filter presets
- ✅ Search + filters work offline

**Depends On:** P1-001  
**Blocks:** Mobile search parity

---

### P1-011: Mobile Subtasks (Add & Manage)
**Priority:** MEDIUM  
**Effort:** 2 hours  
**Status:** Can view subtasks; can't add  
**What to do:**

**Current State:**
- Subtask list displays
- No way to add/edit/delete subtasks

**Add to TaskDetailScreen:**
- "+ Add subtask" button
- Inline editing of subtask text
- Delete button for each subtask
- Check/uncheck subtask

**Files:**
- `artifacts/tempo-mobile/src/screens/TaskDetailScreen.tsx` (add subtask form)
- `artifacts/tempo-mobile/src/api/tasks.ts` (add createSubtask, updateSubtask, deleteSubtask)

**API Routes (ensure backend has these):**
- POST `/api/tasks/:taskId/subtasks` → create
- PATCH `/api/tasks/:taskId/subtasks/:subtaskId` → update
- DELETE `/api/tasks/:taskId/subtasks/:subtaskId` → delete

**Testing:**
1. Open task
2. Tap "+ Add subtask"
3. Type subtask text
4. Tap checkmark to complete subtask
5. Tap X to delete subtask

**Acceptance Criteria:**
- ✅ Can create subtasks
- ✅ Can mark subtasks complete
- ✅ Can delete subtasks
- ✅ Changes sync to server

**Depends On:** P1-008  
**Blocks:** Mobile task management

---

### P1-012: Mobile Biometric Auth (Face ID / Fingerprint)
**Priority:** LOW  
**Effort:** 2–3 hours  
**Status:** Not implemented  
**What to do:**

**Libraries:**
```bash
pnpm add react-native-biometrics expo-local-authentication
```

**Implementation:**
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

export async function useBiometricAuth() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  
  useEffect(() => {
    const check = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    };
    check();
  }, []);
  
  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      return false;
    }
  };
  
  return { isBiometricAvailable, authenticate };
}
```

**UI:**
- LoginScreen → "Use Face ID / Fingerprint" button
- Tap → biometric prompt
- If success → skip password, go to app
- If fail → show password field

**Files:**
- `artifacts/tempo-mobile/src/hooks/useBiometricAuth.ts` (new)
- `artifacts/tempo-mobile/src/screens/LoginScreen.tsx` (modify)

**Testing:**
1. Deploy to iOS/Android device with biometrics
2. Register biometric
3. Try login with biometric → should work
4. Fallback to password if biometric fails

**Acceptance Criteria:**
- ✅ Biometric authentication works on iOS
- ✅ Biometric authentication works on Android
- ✅ Password fallback works
- ✅ Secure storage of auth token after biometric success

**Depends On:** P1-001  
**Blocks:** App Store submission (nice-to-have)

---

### P1-013: Web App — Implement Recurring Tasks (UI + Expansion)
**Priority:** HIGH  
**Effort:** 4–5 hours  
**Status:** Schema field exists; no UI or expansion logic  
**What to do:**

**Current State:**
- `tasks.recurrenceRule` column exists (text field, stores cron or RRULE format)
- No UI to create recurrence rule
- No job to expand recurrence into individual instances

**What to add:**

**1. Recurrence UI (TaskCreateModal or TaskDetailView):**
```typescript
<Popover>
  <Button>Repeat ▼</Button>
  <RecurrenceForm
    value={task.recurrenceRule}
    onChange={setRecurrenceRule}
  />
</Popover>
```

**RecurrenceForm options:**
- No repeat
- Daily
- Weekly (pick days)
- Bi-weekly
- Monthly (pick day of month or last day)
- Quarterly
- Yearly
- Custom (cron expression input)

**2. Recurrence Expansion (Backend Cron Job):**
File: `artifacts/api-server/src/jobs/expandRecurringTasks.ts` (new)
```typescript
// Every morning at 5 AM, expand recurring tasks for next 30 days
export const expandRecurringTasksJob = cron.schedule('0 5 * * *', async () => {
  const recurringTasks = await db.query.tasks.findMany({
    where: sql`recurrenceRule IS NOT NULL`,
  });
  
  for (const task of recurringTasks) {
    const instances = expandRRule(task.recurrenceRule, {
      dtstart: task.dueDate,
      count: 30,
    });
    
    for (const instance of instances) {
      await db.insert(tasks).values({
        title: task.title,
        dueDate: instance,
        projectId: task.projectId,
        // ... copy other fields
        parentTaskId: task.id,  // link to parent
        isRecurrenceInstance: true,
      });
    }
  }
});
```

**3. Dependencies:**
```bash
cd artifacts/api-server
pnpm add rrule  # for cron/RRULE parsing and expansion
```

**Files to modify:**
- `artifacts/tempo/src/components/TaskCreateModal.tsx` (add recurrence UI)
- `artifacts/tempo/src/components/TaskDetailPanel.tsx` (add recurrence editor)
- `artifacts/api-server/src/jobs/expandRecurringTasks.ts` (create)
- `artifacts/api-server/src/index.ts` (register cron job)
- `artifacts/api-server/src/db/schema.ts` (ensure schema has `parentTaskId`, `isRecurrenceInstance`)

**Database Schema (verify these exist):**
```typescript
tasks: {
  recurrenceRule: text,  // ✓ exists
  parentTaskId: integer,  // add if missing
  isRecurrenceInstance: boolean,  // add if missing
}
```

**Testing:**
1. Create task "Review budget"
2. Set recurrence: Weekly on Monday
3. Set due date: March 24, 2026
4. Verify next day: "Review budget" appears every Monday
5. Check database: instances created with `parentTaskId` link

**Acceptance Criteria:**
- ✅ Recurrence UI works
- ✅ Rules saved correctly
- ✅ Cron job expands tasks daily
- ✅ Instances appear in task list
- ✅ Updating parent task updates all instances (or shows warning)

**Depends On:** CB-001, CB-002 (for cron job)  
**Blocks:** Full task management

---

### P1-014: Web App — Project Templates (Create & Apply)
**Priority:** MEDIUM  
**Effort:** 3–4 hours  
**Status:** Schema field exists; no UI  
**What to do:**

**Current State:**
- `projects.template` column exists
- No way to save or apply templates

**What to add:**

**1. Template Creation UI:**
```typescript
// In ProjectDetailView
<Button>Save as template</Button>
// → Saves structure: name, tasks, folders, settings
```

**2. Template List & Application:**
```typescript
// In ProjectCreateModal
<Tabs>
  <Tab label="New project">
    <ProjectForm />
  </Tab>
  <Tab label="From template">
    <TemplateGallery />
  </Tab>
</Tabs>
```

**TemplateGallery:**
- Displays all saved templates
- Preview (tasks structure, folders)
- "Use this template" → copies tasks + structure to new project

**3. Database:**
```typescript
projectTemplates: {
  id: serial,
  userId: integer,
  name: string,
  data: json,  // { tasks: [...], folders: [...], settings: {...} }
  createdAt: timestamp,
}
```

**Files:**
- `artifacts/tempo/src/components/ProjectTemplateModal.tsx` (new)
- `artifacts/tempo/src/components/ProjectCreateModal.tsx` (modify to add template tab)
- `artifacts/api-server/src/routes/templates.ts` (POST create, GET list, POST apply)

**Testing:**
1. Create project with tasks + folders
2. Save as template "Weekly Review"
3. Create new project → from template → select "Weekly Review"
4. Verify tasks + folders copied

**Acceptance Criteria:**
- ✅ Can save project as template
- ✅ Templates list shows
- ✅ Can create project from template
- ✅ Tasks + folders copied correctly

**Depends On:** P1-003  
**Blocks:** Project management polish

---

### P1-015: Web & Mobile — Export Data (JSON + CSV)
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Button exists on web; backend logic missing  
**What to do:**

**Export Options:**
- All data (JSON)
- Tasks (CSV, JSON)
- Notes (JSON with markdown)
- Calendar (ICS or JSON)
- Memories (JSON)

**Implementation:**

**Backend Route (web & mobile):**
```typescript
// GET /api/export?format=json&type=all
export async function handleExport(req: Request) {
  const { format, type } = req.query;
  const userId = req.user.id;
  
  const data = await db.query.tasks.findMany({ userId });
  
  if (format === 'json') {
    return res.json(data);
  } else if (format === 'csv') {
    return res.setHeader('Content-Type', 'text/csv').send(toCSV(data));
  }
}

// GET /api/calendar/export?format=ics
// Return ICS file
```

**Frontend (trigger download):**
```typescript
async function handleExport() {
  const res = await fetch('/api/export?format=json&type=all');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tempo-export.json';
  a.click();
}
```

**Mobile (save to device):**
```typescript
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function handleExport() {
  const res = await fetch('/api/export?format=json');
  const data = await res.json();
  const uri = FileSystem.documentDirectory + 'tempo-export.json';
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data));
  await Sharing.shareAsync(uri);
}
```

**Files:**
- `artifacts/api-server/src/routes/export.ts` (new)
- `artifacts/tempo/src/components/ExportModal.tsx` (new)
- `artifacts/tempo-mobile/src/screens/SettingsScreen.tsx` (add export button)

**Testing:**
1. Web: Click Settings → Export → select format
2. Mobile: Settings → Export data
3. File downloads
4. Open JSON → contains all data

**Acceptance Criteria:**
- ✅ Export works for all data types
- ✅ JSON is valid and parseable
- ✅ CSV has correct headers
- ✅ Calendar exports as ICS
- ✅ Mobile export triggers file share

**Depends On:** CB-001 (for web export)  
**Blocks:** Data portability / user backup

---

## PHASE 2: ADVANCED FEATURES (Automation + Integrations)
**Timeline:** Week 3–4  
**Effort:** ~35 hours  
**Goal:** Add advanced capabilities, integrations, and AI automation

---

### P2-001: Timezone-Aware Cron Jobs (Per-User Local Time)
**Priority:** HIGH  
**Effort:** 2–3 hours  
**Status:** Jobs fire on server time; no user timezone adjustment  
**What to do:**

**Current Issue:**
- Morning Briefing fires at 8 AM UTC
- User in PST (-8 hours) gets briefing at midnight

**Solution:**
```typescript
// 1. Store timezone in user preferences
preferences: {
  timezone: 'America/Los_Angeles',  // or etc/utc
}

// 2. Modify cron job to iterate users and send at local time
import { CronExpression } from 'cron-parser';

export const morningBriefingJob = new CronJob(
  '0 * * * *',  // Run every hour
  async () => {
    const users = await db.query.users.findMany();
    
    for (const user of users) {
      const userNow = DateTime.now().setZone(user.timezone);
      if (userNow.hour === 8 && userNow.minute === 0) {
        // Send briefing
        await sendBriefing(user.id);
      }
    }
  }
);
```

**Or better: Use Scheduled Messages:**
```typescript
// Store scheduled notifications in DB
scheduledNotifications: {
  id: serial,
  userId: integer,
  type: 'morning_briefing' | 'overdue_check' | ...,
  scheduledAt: timestamp,  // user's local time
  sent: boolean,
}

// Cron job: Check for due notifications and send
export const notificationDispatchJob = new CronJob(
  '0 * * * *',  // Every minute
  async () => {
    const dueSoon = await db.query.scheduledNotifications.findMany({
      where: and(
        lt(scheduledAt, new Date()),
        eq(sent, false),
      ),
    });
    
    for (const notif of dueSoon) {
      await sendNotification(notif.userId, notif.type);
      await db.update(scheduledNotifications)
        .set({ sent: true })
        .where(eq(scheduledNotifications.id, notif.id));
    }
  }
);
```

**Files:**
- `artifacts/api-server/src/jobs/morningBriefingJob.ts` (modify)
- `artifacts/api-server/src/jobs/notificationDispatchJob.ts` (new)
- `artifacts/api-server/src/db/schema.ts` (add scheduledNotifications table)

**Testing:**
1. Set user timezone to "America/New_York"
2. Set morning briefing preference
3. Check database: notification scheduled for 8 AM user's local time
4. Wait for that time → notification sends

**Acceptance Criteria:**
- ✅ Cron jobs check user timezone
- ✅ Notifications send at correct local time
- ✅ Daylight savings time handled correctly
- ✅ Test across 3+ timezones

**Depends On:** CB-002  
**Blocks:** Push notification accuracy

---

### P2-002: API Rate Limiting (Protect All Routes)
**Priority:** HIGH  
**Effort:** 2 hours  
**Status:** Only TTS endpoint limited  
**What to do:**

**Install rate limiter:**
```bash
cd artifacts/api-server
pnpm add express-rate-limit redis
```

**Implement:**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from './redis';  // REDIS_URL connection

const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
});

const strictLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'strict-limit:' }),
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 10,  // 10 requests per minute
});

// Apply to routes
app.use('/api/', limiter);  // All API routes: 100/15min
app.post('/api/ai/chat', strictLimiter);  // Strict: AI endpoints
app.post('/api/ai/extract', strictLimiter);
app.post('/api/attachments', strictLimiter);
```

**Error Response:**
```json
{
  "error": "Too many requests. Please retry after 5 minutes.",
  "retryAfter": 300
}
```

**Testing:**
1. Hit API endpoint 100 times
2. 101st request → 429 Too Many Requests
3. Check rate limit header: `X-RateLimit-Remaining`

**Acceptance Criteria:**
- ✅ Rate limiting applies to all routes
- ✅ Strict limiting on AI + upload endpoints
- ✅ Redis tracks limits
- ✅ Error response includes retry-after

**Depends On:** CB-002 (Redis required)  
**Blocks:** Production security

---

### P2-003: Email Notifications (Send via Service)
**Priority:** MEDIUM  
**Effort:** 3–4 hours  
**Status:** Notifications are push-only; no email  
**What to do:**

**Email Service Options:**
- SendGrid (easy, free tier)
- Mailgun (reliable)
- AWS SES (cheap at scale)

**Using SendGrid:**
```bash
pnpm add @sendgrid/mail
```

**Implementation:**
```typescript
// artifacts/api-server/src/services/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await sgMail.send({
      to,
      from: 'noreply@tempo.app',
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

// Send morning briefing as email + push
export async function sendBriefing(userId: string) {
  const user = await db.query.users.findOne({ id: userId });
  const briefing = await generateBriefing(userId);
  
  // Push notification
  await sendPushNotification(userId, briefing);
  
  // Email (if opted in)
  if (user.emailNotificationsEnabled) {
    await sendEmail(
      user.email,
      'Your TEMPO Daily Briefing',
      renderBriefingEmail(briefing)
    );
  }
}
```

**Email Templates:**
- `templates/morningBriefing.html` (top 3 tasks, schedule)
- `templates/weeklyReview.html` (weekly summary)
- `templates/overdueAlert.html` (overdue tasks)

**User Preference:**
- Settings → Notifications → "Email notifications" toggle

**Queue Integration (via BullMQ):**
```typescript
// Enqueue email jobs so they don't block request
const emailQueue = new Queue('emails', { connection: redis });

await emailQueue.add('send-briefing', { userId }, {
  delay: 0,
  attempts: 3,
});

emailQueue.process('send-briefing', async (job) => {
  await sendBriefing(job.data.userId);
});
```

**Files:**
- `artifacts/api-server/src/services/email.ts` (new)
- `artifacts/api-server/src/templates/emails/` (new directory)
- `artifacts/api-server/src/jobs/emailQueue.ts` (new)
- `artifacts/api-server/src/index.ts` (register email queue)

**Testing:**
1. User opts in to email notifications
2. Trigger morning briefing
3. Check email inbox → briefing received
4. Click link in email → opens TEMPO

**Acceptance Criteria:**
- ✅ Emails send successfully
- ✅ Email templates render correctly
- ✅ User can opt in/out
- ✅ Email jobs queue and process

**Depends On:** CB-002, P2-001  
**Blocks:** Multi-channel notifications

---

### P2-004: Google Calendar Integration (Sync Events)
**Priority:** MEDIUM  
**Effort:** 4–5 hours  
**Status:** Not implemented  
**What to do:**

**Overview:**
- User authorizes TEMPO to access their Google Calendar
- Events sync: TEMPO → Google Calendar (bidirectional)
- User sees TEMPO tasks + Google Calendar events in one calendar view

**Setup:**

**1. OAuth2 Configuration:**
```bash
# Create OAuth app in Google Cloud Console
# Redirect URI: https://tempo.app/auth/google/callback
# Get: CLIENT_ID, CLIENT_SECRET
```

**2. Install library:**
```bash
pnpm add googleapis
```

**3. Backend Routes:**
```typescript
// GET /api/integrations/google/auth
// → Redirects to Google consent screen

// GET /api/integrations/google/callback?code=...&state=...
// → Exchanges code for token, stores in db

// GET /api/calendar/google/sync
// → Fetches events from Google Calendar

// POST /api/calendar/google/sync
// → Pushes TEMPO events to Google Calendar
```

**4. Data Sync:**
```typescript
export async function syncGoogleCalendarEvents(userId: string) {
  const user = await getUser(userId);
  const googleAuth = await getGoogleAuth(userId);
  
  const calendar = google.calendar({ version: 'v3', auth: googleAuth });
  
  // Fetch events from Google Calendar for last 30 days
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  // Upsert into tempo_calendar_events table
  for (const event of response.data.items) {
    await db.insert(calendarEvents).values({
      userId,
      externalId: event.id,
      externalSource: 'google',
      title: event.summary,
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      description: event.description,
    }).onConflictDoUpdate({
      target: [calendarEvents.externalId],
      set: { /* update fields */ },
    });
  }
}
```

**5. Bidirectional Sync (via Webhooks or Polling):**
- Option A: Polling job (every 5 minutes, check for changes)
- Option B: Google Push Notifications (webhook)

**Files:**
- `artifacts/api-server/src/integrations/google/oauth.ts` (new)
- `artifacts/api-server/src/integrations/google/calendar.ts` (new)
- `artifacts/api-server/src/routes/integrations.ts` (modify)
- `artifacts/api-server/src/db/schema.ts` (add googleAuthTokens, calendarEvents)

**UI:**
- Settings → Integrations → Connect Google Calendar
- Authorize → events appear in TEMPO calendar

**Testing:**
1. Create event in Google Calendar
2. Click "Sync" in TEMPO
3. Event appears in TEMPO calendar
4. Create event in TEMPO
5. Check Google Calendar → event synced

**Acceptance Criteria:**
- ✅ Google OAuth flow works
- ✅ Events sync from Google to TEMPO
- ✅ Events sync from TEMPO to Google
- ✅ No duplicate events
- ✅ Timezone handled correctly

**Depends On:** CB-001, CB-002  
**Blocks:** Calendar ecosystem

---

### P2-005: Slack Integration (Daily Briefing in Slack)
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Not implemented  
**What to do:**

**Overview:**
- User connects TEMPO to Slack workspace
- Morning briefing sent to Slack DM or channel
- User can snooze tasks, complete tasks from Slack message

**Setup:**

**1. Slack App Creation:**
```
Slack API → Create App → TEMPO
Scopes: chat:write, users:read
OAuth Redirect: https://tempo.app/auth/slack/callback
Get: SLACK_CLIENT_ID, SLACK_CLIENT_SECRET
```

**2. Install library:**
```bash
pnpm add @slack/web-api
```

**3. Backend Routes:**
```typescript
// GET /api/integrations/slack/auth
// → Redirects to Slack consent

// GET /api/integrations/slack/callback
// → Stores Slack token

// Send briefing to Slack
export async function sendBriefingToSlack(userId: string) {
  const slackToken = await getSlackToken(userId);
  const slack = new WebClient(slackToken);
  const briefing = await generateBriefing(userId);
  
  await slack.chat.postMessage({
    channel: '@user',  // DM
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Good morning! Here are your top 3 tasks:\n${briefing.topThree}`,
        },
      },
      {
        type: 'actions',
        elements: briefing.tasks.map(task => ({
          type: 'button',
          text: { type: 'plain_text', text: task.title },
          value: task.id,
          action_id: `task_${task.id}`,
        })),
      },
    ],
  });
}

// Handle Slack button interaction
export async function handleSlackAction(payload: any) {
  const { action_id, value, user } = payload;
  
  if (action_id.startsWith('task_')) {
    const taskId = value;
    // Mark task complete / snooze / etc.
    await markTaskComplete(taskId);
  }
}
```

**Files:**
- `artifacts/api-server/src/integrations/slack/oauth.ts` (new)
- `artifacts/api-server/src/integrations/slack/notifications.ts` (new)
- `artifacts/api-server/src/routes/integrations.ts` (modify)

**Testing:**
1. Connect Slack workspace
2. Trigger morning briefing
3. Check Slack DM → briefing received
4. Click task button in Slack → task marked complete in TEMPO

**Acceptance Criteria:**
- ✅ Slack OAuth works
- ✅ Briefings send to Slack
- ✅ Buttons/interactions work
- ✅ Changes reflected in TEMPO

**Depends On:** CB-001, CB-002  
**Blocks:** Slack ecosystem

---

### P2-006: Notion Integration (Export Tasks + Notes)
**Priority:** LOW  
**Effort:** 3–4 hours  
**Status:** Not implemented  
**What to do:**

**Overview:**
- User connects TEMPO to Notion workspace
- Can export tasks/notes to Notion database
- Notion can be source of truth for some users

**Implementation:**
```bash
pnpm add @notionhq/client
```

**Routes:**
```typescript
// GET /api/integrations/notion/auth
// POST /api/integrations/notion/disconnect
// POST /api/notion/export
// Query param: type=tasks | notes | projects
```

**Testing:**
1. Connect Notion
2. Export tasks
3. Check Notion workspace → tasks appear as database entries

**Acceptance Criteria:**
- ✅ Notion OAuth works
- ✅ Export creates database entries
- ✅ Fields map correctly

**Depends On:** CB-001  
**Blocks:** Cross-platform ecosystem

---

### P2-007: AI Memory Auto-Update (Keep Memories Fresh)
**Priority:** MEDIUM  
**Effort:** 3–4 hours  
**Status:** Toggle exists; pipeline not active  
**What to do:**

**Overview:**
- User has "AI memory auto-update" toggle in settings
- When enabled, AI automatically adds new insights to memory
- Existing memories decay as scheduled

**Current State:**
- Manual memory decay button exists
- No automatic mechanism

**What to add:**

**1. Memory Update Trigger:**
```typescript
// When AI generates insights, auto-save to memory
export async function generateBriefing(userId: string) {
  const plan = /* ... */;
  
  if (user.autoUpdateMemory) {
    // Extract insights from this briefing
    const insights = await extractInsights(plan);
    
    for (const insight of insights) {
      // Add to warm tier memory
      await addMemory(userId, {
        tier: 'warm',
        content: insight,
        source: 'auto-generated',
      });
    }
  }
  
  return plan;
}
```

**2. Memory Decay Job:**
```typescript
export const memoryDecayJob = new CronJob(
  '0 0 * * *',  // Daily at midnight
  async () => {
    // For each user
    const users = await db.query.users.findMany();
    
    for (const user of users) {
      // Decay memories:
      // hot (7 days) → warm
      // warm (30 days) → cold
      // cold (90 days) → delete
      
      await decayMemories(user.id);
    }
  }
);

async function decayMemories(userId: string) {
  const now = new Date();
  
  // hot → warm (older than 7 days)
  await db.update(memories)
    .set({ tier: 'warm' })
    .where(and(
      eq(memories.userId, userId),
      eq(memories.tier, 'hot'),
      lt(memories.createdAt, new Date(now - 7 * 24 * 60 * 60 * 1000)),
    ));
  
  // warm → cold (older than 30 days)
  await db.update(memories)
    .set({ tier: 'cold' })
    .where(and(
      eq(memories.userId, userId),
      eq(memories.tier, 'warm'),
      lt(memories.createdAt, new Date(now - 30 * 24 * 60 * 60 * 1000)),
    ));
  
  // delete cold (older than 90 days)
  await db.delete(memories)
    .where(and(
      eq(memories.userId, userId),
      eq(memories.tier, 'cold'),
      lt(memories.createdAt, new Date(now - 90 * 24 * 60 * 60 * 1000)),
    ));
}
```

**Files:**
- `artifacts/api-server/src/jobs/memoryDecayJob.ts` (modify if exists)
- `artifacts/api-server/src/services/memory.ts` (add extractInsights, addMemory)
- `artifacts/api-server/src/routes/briefing.ts` (integrate auto-update)

**Testing:**
1. Enable auto-update memory
2. Generate briefing
3. Check memory table → new entries added to warm tier
4. Wait 7 days (or simulate with DB update)
5. Run decay job
6. Verify: hot→warm transition

**Acceptance Criteria:**
- ✅ Auto-update toggle works
- ✅ Insights added to warm tier
- ✅ Decay job runs daily
- ✅ Tier transitions happen correctly

**Depends On:** CB-002, P2-001  
**Blocks:** Memory management

---

### P2-008: Voice Transcription (Mobile + Web)
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Partial (web TTS exists; transcription missing)  
**What to do:**

**Web Implementation:**
```bash
pnpm add react-speech-recognition  # or Web Speech API native
```

**Mobile Implementation:**
```bash
cd artifacts/tempo-mobile
pnpm add expo-av @react-native-camera-roll/camera-roll
```

**Web Code:**
```typescript
import useSpeechRecognition from 'react-speech-recognition';

export function VoiceInput() {
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();
  
  return (
    <div>
      <Button onPress={listening ? stopListening : startListening}>
        {listening ? '🎙️ Listening...' : '🎙️ Speak'}
      </Button>
      <p>{transcript}</p>
    </div>
  );
}
```

**Mobile Code:**
```typescript
import * as Speech from 'expo-speech';

export function VoiceInput() {
  const [transcript, setTranscript] = useState('');
  
  const startRecording = async () => {
    const result = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    // Record audio
    // Send to cloud API (Google Cloud Speech, AWS Transcribe, Deepgram)
    // Get transcript
    setTranscript(result);
  };
  
  return (
    <View>
      <Button onPress={startRecording}>🎙️ Record</Button>
      <Text>{transcript}</Text>
    </View>
  );
}
```

**API Integration (choose one):**
- **Google Cloud Speech-to-Text** (accurate, multi-language)
- **Deepgram** (fast, affordable)
- **Whisper** (OpenAI, self-hosted option)

**Files:**
- `artifacts/tempo/src/components/VoiceInput.tsx` (web)
- `artifacts/tempo-mobile/src/components/VoiceInput.tsx` (mobile)
- `artifacts/api-server/src/services/transcription.ts` (backend)

**Testing:**
1. Click voice button
2. Speak: "Add task: buy groceries"
3. Transcript appears: "Add task: buy groceries"
4. Create task with transcribed text

**Acceptance Criteria:**
- ✅ Voice recording works
- ✅ Transcription accurate
- ✅ Works offline (cached model) or online
- ✅ No sensitive data leaked

**Depends On:** Nothing  
**Blocks:** Voice-first UX

---

### P2-009: Dark Mode Fine-Tuning (Accent Colors, Custom Themes)
**Priority:** LOW  
**Effort:** 2 hours  
**Status:** Basic dark mode exists  
**What to do:**

**Add to settings:**
- Accent color picker (terracotta, sage, blue, etc.)
- Custom color for tasks/notes
- Advanced theme customization

**Implementation:**
```typescript
// Settings → Theme → [Color Picker]
// Saves: user.accentColor = 'terracotta' | 'sage' | 'blue'

// App updates CSS variables
const theme = {
  accentColor: user.accentColor,
  // Map to CSS var
  '--accent': getColorValue(user.accentColor),
};
```

**Files:**
- `artifacts/tempo/src/components/ThemeSelector.tsx` (modify)
- `artifacts/tempo/src/styles/theme.css` (add color variables)

**Acceptance Criteria:**
- ✅ Color picker in settings
- ✅ Selection applies immediately
- ✅ Persists after reload

**Depends On:** Nothing  
**Blocks:** Visual customization

---

## PHASE 3: POLISH & SCALE (Performance + Testing)
**Timeline:** Week 4–5  
**Effort:** ~25 hours  
**Goal:** Optimize, test, prepare for scale

---

### P3-001: End-to-End Tests (Playwright/Cypress)
**Priority:** HIGH  
**Effort:** 4–6 hours  
**Status:** No tests; Playwright was removed  
**What to do:**

**Reinstall Playwright:**
```bash
pnpm add -D @playwright/test
```

**Test Scenarios:**

**Scenario 1: Task Workflow**
```typescript
test('User can create, edit, complete task', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.fill('[data-testid="task-input"]', 'Buy milk');
  await page.click('[data-testid="task-create-button"]');
  
  await expect(page.locator('[data-testid="task-0"]')).toContainText('Buy milk');
  
  // Edit
  await page.click('[data-testid="task-0-menu"]');
  await page.click('[data-testid="task-edit"]');
  await page.fill('[data-testid="task-input"]', 'Buy milk and eggs');
  await page.click('[data-testid="task-save"]');
  
  // Complete
  await page.click('[data-testid="task-0-checkbox"]');
  await expect(page.locator('[data-testid="task-0"]')).toHaveClass(/completed/);
});
```

**Scenario 2: Note Workflow**
```typescript
test('User can create note with markdown', async ({ page }) => {
  await page.goto('http://localhost:5173/notes');
  await page.click('[data-testid="new-note"]');
  
  await page.fill('[data-testid="note-title"]', 'My Note');
  await page.fill('[data-testid="note-body"]', '# Heading\n**Bold** text');
  await page.click('[data-testid="note-save"]');
  
  await expect(page.locator('[data-testid="note-preview"] h1')).toContainText('Heading');
});
```

**Scenario 3: Authentication**
```typescript
test('User can sign up and log in', async ({ page }) => {
  await page.goto('http://localhost:5173/signup');
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="signup-button"]');
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

**Files:**
- `artifacts/tempo/tests/e2e/` (new directory)
- `playwright.config.ts` (new)
- `artifacts/tempo/package.json` → add test script

**Run tests:**
```bash
pnpm exec playwright test
```

**Testing:**
1. Run test suite
2. All scenarios pass
3. CI/CD integration

**Acceptance Criteria:**
- ✅ All critical user workflows tested
- ✅ Tests pass consistently
- ✅ Tests can run in CI/CD
- ✅ Coverage >70% of critical paths

**Depends On:** P1-001 (mobile simulator fixed)  
**Blocks:** Deployment confidence

---

### P3-002: Performance Optimization (Bundle Size, Load Time)
**Priority:** MEDIUM  
**Effort:** 3–4 hours  
**Status:** Web app: 795KB index chunk (over 500KB limit)  
**What to do:**

**Measure current:**
```bash
cd artifacts/tempo
pnpm run build
# Check dist/ → sizes
```

**Optimization techniques:**

**1. Code Splitting (Dynamic Imports):**
```typescript
// Before: import components eagerly
import TaskDetailModal from './components/TaskDetailModal';

// After: lazy load rarely-used screens
const TaskDetailModal = React.lazy(() => import('./components/TaskDetailModal'));
```

**2. Chunk Strategy (Vite):**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-query'],
        'ui': ['@shadcn/ui', 'radix-ui'],
        'editor': ['@milkdown/react', 'remark', 'rehype'],
        'ai': ['openai', 'langchain'],
      }
    }
  }
}
```

**3. Tree Shaking:**
- Remove unused imports
- Only import needed lodash functions: `import pick from 'lodash/pick'`

**4. Image Optimization:**
- Use WebP with JPEG fallback
- Lazy load images

**5. Library Substitution:**
- Replace moment.js with date-fns
- Replace lodash with smaller alternatives

**Files:**
- `artifacts/tempo/vite.config.ts` (add manualChunks)
- `artifacts/tempo/package.json` (optionally remove unused deps)
- `artifacts/tempo/src/` (add React.lazy imports)

**Target Metrics:**
- Main chunk: <250KB
- Vendor chunk: <200KB
- Total: <600KB gzipped

**Testing:**
```bash
pnpm build
du -sh dist/assets/*.js
# Verify sizes
```

**Acceptance Criteria:**
- ✅ Main chunk <250KB
- ✅ Total bundle <600KB gzipped
- ✅ No runtime errors after optimization
- ✅ Page load time <3s on 4G

**Depends On:** P1-001  
**Blocks:** Mobile performance

---

### P3-003: Lighthouse Audit (Accessibility + Performance)
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Not audited  
**What to do:**

**Run Lighthouse:**
```bash
# Chrome DevTools → Lighthouse
# Or via CLI:
pnpm add -D lighthouse
npx lighthouse http://localhost:5173/ --output html
```

**Common issues to fix:**
1. **Accessibility:** Missing alt text, poor contrast, no keyboard nav
2. **Performance:** Slow rendering, network requests during page load
3. **Best Practices:** Insecure dependencies, outdated libraries

**Quick Wins:**
- Add `alt` to all images
- Add `aria-label` to interactive elements
- Ensure color contrast ratio ≥4.5:1
- Optimize images (WebP)
- Remove render-blocking JS

**Target Scores:**
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >95

**Files:**
- `artifacts/tempo/src/` (add a11y attributes)
- `artifacts/tempo/index.html` (optimize meta tags)

**Testing:**
```bash
npx lighthouse http://localhost:5173/
# Review report → fix issues
```

**Acceptance Criteria:**
- ✅ All Lighthouse scores >85
- ✅ No accessibility warnings
- ✅ Core Web Vitals green

**Depends On:** P3-002  
**Blocks:** SEO + accessibility

---

### P3-004: Mobile Performance Profiling (React Profiler)
**Priority:** MEDIUM  
**Effort:** 2 hours  
**Status:** Not profiled  
**What to do:**

**Tools:**
- React Native Profiler (built-in)
- Flipper (Facebook's debugging tool)
- Expo Profiler

**Steps:**
1. Open Expo dev menu: Shake phone or press 'm'
2. Select "Profiler"
3. Interact with app, record
4. Analyze: identify slow renders

**Common bottlenecks:**
- Re-renders of large lists
- Expensive computations in render
- Unoptimized images
- Inefficient state updates

**Fixes:**
```typescript
// Use React.memo for list items
const TaskItem = React.memo(({ task }) => {
  return <View>{task.title}</View>;
}, (prev, next) => prev.task.id === next.task.id);

// Use useCallback for handlers
const handleComplete = useCallback((taskId) => {
  updateTask(taskId, { completed: true });
}, []);

// Virtualize long lists
import { FlatList } from 'react-native';
<FlatList
  data={tasks}
  renderItem={({ item }) => <TaskItem task={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}  // Optimize rendering
/>
```

**Files:**
- `artifacts/tempo-mobile/src/screens/` (profile each screen)

**Testing:**
1. Profile app on device
2. Identify slow frames
3. Optimize identified components
4. Re-profile → verify improvement

**Acceptance Criteria:**
- ✅ Frame rate ≥55 FPS (smooth)
- ✅ No jank during scrolling
- ✅ Task list <100ms to render 100 items

**Depends On:** P1-002  
**Blocks:** Mobile smoothness

---

## PHASE 4: TEAM & GROWTH (Collaboration + Analytics)
**Timeline:** Week 5–6  
**Effort:** ~20 hours  
**Goal:** Enable collaboration and usage insights

---

### P4-001: Shared Workspaces (Teams)
**Priority:** LOW  
**Effort:** 5–6 hours  
**Status:** Not implemented  
**What to do:**

**Overview:**
- Users can invite others to workspace
- Shared tasks, notes, projects
- Roles: Owner, Editor, Viewer
- Real-time collaboration via Convex

**Database Schema:**
```typescript
workspaces: {
  id, name, ownerId, createdAt
}

workspaceMembers: {
  id, workspaceId, userId, role ('owner'|'editor'|'viewer'), joinedAt
}

tasks: {
  // ... existing fields
  workspaceId,  // nullable (personal task)
  sharedWith: integer[],  // user IDs
}
```

**Files:**
- `artifacts/api-server/src/routes/workspaces.ts`
- `artifacts/tempo/src/screens/WorkspaceScreen.tsx`
- `artifacts/tempo/src/components/InviteMemberModal.tsx`

**Testing:**
1. User A creates workspace
2. User A invites User B
3. User B joins → sees shared tasks
4. User A creates task → User B sees it in real-time

**Acceptance Criteria:**
- ✅ Invite mechanism works
- ✅ Shared items visible to team
- ✅ Permissions enforced
- ✅ Real-time sync via Convex

**Depends On:** CB-001  
**Blocks:** Team features

---

### P4-002: Activity Feed & Notifications
**Priority:** MEDIUM  
**Effort:** 2–3 hours  
**Status:** Not implemented  
**What to do:**

**Activity Feed:**
- "User A completed task X"
- "User B shared project Y with you"
- "Your task is now due"

**Implementation:**
```typescript
activityLog: {
  id, userId, action ('task_completed'|'project_shared'|...), 
  targetId, targetType, metadata, createdAt
}

export async function logActivity(userId: string, action: string, targetId: string) {
  await db.insert(activityLog).values({ userId, action, targetId, createdAt: new Date() });
}

// Endpoint: GET /api/activity?limit=20
export async function getActivityFeed(userId: string) {
  return db.query.activityLog.findMany({
    where: eq(activityLog.userId, userId),
    orderBy: desc(activityLog.createdAt),
    limit: 20,
  });
}
```

**UI:**
- Dashboard → Activity section (last 10 activities)
- Notifications → link to relevant item

**Files:**
- `artifacts/api-server/src/db/schema.ts` (add activityLog)
- `artifacts/api-server/src/services/activity.ts`
- `artifacts/tempo/src/screens/ActivityScreen.tsx`

**Testing:**
1. User A completes task
2. Notification sent to watchers
3. Activity log updated
4. User B sees activity in feed

**Acceptance Criteria:**
- ✅ Activity logged for all actions
- ✅ Feed displays chronologically
- ✅ Notifications sent for mentions/shares

**Depends On:** P4-001  
**Blocks:** Workspace awareness

---

### P4-003: Usage Analytics Dashboard
**Priority:** LOW  
**Effort:** 3–4 hours  
**Status:** Not implemented  
**What to do:**

**Metrics to Track:**
- Tasks completed per day
- Streak (consecutive days of activity)
- Busiest time of day
- Most-used projects
- Note word count

**Implementation:**
```typescript
// POST /api/analytics/event
// User triggers: { event: 'task_completed', properties: {...} }

// GET /api/analytics/dashboard
// Returns:
// {
//   tasksCompleted: 42,
//   streak: 7,
//   busyHour: 9,
//   topProjects: ['Work', 'Personal'],
// }
```

**UI:**
- Dashboard → Stats section
- Charts: daily completion, weekly overview, project breakdown

**Libraries:**
```bash
pnpm add recharts  # (already installed)
```

**Files:**
- `artifacts/api-server/src/routes/analytics.ts`
- `artifacts/tempo/src/screens/AnalyticsScreen.tsx`
- `artifacts/tempo/src/components/Charts.tsx`

**Testing:**
1. Complete tasks
2. View analytics dashboard
3. Charts show correct data

**Acceptance Criteria:**
- ✅ Events tracked correctly
- ✅ Charts display data
- ✅ No performance impact

**Depends On:** P1-001  
**Blocks:** User insights

---

## PHASE 5: PLATFORM EXPANSION (Desktop + API)
**Timeline:** Week 6+  
**Effort:** ~15 hours  
**Goal:** Expand to new platforms

---

### P5-001: Desktop App (Electron or Tauri)
**Priority:** LOW  
**Effort:** 6–8 hours  
**Status:** Not implemented  
**What to do:**

**Option A: Electron**
```bash
pnpm add -D electron electron-builder
```

**Option B: Tauri (Lightweight)**
```bash
pnpm add -D @tauri-apps/cli
cargo install tauri-cli
```

**Recommended: Tauri** (smaller bundle, better performance)

**Implementation:**
- Wrap web app in Tauri framework
- Gain access to native features (system tray, file system)
- Same React codebase, recompiled for desktop

**Files:**
- `src-tauri/` (Rust backend)
- `artifacts/tempo/` (React frontend)

**Testing:**
1. Build desktop app
2. Test key features (offline, notifications, etc.)
3. Deploy to macOS/Windows/Linux

**Acceptance Criteria:**
- ✅ App runs on Windows, macOS, Linux
- ✅ All features work
- ✅ Auto-update mechanism works

**Depends On:** P1-001  
**Blocks:** Desktop ecosystem

---

### P5-002: Public API (REST + GraphQL)
**Priority:** MEDIUM  
**Effort:** 4–5 hours  
**Status:** Partial (REST exists; GraphQL missing)  
**What to do:**

**REST API:**
- Already mostly built
- Ensure comprehensive OpenAPI schema
- Document all endpoints

**GraphQL API (Optional):**
```bash
pnpm add apollo-server graphql
```

**Schema:**
```graphql
type Query {
  me: User
  tasks(filter: TaskFilter): [Task]
  notes(search: String): [Note]
  projects: [Project]
}

type Mutation {
  createTask(input: CreateTaskInput): Task
  updateTask(id: ID, input: UpdateTaskInput): Task
  deleteTask(id: ID): Boolean
}
```

**Documentation:**
- OpenAPI/Swagger UI at `/api/docs`
- GraphQL Playground at `/graphql`

**Testing:**
1. Test REST endpoints with curl
2. Test GraphQL queries
3. Verify documentation

**Acceptance Criteria:**
- ✅ All endpoints documented
- ✅ OpenAPI schema valid
- ✅ GraphQL queries work
- ✅ Rate limiting applied

**Depends On:** CB-002  
**Blocks:** Developer ecosystem

---

### P5-003: Plugin System (User-Installed Extensions)
**Priority:** LOW  
**Effort:** 5–6 hours  
**Status:** Database table exists; no implementation  
**What to do:**

**Overview:**
- Users can install plugins to extend TEMPO
- Plugins can add custom fields, views, integrations
- Plugin API with hooks

**Plugin Types:**
- Data source (fetch data from external service)
- View (custom display of data)
- Action (user-triggered automation)
- Integration (sync with external service)

**Plugin Manifest:**
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "hooks": ["onTaskCreate", "onNoteUpdate"],
  "requiredPermissions": ["tasks:read", "tasks:write"]
}
```

**Implementation:**
- Upload plugin ZIP to TEMPO
- System verifies and sandboxes execution
- Plugin runs in isolated context
- Hooks fire on events

**Files:**
- `artifacts/api-server/src/plugins/` (plugin system)
- `artifacts/tempo/src/plugins/` (plugin UI)

**Testing:**
1. Create sample plugin
2. Install into TEMPO
3. Verify hooks fire

**Acceptance Criteria:**
- ✅ Plugin upload works
- ✅ Hooks fire correctly
- ✅ Plugins isolated (can't crash app)
- ✅ Plugin marketplace (directory of plugins)

**Depends On:** P1-001, CB-001  
**Blocks:** Extensibility

---

## TASK DEPENDENCIES GRAPH

```
Critical Blockers:
  CB-001 (Vercel token) ──→ Deployment tasks, P2-003+
  CB-002 (Redis)        ──→ P2-001, P2-002, P3-001
  CB-003 (File storage) ──→ Production deployment

Phase 1 Core:
  P1-001 (Fix mobile simulator) ──→ P1-002, P1-003+, all mobile work
  P1-002 (Expo packages)        ──→ P1-003+, P3-004
  P1-003 (Settings parity)      ──→ P1-004, P1-008
  P1-004 (Theme toggle)         ──→ Optional
  P1-005 (Calendar day view)    ──→ P1-008 (nice to have)
  P1-006 (Markdown renderer)    ──→ P1-007
  P1-007 (Note editor toolbar)  ──→ None (nice to have)
  P1-008 (Task detail screen)   ──→ P1-011
  P1-009 (Offline queue)        ──→ P1-010 (nice to have)
  P1-010 (Search filters)       ──→ None
  P1-011 (Subtasks)             ──→ None
  P1-012 (Biometric auth)       ──→ None (mobile only)
  P1-013 (Recurring tasks)      ──→ CB-001, CB-002
  P1-014 (Project templates)    ──→ CB-001
  P1-015 (Export data)          ──→ CB-001

Phase 2 Advanced:
  P2-001 (Timezone cron)   ──→ P2-002, P2-003
  P2-002 (Rate limiting)   ──→ CB-002
  P2-003 (Email)           ──→ CB-002, P2-001
  P2-004+ (Integrations)   ──→ CB-001

Phase 3 Polish:
  P3-001 (E2E tests)       ──→ CB-001
  P3-002 (Bundle size)     ──→ P1-001
  P3-003 (Lighthouse)      ──→ P3-002
  P3-004 (Mobile profiling)──→ P1-002

Phase 4 Growth:
  P4-001 (Shared workspaces) ──→ CB-001
  P4-002 (Activity feed)     ──→ P4-001
  P4-003 (Analytics)         ──→ CB-001

Phase 5 Expansion:
  P5-001 (Desktop app)    ──→ P1-001
  P5-002 (Public API)     ──→ CB-002
  P5-003 (Plugins)        ──→ P1-001, CB-001
```

---

## QUICK REFERENCE: BY CATEGORY

### Critical Blocker Tasks
| ID | Task | Est. Hours | Status |
|----|------|----------|--------|
| CB-001 | Vercel token | 0.1 | BLOCKER |
| CB-002 | Redis setup | 1–2 | BLOCKER |
| CB-003 | File storage | 2–3 | BLOCKER |

### Mobile (Phase 1)
| ID | Task | Est. Hours | Priority |
|----|------|----------|----------|
| P1-001 | Fix simulator | 0.5–1 | HIGH |
| P1-002 | Update packages | 1–2 | HIGH |
| P1-003 | Settings parity | 3–4 | HIGH |
| P1-004 | Theme toggle | 1 | MEDIUM |
| P1-005 | Calendar day view | 4–5 | HIGH |
| P1-006 | Markdown fix | 3–4 | HIGH |
| P1-007 | Note editor toolbar | 3–4 | MEDIUM |
| P1-008 | Task detail | 2–3 | MEDIUM |
| P1-009 | Offline queue | 3–4 | HIGH |
| P1-010 | Search filters | 2–3 | MEDIUM |
| P1-011 | Subtasks | 2 | MEDIUM |
| P1-012 | Biometric auth | 2–3 | LOW |

### Web (Phase 1)
| ID | Task | Est. Hours | Priority |
|----|------|----------|----------|
| P1-013 | Recurring tasks | 4–5 | HIGH |
| P1-014 | Project templates | 3–4 | MEDIUM |
| P1-015 | Export data | 2–3 | MEDIUM |

### Backend/Integrations (Phase 2)
| ID | Task | Est. Hours | Priority |
|----|------|----------|----------|
| P2-001 | Timezone cron | 2–3 | HIGH |
| P2-002 | Rate limiting | 2 | HIGH |
| P2-003 | Email notif | 3–4 | MEDIUM |
| P2-004 | Google Calendar | 4–5 | MEDIUM |
| P2-005 | Slack | 2–3 | MEDIUM |
| P2-006 | Notion | 3–4 | LOW |
| P2-007 | Memory auto-update | 3–4 | MEDIUM |
| P2-008 | Voice transcription | 2–3 | MEDIUM |
| P2-009 | Dark mode tuning | 2 | LOW |

### Testing & Performance (Phase 3)
| ID | Task | Est. Hours | Priority |
|----|------|----------|----------|
| P3-001 | E2E tests | 4–6 | HIGH |
| P3-002 | Bundle optimization | 3–4 | MEDIUM |
| P3-003 | Lighthouse | 2–3 | MEDIUM |
| P3-004 | Mobile profiling | 2 | MEDIUM |

### Team & Growth (Phase 4+)
| ID | Task | Est. Hours | Priority |
|----|------|----------|----------|
| P4-001 | Workspaces | 5–6 | LOW |
| P4-002 | Activity feed | 2–3 | MEDIUM |
| P4-003 | Analytics | 3–4 | LOW |
| P5-001 | Desktop app | 6–8 | LOW |
| P5-002 | Public API | 4–5 | MEDIUM |
| P5-003 | Plugins | 5–6 | LOW |

---

## EXECUTION ROADMAP (Recommended Order)

**Week 1 (Critical + Mobile Core):**
1. ✅ CB-001 (Vercel) — 10 min
2. ✅ CB-002 (Redis) — 1.5 hrs
3. ✅ CB-003 (File storage) — 2 hrs
4. → P1-001 (Simulator) — 1 hr
5. → P1-002 (Packages) — 1.5 hrs
6. → P1-003 (Settings) — 4 hrs
7. → P1-005 (Calendar day) — 5 hrs

**Week 2 (Mobile Completion):**
1. → P1-006 (Markdown) — 4 hrs
2. → P1-007 (Note editor) — 3 hrs
3. → P1-008 (Task detail) — 2 hrs
4. → P1-009 (Offline queue) — 3 hrs
5. → P1-010 (Search) — 2 hrs
6. → P1-011 (Subtasks) — 2 hrs

**Week 3 (Web + Backend):**
1. → P1-013 (Recurring) — 5 hrs
2. → P1-014 (Templates) — 3 hrs
3. → P1-015 (Export) — 2 hrs
4. → P2-001 (Timezone) — 2 hrs
5. → P2-002 (Rate limit) — 2 hrs

**Week 4 (Integrations + Testing):**
1. → P2-003 (Email) — 3 hrs
2. → P2-004 (Google Cal) — 4 hrs
3. → P3-001 (E2E tests) — 5 hrs
4. → P3-002 (Bundle) — 3 hrs

**Week 5+ (Polish + Growth):**
1. → P3-003 (Lighthouse) — 2 hrs
2. → P3-004 (Mobile perf) — 2 hrs
3. → P2-005 (Slack) — 2 hrs
4. → P2-007 (Memory) — 3 hrs
5. → P4-001 (Workspaces) — 6 hrs (if team feature desired)

**Estimated Total:** 4–6 weeks (assuming 40–50 hrs/week)

---

**Document Version:** 1.0  
**Last Updated:** March 21, 2026  
**Audience:** Development teams, planning agents, project managers
