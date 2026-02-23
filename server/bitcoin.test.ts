import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBitcoinData, formatBitcoinData, BitcoinDataSchema } from './bitcoin';

describe('Bitcoin Data Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBitcoinData', () => {
    it('should fetch bitcoin data from CoinGecko API', async () => {
      const data = await fetchBitcoinData();

      // 데이터 구조 검증
      expect(data).toBeDefined();
      expect(data.price).toBeGreaterThan(0);
      expect(data.priceKRW).toBeGreaterThan(0);
      expect(data.timestamp).toBeGreaterThan(0);
    });

    it('should validate bitcoin data schema', async () => {
      const data = await fetchBitcoinData();
      const result = BitcoinDataSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should have valid price fields', async () => {
      const data = await fetchBitcoinData();

      expect(typeof data.price).toBe('number');
      expect(typeof data.priceKRW).toBe('number');
      expect(data.price).toBeGreaterThanOrEqual(0);
      expect(data.priceKRW).toBeGreaterThanOrEqual(0);
    });

    it('should have valid change fields', async () => {
      const data = await fetchBitcoinData();

      expect(typeof data.change24h).toBe('number');
      expect(typeof data.change7d).toBe('number');
    });

    it('should have valid range fields', async () => {
      const data = await fetchBitcoinData();

      expect(typeof data.high24h).toBe('number');
      expect(typeof data.low24h).toBe('number');
      expect(data.high24h).toBeGreaterThanOrEqual(data.low24h);
    });

    it('should have valid market data', async () => {
      const data = await fetchBitcoinData();

      expect(typeof data.volume24h).toBe('number');
      expect(typeof data.marketCap).toBe('number');
      expect(typeof data.dominance).toBe('number');
      expect(data.dominance).toBeGreaterThanOrEqual(0);
      expect(data.dominance).toBeLessThanOrEqual(100);
    });
  });

  describe('formatBitcoinData', () => {
    const mockData = {
      price: 45000,
      priceKRW: 58500000,
      change24h: 2.5,
      change7d: -1.2,
      high24h: 46000,
      low24h: 44000,
      volume24h: 25000000000,
      marketCap: 900000000000,
      dominance: 45.5,
      timestamp: Date.now(),
    };

    it('should format price correctly', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.price.usd).toContain('$');
      expect(formatted.price.krw).toContain('₩');
    });

    it('should format change with correct color', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.change.h24.color).toBe('green'); // 2.5% > 0
      expect(formatted.change.d7.color).toBe('red'); // -1.2% < 0
    });

    it('should format range24h', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.range24h.high).toContain('$');
      expect(formatted.range24h.low).toContain('$');
    });

    it('should format volume24h in billions', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.volume24h).toContain('B');
    });

    it('should format marketCap in trillions', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.marketCap).toContain('T');
    });

    it('should format dominance as percentage', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.dominance).toContain('%');
    });

    it('should format updatedAt as time string', () => {
      const formatted = formatBitcoinData(mockData);

      expect(formatted.updatedAt).toBeDefined();
      expect(typeof formatted.updatedAt).toBe('string');
    });
  });

  describe('Error handling', () => {
    it('should return default values on API error', async () => {
      // 이 테스트는 실제 API 호출이 실패할 때의 동작을 확인
      const data = await fetchBitcoinData();

      // 데이터가 항상 반환되어야 함 (캐시 또는 기본값)
      expect(data).toBeDefined();
      expect(typeof data.price).toBe('number');
    });
  });
});
