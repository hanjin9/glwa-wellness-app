import { useState } from "react";

export type BodyPart = {
  id: string;
  label: string;
  labelEn: string;
  side: "front" | "back" | "both"; // 전면/후면/양쪽 모두 해당
};

export const BODY_PARTS: BodyPart[] = [
  { id: "head", label: "머리", labelEn: "Head", side: "both" },
  { id: "neck", label: "목", labelEn: "Neck", side: "both" },
  { id: "shoulder", label: "어깨", labelEn: "Shoulder", side: "both" },
  { id: "chest", label: "가슴", labelEn: "Chest", side: "front" },
  { id: "back_upper", label: "등(상부)", labelEn: "Upper Back", side: "back" },
  { id: "back_lower", label: "등(하부)", labelEn: "Lower Back", side: "back" },
  { id: "upperArm", label: "상완(위팔)", labelEn: "Upper Arm", side: "both" },
  { id: "elbow", label: "팔꿈치", labelEn: "Elbow", side: "both" },
  { id: "wrist", label: "손목", labelEn: "Wrist", side: "both" },
  { id: "hand", label: "손", labelEn: "Hand", side: "both" },
  { id: "waist", label: "허리", labelEn: "Waist", side: "back" },
  { id: "abdomen", label: "복부", labelEn: "Abdomen", side: "front" },
  { id: "pelvis", label: "골반", labelEn: "Pelvis", side: "both" },
  { id: "hip", label: "엉덩이", labelEn: "Hip", side: "back" },
  { id: "thigh", label: "허벅지", labelEn: "Thigh", side: "both" },
  { id: "knee", label: "무릎", labelEn: "Knee", side: "front" },
  { id: "knee_back", label: "무릎 뒤(오금)", labelEn: "Back of Knee", side: "back" },
  { id: "calf", label: "장단지", labelEn: "Calf", side: "back" },
  { id: "shin", label: "정강이", labelEn: "Shin", side: "front" },
  { id: "ankle", label: "발목", labelEn: "Ankle", side: "both" },
  { id: "foot", label: "발", labelEn: "Foot", side: "both" },
];

// 전면 부위 클릭 영역 좌표 (viewBox 0~200 x 0~480)
const FRONT_REGIONS: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  head:     { cx: 100, cy: 36, rx: 22, ry: 26 },
  neck:     { cx: 100, cy: 72, rx: 11, ry: 9 },
  shoulder: { cx: 100, cy: 92, rx: 30, ry: 9 },
  chest:    { cx: 100, cy: 120, rx: 28, ry: 20 },
  abdomen:  { cx: 100, cy: 170, rx: 22, ry: 18 },
  upperArm: { cx: 55, cy: 130, rx: 9, ry: 22 },
  elbow:    { cx: 48, cy: 168, rx: 7, ry: 10 },
  wrist:    { cx: 40, cy: 218, rx: 6, ry: 8 },
  hand:     { cx: 35, cy: 244, rx: 8, ry: 11 },
  pelvis:   { cx: 100, cy: 210, rx: 28, ry: 14 },
  thigh:    { cx: 82, cy: 275, rx: 14, ry: 32 },
  knee:     { cx: 80, cy: 325, rx: 10, ry: 12 },
  shin:     { cx: 80, cy: 375, rx: 8, ry: 26 },
  ankle:    { cx: 78, cy: 420, rx: 8, ry: 8 },
  foot:     { cx: 76, cy: 450, rx: 12, ry: 10 },
};

// 후면 부위 클릭 영역 좌표
const BACK_REGIONS: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  head:       { cx: 100, cy: 36, rx: 22, ry: 26 },
  neck:       { cx: 100, cy: 72, rx: 11, ry: 9 },
  shoulder:   { cx: 100, cy: 92, rx: 30, ry: 9 },
  back_upper: { cx: 100, cy: 120, rx: 26, ry: 18 },
  back_lower: { cx: 100, cy: 155, rx: 22, ry: 14 },
  waist:      { cx: 100, cy: 180, rx: 24, ry: 12 },
  upperArm:   { cx: 55, cy: 130, rx: 9, ry: 22 },
  elbow:      { cx: 48, cy: 168, rx: 7, ry: 10 },
  wrist:      { cx: 40, cy: 218, rx: 6, ry: 8 },
  hand:       { cx: 35, cy: 244, rx: 8, ry: 11 },
  hip:        { cx: 100, cy: 210, rx: 28, ry: 16 },
  pelvis:     { cx: 100, cy: 230, rx: 24, ry: 10 },
  thigh:      { cx: 82, cy: 275, rx: 14, ry: 32 },
  knee_back:  { cx: 80, cy: 325, rx: 10, ry: 12 },
  calf:       { cx: 80, cy: 375, rx: 9, ry: 26 },
  ankle:      { cx: 78, cy: 420, rx: 8, ry: 8 },
  foot:       { cx: 76, cy: 450, rx: 12, ry: 10 },
};

