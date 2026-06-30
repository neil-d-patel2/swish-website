/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as approvalEmail from "../approvalEmail.js";
import type * as auth from "../auth.js";
import type * as cleanup from "../cleanup.js";
import type * as contactEmail from "../contactEmail.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as issues from "../issues.js";
import type * as projects from "../projects.js";
import type * as seed from "../seed.js";
import type * as stripe from "../stripe.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";
import type * as waitlistBroadcast from "../waitlistBroadcast.js";
import type * as waitlistEmail from "../waitlistEmail.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  approvalEmail: typeof approvalEmail;
  auth: typeof auth;
  cleanup: typeof cleanup;
  contactEmail: typeof contactEmail;
  crons: typeof crons;
  http: typeof http;
  issues: typeof issues;
  projects: typeof projects;
  seed: typeof seed;
  stripe: typeof stripe;
  stripeWebhook: typeof stripeWebhook;
  users: typeof users;
  waitlist: typeof waitlist;
  waitlistBroadcast: typeof waitlistBroadcast;
  waitlistEmail: typeof waitlistEmail;
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
