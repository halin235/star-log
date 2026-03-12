/**
 * 러버블(Lubble) 프로젝트에서 검증된 자미두수·사주 핵심 로직
 * ziwei 라이브러리 없이, 수학적 공식과 한글 매핑 데이터만 사용
 */
import { Solar } from 'lunar-javascript';

import type {
  Gender,
  ZiweiResult,
  BaZiResult,
  EightCharFull,
  ElementBalance,
  LunarInfo,
  ZiWeiPalaceEntry,
} from '@/lib/types';

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

// 오행 매핑 (천간·지지 → 木火土金水)
const STEM_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const BRANCH_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 납음 (천간+지지 → 한자명, 표시용)
const NAYIN_KR: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '爐中火', '丁卯': '爐中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路傍土', '辛未': '路傍土',
  '壬申': '劍鋒金', '癸酉': '劍鋒金', '甲戌': '山頭火', '乙亥': '山頭火',
  '丙子': '澗下水', '丁丑': '澗下水', '戊寅': '城頭土', '己卯': '城頭土',
  '庚辰': '白鑞金', '辛巳': '白鑞金', '壬午': '楊柳木', '癸未': '楊柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹靂火', '己丑': '霹靂火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '長流水', '癸巳': '長流水', '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆燈火', '乙巳': '覆燈火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驛土', '己酉': '大驛土', '庚戌': '釵釧金', '辛亥': '釵釧金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
};

const SANGXIAO_KR: Record<string, string> = {
  '子': '쥐', '丑': '소', '寅': '호랑이', '卯': '토끼', '辰': '용', '巳': '뱀',
  '午': '말', '未': '양', '申': '원숭이', '酉': '닭', '戌': '개', '亥': '돼지',
};

/** 14주성별 키워드 (러버블 스타일) */
const STAR_TRAITS: Record<string, string[]> = {
  '자미': ['품격', '리더십', '중심'],
  '천기': ['전략', '학습', '분석'],
  '태양': ['명료', '영향력', '공정'],
  '무곡': ['성과', '실행', '인내'],
  '천동': ['소통', '유연', '친화'],
  '염정': ['감각', '예술', '감성'],
  '천부': ['안정', '신뢰', '운영'],
  '태음': ['차분', '내면', '배려'],
  '탐랑': ['트렌드', '기획', '연결'],
  '거문': ['고독', '깊이', '연구'],
  '천량': ['의리', '보호', '원칙'],
  '칠살': ['도전', '결단', '행동'],
  '파군': ['변화', '돌파', '혁신'],
  '기타': ['다양성', '적응'],
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
  eightChar?: EightCharFull;
  elementBalance?: ElementBalance;
  ziWeiPalaces?: ZiWeiPalaceEntry[];
  mainStar?: string;
  traits?: string[];
  lunarInfo?: LunarInfo;
  summaryAdvice?: string;
};

// ========== 만세력: lunar-javascript로 사주 팔자 (풀+오행·납음) ==========
function pillarWithWuxingNayin(gan: string, zhi: string, full: string) {
  const wuxing = STEM_ELEMENT[gan] || BRANCH_ELEMENT[zhi] || '—';
  const nayin = NAYIN_KR[gan + zhi] || '—';
  return { gan, zhi, full, wuxing, nayin };
}

function getEightCharFromBirth(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): EightCharFull {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  return {
    year: pillarWithWuxingNayin(ec.getYearGan(), ec.getYearZhi(), ec.getYear()),
    month: pillarWithWuxingNayin(ec.getMonthGan(), ec.getMonthZhi(), ec.getMonth()),
    day: pillarWithWuxingNayin(ec.getDayGan(), ec.getDayZhi(), ec.getDay()),
    time: pillarWithWuxingNayin(ec.getTimeGan(), ec.getTimeZhi(), ec.getTime()),
  };
}