// ===== 남성 전면 SVG =====
function MaleFront({ selectedParts, onPartClick }: { selectedParts: Set<string>; onPartClick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 200 480" className="w-full h-full">
      <defs>
        <linearGradient id="mSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a574" /><stop offset="100%" stopColor="#c49060" />
        </linearGradient>
        <linearGradient id="mMuscle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4856a" stopOpacity="0.5" /><stop offset="100%" stopColor="#b07060" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="bone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8ddd0" /><stop offset="100%" stopColor="#d4c8b8" />
        </linearGradient>
      </defs>
      {/* 머리 */}
      <ellipse cx="100" cy="36" rx="22" ry="26" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.7"/>
      <line x1="91" y1="30" x2="95" y2="30" stroke="#8a6040" strokeWidth="0.5"/>
      <line x1="105" y1="30" x2="109" y2="30" stroke="#8a6040" strokeWidth="0.5"/>
      <path d="M95 42 Q100 46 105 42" fill="none" stroke="#8a6040" strokeWidth="0.4"/>
      {/* 목 */}
      <rect x="92" y="62" width="16" height="18" rx="3" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      <line x1="100" y1="62" x2="100" y2="80" stroke="url(#bone)" strokeWidth="1.5" strokeDasharray="3,2"/>
      {/* 쇄골 */}
      <path d="M72 85 Q86 82 100 85 Q114 82 128 85" fill="none" stroke="url(#bone)" strokeWidth="2"/>
      {/* 상체 */}
      <path d="M68 88 L64 100 L60 130 L64 160 L74 182 L100 195 L126 182 L136 160 L140 130 L136 100 L132 88 Z" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.7"/>
      {/* 흉근 */}
      <path d="M74 98 Q88 112 100 105 Q112 112 126 98" fill="url(#mMuscle)" stroke="none"/>
      {/* 복근 라인 */}
      <line x1="100" y1="118" x2="100" y2="185" stroke="#b08060" strokeWidth="0.4" strokeOpacity="0.4"/>
      <line x1="88" y1="128" x2="88" y2="172" stroke="#b08060" strokeWidth="0.3" strokeOpacity="0.25"/>
      <line x1="112" y1="128" x2="112" y2="172" stroke="#b08060" strokeWidth="0.3" strokeOpacity="0.25"/>
      {/* 늑골 */}
      <path d="M80 122 Q100 128 120 122" fill="none" stroke="url(#bone)" strokeWidth="0.6" strokeOpacity="0.4"/>
      <path d="M78 138 Q100 144 122 138" fill="none" stroke="url(#bone)" strokeWidth="0.6" strokeOpacity="0.4"/>
      <path d="M80 152 Q100 157 120 152" fill="none" stroke="url(#bone)" strokeWidth="0.6" strokeOpacity="0.4"/>
      {/* 팔 좌 */}
      <path d="M64 98 L54 128 L48 158 L44 185 L40 210 L36 228 L34 242" fill="none" stroke="url(#mSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="60" y1="102" x2="50" y2="155" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      <line x1="48" y1="162" x2="38" y2="225" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 팔 우 */}
      <path d="M136 98 L146 128 L152 158 L156 185 L160 210 L164 228 L166 242" fill="none" stroke="url(#mSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="140" y1="102" x2="150" y2="155" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      <line x1="152" y1="162" x2="162" y2="225" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 손 */}
      <ellipse cx="32" cy="250" rx="7" ry="11" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      <ellipse cx="168" cy="250" rx="7" ry="11" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      {/* 골반 */}
      <path d="M78 188 Q74 208 72 225 Q86 240 100 244 Q114 240 128 225 Q126 208 122 188" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.7"/>
      <path d="M78 208 Q100 222 122 208" fill="none" stroke="url(#bone)" strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* 다리 좌 */}
      <path d="M84 244 L82 280 L80 318 L78 332 L78 370 L80 410 L78 435 L74 455" fill="none" stroke="url(#mSkin)" strokeWidth="15" strokeLinecap="round"/>
      <line x1="84" y1="246" x2="80" y2="320" stroke="url(#bone)" strokeWidth="1.5" strokeDasharray="4,2"/>
      <circle cx="79" cy="332" r="4.5" fill="url(#bone)" stroke="#c4b8a8" strokeWidth="0.4"/>
      <line x1="79" y1="342" x2="79" y2="420" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      {/* 다리 우 */}
      <path d="M116 244 L118 280 L120 318 L122 332 L122 370 L120 410 L122 435 L126 455" fill="none" stroke="url(#mSkin)" strokeWidth="15" strokeLinecap="round"/>
      <line x1="116" y1="246" x2="120" y2="320" stroke="url(#bone)" strokeWidth="1.5" strokeDasharray="4,2"/>
      <circle cx="121" cy="332" r="4.5" fill="url(#bone)" stroke="#c4b8a8" strokeWidth="0.4"/>
      <line x1="121" y1="342" x2="121" y2="420" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      {/* 발 */}
      <path d="M70 450 L64 462 L72 468 L84 464 L82 452" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      <path d="M130 450 L136 462 L128 468 L116 464 L118 452" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      {/* 클릭 영역 */}
      {renderClickAreas(FRONT_REGIONS, selectedParts, onPartClick)}
      <text x="100" y="478" textAnchor="middle" fill="#7a6050" fontSize="9" fontWeight="600">전면</text>
    </svg>
  );
}

