import { NextResponse } from 'next/server';

import type { AnalyzeInput, AnalyzeResponse, Gender } from '@/lib/types';
import { buildSections, buildTitle } from '@/lib/interpretation-db';
import { getStarLogReport } from '@/lib/star-log-report';

export const runtime = 'nodejs';

function isGender(x: unknown): x is Gender {
  return x === 'm' || x === 'f';
}

function parseInput(body: unknown): AnalyzeInput {
  const b = body as Record<string, unknown>;
  const name = String(b?.name ?? '').trim();
  const birthDate = String(b?.birthDate ?? '').trim();
  const birthTime = String(b?.birthTime ?? '').trim();
  const gender = b?.gender;

  if (!name) throw new Error('이름을 입력해 주세요.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('생년월일 형식이 올바르지 않습니다.');
  if (!/^\d{2}:\d{2}$/.test(birthTime)) throw new Error('태어난 시간 형식이 올바르지 않습니다.');
  if (!isGender(gender)) throw new Error('성별 값이 올바르지 않습니다.');

  return { name, birthDate, birthTime, gender };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = parseInput(body);

    const [y, m, d] = input.birthDate.split('-').map((v) => Number(v));
    const [hh] = input.birthTime.split(':').map((v) => Number(v));

    console.log('[Star-Log] 입력 전달 확인', {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      parsed: { y, m, d, h: hh, gender: input.gender },
    });

    // 러버블 로직 전용: 수학적 공식 + 한글 매핑 (ziwei 라이브러리 미사용)
    const report = getStarLogReport({ Y: y, M: m, D: d, H: hh, G: input.gender });

    const lifeMainStar = report.ziwei.lifeMainStars[0];
    console.log('[Star-Log] 자미두수 결과', {
      mode: report.mode,
      lifeMainStars: report.ziwei.lifeMainStars,
      loveMainStars: report.ziwei.loveMainStars,
    });

    const titleParts = buildTitle({
      dayGan: report.bazi.dayGan,
      lifeMainStar,
    });
    const sections = buildSections({
      dayGan: report.bazi.dayGan,
      dayPillar: report.bazi.dayPillar,
      lifeMainStar,
    });

    const res: AnalyzeResponse = {
      ok: true,
      mode: report.mode,
      title: titleParts.title,
      subtitle: titleParts.subtitle,
      bazi: report.bazi,
      ziwei: report.ziwei,
      sections,
    };

    return NextResponse.json(res);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '요청 처리 중 오류가 발생했습니다.';
    const res: AnalyzeResponse = { ok: false, message };
    return NextResponse.json(res, { status: 400 });
  }
}
