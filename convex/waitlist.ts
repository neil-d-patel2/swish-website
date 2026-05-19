import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const join = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("Invalid email address.");
    }

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();

    if (existing) {
      throw new Error("already_registered");
    }

    await ctx.db.insert("waitlist", {
      email: normalized,
      joinedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.waitlistEmail.sendConfirmation,
      { email: normalized },
    );
  },
});

// Public query: list all waitlist entries sorted by join date
export const list = query({
  handler: async (ctx) => {
    return ctx.db.query("waitlist").order("desc").collect();
  },
});

// Internal query used by broadcast action
export const listAll = internalQuery({
  handler: async (ctx) => {
    return ctx.db.query("waitlist").collect();
  },
});
