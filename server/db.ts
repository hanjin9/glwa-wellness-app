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
  userWallets, InsertUserWallet,
  walletTransactions, InsertWalletTransaction,
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
  const existing = await db.select().from(membershipTiers).orderBy(membershipTiers.tierOrder);
  if (existing.length > 0) return existing;
  // Auto-seed 8 tiers if empty
  const seeds: any[] = [
    { tier:"silver",name:"실버",nameEn:"Silver",annualFee:0,initiationFee:0,shopDiscountRate:0,paybackRate:50,pointMultiplier:1,dedicatedManager:0,premiumContent:0,exclusiveEvents:0,vipLounge:0,conciergeService:0,monthlyFreeCoupons:0,annualGiftPackage:0,priorityBooking:0,globalPartnerAccess:0,membershipCardType:"standard",maxInvitations:0,description:"무료 기본 멤버십",tierOrder:1,colorTheme:"gray",iconEmoji:"🛡️" },
    { tier:"gold",name:"골드",nameEn:"Gold",annualFee:500000,initiationFee:100000,shopDiscountRate:5,paybackRate:60,pointMultiplier:2,dedicatedManager:0,premiumContent:1,exclusiveEvents:0,vipLounge:0,conciergeService:0,monthlyFreeCoupons:2,annualGiftPackage:0,priorityBooking:0,globalPartnerAccess:0,membershipCardType:"gold",maxInvitations:1,description:"프리미엄 건강 관리",tierOrder:2,colorTheme:"amber",iconEmoji:"⭐" },
    { tier:"blue_sapphire",name:"블루사파이어",nameEn:"Blue Sapphire",annualFee:1200000,initiationFee:300000,shopDiscountRate:8,paybackRate:65,pointMultiplier:3,dedicatedManager:0,premiumContent:1,exclusiveEvents:1,vipLounge:0,conciergeService:0,monthlyFreeCoupons:3,annualGiftPackage:0,priorityBooking:1,globalPartnerAccess:0,membershipCardType:"sapphire",maxInvitations:2,description:"전용 이벤트와 우선 예약",tierOrder:3,colorTheme:"blue",iconEmoji:"💎" },
    { tier:"green_emerald",name:"그린에메랄드",nameEn:"Green Emerald",annualFee:2400000,initiationFee:500000,shopDiscountRate:10,paybackRate:70,pointMultiplier:4,dedicatedManager:1,premiumContent:1,exclusiveEvents:1,vipLounge:0,conciergeService:0,monthlyFreeCoupons:5,annualGiftPackage:1,priorityBooking:1,globalPartnerAccess:0,membershipCardType:"emerald",maxInvitations:3,description:"전담 매니저 맞춤형 프로그램",tierOrder:4,colorTheme:"emerald",iconEmoji:"🏆" },
    { tier:"diamond",name:"다이아몬드",nameEn:"Diamond",annualFee:5000000,initiationFee:1000000,shopDiscountRate:15,paybackRate:80,pointMultiplier:5,dedicatedManager:1,premiumContent:1,exclusiveEvents:1,vipLounge:1,conciergeService:0,monthlyFreeCoupons:8,annualGiftPackage:1,priorityBooking:1,globalPartnerAccess:1,membershipCardType:"diamond",maxInvitations:5,description:"VIP 라운지 및 글로벌 파트너",tierOrder:5,colorTheme:"sky",iconEmoji:"💠" },
    { tier:"blue_diamond",name:"블루다이아몬드",nameEn:"Blue Diamond",annualFee:10000000,initiationFee:3000000,shopDiscountRate:18,paybackRate:85,pointMultiplier:7,dedicatedManager:1,premiumContent:1,exclusiveEvents:1,vipLounge:1,conciergeService:1,monthlyFreeCoupons:10,annualGiftPackage:1,priorityBooking:1,globalPartnerAccess:1,membershipCardType:"blue_diamond",maxInvitations:8,description:"컨시어지 및 프라이빗 투어",tierOrder:6,colorTheme:"indigo",iconEmoji:"🔷" },
    { tier:"platinum",name:"플래티넘",nameEn:"Platinum",annualFee:20000000,initiationFee:5000000,shopDiscountRate:22,paybackRate:90,pointMultiplier:8,dedicatedManager:1,premiumContent:1,exclusiveEvents:1,vipLounge:1,conciergeService:1,monthlyFreeCoupons:15,annualGiftPackage:1,priorityBooking:1,globalPartnerAccess:1,membershipCardType:"platinum",maxInvitations:12,description:"최상위 프리미엄 서비스",tierOrder:7,colorTheme:"slate",iconEmoji:"👑" },
    { tier:"black_platinum",name:"블랙플래티넘",nameEn:"Black Platinum",annualFee:50000000,initiationFee:10000000,shopDiscountRate:25,paybackRate:100,pointMultiplier:10,dedicatedManager:1,premiumContent:1,exclusiveEvents:1,vipLounge:1,conciergeService:1,monthlyFreeCoupons:20,annualGiftPackage:1,priorityBooking:1,globalPartnerAccess:1,membershipCardType:"black_platinum",maxInvitations:20,description:"초대 전용 최고 등급",tierOrder:8,colorTheme:"zinc",iconEmoji:"🖤" },
  ];
  try {
    for (const s of seeds) await db.insert(membershipTiers).values(s);
    console.log("[DB] 8등급 멤버십 시딩 완료");
  } catch (e) { console.warn("[DB] 시딩 실패:", e); }
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

