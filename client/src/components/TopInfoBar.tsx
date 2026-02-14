import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Cloud } from 'lucide-react';

export default function TopInfoBar() {
  const [time, setTime] = useState<string>('');
  const [bitcoin, setBitcoin] = useState<number | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

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

  // 날씨 정보 조회 (Open-Meteo API - 무료, API 키 불필요)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 사용자 위치 기반 (서울 기본값)
        const lat = 37.5665;
        const lon = 126.9780;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia/Seoul`
        );
        const data = await res.json();
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weather_code),
          });
        }
      } catch (error) {
        console.error('Weather API error:', error);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return '맑음';
    if (code === 1 || code === 2) return '구름';
    if (code === 3) return '흐림';
    if (code === 45 || code === 48) return '안개';
    if (code >= 51 && code <= 67) return '비';
    if (code >= 71 && code <= 77) return '눈';
    if (code >= 80 && code <= 82) return '소나기';
    if (code >= 85 && code <= 86) return '눈소나기';
    if (code >= 80 && code <= 99) return '뇌우';
    return '날씨';
  };

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

      {/* 날씨 */}
      {weather && (
        <button
          onClick={() => setShowWeatherModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-all text-xs font-medium"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>{weather.temp}°C</span>
        </button>
      )}

      {/* 날씨 모달 */}
      {showWeatherModal && weather && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">날씨 정보</h2>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">현재 날씨</p>
                <p className="text-3xl font-bold text-blue-600">{weather?.temp}°C</p>
                <p className="text-sm text-gray-600 mt-2">{weather?.condition}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">더 자세한 날씨 정보</p>
                <button
                  onClick={() => window.open('https://weather.naver.com/', '_blank')}
                  className="w-full py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                >
                  네이버 날씨 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
