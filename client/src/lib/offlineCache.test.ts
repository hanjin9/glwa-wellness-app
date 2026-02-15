import { describe, it, expect } from 'vitest';
import { formatBytes } from './offlineCache';

describe('Offline Cache Utilities', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
    });

    it('should handle large numbers', () => {
      const largeSize = 1024 * 1024 * 1024 * 5.5;
      const result = formatBytes(largeSize, 2);
      expect(result).toContain('GB');
    });

    it('should handle small numbers', () => {
      expect(formatBytes(512, 2)).toBe('512 Bytes');
      expect(formatBytes(100, 2)).toBe('100 Bytes');
      expect(formatBytes(1, 2)).toBe('1 Bytes');
    });
  });
});
