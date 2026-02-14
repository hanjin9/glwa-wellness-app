import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const HANJIN_LEVEL_COLORS = [
  { level: -9, color: '#dc2626', label: '진빨강', labelEn: 'Deep Red' },
  { level: -7, color: '#92400e', label: '진밤색', labelEn: 'Deep Brown' },
  { level: -5, color: '#ea580c', label: '진주황', labelEn: 'Deep Orange' },
  { level: -3, color: '#f97316', label: '연주황', labelEn: 'Light Orange' },
  { level: 0, color: '#fbbf24', label: '노랑', labelEn: 'Yellow' },
  { level: 3, color: '#84cc16', label: '연초록', labelEn: 'Light Green' },
  { level: 5, color: '#22c55e', label: '진초록', labelEn: 'Deep Green' },
  { level: 7, color: '#60a5fa', label: '연파랑', labelEn: 'Light Blue' },
  { level: 9, color: '#2563eb', label: '진파랑', labelEn: 'Deep Blue' }
];

interface HealthCheckColorSelectorProps {
  question: string;
  selectedLevel: number | null;
  onSelect: (level: number) => void;
}

export default function HealthCheckColorSelector({ 
  question, 
  selectedLevel, 
  onSelect 
}: HealthCheckColorSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold mb-3">{question}</h3>
      
      {/* 색상 원형 버튼 */}
      <div className="flex gap-2 mb-2">
        {HANJIN_LEVEL_COLORS.map((item) => (
          <motion.button
            key={item.level}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(item.level)}
            className="relative flex-1 aspect-square rounded-full shadow-md transition-all"
            style={{ 
              backgroundColor: item.color,
              border: selectedLevel === item.level ? '3px solid #000' : '2px solid #fff',
              boxShadow: selectedLevel === item.level 
                ? '0 4px 12px rgba(0,0,0,0.3)' 
                : '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            {selectedLevel === item.level && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white drop-shadow-lg" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* 숫자 레이블 */}
      <div className="flex gap-2 text-center">
        {HANJIN_LEVEL_COLORS.map((item) => (
          <div key={item.level} className="flex-1">
            <span 
              className="text-xs font-bold"
              style={{ color: item.color }}
            >
              {item.level > 0 ? '+' : ''}{item.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
