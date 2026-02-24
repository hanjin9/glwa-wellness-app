import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { z } from "zod";
import * as db from "./db";
import * as rewards from "./pointRewards";
import { nanoid } from "nanoid";
import { createCheckoutSession } from "./stripe";
import { TRPCError } from "@trpc/server";
import { fetchBitcoinData, formatBitcoinData } from "./bitcoin";
import { analyzeBitcoinMarket, formatBitcoinBrief } from "./bitcoinAnalysis";

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
        timePeriod: z.enum(["20years", "10years", "5years", "3years", "2years", "current"]),
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
    list: protectedProcedure
      .input(z.object({ period: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserMissions(ctx.user.id, input?.period);
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getMissionStats(ctx.user.id);
    }),
    generate: protectedProcedure
      .input(z.object({ period: z.string().optional() }).optional())
      .mutation(async ({ ctx, input }) => {
      const profile = await db.getProfile(ctx.user.id);
      const grade = profile?.memberGrade || "silver";
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
        const periodDays: Record<string, number> = { daily: 1, weekly: 7, biweekly: 14, monthly: 30, quarterly: 90, semiannual: 180, annual: 365 };
        const period = input?.period || 'daily';
        const days = periodDays[period] || 1;
        const dueDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
        const pointRewards: Record<string, number> = { daily: 10, weekly: 50, biweekly: 100, monthly: 200, quarterly: 500, semiannual: 1000, annual: 2000 };
        const reward = pointRewards[period] || 10;
        for (const m of missions) {
          await db.createMission({ userId: ctx.user.id, title: m.title, description: m.description, category: m.category as any, difficulty: m.difficulty as any, dueDate, status: "pending", missionPeriod: period as any, pointReward: reward });
        }
      } catch (e) {
        const period = input?.period || 'daily';
        const periodDays: Record<string, number> = { daily: 1, weekly: 7, biweekly: 14, monthly: 30, quarterly: 90, semiannual: 180, annual: 365 };
        const days = periodDays[period] || 1;
        const dueDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
        const pointRewards: Record<string, number> = { daily: 10, weekly: 50, biweekly: 100, monthly: 200, quarterly: 500, semiannual: 1000, annual: 2000 };
        const reward = pointRewards[period] || 10;
        await db.createMission({ userId: ctx.user.id, title: "5분 복식호흡 훈련", description: "편안한 자세에서 5분간 복식호흡을 실시하세요.", category: "breathing", difficulty: "beginner", dueDate, status: "pending", missionPeriod: period as any, pointReward: reward });
        await db.createMission({ userId: ctx.user.id, title: "10분 스트레칭 루틴", description: "목, 어깨, 허리를 중심으로 10분간 스트레칭을 실시하세요.", category: "stretching", difficulty: "beginner", dueDate, status: "pending", missionPeriod: period as any, pointReward: reward });
      }
      return { success: true };
    }),
    submit: protectedProcedure
      .input(z.object({ missionId: z.number(), photoBase64: z.string().optional(), photoContentType: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfile(ctx.user.id);
        const gradePayback: Record<string, number> = {
          silver: 50, gold: 55, blue_sapphire: 60, green_emerald: 65,
          diamond: 70, blue_diamond: 80, platinum: 90, black_platinum: 100,
        };
        const maxPayback = gradePayback[profile?.memberGrade || "silver"] || 50;
        const completionRate = Math.floor(Math.random() * 30) + 70;
        const paybackRate = Math.round((completionRate / 100) * maxPayback);
        
        // 사진 업로드 (S3)
        let photoUrl: string | undefined;
        if (input.photoBase64) {
          try {
            const buffer = Buffer.from(input.photoBase64, "base64");
            const ext = (input.photoContentType || "image/jpeg").split("/")[1] || "jpg";
            const key = `mission-photos/${ctx.user.id}/${input.missionId}-${nanoid(8)}.${ext}`;
            const { url } = await storagePut(key, buffer, input.photoContentType || "image/jpeg");
            photoUrl = url;
          } catch (e) {
            console.warn("[Mission] Photo upload failed:", e);
          }
        }
        
        await db.updateMission(input.missionId, { status: "completed", completionRate, paybackRate });
        
        // 관리자에게 미션 인증 알림 발송
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: `✅ 미션 인증 완료`,
            content: `회원명: ${ctx.user.name || "미입력"}\n미션ID: ${input.missionId}\n완수율: ${completionRate}%\n페이백: ${paybackRate}%${photoUrl ? `\n인증사진: ${photoUrl}` : ""}\n\n관리자 페이지에서 확인해주세요.`,
          });
        } catch (e) {
          console.warn("[Mission] Notification failed:", e);
        }
        
        return { success: true, completionRate, paybackRate, photoUrl };
      }),
    // 필수 미션 인증 사진 업로드 + 관리자 알림
    submitRequiredMission: protectedProcedure
      .input(z.object({ missionTitle: z.string(), difficulty: z.string().optional(), photoBase64: z.string(), photoContentType: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        let photoUrl = "";
        try {
          const buffer = Buffer.from(input.photoBase64, "base64");
          const ext = (input.photoContentType || "image/jpeg").split("/")[1] || "jpg";
          const key = `required-mission-photos/${ctx.user.id}/${nanoid(8)}.${ext}`;
          const { url } = await storagePut(key, buffer, input.photoContentType || "image/jpeg");
          photoUrl = url;
        } catch (e) {
          console.warn("[RequiredMission] Photo upload failed:", e);
        }
        
        // 관리자에게 알림
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: `📸 필수 미션 인증 제출`,
            content: `회원명: ${ctx.user.name || "미입력"}\n미션: ${input.missionTitle}\n난이도: ${input.difficulty || "일반"}${photoUrl ? `\n인증사진: ${photoUrl}` : ""}\n\n관리자 페이지에서 확인 후 승인해주세요.`,
          });
        } catch (e) {
          console.warn("[RequiredMission] Notification failed:", e);
        }
        
        return { success: true, photoUrl };
      }),
  }),

  // ─── VIP Access Check ─────────────────────────────────────────────
  vip: router({
    checkAccess: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfile(ctx.user.id);
      const grade = profile?.memberGrade || "silver";
      // diamond 이상 등급만 VIP 라운지 접근 가능
      const vipGrades = ["diamond", "blue_diamond", "platinum", "black_platinum"];
      const hasAccess = vipGrades.includes(grade);
      return { hasAccess, currentGrade: grade, requiredGrade: "diamond" };
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
      .input(z.object({ stage: z.enum(["breathing", "rest", "posture", "stretching", "mental", "breathing_awareness", "rest_peace", "good_sleep", "stretching_yoga", "meditation", "posture_walking", "exercise_social", "food_therapy", "hormone_bone", "return_breath"]), lessonId: z.number() }))
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

  // ═══════════════════════════════════════════════════════════════════
  // 멤버십 시스템
  // ═══════════════════════════════════════════════════════════════════
  membership: router({
    // 멤버십 등급 목록
    getTiers: publicProcedure.query(async () => {
      return db.getMembershipTiers();
    }),
    // 내 멤버십 현황
    getMyMembership: protectedProcedure.query(async ({ ctx }) => {
      let membership = await db.getUserMembership(ctx.user.id);
      if (!membership) {
        // 자동으로 실버(무료) 멤버십 생성
        await db.upsertUserMembership(ctx.user.id, { tier: "silver" });
        membership = await db.getUserMembership(ctx.user.id);
      }
      const tierInfo = membership ? await db.getMembershipTierByName(membership.tier) : null;
      return { membership, tierInfo };
    }),
    // 멤버십 업그레이드
    upgrade: protectedProcedure
      .input(z.object({ tier: z.enum(["gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]) }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserMembership(ctx.user.id, { tier: input.tier });
        // 업그레이드 보너스 포인트 (등급별 차등)
        const bonusMap: Record<string, number> = {
          gold: 1000, blue_sapphire: 3000, green_emerald: 5000,
          diamond: 10000, blue_diamond: 20000, platinum: 50000, black_platinum: 100000,
        };
        const bonusPoints = bonusMap[input.tier] || 1000;
        const membership = await db.getUserMembership(ctx.user.id);
        const balance = (membership?.currentPoints || 0) + bonusPoints;
        await db.addPointsTransaction({
          userId: ctx.user.id,
          type: "earn",
          amount: bonusPoints,
          balance,
          source: "tier_bonus",
          description: `${input.tier} 멤버십 업그레이드 보너스`,
        });
        return { success: true };
      }),
    // 멤버십 업그레이드 신청 (본사에 알림)
    requestUpgrade: protectedProcedure
      .input(z.object({ tier: z.enum(["gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]) }))
      .mutation(async ({ ctx, input }) => {
        const { notifyOwner } = await import("./_core/notification");
        const tierNames: Record<string, string> = {
          gold: "골드", blue_sapphire: "블루사파이어", green_emerald: "그린에메랄드",
          diamond: "다이아몬드", blue_diamond: "블루다이아몬드", platinum: "플래티넘", black_platinum: "블랙플래티넘",
        };
        await notifyOwner({
          title: `💎 멤버십 업그레이드 신청`,
          content: `회원명: ${ctx.user.name || "미입력"}\n회원ID: ${ctx.user.id}\n신청 등급: ${tierNames[input.tier] || input.tier}\n\n관리자 페이지에서 해당 회원의 등급을 변경해주세요.`,
        });
        return { success: true };
      }),
  }),

  // ─── 포인트 ─────────────────────────────────────────────────────
  points: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const membership = await db.getUserMembership(ctx.user.id);
      return {
        currentPoints: membership?.currentPoints || 0,
        totalEarned: membership?.totalPointsEarned || 0,
        totalUsed: membership?.totalPointsUsed || 0,
        totalMileage: membership?.totalMileage || 0,
      };
    }),
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getPointsHistory(ctx.user.id, input?.limit || 50);
      }),
    // 포인트 적립 (관리자 또는 시스템)
    earn: protectedProcedure
      .input(z.object({
        amount: z.number().min(1),
        source: z.enum(["purchase", "mission", "event", "referral", "review", "attendance", "signup_bonus", "tier_bonus", "admin"]),
        description: z.string().optional(),
        referenceId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const membership = await db.getUserMembership(ctx.user.id);
        const tierInfo = membership ? await db.getMembershipTierByName(membership.tier) : null;
        const multiplier = tierInfo?.pointMultiplier || 1.0;
        const finalAmount = Math.round(input.amount * multiplier);
        const balance = (membership?.currentPoints || 0) + finalAmount;
        await db.addPointsTransaction({
          userId: ctx.user.id,
          type: "earn",
          amount: finalAmount,
          balance,
          source: input.source,
          description: input.description || `${input.source} 포인트 적립`,
          referenceId: input.referenceId,
        });
        return { earned: finalAmount, balance };
      }),
    // 포인트 사용
    use: protectedProcedure
      .input(z.object({
        amount: z.number().min(1),
        description: z.string().optional(),
        referenceId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const membership = await db.getUserMembership(ctx.user.id);
        const currentPoints = membership?.currentPoints || 0;
        if (currentPoints < input.amount) {
          throw new Error("포인트가 부족합니다.");
        }
        const balance = currentPoints - input.amount;
        await db.addPointsTransaction({
          userId: ctx.user.id,
          type: "use",
          amount: -input.amount,
          balance,
          source: "shop_payment",
          description: input.description || "포인트 사용",
          referenceId: input.referenceId,
        });
        return { used: input.amount, balance };
      }),
  }),

  // ─── 쿠폰 ─────────────────────────────────────────────────────
  coupon: router({
    getMyCoupons: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCoupons(ctx.user.id);
    }),
    getAvailable: publicProcedure.query(async () => {
      return db.getActiveCoupons();
    }),
    // 쿠폰 코드로 등록
    register: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const coupon = await db.getCouponByCode(input.code);
        if (!coupon) throw new Error("유효하지 않은 쿠폰 코드입니다.");
        if (coupon.requiredTier) {
          const membership = await db.getUserMembership(ctx.user.id);
          const tierOrder = ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"];
          const userTierIdx = tierOrder.indexOf(membership?.tier || "silver");
          const requiredIdx = tierOrder.indexOf(coupon.requiredTier);
          if (userTierIdx < requiredIdx) throw new Error(`${coupon.requiredTier} 등급 이상만 사용 가능합니다.`);
        }
        const expiresAt = coupon.endDate || undefined;
        await db.grantCouponToUser(ctx.user.id, coupon.id, expiresAt);
        return { success: true, couponName: coupon.name };
      }),
    // 관리자: 쿠폰 생성
    create: adminProcedure
      .input(z.object({
        code: z.string(),
        name: z.string(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number(),
        minOrderAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        requiredTier: z.enum(["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]).optional(),
        totalQuantity: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCoupon(input as any);
        return { success: true };
      }),
  }),

  // ─── 이벤트 ────────────────────────────────────────────────────
  event: router({
    getActive: publicProcedure.query(async () => {
      return db.getActiveEvents();
    }),
    getFeatured: publicProcedure.query(async () => {
      return db.getFeaturedEvents();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getEventById(input.id);
      }),
    join: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const event = await db.getEventById(input.eventId);
        if (!event) throw new Error("이벤트를 찾을 수 없습니다.");
        if (event.requiredTier) {
          const membership = await db.getUserMembership(ctx.user.id);
          const tierOrder = ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"];
          const userTierIdx = tierOrder.indexOf(membership?.tier || "silver");
          const requiredIdx = tierOrder.indexOf(event.requiredTier);
          if (userTierIdx < requiredIdx) throw new Error(`${event.requiredTier} 등급 이상만 참여 가능합니다.`);
        }
        await db.joinEvent(input.eventId, ctx.user.id);
        return { success: true };
      }),
    getMyParticipations: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserEventParticipations(ctx.user.id);
    }),
    // 관리자: 이벤트 생성
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        eventType: z.enum(["promotion", "seasonal", "tier_exclusive", "referral", "challenge", "special"]),
        requiredTier: z.enum(["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]).optional(),
        rewardType: z.enum(["points", "coupon", "product", "mileage", "badge"]).optional(),
        rewardValue: z.number().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        maxParticipants: z.number().optional(),
        isFeatured: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createEvent(input as any);
        return { success: true };
      }),
  }),

  // ─── 마일리지 ──────────────────────────────────────────────────
  mileage: router({
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getMileageHistory(ctx.user.id, input?.limit || 50);
      }),
  }),

  // ─── Wallet (통합 지갑) ──────────────────────────────────────────
  wallet: router({
    getMyWallet: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrCreateWallet(ctx.user.id);
    }),
    getTransactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getWalletTransactions(ctx.user.id, input?.limit || 20);
      }),
    charge: protectedProcedure
      .input(z.object({
        currency: z.enum(["point", "cash", "coin"]),
        amount: z.number().positive(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.chargeWallet(ctx.user.id, input.currency, input.amount, input.description || "충전");
        return result;
      }),
    pay: protectedProcedure
      .input(z.object({
        currency: z.enum(["point", "cash", "coin"]),
        amount: z.number().positive(),
        description: z.string(),
        paymentMethod: z.string(),
        referenceId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.payFromWallet(ctx.user.id, input.currency, input.amount, input.description, input.paymentMethod, input.referenceId);
      }),
   }),

  // ─── Voice & File Upload ──────────────────────────────────────
  voice: router({
    transcribe: protectedProcedure
      .input(z.object({ audioUrl: z.string(), language: z.string().optional() }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({ audioUrl: input.audioUrl, language: input.language || "ko" });
        if ("error" in result) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `${result.error}${result.details ? ': ' + result.details : ''}` });
        }
        return { text: result.text, language: result.language };
      }),
  }),
  upload: router({
    getPresignedUrl: protectedProcedure
      .input(z.object({ fileName: z.string(), contentType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const ext = input.fileName.split(".").pop() || "bin";
        const key = `chat-attachments/${ctx.user.id}/${nanoid()}.${ext}`;
        return { key, contentType: input.contentType };
      }),
    complete: protectedProcedure
      .input(z.object({ key: z.string(), base64Data: z.string(), contentType: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const { url } = await storagePut(input.key, buffer, input.contentType);
        return { url };
      }),
  }),
  song: router({
    getToday: publicProcedure.query(async () => {
      const today = new Date().toISOString().split('T')[0];
      return db.getSongOfTheDay(today);
    }),
    getByDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        return db.getSongOfTheDay(input.date);
      }),
  }),
  notification: router({
    getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserMentalHealthNotifications(ctx.user.id);
    }),
    createNotification: protectedProcedure
      .input(z.object({
        notificationTime: z.string(),
        musicGenre: z.string().optional(),
        isEnabled: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createMentalHealthNotification({
          userId: ctx.user.id,
          notificationTime: input.notificationTime,
          musicGenre: input.musicGenre || null,
          isEnabled: input.isEnabled !== undefined ? input.isEnabled : 1,
        });
      }),
    updateNotification: protectedProcedure
      .input(z.object({
        notificationTime: z.string(),
        musicGenre: z.string().optional(),
        isEnabled: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateMentalHealthNotification(ctx.user.id, input.notificationTime, {
          musicGenre: input.musicGenre || null,
          isEnabled: input.isEnabled,
        });
      }),
  }),
  music: router({
    getByGenre: publicProcedure
      .input(z.object({ genre: z.string() }))
      .query(async ({ input }) => {
        const { getMusicByGenre } = await import('./music-library');
        return getMusicByGenre(input.genre);
      }),
    getRandomByGenre: publicProcedure
      .input(z.object({ genre: z.string() }))
      .query(async ({ input }) => {
        const { getRandomMusicByGenre } = await import('./music-library');
        return getRandomMusicByGenre(input.genre);
      }),
    getAllGenres: publicProcedure.query(async () => {
      const { getAllGenres } = await import('./music-library');
      return getAllGenres();
    }),
    getAll: publicProcedure.query(async () => {
      const { MUSIC_LIBRARY } = await import('./music-library');
      return MUSIC_LIBRARY;
    }),
  }),
  // ─── Health Sync (건강 데이터 자동 연동) ───────────────────────────
  healthSync: router({
    createToken: protectedProcedure
      .input(z.object({ platform: z.enum(["samsung_health", "apple_health", "google_fit", "manual"]) }))
      .mutation(async ({ ctx, input }) => {
        const token = nanoid(32);
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { healthSyncTokens } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        await database.update(healthSyncTokens).set({ isActive: 0 }).where(and(eq(healthSyncTokens.userId, ctx.user.id), eq(healthSyncTokens.platform, input.platform)));
        await database.insert(healthSyncTokens).values({ userId: ctx.user.id, syncToken: token, platform: input.platform, consentGivenAt: new Date() });
        return { token, webhookUrl: `/api/health-sync/webhook?token=${token}` };
      }),
    getMyTokens: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) return [];
      const { healthSyncTokens } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      return database.select().from(healthSyncTokens).where(eq(healthSyncTokens.userId, ctx.user.id));
    }),
    deactivateToken: protectedProcedure
      .input(z.object({ tokenId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { healthSyncTokens } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        await database.update(healthSyncTokens).set({ isActive: 0 }).where(and(eq(healthSyncTokens.id, input.tokenId), eq(healthSyncTokens.userId, ctx.user.id)));
        return { success: true };
      }),
    getSyncedData: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) return [];
        const { healthSyncData } = await import("../drizzle/schema");
        const { eq, desc, gte, and } = await import("drizzle-orm");
        const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
        return database.select().from(healthSyncData).where(and(eq(healthSyncData.userId, ctx.user.id), gte(healthSyncData.recordedAt, since))).orderBy(desc(healthSyncData.recordedAt)).limit(500);
      }),
    requestAiAnalysis: protectedProcedure
      .input(z.object({ period: z.enum(["daily", "weekly", "monthly"]).default("weekly") }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { healthSyncData, aiHealthFeedback, healthRecords } = await import("../drizzle/schema");
        const { eq, desc, gte, and } = await import("drizzle-orm");
        const days = input.period === "daily" ? 1 : input.period === "weekly" ? 7 : 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const syncedData = await database.select().from(healthSyncData).where(and(eq(healthSyncData.userId, ctx.user.id), gte(healthSyncData.recordedAt, since))).orderBy(desc(healthSyncData.recordedAt)).limit(200);
        const manualRecords = await database.select().from(healthRecords).where(and(eq(healthRecords.userId, ctx.user.id), gte(healthRecords.recordDate, since.toISOString().slice(0, 10)))).limit(30);
        if (syncedData.length === 0 && manualRecords.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "분석할 건강 데이터가 없습니다. 건강 데이터를 먼저 동기화하거나 수동으로 입력해주세요." });
        }
        const dataSummary = JSON.stringify({ syncedData: syncedData.slice(0, 50), manualRecords: manualRecords.slice(0, 10) });
        const response = await invokeLLM({
          messages: [
            { role: "system", content: `당신은 GLWA 글로벌 리더스 웰니스 매니저의 AI 건강 분석 전문가입니다. 사용자의 건강 데이터를 분석하여 한국어로 맞춤형 피드백을 제공합니다. 분석 기간: ${input.period}. 반드시 JSON 형식으로 응답하세요.` },
            { role: "user", content: `다음 건강 데이터를 분석해주세요:\n${dataSummary}\n\nJSON 형식으로 응답: { "summary": "전체 요약", "recommendations": ["추천1", "추천2", ...], "riskAlerts": ["경고", ...] 또는 빈 배열, "score": 0-100 건강 점수 }` }
          ],
          response_format: { type: "json_schema", json_schema: { name: "health_analysis", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, recommendations: { type: "array", items: { type: "string" } }, riskAlerts: { type: "array", items: { type: "string" } }, score: { type: "number" } }, required: ["summary", "recommendations", "riskAlerts", "score"], additionalProperties: false } } }
        });
        const analysis = JSON.parse((response.choices[0].message.content as string) || "{}");
        const today = new Date().toISOString().slice(0, 10);
        await database.insert(aiHealthFeedback).values({ userId: ctx.user.id, feedbackDate: today, analysisType: input.period, summary: analysis.summary, recommendations: analysis.recommendations, riskAlerts: analysis.riskAlerts, dataSnapshot: { score: analysis.score, period: input.period, dataCount: syncedData.length + manualRecords.length } });
        return analysis;
      }),
    getFeedbackHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) return [];
        const { aiHealthFeedback } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        return database.select().from(aiHealthFeedback).where(eq(aiHealthFeedback.userId, ctx.user.id)).orderBy(desc(aiHealthFeedback.createdAt)).limit(input.limit);
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════
  // 관리자 대시보드
  // ═══════════════════════════════════════════════════════════════════
  admin: router({
    getDashboardStats: adminProcedure.query(async () => {
      const database = await db.getDb();
      if (!database) return null;
      const { users, orders, memberProfiles, healthRecords, adminNotifications } = await import("../drizzle/schema");
      const { count, sum, eq, gte, and } = await import("drizzle-orm");
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const [totalUsers] = await database.select({ count: count() }).from(users);
      const [totalOrders] = await database.select({ count: count() }).from(orders);
      const [monthlyRevenue] = await database.select({ total: sum(orders.totalAmount) }).from(orders).where(and(gte(orders.createdAt, thirtyDaysAgo), eq(orders.paymentStatus, "completed")));
      const [todayRecords] = await database.select({ count: count() }).from(healthRecords).where(eq(healthRecords.recordDate, today));
      const [unreadNotifs] = await database.select({ count: count() }).from(adminNotifications).where(eq(adminNotifications.isRead, 0));
      const [urgentNotifs] = await database.select({ count: count() }).from(adminNotifications).where(and(eq(adminNotifications.isRead, 0), eq(adminNotifications.category, "urgent")));
      const [weeklyNewUsers] = await database.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo));
      const gradeStats = await database.select({ grade: memberProfiles.memberGrade, count: count() }).from(memberProfiles).groupBy(memberProfiles.memberGrade);
      return { totalUsers: totalUsers?.count || 0, totalOrders: totalOrders?.count || 0, monthlyRevenue: Number(monthlyRevenue?.total || 0), todayHealthRecords: todayRecords?.count || 0, unreadNotifications: unreadNotifs?.count || 0, urgentNotifications: urgentNotifs?.count || 0, weeklyNewUsers: weeklyNewUsers?.count || 0, gradeStats };
    }),

    getNotifications: adminProcedure
      .input(z.object({ category: z.enum(["all", "urgent", "important", "normal", "low"]).default("all"), readStatus: z.enum(["all", "unread", "read"]).default("all"), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const database = await db.getDb();
        if (!database) return { items: [], total: 0 };
        const { adminNotifications } = await import("../drizzle/schema");
        const { eq, and, desc, count } = await import("drizzle-orm");
        const conditions: any[] = [eq(adminNotifications.isArchived, 0)];
        if (input.category !== "all") conditions.push(eq(adminNotifications.category, input.category));
        if (input.readStatus === "unread") conditions.push(eq(adminNotifications.isRead, 0));
        if (input.readStatus === "read") conditions.push(eq(adminNotifications.isRead, 1));
        const where = conditions.length > 1 ? and(...conditions) : conditions[0];
        const items = await database.select().from(adminNotifications).where(where).orderBy(desc(adminNotifications.createdAt)).limit(input.limit).offset(input.offset);
        const [totalResult] = await database.select({ count: count() }).from(adminNotifications).where(where);
        return { items, total: totalResult?.count || 0 };
      }),

    markNotificationRead: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { adminNotifications } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await database.update(adminNotifications).set({ isRead: 1 }).where(eq(adminNotifications.id, input.id)); return true;
    }),

    markAllRead: adminProcedure.input(z.object({ category: z.enum(["all", "urgent", "important", "normal", "low"]).default("all") })).mutation(async ({ input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { adminNotifications } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      if (input.category === "all") { await database.update(adminNotifications).set({ isRead: 1 }).where(eq(adminNotifications.isRead, 0)); }
      else { await database.update(adminNotifications).set({ isRead: 1 }).where(and(eq(adminNotifications.isRead, 0), eq(adminNotifications.category, input.category))); }
      return true;
    }),

    archiveNotification: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { adminNotifications } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await database.update(adminNotifications).set({ isArchived: 1 }).where(eq(adminNotifications.id, input.id)); return true;
    }),

    getNotificationSettings: adminProcedure.query(async ({ ctx }) => {
      const database = await db.getDb(); if (!database) return [];
      const { adminNotificationSettings } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      return database.select().from(adminNotificationSettings).where(eq(adminNotificationSettings.adminUserId, ctx.user.id));
    }),

    updateNotificationSetting: adminProcedure
      .input(z.object({ category: z.enum(["urgent", "important", "normal", "low"]), enabled: z.boolean(), pipeline: z.enum(["instant", "batch_6h", "daily", "weekly"]) }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb(); if (!database) return false;
        const { adminNotificationSettings } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const existing = await database.select().from(adminNotificationSettings).where(and(eq(adminNotificationSettings.adminUserId, ctx.user.id), eq(adminNotificationSettings.category, input.category)));
        if (existing.length > 0) { await database.update(adminNotificationSettings).set({ enabled: input.enabled ? 1 : 0, pipeline: input.pipeline }).where(eq(adminNotificationSettings.id, existing[0].id)); }
        else { await database.insert(adminNotificationSettings).values({ adminUserId: ctx.user.id, category: input.category, enabled: input.enabled ? 1 : 0, pipeline: input.pipeline }); }
        return true;
      }),

    getFinancialStats: adminProcedure
      .input(z.object({ period: z.enum(["today", "week", "month", "year"]).default("month") }))
      .query(async ({ input }) => {
        const database = await db.getDb(); if (!database) return null;
        const { orders, sellerSettlements } = await import("../drizzle/schema");
        const { count, sum, eq, gte, and } = await import("drizzle-orm");
        const now = new Date();
        let startDate: Date;
        switch (input.period) { case "today": startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break; case "week": startDate = new Date(now.getTime() - 7 * 86400000); break; case "month": startDate = new Date(now.getTime() - 30 * 86400000); break; case "year": startDate = new Date(now.getTime() - 365 * 86400000); break; }
        const [totalRevenue] = await database.select({ total: sum(orders.totalAmount), count: count() }).from(orders).where(and(gte(orders.createdAt, startDate!), eq(orders.paymentStatus, "completed")));
        const [pendingOrders] = await database.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
        const [shippingOrders] = await database.select({ count: count() }).from(orders).where(eq(orders.status, "shipping"));
        const [refundedOrders] = await database.select({ count: count() }).from(orders).where(eq(orders.status, "refunded"));
        const [pendingSettlements] = await database.select({ total: sum(sellerSettlements.netAmount), count: count() }).from(sellerSettlements).where(eq(sellerSettlements.status, "pending"));
        const recentOrders = await database.select().from(orders).orderBy(orders.createdAt).limit(10);
        return { totalRevenue: Number(totalRevenue?.total || 0), totalOrderCount: totalRevenue?.count || 0, pendingOrders: pendingOrders?.count || 0, shippingOrders: shippingOrders?.count || 0, refundedOrders: refundedOrders?.count || 0, pendingSettlementAmount: Number(pendingSettlements?.total || 0), pendingSettlementCount: pendingSettlements?.count || 0, recentOrders };
      }),

    getMembers: adminProcedure
      .input(z.object({ search: z.string().default(""), grade: z.string().default("all"), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const database = await db.getDb(); if (!database) return { items: [], total: 0 };
        const { users, memberProfiles } = await import("../drizzle/schema");
        const { count, desc } = await import("drizzle-orm");
        const allUsers = await database.select().from(users).orderBy(desc(users.createdAt)).limit(input.limit).offset(input.offset);
        const [totalResult] = await database.select({ count: count() }).from(users);
        const profiles = await database.select().from(memberProfiles);
        const profileMap = new Map(profiles.map(p => [p.userId, p]));
        const items = allUsers.map(u => ({ ...u, profile: profileMap.get(u.id) || null }));
        return { items, total: totalResult?.count || 0 };
      }),

    updateMemberGrade: adminProcedure
      .input(z.object({ userId: z.number(), grade: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb(); if (!database) return false;
        const { memberProfiles, adminActivityLog } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await database.update(memberProfiles).set({ memberGrade: input.grade as any }).where(eq(memberProfiles.userId, input.userId));
        await database.insert(adminActivityLog).values({ adminUserId: ctx.user.id, action: "update_grade", targetType: "user", targetId: input.userId, details: `등급 변경: ${input.grade}` });
        return true;
      }),

    updateOrderStatus: adminProcedure
      .input(z.object({ orderId: z.number(), status: z.enum(["pending", "paid", "shipping", "delivered", "cancelled", "refunded"]) }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb(); if (!database) return false;
        const { orders, adminActivityLog } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await database.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
        await database.insert(adminActivityLog).values({ adminUserId: ctx.user.id, action: "update_order_status", targetType: "order", targetId: input.orderId, details: `상태 변경: ${input.status}` });
        return true;
      }),

    getActivityLog: adminProcedure.input(z.object({ limit: z.number().default(50) })).query(async ({ input }) => {
      const database = await db.getDb(); if (!database) return [];
      const { adminActivityLog } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return database.select().from(adminActivityLog).orderBy(desc(adminActivityLog.createdAt)).limit(input.limit);
    }),

    getAllOrders: adminProcedure
      .input(z.object({ status: z.string().default("all"), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const database = await db.getDb(); if (!database) return { items: [], total: 0 };
        const { orders } = await import("../drizzle/schema");
        const { eq, count, desc } = await import("drizzle-orm");
        let items; let totalResult;
        if (input.status === "all") { items = await database.select().from(orders).orderBy(desc(orders.createdAt)).limit(input.limit).offset(input.offset); [totalResult] = await database.select({ count: count() }).from(orders); }
        else { items = await database.select().from(orders).where(eq(orders.status, input.status as any)).orderBy(desc(orders.createdAt)).limit(input.limit).offset(input.offset); [totalResult] = await database.select({ count: count() }).from(orders).where(eq(orders.status, input.status as any)); }
        return { items, total: totalResult?.count || 0 };
      }),
    // ─── AI 분석 파이프라인 + 코칭 시스템 ─────────────────────────
    runAiAnalysis: adminProcedure.input(z.object({ userId: z.number(), type: z.enum(["daily", "weekly", "monthly", "alert"]).default("daily") })).mutation(async ({ input }) => {
      const database = await db.getDb(); if (!database) return null;
      const { healthRecords, memberProfiles, aiHealthAnalysis } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const records = await database.select().from(healthRecords).where(eq(healthRecords.userId, input.userId)).orderBy(desc(healthRecords.createdAt)).limit(30);
      const [profile] = await database.select().from(memberProfiles).where(eq(memberProfiles.userId, input.userId)).limit(1);
      const dataSnapshot = { records: records.slice(0, 10), profile: profile ? { gender: profile.gender, birthDate: profile.birthDate, height: profile.height, weight: profile.weight, constitutionType: profile.constitutionType } : null };
      const prompt = `당신은 전문 건강 분석 AI입니다. 아래 건강 데이터를 분석하여 JSON으로 응답하세요.\n환자 프로필: ${JSON.stringify(dataSnapshot.profile)}\n최근 건강 기록 (${records.length}건): ${JSON.stringify(records.slice(0, 10).map(r => ({ date: r.recordDate, bp: r.systolicBP ? r.systolicBP+"/"+r.diastolicBP : null, hr: r.heartRate, sugar: r.bloodSugar, weight: r.weight, exercise: r.exerciseMinutes, sleep: r.sleepHours, stress: r.stressLevel, mood: r.mood })))}\n다음 JSON 형식으로 응답: {"riskLevel": "normal|caution|warning|critical", "summary": "한국어 2-3줄 요약", "details": {"bloodPressure": "분석", "heartRate": "분석", "bloodSugar": "분석", "exercise": "분석", "sleep": "분석", "mental": "분석"}, "recommendations": ["권고1", "권고2", "권고3"]}`;
      try {
        const response = await invokeLLM({ messages: [{ role: "system", content: "건강 데이터 분석 전문 AI. JSON만 응답." }, { role: "user", content: prompt }] });
        const content = response.choices?.[0]?.message?.content as string || "{}";
        const parsed = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
        const [inserted] = await database.insert(aiHealthAnalysis).values({ userId: input.userId, analysisType: input.type, riskLevel: parsed.riskLevel || "normal", summary: parsed.summary || "분석 완료", details: parsed.details, recommendations: parsed.recommendations, dataSnapshot });
        return { id: inserted.insertId, ...parsed };
      } catch { return { riskLevel: "normal", summary: "데이터 부족으로 분석 불가", details: {}, recommendations: ["더 많은 건강 데이터를 기록해주세요"] }; }
    }),
    getAiAnalyses: adminProcedure.input(z.object({ userId: z.number().optional(), riskLevel: z.string().optional(), limit: z.number().default(50) })).query(async ({ input }) => {
      const database = await db.getDb(); if (!database) return [];
      const { aiHealthAnalysis, users } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      return database.select({ analysis: aiHealthAnalysis, userName: users.name }).from(aiHealthAnalysis).leftJoin(users, eq(aiHealthAnalysis.userId, users.id)).orderBy(desc(aiHealthAnalysis.createdAt)).limit(input.limit);
    }),
    addAdminNotes: adminProcedure.input(z.object({ analysisId: z.number(), notes: z.string() })).mutation(async ({ input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { aiHealthAnalysis } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await database.update(aiHealthAnalysis).set({ adminNotes: input.notes, isReviewedByAdmin: 1 }).where(eq(aiHealthAnalysis.id, input.analysisId));
      return true;
    }),
    sendCoaching: adminProcedure.input(z.object({ userId: z.number(), title: z.string(), content: z.string(), category: z.enum(["health_analysis", "exercise", "nutrition", "mental", "lifestyle", "motivation", "general"]).default("general"), analysisId: z.number().optional(), scheduledAt: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { coachingMessages } = await import("../drizzle/schema");
      const isScheduled = !!input.scheduledAt;
      await database.insert(coachingMessages).values({ userId: input.userId, coachId: ctx.user.id, type: isScheduled ? "scheduled" : "coach_manual", category: input.category, title: input.title, content: input.content, analysisId: input.analysisId, scheduledAt: isScheduled ? new Date(input.scheduledAt!) : null, sentAt: isScheduled ? null : new Date() });
      return true;
    }),
    getCoachingMessages: adminProcedure.input(z.object({ userId: z.number().optional(), type: z.string().optional(), limit: z.number().default(50) })).query(async ({ input }) => {
      const database = await db.getDb(); if (!database) return [];
      const { coachingMessages, users } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      return database.select({ msg: coachingMessages, userName: users.name }).from(coachingMessages).leftJoin(users, eq(coachingMessages.userId, users.id)).orderBy(desc(coachingMessages.createdAt)).limit(input.limit);
    }),
    createScheduledCoaching: adminProcedure.input(z.object({ title: z.string(), content: z.string(), category: z.enum(["health_analysis", "exercise", "nutrition", "mental", "lifestyle", "motivation", "general"]), scheduleType: z.enum(["once", "daily", "weekly", "monthly"]), scheduledAt: z.string(), targetGrade: z.string().optional(), targetUserIds: z.array(z.number()).optional() })).mutation(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { scheduledCoaching } = await import("../drizzle/schema");
      await database.insert(scheduledCoaching).values({ coachId: ctx.user.id, title: input.title, content: input.content, category: input.category, scheduleType: input.scheduleType, scheduledAt: new Date(input.scheduledAt), targetGrade: input.targetGrade, targetUserIds: input.targetUserIds });
      return true;
    }),
    getScheduledCoachings: adminProcedure.query(async () => {
      const database = await db.getDb(); if (!database) return [];
      const { scheduledCoaching } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return database.select().from(scheduledCoaching).orderBy(desc(scheduledCoaching.createdAt));
    }),
    toggleScheduledCoaching: adminProcedure.input(z.object({ id: z.number(), isActive: z.number() })).mutation(async ({ input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { scheduledCoaching } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      await database.update(scheduledCoaching).set({ isActive: input.isActive }).where(eq(scheduledCoaching.id, input.id));
      return true;
    }),
  }),
  // ─── 고객용 코칭 수신 ─────────────────────────────────────────────
  coaching: router({
    getMyCoaching: protectedProcedure.input(z.object({ limit: z.number().default(20) })).query(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) return [];
      const { coachingMessages } = await import("../drizzle/schema");
      const { eq, desc, and, isNotNull } = await import("drizzle-orm");
      return database.select().from(coachingMessages).where(and(eq(coachingMessages.userId, ctx.user.id), isNotNull(coachingMessages.sentAt))).orderBy(desc(coachingMessages.createdAt)).limit(input.limit);
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) return false;
      const { coachingMessages } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      await database.update(coachingMessages).set({ isRead: 1 }).where(and(eq(coachingMessages.id, input.id), eq(coachingMessages.userId, ctx.user.id)));
      return true;
    }),
    getMyAnalyses: protectedProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) return [];
      const { aiHealthAnalysis } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      return database.select().from(aiHealthAnalysis).where(eq(aiHealthAnalysis.userId, ctx.user.id)).orderBy(desc(aiHealthAnalysis.createdAt)).limit(input.limit);
    }),
  }),
  live: router({
    sendChatMessage: protectedProcedure.input(z.object({ streamId: z.number(), message: z.string().min(1).max(500) })).mutation(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) throw new Error("DB not available");
      const { liveChatMessages } = await import("../drizzle/schema");
      const result = await database.insert(liveChatMessages).values({
        streamId: input.streamId,
        userId: ctx.user.id,
        message: input.message,
      });
      return { id: result[0].insertId, success: true };
    }),
    getChatMessages: publicProcedure.input(z.object({ streamId: z.number(), limit: z.number().default(50) })).query(async ({ input }) => {
      const database = await db.getDb(); if (!database) return [];
      const { liveChatMessages } = await import("../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      return database.select().from(liveChatMessages).where(eq(liveChatMessages.streamId, input.streamId)).orderBy(desc(liveChatMessages.createdAt)).limit(input.limit);
    }),
    pinMessage: protectedProcedure.input(z.object({ messageId: z.number(), streamId: z.number() })).mutation(async ({ ctx, input }) => {
      const database = await db.getDb(); if (!database) throw new Error("DB not available");
      const { liveChatMessages, liveStreams } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const stream = await database.select().from(liveStreams).where(eq(liveStreams.id, input.streamId));
      if (stream.length === 0 || stream[0].hostId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      await database.update(liveChatMessages).set({ isPinned: 1 }).where(eq(liveChatMessages.id, input.messageId));
      return true;
    }),
  }),

  // ─── 게임 및 포인트 보상 ─────────────────────────────────────────────
  games: router({
    recordGameResult: protectedProcedure
      .input(z.object({
        gameId: z.string(),
        result: z.enum(["win", "loss"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await rewards.awardGamePoints(
            ctx.user.id,
            input.gameId,
            input.result,
            input.difficulty
          );
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("Game points error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
  }),

  // ─── 포인트 보상 시스템 ─────────────────────────────────────────────
  rewards: router({
    awardMissionPoints: protectedProcedure
      .input(z.object({
        missionId: z.string(),
        difficulty: z.enum(["low", "medium", "high"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await rewards.awardMissionPoints(
            ctx.user.id,
            input.missionId,
            input.difficulty
          );
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("Mission points error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
    awardHealthBonus: protectedProcedure
      .input(z.object({
        metric: z.string(),
        improvementScore: z.number().min(0).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await rewards.awardHealthImprovementPoints(
            ctx.user.id,
            input.metric,
            input.improvementScore
          );
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("Health bonus error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
    awardSleepBonus: protectedProcedure
      .input(z.object({
        sleepHours: z.number().min(0).max(24),
        sleepQuality: z.number().min(0).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await rewards.awardSleepQualityPoints(
            ctx.user.id,
            input.sleepHours,
            input.sleepQuality
          );
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("Sleep bonus error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
    awardAttendanceBonus: protectedProcedure
      .input(z.object({
        consecutiveDays: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await rewards.awardAttendanceBonus(
            ctx.user.id,
            input.consecutiveDays
          );
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("Attendance bonus error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
    awardTierUpBonus: adminProcedure
      .input(z.object({
        userId: z.number(),
        newTier: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await rewards.awardTierUpBonus(
            input.userId,
            input.newTier
          );
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("Tier up bonus error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
    awardAIAutoBonus: protectedProcedure
      .input(z.object({
        dailySteps: z.number().optional(),
        distance: z.number().optional(),
        sleepHours: z.number().optional(),
        sleepQuality: z.number().optional(),
        heartRateAvg: z.number().optional(),
        stressLevel: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await rewards.awardAIAutoBonus(ctx.user.id, input);
          return { success: true, points: result?.amount || 0 };
        } catch (error) {
          console.error("AI auto bonus error:", error);
          return { success: false, error: "포인트 적립 실패" };
        }
      }),
  }),

  // ─── Bitcoin Market Data ─────────────────────────────────────────
  bitcoin: router({
    getCurrentData: publicProcedure.query(async () => {
      try {
        const data = await fetchBitcoinData();
        return {
          success: true,
          data,
          formatted: formatBitcoinData(data),
        };
      } catch (error) {
        console.error("Bitcoin data fetch error:", error);
        return {
          success: false,
          error: "비트코인 데이터를 불러올 수 없습니다",
        };
      }
    }),
    getAnalysisBrief: publicProcedure.query(async () => {
      try {
        const data = await fetchBitcoinData();
        const brief = await analyzeBitcoinMarket(data);
        const text = formatBitcoinBrief(brief);
        return {
          success: true,
          brief,
          text,
        };
      } catch (error) {
        console.error("Bitcoin analysis error:", error);
        return {
          success: false,
          error: "비트코인 분석을 불러올 수 없습니다",
        };
      }
    }),
  }),
});
export type AppRouter = typeof appRouter;
