import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface HanJinLevel {
  level: number;
  emoji: string;
  color: string;
  strength: string;
  text: string;
}

interface BitcoinBrief {
  title: string;
  timestamp: string;
  price: string;
  priceRange: {
    low: string;
    high: string;
  };
  macroEvents: Array<{
    emoji: string;
    title: string;
    daysUntil: number;
    importance: string;
  }>;
  news: Array<{
    rank: number;
    title: string;
    sentiment: string;
    impact: number;
    hanJinLevel: HanJinLevel;
  }>;
  tradingPlan: {
    shortTerm: {
      long: string;
      short: string;
    };
    weekly: string;
  };
  execution: Array<{
    type: string;
    longPercentage: number;
    longImpact: number;
    shortPercentage: number;
    shortImpact: number;
    details: Array<{
      condition: string;
      targetPrices: string[];
      stopLoss: string;
    }>;
  }>;
  strategies: {
    scalping: {
      long: string;
      short: string;
    };
    dayTrading: {
      long: string;
      short: string;
    };
    swingTrading: {
      long: string;
      short: string;
    };
  };
  whaleFlow: {
    whales: string;
    etf: string;
    derivatives: string;
    onChain: string;
  };
  globalBrief: Array<{
    point: string;
    sentiment: string;
    impact: number;
    hanJinLevel: HanJinLevel;
  }>;
  recommendation: string;
  keyPoints: Array<string>;
}

export default function BitcoinMarket() {
  const [, setLocation] = useLocation();
  const [brief, setBrief] = useState<BitcoinBrief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: analysisData, isLoading: isFetching, refetch } = trpc.bitcoin.getAnalysisBrief.useQuery();

  useEffect(() => {
    if (analysisData) {
      if (analysisData.success && analysisData.brief) {
        setBrief(analysisData.brief);
        setError(null);
      } else {
        setError(analysisData.error || '분석을 불러올 수 없습니다');
      }
      setIsLoading(false);
    }
  }, [analysisData]);

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-300">비트코인 시황을 분석 중...</p>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="mb-4 text-white border-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>

          <Card className="p-6 bg-red-900/20 border-red-500">
            <p className="text-red-300 text-center">
              {error || '비트코인 분석을 불러올 수 없습니다'}
            </p>
            <Button
              onClick={() => refetch()}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-white border-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white">{brief.title}</h1>
            <p className="text-gray-400 text-sm">{brief.timestamp} KST</p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 실시간 가격 */}
        <Card className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/50">
          <h2 className="text-xl font-bold text-white mb-4">💰 실시간 가격</h2>
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-300 mb-4">{brief.price}</p>
            <div className="text-gray-300">
              <p className="text-sm mb-1">24h Range</p>
              <p>Low: {brief.priceRange.low} — High: {brief.priceRange.high}</p>
            </div>
          </div>
        </Card>

        {/* 주요 매크로 이벤트 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">📅 주요 매크로 이벤트</h2>
          <div className="space-y-2">
            {brief.macroEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-300">
                <span className="text-lg">{event.emoji}</span>
                <span>+{event.daysUntil}</span>
                <span>{event.title}</span>
                <span className="text-xs text-gray-500">({event.importance})</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 주요 뉴스 / 이슈 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">📰 주요 뉴스 / 이슈</h2>
          <div className="space-y-3">
            {brief.news.map((item) => (
              <div key={item.rank} className="pb-3 border-b border-gray-700 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-400">{item.rank}.</span>
                  <div className="flex-1">
                    <p className="text-gray-300 mb-1">{item.title}</p>
                    <div className="text-lg font-bold">{item.hanJinLevel.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trading Plan */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">📈 Trading Plan</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white mb-2">[단기]</h4>
              <div className="ml-4 space-y-1 text-gray-300">
                <p>🟢 롱: {brief.tradingPlan.shortTerm.long}</p>
                <p>🔴 숏: {brief.tradingPlan.shortTerm.short}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">[주간]</h4>
              <p className="ml-4 text-gray-300">🟢 롱 중심: {brief.tradingPlan.weekly}</p>
            </div>
          </div>
        </Card>

        {/* Execution */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">⚔️ Execution</h2>
          <div className="space-y-4">
            {brief.execution.map((exec, idx) => (
              <div key={idx} className="pb-4 border-b border-gray-700 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{exec.type}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">롱 📈 {exec.longPercentage}% 🟢 +{exec.longImpact.toFixed(0)}</span>
                    <span className="text-red-400">숏 📉 {exec.shortPercentage}% 🔴 −{exec.shortImpact.toFixed(0)}</span>
                  </div>
                </div>
                <div className="ml-4 space-y-2">
                  {exec.details.map((detail, didx) => (
                    <div key={didx} className="text-sm text-gray-300">
                      <p>• {detail.condition}</p>
                      <p className="ml-4">→ TP {detail.targetPrices.join(' / ')} → SL {detail.stopLoss}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 전략 세분화 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">📊 전략 세분화</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white mb-2">스켈핑</h4>
              <div className="ml-4 space-y-1 text-sm text-gray-300">
                <p>• 롱: {brief.strategies.scalping.long}</p>
                <p>• 숏: {brief.strategies.scalping.short}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">데이 트레이딩</h4>
              <div className="ml-4 space-y-1 text-sm text-gray-300">
                <p>• 롱: {brief.strategies.dayTrading.long}</p>
                <p>• 숏: {brief.strategies.dayTrading.short}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">스윙 트레이딩</h4>
              <div className="ml-4 space-y-1 text-sm text-gray-300">
                <p>• 롱: {brief.strategies.swingTrading.long}</p>
                <p>• 숏: {brief.strategies.swingTrading.short}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 세력 흐름 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">🐋 세력 흐름 요약</h2>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• 고래 흐름: {brief.whaleFlow.whales}</p>
            <p>• ETF 흐름: {brief.whaleFlow.etf}</p>
            <p>• 파생 지표: {brief.whaleFlow.derivatives}</p>
            <p>• 온체인: {brief.whaleFlow.onChain}</p>
          </div>
        </Card>

        {/* 글로벌 시황 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">🌍 현재 세계 시황 정리 Brief</h2>
          <div className="space-y-3">
            {brief.globalBrief.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-700 last:border-0">
                <span className="font-bold text-lg whitespace-nowrap">{item.hanJinLevel.text}</span>
                <span className="text-gray-300">{item.point}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 추천 전략 */}
        <Card className="p-6 bg-blue-900/20 border-blue-500/50">
          <h2 className="text-lg font-bold text-white mb-4">🌟 추천 전략</h2>
          <p className="text-blue-200">{brief.recommendation}</p>
        </Card>

        {/* 주요 포인트 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">📌 시황 주요 포인트 요약</h2>
          <ul className="space-y-2">
            {brief.keyPoints.map((point, idx) => (
              <li key={idx} className="flex gap-2 text-gray-300">
                <span>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 안내 메시지 */}
        <Card className="p-4 bg-green-900/20 border-green-500/50 mb-8">
          <p className="text-green-300 text-sm">
            💡 <strong>팁:</strong> 이 페이지는 우리 앱 내부 시스템입니다. 
            외부 사이트로 이동하지 않으며, 실시간 AI 분석을 제공합니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
