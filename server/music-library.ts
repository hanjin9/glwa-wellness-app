/**
 * 정신건강 알림용 음악 라이브러리
 * 5가지 장르의 샘플 음악 메타데이터
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // 초 단위
  url: string;
  description: string;
}

/**
 * 기본 음악 라이브러리
 * (실제 환경에서는 S3 URL로 대체)
 */
export const MUSIC_LIBRARY: MusicTrack[] = [
  // 80s 가요
  {
    id: 'korean-80s-1',
    title: '추억의 80년대',
    artist: 'Classic Korean',
    genre: '80s가요',
    duration: 180,
    url: 'https://example.com/music/korean-80s-1.mp3',
    description: '클래식한 80년대 한국 가요',
  },
  {
    id: 'korean-80s-2',
    title: '그때 그 시절',
    artist: 'Retro Vibes',
    genre: '80s가요',
    duration: 200,
    url: 'https://example.com/music/korean-80s-2.mp3',
    description: '향수로운 80년대 멜로디',
  },

  // 90s 가요
  {
    id: 'korean-90s-1',
    title: '신나는 90년대',
    artist: 'K-Pop Classic',
    genre: '90s가요',
    duration: 210,
    url: 'https://example.com/music/korean-90s-1.mp3',
    description: '신나는 90년대 한국 가요',
  },
  {
    id: 'korean-90s-2',
    title: '추억은 방울방울',
    artist: 'Nostalgia',
    genre: '90s가요',
    duration: 190,
    url: 'https://example.com/music/korean-90s-2.mp3',
    description: '감성적인 90년대 발라드',
  },

  // 80s 팝
  {
    id: 'pop-80s-1',
    title: 'Neon Dreams',
    artist: 'Synth Wave',
    genre: '80s팝',
    duration: 220,
    url: 'https://example.com/music/pop-80s-1.mp3',
    description: '클래식한 80년대 팝 뮤직',
  },
  {
    id: 'pop-80s-2',
    title: 'Electric Nights',
    artist: 'Retro Pop',
    genre: '80s팝',
    duration: 200,
    url: 'https://example.com/music/pop-80s-2.mp3',
    description: '신스 팝의 정수',
  },

  // 90s 팝
  {
    id: 'pop-90s-1',
    title: 'Grunge Vibes',
    artist: 'Alternative',
    genre: '90s팝',
    duration: 210,
    url: 'https://example.com/music/pop-90s-1.mp3',
    description: '90년대 얼터너티브 팝',
  },
  {
    id: 'pop-90s-2',
    title: 'Britpop Anthem',
    artist: 'British Invasion',
    genre: '90s팝',
    duration: 230,
    url: 'https://example.com/music/pop-90s-2.mp3',
    description: '90년대 브릿팝의 명곡',
  },

  // 트로트
  {
    id: 'trot-1',
    title: '서울의 밤',
    artist: 'Trot Master',
    genre: '트로트',
    duration: 240,
    url: 'https://example.com/music/trot-1.mp3',
    description: '전통 트로트의 매력',
  },
  {
    id: 'trot-2',
    title: '이별의 노래',
    artist: 'Classic Trot',
    genre: '트로트',
    duration: 250,
    url: 'https://example.com/music/trot-2.mp3',
    description: '감성적인 트로트 발라드',
  },
];

/**
 * 장르별 음악 조회
 */
export function getMusicByGenre(genre: string): MusicTrack[] {
  return MUSIC_LIBRARY.filter((track) => track.genre === genre);
}

/**
 * 랜덤 음악 조회
 */
export function getRandomMusic(): MusicTrack {
  return MUSIC_LIBRARY[Math.floor(Math.random() * MUSIC_LIBRARY.length)];
}

/**
 * 장르별 랜덤 음악 조회
 */
export function getRandomMusicByGenre(genre: string): MusicTrack | null {
  const genreMusic = getMusicByGenre(genre);
  if (genreMusic.length === 0) return null;
  return genreMusic[Math.floor(Math.random() * genreMusic.length)];
}

/**
 * 모든 장르 조회
 */
export function getAllGenres(): string[] {
  const genres = new Set(MUSIC_LIBRARY.map((track) => track.genre));
  return Array.from(genres);
}
