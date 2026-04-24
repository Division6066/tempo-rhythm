/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_smoke from "../ai_smoke.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as brain_dump from "../brain_dump.js";
import type * as coach from "../coach.js";
import type * as conversations from "../conversations.js";
import type * as goals from "../goals.js";
import type * as habits from "../habits.js";
import type * as http from "../http.js";
import type * as lib_ai_errors from "../lib/ai_errors.js";
import type * as lib_ai_router from "../lib/ai_router.js";
import type * as lib_requireUser from "../lib/requireUser.js";
import type * as memories from "../memories.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as revenuecat from "../revenuecat.js";
import type * as streaks from "../streaks.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai_smoke: typeof ai_smoke;
  analytics: typeof analytics;
  auth: typeof auth;
  brain_dump: typeof brain_dump;
  coach: typeof coach;
  conversations: typeof conversations;
  goals: typeof goals;
  habits: typeof habits;
  http: typeof http;
  "lib/ai_errors": typeof lib_ai_errors;
  "lib/ai_router": typeof lib_ai_router;
  "lib/requireUser": typeof lib_requireUser;
  memories: typeof memories;
  messages: typeof messages;
  notes: typeof notes;
  revenuecat: typeof revenuecat;
  streaks: typeof streaks;
  tasks: typeof tasks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
