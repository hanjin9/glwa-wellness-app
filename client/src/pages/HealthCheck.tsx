import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HealthCheckColorSelector from '@/components/HealthCheckColorSelector';
import { ArrowLeft, Save } from 'lucide-react';
import { useLocation } from 'wouter';

const QUESTIONS = [
  { id: 'sleep', key: 'sleep' },
  { id: 'energy', key: 'energy' },
  { id: 'stress', key: 'stress' },
  { id: 'appetite', key: 'appetite' },
  { id: 'digestion', key: 'digestion' },
  { id: 'mood', key: 'mood' }
];

export default function HealthCheckPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSelect = (questionId: string, level: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: level }));
  };

  const handleSubmit = () => {
    console.log('건강 체크 결과:', answers);
    // TODO: API 저장
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-8">
        <button 
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2 mb-4 text-white/90 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t.common.back}</span>
        </button>
        <h1 className="text-2xl font-bold">{t.healthCheck.title}</h1>
        <p className="text-sm opacity-90 mt-1">오늘의 건강 상태를 체크하세요</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {QUESTIONS.map((q) => (
          <Card key={q.id} className="p-5">
            <HealthCheckColorSelector
              question={t.healthCheck.questions[q.key as keyof typeof t.healthCheck.questions]}
              selectedLevel={answers[q.id] ?? null}
              onSelect={(level) => handleSelect(q.id, level)}
            />
          </Card>
        ))}

        {/* 제출 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < QUESTIONS.length}
          className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 text-white"
        >
          <Save className="w-5 h-5 mr-2" />
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}
