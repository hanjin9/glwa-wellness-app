import { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

export default function TopInfoBar() {
  const [time, setTime] = useState<string>('');
  const [bitcoin, setBitcoin] = useState<number | null>(null);

  // 실시간 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 비트코인 가격 조회 (CoinGecko API - 무료, API 키 불필요)
  useEffect(() => {
    const fetchBitcoin = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        if (data.bitcoin?.usd) {
          setBitcoin(Math.round(data.bitcoin.usd));
        }
      } catch (error) {
        console.error('Bitcoin API error:', error);
      }
    };
    fetchBitcoin();
    const interval = setInterval(fetchBitcoin, 60000); // 1분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* 실시간 시간 */}
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
        <Clock className="w-3.5 h-3.5" />
        <span>{time || '--:--'}</span>
      </div>

      {/* 비트코인 가격 */}
      {bitcoin && (
        <button
          onClick={() => window.open('https://www.coingecko.com/en/coins/bitcoin', '_blank')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all text-xs font-medium"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>${bitcoin.toLocaleString()}</span>
        </button>
      )}

      {/* 날씨 위젯 */}
      <WeatherWidget />
    </div>
  );
}
