import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  memberProfiles, InsertMemberProfile,
  healthRecords, InsertHealthRecord,
  healthDiagnostics, InsertHealthDiagnostic,
  healthMissions, InsertHealthMission,
  healthGoals, InsertHealthGoal,
  chatMessages, InsertChatMessage,
  reminders, InsertReminder,
  programProgress, InsertProgramProgress,
  sellers, InsertSeller,
  sellerSettlements,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Member Profiles ─────────────────────────────────────────────────
export async function getProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1);
  return result[0] || null;
}

export async function upsertProfile(userId: number, data: Partial<InsertMemberProfile>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getProfile(userId);
  if (existing) {
    await db.update(memberProfiles).set(data).where(eq(memberProfiles.userId, userId));
  } else {
    await db.insert(memberProfiles).values({ userId, ...data } as InsertMemberProfile);
  }
}

// ─── Health Records ──────────────────────────────────────────────────
export async function createHealthRecord(data: InsertHealthRecord) {
  const db = await getDb();
  if (!db) return;
  await db.insert(healthRecords).values(data);
}

export async function getTodayRecord(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const today = new Date().toISOString().slice(0, 10);
  const result = await db.select().from(healthRecords)
    .where(and(eq(healthRecords.userId, userId), eq(healthRecords.recordDate, today)))
    .limit(1);
  return result[0] || null;
}

export async function getRecentRecords(userId: number, limit: number = 7) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords)
    .where(eq(healthRecords.userId, userId))
    .orderBy(desc(healthRecords.recordDate))
    .limit(limit);
}

// ─── Health Diagnostics ──────────────────────────────────────────────
export async function saveDiagnostic(data: InsertHealthDiagnostic) {
  const db = await getDb();
  if (!db) return;
  await db.insert(healthDiagnostics).values(data);
}

export async function getUserDiagnostics(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthDiagnostics)
    .where(eq(healthDiagnostics.userId, userId))
    .orderBy(desc(healthDiagnostics.createdAt));
}

// ─── Health Missions ─────────────────────────────────────────────────
export async function createMission(data: InsertHealthMission) {
  const db = await getDb();
  if (!db) return;
  await db.insert(healthMissions).values(data);
}

export async function getUserMissions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthMissions)
    .where(eq(healthMissions.userId, userId))
    .orderBy(desc(healthMissions.createdAt));
}

export async function updateMission(missionId: number, data: Partial<InsertHealthMission>) {
  const db = await getDb();
  if (!db) return;
  await db.update(healthMissions).set(data).where(eq(healthMissions.id, missionId));
}

// ─── Health Goals ────────────────────────────────────────────────────
export async function createGoal(data: InsertHealthGoal) {
  const db = await getDb();
  if (!db) return;
  await db.insert(healthGoals).values(data);
}

export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthGoals)
    .where(eq(healthGoals.userId, userId))
    .orderBy(desc(healthGoals.createdAt));
}

export async function updateGoal(goalId: number, data: Partial<InsertHealthGoal>) {
  const db = await getDb();
  if (!db) return;
  await db.update(healthGoals).set(data).where(eq(healthGoals.id, goalId));
}

// ─── Chat Messages ──────────────────────────────────────────────────
export async function saveChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values(data);
}

export async function getChatHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}

// ─── Reminders ──────────────────────────────────────────────────────
export async function createReminder(data: InsertReminder) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reminders).values(data);
}

export async function getUserReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders)
    .where(eq(reminders.userId, userId))
    .orderBy(desc(reminders.createdAt));
}

export async function updateReminder(reminderId: number, data: Partial<InsertReminder>) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set(data).where(eq(reminders.id, reminderId));
}

export async function deleteReminder(reminderId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reminders).where(eq(reminders.id, reminderId));
}

// ─── Program Progress ───────────────────────────────────────────────
export async function getUserProgramProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programProgress)
    .where(eq(programProgress.userId, userId));
}

