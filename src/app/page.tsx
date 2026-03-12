'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import type { AnalyzeInput, AnalyzeResponse } from '@/lib/types';

function clamp2(n: number) {
  return String(n).padStart(2, '0');
}

function defaultInput(): AnalyzeInput {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = clamp2(now.getMonth() + 1);
  const dd = clamp2(now.getDate());
  return {
    name: '',
    birthDate: `${yyyy}-${mm}-${dd}`,
    birthTime: '10:00',
    gender: 'f',
  };
}

export default function Page() {
  const [input, setInput] = useState<AnalyzeInput>(() => defaultInput());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<AnalyzeResponse, { ok: true }> | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(input.name.trim() && /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) && /^\d{2}:\d{2}$/.test(input.birthTime));
  }, [input]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as AnalyzeResponse;
      if (!data.ok) throw new Error(data.message);
      console.log('[Star-Log] analyze response', data);
      console.log('[Star-Log] lifeMainStars', data.ok ? data.ziwei.lifeMainStars : null);
      setResult(data);
    } catch (err: any) {
      setError(err?.message ? String(err.message) : '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 text-[#FFFFFF] sm:px-8 sm:py-16">
      <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/60 bg-black/20 px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-[#D4AF37] shadow-sm backdrop-blur">
          <Sparkles size={16} strokeWidth={1.1} className="text-[#D4AF37]" />
          <span className="uppercase">Wisdom of Stars, Data of Fate</span>
        </div>

        <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-[#FFFFFF] sm:text-6xl">
          Star-Log
        </h1>
        <p className="mt-4 text-balance text-[15px] font-normal leading-7 text-[#FFFFF0] sm:text-[16px]">
          데이터로 읽는 당신의 인생 지도
        </p>
      </header>

      <section className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="card-quiet rounded-2xl p-6">
            <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">입력 정보</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#FFFFF0]/90">
              사주(일간)와 자미두수(명궁 주성)를 결합해 “본질”과 “페르소나”를 함께 보여드립니다.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#FFFFFF]">이름</label>
                <input
                  value={input.name}
                  onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))}
                  className="ring-gold-soft input-glass w-full rounded-xl px-4 py-3 text-[14px] font-normal text-[#FFFFFF] placeholder:text-[#FFFFF0]/65"
                  placeholder="성함을 입력해 주세요"
                  autoComplete="name"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#FFFFFF]">생년월일</label>
                  <input
                    type="date"
                    value={input.birthDate}
                    onChange={(e) => setInput((p) => ({ ...p, birthDate: e.target.value }))}
                    className="ring-gold-soft input-glass w-full rounded-xl px-4 py-3 text-[14px] text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#FFFFFF]">태어난 시간</label>
                  <input
                    type="time"
                    value={input.birthTime}
                    onChange={(e) => setInput((p) => ({ ...p, birthTime: e.target.value }))}
                    className="ring-gold-soft input-glass w-full rounded-xl px-4 py-3 text-[14px] text-[#FFFFFF]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#FFFFFF]">성별</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, gender: 'f' }))}
                    className={[
                      'rounded-xl border px-4 py-3 text-[13px] font-medium transition',
                      input.gender === 'f'
                        ? 'border-[#D4AF37]/60 bg-black/25 text-[#FFFFFF] shadow-sm'
                        : 'border-white/25 bg-black/20 text-[#FFFFF0] hover:bg-black/30',
                    ].join(' ')}
                  >
                    여성
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, gender: 'm' }))}
                    className={[
                      'rounded-xl border px-4 py-3 text-[13px] font-medium transition',
                      input.gender === 'm'
                        ? 'border-[#D4AF37]/60 bg-black/25 text-[#FFFFFF] shadow-sm'
                        : 'border-white/25 bg-black/20 text-[#FFFFF0] hover:bg-black/30',
                    ].join(' ')}
                  >
                    남성
                  </button>
                </div>
              </div>

              <button
                disabled={!canSubmit || loading}
                type="submit"
                className={[
                  'mt-2 w-full rounded-xl px-4 py-3 text-[14px] font-semibold tracking-[-0.02em] transition',
                  !canSubmit || loading
                    ? 'cursor-not-allowed bg-white/5 text-[#C0C0C0]/70'
                    : 'bg-[#D4AF37] text-[#050915] hover:bg-[#e1c86d]',
                ].join(' ')}
              >
                {loading ? '분석 중…' : '분석하기'}
              </button>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-50/60 px-4 py-3 text-[13px] text-red-900">
                  {error}
                </div>
              ) : null}
            </form>
          </div>

        </div>

        <div className="lg:col-span-7">
          <div className="card-quiet rounded-2xl p-6">
            <div>
              <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">결과</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#FFFFF0]/90">
                “나의 본질(사주)”과 “사회적 페르소나(자미두수)”를 분리된 섹션으로 보여드립니다.
              </p>
            </div>

            {!result ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/25 p-8 text-center backdrop-blur">
                <div className="text-[13px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">아직 결과가 없어요</div>
                <div className="mt-2 text-[12px] leading-6 text-[#FFFFF0]/90">
                  왼쪽 입력 폼을 채우고 “분석하기”를 눌러주세요.
                </div>
              </div>
            ) : (
              <div className="mt-6 animate-[slideUpFade_600ms_ease-out_both]">
                <div className="rounded-2xl border border-white/12 bg-black/25 p-6 shadow-lg backdrop-blur">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="sm:max-w-[70%]">
                      <h3 className="text-balance text-[22px] font-semibold tracking-[-0.03em] text-[#FFFFFF] sm:text-[24px]">
                        {result.title}
                      </h3>
                      <p className="mt-1 text-[12px] leading-6 text-[#FFFFF0]/90">{result.subtitle}</p>
                      {result.lunarInfo && (
                        <p className="mt-2 text-[11px] text-[#FFFFF0]/75">
                          음력 {result.lunarInfo.lunarYear}년 {result.lunarInfo.lunarMonth}월 {result.lunarInfo.lunarDay}일 · {result.lunarInfo.yearGanZhi} · {result.lunarInfo.shengxiao}띠
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-3">
                      <div className="text-[11px] font-medium text-[#FFFFF0]/90">일주</div>
                      <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">
                        {result.bazi.dayPillar}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-3">
                      <div className="text-[11px] font-medium text-[#FFFFF0]/90">일간</div>
                      <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">
                        {result.bazi.dayGan}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-3">
                      <div className="text-[11px] font-medium text-[#FFFFF0]/90">명궁 주성</div>
                      <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">
                        {result.mainStar ?? result.ziwei.lifeMainStars[0] ?? '-'}
                      </div>
                    </div>
                  </div>

                  {/* 사주 팔자 4기둥 (년월일시 + 납음) */}
                  {result.eightChar && (
                    <div className="mt-6 rounded-2xl border border-white/15 bg-black/24 p-5">
                      <h4 className="text-[13px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">사주 팔자 (만세력)</h4>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          { label: '년주', p: result.eightChar.year },
                          { label: '월주', p: result.eightChar.month },
                          { label: '일주', p: result.eightChar.day },
                          { label: '시주', p: result.eightChar.time },
                        ].map(({ label, p }) => (
                          <div key={label} className="rounded-xl border border-white/15 bg-black/25 py-3 text-center">
                            <div className="text-[10px] text-[#FFFFF0]/80">{label}</div>
                            <div className="mt-1 text-[14px] font-semibold text-[#FFFFFF]">{p.full}</div>
                            {p.nayin && <div className="mt-0.5 text-[10px] text-[#D4AF37]">{p.nayin}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 오행 분포 (목화토금수) */}
                  {result.elementBalance && (
                    <div className="mt-6 rounded-2xl border border-white/15 bg-black/24 p-5">
                      <h4 className="text-[13px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">오행 분포</h4>
                      <div className="mt-3 flex gap-2">
                        {[
                          { key: '木', label: '木', color: 'bg-emerald-600/90' },
                          { key: '火', label: '火', color: 'bg-amber-500/90' },
                          { key: '土', label: '土', color: 'bg-amber-800/80' },
                          { key: '金', label: '金', color: 'bg-[#D4AF37]/90' },
                          { key: '水', label: '水', color: 'bg-blue-800/90' },
                        ].map(({ key, label, color }) => {
                          const val = (result.elementBalance ?? {})[key] ?? 0;
                          const maxVal = 8;
                          const pct = Math.min(100, maxVal ? (val / maxVal) * 100 : 0);
                          return (
                            <div key={key} className="flex flex-1 flex-col items-center">
                              <div className="flex h-14 w-full flex-col justify-end overflow-hidden rounded-md bg-white/10">
                                <motion.div
                                  className={`w-full rounded-md ${color}`}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  style={{ minHeight: val ? 4 : 0 }}
                                />
                              </div>
                              <span className="mt-1.5 text-[10px] text-[#FFFFF0]/90">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 12궁 명반 (주성·보좌·살성 포함) */}
                  {result.ziWeiPalaces && result.ziWeiPalaces.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-white/15 bg-black/24 p-5">
                      <h4 className="text-[13px] font-semibold tracking-[-0.02em] text-[#FFFFFF]">12궁 명반</h4>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {result.ziWeiPalaces.map((entry) => {
                          const isMing = entry.palace === '명궁';
                          return (
                            <div
                              key={entry.palace}
                              className={`rounded-xl border p-3 ${
                                isMing ? 'border-[#D4AF37]/50 bg-black/35 ring-1 ring-[#D4AF37]/30' : 'border-white/15 bg-black/25'
                              }`}
                            >
                              <div className="text-[10px] text-[#FFFFF0]/80">{entry.palace}</div>
                              <div className="mt-1 text-[12px] font-medium text-[#FFFFFF]">{entry.star || '—'}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 주성 키워드(트레이트) */}
                  {result.traits && result.traits.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.traits.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[#D4AF37]/40 bg-black/30 px-3 py-1 text-[11px] font-medium text-[#D4AF37]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                        {result.sections.map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/15 bg-black/24 p-5">
                        <div className="text-[11px] font-semibold tracking-[-0.01em] text-[#FFFFF0]/90">
                          {s.label}
                        </div>
                        <div className="mt-2 text-[16px] font-semibold tracking-[-0.03em] text-[#FFFFFF]">
                          {s.title}
                        </div>
                        <div className="mt-1 text-[12px] leading-6 text-[#FFFFF0]/90">{s.summary}</div>
                        <ul className="mt-3 space-y-2 text-[13px] leading-6 text-[#FFFFFF]">
                          {s.bullets.map((b, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]/90" />
                              <span className="text-[#F9F9F9]">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* 총평·조언 (하단 가독 레이아웃) */}
                  {result.summaryAdvice && (
                    <div className="mt-6 rounded-2xl border border-[#D4AF37]/25 bg-black/30 p-6">
                      <h4 className="text-[13px] font-semibold tracking-[-0.02em] text-[#D4AF37]">총평 및 조언</h4>
                      <p className="mt-3 text-[15px] leading-7 text-[#FFFFF0] font-normal tracking-[-0.01em]">
                        {result.summaryAdvice}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

