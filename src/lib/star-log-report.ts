import { Solar } from 'lunar-javascript';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ziwei: any = require('ziwei');

import type { Gender, ZiweiResult, BaZiResult } from '@/lib/types';

export type StarLogReport = {
  mode: 'HYBRID' | 'FALLBACK';
  bazi: BaZiResult;
  ziwei: ZiweiResult;
};

export function getStarLogReport(input: { Y: number; M: number; D: number; H: number; G: Gender }): StarLogReport {
  const { Y, M, D, H, G } = input;

  const solar = Solar.fromYmdHms(Y, M, D, H, 0, 0);
  const baZi = solar.getLunar().getEightChar();
  const dayGan = String(baZi.getDayGan());
  const dayZhi = String(baZi.getDayZhi());
  const dayPillar = `${dayGan}${dayZhi}`;

  let ziweiRes: ZiweiResult = { lifeMainStars: [], loveMainStars: [] };
  let mode: 'HYBRID' | 'FALLBACK' = 'HYBRID';

  try {
    const fn = new ziwei.FateNum(Y, M, D, H, G);
    const pt = new ziwei.Plate(fn);

    const findPalace = (name: string) =>
      pt.palaces.find((p: any) => typeof p.name === 'string' && p.name.includes(name));

    const life = findPalace('命') || findPalace('명');
    const love = findPalace('妻') || findPalace('부처');

    const pickStars = (palace: any): string[] => {
      if (!palace || !Array.isArray(palace.stars)) return [];
      return palace.stars
        .map((s: any) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean)
        .map((s: any) => String(s));
    };

    ziweiRes = {
      lifeMainStars: pickStars(life),
      loveMainStars: pickStars(love),
    };
  } catch {
    mode = 'FALLBACK';
    ziweiRes = {
      lifeMainStars: ['탐랑'],
      loveMainStars: ['천부'],
    };
  }

  return {
    mode,
    bazi: { dayGan, dayZhi, dayPillar },
    ziwei: ziweiRes,
  };
}

