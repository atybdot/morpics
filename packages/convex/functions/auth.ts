import { v } from "convex/values";
import { authComponent } from "../auth";
import { mutation, query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const { auth } = await authComponent.getAuth(ctx);
    const session = await auth.getSession();

    if (!session?.user) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", session.user.email))
      .first();

    return user;
  },
});

export const syncUserToConvex = mutation({
  args: {
    email: v.string(),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return existing;
    }

    const id = await ctx.db.insert("users", {
      activeTier: "free",
      createdAt: Date.now(),
      email: args.email,
      image: args.image,
      name: args.name,
      updatedAt: Date.now(),
    });

    return { ...args, activeTier: "free", id };
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth } = await authComponent.getAuth(ctx);
    const session = await auth.getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", session.user.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const orgId = await ctx.db.insert("organizations", {
      createdAt: Date.now(),
      name: args.name,
      ownerId: user._id,
      slug: args.slug,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("members", {
      createdAt: Date.now(),
      organizationId: orgId,
      role: "owner",
      userId: user._id,
    });

    return { id: orgId, name: args.name, slug: args.slug };
  },
});

export const getUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const { auth } = await authComponent.getAuth(ctx);
    const session = await auth.getSession();

    if (!session?.user) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", session.user.email))
      .first();

    if (!user) {
      return [];
    }

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const orgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.organizationId);
        return org;
      }),
    );

    return orgs.filter((o) => o !== null);
  },
});

export const addMemberToOrganization = mutation({
  args: {
    email: v.string(),
    organizationId: v.id("organizations"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth } = await authComponent.getAuth(ctx);
    const session = await auth.getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userToAdd = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!userToAdd) {
      throw new Error("User not found");
    }

    const memberId = await ctx.db.insert("members", {
      createdAt: Date.now(),
      organizationId: args.organizationId,
      role: args.role,
      userId: userToAdd._id,
    });

    return { memberId, role: args.role, userId: userToAdd._id };
  },
});

export const removeMemberFromOrganization = mutation({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memberId);
    return true;
  },
});

export const getOrganizationMembers = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          user,
        };
      }),
    );

    return members;
  },
});
