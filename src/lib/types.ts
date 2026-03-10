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
};

export type AnalysisError = {
  ok: false;
  message: string;
};

export type AnalyzeResponse = AnalysisResult | AnalysisError;

