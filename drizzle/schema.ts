import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, float, boolean } from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Member Profiles (건강 프로필) ───────────────────────────────────
export const memberProfiles = mysqlTable("member_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  birthDate: varchar("birthDate", { length: 10 }),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  height: float("height"),
  weight: float("weight"),
  bloodType: varchar("bloodType", { length: 10 }),
  medicalHistory: json("medicalHistory"),
  allergies: json("allergies"),
  medications: json("medications"),
  emergencyContact: varchar("emergencyContact", { length: 100 }),
  constitutionType: varchar("constitutionType", { length: 50 }),
  memberGrade: mysqlEnum("memberGrade", ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]).default("silver").notNull(),
  beltRank: varchar("beltRank", { length: 50 }).default("white"),
  beltStartDate: timestamp("beltStartDate"),
  totalDays: int("totalDays").default(0),
  totalMissions: int("totalMissions").default(0),
  totalParticipation: int("totalParticipation").default(0),
  pushNotificationEnabled: boolean("pushNotificationEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;

// ─── Health Records (일일 건강 데이터) ───────────────────────────────
export const healthRecords = mysqlTable("health_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(),
  systolicBP: int("systolicBP"),
  diastolicBP: int("diastolicBP"),
  heartRate: int("heartRate"),
  bloodSugar: float("bloodSugar"),
  weight: float("weight"),
  bodyFat: float("bodyFat"),
  exerciseMinutes: int("exerciseMinutes"),
  exerciseType: varchar("exerciseType", { length: 100 }),
  sleepHours: float("sleepHours"),
  sleepQuality: int("sleepQuality"),
  waterIntake: float("waterIntake"),
  stressLevel: int("stressLevel"),
  painLevel: int("painLevel"),
  painLocation: varchar("painLocation", { length: 200 }),
  mood: mysqlEnum("mood", ["great", "good", "neutral", "bad", "terrible"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = typeof healthRecords.$inferInsert;

// ─── Health Diagnostics (초기 건강 진단) ─────────────────────────────
export const healthDiagnostics = mysqlTable("health_diagnostics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  timePeriod: mysqlEnum("timePeriod", ["20years", "10years", "5years", "3years", "2years", "current"]).notNull(),
  checklistData: json("checklistData"),
  constitutionAnalysis: json("constitutionAnalysis"),
  inflammationScore: int("inflammationScore"),
  gravityScore: int("gravityScore"),
  cardiopulmonaryScore: int("cardiopulmonaryScore"),
  digestiveScore: int("digestiveScore"),
  musculoskeletalScore: int("musculoskeletalScore"),
  mentalHealthScore: int("mentalHealthScore"),
  overallScore: int("overallScore"),
  aiAnalysis: text("aiAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthDiagnostic = typeof healthDiagnostics.$inferSelect;
export type InsertHealthDiagnostic = typeof healthDiagnostics.$inferInsert;

// ─── Health Missions (건강 미션) ─────────────────────────────────────
export const healthMissions = mysqlTable("health_missions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["breathing", "rest", "posture", "stretching", "mental", "exercise", "nutrition"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  missionPeriod: mysqlEnum("missionPeriod", ["daily", "weekly", "biweekly", "monthly", "quarterly", "semiannual", "annual"]).default("daily").notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  pointReward: int("pointReward").default(0),
  status: mysqlEnum("status", ["pending", "in_progress", "submitted", "completed", "failed"]).default("pending").notNull(),
  photoUrl: text("photoUrl"),
  aiAnalysisResult: text("aiAnalysisResult"),
  completionRate: int("completionRate").default(0),
  paybackRate: int("paybackRate").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthMission = typeof healthMissions.$inferSelect;
export type InsertHealthMission = typeof healthMissions.$inferInsert;

// ─── Health Goals (건강 목표) ────────────────────────────────────────
export const healthGoals = mysqlTable("health_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  targetValue: float("targetValue"),
  currentValue: float("currentValue").default(0),
  unit: varchar("unit", { length: 50 }),
  category: varchar("category", { length: 50 }),
  deadline: varchar("deadline", { length: 10 }),
  status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthGoal = typeof healthGoals.$inferSelect;
export type InsertHealthGoal = typeof healthGoals.$inferInsert;

// ─── Chat Messages (상담 메시지) ─────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Reminders (알림/리마인더) ───────────────────────────────────────
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  reminderType: mysqlEnum("reminderType", ["medication", "exercise", "checkup", "water", "sleep", "custom"]).notNull(),
  time: varchar("time", { length: 5 }).notNull(),
  days: json("days"),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

// ─── Program Progress (단계별 건강 프로그램 진행) ────────────────────
export const programProgress = mysqlTable("program_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stage: mysqlEnum("stage", ["breathing", "rest", "posture", "stretching", "mental", "breathing_awareness", "rest_peace", "good_sleep", "stretching_yoga", "meditation", "posture_walking", "exercise_social", "food_therapy", "hormone_bone", "return_breath"]).notNull(),
  lessonId: int("lessonId").default(0),
  progress: int("progress").default(0),
  isCompleted: int("isCompleted").default(0),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgramProgress = typeof programProgress.$inferSelect;
export type InsertProgramProgress = typeof programProgress.$inferInsert;

// ─── Workout Pose Analysis (운동 자세 분석) ──────────────────────────
export const workoutPoseAnalysis = mysqlTable("workout_pose_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseName: varchar("exerciseName", { length: 100 }).notNull(),
  targetPose: varchar("targetPose", { length: 50 }).notNull(),
  accuracy: int("accuracy").notNull(), // 0-100
  hanJinLevel: int("hanJinLevel").notNull(), // -10 ~ +10
  feedback: text("feedback"),
  isCorrect: boolean("isCorrect").default(false),
  duration: int("duration"), // 초 단위
  videoUrl: text("videoUrl"), // 운동 영상 저장 (선택)
  aiAnalysis: text("aiAnalysis"), // AI 분석 결과
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutPoseAnalysis = typeof workoutPoseAnalysis.$inferSelect;
export type InsertWorkoutPoseAnalysis = typeof workoutPoseAnalysis.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// 쇼핑몰 (건강식품 몰)
// ═══════════════════════════════════════════════════════════════════════

// ─── Product Categories (상품 카테고리) ─────────────────────────────────
export const productCategories = mysqlTable("product_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

// ─── Sellers (입점 셀러) ────────────────────────────────────────────────
export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeName: varchar("storeName", { length: 200 }).notNull(),
  storeDescription: text("storeDescription"),
  storeLogoUrl: text("storeLogoUrl"),
  storeBannerUrl: text("storeBannerUrl"),
  businessNumber: varchar("businessNumber", { length: 50 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  bankName: varchar("bankName", { length: 50 }),
  bankAccount: varchar("bankAccount", { length: 100 }),
  bankHolder: varchar("bankHolder", { length: 100 }),
  commissionRate: float("commissionRate").default(10), // 수수료율 %
  status: mysqlEnum("sellerStatus", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  totalSales: int("totalSales").default(0),
  productCount: int("productCount").default(0),
  rating: float("sellerRating").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Seller = typeof sellers.$inferSelect;
export type InsertSeller = typeof sellers.$inferInsert;

// ─── Products (상품) ────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(), // 몰인몰: 셀러 ID
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  detailDescription: text("detailDescription"),
  price: int("price").notNull(),
  salePrice: int("salePrice"),
  imageUrl: text("imageUrl"),
  images: json("images"), // array of image URLs
  stock: int("stock").default(0),
  isActive: int("isActive").default(1),
  tags: json("tags"), // array of tag strings
  rating: float("rating").default(0),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Cart Items (장바구니) ──────────────────────────────────────────────
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ─── Orders (주문) ──────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
  totalAmount: int("totalAmount").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "shipping", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // stripe, kakaopay, naverpay, tosspay, phone, paypal
  paymentId: varchar("paymentId", { length: 200 }), // 외부 결제 ID (Stripe session 등)
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending"),
  shippingName: varchar("shippingName", { length: 100 }),
  shippingPhone: varchar("shippingPhone", { length: 20 }),
  shippingAddress: text("shippingAddress"),
  shippingMemo: text("shippingMemo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items (주문 상품) ────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  sellerId: int("sellerId").notNull(), // 몰인몰: 셀러 ID
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  price: int("price").notNull(),
  quantity: int("quantity").notNull(),
  sellerSettled: int("sellerSettled").default(0), // 0=미정산, 1=정산완료
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─── Seller Settlements (셀러 정산) ─────────────────────────────────────
export const sellerSettlements = mysqlTable("seller_settlements", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  periodStart: varchar("periodStart", { length: 10 }).notNull(), // YYYY-MM-DD
  periodEnd: varchar("periodEnd", { length: 10 }).notNull(),
  totalSales: int("totalSales").notNull(),
  commission: int("commission").notNull(),
  netAmount: int("netAmount").notNull(), // 셀러 수령액
  status: mysqlEnum("settlementStatus", ["pending", "processing", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SellerSettlement = typeof sellerSettlements.$inferSelect;
export type InsertSellerSettlement = typeof sellerSettlements.$inferInsert;

// ─── Product Reviews (상품 리뷰) ────────────────────────────────────────
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  content: text("content"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// 커뮤니티
// ═══════════════════════════════════════════════════════════════════════

// ─── Community Posts (게시글) ────────────────────────────────────────────
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 100 }),
  category: mysqlEnum("category", ["free", "health_tip", "exercise", "nutrition", "question", "success_story"]).default("free").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  imageUrls: json("imageUrls"), // array of image URLs
  viewCount: int("viewCount").default(0),
  likeCount: int("likeCount").default(0),
  commentCount: int("commentCount").default(0),
  isPinned: int("isPinned").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// ─── Post Comments (댓글) ───────────────────────────────────────────────
export const postComments = mysqlTable("post_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 100 }),
  content: text("content").notNull(),
  parentId: int("parentId"), // 대댓글
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

// ─── Post Likes (좋아요) ────────────────────────────────────────────────
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

// ─── Info Room Messages (정보공유방) ────────────────────────────────────
export const infoRoomMessages = mysqlTable("info_room_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 100 }),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InfoRoomMessage = typeof infoRoomMessages.$inferSelect;
export type InsertInfoRoomMessage = typeof infoRoomMessages.$inferInsert;

// ─── User Gallery (개인 갤러리) ─────────────────────────────────────────
export const userGallery = mysqlTable("user_gallery", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mediaType: mysqlEnum("mediaType", ["photo", "video"]).default("photo").notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  caption: text("caption"),
  isPublic: int("isPublic").default(1), // 1=공개, 0=비공개
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserGalleryItem = typeof userGallery.$inferSelect;
export type InsertUserGalleryItem = typeof userGallery.$inferInsert;

// ─── Gallery Likes (갤러리 좋아요) ──────────────────────────────────────
export const galleryLikes = mysqlTable("gallery_likes", {
  id: int("id").autoincrement().primaryKey(),
  galleryItemId: int("galleryItemId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryLike = typeof galleryLikes.$inferSelect;
export type InsertGalleryLike = typeof galleryLikes.$inferInsert;

// ─── User Stories (개인 스토리) ─────────────────────────────────────────
export const userStories = mysqlTable("user_stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 100 }),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  isPublic: int("isPublic").default(1),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserStory = typeof userStories.$inferSelect;
export type InsertUserStory = typeof userStories.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// 멤버십 시스템 (앱 전체 기반)
// ═══════════════════════════════════════════════════════════════════════

// ─── Membership Tiers (멤버십 등급 설정) ────────────────────────────────
export const membershipTiers = mysqlTable("membership_tiers", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  nameEn: varchar("nameEn", { length: 50 }), // 영문명
  monthlyFee: int("monthlyFee").default(0), // 월 구독료 (0=무료)
  annualFee: int("annualFee").default(0), // 연회비 (0=없음)
  initiationFee: int("initiationFee").default(0), // 가입비/입회비 (0=없음)
  shopDiscountRate: int("shopDiscountRate").default(0), // 쇼핑 할인율 %
  paybackRate: int("paybackRate").default(50), // 미션 페이백 비율 %
  pointMultiplier: float("pointMultiplier").default(1.0), // 포인트 적립 배율
  consultPriority: int("consultPriority").default(0), // 상담 우선 순위
  dedicatedManager: int("dedicatedManager").default(0), // 전담 매니저 배정 (0=불가, 1=가능)
  premiumContent: int("premiumContent").default(0), // 프리미엄 콘텐츠 접근
  exclusiveEvents: int("exclusiveEvents").default(0), // 전용 이벤트 접근
  vipLounge: int("vipLounge").default(0), // VIP 라운지 접근
  conciergeService: int("conciergeService").default(0), // 컨시어지 서비스
  monthlyFreeCoupons: int("monthlyFreeCoupons").default(0), // 월 자동 발급 쿠폰 수
  annualGiftPackage: int("annualGiftPackage").default(0), // 연간 선물 패키지
  priorityBooking: int("priorityBooking").default(0), // 우선 예약
  globalPartnerAccess: int("globalPartnerAccess").default(0), // 글로벌 파트너 시설 이용
  membershipCardType: varchar("membershipCardType", { length: 50 }), // 회원 카드 유형
  maxInvitations: int("maxInvitations").default(0), // 연간 초대 가능 수
  description: text("description"),
  benefits: json("benefits"), // 상세 혜택 목록 JSON
  tierOrder: int("tierOrder").default(0), // 등급 순서 (정렬용)
  colorTheme: varchar("colorTheme", { length: 50 }), // 등급별 테마 색상
  iconEmoji: varchar("iconEmoji", { length: 10 }), // 등급별 아이콘
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MembershipTier = typeof membershipTiers.$inferSelect;
export type InsertMembershipTier = typeof membershipTiers.$inferInsert;

// ─── User Memberships (회원 멤버십 현황) ────────────────────────────────
export const userMemberships = mysqlTable("user_memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tier: mysqlEnum("memberTier", ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]).default("silver").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  isActive: int("isActive").default(1),
  autoRenew: int("autoRenew").default(1),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 200 }),
  totalPointsEarned: int("totalPointsEarned").default(0),
  totalPointsUsed: int("totalPointsUsed").default(0),
  currentPoints: int("currentPoints").default(0),
  totalMileage: int("totalMileage").default(0), // 누적 마일리지
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserMembership = typeof userMemberships.$inferSelect;
export type InsertUserMembership = typeof userMemberships.$inferInsert;

// ─── Points Transactions (포인트 적립/사용 내역) ────────────────────────
export const pointsTransactions = mysqlTable("points_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("pointType", ["earn", "use", "expire", "refund"]).notNull(),
  amount: int("amount").notNull(), // 양수=적립, 음수=사용
  balance: int("balance").notNull(), // 거래 후 잔액
  source: mysqlEnum("pointSource", [
    "purchase", "mission", "event", "referral", "review",
    "attendance", "signup_bonus", "tier_bonus", "admin",
    "shop_payment", "coupon_exchange", "expiry"
  ]).notNull(),
  description: varchar("description", { length: 300 }),
  referenceId: varchar("referenceId", { length: 100 }), // 관련 주문/미션 ID
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = typeof pointsTransactions.$inferInsert;

// ─── Coupons (쿠폰 정의) ───────────────────────────────────────────────
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(), // 정률/정액
  discountValue: int("discountValue").notNull(), // 할인율(%) 또는 할인금액(원)
  minOrderAmount: int("minOrderAmount").default(0), // 최소 주문 금액
  maxDiscountAmount: int("maxDiscountAmount"), // 최대 할인 금액 (정률일 때)
  applicableCategory: varchar("applicableCategory", { length: 50 }), // 적용 카테고리 (null=전체)
  requiredTier: mysqlEnum("couponTier", ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]), // 필요 등급 (null=전체)
  totalQuantity: int("totalQuantity"), // 총 발급 수량 (null=무제한)
  usedQuantity: int("usedQuantity").default(0),
  startDate: timestamp("couponStartDate").defaultNow().notNull(),
  endDate: timestamp("couponEndDate"),
  isActive: int("couponIsActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// ─── User Coupons (회원 보유 쿠폰) ─────────────────────────────────────
export const userCoupons = mysqlTable("user_coupons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  couponId: int("couponId").notNull(),
  status: mysqlEnum("couponStatus", ["available", "used", "expired"]).default("available").notNull(),
  usedAt: timestamp("usedAt"),
  usedOrderId: int("usedOrderId"),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
  expiresAt: timestamp("couponExpiresAt"),
});

export type UserCoupon = typeof userCoupons.$inferSelect;
export type InsertUserCoupon = typeof userCoupons.$inferInsert;

// ─── Events (이벤트) ───────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  content: text("eventContent"), // 상세 내용 (마크다운)
  imageUrl: text("eventImageUrl"),
  eventType: mysqlEnum("eventType", ["promotion", "seasonal", "tier_exclusive", "referral", "challenge", "special"]).notNull(),
  requiredTier: mysqlEnum("eventTier", ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"]), // 필요 등급 (null=전체)
  rewardType: mysqlEnum("rewardType", ["points", "coupon", "product", "mileage", "badge"]),
  rewardValue: int("rewardValue"), // 보상 값
  startDate: timestamp("eventStartDate").notNull(),
  endDate: timestamp("eventEndDate"),
  maxParticipants: int("maxParticipants"), // null=무제한
  currentParticipants: int("currentParticipants").default(0),
  isActive: int("eventIsActive").default(1),
  isFeatured: int("isFeatured").default(0), // 본사 추천
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Event Participations (이벤트 참여) ─────────────────────────────────
export const eventParticipations = mysqlTable("event_participations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("participationStatus", ["joined", "completed", "rewarded"]).default("joined").notNull(),
  rewardGiven: int("rewardGiven").default(0),
  completedAt: timestamp("participationCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventParticipation = typeof eventParticipations.$inferSelect;
export type InsertEventParticipation = typeof eventParticipations.$inferInsert;

// ─── Mileage Transactions (마일리지 내역) ───────────────────────────────
export const mileageTransactions = mysqlTable("mileage_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("mileageType", ["earn", "use"]).notNull(),
  amount: int("mileageAmount").notNull(),
  balance: int("mileageBalance").notNull(),
  source: varchar("mileageSource", { length: 100 }).notNull(), // purchase, event, tier_bonus 등
  description: varchar("mileageDescription", { length: 300 }),
  referenceId: varchar("mileageReferenceId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MileageTransaction = typeof mileageTransactions.$inferSelect;
export type InsertMileageTransaction = typeof mileageTransactions.$inferInsert;

// ─── User Wallet (통합 지갑 - 포인트/적립금/코인 결제) ──────────────────
export const userWallets = mysqlTable("user_wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cardNumber: varchar("cardNumber", { length: 20 }).notNull(), // GLWA-XXXX-XXXX-XXXX
  pointBalance: int("pointBalance").default(0).notNull(), // 포인트 잔액
  cashBalance: int("cashBalance").default(0).notNull(), // 적립금/충전금 잔액 (원)
  coinBalance: float("coinBalance").default(0).notNull(), // 코인 잔액
  totalSpent: int("totalSpent").default(0).notNull(), // 총 사용 금액
  totalCharged: int("totalCharged").default(0).notNull(), // 총 충전 금액
  isActive: int("walletIsActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserWallet = typeof userWallets.$inferSelect;
export type InsertUserWallet = typeof userWallets.$inferInsert;

// ─── Wallet Transactions (지갑 거래 내역) ───────────────────────────────
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(),
  type: mysqlEnum("walletTxType", ["charge", "payment", "transfer", "refund", "reward"]).notNull(),
  currency: mysqlEnum("walletCurrency", ["point", "cash", "coin"]).notNull(),
  amount: int("walletTxAmount").notNull(), // 양수=입금, 음수=출금
  balanceAfter: int("walletBalanceAfter").notNull(),
  description: varchar("walletTxDesc", { length: 300 }),
  referenceId: varchar("walletTxRefId", { length: 100 }), // 주문/이벤트 ID
  paymentMethod: varchar("walletPayMethod", { length: 50 }), // qr, card, coin, point, cash
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

// ─── Song of the Day (오늘의 노래) ──────────────────────────────────────
export const songOfTheDay = mysqlTable("song_of_the_day", {
  id: int("id").autoincrement().primaryKey(),
  songUrl: text("songUrl").notNull(), // S3 음악 URL
  songTitle: varchar("songTitle", { length: 200 }).notNull(), // 노래 제목
  artistName: varchar("artistName", { length: 100 }).notNull(), // 아티스트명
  genre: varchar("genre", { length: 50 }), // 장르 (80s가요, 90s가요, 80s팝, 90s팝, 트로트)
  selectedDate: varchar("selectedDate", { length: 10 }).notNull().unique(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SongOfTheDay = typeof songOfTheDay.$inferSelect;
export type InsertSongOfTheDay = typeof songOfTheDay.$inferInsert;

// ─── Mental Health Notifications (정신건강 알림) ──────────────────────────
export const mentalHealthNotifications = mysqlTable("mental_health_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  notificationTime: varchar("notificationTime", { length: 5 }).notNull(), // HH:MM (07:00, 12:00, 17:00, 22:00)
  musicGenre: varchar("musicGenre", { length: 50 }), // 선호 음악 장르
  isEnabled: int("isEnabled").default(1).notNull(), // 알림 활성화 여부
  lastSentAt: timestamp("lastSentAt"), // 마지막 발송 시간
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentalHealthNotification = typeof mentalHealthNotifications.$inferSelect;
export type InsertMentalHealthNotification = typeof mentalHealthNotifications.$inferInsert;

// ─── Health Sync (건강 데이터 자동 연동) ──────────────────────────────────
export const healthSyncTokens = mysqlTable("health_sync_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  syncToken: varchar("syncToken", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", ["samsung_health", "apple_health", "google_fit", "manual"]).default("samsung_health").notNull(),
  isActive: int("isActive").default(1).notNull(),
  consentGivenAt: timestamp("consentGivenAt"),
  lastSyncAt: timestamp("lastSyncAt"),
  syncCount: int("syncCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type HealthSyncToken = typeof healthSyncTokens.$inferSelect;
export type InsertHealthSyncToken = typeof healthSyncTokens.$inferInsert;

export const healthSyncData = mysqlTable("health_sync_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dataType: varchar("dataType", { length: 50 }).notNull(),
  value: float("value"),
  valueJson: json("valueJson"),
  unit: varchar("unit", { length: 20 }),
  source: varchar("source", { length: 50 }),
  recordedAt: timestamp("recordedAt").notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
});
export type HealthSyncDatum = typeof healthSyncData.$inferSelect;
export type InsertHealthSyncDatum = typeof healthSyncData.$inferInsert;

export const aiHealthFeedback = mysqlTable("ai_health_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  feedbackDate: varchar("feedbackDate", { length: 10 }).notNull(),
  analysisType: mysqlEnum("analysisType", ["daily", "weekly", "monthly", "alert"]).default("daily").notNull(),
  summary: text("summary"),
  recommendations: json("recommendations"),
  riskAlerts: json("riskAlerts"),
  dataSnapshot: json("dataSnapshot"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiHealthFeedback = typeof aiHealthFeedback.$inferSelect;
export type InsertAiHealthFeedback = typeof aiHealthFeedback.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// 관리자 알림 시스템
// ═══════════════════════════════════════════════════════════════════════

// ─── Admin Notification Settings (알림 파이프라인 설정) ─────────────────
export const adminNotificationSettings = mysqlTable("admin_notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  category: mysqlEnum("notifCategory", [
    "urgent",       // 긴급: VIP레벨업 신청, 긴급상담 요청
    "important",    // 중요: 결제완료, 정산요청, 환불요청
    "normal",       // 일반: 미션완료, 건강기록, 게시글 신고
    "low"           // 낮음: 좋아요, 댓글, 출석체크
  ]).notNull(),
  enabled: int("enabled").default(1).notNull(), // 1=ON, 0=OFF
  pipeline: mysqlEnum("pipeline", [
    "instant",      // 즉시 알림
    "batch_6h",     // 6시간마다 모아보기
    "daily",        // 일일 모아보기
    "weekly"        // 주간 모아보기
  ]).default("instant").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AdminNotificationSetting = typeof adminNotificationSettings.$inferSelect;
export type InsertAdminNotificationSetting = typeof adminNotificationSettings.$inferInsert;

// ─── Admin Notifications (관리자 알림 로그) ─────────────────────────────
export const adminNotifications = mysqlTable("admin_notifications", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("notifLogCategory", [
    "urgent", "important", "normal", "low"
  ]).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content"),
  metadata: json("metadata"),
  isRead: int("isRead").default(0).notNull(),
  isArchived: int("isArchived").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;

// ─── Admin Activity Log (관리자 활동 로그) ──────────────────────────────
export const adminActivityLog = mysqlTable("admin_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 50 }),
  targetId: int("targetId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminActivityLogEntry = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLogEntry = typeof adminActivityLog.$inferInsert;


// ─── AI Health Analysis (AI 건강 분석 결과) ──────────────────────────────
export const aiHealthAnalysis = mysqlTable("ai_health_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  analysisType: mysqlEnum("analysisType", ["daily", "weekly", "monthly", "alert"]).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["normal", "caution", "warning", "critical"]).notNull(),
  summary: text("summary").notNull(),
  details: json("details"),
  recommendations: json("recommendations"),
  dataSnapshot: json("dataSnapshot"),
  isReviewedByAdmin: int("isReviewedByAdmin").default(0).notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiHealthAnalysis = typeof aiHealthAnalysis.$inferSelect;
export type InsertAiHealthAnalysis = typeof aiHealthAnalysis.$inferInsert;

// ─── Coaching Messages (코칭 메시지) ──────────────────────────────────
export const coachingMessages = mysqlTable("coaching_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  coachId: int("coachId"),
  type: mysqlEnum("coachMsgType", ["ai_auto", "coach_manual", "scheduled"]).notNull(),
  category: mysqlEnum("coachMsgCategory", ["health_analysis", "exercise", "nutrition", "mental", "lifestyle", "motivation", "general"]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  analysisId: int("analysisId"),
  isRead: int("isRead").default(0).notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CoachingMessage = typeof coachingMessages.$inferSelect;
export type InsertCoachingMessage = typeof coachingMessages.$inferInsert;

// ─── Scheduled Coaching (정기 예약 코칭) ──────────────────────────────
export const scheduledCoaching = mysqlTable("scheduled_coaching", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull(),
  targetUserIds: json("targetUserIds"),
  targetGrade: varchar("targetGrade", { length: 50 }),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("schedCoachCategory", ["health_analysis", "exercise", "nutrition", "mental", "lifestyle", "motivation", "general"]).notNull(),
  scheduleType: mysqlEnum("scheduleType", ["once", "daily", "weekly", "monthly"]).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  lastSentAt: timestamp("lastSentAt"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ScheduledCoaching = typeof scheduledCoaching.$inferSelect;
export type InsertScheduledCoaching = typeof scheduledCoaching.$inferInsert;


// ─── Live Streaming (라이브 방송) ──────────────────────────────────────
export const liveStreams = mysqlTable("live_streams", {
  id: int("id").autoincrement().primaryKey(),
  hostId: int("hostId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  category: varchar("category", { length: 50 }).notNull(),
  status: mysqlEnum("liveStatus", ["scheduled", "live", "ended"]).default("scheduled").notNull(),
  viewerCount: int("viewerCount").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  totalDuration: int("totalDuration"),
  totalGiftsAmount: int("totalGiftsAmount").default(0).notNull(),
  totalViewers: int("totalViewers").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow().notNull(),
});
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = typeof liveStreams.$inferInsert;

// ─── Live Viewers (라이브 시청자) ──────────────────────────────────────
export const liveViewers = mysqlTable("live_viewers", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("streamId").notNull(),
  userId: int("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  leftAt: timestamp("leftAt"),
  watchDuration: int("watchDuration"),
  giftsSent: int("giftsSent").default(0).notNull(),
  pointsContributed: int("pointsContributed").default(0).notNull(),
});
export type LiveViewer = typeof liveViewers.$inferSelect;
export type InsertLiveViewer = typeof liveViewers.$inferInsert;

// ─── Live Gifts (라이브 선물/기부) ──────────────────────────────────────
export const liveGifts = mysqlTable("live_gifts", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("streamId").notNull(),
  senderId: int("senderId").notNull(),
  giftType: varchar("giftType", { length: 50 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  pointsSpent: int("pointsSpent").notNull(),
  message: varchar("message", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LiveGift = typeof liveGifts.$inferSelect;
export type InsertLiveGift = typeof liveGifts.$inferInsert;

// ─── Crypto Watchlist (암호화폐 관심 목록) ──────────────────────────────
export const cryptoWatchlist = mysqlTable("crypto_watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  alertPrice: varchar("alertPrice", { length: 50 }),
  alertType: mysqlEnum("alertType", ["above", "below"]),
});
export type CryptoWatchlist = typeof cryptoWatchlist.$inferSelect;
export type InsertCryptoWatchlist = typeof cryptoWatchlist.$inferInsert;

// ─── Crypto Trading Records (암호화폐 거래 기록) ──────────────────────
export const cryptoTradingRecords = mysqlTable("crypto_trading_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  tradeType: mysqlEnum("tradeType", ["buy", "sell"]).notNull(),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  totalAmount: varchar("totalAmount", { length: 50 }).notNull(),
  fee: varchar("fee", { length: 50 }).default("0"),
  profitLoss: varchar("profitLoss", { length: 50 }),
  status: mysqlEnum("tradeStatus", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  tradeDate: timestamp("tradeDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CryptoTradingRecord = typeof cryptoTradingRecords.$inferSelect;
export type InsertCryptoTradingRecord = typeof cryptoTradingRecords.$inferInsert;

// ─── Auto Trading Rules (자동 거래 규칙) ──────────────────────────────
export const autoTradingRules = mysqlTable("auto_trading_rules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  ruleType: varchar("ruleType", { length: 50 }).notNull(),
  condition: varchar("condition", { length: 200 }).notNull(),
  tradeType: mysqlEnum("autoTradeType", ["buy", "sell"]).notNull(),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  maxLoss: varchar("maxLoss", { length: 50 }),
  takeProfit: varchar("takeProfit", { length: 50 }),
  isActive: int("isActive").default(1).notNull(),
  executedCount: int("executedCount").default(0).notNull(),
  lastExecutedAt: timestamp("lastExecutedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AutoTradingRule = typeof autoTradingRules.$inferSelect;
export type InsertAutoTradingRule = typeof autoTradingRules.$inferInsert;

// ─── Live Chat Messages (라이브 채팅 메시지) ──────────────────────────────
export const liveChatMessages = mysqlTable("live_chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("streamId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  isPinned: int("isPinned").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LiveChatMessage = typeof liveChatMessages.$inferSelect;
export type InsertLiveChatMessage = typeof liveChatMessages.$inferInsert;


// ═══════════════════════════════════════════════════════════════════════
// 멀티플레이 게임 시스템
// ═══════════════════════════════════════════════════════════════════════

// ─── Game Matches (게임 매치) ────────────────────────────────────────────
export const gameMatches = mysqlTable("game_matches", {
  id: int("id").autoincrement().primaryKey(),
  gameType: mysqlEnum("gameType", ["chess", "baduk", "omok", "yukmok", "janggi"]).notNull(),
  player1Id: int("player1Id").notNull(),
  player2Id: int("player2Id"),
  player1Rating: int("player1Rating").default(1000),
  player2Rating: int("player2Rating").default(1000),
  difficulty: mysqlEnum("gameDifficulty", ["easy", "medium", "hard"]),
  badukLevel: varchar("badukLevel", { length: 10 }), // 바둑 급수 (30급~7단)
  status: mysqlEnum("matchStatus", ["waiting", "ongoing", "completed", "cancelled"]).default("waiting").notNull(),
  winner: int("winner"), // 승자 userId (null=무승부)
  loser: int("loser"), // 패자 userId
  moves: json("moves"), // 게임 이동 기록
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  durationSeconds: int("durationSeconds"),
  player1Points: int("player1Points").default(0),
  player2Points: int("player2Points").default(0),
  ratingChange1: int("ratingChange1").default(0),
  ratingChange2: int("ratingChange2").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameMatch = typeof gameMatches.$inferSelect;
export type InsertGameMatch = typeof gameMatches.$inferInsert;

// ─── Game Chat (게임 중 채팅) ───────────────────────────────────────────
export const gameChat = mysqlTable("game_chat", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameChatMessage = typeof gameChat.$inferSelect;
export type InsertGameChatMessage = typeof gameChat.$inferInsert;

// ─── Game Rankings (게임 랭킹) ──────────────────────────────────────────
export const gameRankings = mysqlTable("game_rankings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: mysqlEnum("rankingGameType", ["chess", "baduk", "omok", "yukmok", "janggi"]).notNull(),
  rating: int("rating").default(1000),
  wins: int("wins").default(0),
  losses: int("losses").default(0),
  draws: int("draws").default(0),
  winRate: float("winRate").default(0),
  rank: int("rank").default(0),
  totalPoints: int("totalPoints").default(0),
  lastPlayedAt: timestamp("lastPlayedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameRanking = typeof gameRankings.$inferSelect;
export type InsertGameRanking = typeof gameRankings.$inferInsert;

// ─── Game Statistics (게임 통계) ────────────────────────────────────────
export const gameStatistics = mysqlTable("game_statistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalMatches: int("totalMatches").default(0),
  totalWins: int("totalWins").default(0),
  totalLosses: int("totalLosses").default(0),
  totalDraws: int("totalDraws").default(0),
  totalPoints: int("totalPoints").default(0),
  averageGameDuration: int("averageGameDuration").default(0),
  favoriteGame: varchar("favoriteGame", { length: 50 }),
  highestRating: int("highestRating").default(1000),
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameStatistic = typeof gameStatistics.$inferSelect;
export type InsertGameStatistic = typeof gameStatistics.$inferInsert;
