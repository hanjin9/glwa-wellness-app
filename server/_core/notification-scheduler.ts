import schedule from 'node-schedule';

/**
 * 정신건강 알림 스케줄러 (가벼운 버전)
 * 7시, 12시, 17시, 22시에 자동 실행
 */

const NOTIFICATION_TIMES = ['07:00', '12:00', '17:00', '22:00'];
const scheduledJobs: { [key: string]: schedule.Job } = {};

// 알림 발송 콜백 함수 타입
type NotificationCallback = (time: string) => Promise<void> | void;
let notificationCallback: NotificationCallback | null = null;

/**
 * 알림 콜백 등록
 */
export function setNotificationCallback(callback: NotificationCallback) {
  notificationCallback = callback;
}

/**
 * 알림 발송 함수
 */
async function sendDailyReminders(time: string) {
  try {
    console.log(`[알림 시스템] ${time} - 정신건강 알림 발송`);

    // 등록된 콜백 함수 실행
    if (notificationCallback) {
      await notificationCallback(time);
    }

    console.log(`[알림 시스템] ${time} - 알림 발송 완료`);
  } catch (error) {
    console.error(`[알림 시스템] ${time} - 오류 발생:`, error);
  }
}

/**
 * 모든 알림 스케줄 시작
 */
export function startNotificationScheduler() {
  try {
    // 7시 알림 (매일 07:00)
    scheduledJobs['07:00'] = schedule.scheduleJob('0 7 * * *', () => {
      sendDailyReminders('07:00');
    });

    // 12시 알림 (매일 12:00)
    scheduledJobs['12:00'] = schedule.scheduleJob('0 12 * * *', () => {
      sendDailyReminders('12:00');
    });

    // 5시(17시) 알림 (매일 17:00)
    scheduledJobs['17:00'] = schedule.scheduleJob('0 17 * * *', () => {
      sendDailyReminders('17:00');
    });

    // 10시(22시) 알림 (매일 22:00)
    scheduledJobs['22:00'] = schedule.scheduleJob('0 22 * * *', () => {
      sendDailyReminders('22:00');
    });

    console.log('✅ 정신건강 알림 스케줄러 시작됨');
    console.log('📅 예약된 시간: 7시, 12시, 17시, 22시');
  } catch (error) {
    console.error('❌ 알림 스케줄러 시작 실패:', error);
  }
}

/**
 * 모든 알림 스케줄 중지
 */
export function stopNotificationScheduler() {
  try {
    Object.values(scheduledJobs).forEach((job) => {
      if (job) {
        job.cancel();
      }
    });
    console.log('✅ 정신건강 알림 스케줄러 중지됨');
  } catch (error) {
    console.error('❌ 알림 스케줄러 중지 실패:', error);
  }
}

/**
 * 스케줄 상태 조회
 */
export function getSchedulerStatus() {
  return {
    isRunning: Object.keys(scheduledJobs).length > 0,
    scheduledTimes: NOTIFICATION_TIMES,
    jobs: Object.entries(scheduledJobs).map(([time, job]) => ({
      time,
      nextInvocation: job?.nextInvocation?.toString() || 'N/A',
    })),
  };
}
