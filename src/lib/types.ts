export type Gender = 'm' | 'f';

export type AnalyzeInput = {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  gender: Gender;
};

export type BaZiResult = {
  dayGan: string;
  dayZhi: string;
  dayPillar: string;
};

export type ZiweiResult = {
  lifeMainStars: string[];
  loveMainStars: string[];
};

/** 사주 4기둥 (년월일시) + 오행·납음 */
export type EightCharPillar = {
  gan: string;
  zhi: string;
  full: string;
  wuxing?: string;
  nayin?: string;
};

export type EightCharFull = {
  year: EightCharPillar;
  month: EightCharPillar;
  day: EightCharPillar;
  time: EightCharPillar;
};

/** 오행(木火土金水) 비중 */
export type ElementBalance = Record<string, number>;

export type ZiWeiPalaceEntry = {
  palace: string;
  star: string;
};

export type LunarInfo = {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  yearGanZhi: string;
  shengxiao: string;
};

export type InterpretationSection = {
  label: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type AnalysisResult = {
  ok: true;
  mode: 'HYBRID' | 'FALLBACK';
  title: string;
  subtitle: string;
  bazi: BaZiResult;
  ziwei: ZiweiResult;
  sections: InterpretationSection[];
  /** 러버블 스타일 풀 리포트용 */
  eightChar?: EightCharFull;
  elementBalance?: ElementBalance;
  ziWeiPalaces?: ZiWeiPalaceEntry[];
  mainStar?: string;
  traits?: string[];
  lunarInfo?: LunarInfo;
  summaryAdvice?: string;
};

export type AnalysisError = {
  ok: false;
  message: string;
};

export type AnalyzeResponse = AnalysisResult | AnalysisError;

