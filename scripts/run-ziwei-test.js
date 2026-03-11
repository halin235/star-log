/**
 * 자미두수 5가지 생년월일시 케이스 셀프 테스트
 * node scripts/run-ziwei-test.js
 */
const ziwei = require('ziwei');

const HAN_TO_KOR = {
  紫微: '자미', 天机: '천기', 太阳: '태양', 武曲: '무곡', 天同: '천동', 廉贞: '염정',
  天府: '천부', 太阴: '태음', 贪狼: '탐랑', 巨门: '거문', 天相: '천상', 天梁: '천량', 七杀: '칠살', 破军: '파군',
};

function toKorean(name) {
  return HAN_TO_KOR[name] ?? name;
}

function getLifeMainStar(y, m, d, h, sex) {
  try {
    const birthday = { year: y, month: m, day: d, hour: h, minute: 0, second: 0, sex: sex === 'f' ? 0 : 1 };
    const pt = new ziwei.Plate(birthday);
    const palaces = pt.getPalaces();
    if (!Array.isArray(palaces)) return null;
    const life = palaces.find((p) => p.duty && p.duty.includes('命'));
    if (!life || !Array.isArray(life.stars)) return null;
    const names = life.stars.map((s) => (s && s.name ? toKorean(s.name) : '')).filter(Boolean);
    return names.length ? names : null;
  } catch (e) {
    return { error: e.message };
  }
}

const cases = [
  { label: '1990-05-21 14:30 여', y: 1990, m: 5, d: 21, h: 14, sex: 'f' },
  { label: '1985-11-08 09:00 남', y: 1985, m: 11, d: 8, h: 9, sex: 'm' },
  { label: '1997-12-16 10:00 여', y: 1997, m: 12, d: 16, h: 10, sex: 'f' },
  { label: '2000-03-03 22:15 남', y: 2000, m: 3, d: 3, h: 22, sex: 'm' },
  { label: '1988-07-25 06:45 여', y: 1988, m: 7, d: 25, h: 6, sex: 'f' },
];

console.log('========== 자미두수 명궁 주성 5-case 테스트 ==========\n');

const results = [];
for (const c of cases) {
  const stars = getLifeMainStar(c.y, c.m, c.d, c.h, c.sex);
  results.push({ label: c.label, stars });
  if (stars && !stars.error) {
    console.log(`[${c.label}] 명궁 주성: ${stars.join(', ')}`);
  } else {
    console.log(`[${c.label}] 명궁 주성: (오류 또는 없음) ${stars && stars.error ? stars.error : ''}`);
  }
}

const unique = new Set(results.filter((r) => r.stars && !r.stars.error).map((r) => r.stars.join(',')));
console.log('\n-------- 결과 요약 --------');
console.log(`서로 다른 주성 조합 수: ${unique.size} / ${results.length} 케이스`);
if (unique.size >= 2) {
  console.log('OK: 서로 다른 생년월일시에 따라 명궁 주성이 다르게 산출됨.');
} else if (results.every((r) => r.stars && !r.stars.error)) {
  console.log('주의: 모든 케이스에서 동일 주성 조합이 나옴. (만세력/공식 재검토 필요)');
} else {
  console.log('일부 케이스 오류. ziwei 라이브러리 또는 인자 확인 필요.');
}