export async function upsertProgramProgress(userId: number, stage: string, lessonId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(programProgress)
    .where(and(eq(programProgress.userId, userId), eq(programProgress.stage, stage as any)))
    .limit(1);

  const totalLessons = 5;
  const newProgress = Math.min(100, Math.round(((lessonId + 1) / totalLessons) * 100));
  const isCompleted = lessonId + 1 >= totalLessons ? 1 : 0;

  if (existing.length > 0) {
    await db.update(programProgress).set({
      lessonId,
      progress: newProgress,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    }).where(eq(programProgress.id, existing[0].id));
  } else {
    await db.insert(programProgress).values({
      userId,
      stage: stage as any,
      lessonId,
      progress: newProgress,
      isCompleted,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 쇼핑몰 쿼리 헬퍼
// ═══════════════════════════════════════════════════════════════════════
import {
  productCategories, InsertProductCategory,
  products, InsertProduct,
  cartItems, InsertCartItem,
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  productReviews, InsertProductReview,
  communityPosts, InsertCommunityPost,
  postComments, InsertPostComment,
  postLikes, InsertPostLike,
  infoRoomMessages, InsertInfoRoomMessage,
  userGallery, InsertUserGalleryItem,
  galleryLikes,
  userStories, InsertUserStory,
} from "../drizzle/schema";

// ─── Product Categories ─────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productCategories).orderBy(productCategories.sortOrder);
}

export async function createCategory(data: InsertProductCategory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productCategories).values(data);
}

// ─── Products ───────────────────────────────────────────────────────
export async function getProducts(categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (categoryId) {
    return db.select().from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, 1)))
      .orderBy(desc(products.createdAt));
  }
  return db.select().from(products)
    .where(eq(products.isActive, 1))
    .orderBy(desc(products.createdAt));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result[0] || null;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) return;
  await db.insert(products).values(data);
}

export async function updateProduct(productId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, productId));
}

// ─── Cart ───────────────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  const enriched = [];
  for (const item of items) {
    const product = await getProductById(item.productId);
    enriched.push({ ...item, product });
  }
  return enriched;
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }
}

export async function removeCartItem(cartItemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Orders ─────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(orders).values(data);
  return result[0]?.insertId;
}

export async function addOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) return;
  await db.insert(orderItems).values(data);
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ─── Product Reviews ────────────────────────────────────────────────
export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews)
    .where(eq(productReviews.productId, productId))
    .orderBy(desc(productReviews.createdAt));
}

export async function createProductReview(data: InsertProductReview) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productReviews).values(data);
}

// ═══════════════════════════════════════════════════════════════════════
// 커뮤니티 쿼리 헬퍼
// ═══════════════════════════════════════════════════════════════════════

// ─── Community Posts ────────────────────────────────────────────────
export async function getCommunityPosts(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category && category !== "all") {
    return db.select().from(communityPosts)
      .where(eq(communityPosts.category, category as any))
      .orderBy(desc(communityPosts.createdAt));
  }
  return db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
}

export async function getPostById(postId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
  if (result[0]) {
    await db.update(communityPosts)
      .set({ viewCount: (result[0].viewCount || 0) + 1 })
      .where(eq(communityPosts.id, postId));
  }
  return result[0] || null;
}

export async function createPost(data: InsertCommunityPost) {
  const db = await getDb();
  if (!db) return;
  await db.insert(communityPosts).values(data);
}

export async function deletePost(postId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(communityPosts).where(eq(communityPosts.id, postId));
}

// ─── Comments ───────────────────────────────────────────────────────
export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(postComments)
    .where(eq(postComments.postId, postId))
    .orderBy(postComments.createdAt);
}

export async function createComment(data: InsertPostComment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postComments).values(data);
  // increment comment count
  const post = await db.select().from(communityPosts).where(eq(communityPosts.id, data.postId)).limit(1);
  if (post[0]) {
    await db.update(communityPosts)
      .set({ commentCount: (post[0].commentCount || 0) + 1 })
      .where(eq(communityPosts.id, data.postId));
  }
}

// ─── Post Likes ─────────────────────────────────────────────────────
export async function togglePostLike(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    const post = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
    if (post[0]) {
      await db.update(communityPosts)
        .set({ likeCount: Math.max(0, (post[0].likeCount || 0) - 1) })
        .where(eq(communityPosts.id, postId));
    }
    return false;
  } else {
    await db.insert(postLikes).values({ postId, userId });
    const post = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
    if (post[0]) {
      await db.update(communityPosts)
        .set({ likeCount: (post[0].likeCount || 0) + 1 })
        .where(eq(communityPosts.id, postId));
    }
    return true;
  }
}

export async function isPostLiked(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  return existing.length > 0;
}

// ─── Info Room Messages ─────────────────────────────────────────────
export async function getInfoRoomMessages(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(infoRoomMessages)
    .orderBy(desc(infoRoomMessages.createdAt))
    .limit(limit);
}

export async function createInfoRoomMessage(data: InsertInfoRoomMessage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(infoRoomMessages).values(data);
}

// ─── User Gallery ───────────────────────────────────────────────────
export async function getUserGallery(userId: number, viewerId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (viewerId === userId) {
    return db.select().from(userGallery)
      .where(eq(userGallery.userId, userId))
      .orderBy(desc(userGallery.createdAt));
  }
  return db.select().from(userGallery)
    .where(and(eq(userGallery.userId, userId), eq(userGallery.isPublic, 1)))
    .orderBy(desc(userGallery.createdAt));
}

