import React from 'react';
import { Flame, RotateCcw, Snowflake, PackagePlus, Wind, Hand, Scissors } from 'lucide-react';
import { CIGARETTE_CATALOG, PUFFS_PER_CIGARETTE } from '../data/smokingData';
import {
  BrandPackState,
  CigaretteBrandId,
  CigaretteSpec,
  PackBrandMode,
  PackSlot,
  SmokingRitualStage,
  TenurePresetId,
} from '../types/smoking';

interface CigarettePackProps {
  activeBrand: CigaretteSpec;
  packsByBrand: Record<CigaretteBrandId, BrandPackState>;
  onSelectBrand: (brandId: CigaretteBrandId) => void;
  packSlots: PackSlot[];
  isCellophaneWrapped: boolean;
  isPeelingCellophane: boolean;
  onTearCellophane: () => void;
  activeSlotIndex: number | null;
  activeSlotHasCapsule: boolean;
  capsulePoppedThisStick: boolean;
  currentPackNumber: number;
  totalSmoked: number;
  ritualStage: SmokingRitualStage;
  burnFraction: number;
  smolderSecondsLeft: number; // 10..1 countdown
  onExtractStick: (slotIndex?: number) => void;
  onPopCapsule: () => void;
  onLightStick: () => void;
  onTakePuff: () => void;
  onFinishStick: () => void;
  onPutOutStick: () => void;
  onReturnStickToPack: () => void;
  onUndoOne: () => void;
  onOpenNewPack: () => void;
  onResetAll: () => void;
  brandMode: PackBrandMode;
  onToggleBrandMode: () => void;
  activeTenureId: TenurePresetId;
  onReturnToLive: () => void;
}

