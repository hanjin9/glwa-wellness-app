import { useTranslation } from '@/hooks/useTranslation';

interface MembershipBadgeProps {
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TIER_CONFIG = {
  1: { name: 'silver', color: '#C0C0C0', bgColor: 'bg-gray-200', textColor: 'text-gray-800', icon: '🥈' },
  2: { name: 'gold', color: '#FFD700', bgColor: 'bg-yellow-200', textColor: 'text-yellow-900', icon: '🥇' },
  3: { name: 'greenEmerald', color: '#50C878', bgColor: 'bg-emerald-200', textColor: 'text-emerald-900', icon: '💚' },
  4: { name: 'blueSapphire', color: '#0F52BA', bgColor: 'bg-blue-200', textColor: 'text-blue-900', icon: '💎' },
  5: { name: 'diamond', color: '#B9F2FF', bgColor: 'bg-cyan-200', textColor: 'text-cyan-900', icon: '💠' },
  6: { name: 'blueDiamond', color: '#4169E1', bgColor: 'bg-indigo-200', textColor: 'text-indigo-900', icon: '💙' },
  7: { name: 'platinum', color: '#E5E4E2', bgColor: 'bg-slate-200', textColor: 'text-slate-900', icon: '⭐' },
  8: { name: 'blackPlatinum', color: '#1C1C1C', bgColor: 'bg-black', textColor: 'text-white', icon: '👑' }
};

const SIZE_CONFIG = {
  sm: { badge: 'w-8 h-8', icon: 'text-lg', text: 'text-xs' },
  md: { badge: 'w-12 h-12', icon: 'text-2xl', text: 'text-sm' },
  lg: { badge: 'w-16 h-16', icon: 'text-3xl', text: 'text-base' }
};

export default function MembershipBadge({ 
  tier, 
  size = 'md', 
  showLabel = true 
}: MembershipBadgeProps) {
  const { t } = useTranslation();
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`${sizeConfig.badge} ${config.bgColor} ${config.textColor} rounded-full flex items-center justify-center shadow-lg`}
        style={{ border: `3px solid ${config.color}` }}
      >
        <span className={sizeConfig.icon}>{config.icon}</span>
      </div>
      {showLabel && (
        <span className={`${sizeConfig.text} font-bold ${config.textColor}`}>
          {t.tiers[config.name as keyof typeof t.tiers]}
        </span>
      )}
    </div>
  );
}