// ===== 남성 후면 SVG =====
function MaleBack({ selectedParts, onPartClick }: { selectedParts: Set<string>; onPartClick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 200 480" className="w-full h-full">
      {/* 머리 (뒷모습) */}
      <ellipse cx="100" cy="36" rx="22" ry="26" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.7"/>
      <path d="M80 20 Q100 10 120 20" fill="#5a3a2a" stroke="none"/>
      {/* 목 */}
      <rect x="92" y="62" width="16" height="18" rx="3" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      <line x1="100" y1="62" x2="100" y2="80" stroke="url(#bone)" strokeWidth="1.5" strokeDasharray="3,2"/>
      {/* 승모근 */}
      <path d="M72 85 Q86 78 100 85 Q114 78 128 85" fill="none" stroke="#b09070" strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* 등 */}
      <path d="M68 88 L64 100 L60 130 L64 160 L74 182 L100 195 L126 182 L136 160 L140 130 L136 100 L132 88 Z" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.7"/>
      {/* 척추 */}
      <line x1="100" y1="80" x2="100" y2="195" stroke="url(#bone)" strokeWidth="2" strokeDasharray="4,2"/>
      {/* 견갑골 */}
      <path d="M76 98 L72 118 L82 128 L92 118 L88 98 Z" fill="none" stroke="url(#bone)" strokeWidth="1" strokeOpacity="0.5"/>
      <path d="M124 98 L128 118 L118 128 L108 118 L112 98 Z" fill="none" stroke="url(#bone)" strokeWidth="1" strokeOpacity="0.5"/>
      {/* 허리 근육 라인 */}
      <path d="M78 150 Q100 158 122 150" fill="none" stroke="#b09070" strokeWidth="0.5" strokeOpacity="0.4"/>
      <path d="M80 168 Q100 174 120 168" fill="none" stroke="#b09070" strokeWidth="0.5" strokeOpacity="0.4"/>
      {/* 팔 좌 */}
      <path d="M64 98 L54 128 L48 158 L44 185 L40 210 L36 228 L34 242" fill="none" stroke="url(#mSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="60" y1="102" x2="50" y2="155" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      <line x1="48" y1="162" x2="38" y2="225" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 팔 우 */}
      <path d="M136 98 L146 128 L152 158 L156 185 L160 210 L164 228 L166 242" fill="none" stroke="url(#mSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="140" y1="102" x2="150" y2="155" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      <line x1="152" y1="162" x2="162" y2="225" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 손 */}
      <ellipse cx="32" cy="250" rx="7" ry="11" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      <ellipse cx="168" cy="250" rx="7" ry="11" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      {/* 엉덩이 */}
      <path d="M78 188 Q74 208 72 225 Q86 240 100 244 Q114 240 128 225 Q126 208 122 188" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.7"/>
      <path d="M82 210 Q100 200 118 210" fill="none" stroke="#b09070" strokeWidth="0.6" strokeOpacity="0.4"/>
      <path d="M78 218 Q100 228 122 218" fill="none" stroke="url(#bone)" strokeWidth="1.2" strokeOpacity="0.4"/>
      {/* 다리 좌 */}
      <path d="M84 244 L82 280 L80 318 L78 332 L78 370 L80 410 L78 435 L74 455" fill="none" stroke="url(#mSkin)" strokeWidth="15" strokeLinecap="round"/>
      <line x1="84" y1="246" x2="80" y2="320" stroke="url(#bone)" strokeWidth="1.5" strokeDasharray="4,2"/>
      <line x1="79" y1="342" x2="79" y2="420" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      {/* 종아리 근육 */}
      <ellipse cx="80" cy="375" rx="8" ry="18" fill="url(#mMuscle)" stroke="none"/>
      {/* 다리 우 */}
      <path d="M116 244 L118 280 L120 318 L122 332 L122 370 L120 410 L122 435 L126 455" fill="none" stroke="url(#mSkin)" strokeWidth="15" strokeLinecap="round"/>
      <line x1="116" y1="246" x2="120" y2="320" stroke="url(#bone)" strokeWidth="1.5" strokeDasharray="4,2"/>
      <line x1="121" y1="342" x2="121" y2="420" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      <ellipse cx="120" cy="375" rx="8" ry="18" fill="url(#mMuscle)" stroke="none"/>
      {/* 발 */}
      <path d="M70 450 L64 462 L72 468 L84 464 L82 452" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      <path d="M130 450 L136 462 L128 468 L116 464 L118 452" fill="url(#mSkin)" stroke="#a07050" strokeWidth="0.5"/>
      {/* 클릭 영역 */}
      {renderClickAreas(BACK_REGIONS, selectedParts, onPartClick)}
      <text x="100" y="478" textAnchor="middle" fill="#7a6050" fontSize="9" fontWeight="600">후면</text>
    </svg>
  );
}

