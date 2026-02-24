import { invokeLLM } from "./_core/llm";
import { BitcoinData } from "./bitcoin";
import { getHanJinLevel, sentimentToHanJinLevel, HanJinLevel } from "./hanJinLevel";

/**
 * 비트코인 시황 분석 결과
 */
export interface BitcoinBrief {
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
    details: {
      condition: string;
      targetPrices: string[];
      stopLoss: string;
    }[];
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

/**
 * 감정 점수를 이모티콘으로 변환
 */
function sentimentToEmoji(sentiment: string, impact: number): string {
  if (sentiment === 'bullish' || sentiment === 'positive') {
    if (impact >= 7) return '🟢🟢🟢';
    if (impact >= 5) return '🟢🟢';
    return '🟢';
  } else if (sentiment === 'bearish' || sentiment === 'negative') {
    if (impact >= 7) return '🔴🔴🔴';
    if (impact >= 5) return '🔴🔴';
    return '🔴';
  } else {
    if (impact >= 5) return '🟡🟡';
    return '🟡';
  }
}

/**
 * 감정 점수를 색상 동그라미로 변환
 */
function impactToCircles(impact: number): string {
  if (impact >= 8) return '🟢🟢🟢';
  if (impact >= 6) return '🟢🟢';
  if (impact >= 4) return '🟢';
  if (impact >= 2) return '🟡';
  return '🔴';
}

/**
 * AI를 사용하여 비트코인 시황 분석
 */
export async function analyzeBitcoinMarket(bitcoinData: BitcoinData): Promise<BitcoinBrief> {
  const prompt = `
당신은 전문 암호화폐 트레이더이자 분석가입니다. 다음 비트코인 데이터를 분석하여 상세한 시황 분석 보고서를 작성하세요.

**비트코인 현재 데이터:**
- 가격: $${bitcoinData.price.toLocaleString()}
- 24시간 변동률: ${bitcoinData.change24h.toFixed(2)}%
- 7일 변동률: ${bitcoinData.change7d.toFixed(2)}%
- 24시간 범위: $${bitcoinData.low24h.toLocaleString()} ~ $${bitcoinData.high24h.toLocaleString()}
- 24시간 거래량: $${(bitcoinData.volume24h / 1e9).toFixed(2)}B
- 시가총액: $${(bitcoinData.marketCap / 1e12).toFixed(2)}T
- 시장 지배력: ${bitcoinData.dominance.toFixed(2)}%

**분석 요청:**
1. 현재 시장 상황 요약 (한 문장)
2. 주요 매크로 이벤트 3개 (예정된 경제 지표, FOMC 등)
3. 주요 뉴스/이슈 3개 (현재 시장에 영향을 미치는 요소)
4. 단기/주간 트레이딩 플랜
5. 실행 전략 (롱/숏 비율, 목표가, 손절가)
6. 스켈핑/데이트레이딩/스윙트레이딩 전략
7. 세력 흐름 분석 (고래, ETF, 파생상품, 온체인)
8. 글로벌 시황 정리
9. 추천 전략

**응답 형식:**
JSON으로 다음 구조로 응답하세요:
{
  "summary": "현재 시장 상황 요약",
  "macroEvents": [
    {"title": "이벤트명", "daysUntil": 숫자, "importance": "high/medium/low"}
  ],
  "news": [
    {"title": "뉴스제목", "sentiment": "positive/negative/neutral", "impact": 1-10}
  ],
  "tradingPlan": {
    "shortTerm": {"long": "롱 전략", "short": "숏 전략"},
    "weekly": "주간 전략"
  },
  "execution": [
    {
      "type": "Aggressive/Conservative",
      "longPercentage": 숫자,
      "shortPercentage": 숫자,
      "details": [
        {"condition": "조건", "targetPrices": ["가격1", "가격2"], "stopLoss": "손절가"}
      ]
    }
  ],
  "strategies": {
    "scalping": {"long": "전략", "short": "전략"},
    "dayTrading": {"long": "전략", "short": "전략"},
    "swingTrading": {"long": "전략", "short": "전략"}
  },
  "whaleFlow": {
    "whales": "분석",
    "etf": "분석",
    "derivatives": "분석",
    "onChain": "분석"
  },
  "globalBrief": [
    {"point": "포인트", "sentiment": "positive/negative/neutral", "impact": 1-10}
  ],
  "recommendation": "추천 전략",
  "keyPoints": ["포인트1", "포인트2", "포인트3"]
}
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "당신은 전문 암호화폐 시장 분석가입니다. 정확하고 상세한 분석을 제공하세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema" as const,
        json_schema: {
          name: "bitcoin_analysis",
          strict: true as const,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              macroEvents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    daysUntil: { type: "number" },
                    importance: { type: "string" },
                  },
                  required: ["title", "daysUntil", "importance"],
                },
              },
              news: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    sentiment: { type: "string" },
                    impact: { type: "number" },
                  },
                  required: ["title", "sentiment", "impact"],
                },
              },
              tradingPlan: {
                type: "object",
                properties: {
                  shortTerm: {
                    type: "object",
                    properties: {
                      long: { type: "string" },
                      short: { type: "string" },
                    },
                  },
                  weekly: { type: "string" },
                },
              },
              execution: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    longPercentage: { type: "number" },
                    shortPercentage: { type: "number" },
                    details: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          condition: { type: "string" },
                          targetPrices: { type: "array", items: { type: "string" } },
                          stopLoss: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
              strategies: {
                type: "object",
                properties: {
                  scalping: {
                    type: "object",
                    properties: {
                      long: { type: "string" },
                      short: { type: "string" },
                    },
                  },
                  dayTrading: {
                    type: "object",
                    properties: {
                      long: { type: "string" },
                      short: { type: "string" },
                    },
                  },
                  swingTrading: {
                    type: "object",
                    properties: {
                      long: { type: "string" },
                      short: { type: "string" },
                    },
                  },
                },
              },
              whaleFlow: {
                type: "object",
                properties: {
                  whales: { type: "string" },
                  etf: { type: "string" },
                  derivatives: { type: "string" },
                  onChain: { type: "string" },
                },
              },
              globalBrief: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    point: { type: "string" },
                    sentiment: { type: "string" },
                    impact: { type: "number" },
                  },
                },
              },
              recommendation: { type: "string" },
              keyPoints: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "summary",
              "macroEvents",
              "news",
              "tradingPlan",
              "execution",
              "strategies",
              "whaleFlow",
              "globalBrief",
              "recommendation",
              "keyPoints",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    // LLM 응답 파싱
    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const analysisData = JSON.parse(contentStr);

    // 결과 포맷팅
    const brief: BitcoinBrief = {
      title: "📌 실시간 - BTC Daily Brief",
      timestamp: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      }),
      price: `$${bitcoinData.price.toLocaleString()}`,
      priceRange: {
        low: `$${bitcoinData.low24h.toLocaleString()}`,
        high: `$${bitcoinData.high24h.toLocaleString()}`,
      },
      macroEvents: analysisData.macroEvents.map((event: any, idx: number) => ({
        emoji: sentimentToEmoji("neutral", 5 + idx),
        title: event.title,
        daysUntil: event.daysUntil,
        importance: event.importance,
      })),
      news: analysisData.news.map((item: any, idx: number) => ({
        rank: idx + 1,
        title: item.title,
        sentiment: item.sentiment,
        impact: item.impact,
        hanJinLevel: sentimentToHanJinLevel(item.impact, item.sentiment === 'positive'),
      })),
      tradingPlan: analysisData.tradingPlan,
      execution: analysisData.execution.map((exec: any) => ({
        ...exec,
        longImpact: exec.longPercentage / 10,
        shortImpact: exec.shortPercentage / 10,
      })),
      strategies: analysisData.strategies,
      whaleFlow: analysisData.whaleFlow,
      globalBrief: analysisData.globalBrief.map((item: any) => ({
        ...item,
        hanJinLevel: sentimentToHanJinLevel(item.impact, item.sentiment === 'positive'),
      })),
      recommendation: analysisData.recommendation,
      keyPoints: analysisData.keyPoints,
    };

    return brief;
  } catch (error) {
    console.error("Bitcoin analysis error:", error);
    throw error;
  }
}

/**
 * 비트코인 시황 브리프를 텍스트로 포맷팅
 */
export function formatBitcoinBrief(brief: BitcoinBrief): string {
  let text = `${brief.title}\n`;
  text += `${brief.timestamp} KST\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 실시간 가격\n`;
  text += `${brief.price}\n`;
  text += `24h Range\n`;
  text += `Low: ${brief.priceRange.low} — High: ${brief.priceRange.high}\n`;
  text += `⸻\n`;

  text += `📅 주요 매크로 이벤트\n`;
  brief.macroEvents.forEach((event) => {
    text += `\t• ${event.emoji} +${event.daysUntil} ${event.title} (${event.importance})\n`;
  });
  text += `⸻\n`;

  text += `📰 주요 뉴스 / 이슈\n`;
  brief.news.forEach((item) => {
    text += `\t${item.rank}. ${item.title} — ${item.hanJinLevel.text}\n`;
  });
  text += `⸻\n`;

  text += `📈 Trading Plan\n`;
  text += `[단기]\n`;
  text += `🟢 롱: ${brief.tradingPlan.shortTerm.long}\n`;
  text += `🔴 숏: ${brief.tradingPlan.shortTerm.short}\n`;
  text += `[주간]\n`;
  text += `🟢 롱 중심: ${brief.tradingPlan.weekly}\n`;
  text += `⸻\n`;

  text += `⚔️ Execution\n`;
  brief.execution.forEach((exec) => {
    const longEmoji = exec.longPercentage >= 60 ? "🟢" : "🟡";
    const shortEmoji = exec.shortPercentage >= 40 ? "🔴" : "🟡";
    text += `롱 📈 ${exec.longPercentage}% ${longEmoji} +${exec.longImpact.toFixed(0)} : 숏 📉 ${exec.shortPercentage}% ${shortEmoji} −${exec.shortImpact.toFixed(0)}\n`;
    exec.details.forEach((detail) => {
      text += `\t• ${detail.condition} → TP ${detail.targetPrices.join(" / ")} → SL ${detail.stopLoss}\n`;
    });
  });
  text += `⸻\n`;

  text += `📊 전략 세분화\n`;
  text += `스켈핑\n`;
  text += `\t• 롱 전략: ${brief.strategies.scalping.long}\n`;
  text += `\t• 숏 전략: ${brief.strategies.scalping.short}\n`;
  text += `데이 트레이딩\n`;
  text += `\t• 롱 전략: ${brief.strategies.dayTrading.long}\n`;
  text += `\t• 숏 전략: ${brief.strategies.dayTrading.short}\n`;
  text += `스윙 트레이딩\n`;
  text += `\t• 롱 전략: ${brief.strategies.swingTrading.long}\n`;
  text += `\t• 숏 전략: ${brief.strategies.swingTrading.short}\n`;
  text += `⸻\n`;

  text += `🐋 세력 흐름 요약\n`;
  text += `\t• 고래 흐름 : ${brief.whaleFlow.whales}\n`;
  text += `\t• ETF 흐름 : ${brief.whaleFlow.etf}\n`;
  text += `\t• 파생 지표 : ${brief.whaleFlow.derivatives}\n`;
  text += `\t• 온체인 : ${brief.whaleFlow.onChain}\n`;
  text += `⸻\n`;

  text += `🌍 현재 세계 시황 정리 Brief\n`;
  brief.globalBrief.forEach((item) => {
    text += `\t• ${item.point} ${item.hanJinLevel.text}\n`;
  });
  text += `⸻\n`;

  text += `🌟 추천 전략\n`;
  text += `${brief.recommendation}\n`;
  text += `⸻\n`;

  text += `📌 시황 주요 포인트 요약\n`;
  brief.keyPoints.forEach((point) => {
    text += `\t• ${point}\n`;
  });

  return text;
}
