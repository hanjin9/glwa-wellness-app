import axios from 'axios';

/**
 * 텔레그램 푸시 알림 시스템
 * 비트코인 시황 브리프를 텔레그램으로 자동 발송
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramNotification {
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
}

/**
 * 텔레그램으로 메시지 발송
 */
export async function sendTelegramMessage(notification: TelegramNotification): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('[Telegram] Bot token not configured');
      return false;
    }

    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: notification.chatId,
      text: notification.message,
      parse_mode: notification.parseMode || 'HTML',
      disable_web_page_preview: notification.disableWebPagePreview ?? true,
    });

    console.log('[Telegram] Message sent successfully', {
      chatId: notification.chatId,
      messageId: response.data.result.message_id,
    });

    return true;
  } catch (error) {
    console.error('[Telegram] Failed to send message', {
      chatId: notification.chatId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * 비트코인 시황 브리프를 텔레그램으로 발송
 */
export async function sendBitcoinBriefToTelegram(
  chatId: string,
  brief: string,
  hanJinLevel: number
): Promise<boolean> {
  const emoji = getHanJinLevelEmoji(hanJinLevel);
  const message = `${emoji} <b>BTC Daily Brief</b>\n\n${brief}`;

  return sendTelegramMessage({
    chatId,
    message,
    parseMode: 'HTML',
  });
}

/**
 * HanJin Level에 따른 이모티콘 반환
 */
function getHanJinLevelEmoji(level: number): string {
  if (level >= 7) return '🟢🟢🟢';
  if (level >= 4) return '🟢🟢';
  if (level >= 1) return '🟢';
  if (level === 0) return '🟡';
  if (level >= -3) return '🔴';
  if (level >= -6) return '🔴🔴';
  return '🔴🔴🔴';
}

/**
 * 사용자 텔레그램 채팅 ID 저장
 */
export interface UserTelegramChat {
  userId: number;
  chatId: string;
  notificationEnabled: boolean;
}

/**
 * 텔레그램 알림 구독 설정
 */
export async function subscribeTelegramNotifications(
  userId: number,
  chatId: string
): Promise<boolean> {
  try {
    // DB에 저장 (추후 구현)
    console.log('[Telegram] User subscribed', { userId, chatId });
    return true;
  } catch (error) {
    console.error('[Telegram] Subscription failed', error);
    return false;
  }
}

/**
 * 텔레그램 알림 구독 해제
 */
export async function unsubscribeTelegramNotifications(userId: number): Promise<boolean> {
  try {
    // DB에서 삭제 (추후 구현)
    console.log('[Telegram] User unsubscribed', { userId });
    return true;
  } catch (error) {
    console.error('[Telegram] Unsubscription failed', error);
    return false;
  }
}
