/**
 * useHealthSensors - 휴대폰 내장 센서를 활용한 건강 자동 체크
 * 
 * 1. 만보기 (Pedometer) - DeviceMotion 가속도계 기반 걸음수 감지
 * 2. GPS 거리 추적 - Geolocation API 기반 이동 거리(km) 계산
 * 3. 수면 감지 - 폰 움직임 패턴 + 시간대 분석
 * 
 * 참고: 웨어러블 연동은 향후 API 연결 시 확장 가능하도록 설계
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── 만보기 (Step Counter) ─────────────────────────────────────────
// Kalman 필터 기반 가속도 노이즈 제거 + 영교차 감지 알고리즘
interface PedometerState {
  steps: number;
  distance: number; // km
  calories: number;
  isActive: boolean;
  speed: number; // km/h
}

const STEP_LENGTH_M = 0.72; // 평균 보폭 (미터)
const MIN_STEP_INTERVAL_MS = 280; // 최소 걸음 간격 (ms) - 빠른 걸음 기준
const ACCEL_THRESHOLD = 1.2; // 가속도 임계값 (m/s²)

export function usePedometer() {
  const [state, setState] = useState<PedometerState>({
    steps: 0, distance: 0, calories: 0, isActive: false, speed: 0,
  });
  const stepsRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const kalmanRef = useRef({ q: 0.5, r: 1.0, p: 1.0, x: 0, k: 0 });
  const accelHistoryRef = useRef<number[]>([]);
  const prevAboveThresholdRef = useRef(false);
  const speedWindowRef = useRef<{ time: number; steps: number }[]>([]);

  // Kalman 필터 적용
  const kalmanFilter = useCallback((measurement: number) => {
    const k = kalmanRef.current;
    k.p = k.p + k.q;
    k.k = k.p / (k.p + k.r);
    k.x = k.x + k.k * (measurement - k.x);
    k.p = (1 - k.k) * k.p;
    return k.x;
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    
    // DeviceMotion 이벤트 리스너
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      // 3축 가속도 벡터 크기 계산
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      // 중력 제거 (약 9.8 m/s²)
      const accelWithoutGravity = Math.abs(magnitude - 9.81);
      
      // Kalman 필터 적용
      const filtered = kalmanFilter(accelWithoutGravity);
      
      // 적응형 임계값 계산 (최근 2초 데이터 기반)
      accelHistoryRef.current.push(filtered);
      if (accelHistoryRef.current.length > 100) accelHistoryRef.current.shift(); // ~2초 (50Hz)
      
      const now = Date.now();
      const isAboveThreshold = filtered > ACCEL_THRESHOLD;
      
      // 영교차 감지: 임계값을 넘었다가 다시 내려올 때 = 1걸음
      if (prevAboveThresholdRef.current && !isAboveThreshold) {
        if (now - lastStepTimeRef.current > MIN_STEP_INTERVAL_MS) {
          stepsRef.current += 1;
          lastStepTimeRef.current = now;
          
          // 속도 계산 (2초 윈도우)
          speedWindowRef.current.push({ time: now, steps: stepsRef.current });
          speedWindowRef.current = speedWindowRef.current.filter(s => now - s.time < 5000);
          
          const windowSteps = speedWindowRef.current.length > 1
            ? speedWindowRef.current[speedWindowRef.current.length - 1].steps - speedWindowRef.current[0].steps
            : 0;
          const windowTime = speedWindowRef.current.length > 1
            ? (speedWindowRef.current[speedWindowRef.current.length - 1].time - speedWindowRef.current[0].time) / 1000 / 3600
            : 1;
          const speed = windowTime > 0 ? (windowSteps * STEP_LENGTH_M / 1000) / windowTime : 0;
          
          const distance = stepsRef.current * STEP_LENGTH_M / 1000;
          // MET 기반 칼로리 계산 (걷기 MET ≈ 3.5)
          const calories = Math.round(stepsRef.current * 0.04); // 약 0.04 kcal/step
          
          setState({
            steps: stepsRef.current,
            distance: Math.round(distance * 100) / 100,
            calories,
            isActive: true,
            speed: Math.round(speed * 10) / 10,
          });
        }
      }
      prevAboveThresholdRef.current = isAboveThreshold;
    };

    // 권한 요청 (iOS 13+)
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission().then((permission: string) => {
        if (permission === "granted") {
          window.addEventListener("devicemotion", handleMotion);
          setState(prev => ({ ...prev, isActive: true }));
        }
      });
    } else {
      window.addEventListener("devicemotion", handleMotion);
      setState(prev => ({ ...prev, isActive: true }));
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [kalmanFilter]);

  const reset = useCallback(() => {
    stepsRef.current = 0;
    lastStepTimeRef.current = 0;
    accelHistoryRef.current = [];
    speedWindowRef.current = [];
    setState({ steps: 0, distance: 0, calories: 0, isActive: false, speed: 0 });
  }, []);

  return { ...state, start, reset };
}

// ─── GPS 거리 추적기 ──────────────────────────────────────────────
interface GpsTrackerState {
  totalDistance: number; // km
  currentSpeed: number; // km/h
  isTracking: boolean;
  positions: { lat: number; lng: number; time: number }[];
  error: string | null;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGpsTracker() {
  const [state, setState] = useState<GpsTrackerState>({
    totalDistance: 0, currentSpeed: 0, isTracking: false, positions: [], error: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const positionsRef = useRef<{ lat: number; lng: number; time: number }[]>([]);
  const totalDistRef = useRef(0);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: "GPS를 지원하지 않는 기기입니다" }));
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const now = Date.now();
        const newPos = { lat: latitude, lng: longitude, time: now };
        
        if (positionsRef.current.length > 0) {
          const last = positionsRef.current[positionsRef.current.length - 1];
          const dist = haversineDistance(last.lat, last.lng, latitude, longitude);
          
          // 5m 이상 이동했을 때만 기록 (GPS 노이즈 필터링)
          if (dist > 0.005) {
            totalDistRef.current += dist;
            positionsRef.current.push(newPos);
            
            const timeDiffH = (now - last.time) / 1000 / 3600;
            const speed = timeDiffH > 0 ? dist / timeDiffH : 0;
            
            setState({
              totalDistance: Math.round(totalDistRef.current * 100) / 100,
              currentSpeed: Math.round(speed * 10) / 10,
              isTracking: true,
              positions: [...positionsRef.current],
              error: null,
            });
          }
        } else {
          positionsRef.current.push(newPos);
          setState(prev => ({ ...prev, isTracking: true, positions: [newPos] }));
        }
      },
      (err) => {
        setState(prev => ({ ...prev, error: `GPS 오류: ${err.message}`, isTracking: false }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    setState(prev => ({ ...prev, isTracking: true }));
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    positionsRef.current = [];
    totalDistRef.current = 0;
    setState({ totalDistance: 0, currentSpeed: 0, isTracking: false, positions: [], error: null });
  }, [stop]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { ...state, start, stop, reset };
}

// ─── 수면 감지 ────────────────────────────────────────────────────
// 폰 움직임 패턴 + 시간대 분석으로 수면 시간 추정
interface SleepDetectorState {
  isSleeping: boolean;
  sleepStartTime: Date | null;
  estimatedSleepHours: number;
  lastMotionTime: Date | null;
  motionlessMinutes: number;
}

const SLEEP_MOTION_THRESHOLD = 0.3; // 수면 판단 움직임 임계값
const SLEEP_START_HOUR = 21; // 수면 감지 시작 시간 (오후 9시)
const SLEEP_END_HOUR = 9; // 수면 감지 종료 시간 (오전 9시)
const SLEEP_MOTIONLESS_MINUTES = 30; // 30분 이상 움직임 없으면 수면으로 판단

export function useSleepDetector() {
  const [state, setState] = useState<SleepDetectorState>({
    isSleeping: false, sleepStartTime: null, estimatedSleepHours: 0,
    lastMotionTime: null, motionlessMinutes: 0,
  });
  const lastMotionRef = useRef<Date>(new Date());
  const sleepStartRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const movement = Math.abs(magnitude - 9.81);
      
      if (movement > SLEEP_MOTION_THRESHOLD) {
        lastMotionRef.current = new Date();
        
        // 수면 중이었다면 깨어남
        if (sleepStartRef.current) {
          const sleepDuration = (Date.now() - sleepStartRef.current.getTime()) / 1000 / 3600;
          if (sleepDuration > 0.5) { // 30분 이상 잤을 때만 기록
            setState(prev => ({
              ...prev,
              isSleeping: false,
              estimatedSleepHours: Math.round(sleepDuration * 10) / 10,
              lastMotionTime: new Date(),
              motionlessMinutes: 0,
            }));
          }
          sleepStartRef.current = null;
        }
      }
    };

    // 주기적으로 수면 상태 체크 (1분마다)
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const isSleepTime = hour >= SLEEP_START_HOUR || hour < SLEEP_END_HOUR;
      
      const motionlessMs = now.getTime() - lastMotionRef.current.getTime();
      const motionlessMin = Math.round(motionlessMs / 60000);
      
      if (isSleepTime && motionlessMin >= SLEEP_MOTIONLESS_MINUTES && !sleepStartRef.current) {
        // 수면 시작으로 판단
        sleepStartRef.current = new Date(lastMotionRef.current.getTime() + SLEEP_MOTIONLESS_MINUTES * 60000);
        setState(prev => ({
          ...prev,
          isSleeping: true,
          sleepStartTime: sleepStartRef.current,
          motionlessMinutes: motionlessMin,
        }));
      } else {
        setState(prev => ({
          ...prev,
          motionlessMinutes: motionlessMin,
          lastMotionTime: lastMotionRef.current,
        }));
      }
    }, 60000);

    // DeviceMotion 리스너
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission().then((permission: string) => {
        if (permission === "granted") {
          window.addEventListener("devicemotion", handleMotion);
        }
      });
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { ...state, start };
}

// ─── 웨어러블 데이터 타입 (향후 연동 준비) ──────────────────────────
export interface WearableData {
  heartRate?: number;        // 심박수 (bpm) - 웨어러블 반지/밴드
  bloodPressureSystolic?: number;  // 수축기 혈압 (mmHg)
  bloodPressureDiastolic?: number; // 이완기 혈압 (mmHg)
  bloodGlucose?: number;    // 혈당 (mg/dL)
  bodyTemperature?: number;  // 체온 (°C)
  oxygenSaturation?: number; // 산소포화도 (%)
  stressLevel?: number;      // 스트레스 지수 (1-100)
  hrvScore?: number;         // 심박변이도 (ms)
  skinTemperature?: number;  // 피부 온도 (°C)
  respiratoryRate?: number;  // 호흡수 (회/분)
  source?: string;           // 데이터 소스 (예: "oura_ring", "galaxy_watch", "apple_watch")
  timestamp?: number;        // 측정 시간 (Unix ms)
}

// 웨어러블 연동 상태
export interface WearableConnection {
  deviceType: "smart_ring" | "smart_watch" | "smart_band" | "blood_pressure_monitor" | "glucose_monitor" | "other";
  deviceName: string;
  isConnected: boolean;
  lastSyncAt?: Date;
  batteryLevel?: number;
}

// 웨어러블 데이터 수신 인터페이스 (향후 API 연동 시 구현)
export function useWearableData() {
  const [data, setData] = useState<WearableData | null>(null);
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Web Bluetooth API 지원 여부 확인
    setIsSupported("bluetooth" in navigator);
  }, []);

  // 향후 웨어러블 기기 연결 시 사용할 함수
  const connectDevice = useCallback(async (_deviceType: WearableConnection["deviceType"]) => {
    // TODO: 웨어러블 업체 API 연동 시 구현
    // 예: Oura Ring API, Galaxy Watch API, Apple HealthKit 등
    console.log("[Wearable] Device connection will be available in future update");
    return false;
  }, []);

  const disconnectDevice = useCallback((_deviceName: string) => {
    setConnections(prev => prev.filter(c => c.deviceName !== _deviceName));
  }, []);

  // 외부에서 데이터 주입 (웨어러블 API 콜백용)
  const updateData = useCallback((newData: Partial<WearableData>) => {
    setData(prev => ({ ...prev, ...newData, timestamp: Date.now() }));
  }, []);

  return { data, connections, isSupported, connectDevice, disconnectDevice, updateData };
}
