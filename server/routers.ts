import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import { createCheckoutSession } from "./stripe";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Profile ─────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getProfile(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        birthDate: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        bloodType: z.string().optional(),
        medicalHistory: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
        emergencyContact: z.string().optional(),
        constitutionType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ─── Health Records ──────────────────────────────────────────────
  health: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      return db.getTodayRecord(ctx.user.id);
    }),
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(7) }))
      .query(async ({ ctx, input }) => {
        return db.getRecentRecords(ctx.user.id, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        recordDate: z.string(),
        systolicBP: z.number().optional(),
        diastolicBP: z.number().optional(),
        heartRate: z.number().optional(),
        bloodSugar: z.number().optional(),
        weight: z.number().optional(),
        bodyFat: z.number().optional(),
        exerciseMinutes: z.number().optional(),
        exerciseType: z.string().optional(),
        sleepHours: z.number().optional(),
        sleepQuality: z.number().optional(),
        waterIntake: z.number().optional(),
        stressLevel: z.number().optional(),
        painLevel: z.number().optional(),
        painLocation: z.string().optional(),
        mood: z.enum(["great", "good", "neutral", "bad", "terrible"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createHealthRecord({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
  }),

  // ─── Diagnostics ─────────────────────────────────────────────────
  diagnosis: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDiagnostics(ctx.user.id);
    }),
    save: protectedProcedure
      .input(z.object({
        timePeriod: z.enum(["20years", "10years", "5years", "3years", "current"]),
        checklistData: z.record(z.string(), z.number()),
        inflammationScore: z.number().optional(),
        cardiopulmonaryScore: z.number().optional(),
        digestiveScore: z.number().optional(),
        musculoskeletalScore: z.number().optional(),
        mentalHealthScore: z.number().optional(),
        overallScore: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveDiagnostic({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
  }),

  // ─── Missions ────────────────────────────────────────────────────
  missions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserMissions(ctx.user.id);
    }),
    generate: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await db.getProfile(ctx.user.id);
      const grade = profile?.memberGrade || "free";
      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: `당신은 GLWA 웰니스 건강 미션 생성기입니다. 사용자의 건강 상태에 맞는 미션 2개를 JSON 배열로 생성하세요. 각 미션은 title, description, category (breathing/rest/posture/stretching/mental/exercise/nutrition 중 하나), difficulty (beginner/intermediate/advanced 중 하나) 필드를 포함해야 합니다.` },
            { role: "user", content: `회원 등급: ${grade}, 체질: ${profile?.constitutionType || "미분석"}. 이 회원에게 맞는 건강 미션 2개를 생성해주세요.` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "missions", strict: true,
              schema: {
                type: "object",
                properties: { missions: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, category: { type: "string" }, difficulty: { type: "string" } }, required: ["title", "description", "category", "difficulty"], additionalProperties: false } } },
                required: ["missions"], additionalProperties: false,
              },
            },
          },
        });
        const content = result.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "");
        const missions = parsed.missions || [];
        const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        for (const m of missions) {
          await db.createMission({ userId: ctx.user.id, title: m.title, description: m.description, category: m.category as any, difficulty: m.difficulty as any, dueDate, status: "pending" });
        }
      } catch (e) {
        const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        await db.createMission({ userId: ctx.user.id, title: "5분 복식호흡 훈련", description: "편안한 자세에서 5분간 복식호흡을 실시하세요.", category: "breathing", difficulty: "beginner", dueDate, status: "pending" });
        await db.createMission({ userId: ctx.user.id, title: "10분 스트레칭 루틴", description: "목, 어깨, 허리를 중심으로 10분간 스트레칭을 실시하세요.", category: "stretching", difficulty: "beginner", dueDate, status: "pending" });
      }
      return { success: true };
    }),
    submit: protectedProcedure
      .input(z.object({ missionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfile(ctx.user.id);
        const gradePayback: Record<string, number> = { free: 50, standard: 60, vip: 70, platinum: 100 };
        const maxPayback = gradePayback[profile?.memberGrade || "free"] || 50;
        const completionRate = Math.floor(Math.random() * 30) + 70;
        const paybackRate = Math.round((completionRate / 100) * maxPayback);
        await db.updateMission(input.missionId, { status: "completed", completionRate, paybackRate });
        return { success: true, completionRate, paybackRate };
      }),
  }),

  // ─── Goals ───────────────────────────────────────────────────────
  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => { return db.getUserGoals(ctx.user.id); }),
    create: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), targetValue: z.number().optional(), unit: z.string().optional(), category: z.string().optional(), deadline: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { await db.createGoal({ userId: ctx.user.id, ...input }); return { success: true }; }),
    update: protectedProcedure
      .input(z.object({ goalId: z.number(), currentValue: z.number().optional(), status: z.enum(["active", "completed", "paused", "cancelled"]).optional() }))
      .mutation(async ({ ctx, input }) => { const { goalId, ...data } = input; await db.updateGoal(goalId, data); return { success: true }; }),
  }),

  // ─── Chat ────────────────────────────────────────────────────────
  chat: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => { return db.getChatHistory(ctx.user.id); }),
    send: protectedProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.string(), content: z.string() })) }))
      .mutation(async ({ ctx, input }) => {
        const lastUserMsg = input.messages.filter(m => m.role === "user").pop();
        if (lastUserMsg) { await db.saveChatMessage({ userId: ctx.user.id, role: "user", content: lastUserMsg.content }); }
        try {
          const result = await invokeLLM({ messages: input.messages.map(m => ({ role: m.role as any, content: m.content })) });
          const content = result.choices[0]?.message?.content;
          const responseText = typeof content === "string" ? content : "죄송합니다. 응답을 생성할 수 없습니다.";
          await db.saveChatMessage({ userId: ctx.user.id, role: "assistant", content: responseText });
          return { content: responseText };
        } catch (e) {
          const fallback = "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
          await db.saveChatMessage({ userId: ctx.user.id, role: "assistant", content: fallback });
          return { content: fallback };
        }
      }),
  }),

  // ─── Programs ────────────────────────────────────────────────────
  programs: router({
    getProgress: protectedProcedure.query(async ({ ctx }) => { return db.getUserProgramProgress(ctx.user.id); }),
    startLesson: protectedProcedure
      .input(z.object({ stage: z.enum(["breathing", "rest", "posture", "stretching", "mental"]), lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => { await db.upsertProgramProgress(ctx.user.id, input.stage, input.lessonId); return { success: true }; }),
  }),

  // ─── Reminders ───────────────────────────────────────────────────
  reminders: router({
    list: protectedProcedure.query(async ({ ctx }) => { return db.getUserReminders(ctx.user.id); }),
    create: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), reminderType: z.enum(["medication", "exercise", "checkup", "water", "sleep", "custom"]), time: z.string(), days: z.array(z.string()).optional() }))
      .mutation(async ({ ctx, input }) => { await db.createReminder({ userId: ctx.user.id, ...input }); return { success: true }; }),
    update: protectedProcedure
      .input(z.object({ reminderId: z.number(), isActive: z.number().optional(), title: z.string().optional(), time: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { const { reminderId, ...data } = input; await db.updateReminder(reminderId, data); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ reminderId: z.number() }))
      .mutation(async ({ ctx, input }) => { await db.deleteReminder(input.reminderId); return { success: true }; }),
  }),

  // ═══════════════════════════════════════════════════════════════════
  // 쇼핑몰 (건강식품 몰)
  // ═══════════════════════════════════════════════════════════════════
  shop: router({
    // 카테고리
    getCategories: publicProcedure.query(async () => {
      return db.getCategories();
    }),
    createCategory: adminProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), imageUrl: z.string().optional(), sortOrder: z.number().optional() }))
      .mutation(async ({ input }) => { await db.createCategory(input); return { success: true }; }),

    // 상품
    getProducts: publicProcedure
      .input(z.object({ categoryId: z.number().optional() }).optional())
      .query(async ({ input }) => { return db.getProducts(input?.categoryId); }),
    getProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => { return db.getProductById(input.productId); }),
    createProduct: protectedProcedure
      .input(z.object({
        sellerId: z.number(), categoryId: z.number(), name: z.string(), description: z.string().optional(), detailDescription: z.string().optional(),
        price: z.number(), salePrice: z.number().optional(), imageUrl: z.string().optional(), images: z.array(z.string()).optional(),
        stock: z.number().optional(), tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => { await db.createProduct(input); return { success: true }; }),
    updateProduct: protectedProcedure
      .input(z.object({
        productId: z.number(), name: z.string().optional(), description: z.string().optional(), detailDescription: z.string().optional(),
        price: z.number().optional(), salePrice: z.number().optional(), imageUrl: z.string().optional(), images: z.array(z.string()).optional(),
        stock: z.number().optional(), tags: z.array(z.string()).optional(), isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => { const { productId, ...data } = input; await db.updateProduct(productId, data); return { success: true }; }),
    deleteProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input }) => { await db.deleteProduct(input.productId); return { success: true }; }),
    getSellerProducts: protectedProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => { return db.getSellerProducts(input.sellerId); }),

    // 장바구니
    getCart: protectedProcedure.query(async ({ ctx }) => { return db.getCartItems(ctx.user.id); }),
    addToCart: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().default(1) }))
      .mutation(async ({ ctx, input }) => { await db.addToCart(ctx.user.id, input.productId, input.quantity); return { success: true }; }),
    updateCartItem: protectedProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number() }))
      .mutation(async ({ input }) => { await db.updateCartItem(input.cartItemId, input.quantity); return { success: true }; }),
    removeCartItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => { await db.removeCartItem(input.cartItemId); return { success: true }; }),

    // 주문
    placeOrder: protectedProcedure
      .input(z.object({
        shippingName: z.string(), shippingPhone: z.string(), shippingAddress: z.string(), shippingMemo: z.string().optional(),
        paymentMethod: z.enum(["stripe", "kakaopay", "naverpay", "tosspay", "phone", "paypal"]).default("stripe"),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) throw new Error("장바구니가 비어있습니다.");
        const totalAmount = cartItems.reduce((sum, item) => {
          const price = item.product?.salePrice || item.product?.price || 0;
          return sum + price * item.quantity;
        }, 0);
        const orderNumber = `GLWA-${Date.now()}-${nanoid(6)}`;
        const orderId = await db.createOrder({
          userId: ctx.user.id, orderNumber, totalAmount, status: "pending",
          paymentMethod: input.paymentMethod,
          shippingName: input.shippingName, shippingPhone: input.shippingPhone,
          shippingAddress: input.shippingAddress, shippingMemo: input.shippingMemo,
        });
        for (const item of cartItems) {
          await db.addOrderItem({
            orderId: orderId as number, sellerId: (item.product as any)?.sellerId || 0, productId: item.productId,
            productName: item.product?.name || "", price: item.product?.salePrice || item.product?.price || 0,
            quantity: item.quantity,
          });
        }
        await db.clearCart(ctx.user.id);

        // Stripe 결제 세션 생성
        if (input.paymentMethod === "stripe") {
          try {
            const checkoutItems = cartItems.map(item => ({
              name: item.product?.name || "",
              price: item.product?.salePrice || item.product?.price || 0,
              quantity: item.quantity,
              imageUrl: (item.product as any)?.imageUrl || undefined,
            }));
            const session = await createCheckoutSession({
              items: checkoutItems, userId: ctx.user.id,
              userEmail: ctx.user.email || undefined,
              userName: ctx.user.name || undefined,
              orderNumber, origin: input.origin,
            });
            return { success: true, orderNumber, checkoutUrl: session.url };
          } catch (e) {
            console.error("[Stripe] Checkout session error:", e);
            return { success: true, orderNumber, checkoutUrl: null };
          }
        }
        return { success: true, orderNumber, checkoutUrl: null };
      }),
    getOrders: protectedProcedure.query(async ({ ctx }) => { return db.getUserOrders(ctx.user.id); }),
    getOrderItems: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => { return db.getOrderItems(input.orderId); }),

    // 리뷰
    getReviews: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => { return db.getProductReviews(input.productId); }),
    createReview: protectedProcedure
      .input(z.object({ productId: z.number(), rating: z.number().min(1).max(5), content: z.string().optional(), imageUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { await db.createProductReview({ userId: ctx.user.id, ...input }); return { success: true }; }),
  }),

  // ═══════════════════════════════════════════════════════════════════
  // 커뮤니티
  // ═══════════════════════════════════════════════════════════════════
  community: router({
    // 게시판
    getPosts: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => { return db.getCommunityPosts(input?.category); }),
    getPost: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => { return db.getPostById(input.postId); }),
    createPost: protectedProcedure
      .input(z.object({
        category: z.enum(["free", "health_tip", "exercise", "nutrition", "question", "success_story"]),
        title: z.string(), content: z.string(), imageUrls: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createPost({ userId: ctx.user.id, authorName: ctx.user.name || "익명", ...input });
        return { success: true };
      }),
    deletePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => { await db.deletePost(input.postId); return { success: true }; }),

    // 댓글
    getComments: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => { return db.getPostComments(input.postId); }),
    createComment: protectedProcedure
      .input(z.object({ postId: z.number(), content: z.string(), parentId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.createComment({ userId: ctx.user.id, authorName: ctx.user.name || "익명", ...input });
        return { success: true };
      }),

    // 좋아요
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const liked = await db.togglePostLike(input.postId, ctx.user.id);
        return { liked };
      }),
    isLiked: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => { return db.isPostLiked(input.postId, ctx.user.id); }),

    // 정보공유방
    getInfoMessages: publicProcedure
      .input(z.object({ limit: z.number().default(100) }).optional())
      .query(async ({ input }) => { return db.getInfoRoomMessages(input?.limit || 100); }),
    sendInfoMessage: protectedProcedure
      .input(z.object({ content: z.string(), imageUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.createInfoRoomMessage({ userId: ctx.user.id, authorName: ctx.user.name || "익명", ...input });
        return { success: true };
      }),

    // 개인 갤러리
    getGallery: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        if (input?.userId) {
          return db.getUserGallery(input.userId, ctx.user?.id);
        }
        return db.getPublicGallery();
      }),
    addGalleryItem: protectedProcedure
      .input(z.object({ mediaType: z.enum(["photo", "video"]).default("photo"), mediaUrl: z.string(), thumbnailUrl: z.string().optional(), caption: z.string().optional(), isPublic: z.number().default(1) }))
      .mutation(async ({ ctx, input }) => { await db.createGalleryItem({ userId: ctx.user.id, ...input }); return { success: true }; }),
    updateGalleryItem: protectedProcedure
      .input(z.object({ itemId: z.number(), caption: z.string().optional(), isPublic: z.number().optional() }))
      .mutation(async ({ input }) => { const { itemId, ...data } = input; await db.updateGalleryItem(itemId, data); return { success: true }; }),
    deleteGalleryItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => { await db.deleteGalleryItem(input.itemId); return { success: true }; }),

    // 스토리
    getStories: publicProcedure.query(async () => { return db.getPublicStories(); }),
    getMyStories: protectedProcedure.query(async ({ ctx }) => { return db.getUserStories(ctx.user.id); }),
    createStory: protectedProcedure
      .input(z.object({ content: z.string(), imageUrl: z.string().optional(), isPublic: z.number().default(1) }))
      .mutation(async ({ ctx, input }) => { await db.createStory({ userId: ctx.user.id, authorName: ctx.user.name || "익명", ...input }); return { success: true }; }),
    deleteStory: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ input }) => { await db.deleteStory(input.storyId); return { success: true }; }),
  }),

  // ═══════════════════════════════════════════════════════════════════
  // 셀러 (몰인몰)
  // ═══════════════════════════════════════════════════════════════════
  seller: router({
    // 셀러 등록 신청
    applyStore: protectedProcedure
      .input(z.object({
        storeName: z.string(), storeDescription: z.string().optional(),
        businessNumber: z.string().optional(), contactPhone: z.string().optional(), contactEmail: z.string().optional(),
        bankName: z.string().optional(), bankAccount: z.string().optional(), bankHolder: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => { await db.createSeller({ userId: ctx.user.id, ...input }); return { success: true }; }),
    // 내 셀러 정보
    myStore: protectedProcedure.query(async ({ ctx }) => { return db.getSellerByUserId(ctx.user.id); }),
    // 내 상품 목록
    products: protectedProcedure.query(async ({ ctx }) => {
      const seller = await db.getSellerByUserId(ctx.user.id);
      if (!seller) return [];
      return db.getSellerProducts(seller.id);
    }),
    // 내 주문 아이템
    orderItems: protectedProcedure.query(async ({ ctx }) => {
      const seller = await db.getSellerByUserId(ctx.user.id);
      if (!seller) return [];
      return db.getSellerOrderItems(seller.id);
    }),
    // 내 매출 통계
    stats: protectedProcedure.query(async ({ ctx }) => {
      const seller = await db.getSellerByUserId(ctx.user.id);
      if (!seller) return { totalSales: 0, totalOrders: 0, pendingSettlement: 0 };
      return db.getSellerStats(seller.id);
    }),
    // 셀러 스토어 목록 (공개)
    getStores: publicProcedure.query(async () => { return db.getApprovedSellers(); }),
    // 셀러 스토어 상세
    getStore: publicProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => { return db.getSellerById(input.sellerId); }),
    // 셀러 주문 관리
    getSellerOrders: protectedProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => { return db.getSellerOrderItems(input.sellerId); }),
    // 셀러 정산 내역
    getSettlements: protectedProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => { return db.getSellerSettlements(input.sellerId); }),
    // 셀러 매출 통계
    getStats: protectedProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => { return db.getSellerStats(input.sellerId); }),
    // 관리자: 셀러 목록
    getAllSellers: adminProcedure.query(async () => { return db.getAllSellers(); }),
    // 관리자: 셀러 승인/거절
    updateSellerStatus: adminProcedure
      .input(z.object({ sellerId: z.number(), status: z.enum(["approved", "rejected", "suspended"]) }))
      .mutation(async ({ input }) => { await db.updateSellerStatus(input.sellerId, input.status); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
