import { NextResponse } from 'next/server';
import { Solar } from 'lunar-javascript';

import type { AnalyzeInput, AnalyzeResponse, Gender } from '@/lib/types';
import { buildSections, buildTitle } from '@/lib/interpretation-db';
import { getStarLogReport } from '@/lib/star-log-report';

// ziwei는 CommonJS 패키지라 require 방식으로 가져온다.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ziwei: any = require('ziwei');

export const runtime = 'nodejs';

const HAN_TO_KOR_STAR: Record<string, string> = {
  紫微: '자미', 天机: '천기', 太阳: '태양', 武曲: '무곡', 天同: '천동', 廉贞: '염정',
  天府: '천부', 太阴: '태음', 贪狼: '탐랑', 巨门: '거문', 天相: '천상', 天梁: '천량', 七杀: '칠살', 破军: '파군',
  陀罗: '타라', 文昌: '문창', 擎羊: '경양', 天刑: '천형', 铃星: '령성',
};

function toKoreanStarName(name: string): string {
  return HAN_TO_KOR_STAR[name] ?? name;
}

function isGender(x: unknown): x is Gender {
  return x === 'm' || x === 'f';
}

function parseInput(body: any): AnalyzeInput {
  const name = String(body?.name ?? '').trim();
  const birthDate = String(body?.birthDate ?? '').trim();
  const birthTime = String(body?.birthTime ?? '').trim();
  const gender = body?.gender;

  if (!name) throw new Error('이름을 입력해 주세요.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('생년월일 형식이 올바르지 않습니다.');
  if (!/^\d{2}:\d{2}$/.test(birthTime)) throw new Error('태어난 시간 형식이 올바르지 않습니다.');
  if (!isGender(gender)) throw new Error('성별 값이 올바르지 않습니다.');

  return { name, birthDate, birthTime, gender };
}

/** ziwei: Plate는 Birthday 객체를 받고, getPalaces()로 궁 목록을 가져오며 duty(命宮, 夫妻)로 찾음 */
function getZiweiStars(params: { y: number; m: number; d: number; h: number; gender: Gender }) {
  const birthday = {
    year: params.y,
    month: params.m,
    day: params.d,
    hour: params.h,
    minute: 0,
    second: 0,
    sex: (params.gender === 'f' ? 0 : 1) as 0 | 1,
  };
  const pt = new ziwei.Plate(birthday);
  const palaces = pt.getPalaces();
  if (!Array.isArray(palaces)) return { lifeMainStars: [], loveMainStars: [] };

  const findPalace = (needle: string) =>
    palaces.find((p: any) => typeof p?.duty === 'string' && p.duty.includes(needle));

  const life = findPalace('命');
  const love = findPalace('妻') || findPalace('夫');

  const pickStars = (palace: any): string[] => {
    if (!palace?.stars || !Array.isArray(palace.stars)) return [];
    return palace.stars
      .map((s: any) => (typeof s === 'string' ? s : s?.name))
      .filter(Boolean)
      .map((s: any) => toKoreanStarName(String(s)));
  };

  return {
    lifeMainStars: pickStars(life),
    loveMainStars: pickStars(love),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = parseInput(body);

    const [y, m, d] = input.birthDate.split('-').map((v) => Number(v));
    const [hh, mm] = input.birthTime.split(':').map((v) => Number(v));

    console.log('[Star-Log] 입력 전달 확인', {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      parsed: { y, m, d, h: hh, mm, gender: input.gender },
    });

    // 사주 (일간/일지)
    const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
    const baZi = solar.getLunar().getEightChar();
    const dayGan = String(baZi.getDayGan());
    const dayZhi = String(baZi.getDayZhi());
    const dayPillar = `${dayGan}${dayZhi}`;

    // 자미두수 (라이브러리 시도 → 실패 시 test.js 기반 폴백)
    let ziweiRes = { lifeMainStars: [] as string[], loveMainStars: [] as string[] };
    let mode: 'HYBRID' | 'FALLBACK' = 'HYBRID';

    try {
      ziweiRes = getZiweiStars({ y, m, d, h: hh, gender: input.gender });
    } catch (e) {
      console.error('[Star-Log] ziwei primary call failed', e);
      mode = 'FALLBACK';
      ziweiRes = { lifeMainStars: [], loveMainStars: [] };
    }

    // ziwei 계산이 실패했거나 주성이 비어 있으면, test.js의 getStarLogReport로 보강
    if (!ziweiRes.lifeMainStars.length) {
      try {
        const backup = getStarLogReport({ Y: y, M: m, D: d, H: hh, G: input.gender });
        if (backup?.ziwei?.lifeMainStars?.length) {
          ziweiRes = {
            lifeMainStars: backup.ziwei.lifeMainStars,
            loveMainStars: backup.ziwei.loveMainStars ?? [],
          };
          mode = 'FALLBACK';
        }
      } catch (e) {
        console.error('[Star-Log] getStarLogReport fallback failed', e);
      }
    }

    const lifeMainStar = ziweiRes.lifeMainStars[0];
    console.log('[Star-Log] 자미두수 결과', { mode, lifeMainStars: ziweiRes.lifeMainStars, loveMainStars: ziweiRes.loveMainStars });

    const titleParts = buildTitle({ dayGan, lifeMainStar });
    const sections = buildSections({ dayGan, dayPillar, lifeMainStar });

    const res: AnalyzeResponse = {
      ok: true,
      mode,
      title: titleParts.title,
      subtitle: titleParts.subtitle,
      bazi: { dayGan, dayZhi, dayPillar },
      ziwei: ziweiRes,
      sections,
    };

    return NextResponse.json(res);
  } catch (e: any) {
    const res: AnalyzeResponse = { ok: false, message: e?.message ? String(e.message) : '요청 처리 중 오류가 발생했습니다.' };
    return NextResponse.json(res, { status: 400 });
  }
}

