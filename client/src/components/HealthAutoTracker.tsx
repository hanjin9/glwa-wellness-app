/**
 * HealthAutoTracker - 건강 자동 체크 대시보드
 * 
 * 1. 만보기 (가속도계) - 실시간 걸음수, 거리, 칼로리
 * 2. GPS 거리 추적 - 이동 거리(km)
 * 3. 수면 감지 - 폰 움직임 패턴 기반
 * 4. 웨어러블 연동 슬롯 (향후 확장) - 심박수, 혈압, 혈당, 체온, 산소포화도
 */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Footprints, MapPin, Moon, Heart, Droplets, Thermometer,
  Activity, Wind, Watch, Bluetooth, ChevronRight,
  Play, Pause, RotateCcw, Zap, TrendingUp
} from "lucide-react";
import { usePedometer, useGpsTracker, useSleepDetector, type WearableData } from "@/hooks/useHealthSensors";

// ─── 웨어러블 데이터 슬롯 정의 ─────────────────────────────────
const WEARABLE_SLOTS = [
  { key: "heartRate", label: "심박수", unit: "bpm", icon: Heart, color: "text-red-500", bgColor: "bg-red-50", normalRange: "60-100" },
  { key: "bloodPressureSystolic", label: "혈압", unit: "mmHg", icon: Activity, color: "text-blue-600", bgColor: "bg-blue-50", normalRange: "90-120/60-80" },
  { key: "bloodGlucose", label: "혈당", unit: "mg/dL", icon: Droplets, color: "text-purple-600", bgColor: "bg-purple-50", normalRange: "70-100" },
  { key: "bodyTemperature", label: "체온", unit: "°C", icon: Thermometer, color: "text-orange-500", bgColor: "bg-orange-50", normalRange: "36.1-37.2" },
  { key: "oxygenSaturation", label: "산소포화도", unit: "%", icon: Wind, color: "text-cyan-600", bgColor: "bg-cyan-50", normalRange: "95-100" },
  { key: "stressLevel", label: "스트레스", unit: "점", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50", normalRange: "1-30" },
  { key: "hrvScore", label: "심박변이도", unit: "ms", icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-50", normalRange: "20-200" },
  { key: "respiratoryRate", label: "호흡수", unit: "회/분", icon: Wind, color: "text-teal-600", bgColor: "bg-teal-50", normalRange: "12-20" },
] as const;

interface HealthAutoTrackerProps {
  onDataCollected?: (data: {
    steps?: number;
    distance?: number;
    calories?: number;
    sleepHours?: number;
    wearableData?: WearableData;
  }) => void;
  compact?: boolean;
}

export default function HealthAutoTracker({ onDataCollected, compact = false }: HealthAutoTrackerProps) {
  const pedometer = usePedometer();
  const gps = useGpsTracker();
  const sleep = useSleepDetector();
  const [sensorPermission, setSensorPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [showWearableSetup, setShowWearableSetup] = useState(false);

  // 센서 권한 확인
  useEffect(() => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "accelerometer" as PermissionName }).then((result) => {
        setSensorPermission(result.state as "granted" | "denied" | "prompt");
      }).catch(() => {
        // 일부 브라우저에서 accelerometer 권한 쿼리 미지원
        setSensorPermission("prompt");
      });
    }
  }, []);

  // 데이터 수집 콜백
  useEffect(() => {
    if (onDataCollected) {
      onDataCollected({
        steps: pedometer.steps,
        distance: pedometer.distance || gps.totalDistance,
        calories: pedometer.calories,
        sleepHours: sleep.estimatedSleepHours,
      });
    }
  }, [pedometer.steps, gps.totalDistance, sleep.estimatedSleepHours]);

  const handleStartAll = () => {
    pedometer.start();
    sleep.start();
    toast.success("건강 자동 추적이 시작되었습니다");
  };

  const handleStartGps = () => {
    if (gps.isTracking) {
      gps.stop();
      toast.info("GPS 추적이 중지되었습니다");
    } else {
      gps.start();
      toast.success("GPS 거리 추적이 시작되었습니다");
    }
  };

  // ─── 컴팩트 모드 (건강 기록 페이지 상단) ──────────────────────
  if (compact) {
    return (
      <Card className="border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-teal-50/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-800">자동 건강 추적</h3>
                <p className="text-[10px] text-emerald-600">센서 데이터 실시간 수집</p>
              </div>
            </div>
            {!pedometer.isActive ? (
              <Button size="sm" variant="outline" className="h-7 text-[10px] border-emerald-300 text-emerald-700" onClick={handleStartAll}>
                <Play className="w-3 h-3 mr-1" /> 시작
              </Button>
            ) : (
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" /> 추적 중
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* 걸음수 */}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <Footprints className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
              <p className="text-sm font-bold text-emerald-800">{pedometer.steps.toLocaleString()}</p>
              <p className="text-[8px] text-muted-foreground">걸음</p>
            </div>
            {/* 거리 */}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <MapPin className="w-4 h-4 mx-auto text-blue-600 mb-1" />
              <p className="text-sm font-bold text-blue-800">{(pedometer.distance || gps.totalDistance).toFixed(1)}</p>
              <p className="text-[8px] text-muted-foreground">km</p>
            </div>
            {/* 칼로리 */}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <Zap className="w-4 h-4 mx-auto text-orange-500 mb-1" />
              <p className="text-sm font-bold text-orange-700">{pedometer.calories}</p>
              <p className="text-[8px] text-muted-foreground">kcal</p>
            </div>
            {/* 수면 */}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <Moon className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
              <p className="text-sm font-bold text-indigo-700">{sleep.estimatedSleepHours || "-"}</p>
              <p className="text-[8px] text-muted-foreground">수면(h)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── 전체 모드 (건강 대시보드) ─────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 센서 상태 헤더 */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">건강 자동 추적</h2>
              <p className="text-xs text-white/80 mt-0.5">휴대폰 센서로 자동 측정합니다</p>
            </div>
            <div className="flex gap-2">
              {pedometer.isActive ? (
                <>
                  <Button size="sm" variant="ghost" className="h-8 text-white/90 hover:text-white hover:bg-white/20" onClick={() => pedometer.reset()}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5" /> 활성
                  </Badge>
                </>
              ) : (
                <Button size="sm" className="bg-white text-emerald-700 hover:bg-white/90 h-8" onClick={handleStartAll}>
                  <Play className="w-3.5 h-3.5 mr-1" /> 추적 시작
                </Button>
              )}
            </div>
          </div>

          {/* 센서 데이터 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 만보기 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-5 h-5" />
                <span className="text-xs font-medium">만보기</span>
              </div>
              <p className="text-2xl font-bold">{pedometer.steps.toLocaleString()}</p>
              <p className="text-[10px] text-white/70 mt-0.5">걸음 · {pedometer.distance.toFixed(2)}km</p>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((pedometer.steps / 10000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-white/60 mt-1">목표: 10,000걸음</p>
            </div>

            {/* GPS 거리 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-medium">GPS 거리</span>
                </div>
                <button
                  onClick={handleStartGps}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    gps.isTracking ? "bg-red-400/80" : "bg-white/30"
                  }`}
                >
                  {gps.isTracking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-2xl font-bold">{gps.totalDistance.toFixed(2)}</p>
              <p className="text-[10px] text-white/70 mt-0.5">km · {gps.currentSpeed.toFixed(1)} km/h</p>
              {gps.error && <p className="text-[9px] text-red-300 mt-1">{gps.error}</p>}
            </div>

            {/* 칼로리 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-xs font-medium">소모 칼로리</span>
              </div>
              <p className="text-2xl font-bold">{pedometer.calories}</p>
              <p className="text-[10px] text-white/70 mt-0.5">kcal · 속도 {pedometer.speed} km/h</p>
            </div>

            {/* 수면 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">수면 감지</span>
              </div>
              <p className="text-2xl font-bold">
                {sleep.estimatedSleepHours > 0 ? `${sleep.estimatedSleepHours}h` : sleep.isSleeping ? "수면 중" : "-"}
              </p>
              <p className="text-[10px] text-white/70 mt-0.5">
                {sleep.isSleeping
                  ? `${sleep.sleepStartTime?.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}부터`
                  : sleep.motionlessMinutes > 0
                    ? `정지 ${sleep.motionlessMinutes}분`
                    : "움직임 감지 중"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 웨어러블 연동 섹션 */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Watch className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold">웨어러블 기기 연동</h3>
                <p className="text-[10px] text-muted-foreground">스마트 반지, 워치, 밴드 등</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px]"
              onClick={() => {
                setShowWearableSetup(!showWearableSetup);
                if (!showWearableSetup) {
                  toast.info("웨어러블 기기 연동은 향후 업데이트에서 지원됩니다");
                }
              }}
            >
              <Bluetooth className="w-3 h-3 mr-1" />
              {showWearableSetup ? "닫기" : "기기 연결"}
            </Button>
          </div>

          {showWearableSetup && (
            <div className="mb-4 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <p className="text-xs text-violet-800 font-medium mb-2">지원 예정 기기</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  { name: "Oura Ring", status: "준비 중" },
                  { name: "Galaxy Watch", status: "준비 중" },
                  { name: "Apple Watch", status: "준비 중" },
                  { name: "Fitbit", status: "준비 중" },
                  { name: "Xiaomi Band", status: "준비 중" },
                  { name: "혈압계 (BLE)", status: "준비 중" },
                ].map((device) => (
                  <div key={device.name} className="flex items-center justify-between p-2 bg-white rounded-md">
                    <span className="text-violet-700">{device.name}</span>
                    <Badge variant="outline" className="text-[8px] h-4 bg-violet-100 text-violet-600 border-violet-200">
                      {device.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-violet-600 mt-2">
                * 웨어러블 업체와 API 연동 후 자동으로 활성화됩니다
              </p>
            </div>
          )}

          {/* 웨어러블 데이터 슬롯 그리드 */}
          <div className="grid grid-cols-4 gap-2">
            {WEARABLE_SLOTS.map((slot) => {
              const Icon = slot.icon;
              return (
                <button
                  key={slot.key}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all group"
                  onClick={() => toast.info(`${slot.label}: 웨어러블 기기 연동 후 자동 측정됩니다\n정상 범위: ${slot.normalRange} ${slot.unit}`)}
                >
                  <div className={`w-8 h-8 rounded-full ${slot.bgColor} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${slot.color}`} />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground/50">--</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5">{slot.label}</span>
                  <span className="text-[7px] text-muted-foreground/50">{slot.unit}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <Watch className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700">
              웨어러블 기기를 연결하면 심박수, 혈압, 혈당, 체온, 산소포화도가 <strong>자동으로 측정</strong>되어 건강 기록에 반영됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 센서 권한 안내 */}
      {sensorPermission === "denied" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs text-red-700 font-medium">센서 접근이 차단되었습니다</p>
            <p className="text-[10px] text-red-600 mt-1">
              브라우저 설정에서 모션 센서 및 위치 접근을 허용해주세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
