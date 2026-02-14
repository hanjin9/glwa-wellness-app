import { useState, useEffect } from 'react';

const STORAGE_KEY = 'glwa-font-scale';

export type FontScale = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

const FONT_SCALES: Record<FontScale, number> = {
  xs: 0.75,    // 매우 작게 / Very Small
  sm: 0.875,   // 작게 / Small
  base: 1,     // 보통 / Normal
  lg: 1.125,   // 크게 / Large
  xl: 1.25     // 매우 크게 / Very Large
};

export function useFontScale() {
  const [scale, setScale] = useState<FontScale>('base');

  useEffect(() => {
    const savedScale = localStorage.getItem(STORAGE_KEY) as FontScale;
    if (savedScale && FONT_SCALES[savedScale]) {
      setScale(savedScale);
      applyFontScale(savedScale);
    }
  }, []);

  const applyFontScale = (newScale: FontScale) => {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', FONT_SCALES[newScale].toString());
    
    // 기본 폰트 크기 적용 (16px 기준)
    const baseSize = 16 * FONT_SCALES[newScale];
    root.style.fontSize = `${baseSize}px`;
  };

  const changeFontScale = (newScale: FontScale) => {
    setScale(newScale);
    localStorage.setItem(STORAGE_KEY, newScale);
    applyFontScale(newScale);
  };

  return { scale, changeFontScale, scales: FONT_SCALES };
}
