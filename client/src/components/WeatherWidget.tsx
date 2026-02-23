import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          console.warn('OpenWeather API key not configured');
          setLoading(false);
          return;
        }

        // 사용자 위치 기반 (기본값: 서울)
        const lat = 37.5665;
        const lon = 126.9780;

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ko`
        );

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: getWeatherIcon(data.weather[0].main),
          humidity: Math.round(data.main.humidity),
          windSpeed: Math.round(data.wind.speed * 10) / 10,
        });
      } catch (error) {
        console.error('Weather fetch error:', error);
        // Fallback: Open-Meteo API (무료, API 키 불필요)
        fetchWeatherFallback();
      } finally {
        setLoading(false);
      }
    };

    const fetchWeatherFallback = async () => {
      try {
        const lat = 37.5665;
        const lon = 126.9780;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,weather_code&timezone=Asia/Seoul`
        );
        const data = await response.json();
        
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: getWeatherConditionFromCode(data.current.weather_code),
            icon: getWeatherIconFromCode(data.current.weather_code),
            humidity: data.current.relative_humidity_2m,
          });
        }
      } catch (error) {
        console.error('Fallback weather fetch error:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return '⛈️';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️';
    return '🌤️';
  };

  const getWeatherConditionFromCode = (code: number): string => {
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

  const getWeatherIconFromCode = (code: number): string => {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 80 && code <= 99) return '⛈️';
    return '🌤️';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">
        <Cloud className="w-3.5 h-3.5 animate-pulse" />
        <span>--°C</span>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <>
      {/* 날씨 위젯 */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-all text-xs font-medium cursor-pointer"
        title="날씨 정보"
      >
        <span className="text-lg">{weather.icon}</span>
        <span>{weather.temp}°C</span>
      </button>

      {/* 날씨 상세 정보 모달 */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">날씨 정보</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* 현재 날씨 */}
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">현재 날씨</p>
                  <p className="text-4xl font-bold text-blue-600">{weather.temp}°C</p>
                  <p className="text-sm text-gray-600 mt-2">{weather.condition}</p>
                </div>
                <div className="text-6xl">{weather.icon}</div>
              </div>
            </div>

            {/* 상세 정보 */}
            {(weather.humidity !== undefined || weather.windSpeed !== undefined) && (
              <div className="space-y-2 mb-4">
                {weather.humidity !== undefined && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">습도: {weather.humidity}%</span>
                  </div>
                )}
                {weather.windSpeed !== undefined && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">풍속: {weather.windSpeed} m/s</span>
                  </div>
                )}
              </div>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowDetails(false)}
              className="w-full py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