export async function getPublicGallery(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userGallery)
    .where(eq(userGallery.isPublic, 1))
    .orderBy(desc(userGallery.createdAt))
    .limit(limit);
}

export async function createGalleryItem(data: InsertUserGalleryItem) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userGallery).values(data);
}

export async function updateGalleryItem(itemId: number, data: Partial<InsertUserGalleryItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(userGallery).set(data).where(eq(userGallery.id, itemId));
}

export async function deleteGalleryItem(itemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(userGallery).where(eq(userGallery.id, itemId));
}

// ─── User Stories ───────────────────────────────────────────────────
export async function getPublicStories(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userStories)
    .where(eq(userStories.isPublic, 1))
    .orderBy(desc(userStories.createdAt))
    .limit(limit);
}

export async function getUserStories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userStories)
    .where(eq(userStories.userId, userId))
    .orderBy(desc(userStories.createdAt));
}

export async function createStory(data: InsertUserStory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userStories).values(data);
}

export async function deleteStory(storyId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(userStories).where(eq(userStories.id, storyId));
}


// ─── Sellers (몰인몰) ───────────────────────────────────────────────
export async function createSeller(data: InsertSeller) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sellers).values(data);
}
export async function getSellerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sellers).where(eq(sellers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
export async function getSellerById(sellerId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sellers).where(eq(sellers.id, sellerId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
export async function getApprovedSellers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sellers).where(eq(sellers.status, "approved")).orderBy(desc(sellers.createdAt));
}
export async function getAllSellers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sellers).orderBy(desc(sellers.createdAt));
}
export async function updateSellerStatus(sellerId: number, status: "approved" | "rejected" | "suspended") {
  const db = await getDb();
  if (!db) return;
  await db.update(sellers).set({ status }).where(eq(sellers.id, sellerId));
}
export async function getSellerProducts(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  const { products } = await import("../drizzle/schema");
  return db.select().from(products).where(eq(products.sellerId, sellerId)).orderBy(desc(products.createdAt));
}
export async function getSellerOrderItems(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.sellerId, sellerId)).orderBy(desc(orderItems.createdAt));
}
export async function getSellerSettlements(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sellerSettlements).where(eq(sellerSettlements.sellerId, sellerId)).orderBy(desc(sellerSettlements.createdAt));
}
export async function getSellerStats(sellerId: number) {
  const db = await getDb();
  if (!db) return { totalSales: 0, totalOrders: 0, pendingSettlement: 0 };
  const salesResult = await db.select({ total: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)` })
    .from(orderItems).where(eq(orderItems.sellerId, sellerId));
  const orderCount = await db.select({ count: sql<number>`COUNT(*)` })
    .from(orderItems).where(eq(orderItems.sellerId, sellerId));
  const pendingResult = await db.select({ total: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)` })
    .from(orderItems).where(and(eq(orderItems.sellerId, sellerId), eq(orderItems.sellerSettled, 0)));
  return {
    totalSales: salesResult[0]?.total || 0,
    totalOrders: orderCount[0]?.count || 0,
    pendingSettlement: pendingResult[0]?.total || 0,
  };
}
export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) return;
  const { products } = await import("../drizzle/schema");
  await db.delete(products).where(eq(products.id, productId));
}

// ─── Order Payment Update ───────────────────────────────────────────
export async function updateOrderPayment(orderNumber: string, paymentMethod: string, paymentId: string) {
  const db = await getDb();
  if (!db) return;
  const { orders } = await import("../drizzle/schema");
  await db.update(orders).set({
    paymentMethod,
    paymentId,
    paymentStatus: "completed",
    status: "paid",
  }).where(eq(orders.orderNumber, orderNumber));
}

// ═══════════════════════════════════════════════════════════════════════
// 멤버십 시스템 쿼리 헬퍼
// ═══════════════════════════════════════════════════════════════════════
import {
  membershipTiers,
  userMemberships, InsertUserMembership,
  pointsTransactions, InsertPointsTransaction,
  coupons, InsertCoupon,
  userCoupons, InsertUserCoupon,
  events, InsertEvent,
  eventParticipations, InsertEventParticipation,
  mileageTransactions, InsertMileageTransaction,
} from "../drizzle/schema";

// ─── Membership Tiers ──────────────────────────────────────────────
export async function getMembershipTiers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(membershipTiers).orderBy(membershipTiers.tierOrder);
}

export async function getMembershipTierByName(tier: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(membershipTiers)
    .where(eq(membershipTiers.tier, tier as any)).limit(1);
  return result[0] || null;
}

// ─── User Memberships ──────────────────────────────────────────────
export async function getUserMembership(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userMemberships)
    .where(and(eq(userMemberships.userId, userId), eq(userMemberships.isActive, 1)))
    .limit(1);
  return result[0] || null;
}