// ===== 여성 전면 SVG =====
function FemaleFront({ selectedParts, onPartClick }: { selectedParts: Set<string>; onPartClick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 200 480" className="w-full h-full">
      <defs>
        <linearGradient id="fSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0b898" /><stop offset="100%" stopColor="#d4a888" />
        </linearGradient>
        <linearGradient id="fMuscle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a090" stopOpacity="0.35" /><stop offset="100%" stopColor="#c89888" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* 머리 + 머리카락 */}
      <ellipse cx="100" cy="33" rx="24" ry="28" fill="#5a3a2a"/>
      <ellipse cx="100" cy="36" rx="20" ry="24" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.6"/>
      <line x1="92" y1="31" x2="96" y2="31" stroke="#9a7858" strokeWidth="0.4"/>
      <line x1="104" y1="31" x2="108" y2="31" stroke="#9a7858" strokeWidth="0.4"/>
      <path d="M96 42 Q100 45 104 42" fill="none" stroke="#9a7858" strokeWidth="0.35"/>
      {/* 목 */}
      <rect x="94" y="60" width="12" height="16" rx="3" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      <line x1="100" y1="60" x2="100" y2="76" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      {/* 쇄골 */}
      <path d="M74 82 Q88 78 100 82 Q112 78 126 82" fill="none" stroke="url(#bone)" strokeWidth="1.8"/>
      {/* 상체 */}
      <path d="M70 85 L66 96 L62 122 L66 152 L76 175 L100 188 L124 175 L134 152 L138 122 L134 96 L130 85 Z" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.6"/>
      {/* 가슴 곡선 */}
      <path d="M76 98 Q88 114 100 106 Q112 114 124 98" fill="url(#fMuscle)" stroke="none"/>
      {/* 허리 라인 */}
      <path d="M72 148 Q100 142 128 148" fill="none" stroke="#c09878" strokeWidth="0.35" strokeOpacity="0.4"/>
      {/* 늑골 */}
      <path d="M80 118 Q100 124 120 118" fill="none" stroke="url(#bone)" strokeWidth="0.5" strokeOpacity="0.35"/>
      <path d="M78 134 Q100 139 122 134" fill="none" stroke="url(#bone)" strokeWidth="0.5" strokeOpacity="0.35"/>
      {/* 팔 좌 */}
      <path d="M66 94 L58 122 L52 152 L48 178 L44 204 L40 222 L38 236" fill="none" stroke="url(#fSkin)" strokeWidth="10" strokeLinecap="round"/>
      <line x1="62" y1="98" x2="52" y2="150" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="50" y1="156" x2="42" y2="218" stroke="url(#bone)" strokeWidth="0.8" strokeDasharray="3,2"/>
      {/* 팔 우 */}
      <path d="M134 94 L142 122 L148 152 L152 178 L156 204 L160 222 L162 236" fill="none" stroke="url(#fSkin)" strokeWidth="10" strokeLinecap="round"/>
      <line x1="138" y1="98" x2="148" y2="150" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="150" y1="156" x2="158" y2="218" stroke="url(#bone)" strokeWidth="0.8" strokeDasharray="3,2"/>
      {/* 손 */}
      <ellipse cx="36" cy="244" rx="6" ry="10" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      <ellipse cx="164" cy="244" rx="6" ry="10" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      {/* 골반 (여성형 넓은) */}
      <path d="M80 182 Q74 204 72 222 Q86 238 100 242 Q114 238 128 222 Q126 204 120 182" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.6"/>
      <path d="M80 206 Q100 220 120 206" fill="none" stroke="url(#bone)" strokeWidth="1.5" strokeOpacity="0.4"/>
      {/* 다리 좌 */}
      <path d="M84 242 L82 278 L80 316 L78 330 L78 368 L80 408 L78 433 L74 453" fill="none" stroke="url(#fSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="84" y1="244" x2="80" y2="318" stroke="url(#bone)" strokeWidth="1.3" strokeDasharray="4,2"/>
      <circle cx="79" cy="330" r="4" fill="url(#bone)" stroke="#c4b8a8" strokeWidth="0.3"/>
      <line x1="79" y1="340" x2="79" y2="418" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 다리 우 */}
      <path d="M116 242 L118 278 L120 316 L122 330 L122 368 L120 408 L122 433 L126 453" fill="none" stroke="url(#fSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="116" y1="244" x2="120" y2="318" stroke="url(#bone)" strokeWidth="1.3" strokeDasharray="4,2"/>
      <circle cx="121" cy="330" r="4" fill="url(#bone)" stroke="#c4b8a8" strokeWidth="0.3"/>
      <line x1="121" y1="340" x2="121" y2="418" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      {/* 발 */}
      <path d="M70 448 L64 460 L72 466 L84 462 L82 450" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      <path d="M130 448 L136 460 L128 466 L116 462 L118 450" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      {/* 클릭 영역 */}
      {renderClickAreas(FRONT_REGIONS, selectedParts, onPartClick)}
      <text x="100" y="478" textAnchor="middle" fill="#7a6050" fontSize="9" fontWeight="600">전면</text>
    </svg>
  );
}

