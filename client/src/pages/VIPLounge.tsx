import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Sparkles, Users, Video, Gift, Calendar, Trophy, BookOpen, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const VIP_BENEFITS = [
  { id: 'healthCare', icon: '🏥', color: 'blue' },
  { id: 'healthKit', icon: '📦', color: 'green' },
  { id: 'globalNetwork', icon: '🌍', color: 'purple' },
  { id: 'themeTravel', icon: '✈️', color: 'orange' },
  { id: 'wineParty', icon: '🍷', color: 'red' },
  { id: 'hobbyCircle', icon: '🎨', color: 'pink' },
  { id: 'vipCoupon', icon: '🎫', color: 'yellow' },
  { id: 'videoConsult', icon: '📹', color: 'teal' },
  { id: 'guestPass', icon: '🎟️', color: 'indigo' },
  { id: 'networkEvent', icon: '🤝', color: 'cyan' },
  { id: 'challenge', icon: '🏆', color: 'amber' },
  { id: 'directory', icon: '📇', color: 'lime' },
  { id: 'bookClub', icon: '📚', color: 'violet' },
  { id: 'streaming', icon: '🎵', color: 'emerald' }
];

export default function VIPLoungePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{t.vipLounge.title}</h1>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">128 {t.vipLounge.onlineCount}</span>
          </div>
        </div>
        <p className="text-sm opacity-90">글로벌 리더 전용 프리미엄 라운지</p>
      </div>

      {/* Benefits Grid */}
      <div className="px-4 py-6 grid grid-cols-2 gap-4">
        {VIP_BENEFITS.map((benefit, index) => (
          <motion.div
            key={benefit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-xl transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-2xl flex items-center justify-center text-3xl`}>
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-sm leading-tight">
                  {t.vipLounge.benefits[benefit.id as keyof typeof t.vipLounge.benefits]}
                </h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
