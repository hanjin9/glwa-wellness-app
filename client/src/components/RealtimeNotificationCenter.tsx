import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  TrendingUp,
  Gift,
  AlertCircle,
  X,
} from "lucide-react";
import {
  subscribeToNotifications,
  markNotificationAsRead,
} from "@/lib/firebaseConfig";

interface Notification {
  id: string;
  type: "payment_complete" | "vip_upgrade" | "points_awarded" | "alert";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

interface RealtimeNotificationCenterProps {
  userId?: number;
  maxNotifications?: number;
}

export default function RealtimeNotificationCenter({
  userId,
  maxNotifications = 5,
}: RealtimeNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Firebase 실시간 알림 구독
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      if (notification) {
        setNotifications((prev) => {
          const updated = [notification, ...prev].slice(0, maxNotifications);
          const unread = updated.filter((n) => !n.read).length;
          setUnreadCount(unread);
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, [userId, maxNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await markNotificationAsRead(userId, notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_complete":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "vip_upgrade":
        return <TrendingUp className="w-5 h-5 text-[#d4af37]" />;
      case "points_awarded":
        return <Gift className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "payment_complete":
        return "border-green-500/30 bg-green-500/10";
      case "vip_upgrade":
        return "border-[#d4af37]/30 bg-[#d4af37]/10";
      case "points_awarded":
        return "border-yellow-500/30 bg-yellow-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 알림 센터 버튼 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 rounded-full p-3 transition-all"
      >
        <Bell className="w-6 h-6 text-[#d4af37]" />

        {/* 미읽음 배지 */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 알림 패널 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-96 bg-black/90 border border-[#d4af37]/30 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="bg-black/50 border-b border-[#d4af37]/20 px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#d4af37]" />
                실시간 알림
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#d4af37]/60 hover:text-[#d4af37] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 알림 목록 */}
            <div className="max-h-96 overflow-y-auto space-y-2 p-3">
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() =>
                        !notification.read &&
                        handleMarkAsRead(notification.id)
                      }
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${getNotificationColor(
                        notification.type
                      )} ${
                        notification.read
                          ? "opacity-60"
                          : "hover:border-[#d4af37]/60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">
                            {notification.title}
                          </p>
                          <p className="text-[#d4af37]/70 text-xs mt-1">
                            {notification.message}
                          </p>

                          {/* 추가 데이터 표시 */}
                          {notification.data && (
                            <div className="mt-2 text-xs space-y-1">
                              {notification.data.vipLevel && (
                                <p className="text-[#d4af37]">
                                  VIP {notification.data.vipLevel}단계
                                </p>
                              )}
                              {notification.data.pointsAwarded && (
                                <p className="text-yellow-400">
                                  +{notification.data.pointsAwarded}P
                                </p>
                              )}
                            </div>
                          )}

                          <p className="text-[#d4af37]/40 text-xs mt-2">
                            {new Date(notification.timestamp).toLocaleTimeString(
                              "ko-KR"
                            )}
                          </p>
                        </div>

                        {/* 미읽음 표시 */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#d4af37] rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 text-[#d4af37]/30 mx-auto mb-2" />
                    <p className="text-[#d4af37]/50 text-sm">
                      알림이 없습니다
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