// ─── Wallet Helpers ────────────────────────────────────────────────────
function generateCardNumber(): string {
  const seg = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `GLWA-${seg()}-${seg()}-${seg()}`;
}

export async function getOrCreateWallet(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  // Create new wallet
  const cardNumber = generateCardNumber();
  await db.insert(userWallets).values({ userId, cardNumber, pointBalance: 0, cashBalance: 0, coinBalance: 0, totalSpent: 0, totalCharged: 0, isActive: 1 });
  const created = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
  return created[0] || null;
}

export async function getWalletTransactions(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(walletTransactions).where(eq(walletTransactions.userId, userId)).orderBy(desc(walletTransactions.createdAt)).limit(limit);
}

export async function chargeWallet(userId: number, currency: "point" | "cash" | "coin", amount: number, description: string, referenceId?: string) {
  const db = await getDb();
  if (!db) return null;
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) return null;
  const balanceField = currency === "point" ? "pointBalance" : currency === "cash" ? "cashBalance" : "coinBalance";
  const newBalance = (wallet[balanceField] as number) + amount;
  await db.update(userWallets).set({ [balanceField]: newBalance, totalCharged: wallet.totalCharged + (currency === "cash" ? amount : 0) }).where(eq(userWallets.id, wallet.id));
  await db.insert(walletTransactions).values({
    userId, walletId: wallet.id, type: "charge", currency, amount, balanceAfter: newBalance, description, referenceId: referenceId || null,
  });
  return { ...wallet, [balanceField]: newBalance };
}

export async function payFromWallet(userId: number, currency: "point" | "cash" | "coin", amount: number, description: string, paymentMethod: string, referenceId?: string) {
  const db = await getDb();
  if (!db) return { success: false, message: "DB 연결 실패" };
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) return { success: false, message: "지갑 없음" };
  const balanceField = currency === "point" ? "pointBalance" : currency === "cash" ? "cashBalance" : "coinBalance";
  const currentBalance = wallet[balanceField] as number;
  if (currentBalance < amount) return { success: false, message: "잔액 부족" };
  const newBalance = currentBalance - amount;
  await db.update(userWallets).set({ [balanceField]: newBalance, totalSpent: wallet.totalSpent + (currency === "cash" ? amount : 0) }).where(eq(userWallets.id, wallet.id));
  await db.insert(walletTransactions).values({
    userId, walletId: wallet.id, type: "payment", currency, amount: -amount, balanceAfter: newBalance, description, paymentMethod, referenceId: referenceId || null,
  });
  return { success: true, newBalance };
}
