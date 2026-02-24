import axios from 'axios';

/**
 * 카카오톡 알림톡 시스템
 * 비트코인 시황 브리프를 카카오톡으로 자동 발송
 */

const KAKAO_API_KEY = process.env.KAKAO_API_KEY || '';
const KAKAO_SENDER_KEY = process.env.KAKAO_SENDER_KEY || '';
const KAKAO_API_URL = 'https://kapi.kakao.com/v2/user/me';
const KAKAO_ALIMTALK_URL = 'https://kapi.kakao.com/v2/talk/memo/default/send';

export interface KakaoNotification {
  userId: number;
  phoneNumber: string;
  message: string;
  templateId?: string;
}

/**
 * 카카오톡 알림톡으로 메시지 발송
 */
export async function sendKakaoAlimtalk(notification: KakaoNotification): Promise<boolean> {
  try {
    if (!KAKAO_API_KEY || !KAKAO_SENDER_KEY) {
      console.warn('[Kakao] API key or sender key not configured');
      return false;
    }

    const response = await axios.post(
      KAKAO_ALIMTALK_URL,
      {
        receiver_phone: notification.phoneNumber,
        message: notification.message,
        sender_key: KAKAO_SENDER_KEY,
        template_id: notification.templateId || 'default',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${KAKAO_API_KEY}`,
        },
      }
    );

    console.log('[Kakao] Alimtalk sent successfully', {
      userId: notification.userId,
      phoneNumber: notification.phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('[Kakao] Failed to send alimtalk', {
      userId: notification.userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * 비트코인 시황 브리프를 카카오톡으로 발송
 */
export async function sendBitcoinBriefToKakao(
  userId: number,
  phoneNumber: string,
  brief: string,
  hanJinLevel: number
): Promise<boolean> {
  const emoji = getHanJinLevelEmoji(hanJinLevel);
  const message = `${emoji} BTC Daily Brief\n\n${brief}`;

  return sendKakaoAlimtalk({
    userId,
    phoneNumber,
    message,
    templateId: 'bitcoin_brief',
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
 * 사용자 카카오톡 정보 저장
 */
export interface UserKakaoInfo {
  userId: number;
  phoneNumber: string;
  notificationEnabled: boolean;
}

/**
 * 카카오톡 알림 구독 설정
 */
export async function subscribeKakaoNotifications(
  userId: number,
  phoneNumber: string
): Promise<boolean> {
  try {
    // DB에 저장 (추후 구현)
    console.log('[Kakao] User subscribed', { userId, phoneNumber });
    return true;
  } catch (error) {
    console.error('[Kakao] Subscription failed', error);
    return false;
  }
}

/**
 * 카카오톡 알림 구독 해제
 */
export async function unsubscribeKakaoNotifications(userId: number): Promise<boolean> {
  try {
    // DB에서 삭제 (추후 구현)
    console.log('[Kakao] User unsubscribed', { userId });
    return true;
  } catch (error) {
    console.error('[Kakao] Unsubscription failed', error);
    return false;
  }
}
