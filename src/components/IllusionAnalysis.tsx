import React, { useState } from 'react';

export const IllusionAnalysis: React.FC = () => {
  const [deepPuffMode, setDeepPuffMode] = useState<'standard' | 'compensatory'>('compensatory');

  const labeledTar = 1.0;
  const actualTar = deepPuffMode === 'compensatory' ? 2.75 : 1.0;

  return (
    <section
      id="illusion"
      className="bg-[#0C121D] border border-slate-800/90 rounded-xl p-6 flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="text-xs font-medium text-sky-400">
            에쎄 히말라야 윈터 착시 분석
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white tracking-tight text-balance">
            왜 "순하고 시원한 1mg 담배"가 더 위험할 수 있을까?
          </h2>
        </div>

        {/* Interactive toggle comparing machine-measured vs compensatory smoking */}
        <div className="flex items-center gap-1 p-1 bg-[#070B13] border border-slate-800 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setDeepPuffMode('compensatory')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              deepPuffMode === 'compensatory'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            실제 흡연자(보상 흡입)
          </button>
          <button
            type="button"
            onClick={() => setDeepPuffMode('standard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              deepPuffMode === 'standard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            기계 측정(갑 표기)
          </button>
        </div>
      </div>

      {/* 3 Pillars of the Cool Illusion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1 */}
        <div className="flex flex-col justify-between gap-4 pt-1">
          <div>
            <div className="text-xs font-mono-tabular text-slate-500">01. 저타르 착시</div>
            <h3 className="mt-1 text-base font-semibold text-slate-100">
              1.0mg 표기 뒤에 숨은 보상 흡연
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              니코틴 함량이 낮은 담배를 피우면 뇌가 부족한 니코틴을 채우기 위해 무의식적으로 더 세고 깊게 빨아들이거나 필터 천공을 손가락으로 막게 됩니다.
            </p>
          </div>
          <div className="bg-[#070B13] border border-slate-800/80 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">갑 표기 타르</span>
              <span className="font-mono-tabular text-slate-200">{labeledTar.toFixed(1)} mg</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 rounded-full" style={{ width: '36%' }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300">
                {deepPuffMode === 'compensatory' ? '실제 체내 유입 추정' : '기계 측정 기준'}
              </span>
              <span className="font-mono-tabular text-amber-300 font-semibold">
                {actualTar.toFixed(2)} mg
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-200"
                style={{ width: deepPuffMode === 'compensatory' ? '100%' : '36%' }}
              />
            </div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="flex flex-col justify-between gap-4 pt-1 md:border-l md:border-slate-800/80 md:pl-6">
          <div>
            <div className="text-xs font-mono-tabular text-slate-500">02. 아이스 블루 캡슐</div>
            <h3 className="mt-1 text-base font-semibold text-slate-100">
              청량감이 가리는 기도의 경고 신호
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              캡슐을 터뜨려 발생하는 강한 멘솔 냉각감은 목과 기관지의 따가움·기침 반사를 일시적으로 마비시킵니다. 그 결과 뜨거운 독성 연기가 폐 하엽 끝까지 더 깊숙이 머무릅니다.
            </p>
          </div>
          <div className="bg-[#070B13] border border-slate-800/80 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-sky-400">위 시뮬레이터 연동:</span> 좌측 담배갑에서 파란 캡슐을 켜고 태우면 연기가 폐 상엽을 지나 횡격막 맞닿은 하엽 끝까지 침투합니다.
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="flex flex-col justify-between gap-4 pt-1 md:border-l md:border-slate-800/80 md:pl-6">
          <div>
            <div className="text-xs font-mono-tabular text-slate-500">03. 냄새 저감 기술</div>
            <h3 className="mt-1 text-base font-semibold text-slate-100">
              입냄새는 줄어도 폐포 손상은 동일
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              입에서 나는 담배 냄새가 줄어들어 주변 눈치를 덜 보게 되면 흡연 간격이 짧아지기 쉽습니다. 하지만 일산화탄소와 타르·발암물질의 폐 침착량은 줄지 않습니다.
            </p>
          </div>
          <div className="bg-[#070B13] border border-slate-800/80 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-rose-400">체감 포인트:</span> 겉으로 드러나는 냄새 대신 투명해진 폐 속에서 쌓이는 검은 타르의 속도를 직접 확인하세요.
          </div>
        </div>
      </div>
    </section>
  );
};
