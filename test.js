const { getStarLogReport } = require('./dist/lib/star-log-report.js');

// 직접 node test.js 로 실행했을 때만 콘솔 출력
if (require.main === module) {
  const Y = 1997,
    M = 12,
    D = 16,
    H = 10,
    G = 'f';

  const report = getStarLogReport({ Y, M, D, H, G });

  console.log('-------------------------------');
  console.log('🚀 Star-Log 엔진 사주 분석 결과');
  console.log(`[일주]: ${report.bazi.dayPillar}`);
  console.log("-------------------------------");
  console.log('✨ Star-Log 엔진 자미두수 분석 결과');
  console.log(`[명궁 주성]: ${report.ziwei.lifeMainStars.join(', ') || '분석 중'}`);
  console.log(`[연애 스타일]: ${report.ziwei.loveMainStars.join(', ') || '분석 중'}`);
  console.log('-------------------------------');
}