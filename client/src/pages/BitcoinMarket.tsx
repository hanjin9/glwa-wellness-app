import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface BitcoinData {
  price: number;
  priceKRW: number;
  change24h: number;
  change7d: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  dominance: number;
  timestamp: number;
}

interface FormattedData {
  price: {
    usd: string;
    krw: string;
  };
  change: {
    h24: {
      value: string;
      label: string;
      color: string;
    };
    d7: {
      value: string;
      label: string;
      color: string;
    };
  };
  range24h: {
    high: string;
    low: string;
  };
  volume24h: string;
  marketCap: string;
  dominance: string;
  updatedAt: string;
}

export default function BitcoinMarket() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<BitcoinData | null>(null);
  const [formatted, setFormatted] = useState<FormattedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 비트코인 데이터 조회
  const { data: bitcoinResponse, isLoading: isFetching, refetch } = trpc.bitcoin.getCurrentData.useQuery();

  useEffect(() => {
    if (bitcoinResponse) {
      if (bitcoinResponse.success && bitcoinResponse.data && bitcoinResponse.formatted) {
        setData(bitcoinResponse.data);
        setFormatted(bitcoinResponse.formatted);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(bitcoinResponse.error || '데이터를 불러올 수 없습니다');
      }
      setIsLoading(false);
    }
  }, [bitcoinResponse]);

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
          <p className="text-gray-300">비트코인 시황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !formatted) {
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
              {error || '비트코인 데이터를 불러올 수 없습니다'}
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

  const isPositive24h = data.change24h >= 0;
  const isPositive7d = data.change7d >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-white border-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-white">₿ 비트코인</h1>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 주요 가격 정보 */}
        <Card className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/50">
          <div className="space-y-4">
            {/* USD 가격 */}
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">USD 가격</p>
              <p className="text-4xl font-bold text-white">{formatted.price.usd}</p>
            </div>

            {/* KRW 가격 */}
            <div className="text-center border-t border-orange-500/30 pt-4">
              <p className="text-gray-300 text-sm mb-1">KRW 가격</p>
              <p className="text-3xl font-bold text-orange-300">{formatted.price.krw}</p>
            </div>
          </div>
        </Card>

        {/* 변동률 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 24시간 변동률 */}
          <Card className={`p-4 ${isPositive24h ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">{formatted.change.h24.label}</p>
                <p className={`text-2xl font-bold ${isPositive24h ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive24h ? '+' : ''}{formatted.change.h24.value}%
                </p>
              </div>
              {isPositive24h ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </Card>

          {/* 7일 변동률 */}
          <Card className={`p-4 ${isPositive7d ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">{formatted.change.d7.label}</p>
                <p className={`text-2xl font-bold ${isPositive7d ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive7d ? '+' : ''}{formatted.change.d7.value}%
                </p>
              </div>
              {isPositive7d ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </Card>
        </div>

        {/* 상세 정보 */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">상세 정보</h2>
          <div className="space-y-3">
            {/* 24시간 범위 */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">24시간 범위</span>
              <div className="text-right">
                <p className="text-sm text-gray-400">최고: {formatted.range24h.high}</p>
                <p className="text-sm text-gray-400">최저: {formatted.range24h.low}</p>
              </div>
            </div>

            {/* 24시간 거래량 */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">24시간 거래량</span>
              <span className="text-white font-semibold">{formatted.volume24h}</span>
            </div>

            {/* 시가총액 */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">시가총액</span>
              <span className="text-white font-semibold">{formatted.marketCap}</span>
            </div>

            {/* 시장 지배력 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">시장 지배력</span>
              <span className="text-white font-semibold">{formatted.dominance}</span>
            </div>
          </div>
        </Card>

        {/* 업데이트 시간 */}
        <div className="text-center text-gray-400 text-sm">
          <p>마지막 업데이트: {formatted.updatedAt}</p>
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((Date.now() - lastUpdate.getTime()) / 1000)}초 전
            </p>
          )}
        </div>

        {/* 안내 메시지 */}
        <Card className="p-4 bg-blue-900/20 border-blue-500/50">
          <p className="text-blue-300 text-sm">
            💡 <strong>팁:</strong> 이 페이지는 우리 앱 내부 시스템입니다. 
            외부 사이트로 이동하지 않으며, 실시간 데이터를 제공합니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
