import type { InterpretationSection } from '@/lib/types';

export const DAY_GAN_DB: Record<
  string,
  {
    essenceTitle: string;
    essenceSummary: string;
    bullets: string[];
  }
> = {
  甲: {
    essenceTitle: '큰 나무의 기개',
    essenceSummary: '정직함과 성장 욕구로 길을 내는 개척형 에너지',
    bullets: ['원칙을 세우고 지키는 힘', '장기전에서 강한 꾸준함', '사람을 키우는 리더십'],
  },
  乙: {
    essenceTitle: '섬세한 꽃과 덩굴의 유연함',
    essenceSummary: '관계와 분위기를 읽어 부드럽게 해내는 조율형 에너지',
    bullets: ['디테일에서 빛나는 감각', '협업에서의 유연한 설득', '작은 개선을 쌓아 큰 성과로'],
  },
  丙: {
    essenceTitle: '태양의 확신',
    essenceSummary: '밝은 추진력과 존재감으로 흐름을 주도하는 에너지',
    bullets: ['시작을 여는 스파크', '사람을 모으는 온도', '빠른 결단과 실행'],
  },
  丁: {
    essenceTitle: '촛불의 집중',
    essenceSummary: '깊게 파고들어 완성도를 올리는 몰입형 에너지',
    bullets: ['관찰력과 집중력', '정교한 완성도', '감정의 결이 섬세함'],
  },
  戊: {
    essenceTitle: '큰 산의 안정',
    essenceSummary: '신뢰와 중심을 만들어 흔들림을 줄이는 에너지',
    bullets: ['책임감과 버팀목', '신뢰 기반의 운영력', '큰 그림을 보는 감각'],
  },
  己: {
    essenceTitle: '비옥한 대지의 실용',
    essenceSummary: '현실 감각으로 자원을 정리하고 가치를 키우는 에너지',
    bullets: ['생활·돈·자원 감각', '정리/관리 능력', '꾸준한 생산성'],
  },
  庚: {
    essenceTitle: '강철의 결단',
    essenceSummary: '명확한 기준과 단호함으로 문제를 절단하는 에너지',
    bullets: ['결정의 속도', '불필요한 것을 덜어내는 능력', '정면승부의 용기'],
  },
  辛: {
    essenceTitle: '보석의 정제',
    essenceSummary: '정교한 기준으로 품질과 미감을 완성하는 에너지',
    bullets: ['퀄리티 컨트롤', '미적 안목', '기준을 세워 고급화'],
  },
  壬: {
    essenceTitle: '거대한 바다의 지혜',
    essenceSummary: '큰 흐름을 읽고 기회를 만들며 확장하는 에너지',
    bullets: ['변화에 강한 적응력', '시야가 넓고 통찰이 빠름', '확장/네트워크 운용'],
  },
  癸: {
    essenceTitle: '맑은 비의 감수성',
    essenceSummary: '사람과 마음의 결을 읽어 정교하게 이어주는 에너지',
    bullets: ['공감 기반의 설계력', '세밀한 관찰과 기록', '조용하지만 강한 지속력'],
  },
};

export const ZIWEI_STAR_DB: Record<
  string,
  {
    personaTitle: string;
    personaSummary: string;
    bullets: string[];
  }
> = {
  '탐랑': {
    personaTitle: '트렌드 리더의 감각',
    personaSummary: '다재다능함과 호기심으로 판을 바꾸는 확장형 페르소나',
    bullets: ['새로움에 빠른 반응', '기획/마케팅/브랜딩 감각', '사람과 기회를 연결하는 힘'],
  },
  '천부': {
    personaTitle: '안정의 설계자',
    personaSummary: '신뢰와 운영력으로 판을 굳히는 안정형 페르소나',
    bullets: ['관계/재정/운영의 안정감', '장기적 파트너십 지향', '차분한 리더십과 배려'],
  },
  '자미': {
    personaTitle: '중심을 잡는 리더십',
    personaSummary: '권위보다 품격으로 사람을 모으는 중심형 페르소나',
    bullets: ['품격 있는 판단', '조직/관계의 중심', '결정의 무게를 감당'],
  },
  '천기': {
    personaTitle: '전략가의 두뇌',
    personaSummary: '논리와 설계로 문제를 푸는 분석형 페르소나',
    bullets: ['기획/전략/시스템 사고', '학습 속도', '변수 대응이 빠름'],
  },
  '태양': {
    personaTitle: '명료한 영향력',
    personaSummary: '밝게 드러나며 신뢰를 얻는 공개형 페르소나',
    bullets: ['설득력 있는 표현', '공정성과 책임감', '사람을 돋우는 에너지'],
  },
  '무곡': {
    personaTitle: '성과의 실행자',
    personaSummary: '목표를 수치로 만들고 끝까지 밀어붙이는 실행형 페르소나',
    bullets: ['성과/재무 감각', '끈기와 인내', '현실적인 판단'],
  },
};

export function normalizeStarName(raw: string): string {
  // ziwei 라이브러리에서 한자/괄호가 섞여올 수 있어, 기본 한글 키로 맞춥니다.
  const s = String(raw).trim();
  if (s.includes('탐랑')) return '탐랑';
  if (s.includes('천부')) return '천부';
  if (s.includes('자미')) return '자미';
  if (s.includes('천기')) return '천기';
  if (s.includes('태양')) return '태양';
  if (s.includes('무곡')) return '무곡';
  return s.replace(/\s+/g, '');
}

export function buildSections(params: {
  dayGan: string;
  dayPillar: string;
  lifeMainStar?: string;
}): InterpretationSection[] {
  const day = DAY_GAN_DB[params.dayGan] ?? {
    essenceTitle: '당신의 본질',
    essenceSummary: '현재 DB에 없는 일간입니다. 기본 해석으로 표시합니다.',
    bullets: ['기본 해석 모드로 제공됩니다.'],
  };

  const normalizedStar = params.lifeMainStar ? normalizeStarName(params.lifeMainStar) : undefined;
  const star = normalizedStar ? ZIWEI_STAR_DB[normalizedStar] : undefined;
  const persona = star ?? {
    personaTitle: '사회적 페르소나',
    personaSummary: '현재 DB에 없는 주성입니다. 기본 해석으로 표시합니다.',
    bullets: ['기본 해석 모드로 제공됩니다.'],
  };

  return [
    {
      label: '사주 — 일간',
      title: day.essenceTitle,
      summary: `${params.dayPillar}의 일간(${params.dayGan}) 기준으로 읽는 “나의 본질”`,
      bullets: day.bullets,
    },
    {
      label: '자미두수 — 명궁 주성',
      title: persona.personaTitle,
      summary: normalizedStar
        ? `명궁 주성 “${normalizedStar}” 기반의 “사회적 페르소나”`
        : '명궁 주성 기반의 “사회적 페르소나”',
      bullets: persona.bullets,
    },
  ];
}

export function buildTitle(params: { dayGan: string; lifeMainStar?: string }): {
  title: string;
  subtitle: string;
} {
  const day = DAY_GAN_DB[params.dayGan];
  const starKey = params.lifeMainStar ? normalizeStarName(params.lifeMainStar) : undefined;
  const star = starKey ? ZIWEI_STAR_DB[starKey] : undefined;

  const essence = day?.essenceTitle ?? '깊은 본질';
  const persona = star?.personaTitle ?? '정교한 페르소나';

  return {
    title: `${essence}를 가진 ${persona}`,
    subtitle: '사주(일간) × 자미두수(명궁 주성) 하이브리드 해석',
  };
}

