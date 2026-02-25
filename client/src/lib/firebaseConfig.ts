import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
} from "firebase/database";
import {
  getMessaging,
  onMessage,
  getToken,
  isSupported,
} from "firebase/messaging";

// Firebase 설정 (실제 환경에서는 환경변수에서 로드)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "glwa-demo.firebaseapp.com",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://glwa-demo.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "glwa-demo",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "glwa-demo.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123def456",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 메시징 초기화 (선택사항)
let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 실시간 데이터 동기화 함수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. 사용자 건강 데이터 실시간 동기화
export function subscribeToUserHealth(
  userId: number,
  callback: (data: any) => void
) {
  const userHealthRef = ref(database, `users/${userId}/health`);

  return onValue(userHealthRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
}

// 2. 결제 완료 알림 (실시간)
export async function notifyPaymentComplete(
  userId: number,
  paymentData: {
    orderId: string;
    amount: number;
    vipLevel: number;
    pointsAwarded: number;
  }
) {
  const notificationRef = ref(
    database,
    `users/${userId}/notifications/payment_${Date.now()}`
  );

  await set(notificationRef, {
    type: "payment_complete",
    title: "결제 완료!",
    message: `${paymentData.amount.toLocaleString()}원 결제가 완료되었습니다.`,
    vipLevel: paymentData.vipLevel,
    pointsAwarded: paymentData.pointsAwarded,
    timestamp: Date.now(),
    read: false,
  });
}

// 3. VIP 승급 알림 (실시간)
export async function notifyVIPUpgrade(
  userId: number,
  upgradeData: {
    previousLevel: number;
    currentLevel: number;
  }
) {
  const notificationRef = ref(
    database,
    `users/${userId}/notifications/vip_upgrade_${Date.now()}`
  );

  await set(notificationRef, {
    type: "vip_upgrade",
    title: "축하합니다! 🎉",
    message: `VIP ${upgradeData.previousLevel}단계에서 ${upgradeData.currentLevel}단계로 승급되었습니다!`,
    previousLevel: upgradeData.previousLevel,
    currentLevel: upgradeData.currentLevel,
    timestamp: Date.now(),
    read: false,
  });
}

// 4. 포인트 지급 알림 (실시간)
export async function notifyPointsAwarded(
  userId: number,
  pointsData: {
    points: number;
    reason: string;
  }
) {
  const notificationRef = ref(
    database,
    `users/${userId}/notifications/points_${Date.now()}`
  );

  await set(notificationRef, {
    type: "points_awarded",
    title: "포인트 지급!",
    message: `${pointsData.points}P가 지급되었습니다. (${pointsData.reason})`,
    points: pointsData.points,
    timestamp: Date.now(),
    read: false,
  });
}

// 5. 미션 진행 상황 실시간 동기화
export function subscribeToMissionProgress(
  userId: number,
  callback: (data: any) => void
) {
  const missionRef = ref(database, `users/${userId}/missions`);

  return onValue(missionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
}

// 6. 실시간 알림 구독
export function subscribeToNotifications(
  userId: number,
  callback: (notification: any) => void
) {
  const notificationsRef = ref(database, `users/${userId}/notifications`);

  return onValue(notificationsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // 최신 알림부터 정렬
      const notifications = Object.entries(data)
        .map(([key, value]) => ({ id: key, ...(value as any) }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      callback(notifications[0]); // 최신 알림만 전달
    }
  });
}

// 7. 리더보드 실시간 동기화
export function subscribeToLeaderboard(callback: (data: any[]) => void) {
  const leaderboardRef = ref(database, "leaderboard");

  return onValue(leaderboardRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const leaderboard = Object.entries(data)
        .map(([key, value]) => ({ userId: key, ...(value as any) }))
        .sort((a, b) => (b.points || 0) - (a.points || 0));

      callback(leaderboard);
    }
  });
}

// 8. 사용자 포인트 실시간 동기화
export function subscribeToUserPoints(
  userId: number,
  callback: (points: number) => void
) {
  const pointsRef = ref(database, `users/${userId}/wallet/points`);

  return onValue(pointsRef, (snapshot) => {
    const points = snapshot.val() || 0;
    callback(points);
  });
}

// 9. 데이터 업데이트 (배치 동기화)
export async function updateUserData(userId: number, data: Record<string, any>) {
  const userRef = ref(database, `users/${userId}`);

  await update(userRef, {
    ...data,
    lastUpdated: Date.now(),
  });
}

// 10. 알림 읽음 처리
export async function markNotificationAsRead(
  userId: number,
  notificationId: string
) {
  const notificationRef = ref(
    database,
    `users/${userId}/notifications/${notificationId}`
  );

  await update(notificationRef, {
    read: true,
  });
}

// 11. 푸시 알림 토큰 등록
export async function registerPushNotificationToken(userId: number) {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      const tokenRef = ref(database, `users/${userId}/pushTokens/${token}`);
      await set(tokenRef, {
        registered: true,
        timestamp: Date.now(),
      });

      return token;
    }
  } catch (error) {
    console.error("푸시 토큰 등록 실패:", error);
  }

  return null;
}

// 12. 포그라운드 푸시 알림 수신
export function setupForegroundNotifications(
  callback: (notification: any) => void
) {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("포그라운드 알림 수신:", payload);
    callback(payload);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 내보내기
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { database, app, messaging };
