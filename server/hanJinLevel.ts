/**
 * HanJin Level 시스템
 * 범위: -9 ~ +9 (총 19단계)
 * 표시: 이모티콘 색상 + 숫자
 */

export interface HanJinLevel {
  level: number; // -9 ~ +9
  emoji: string; // 이모티콘
  color: 'green' | 'yellow' | 'red'; // 색상
  strength: 'very_strong' | 'strong' | 'medium' | 'weak' | 'neutral'; // 강도
  text: string; // 텍스트 표현 (예: "🟢🟢🟢 +9")
}

/**
 * 숫자를 HanJin Level로 변환
 * @param level -9 ~ +9 범위의 숫자
 */
export function getHanJinLevel(level: number): HanJinLevel {
  // 범위 제한
  const normalizedLevel = Math.max(-9, Math.min(9, Math.round(level)));

  let emoji: string;
  let color: 'green' | 'yellow' | 'red';
  let strength: 'very_strong' | 'strong' | 'medium' | 'weak' | 'neutral';

  if (normalizedLevel >= 7) {
    // 매우 강한 상승
    emoji = '🟢🟢🟢';
    color = 'green';
    strength = 'very_strong';
  } else if (normalizedLevel >= 4) {
    // 중간 상승
    emoji = '🟢🟢';
    color = 'green';
    strength = 'strong';
  } else if (normalizedLevel >= 1) {
    // 약한 상승
    emoji = '🟢';
    color = 'green';
    strength = 'weak';
  } else if (normalizedLevel === 0) {
    // 중립
    emoji = '🟡';
    color = 'yellow';
    strength = 'neutral';
  } else if (normalizedLevel >= -3) {
    // 약한 하락
    emoji = '🔴';
    color = 'red';
    strength = 'weak';
  } else if (normalizedLevel >= -6) {
    // 중간 하락
    emoji = '🔴🔴';
    color = 'red';
    strength = 'strong';
  } else {
    // 매우 강한 하락
    emoji = '🔴🔴🔴';
    color = 'red';
    strength = 'very_strong';
  }

  const sign = normalizedLevel > 0 ? '+' : '';
  const text = `${emoji} ${sign}${normalizedLevel}`;

  return {
    level: normalizedLevel,
    emoji,
    color,
    strength,
    text,
  };
}

/**
 * 감정 점수(0-10)를 HanJin Level로 변환
 * @param sentiment 감정 점수 (0-10)
 * @param isBullish true면 양수, false면 음수
 */
export function sentimentToHanJinLevel(sentiment: number, isBullish: boolean = true): HanJinLevel {
  // 0-10을 -9 ~ +9로 변환
  const normalized = (sentiment / 10) * 9;
  const level = isBullish ? normalized : -normalized;
  return getHanJinLevel(level);
}

/**
 * 여러 지표를 조합하여 종합 HanJin Level 계산
 * @param indicators 지표 배열 (각 지표는 -9 ~ +9 범위)
 */
export function calculateCompositeHanJinLevel(indicators: number[]): HanJinLevel {
  if (indicators.length === 0) {
    return getHanJinLevel(0);
  }

  const average = indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
  return getHanJinLevel(average);
}

/**
 * HanJin Level을 한글 설명으로 변환
 */
export function hanJinLevelToKorean(level: HanJinLevel): string {
  const descriptions: Record<number, string> = {
    9: '극도로 강한 상승 신호',
    8: '매우 강한 상승 신호',
    7: '강한 상승 신호',
    6: '중간 상승 신호',
    5: '중간 상승 신호',
    4: '약한 상승 신호',
    3: '약한 상승 신호',
    2: '약한 상승 신호',
    1: '약간의 상승 신호',
    0: '중립 신호',
    '-1': '약간의 하락 신호',
    '-2': '약한 하락 신호',
    '-3': '약한 하락 신호',
    '-4': '약한 하락 신호',
    '-5': '중간 하락 신호',
    '-6': '중간 하락 신호',
    '-7': '강한 하락 신호',
    '-8': '매우 강한 하락 신호',
    '-9': '극도로 강한 하락 신호',
  };

  return descriptions[level.level] || '알 수 없음';
}

/**
 * HanJin Level 배열을 정렬하여 표시 (강도 순)
 */
export function sortByHanJinLevel(items: Array<{ level: HanJinLevel; title: string }>): Array<{ level: HanJinLevel; title: string }> {
  return items.sort((a, b) => Math.abs(b.level.level) - Math.abs(a.level.level));
}

/**
 * HanJin Level 범위 검사
 */
export function isHanJinLevelBullish(level: HanJinLevel): boolean {
  return level.level > 0;
}

export function isHanJinLevelBearish(level: HanJinLevel): boolean {
  return level.level < 0;
}

export function isHanJinLevelNeutral(level: HanJinLevel): boolean {
  return level.level === 0;
}

/**
 * HanJin Level 강도 비교
 */
export function compareHanJinLevel(level1: HanJinLevel, level2: HanJinLevel): number {
  // 절대값 기준으로 비교 (강도)
  return Math.abs(level2.level) - Math.abs(level1.level);
}
