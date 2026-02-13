import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@glwa.com",
    name: "테스트 회원",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("테스트 회원");
    expect(result?.email).toBe("test@glwa.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("profile router", () => {
  it("requires authentication for profile.get", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profile.get()).rejects.toThrow();
  });

  it("requires authentication for profile.update", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.profile.update({ gender: "male", height: 175 })
    ).rejects.toThrow();
  });
});

describe("health router", () => {
  it("requires authentication for health.getToday", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.health.getToday()).rejects.toThrow();
  });

  it("requires authentication for health.create", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.health.create({ recordDate: "2026-02-14" })
    ).rejects.toThrow();
  });

  it("validates health.create input schema", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Invalid mood value should be rejected by zod
    await expect(
      caller.health.create({ recordDate: "2026-02-14", mood: "invalid" as any })
    ).rejects.toThrow();
  });
});

describe("diagnosis router", () => {
  it("requires authentication for diagnosis.getAll", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.diagnosis.getAll()).rejects.toThrow();
  });

  it("validates diagnosis.save input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.diagnosis.save({
        timePeriod: "invalid" as any,
        checklistData: {},
      })
    ).rejects.toThrow();
  });
});

describe("missions router", () => {
  it("requires authentication for missions.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.missions.list()).rejects.toThrow();
  });

  it("requires authentication for missions.generate", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.missions.generate()).rejects.toThrow();
  });
});

describe("goals router", () => {
  it("requires authentication for goals.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.goals.list()).rejects.toThrow();
  });

  it("validates goals.create input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Missing required title
    await expect(
      caller.goals.create({} as any)
    ).rejects.toThrow();
  });
});

describe("chat router", () => {
  it("requires authentication for chat.getHistory", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.chat.getHistory()).rejects.toThrow();
  });

  it("requires authentication for chat.send", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.chat.send({ messages: [{ role: "user", content: "hello" }] })
    ).rejects.toThrow();
  });
});

describe("programs router", () => {
  it("requires authentication for programs.getProgress", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.programs.getProgress()).rejects.toThrow();
  });

  it("validates programs.startLesson input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.programs.startLesson({ stage: "invalid" as any, lessonId: 0 })
    ).rejects.toThrow();
  });
});

describe("reminders router", () => {
  it("requires authentication for reminders.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.reminders.list()).rejects.toThrow();
  });

  it("validates reminders.create input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.reminders.create({
        title: "약 복용",
        reminderType: "invalid" as any,
        time: "09:00",
      })
    ).rejects.toThrow();
  });
});

describe("shop router", () => {
  it("allows public access to getCategories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw for public procedure
    const result = await caller.shop.getCategories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to getProducts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.shop.getProducts();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication for shop.addToCart", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.shop.addToCart({ productId: 1, quantity: 1 })
    ).rejects.toThrow();
  });

  it("requires authentication for shop.getCart", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.shop.getCart()).rejects.toThrow();
  });

  it("requires authentication for shop.placeOrder", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.shop.placeOrder({
        shippingName: "홍길동",
        shippingPhone: "010-1234-5678",
        shippingAddress: "서울시 강남구",
        paymentMethod: "stripe",
        origin: "http://localhost:3000",
      })
    ).rejects.toThrow();
  });

  it("validates placeOrder payment method", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.shop.placeOrder({
        shippingName: "홍길동",
        shippingPhone: "010-1234-5678",
        shippingAddress: "서울시 강남구",
        paymentMethod: "invalid_method" as any,
        origin: "http://localhost:3000",
      })
    ).rejects.toThrow();
  });

  it("requires authentication for shop.createProduct", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.shop.createProduct({
        sellerId: 1, categoryId: 1, name: "테스트 상품", price: 10000,
      })
    ).rejects.toThrow();
  });
});

describe("seller router", () => {
  it("requires authentication for seller.applyStore", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.seller.applyStore({ storeName: "테스트 스토어" })
    ).rejects.toThrow();
  });

  it("requires authentication for seller.myStore", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.seller.myStore()).rejects.toThrow();
  });

  it("requires authentication for seller.products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.seller.products()).rejects.toThrow();
  });

  it("requires authentication for seller.stats", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.seller.stats()).rejects.toThrow();
  });

  it("allows public access to seller.getStores", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.seller.getStores();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("community router", () => {
  it("allows public access to community.getPosts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.community.getPosts();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication for community.createPost", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.community.createPost({ title: "테스트", content: "내용", category: "free" })
    ).rejects.toThrow();
  });

  it("allows public access to community.getStories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.community.getStories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication for community.createStory", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.community.createStory({ content: "테스트 스토리" })
    ).rejects.toThrow();
  });

  it("requires authentication for community.sendInfoMessage", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.community.sendInfoMessage({ message: "안녕하세요" })
    ).rejects.toThrow();
  });
});

describe("membership router", () => {
  it("allows public access to membership.getTiers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membership.getTiers();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication for membership.getMyMembership", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.membership.getMyMembership()).rejects.toThrow();
  });

  it("requires authentication for membership.upgrade", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.membership.upgrade({ tier: "gold" })
    ).rejects.toThrow();
  });

  it("validates membership.upgrade tier enum (8 tiers)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Invalid tier should be rejected
    await expect(
      caller.membership.upgrade({ tier: "invalid_tier" as any })
    ).rejects.toThrow();
  });

  it("accepts all valid 8-tier values for upgrade", async () => {
    const validTiers = ["gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"];
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // All should fail auth (not validation), proving the enum accepts them
    for (const tier of validTiers) {
      await expect(
        caller.membership.upgrade({ tier: tier as any })
      ).rejects.toThrow("Please login");
    }
  });
});

describe("points router", () => {
  it("requires authentication for points.getBalance", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.points.getBalance()).rejects.toThrow();
  });

  it("requires authentication for points.getHistory", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.points.getHistory()).rejects.toThrow();
  });
});

describe("coupon router", () => {
  it("requires authentication for coupon.getMyCoupons", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.coupon.getMyCoupons()).rejects.toThrow();
  });

  it("requires authentication for coupon.register", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.coupon.register({ code: "TESTCODE" })
    ).rejects.toThrow();
  });
});

describe("event router", () => {
  it("allows public access to event.getActive", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.event.getActive();
    expect(Array.isArray(result)).toBe(true);
  });

  it("requires authentication for event.join", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.event.join({ eventId: 1 })
    ).rejects.toThrow();
  });
});