// ===== 여성 후면 SVG =====
function FemaleBack({ selectedParts, onPartClick }: { selectedParts: Set<string>; onPartClick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 200 480" className="w-full h-full">
      {/* 머리 (뒷모습 + 긴 머리) */}
      <ellipse cx="100" cy="33" rx="24" ry="28" fill="#5a3a2a"/>
      <path d="M78 30 Q76 55 80 75 L84 80" fill="#5a3a2a" stroke="none"/>
      <path d="M122 30 Q124 55 120 75 L116 80" fill="#5a3a2a" stroke="none"/>
      <ellipse cx="100" cy="36" rx="20" ry="24" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.6"/>
      {/* 목 */}
      <rect x="94" y="60" width="12" height="16" rx="3" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      <line x1="100" y1="60" x2="100" y2="76" stroke="url(#bone)" strokeWidth="1.2" strokeDasharray="3,2"/>
      {/* 승모근 */}
      <path d="M74 82 Q88 75 100 82 Q112 75 126 82" fill="none" stroke="#c09878" strokeWidth="1" strokeOpacity="0.4"/>
      {/* 등 */}
      <path d="M70 85 L66 96 L62 122 L66 152 L76 175 L100 188 L124 175 L134 152 L138 122 L134 96 L130 85 Z" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.6"/>
      {/* 척추 */}
      <line x1="100" y1="76" x2="100" y2="188" stroke="url(#bone)" strokeWidth="1.8" strokeDasharray="4,2"/>
      {/* 견갑골 */}
      <path d="M78 96 L74 114 L84 122 L92 114 L88 96 Z" fill="none" stroke="url(#bone)" strokeWidth="0.8" strokeOpacity="0.4"/>
      <path d="M122 96 L126 114 L116 122 L108 114 L112 96 Z" fill="none" stroke="url(#bone)" strokeWidth="0.8" strokeOpacity="0.4"/>
      {/* 허리 라인 */}
      <path d="M76 148 Q100 155 124 148" fill="none" stroke="#c09878" strokeWidth="0.4" strokeOpacity="0.35"/>
      <path d="M78 165 Q100 170 122 165" fill="none" stroke="#c09878" strokeWidth="0.4" strokeOpacity="0.35"/>
      {/* 팔 좌 */}
      <path d="M66 94 L58 122 L52 152 L48 178 L44 204 L40 222 L38 236" fill="none" stroke="url(#fSkin)" strokeWidth="10" strokeLinecap="round"/>
      <line x1="62" y1="98" x2="52" y2="150" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="50" y1="156" x2="42" y2="218" stroke="url(#bone)" strokeWidth="0.8" strokeDasharray="3,2"/>
      {/* 팔 우 */}
      <path d="M134 94 L142 122 L148 152 L152 178 L156 204 L160 222 L162 236" fill="none" stroke="url(#fSkin)" strokeWidth="10" strokeLinecap="round"/>
      <line x1="138" y1="98" x2="148" y2="150" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="150" y1="156" x2="158" y2="218" stroke="url(#bone)" strokeWidth="0.8" strokeDasharray="3,2"/>
      {/* 손 */}
      <ellipse cx="36" cy="244" rx="6" ry="10" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      <ellipse cx="164" cy="244" rx="6" ry="10" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      {/* 엉덩이 (여성형 넓은) */}
      <path d="M80 182 Q74 204 72 222 Q86 240 100 244 Q114 240 128 222 Q126 204 120 182" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.6"/>
      <path d="M84 208 Q100 198 116 208" fill="none" stroke="#c09878" strokeWidth="0.5" strokeOpacity="0.35"/>
      <path d="M80 218 Q100 228 120 218" fill="none" stroke="url(#bone)" strokeWidth="1.2" strokeOpacity="0.35"/>
      {/* 다리 좌 */}
      <path d="M84 242 L82 278 L80 316 L78 330 L78 368 L80 408 L78 433 L74 453" fill="none" stroke="url(#fSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="84" y1="244" x2="80" y2="318" stroke="url(#bone)" strokeWidth="1.3" strokeDasharray="4,2"/>
      <line x1="79" y1="340" x2="79" y2="418" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      <ellipse cx="80" cy="373" rx="7" ry="16" fill="url(#fMuscle)" stroke="none"/>
      {/* 다리 우 */}
      <path d="M116 242 L118 278 L120 316 L122 330 L122 368 L120 408 L122 433 L126 453" fill="none" stroke="url(#fSkin)" strokeWidth="13" strokeLinecap="round"/>
      <line x1="116" y1="244" x2="120" y2="318" stroke="url(#bone)" strokeWidth="1.3" strokeDasharray="4,2"/>
      <line x1="121" y1="340" x2="121" y2="418" stroke="url(#bone)" strokeWidth="1" strokeDasharray="3,2"/>
      <ellipse cx="120" cy="373" rx="7" ry="16" fill="url(#fMuscle)" stroke="none"/>
      {/* 발 */}
      <path d="M70 448 L64 460 L72 466 L84 462 L82 450" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      <path d="M130 448 L136 460 L128 466 L116 462 L118 450" fill="url(#fSkin)" stroke="#b08868" strokeWidth="0.4"/>
      {/* 클릭 영역 */}
      {renderClickAreas(BACK_REGIONS, selectedParts, onPartClick)}
      <text x="100" y="478" textAnchor="middle" fill="#7a6050" fontSize="9" fontWeight="600">후면</text>
    </svg>
  );
}

// ===== 공통 클릭 영역 렌더링 =====
function renderClickAreas(
  regions: Record<string, { cx: number; cy: number; rx: number; ry: number }>,
  selectedParts: Set<string>,
  onPartClick: (id: string) => void
) {
  return Object.entries(regions).map(([partId, region]) => {
    const isSelected = selectedParts.has(partId);
    // 좌우 대칭 부위 (팔, 다리 등) - 양쪽에 클릭 영역 생성
    const isBilateral = ["upperArm", "elbow", "wrist", "hand", "thigh", "knee", "knee_back", "shin", "calf", "ankle", "foot"].includes(partId);

    return (
      <g key={partId}>
        {/* 좌측 또는 중앙 */}
        <ellipse
          cx={region.cx}
          cy={region.cy}
          rx={region.rx}
          ry={region.ry}
          fill={isSelected ? "rgba(239, 68, 68, 0.3)" : "transparent"}
          stroke={isSelected ? "#ef4444" : "transparent"}
          strokeWidth={isSelected ? 1.5 : 0}
          className="transition-all duration-200 hover:fill-red-400/20 hover:stroke-red-400/60 hover:stroke-1"
          style={{ cursor: "pointer" }}
          onClick={() => onPartClick(partId)}
        />
        {/* 우측 대칭 */}
        {isBilateral && (
          <ellipse
            cx={200 - region.cx}
            cy={region.cy}
            rx={region.rx}
            ry={region.ry}
            fill={isSelected ? "rgba(239, 68, 68, 0.3)" : "transparent"}
            stroke={isSelected ? "#ef4444" : "transparent"}
            strokeWidth={isSelected ? 1.5 : 0}
            className="transition-all duration-200 hover:fill-red-400/20 hover:stroke-red-400/60 hover:stroke-1"
            style={{ cursor: "pointer" }}
            onClick={() => onPartClick(partId)}
          />
        )}
      </g>
    );
  });
}

// ===== 메인 BodyMap 컴포넌트 =====
interface BodyMapProps {
  selectedParts: Set<string>;
  onPartClick: (partId: string) => void;
}

export default function BodyMap({ selectedParts, onPartClick }: BodyMapProps) {
  const [activeView, setActiveView] = useState<"male" | "female">("male");

  return (
    <div className="space-y-3">
      {/* 성별 토글 */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setActiveView("male")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeView === "male"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          👨 남성
        </button>
        <button
          onClick={() => setActiveView("female")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeView === "female"
              ? "bg-pink-500 text-white shadow-md"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          👩 여성
        </button>
      </div>

      {/* 인체도 - 전면(좌) + 후면(우) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card/50 rounded-xl border border-border/30 p-2">
          {activeView === "male" ? (
            <MaleFront selectedParts={selectedParts} onPartClick={onPartClick} />
          ) : (
            <FemaleFront selectedParts={selectedParts} onPartClick={onPartClick} />
          )}
        </div>
        <div className="bg-card/50 rounded-xl border border-border/30 p-2">
          {activeView === "male" ? (
            <MaleBack selectedParts={selectedParts} onPartClick={onPartClick} />
          ) : (
            <FemaleBack selectedParts={selectedParts} onPartClick={onPartClick} />
          )}
        </div>
      </div>

      {/* 안내 텍스트 */}
      <p className="text-center text-[10px] text-muted-foreground">
        아픈 부위를 터치하세요 (복수 선택 가능) · 전면/후면 모두 확인해 주세요
      </p>

      {/* 선택된 부위 수 */}
      {selectedParts.size > 0 && (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {selectedParts.size}개 부위 선택됨
          </span>
        </div>
      )}
    </div>
  );
}
