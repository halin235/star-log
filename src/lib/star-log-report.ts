/**
 * 러버블(Lubble) 프로젝트에서 검증된 자미두수·사주 핵심 로직
 * ziwei 라이브러리 없이, 수학적 공식과 한글 매핑 데이터만 사용
 */
import { Solar } from 'lunar-javascript';

import type { Gender, ZiweiResult, BaZiResult } from '@/lib/types';

// ========== 기본 상수 (한글 매핑) ==========
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const HEAVENLY_STEMS_KR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const EARTHLY_BRANCHES_KR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

type HeavenlyStemKR = (typeof HEAVENLY_STEMS_KR)[number];
type EarthlyBranchKR = (typeof EARTHLY_BRANCHES_KR)[number];

const STEM_CN_TO_KR: Record<string, HeavenlyStemKR> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
};

const BRANCH_CN_TO_KR: Record<string, EarthlyBranchKR> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

// 자미두수 12궁 (한글)
const TWELVE_PALACES = [
  '명궁', '형제궁', '부처궁', '자녀궁', '재백궁', '질액궁',
  '천이궁', '교우궁', '관록궁', '전택궁', '복덕궁', '부모궁',
] as const;

// 14 주성 (한글) - 러버블 매핑 데이터
const ZI_WEI_GROUP = ['자미', '천기', '태양', '무곡', '천동', '염정'];
const TIAN_FU_GROUP = ['천부', '태음', '탐랑', '거문', '천상', '천량', '칠살', '파군'];

// ========== 인터페이스 (API 응답 형식에 맞춤) ==========
export type StarLogReport = {
  mode: 'HYBRID' | 'FALLBACK';
  bazi: BaZiResult;
  ziwei: ZiweiResult;
};

interface EightCharData {
  year: { gan: string; zhi: string; full: string };
  month: { gan: string; zhi: string; full: string };
  day: { gan: string; zhi: string; full: string };
  time: { gan: string; zhi: string; full: string };
}

// ========== 만세력: lunar-javascript로 사주 팔자 ==========
function getEightCharFromBirth(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): EightCharData {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  return {
    year: {
      gan: eightChar.getYearGan(),
      zhi: eightChar.getYearZhi(),
      full: eightChar.getYear(),
    },
    month: {
      gan: eightChar.getMonthGan(),
      zhi: eightChar.getMonthZhi(),
      full: eightChar.getMonth(),
    },
    day: {
      gan: eightChar.getDayGan(),
      zhi: eightChar.getDayZhi(),
      full: eightChar.getDay(),
    },
    time: {
      gan: eightChar.getTimeGan(),
      zhi: eightChar.getTimeZhi(),
      full: eightChar.getTime(),
    },
  };
}

// ========== 자미두수: 오행국 ==========
/** 오행국: 2(수이국), 3(목삼국), 4(금사국), 5(토오국), 6(화육국) */
function getWuXingJu(lunarYear: number, lunarMonth: number): number {
  const juValues = [2, 3, 4, 5, 6];
  const idx = (lunarYear + lunarMonth) % 5;
  return juValues[idx];
}

// ========== 자미두수: 자미성 위치 ==========
/** 자미성 위치 = (음력일 / 오행국) 기반 12궁 인덱스 */
function getZiWeiStarPosition(lunarDay: number, wuxingJu: number): number {
  const position = Math.ceil(lunarDay / wuxingJu) % 12;
  return position;
}

// ========== 자미두수: 14주성 12궁 배치 ==========
/** 자미계 6성 + 천부계 8성 배치 (러버블 알고리즘) */
function distributeStars(ziWeiPos: number): (string | null)[] {
  const result: (string | null)[] = new Array(12).fill(null);

  // 자미계 6성: 자미 위치 기준 역순 오프셋
  const ziWeiOffsets = [0, -1, -3, -4, -6, -7];
  for (let i = 0; i < ZI_WEI_GROUP.length; i++) {
    const pos = ((ziWeiPos + ziWeiOffsets[i]) % 12 + 12) % 12;
    if (!result[pos]) result[pos] = ZI_WEI_GROUP[i];
  }

  // 천부계 8성: 천부는 자미와 대칭 + 오프셋 후 순행
  const tianFuPos = (12 - ziWeiPos + 4) % 12;
  const tianFuOffsets = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let i = 0; i < TIAN_FU_GROUP.length; i++) {
    const pos = (tianFuPos + tianFuOffsets[i]) % 12;
    if (!result[pos]) {
      result[pos] = TIAN_FU_GROUP[i];
    } else {
      result[pos] = result[pos] + '·' + TIAN_FU_GROUP[i];
    }
  }

  return result;
}

/** 12궁에 주성 배치 결과 */
function calculateZiWeiPalaces(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  _hour: number
): { palace: string; star: string }[] {
  const wuxingJu = getWuXingJu(lunarYear, lunarMonth);
  const ziWeiPosition = getZiWeiStarPosition(lunarDay, wuxingJu);
  const starPositions = distributeStars(ziWeiPosition);

  const palaces: { palace: string; star: string }[] = [];
  for (let i = 0; i < 12; i++) {
    palaces.push({
      palace: TWELVE_PALACES[i],
      star: starPositions[i] ?? '',
    });
  }
  return palaces;
}

