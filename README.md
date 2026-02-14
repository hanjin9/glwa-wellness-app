# GLWA Wellness App

글로벌 리더 웰니스 멤버십 플랫폼

## 🌟 주요 기능

### ✅ 완료된 기능
- **다국어 지원** (영어 베이스 → 스페인어 → 중국어 → 일본어 → 한국어)
- **폰트 크기 조절** (5단계: 매우 작게 ~ 매우 크게)
- **회원 등급 시스템** (8단계: 실버 → 블랙 플래티넘)
- **건강 체크** (HanJin Level -9 ~ +9 색상 시스템)
- **VIP 라운지** (14가지 프리미엄 혜택)
- **설정 페이지** (폰트/다크모드/언어/알림)
- **모바일 최적화** (Plan B 레이아웃: 상단 홈+설정, 하단 4탭)

### 🔜 구현 예정
- 포인트 경제 시스템
- 암호화폐 시황 (BTC/ETH)
- 기부 시스템 (회사 2배 매칭)
- 소셜 로그인 (Google/Apple)
- 결제 시스템 (Toss/Stripe)
- 셀러 입점 시스템
- 뇌건강 기능 (AI 퀴즈/게임)

## 📱 화면 구조

### 상단 헤더
- 좌측: 홈 버튼 (홈 화면 외 모든 화면)
- 우측: 설정 버튼 (항상 표시)

### 하단 네비게이션
1. 내 정보 (Profile)
2. 미션 (Missions)
3. 쇼핑 (Shop)
4. 커뮤니티 (Community)

## 🌍 다국어 우선순위
1. 🇬🇧 영어 (EN) - 글로벌 베이스
2. 🇪🇸 스페인어 (ES)
3. 🇨🇳 중국어 (ZH)
4. 🇯🇵 일본어 (JA)
5. 🇰🇷 한국어 (KO) - 마스터

## 🎨 회원 등급 8단계
1. 🥈 실버 (Silver)
2. 🥇 골드 (Gold)
3. 💚 그린 에메랄드 (Green Emerald)
4. 💎 블루 사파이어 (Blue Sapphire)
5. 💠 다이아몬드 (Diamond)
6. 💙 블루 다이아몬드 (Blue Diamond)
7. ⭐ 플래티넘 (Platinum)
8. 👑 블랙 플래티넘 (Black Platinum)

## 💎 VIP 라운지 혜택 (14가지)
1. 🏥 맞춤 건강 관리
2. 📦 월간 건강 키트 발송
3. 🌍 세계 리더 교류
4. ✈️ 국제·국내 테마 여행
5. 🍷 와인 교류 파티
6. 🎨 맞춤 취미 서클
7. 🎫 VIP 전용 할인 쿠폰
8. 📹 1:1 화상 상담
9. 🎟️ 게스트 초대권
10. 🤝 네트워킹 이벤트
11. 🏆 분기별 챌린지 대회
12. 📇 VIP 멤버 디렉토리
13. 📚 프라이빗 북 클럽
14. 🎵 힐링 배경 스트리밍

## 🎨 건강 체크 색상 시스템 (HanJin Level)
- **-9**: 🔴 진빨강 (Deep Red) `#dc2626`
- **-7**: 🟤 진밤색 (Deep Brown) `#92400e`
- **-5**: 🟠 진주황 (Deep Orange) `#ea580c`
- **-3**: 🟡 연주황 (Light Orange) `#f97316`
- **0**: 🟡 노랑 (Yellow) `#fbbf24`
- **+3**: 🟢 연초록 (Light Green) `#84cc16`
- **+5**: 🟢 진초록 (Deep Green) `#22c55e`
- **+7**: 🔵 연파랑 (Light Blue) `#60a5fa`
- **+9**: 🔵 진파랑 (Deep Blue) `#2563eb`

## 🚀 개발 환경

### 로컬 개발
```bash
npm install --legacy-peer-deps
npm run dev
```

### 빌드 (Cloudflare Pages에서 자동)
```bash
npm run build
```

### GitHub 푸시
```bash
git add .
git commit -m "메시지"
git push origin main
```

## 📦 기술 스택
- **프론트엔드**: React + TypeScript + Vite + TailwindCSS
- **상태관리**: React Hooks
- **다국어**: Custom useTranslation Hook
- **폰트**: Noto Sans KR, Cormorant Garamond
- **애니메이션**: Framer Motion
- **라우팅**: Wouter
- **배포**: Cloudflare Pages

## 📁 프로젝트 구조
```
webapp/
├── client/src/
│   ├── components/       # 재사용 컴포넌트
│   │   ├── MobileLayout.tsx
│   │   ├── MembershipBadge.tsx
│   │   └── HealthCheckColorSelector.tsx
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── Settings.tsx
│   │   ├── HealthCheck.tsx
│   │   └── VIPLounge.tsx
│   ├── hooks/            # 커스텀 훅
│   │   ├── useTranslation.ts
│   │   └── useFontScale.ts
│   └── locales/          # 다국어 번역
│       └── translations.ts
└── README.md
```

## 📄 라이선스
MIT License

## 👥 제작
GLWA (Global Leaders Wellness Association)

---

**최종 업데이트**: 2025-02-14  
**버전**: 1.0.0  
**상태**: ✅ 개발 중
