/**
 * 🏛️ 제국 커뮤니티 - 6단계 게시판 서열 시스템
 * 
 * 게시판 구조:
 * 1. 전체글 (모든 회원)
 * 2. 공지사항 (읽기 전용)
 * 3. 나의 갤러리 (모든 회원)
 * 4. 교육 자격증 (교육생 이상)
 * 5. 명예의 전당 (우수 회원 이상)
 * 6. VIP 라운지 (VIP 전용)
 */

export enum BoardCategory {
  ALL_POSTS = "all_posts", // 1. 전체글
  ANNOUNCEMENTS = "announcements", // 2. 공지사항
  MY_GALLERY = "my_gallery", // 3. 나의 갤러리
  EDUCATION_CERTIFICATE = "education_certificate", // 4. 교육 자격증
  HALL_OF_FAME = "hall_of_fame", // 5. 명예의 전당
  VIP_LOUNGE = "vip_lounge", // 6. VIP 라운지
}

export enum AccessLevel {
  ALL = "all", // 모든 회원
  EDUCATOR = "educator", // 교육생 이상
  EXCELLENT = "excellent", // 우수 회원 이상
  VIP = "vip", // VIP 전용
  READ_ONLY = "read_only", // 읽기 전용
}

export enum UserRole {
  USER = "user",
  EDUCATOR = "educator",
  EXCELLENT_MEMBER = "excellent_member",
  VIP = "vip",
  ADMIN = "admin",
}

/**
 * 게시판 카테고리 설정
 */
export const BOARD_CATEGORIES = [
  {
    id: BoardCategory.ALL_POSTS,
    name: "전체글",
    description: "제국의 모든 소식이 모이는 광장",
    order: 1,
    accessLevel: AccessLevel.ALL,
    icon: "globe",
    glowEffect: false,
    color: "text-gray-300",
  },
  {
    id: BoardCategory.ANNOUNCEMENTS,
    name: "공지사항",
    description: "사장님의 엄중한 명령과 공식 가이드",
    order: 2,
    accessLevel: AccessLevel.READ_ONLY,
    icon: "megaphone",
    glowEffect: false,
    color: "text-yellow-400",
  },
  {
    id: BoardCategory.MY_GALLERY,
    name: "나의 갤러리",
    description: "개인의 변화(Before/After) 및 일상 공유",
    order: 3,
    accessLevel: AccessLevel.ALL,
    icon: "image",
    glowEffect: false,
    color: "text-blue-300",
  },
  {
    id: BoardCategory.EDUCATION_CERTIFICATE,
    name: "교육 자격증",
    description: "교육 자료 열람 및 자격증 인증 현황",
    order: 4,
    accessLevel: AccessLevel.EDUCATOR,
    icon: "award",
    glowEffect: false,
    color: "text-purple-400",
  },
  {
    id: BoardCategory.HALL_OF_FAME,
    name: "명예의 전당",
    description: "최고 성과자 및 고레벨 리더들의 기록 보관소",
    order: 5,
    accessLevel: AccessLevel.EXCELLENT,
    icon: "trophy",
    glowEffect: true, // 황금빛 Glow
    color: "text-yellow-500",
  },
  {
    id: BoardCategory.VIP_LOUNGE,
    name: "VIP 라운지",
    description: "최상위 0.1% 리더들만을 위한 비밀 소통 창구",
    order: 6,
    accessLevel: AccessLevel.VIP,
    icon: "crown",
    glowEffect: true, // 황금빛 Glow
    color: "text-yellow-600",
  },
];

/**
 * 게시물 기본 구조
 */
export interface Post {
  id: string;
  boardId: BoardCategory;
  userId: string;
  title: string;
  content: string;
  images?: string[]; // 갤러리용
  attachments?: {
    // 교육 자격증용
    type: "pdf" | "video" | "certificate";
    url: string;
    title: string;
  }[];
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean; // 공지사항용
  authorRole: UserRole;
  authorLevel: number; // HanJin Level
}

/**
 * 댓글 구조
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  authorRole: UserRole;
}

/**
 * 교육 자격증 구조
 */
export interface EducationCertificate {
  id: string;
  userId: string;
  title: string;
  description: string;
  certificateUrl: string; // 자격증 이미지
  issueDate: Date;
  expiryDate?: Date;
  verified: boolean;
  verifiedBy?: string; // 관리자 ID
  verifiedAt?: Date;
  createdAt: Date;
}

/**
 * 명예의 전당 기록
 */
export interface HallOfFameEntry {
  id: string;
  userId: string;
  userName: string;
  userLevel: number; // HanJin Level
  achievement: string; // 성과 설명
  score: number; // 점수
  category: string; // 카테고리 (미션, 게임, 건강, 등)
  rank: number; // 순위
  badge?: string; // 배지 이미지
  createdAt: Date;
  updatedAt: Date;
}

/**
 * VIP 라운지 권한 설정
 */
export interface VIPLoungeMembership {
  userId: string;
  vipLevel: number; // 1-10
  joinedAt: Date;
  expiryDate?: Date;
  permissions: {
    canPost: boolean;
    canComment: boolean;
    canViewAll: boolean;
    canInvite: boolean;
  };
}

/**
 * 게시판 접근 권한 검증 함수
 */
export function canAccessBoard(
  userRole: UserRole,
  userLevel: number,
  boardCategory: BoardCategory
): boolean {
  const board = BOARD_CATEGORIES.find((b) => b.id === boardCategory);
  if (!board) return false;

  switch (board.accessLevel) {
    case AccessLevel.ALL:
      return true;
    case AccessLevel.READ_ONLY:
      return true; // 모든 사용자 읽기 가능
    case AccessLevel.EDUCATOR:
      return userRole === UserRole.EDUCATOR || userRole === UserRole.ADMIN;
    case AccessLevel.EXCELLENT:
      return (
        userRole === UserRole.EXCELLENT_MEMBER ||
        userRole === UserRole.VIP ||
        userRole === UserRole.ADMIN
      );
    case AccessLevel.VIP:
      return userRole === UserRole.VIP || userRole === UserRole.ADMIN;
    default:
      return false;
  }
}

/**
 * 게시물 작성 권한 검증
 */
export function canPostOnBoard(
  userRole: UserRole,
  boardCategory: BoardCategory
): boolean {
  const board = BOARD_CATEGORIES.find((b) => b.id === boardCategory);
  if (!board) return false;

  // 공지사항은 관리자만 작성 가능
  if (boardCategory === BoardCategory.ANNOUNCEMENTS) {
    return userRole === UserRole.ADMIN;
  }

  // 나머지는 접근 권한이 있으면 작성 가능
  return canAccessBoard(userRole, 0, boardCategory);
}

/**
 * 도파민-세로토닌 시너지 점수 계산
 * 명예와 보상이 뇌의 사회적 동기 부여에 미치는 영향
 */
export function calculateMotivationScore(
  entry: HallOfFameEntry,
  isPublicDisplay: boolean = true
): number {
  let baseScore = entry.score;

  // 공적 인정의 세로토닌 부스트 (400% 증가)
  if (isPublicDisplay) {
    baseScore *= 5; // 400% 증가 = 5배
  }

  // 레벨에 따른 도파민 보정
  const levelBonus = entry.userLevel * 10;

  return baseScore + levelBonus;
}
