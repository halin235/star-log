import { Solar } from 'lunar-javascript';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ziwei: any = require('ziwei');

import type { Gender, ZiweiResult, BaZiResult } from '@/lib/types';

/** ziwei 라이브러리: Plate는 Birthday 객체를 받고, 궁은 getPalaces()로 가져오며 duty(命宮, 夫妻 등)로 찾음 */
const HAN_TO_KOR_STAR: Record<string, string> = {
  紫微: '자미', 天机: '천기', 太阳: '태양', 武曲: '무곡', 天同: '천동', 廉贞: '염정',
  天府: '천부', 太阴: '태음', 贪狼: '탐랑', 巨门: '거문', 天相: '천상', 天梁: '천량', 七杀: '칠살', 破军: '파군',
  陀罗: '타라', 文昌: '문창', 擎羊: '경양', 天刑: '천형', 铃星: '령성',
};

export type StarLogReport = {
  mode: 'HYBRID' | 'FALLBACK';
  bazi: BaZiResult;
  ziwei: ZiweiResult;
};

function toKoreanStarName(name: string): string {
  return HAN_TO_KOR_STAR[name] ?? name;
}

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
    const birthday = {
      year: Y,
      month: M,
      day: D,
      hour: H,
      minute: 0,
      second: 0,
      sex: (G === 'f' ? 0 : 1) as 0 | 1,
    };
    const pt = new ziwei.Plate(birthday);
    const palaces = pt.getPalaces();
    if (!Array.isArray(palaces)) throw new Error('getPalaces() is not array');

    const findPalace = (needle: string) =>
      palaces.find((p: any) => typeof p?.duty === 'string' && p.duty.includes(needle));

    const life = findPalace('命');
    const love = findPalace('妻') || findPalace('夫');

    const pickStars = (palace: any): string[] => {
      if (!palace || !Array.isArray(palace.stars)) return [];
      return palace.stars
        .map((s: any) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean)
        .map((s: any) => toKoreanStarName(String(s)));
    };

    ziweiRes = {
      lifeMainStars: pickStars(life),
      loveMainStars: pickStars(love),
    };
  } catch (e) {
    mode = 'FALLBACK';
    ziweiRes = { lifeMainStars: [], loveMainStars: [] };
  }

  return {
    mode,
    bazi: { dayGan, dayZhi, dayPillar },
    ziwei: ziweiRes,
  };
}