export async function upsertUserMembership(userId: number, data: Partial<InsertUserMembership>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserMembership(userId);
  if (existing) {
    await db.update(userMemberships).set(data).where(eq(userMemberships.id, existing.id));
  } else {
    await db.insert(userMemberships).values({ userId, ...data } as InsertUserMembership);
  }
}

export async function updateUserPoints(userId: number, pointsDelta: number) {
  const db = await getDb();
  if (!db) return;
  const membership = await getUserMembership(userId);
  if (membership) {
    const newPoints = Math.max(0, (membership.currentPoints || 0) + pointsDelta);
    const earned = pointsDelta > 0 ? (membership.totalPointsEarned || 0) + pointsDelta : membership.totalPointsEarned;
    const used = pointsDelta < 0 ? (membership.totalPointsUsed || 0) + Math.abs(pointsDelta) : membership.totalPointsUsed;
    await db.update(userMemberships).set({
      currentPoints: newPoints,
      totalPointsEarned: earned,
      totalPointsUsed: used,
    }).where(eq(userMemberships.id, membership.id));
  }
}

// ─── Points Transactions ───────────────────────────────────────────
export async function addPointsTransaction(data: InsertPointsTransaction) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pointsTransactions).values(data);
  await updateUserPoints(data.userId, data.amount);
}

export async function getPointsHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pointsTransactions)
    .where(eq(pointsTransactions.userId, userId))
    .orderBy(desc(pointsTransactions.createdAt))
    .limit(limit);
}

// ─── Coupons ───────────────────────────────────────────────────────
export async function getActiveCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons)
    .where(eq(coupons.isActive, 1))
    .orderBy(desc(coupons.createdAt));
}

export async function createCoupon(data: InsertCoupon) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coupons).values(data);
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(coupons)
    .where(and(eq(coupons.code, code), eq(coupons.isActive, 1)))
    .limit(1);
  return result[0] || null;
}

// ─── User Coupons ──────────────────────────────────────────────────
export async function getUserCoupons(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const userCouponList = await db.select().from(userCoupons)
    .where(eq(userCoupons.userId, userId))
    .orderBy(desc(userCoupons.acquiredAt));
  // Enrich with coupon details
  const enriched = [];
  for (const uc of userCouponList) {
    const couponDetail = await db.select().from(coupons)
      .where(eq(coupons.id, uc.couponId)).limit(1);
    enriched.push({ ...uc, coupon: couponDetail[0] || null });
  }
  return enriched;
}

export async function grantCouponToUser(userId: number, couponId: number, expiresAt?: Date) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userCoupons).values({
    userId,
    couponId,
    expiresAt: expiresAt || null,
  } as InsertUserCoupon);
}

export async function useCoupon(userCouponId: number, orderId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(userCoupons).set({
    status: "used",
    usedAt: new Date(),
    usedOrderId: orderId,
  }).where(eq(userCoupons.id, userCouponId));
}

// ─── Events ────────────────────────────────────────────────────────
export async function getActiveEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events)
    .where(eq(events.isActive, 1))
    .orderBy(desc(events.createdAt));
}

export async function getFeaturedEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events)
    .where(and(eq(events.isActive, 1), eq(events.isFeatured, 1)))
    .orderBy(desc(events.createdAt));
}

export async function getEventById(eventId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  return result[0] || null;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(events).values(data);
}

export async function joinEvent(eventId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(eventParticipations)
    .where(and(eq(eventParticipations.eventId, eventId), eq(eventParticipations.userId, userId)))
    .limit(1);
  if (existing.length > 0) return; // already joined
  await db.insert(eventParticipations).values({ eventId, userId } as InsertEventParticipation);
  // increment participant count
  const event = await getEventById(eventId);
  if (event) {
    await db.update(events).set({
      currentParticipants: (event.currentParticipants || 0) + 1,
    }).where(eq(events.id, eventId));
  }
}

export async function getUserEventParticipations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventParticipations)
    .where(eq(eventParticipations.userId, userId))
    .orderBy(desc(eventParticipations.createdAt));
}

// ─── Mileage ───────────────────────────────────────────────────────
export async function addMileageTransaction(data: InsertMileageTransaction) {
  const db = await getDb();
  if (!db) return;
  await db.insert(mileageTransactions).values(data);
  // update user membership total mileage
  const membership = await getUserMembership(data.userId);
  if (membership) {
    const newMileage = (membership.totalMileage || 0) + data.amount;
    await db.update(userMemberships).set({ totalMileage: newMileage })
      .where(eq(userMemberships.id, membership.id));
  }
}

export async function getMileageHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mileageTransactions)
    .where(eq(mileageTransactions.userId, userId))
    .orderBy(desc(mileageTransactions.createdAt))
    .limit(limit);
}
