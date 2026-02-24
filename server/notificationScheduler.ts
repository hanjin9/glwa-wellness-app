import cron from 'node-cron';
import { sendBitcoinBriefToTelegram } from './telegramNotification';
import { sendBitcoinBriefToKakao } from './kakaoNotification';

/**
 * 푸시 알림 스케줄러
 * 정시간에 비트코인 시황 브리프를 텔레그램/카카오톡으로 자동 발송
 */

interface NotificationSchedule {
  time: string; // cron 형식 (예: "0 9 * * *" = 매일 9시)
  name: string;
}

const NOTIFICATION_SCHEDULES: NotificationSchedule[] = [
  { time: '0 9 * * *', name: 'Morning Brief (9 AM)' }, // 매일 오전 9시
  { time: '0 12 * * *', name: 'Noon Brief (12 PM)' }, // 매일 정오
  { time: '0 17 * * *', name: 'Afternoon Brief (5 PM)' }, // 매일 오후 5시
  { time: '0 22 * * *', name: 'Evening Brief (10 PM)' }, // 매일 오후 10시
];

/**
 * 비트코인 시황 브리프 생성 및 발송
 */
async function sendBitcoinBriefNotifications(): Promise<void> {
  try {
    console.log('[Scheduler] Starting bitcoin brief notification...');

    // 비트코인 분석 브리프 생성 (추후 구현)
    const brief = '[Bitcoin Brief] Placeholder - To be implemented';

  // 알림 수신 동의한 사용자 조회 (추후 DB 구현)

    // 임시: 모든 사용자에게 발송 (추후 수정)
    console.log('[Scheduler] Bitcoin brief generated', {
      briefLength: brief.length,
      hanJinLevel: brief.includes('🟢') ? 'positive' : 'negative',
    });

    // 실제 발송은 사용자별로 구현 (추후)

    console.log('[Scheduler] Bitcoin brief notification completed');
  } catch (error) {
    console.error('[Scheduler] Failed to send bitcoin brief', error);
  }
}

/**
 * 스케줄러 초기화
 */
export function initializeNotificationScheduler(): void {
  console.log('[Scheduler] Initializing notification scheduler...');

  NOTIFICATION_SCHEDULES.forEach((schedule) => {
    cron.schedule(schedule.time, async () => {
      console.log(`[Scheduler] Running: ${schedule.name}`);
      await sendBitcoinBriefNotifications();
    });

    console.log(`[Scheduler] Scheduled: ${schedule.name} (${schedule.time})`);
  });

  console.log('[Scheduler] Notification scheduler initialized');
}

/**
 * 스케줄러 중지
 */
export function stopNotificationScheduler(): void {
  console.log('[Scheduler] Stopping notification scheduler...');
  cron.getTasks().forEach((task) => task.stop());
  console.log('[Scheduler] Notification scheduler stopped');
}

/**
 * 즉시 알림 발송 (테스트용)
 */
export async function sendImmediateNotification(): Promise<void> {
  console.log('[Scheduler] Sending immediate notification...');
  await sendBitcoinBriefNotifications();
}
