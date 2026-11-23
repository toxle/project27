import React, { useEffect, useState } from 'react';
import { HeartPulse, Play, Square, RotateCcw } from 'lucide-react';
import { RECOVERY_MILESTONES } from '../data/smokingData';

interface RecoverySimulatorProps {
  totalSmoked: number;
  selectedMilestoneIndex: number | null;
  onSelectMilestone: (index: number | null) => void;
}

export const RecoverySimulator: React.FC<RecoverySimulatorProps> = ({
  totalSmoked,
  selectedMilestoneIndex,
  onSelectMilestone,
}) => {
  const isRecoveryActive = selectedMilestoneIndex !== null;
  const activeIndex = selectedMilestoneIndex ?? 0;
  const activeMilestone = RECOVERY_MILESTONES[activeIndex];

  // 60-second craving resistance breathing guide
  const [cravingActive, setCravingActive] = useState(false);
  const [cravingSeconds, setCravingSeconds] = useState(60);

  useEffect(() => {
    if (!cravingActive) return;
    const timer = window.setInterval(() => {
      setCravingSeconds((prev) => {
        if (prev <= 1) {
          setCravingActive(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cravingActive]);

  // 4s inhale -> 4s hold -> 6s exhale (14s cycle)
  const cycleSec = (60 - cravingSeconds) % 14;
  const breathCue =
    cycleSec < 4
      ? '코로 깊게 들이마시기 (4초)'
      : cycleSec < 8
      ? '폐포에 맑은 공기 머금기 (4초)'
      : '입으로 천천히 내쉬기 (6초)';

  return (
    <section
      id="recovery"
      className="bg-[#0C121D] border border-slate-800/90 rounded-xl p-6 flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-medium text-emerald-400">
            금연 회복 역전 시뮬레이터
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white tracking-tight text-balance">
            지금 담배를 멈추면 투명 폐가 다시 맑아지는 과정
          </h2>
          <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
            경각심에서 끝나지 않도록 금연 경과 시간별 신체 회복을 미리 확인하세요. 단계 버튼을 누르면 위쪽 인체 뷰의 폐가 실시간으로 회복됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRecoveryActive ? (
            <button
              type="button"
              onClick={() => onSelectMilestone(null)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>현재 흡연 상태로 돌아가기</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectMilestone(3)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>금연 회복 미리보기 켜기</span>
            </button>
          )}
        </div>
      </div>

      {/* Milestone selector buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {RECOVERY_MILESTONES.map((milestone, idx) => {
          const active = isRecoveryActive && activeIndex === idx;
          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => onSelectMilestone(idx)}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-emerald-500/15 border-emerald-400/60 text-white'
                  : 'bg-[#070B13] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-mono-tabular font-semibold text-emerald-400">
                {milestone.timeLabel}
              </div>
              <div className="mt-1 text-xs text-slate-300 line-clamp-2 leading-snug">
                {milestone.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Details + Craving Defense Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Physiological description (2 cols) */}
        <div className="lg:col-span-2 bg-[#070B13] border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono-tabular text-emerald-400">
                {activeMilestone.timeLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>시각 정화율 {Math.round(activeMilestone.recoveryFactor * 100)}%</span>
              {totalSmoked === 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500">담배를 1개비 이상 태운 뒤 비교하면 변화가 뚜렷합니다</span>
                </>
              )}
            </div>
            <h3 className="mt-1.5 text-base font-semibold text-slate-100">
              {activeMilestone.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {activeMilestone.physiologicalChange}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono-tabular">
            시각 변화: {activeMilestone.visualEffectNote}
          </div>
        </div>

        {/* Craving defense breathing widget (1 col) */}
        <div className="bg-[#070B13] border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-sky-400">
              흡연 충동 방어 페이스메이커
            </div>
            <h3 className="mt-1 text-base font-semibold text-slate-100">
              지금 1개비만 참아보기
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              흡연 욕구는 보통 3분 이내에 정점을 지나 가라앉습니다. 60초만 깊은 복식 호흡으로 넘기면 225원과 폐포를 지킵니다.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              <div className="text-2xl font-mono-tabular font-semibold text-white">
                {cravingSeconds}s
              </div>
              <div className="text-xs text-sky-300 min-h-[18px]">
                {cravingActive ? breathCue : '준비됨'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (cravingActive) {
                  setCravingActive(false);
                  setCravingSeconds(60);
                } else {
                  setCravingSeconds(60);
                  setCravingActive(true);
                }
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                cravingActive
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
              }`}
            >
              {cravingActive ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>중단</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>60초 호흡 시작</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
