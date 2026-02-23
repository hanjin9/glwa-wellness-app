import { z } from 'zod';

/**
 * 비트코인 시황 데이터 타입
 */
export interface BitcoinData {
  price: number; // USD
  priceKRW: number; // KRW
  change24h: number; // 24시간 변동률 (%)
  change7d: number; // 7일 변동률 (%)
  high24h: number; // 24시간 최고가
  low24h: number; // 24시간 최저가
  volume24h: number; // 24시간 거래량
  marketCap: number; // 시가총액
  dominance: number; // 시장 지배력 (%)
  timestamp: number; // 업데이트 시간 (Unix timestamp)
}

/**
 * 캐시된 비트코인 데이터
 */
let cachedBitcoinData: BitcoinData | null = null;
let lastUpdateTime = 0;
const CACHE_DURATION = 60 * 1000; // 1분 캐시

/**
 * CoinGecko API에서 비트코인 데이터 조회
 */
export async function fetchBitcoinData(): Promise<BitcoinData> {
  const now = Date.now();
  
  // 캐시 확인
  if (cachedBitcoinData && now - lastUpdateTime < CACHE_DURATION) {
    return cachedBitcoinData;
  }

  try {
    // CoinGecko API 호출 (무료, 인증 불필요)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,krw&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_7d_change=true&include_high_low_24h=true&include_market_cap_change_percentage_24h=true'
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // 시장 지배력 데이터 (별도 API)
    let dominance = 0;
    try {
      const globalResponse = await fetch(
        'https://api.coingecko.com/api/v3/global'
      );
      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        dominance = globalData.data.btc_market_cap_percentage || 0;
      }
    } catch (e) {
      console.warn('Failed to fetch market dominance:', e);
    }

    const bitcoinData: BitcoinData = {
      price: data.bitcoin.usd || 0,
      priceKRW: data.bitcoin.krw || 0,
      change24h: data.bitcoin.usd_24h_change || 0,
      change7d: data.bitcoin.usd_7d_change || 0,
      high24h: data.bitcoin.usd_24h_high || 0,
      low24h: data.bitcoin.usd_24h_low || 0,
      volume24h: data.bitcoin.usd_24h_vol || 0,
      marketCap: data.bitcoin.usd_market_cap || 0,
      dominance,
      timestamp: now,
    };

    // 캐시 업데이트
    cachedBitcoinData = bitcoinData;
    lastUpdateTime = now;

    return bitcoinData;
  } catch (error) {
    console.error('Error fetching Bitcoin data:', error);
    
    // 캐시 데이터 반환 (캐시가 있으면)
    if (cachedBitcoinData) {
      return cachedBitcoinData;
    }

    // 기본값 반환
    return {
      price: 0,
      priceKRW: 0,
      change24h: 0,
      change7d: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      marketCap: 0,
      dominance: 0,
      timestamp: now,
    };
  }
}

/**
 * 비트코인 데이터 포맷팅 (템플릿용)
 */
export function formatBitcoinData(data: BitcoinData) {
  return {
    // 가격
    price: {
      usd: `$${data.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      krw: `₩${data.priceKRW.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`,
    },
    // 변동률
    change: {
      h24: {
        value: data.change24h.toFixed(2),
        label: '24시간',
        color: data.change24h >= 0 ? 'green' : 'red',
      },
      d7: {
        value: data.change7d.toFixed(2),
        label: '7일',
        color: data.change7d >= 0 ? 'green' : 'red',
      },
    },
    // 범위
    range24h: {
      high: `$${data.high24h.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      low: `$${data.low24h.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
    },
    // 거래량
    volume24h: `$${(data.volume24h / 1e9).toFixed(2)}B`,
    // 시가총액
    marketCap: `$${(data.marketCap / 1e12).toFixed(2)}T`,
    // 시장 지배력
    dominance: `${data.dominance.toFixed(2)}%`,
    // 업데이트 시간
    updatedAt: new Date(data.timestamp).toLocaleTimeString('ko-KR'),
  };
}

/**
 * 비트코인 데이터 검증 스키마
 */
export const BitcoinDataSchema = z.object({
  price: z.number(),
  priceKRW: z.number(),
  change24h: z.number(),
  change7d: z.number(),
  high24h: z.number(),
  low24h: z.number(),
  volume24h: z.number(),
  marketCap: z.number(),
  dominance: z.number(),
  timestamp: z.number(),
});