/** 명궁(첫 궁) 주성 → 없으면 대궁(7번째), 최종 fallback '자미' */
function getMainStarFromPalaces(palaces: { palace: string; star: string }[]): string {
  const mingGong = palaces[0];
  if (mingGong?.star) {
    const stars = mingGong.star.split('·');
    return (stars[0] ?? '').trim() || '자미';
  }
  const duiGong = palaces[6];
  if (duiGong?.star) {
    const stars = duiGong.star.split('·');
    return (stars[0] ?? '').trim() || '자미';
  }
  return '자미';
}

/** 부처궁(3번째) 주성 배열 */
function getLoveStarsFromPalaces(palaces: { palace: string; star: string }[]): string[] {
  const fuqi = palaces[2];
  if (!fuqi?.star) return [];
  return fuqi.star
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ========== 공개: 러버블 분석 (폴백 포함) ==========
function analyzeBirthLubble(data: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
}): {
  eightChar: EightCharData;
  mainStar: string;
  loveStars: string[];
  ziWeiPalaces: { palace: string; star: string }[];
} {
  const minute = data.minute ?? 0;
  const solar = Solar.fromYmdHms(data.year, data.month, data.day, data.hour, minute, 0);
  const lunar = solar.getLunar();

  const eightChar = getEightCharFromBirth(data.year, data.month, data.day, data.hour, minute);
  const lunarYear = lunar.getYear();
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();

  const ziWeiPalaces = calculateZiWeiPalaces(lunarYear, lunarMonth, lunarDay, data.hour);
  const mainStar = getMainStarFromPalaces(ziWeiPalaces);
  const loveStars = getLoveStarsFromPalaces(ziWeiPalaces);

  return { eightChar, mainStar, loveStars, ziWeiPalaces };
}

/** 폴백: 만세력 실패 시 간단 순환으로 산출 */
function analyzeBirthFallback(data: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
}): {
  eightChar: EightCharData;
  mainStar: string;
  loveStars: string[];
  ziWeiPalaces: { palace: string; star: string }[];
} {
  const yearBase = 1984;
  const yearGanIdx = ((data.year - yearBase) % 10 + 10) % 10;
  const yearZhiIdx = ((data.year - yearBase) % 12 + 12) % 12;
  const seed =
    data.year * 10000 +
    data.month * 100 +
    data.day +
    data.hour * 2 +
    (data.minute && data.minute >= 30 ? 1 : 0);

  const mkPillar = (offset: number) => {
    const gan = HEAVENLY_STEMS[((seed + offset) % 10 + 10) % 10];
    const zhi = EARTHLY_BRANCHES[((seed + offset) % 12 + 12) % 12];
    return { gan, zhi, full: `${gan}${zhi}` };
  };

  const eightChar: EightCharData = {
    year: {
      gan: HEAVENLY_STEMS[yearGanIdx],
      zhi: EARTHLY_BRANCHES[yearZhiIdx],
      full: `${HEAVENLY_STEMS[yearGanIdx]}${EARTHLY_BRANCHES[yearZhiIdx]}`,
    },
    month: mkPillar(3),
    day: mkPillar(7),
    time: mkPillar(11),
  };

  const ziWeiPalaces = calculateZiWeiPalaces(data.year, data.month, data.day, data.hour);
  const mainStar = getMainStarFromPalaces(ziWeiPalaces);
  const loveStars = getLoveStarsFromPalaces(ziWeiPalaces);

  return { eightChar, mainStar, loveStars, ziWeiPalaces };
}

// ========== Star-Log API용 진입점 ==========
/**
 * 생년월일시로 사주·자미두수 결과 반환 (러버블 로직 전용, ziwei 라이브러리 미사용)
 * API 응답 형식: bazi(일간/일지), ziwei(lifeMainStars, loveMainStars)
 */
export function getStarLogReport(input: {
  Y: number;
  M: number;
  D: number;
  H: number;
  G: Gender;
}): StarLogReport {
  const { Y, M, D, H } = input;
  const birth = { year: Y, month: M, day: D, hour: H, minute: 0 };

  let result: {
    eightChar: EightCharData;
    mainStar: string;
    loveStars: string[];
    ziWeiPalaces: { palace: string; star: string }[];
  };

  try {
    result = analyzeBirthLubble(birth);
  } catch {
    result = analyzeBirthFallback(birth);
  }

  const dayGan = result.eightChar.day.gan;
  const dayZhi = result.eightChar.day.zhi;
  const bazi: BaZiResult = {
    dayGan,
    dayZhi,
    dayPillar: result.eightChar.day.full,
  };

  const ziwei: ZiweiResult = {
    lifeMainStars: result.mainStar ? [result.mainStar] : [],
    loveMainStars: result.loveStars.length > 0 ? result.loveStars : [],
  };

  return {
    mode: 'HYBRID',
    bazi,
    ziwei,
  };
}
