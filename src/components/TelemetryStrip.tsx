import React from 'react';
import { CigaretteSpec, LungHealthMetrics, TenurePreset } from '../types/smoking';

interface TelemetryStripProps {
  activeBrand: CigaretteSpec;
  metrics: LungHealthMetrics;
  activeTenure: TenurePreset;
}

export const TelemetryStrip: React.FC<TelemetryStripProps> = ({
  activeBrand,
  metrics,
  activeTenure,
}) => {
  const isLive = activeTenure.id === 'live';
  const monthlyProjectedKrw = isLive
    ? metrics.totalSpentKrw > 0
      ? Math.max(metrics.totalSpentKrw, metrics.totalSmoked * 225 * 30)
      : 135000
    : activeTenure.dailySticks * 225 * 30;

  return (
    <section
      id="metrics"
      aria-label="실시간 흡연 및 폐 건강 지표"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800/80 border border-slate-800/90 rounded-xl overflow-hidden"
    >
      {/* Metric 1: Smoked Sticks */}
      <div className="bg-[#0C121D] p-5 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>누적 흡연량</span>
          <span className="font-mono-tabular text-slate-500">
            {isLive ? `${metrics.currentPackNumber}갑째` : `${activeTenure.label} · 일 10개비`}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-semibold font-mono-tabular text-white">
            {metrics.totalSmoked.toLocaleString('ko-KR')}
          </span>
          <span className="text-xs font-mono-tabular text-slate-400">개비</span>
        </div>
        <div className="text-xs text-slate-400 font-mono-tabular">
          {isLive
            ? `${activeBrand.shortName} · 잔량 ${metrics.currentPackRemaining}/20`
            : `${activeBrand.shortName} · 누적 ${(metrics.totalSmoked / 20).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}갑`}
        </div>
      </div>

      {/* Metric 2: Tar & Nicotine Accumulation */}
      <div className="bg-[#0C121D] p-5 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>누적 타르 · 니코틴 부하</span>
          <span className="font-mono-tabular text-amber-400/90">
            {activeBrand.tarMg.toFixed(1)}mg / {activeBrand.nicotineMg.toFixed(2)}mg
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-semibold font-mono-tabular text-white">
            {metrics.estimatedInhaledTarMg.toLocaleString('ko-KR', {
              maximumFractionDigits: 1,
            })}
          </span>
          <span className="text-xs font-mono-tabular text-slate-400">mg 타르 추정</span>
        </div>
        <div className="text-xs text-slate-400 font-mono-tabular">
          갑 표기 타르 {metrics.labeledTarMg.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} mg · 니코틴{' '}
          {metrics.labeledNicotineMg.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} mg
        </div>
      </div>

      {/* Metric 3: Lung Elasticity & Nicotine Stress */}
      <div className="bg-[#0C121D] p-5 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>폐 탄성률 · 니코틴 자극</span>
          <span
            className={`font-mono-tabular ${
              metrics.stageTone === 'nominal'
                ? 'text-emerald-400'
                : metrics.stageTone === 'caution'
                ? 'text-amber-300'
                : 'text-rose-400'
            }`}
          >
            {metrics.stageGlyph} {metrics.stageTone === 'nominal' ? '정상' : '저하'}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-semibold font-mono-tabular text-white">
            {metrics.lungElasticityPct.toFixed(1)}
          </span>
          <span className="text-xs font-mono-tabular text-slate-400">% 탄성</span>
        </div>
        <div className="text-xs text-slate-400 font-mono-tabular">
          니코틴 혈관부하 {metrics.nicotineImpactPct.toFixed(0)}% · 호기 CO {metrics.carbonMonoxidePpm.toFixed(1)} ppm
        </div>
      </div>

      {/* Metric 4: Financial Cost */}
      <div className="bg-[#0C121D] p-5 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>누적 지출 금액</span>
          <span className="font-mono-tabular text-slate-500">갑당 4,500원</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-semibold font-mono-tabular text-white">
            {metrics.totalSpentKrw.toLocaleString('ko-KR')}
          </span>
          <span className="text-xs font-mono-tabular text-slate-400">원</span>
        </div>
        <div className="text-xs text-slate-400 font-mono-tabular">
          {metrics.totalSmoked > 0
            ? `일 10개비 기준 월 약 ${monthlyProjectedKrw.toLocaleString('ko-KR')}원`
            : '1갑 금연 시 월 135,000원 절약'}
        </div>
      </div>
    </section>
  );
};