/** 오행(木火土金水) 비중 계산 — 8글자 천간·지지 합산 */
function analyzeElementBalance(eightChar: EightCharFull): ElementBalance {
  const balance: ElementBalance = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const pillars = [eightChar.year, eightChar.month, eightChar.day, eightChar.time];
  for (const p of pillars) {
    const s = STEM_ELEMENT[p.gan];
    const b = BRANCH_ELEMENT[p.zhi];
    if (s) balance[s as keyof ElementBalance] = (balance[s as keyof ElementBalance] ?? 0) + 1;
    if (b) balance[b as keyof ElementBalance] = (balance[b as keyof ElementBalance] ?? 0) + 1;
  }
  return balance;
}

/** 음력·년주·띠 정보 */
function getLunarInfo(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): LunarInfo {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const yearZhi = ec.getYearZhi();
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    yearGanZhi: ec.getYear(),
    shengxiao: SANGXIAO_KR[yearZhi] ?? '—',
  };
}

/** 주성+오행 기반 총평/조언 문장 */
function buildSummaryAdvice(mainStar: string, dayGan: string): string {
  const element = STEM_ELEMENT[dayGan] || '土';
  const starDesc: Record<string, string> = {
    '자미': '중심을 잡는 리더십',
    '천기': '전략과 학습의 두뇌',
    '태양': '명료한 영향력',
    '무곡': '성과를 내는 실행력',
    '천동': '소통과 유연함',
    '염정': '감각과 예술성',
    '천부': '안정과 신뢰',
    '태음': '차분한 내면',
    '탐랑': '트렌드와 기획력',
    '거문': '깊이 있는 연구',
    '천량': '의리와 보호',
    '칠살': '도전과 결단',
    '파군': '변화와 돌파',
  };
  const desc = starDesc[mainStar] || '다양한 가능성';
  const elementKr: Record<string, string> = { '木': '목', '火': '화', '土': '토', '金': '금', '水': '수' };
  const ek = elementKr[element] || element;
  return `${mainStar}성의 ${desc}과(와) ${ek}행의 기운이 맞물려, 일과 관계 모두에서 균형을 찾아가시면 좋습니다. 강한 부분은 살리고 부족한 오행은 생활 습관과 환경으로 보완해 보세요.`;
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
  eightChar: EightCharFull;
  mainStar: string;
  loveStars: string[];
  ziWeiPalaces: ZiWeiPalaceEntry[];
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
  eightChar: EightCharFull;
  mainStar: string;
  loveStars: string[];
  ziWeiPalaces: ZiWeiPalaceEntry[];
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
    return pillarWithWuxingNayin(gan, zhi, `${gan}${zhi}`);
  };

  const eightChar: EightCharFull = {
    year: pillarWithWuxingNayin(
      HEAVENLY_STEMS[yearGanIdx],
      EARTHLY_BRANCHES[yearZhiIdx],
      `${HEAVENLY_STEMS[yearGanIdx]}${EARTHLY_BRANCHES[yearZhiIdx]}`
    ),
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
  Min?: number;
  G: Gender;
}): StarLogReport {
  const { Y, M, D, H, Min = 0 } = input;
  const birth = { year: Y, month: M, day: D, hour: H, minute: Min };

  let result: {
    eightChar: EightCharFull;
    mainStar: string;
    loveStars: string[];
    ziWeiPalaces: ZiWeiPalaceEntry[];
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

  const elementBalance = analyzeElementBalance(result.eightChar);
  let lunarInfo: LunarInfo | undefined;
  try {
    lunarInfo = getLunarInfo(Y, M, D, H, 0);
  } catch {
    lunarInfo = undefined;
  }

  const mainStar = result.mainStar || '자미';
  const traits = STAR_TRAITS[mainStar] ?? STAR_TRAITS['기타'];
  const summaryAdvice = buildSummaryAdvice(mainStar, dayGan);

  return {
    mode: 'HYBRID',
    bazi,
    ziwei,
    eightChar: result.eightChar,
    elementBalance,
    ziWeiPalaces: result.ziWeiPalaces,
    mainStar,
    traits,
    lunarInfo,
    summaryAdvice,
  };
}