export const CigarettePack: React.FC<CigarettePackProps> = ({
  activeBrand,
  packsByBrand,
  onSelectBrand,
  packSlots,
  isCellophaneWrapped,
  isPeelingCellophane,
  onTearCellophane,
  activeSlotIndex,
  activeSlotHasCapsule,
  capsulePoppedThisStick,
  currentPackNumber,
  totalSmoked,
  ritualStage,
  burnFraction,
  smolderSecondsLeft,
  onExtractStick,
  onPopCapsule,
  onLightStick,
  onTakePuff,
  onFinishStick,
  onPutOutStick,
  onReturnStickToPack,
  onUndoOne,
  onOpenNewPack,
  onResetAll,
  brandMode,
  onToggleBrandMode,
  activeTenureId,
  onReturnToLive,
}) => {
  const isLiveMode = activeTenureId === 'live';

  const backRowSlots = packSlots.slice(0, 10);
  const frontRowSlots = packSlots.slice(10, 20);

  const presentCount = packSlots.filter((s) => s.isPresent).length;
  const remainingCountExcludingActive =
    presentCount - (ritualStage !== 'in_pack' && isLiveMode && activeSlotIndex !== null ? 1 : 0);
  const brokenCapsuleInPackCount = activeBrand.hasCapsuleFeature
    ? packSlots.filter((s) => s.isPresent && !s.hasCapsule).length
    : 0;

  const isLit = ritualStage === 'lit' || ritualStage === 'puffing';
  const isPuffing = ritualStage === 'puffing';
  const remainingLengthPct = Math.max(0, Math.round((1 - burnFraction) * 100));
  const completedPuffsApprox = Math.min(
    PUFFS_PER_CIGARETTE,
    Math.floor(burnFraction * PUFFS_PER_CIGARETTE + 0.001)
  );

  const displayName =
    brandMode === 'real' ? activeBrand.brandName : activeBrand.homageName;

  const isCorkFilter = activeBrand.id === 'marlboro-red';

  const renderSlotButton = (slot: PackSlot, heightClass: string) => {
    const isExtractedSlot =
      ritualStage !== 'in_pack' && isLiveMode && activeSlotIndex === slot.index;
    const present = slot.isPresent && !isExtractedSlot;
    const canPick =
      present &&
      ritualStage === 'in_pack' &&
      isLiveMode &&
      !isCellophaneWrapped;

    return (
      <button
        key={`slot-${slot.index}`}
        type="button"
        disabled={!canPick}
        onClick={() => onExtractStick(slot.index)}
        aria-label={
          present
            ? `${slot.index + 1}번 담배 꺼내기`
            : `${slot.index + 1}번 빈 자리`
        }
        title={
          present
            ? activeBrand.hasCapsuleFeature
              ? `#${slot.index + 1}번 개비 (${slot.hasCapsule ? '캡슐 있음' : '캡슐 없음 · 다시 넣은 담배'})`
              : `#${slot.index + 1}번 개비`
            : undefined
        }
        className={`${heightClass} rounded-t-[2px] transition-all flex flex-col items-center pt-1.5 relative ${
          present
            ? canPick
              ? `hover:-translate-y-1.5 cursor-pointer border shadow-sm ${
                  isCorkFilter
                    ? 'bg-gradient-to-b from-amber-600/90 via-amber-500/80 to-amber-200 border-amber-400/70 hover:shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : slot.hasCapsule || !activeBrand.hasCapsuleFeature
                    ? 'bg-gradient-to-b from-white to-slate-200 border-slate-200 hover:shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                    : 'bg-gradient-to-b from-white to-slate-200 border-amber-300/80 hover:shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                }`
              : isCorkFilter
              ? 'bg-gradient-to-b from-amber-600/80 to-amber-200/80 border border-amber-400/50 opacity-75'
              : 'bg-gradient-to-b from-white to-slate-200 border border-slate-200 opacity-75'
            : isExtractedSlot
            ? 'bg-sky-950/50 border border-dashed border-sky-400/70'
            : 'bg-slate-950/80 border border-slate-800/40 opacity-25 cursor-default'
        }`}
      >
        {present && (
          <>
            {activeBrand.hasCapsuleFeature ? (
              slot.hasCapsule ? (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: activeBrand.capsuleColorHex }}
                />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full border border-slate-500 bg-transparent" />
              )
            ) : (
              <span className="w-1 h-1 rounded-full bg-black/15" />
            )}
            <span className="mt-1 w-full h-[1px] bg-slate-400/50" />
          </>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col justify-between h-full bg-[#0C121D] border border-slate-800/90 rounded-xl p-5 gap-4">
      {/* Brand Catalog Selector (4 types across 1mg ~ 8mg) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">
            담배 종류 선택 (타르 · 니코틴별 폐 반응 비교)
          </span>
          <button
            type="button"
            onClick={onToggleBrandMode}
            className="px-2 py-1 text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {brandMode === 'real' ? '오마주 표기' : '실제 표기'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {CIGARETTE_CATALOG.map((brand) => {
            const isSelected = brand.id === activeBrand.id;
            const label = brandMode === 'real' ? brand.shortName : brand.homageName;
            const brandPack = packsByBrand[brand.id];
            const brandRemaining = brandPack ? brandPack.slots.filter((s) => s.isPresent).length : 20;
            const brandWrapped = brandPack ? brandPack.isCellophaneWrapped : true;
            return (
              <button
                key={brand.id}
                type="button"
                disabled={ritualStage !== 'in_pack'}
                onClick={() => onSelectBrand(brand.id)}
                className={`px-2.5 py-2 rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400/70 text-white'
                    : 'bg-[#070B13] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-100 truncate">
                    {label}
                  </span>
                  <span className="text-[10px] font-mono-tabular text-sky-300/90 shrink-0">
                    {brandWrapped ? '미개봉' : `${brandRemaining}/20`}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] font-mono-tabular text-slate-400 flex items-center justify-between gap-1">
                  <span>타르 {brand.tarMg.toFixed(1)}mg</span>
                  <span>니코틴 {brand.nicotineMg.toFixed(2)}mg</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Brand Header */}
      <div className="flex items-start justify-between gap-3 border-t border-slate-800/80 pt-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{isLiveMode ? `${currentPackNumber}번째 담배갑` : '장기 누적 미리보기 중'}</span>
            <span aria-hidden="true">·</span>
            <span>{activeBrand.format}</span>
          </div>
          <h2 className="mt-0.5 text-base font-semibold text-slate-100 tracking-tight">
            {displayName}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">{activeBrand.description}</p>
        </div>
      </div>

      {/* Tactile Smoking Chamber */}
      <div className="relative bg-[#070B13] border border-slate-800/80 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            {isCellophaneWrapped
              ? '새 담배갑 겉 비닐을 먼저 뜯어주세요'
              : ritualStage === 'in_pack'
              ? '1단계 · 담배갑에서 피울 개비 선택'
              : ritualStage === 'extracted'
              ? `2단계 · #${(activeSlotIndex ?? 0) + 1}번 개비 (불 붙이기 전)`
              : ritualStage === 'lit'
              ? `3단계 · #${(activeSlotIndex ?? 0) + 1}번 연소 중 (남은 길이 ${remainingLengthPct}%)`
              : `흡입 중 · 폐로 연기 유입 (${remainingLengthPct}% 남음)`}
          </span>
          <span className="font-mono-tabular text-sky-400">
            {isCellophaneWrapped
              ? '미개봉'
              : ritualStage === 'in_pack'
              ? '대기'
              : ritualStage === 'extracted'
              ? '미점화'
              : isPuffing
              ? '들이마시는 중'
              : `${smolderSecondsLeft}s 후 자연연소`}
          </span>
        </div>

        {/* Cigarette & Lighter Stage */}
        <div className="relative flex items-center h-14 px-2 bg-[#05080F] border border-slate-800/70 rounded-md overflow-hidden">
          {ritualStage === 'in_pack' ? (
            <div className="w-full text-center text-xs text-slate-500">
              {isCellophaneWrapped
                ? '아래 담배갑의 [겉 비닐 뜯기] 테이프를 눌러 개봉하세요'
                : brokenCapsuleInPackCount > 0
                ? '캡슐 없는 개비(빈 원)가 있습니다 — 아래 담배갑에서 직접 골라 꺼내세요'
                : '아래 담배갑에서 원하는 개비를 클릭해 꺼내세요'}
            </div>
          ) : (
            <div className="w-full flex items-center">
              {/* Filter (optional capsule pop BOTH before lighting and mid-smoke!) */}
              <button
                type="button"
                onClick={onPopCapsule}
                disabled={
                  !activeBrand.hasCapsuleFeature ||
                  !activeSlotHasCapsule ||
                  capsulePoppedThisStick ||
                  isPuffing
                }
                className={`relative ${
                  activeBrand.formatType === 'slim' ? 'h-3.5' : 'h-4'
                } w-14 rounded-l-sm border transition-all flex items-center justify-center shrink-0 ${
                  isCorkFilter
                    ? 'bg-gradient-to-b from-amber-600/90 to-amber-400/90 border-amber-500/70 cursor-default'
                    : !activeSlotHasCapsule
                    ? 'bg-slate-300 border-slate-500 opacity-75 cursor-not-allowed'
                    : capsulePoppedThisStick
                    ? 'bg-slate-100 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)] cursor-default'
                    : 'bg-slate-200 border-slate-400 hover:border-sky-300 cursor-pointer'
                }`}
                title={
                  !activeBrand.hasCapsuleFeature
                    ? '캡슐이 없는 일반 궐련입니다'
                    : !activeSlotHasCapsule
                    ? '이 개비는 캡슐이 이미 깨져 소진된 상태입니다'
                    : capsulePoppedThisStick
                    ? '캡슐이 이미 깨졌습니다'
                    : '클릭해 캡슐 깨기 (피우다가 중간에 깨도 됩니다)'
                }
              >
                <span className="absolute right-0 top-0 bottom-0 w-1 bg-slate-400/70" />
                {activeBrand.hasCapsuleFeature ? (
                  activeSlotHasCapsule ? (
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                        capsulePoppedThisStick ? 'scale-110 ring-2 ring-white/60' : 'scale-95 opacity-85'
                      }`}
                      style={{ backgroundColor: activeBrand.capsuleColorHex }}
                    />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-500/80 bg-transparent" />
                  )
                ) : null}
              </button>

              {/* Tobacco rod shortening by exact burnFraction */}
              <div className="relative flex-1 h-6 flex items-center">
                <div
                  className={`${
                    activeBrand.formatType === 'slim' ? 'h-3' : 'h-3.5'
                  } bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-y border-slate-400/50 transition-all duration-300`}
                  style={{
                    width: `${Math.max(0, (1 - burnFraction) * 76)}%`,
                  }}
                />
                <div
                  className={`${
                    activeBrand.formatType === 'slim' ? 'h-3' : 'h-3.5'
                  } transition-all duration-200 rounded-r-sm shrink-0 ${
                    isPuffing
                      ? 'w-3.5 bg-gradient-to-r from-slate-600 via-orange-500 to-amber-300 shadow-[0_0_18px_rgba(249,115,22,0.95)]'
                      : isLit
                      ? 'w-2.5 bg-gradient-to-r from-slate-600 via-red-700 to-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.7)]'
                      : 'w-1 bg-amber-900/50'
                  }`}
                />

                {ritualStage === 'extracted' && (
                  <button
                    type="button"
                    onClick={onLightStick}
                    aria-label="라이터로 담배에 불 붙이기"
                    className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>불 붙이기</span>
                  </button>
                )}

                {isLit && (
                  <div className="ml-2 flex items-center gap-1 pointer-events-none">
                    <span
                      className={`inline-block w-2 h-2 rounded-full blur-[2px] transition-opacity duration-200 ${
                        isPuffing ? 'bg-orange-400/70 opacity-100' : 'bg-slate-400/40 opacity-70'
                      }`}
                    />
                    <span className="text-[11px] font-mono-tabular text-slate-400">
                      {remainingLengthPct}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Optional Capsule Control (Can pop BEFORE lighting OR MID-SMOKE!) */}
        <div className="mt-2.5 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/70">
          {ritualStage === 'in_pack' ? (
            <span className="text-xs text-slate-400">
              {activeBrand.hasCapsuleFeature
                ? '캡슐은 깨지 않고 피우다가 중간에 깰 수도 있습니다'
                : '캡슐이 없는 일반 연초형 담배입니다'}
            </span>
          ) : !activeBrand.hasCapsuleFeature ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-900/80 text-slate-400 border border-slate-800">
              <span>캡슐 미탑재 (고유 타르 {activeBrand.tarMg.toFixed(1)}mg 연소)</span>
            </div>
          ) : !activeSlotHasCapsule ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-900/80 text-slate-400 border border-slate-800">
              <Snowflake className="w-3.5 h-3.5 text-slate-500" />
              <span>캡슐 없음 (이미 깨진 개비 · 일반 연소)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onPopCapsule}
              disabled={capsulePoppedThisStick || isPuffing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                capsulePoppedThisStick
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 cursor-default'
                  : 'bg-slate-900 text-slate-200 border border-slate-700 hover:border-sky-400 cursor-pointer'
              }`}
            >
              <Snowflake
                className="w-3.5 h-3.5"
                style={{ color: activeBrand.capsuleColorHex }}
              />
              <span>
                {capsulePoppedThisStick
                  ? `${activeBrand.capsuleName} 깨짐 (적용 중)`
                  : `${activeBrand.capsuleName} 깨기 (선택)`}
              </span>
            </button>
          )}

          {/* 5-puff meter */}
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: PUFFS_PER_CIGARETTE }, (_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < completedPuffsApprox
                    ? 'bg-amber-400'
                    : isLit
                    ? 'bg-slate-700'
                    : 'bg-slate-800/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Open/Sealed Cigarette Pack Visual */}
      <div className="relative flex flex-col items-center justify-center py-1">
        {brokenCapsuleInPackCount > 0 && isLiveMode && !isCellophaneWrapped && (
          <div className="mb-2 w-full px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 text-center">
            캡슐이 없는 개비 {brokenCapsuleInPackCount}개 포함 — 담배갑에서 직접 골라 피우세요
          </div>
        )}

        <div className="relative w-full max-w-[220px]">
          {/* Sealed Closed Lid vs Open Lid + Foil Sticks */}
          {isCellophaneWrapped ? (
            <div className="mx-auto w-[196px] h-[64px] rounded-t-lg border border-slate-600/80 border-b-0 bg-[#0A142D] relative overflow-hidden flex items-center justify-center">
              {activeBrand.id === 'marlboro-red' && (
                <div className="absolute inset-0 bg-gradient-to-b from-red-700 to-red-800" />
              )}
              {activeBrand.id === 'mevius-skyblue' && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#0E3A6B] to-[#0B2A4E]" />
              )}
              {activeBrand.id === 'raison-french' && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A1626] to-[#120F1B]" />
              )}
              <span className="relative z-10 text-[10px] font-mono-tabular tracking-widest text-white/80">
                SEALED PACK · 20 STICKS
              </span>
            </div>
          ) : (
            <>
              {/* Flip-top open lid */}
              <div className="mx-auto w-[184px] h-9 bg-gradient-to-b from-[#0C1933] to-[#081226] border border-slate-700/80 border-b-0 rounded-t-lg flex items-center justify-between px-3 shadow-inner">
                <span className="text-[10px] font-mono-tabular tracking-wider text-slate-400">
                  {activeBrand.formatType === 'slim' ? 'SUPER SLIM' : 'HARD PACK'}
                </span>
                <span className="text-[10px] font-mono-tabular text-sky-300/90">
                  {activeBrand.tarMg.toFixed(1)}mg · {activeBrand.nicotineMg.toFixed(2)}mg
                </span>
              </div>

              {/* Open inner foil chamber containing 20 selectable sticks */}
              <div className="mx-auto w-[196px] bg-[#060B16] border-x border-slate-700/80 px-2.5 pt-2.5 pb-1 relative">
                <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-600/40 rounded-t-sm px-2 pt-2 pb-1">
                  <div className="grid grid-cols-10 gap-1 mb-0.5">
                    {backRowSlots.map((slot) => renderSlotButton(slot, 'h-8'))}
                  </div>
                  <div className="grid grid-cols-10 gap-1 translate-x-0.5">
                    {frontRowSlots.map((slot) => renderSlotButton(slot, 'h-9'))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Brand-Themed Lower Pack Body */}
          <div
            className={`mx-auto w-[196px] ${
              isCellophaneWrapped ? 'h-[214px]' : 'h-[178px]'
            } rounded-b-lg border border-slate-700/90 border-t-slate-500/40 relative overflow-hidden flex flex-col justify-between p-4 shadow-xl transition-all ${
              activeBrand.id === 'esse-himalaya'
                ? 'bg-gradient-to-b from-[#0A1633] via-[#071026] to-[#040814]'
                : activeBrand.id === 'raison-french'
                ? 'bg-gradient-to-b from-[#171324] via-[#100D18] to-[#08060D]'
                : activeBrand.id === 'mevius-skyblue'
                ? 'bg-gradient-to-b from-[#113C6E] via-[#1D5B9E] to-[#E2E8F0]'
                : 'bg-gradient-to-b from-[#B91C1C] via-[#991B1B] to-[#F8FAFC]'
            }`}
          >
            {/* Brand-specific vector artwork */}
            {activeBrand.id === 'esse-himalaya' && (
              <svg
                viewBox="0 0 180 140"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="mountainSnow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.85" />
                    <stop offset="55%" stopColor="#64748B" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#09132B" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="mountainIce" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="24" r="1" fill="#BAE6FD" opacity="0.7" />
                <circle cx="142" cy="30" r="1.1" fill="#BAE6FD" opacity="0.8" />
                <path d="M138 18 A10 10 0 1 0 148 30 A8 8 0 1 1 138 18 Z" fill="#E0F2FE" opacity="0.85" />
                <polygon points="0,128 38,76 74,128" fill="url(#mountainIce)" />
                <polygon points="44,128 96,52 146,128" fill="url(#mountainSnow)" />
                <polygon points="108,128 148,70 180,128" fill="url(#mountainIce)" />
              </svg>
            )}

            {activeBrand.id === 'raison-french' && (
              <svg
                viewBox="0 0 180 140"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                aria-hidden="true"
              >
                <circle cx="90" cy="70" r="46" fill="none" stroke="#A855F7" strokeOpacity="0.35" strokeWidth="1.5" />
                <circle cx="90" cy="70" r="32" fill="#7E22CE" fillOpacity="0.14" />
                <path d="M72 82 Q90 48 108 82" fill="none" stroke="#C084FC" strokeOpacity="0.5" strokeWidth="1.5" />
              </svg>
            )}

            {activeBrand.id === 'mevius-skyblue' && (
              <svg
                viewBox="0 0 180 140"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                <path d="M0,45 Q90,24 180,55 L180,140 L0,140 Z" fill="#F1F5F9" />
                <path d="M0,44 Q90,22 180,54" fill="none" stroke="#38BDF8" strokeWidth="3.5" />
                <path d="M0,51 Q90,30 180,62" fill="none" stroke="#94A3B8" strokeWidth="1.5" opacity="0.6" />
              </svg>
            )}

            {activeBrand.id === 'marlboro-red' && (
              <svg
                viewBox="0 0 180 140"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden="true"
              >
                <polygon points="0,58 90,14 180,58 180,140 0,140" fill="#F8FAFC" />
                <polygon points="0,0 180,0 180,52 90,10 0,52" fill="#B91C1C" />
              </svg>
            )}

            {/* Brand Title on Pack */}
            <div className="relative z-10 text-center mt-2">
              <div
                className={`text-base font-bold tracking-[0.14em] ${
                  activeBrand.id === 'marlboro-red' || activeBrand.id === 'mevius-skyblue'
                    ? 'text-slate-900 mt-7'
                    : 'text-slate-100'
                }`}
              >
                {brandMode === 'real' ? activeBrand.shortName.toUpperCase() : activeBrand.homageName.toUpperCase()}
              </div>
              <div
                className={`text-[10px] font-mono-tabular tracking-[0.12em] mt-0.5 ${
                  activeBrand.id === 'marlboro-red'
                    ? 'text-red-700 font-semibold'
                    : activeBrand.id === 'mevius-skyblue'
                    ? 'text-sky-700 font-semibold'
                    : 'text-sky-300/90'
                }`}
              >
                TAR {activeBrand.tarMg.toFixed(1)}mg · NIC {activeBrand.nicotineMg.toFixed(2)}mg
              </div>
            </div>

            {/* Remaining count inside pack */}
            <div className="relative z-10 flex flex-col items-center gap-0.5 pt-2 border-t border-slate-700/50 bg-[#040814]/85 -mx-4 -mb-4 px-4 py-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono-tabular text-white">
                  {remainingCountExcludingActive}
                </span>
                <span className="text-xs font-mono-tabular text-slate-400">
                  / {activeBrand.sticksPerPack} 개비 남음
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isCellophaneWrapped
                  ? '겉 비닐을 뜯으면 개비를 꺼낼 수 있습니다'
                  : isLiveMode
                  ? remainingCountExcludingActive > 0
                    ? '위 20개비 중 원하는 담배를 직접 고르세요'
                    : '한 갑을 모두 소진했습니다'
                  : '직접 피우기 모드로 전환 시 선택 가능'}
              </span>
            </div>
          </div>

          {/* GLOSSY OUTER CELLOPHANE WRAP & TEAR-STRIP OVERLAY */}
          {isCellophaneWrapped && (
            <button
              type="button"
              onClick={onTearCellophane}
              aria-label="새 담배갑 겉 비닐 뜯기"
              className={`absolute inset-0 z-20 mx-auto w-[200px] rounded-lg border border-white/30 bg-gradient-to-tr from-white/[0.04] via-white/[0.14] to-sky-100/[0.08] shadow-[inset_0_0_18px_rgba(255,255,255,0.12)] cursor-pointer transition-all duration-300 flex flex-col justify-start group ${
                isPeelingCellophane
                  ? '-translate-y-6 opacity-0 scale-105'
                  : 'opacity-100 hover:border-sky-300/70'
              }`}
            >
              {/* Glossy cellophane diagonal highlight */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none" />

              {/* Horizontal Tear-Strip Tape across upper third */}
              <div className="mt-[54px] w-full h-5 bg-gradient-to-r from-amber-300/35 via-sky-200/50 to-amber-300/60 border-y border-white/40 flex items-center justify-between px-2.5 backdrop-blur-[1px] group-hover:from-amber-300/55 group-hover:to-amber-300/80 transition-colors">
                <span className="text-[10px] font-mono-tabular font-semibold tracking-wider text-white drop-shadow">
                  비닐 뜯기
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-white drop-shadow">
                  <Scissors className="w-3 h-3" />
                  <span>TEAR ▸</span>
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex flex-col gap-2.5">
        {!isLiveMode ? (
          <button
            type="button"
            onClick={onReturnToLive}
            className="w-full py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Hand className="w-4 h-4" />
            <span>직접 꺼내서 피우기 모드로 돌아가기</span>
          </button>
        ) : isCellophaneWrapped ? (
          <button
            type="button"
            onClick={onTearCellophane}
            className="w-full py-3 px-4 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scissors className="w-4 h-4" />
            <span>겉 비닐 뜯고 새 담배갑 열기</span>
          </button>
        ) : ritualStage === 'in_pack' ? (
          presentCount > 0 ? (
            <button
              type="button"
              onClick={() => onExtractStick()}
              className="w-full py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Hand className="w-4 h-4" />
              <span>담배 1개비 꺼내기 ({presentCount}개비 남음)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenNewPack}
              className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>새 담배갑 사서 비닐 뜯기 ({currentPackNumber + 1}갑째)</span>
            </button>
          )
        ) : ritualStage === 'extracted' ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onLightStick}
              className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>
                {activeBrand.hasCapsuleFeature && activeSlotHasCapsule && capsulePoppedThisStick
                  ? '캡슐 깬 상태로 불 붙이기'
                  : activeBrand.hasCapsuleFeature && !activeSlotHasCapsule
                  ? '캡슐 없는 상태로 불 붙이기'
                  : '라이터로 불 붙이기'}
              </span>
            </button>
            <button
              type="button"
              onClick={onReturnStickToPack}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              {capsulePoppedThisStick
                ? '담배갑에 다시 넣기 (캡슐 없는 상태로 보관)'
                : '담배갑에 다시 넣기 (피우지 않기)'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onTakePuff}
              disabled={isPuffing}
              className="w-full py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/60 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wind className="w-4 h-4" />
              <span>
                {isPuffing
                  ? '연기를 폐 깊숙이 들이마시는 중...'
                  : `한 모금 들이마시기 (남은 길이 ${remainingLengthPct}%)`}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onFinishStick}
                disabled={isPuffing}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                끝까지 다 피우기
              </button>
              <button
                type="button"
                onClick={onPutOutStick}
                disabled={isPuffing}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-emerald-500/30 text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
              >
                중간에 비벼 끄기
              </button>
            </div>
          </div>
        )}

        {/* Undo & Reset */}
        {isLiveMode && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onUndoOne}
              disabled={totalSmoked === 0 || ritualStage !== 'in_pack'}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>1개비 되돌리기</span>
            </button>
            <button
              type="button"
              onClick={onResetAll}
              disabled={
                (totalSmoked === 0 && brokenCapsuleInPackCount === 0 && isCellophaneWrapped) ||
                ritualStage !== 'in_pack'
              }
              className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-medium text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              새 담배갑(비닐) 리셋
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
