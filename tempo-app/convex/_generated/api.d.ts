/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _helpers from "../_helpers.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as calendarEvents from "../calendarEvents.js";
import type * as dailyPlans from "../dailyPlans.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as memories from "../memories.js";
import type * as noteLinks from "../noteLinks.js";
import type * as notes from "../notes.js";
import type * as preferences from "../preferences.js";
import type * as projects from "../projects.js";
import type * as savedFilters from "../savedFilters.js";
import type * as seed from "../seed.js";
import type * as seedBetaAccounts from "../seedBetaAccounts.js";
import type * as seedBetaRunner from "../seedBetaRunner.js";
import type * as staging from "../staging.js";
import type * as tags from "../tags.js";
import type * as tasks from "../tasks.js";
import type * as templates from "../templates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _helpers: typeof _helpers;
  ai: typeof ai;
  auth: typeof auth;
  calendarEvents: typeof calendarEvents;
  dailyPlans: typeof dailyPlans;
  folders: typeof folders;
  http: typeof http;
  memories: typeof memories;
  noteLinks: typeof noteLinks;
  notes: typeof notes;
  preferences: typeof preferences;
  projects: typeof projects;
  savedFilters: typeof savedFilters;
  seed: typeof seed;
  seedBetaAccounts: typeof seedBetaAccounts;
  seedBetaRunner: typeof seedBetaRunner;
  staging: typeof staging;
  tags: typeof tags;
  tasks: typeof tasks;
  templates: typeof templates;
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
