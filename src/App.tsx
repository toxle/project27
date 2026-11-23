import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { CigarettePack } from './components/CigarettePack';
import { IllusionAnalysis } from './components/IllusionAnalysis';
import { LungTorsoVisualizer } from './components/LungTorsoVisualizer';
import { RecoverySimulator } from './components/RecoverySimulator';
import { TelemetryStrip } from './components/TelemetryStrip';
import {
  IDLE_SMOLDER_INTERVAL_SEC,
  PUFFS_PER_CIGARETTE,
  RECOVERY_MILESTONES,
  TENURE_PRESETS,
  computeLungHealthMetrics,
  createFreshPackSlots,
  createInitialPacksByBrand,
  getCigaretteSpec,
} from './data/smokingData';
import {
  BrandPackState,
  CigaretteBrandId,
  PackBrandMode,
  SmokedStickLog,
  SmokingRitualStage,
  TenurePresetId,
} from './types/smoking';

const LOGS_STORAGE_KEY = 'clearlung_logs_v4';
const PACKS_STORAGE_KEY = 'clearlung_packs_by_brand_v4';
const BRAND_STORAGE_KEY = 'clearlung_brand_v4';

// 1 puff = 1/5 (0.20) of cigarette length; idle smoldering every 10s = 1/10 of a puff (0.02)
const PUFF_LENGTH_STEP = 1 / PUFFS_PER_CIGARETTE; // 0.20
const IDLE_SMOLDER_STEP = PUFF_LENGTH_STEP / 10; // 0.02

export default function App() {
  const [activeBrandId, setActiveBrandId] = useState<CigaretteBrandId>(() => {
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY) as CigaretteBrandId | null;
      if (saved && getCigaretteSpec(saved).id === saved) return saved;
    } catch {
      // Ignore storage read errors
    }
    return 'esse-himalaya';
  });

  const activeBrand = useMemo(() => getCigaretteSpec(activeBrandId), [activeBrandId]);

  const [logs, setLogs] = useState<SmokedStickLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  const [packsByBrand, setPacksByBrand] = useState<Record<CigaretteBrandId, BrandPackState>>(() => {
    const defaults = createInitialPacksByBrand();
    try {
      const saved = localStorage.getItem(PACKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Record<CigaretteBrandId, BrandPackState>>;
        if (parsed && typeof parsed === 'object') {
          for (const key of Object.keys(defaults) as CigaretteBrandId[]) {
            const candidate = parsed[key];
            if (candidate && Array.isArray(candidate.slots) && candidate.slots.length === 20) {
              defaults[key] = candidate;
            }
          }
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return defaults;
  });

  const [isPeelingCellophane, setIsPeelingCellophane] = useState<boolean>(false);
  const [brandMode, setBrandMode] = useState<PackBrandMode>('real');
  const [ritualStage, setRitualStage] = useState<SmokingRitualStage>('in_pack');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [capsulePoppedThisStick, setCapsulePoppedThisStick] = useState<boolean>(false);
  const [burnFraction, setBurnFraction] = useState<number>(0);
  const [smolderSecondsLeft, setSmolderSecondsLeft] = useState<number>(IDLE_SMOLDER_INTERVAL_SEC);
  const [puffNonce, setPuffNonce] = useState<number>(0);
  const [activeTenureId, setActiveTenureId] = useState<TenurePresetId>('live');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);

  const puffTimerRef = useRef<number | null>(null);
  const peelTimerRef = useRef<number | null>(null);
  const smolderSecRef = useRef<number>(IDLE_SMOLDER_INTERVAL_SEC);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // Ignore
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(PACKS_STORAGE_KEY, JSON.stringify(packsByBrand));
    } catch {
      // Ignore
    }
  }, [packsByBrand]);

  useEffect(() => {
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, activeBrandId);
    } catch {
      // Ignore
    }
  }, [activeBrandId]);

  useEffect(() => {
    return () => {
      if (puffTimerRef.current) window.clearTimeout(puffTimerRef.current);
      if (peelTimerRef.current) window.clearTimeout(peelTimerRef.current);
    };
  }, []);

  const currentPackState = packsByBrand[activeBrandId];
  const packSlots = currentPackState.slots;
  const isCellophaneWrapped = currentPackState.isCellophaneWrapped;

  const activeSlot =
    activeSlotIndex !== null ? packSlots[activeSlotIndex] ?? null : null;
  const activeSlotHasCapsule =
    activeBrand.hasCapsuleFeature && (activeSlot ? activeSlot.hasCapsule : false);
  const effectiveCapsuleForVisualizer = activeSlotHasCapsule && capsulePoppedThisStick;

  const activeTenure = useMemo(
    () => TENURE_PRESETS.find((t) => t.id === activeTenureId) ?? TENURE_PRESETS[0],
    [activeTenureId]
  );

  const activeRecoveryFactor =
    selectedMilestoneIndex !== null
      ? RECOVERY_MILESTONES[selectedMilestoneIndex]?.recoveryFactor ?? 0
      : 0;

  const presentPackCount = useMemo(
    () => packSlots.filter((s) => s.isPresent).length,
    [packSlots]
  );

  const metrics = useMemo(() => {
    const isLive = activeTenureId === 'live';
    const currentBurnFraction =
      isLive && (ritualStage === 'lit' || ritualStage === 'puffing') ? burnFraction : 0;

    return computeLungHealthMetrics(
      logs,
      activeBrand,
      isLive ? undefined : activeTenure.totalSticks,
      activeBrand.hasCapsuleFeature,
      activeRecoveryFactor,
      currentBurnFraction,
      effectiveCapsuleForVisualizer,
      isLive ? presentPackCount : undefined,
      isLive ? currentPackState.packNumber : undefined
    );
  }, [
    logs,
    activeBrand,
    activeTenureId,
    activeTenure.totalSticks,
    activeRecoveryFactor,
    ritualStage,
    burnFraction,
    effectiveCapsuleForVisualizer,
    presentPackCount,
    currentPackState.packNumber,
  ]);

  const commitStickLog = useCallback(
    (brandIdToCommit: CigaretteBrandId, slotIndex: number, capsulePopped: boolean) => {
      const spec = getCigaretteSpec(brandIdToCommit);
      const packNum = packsByBrand[brandIdToCommit].packNumber;

      setPacksByBrand((prev) => ({
        ...prev,
        [brandIdToCommit]: {
          ...prev[brandIdToCommit],
          slots: prev[brandIdToCommit].slots.map((slot) =>
            slot.index === slotIndex ? { ...slot, isPresent: false } : slot
          ),
        },
      }));

      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          brandId: spec.id,
          tarMg: spec.tarMg,
          nicotineMg: spec.nicotineMg,
          stickNumberInPack: slotIndex + 1,
          packNumber: packNum,
          capsulePopped,
          timestamp: Date.now(),
        },
      ]);
    },
    [packsByBrand]
  );

  // Pure completion check when burnFraction reaches 100%
  useEffect(() => {
    if (
      (ritualStage === 'lit' || ritualStage === 'puffing') &&
      burnFraction >= 0.999 &&
      activeSlotIndex !== null
    ) {
      commitStickLog(activeBrandId, activeSlotIndex, effectiveCapsuleForVisualizer);
      setRitualStage('in_pack');
      setActiveSlotIndex(null);
      setCapsulePoppedThisStick(false);
      setBurnFraction(0);
    }
  }, [
    burnFraction,
    ritualStage,
    activeSlotIndex,
    activeBrandId,
    commitStickLog,
    effectiveCapsuleForVisualizer,
  ]);

  // Idle smoldering timer when lit: every 10 seconds, shorten rod by 1/10 of a puff's length (0.02)
  useEffect(() => {
    if (ritualStage !== 'lit') {
      smolderSecRef.current = IDLE_SMOLDER_INTERVAL_SEC;
      setSmolderSecondsLeft(IDLE_SMOLDER_INTERVAL_SEC);
      return;
    }

    const ticker = window.setInterval(() => {
      if (smolderSecRef.current > 1) {
        smolderSecRef.current -= 1;
        setSmolderSecondsLeft(smolderSecRef.current);
      } else {
        smolderSecRef.current = IDLE_SMOLDER_INTERVAL_SEC;
        setSmolderSecondsLeft(IDLE_SMOLDER_INTERVAL_SEC);
        setBurnFraction((prevFrac) => Math.min(1, prevFrac + IDLE_SMOLDER_STEP));
      }
    }, 1000);

    return () => window.clearInterval(ticker);
  }, [ritualStage]);

  const handleTearCellophane = useCallback(() => {
    if (!isCellophaneWrapped || isPeelingCellophane) return;
    const targetBrandId = activeBrandId;
    setIsPeelingCellophane(true);
    if (peelTimerRef.current) window.clearTimeout(peelTimerRef.current);
    peelTimerRef.current = window.setTimeout(() => {
      setPacksByBrand((prev) => ({
        ...prev,
        [targetBrandId]: {
          ...prev[targetBrandId],
          isCellophaneWrapped: false,
        },
      }));
      setIsPeelingCellophane(false);
    }, 320);
  }, [isCellophaneWrapped, isPeelingCellophane, activeBrandId]);

  // Switching brands PRESERVES every brand's smoked count, cellophane unwrapped state, and broken-capsule sticks!
  const handleSelectBrand = useCallback(
    (brandId: CigaretteBrandId) => {
      if (ritualStage !== 'in_pack' || brandId === activeBrandId) return;
      setIsPeelingCellophane(false);
      setActiveBrandId(brandId);
    },
    [ritualStage, activeBrandId]
  );

  const handleExtractStick = useCallback(
    (requestedSlotIndex?: number) => {
      if (isCellophaneWrapped) return;
      if (activeTenureId !== 'live') setActiveTenureId('live');
      if (selectedMilestoneIndex !== null) setSelectedMilestoneIndex(null);
      if (ritualStage !== 'in_pack') return;

      const targetSlot =
        requestedSlotIndex !== undefined
          ? packSlots.find((s) => s.index === requestedSlotIndex && s.isPresent)
          : packSlots.find((s) => s.isPresent);

      if (!targetSlot) return;

      setActiveSlotIndex(targetSlot.index);
      setCapsulePoppedThisStick(false);
      setBurnFraction(0);
      smolderSecRef.current = IDLE_SMOLDER_INTERVAL_SEC;
      setSmolderSecondsLeft(IDLE_SMOLDER_INTERVAL_SEC);
      setRitualStage('extracted');
    },
    [isCellophaneWrapped, activeTenureId, selectedMilestoneIndex, ritualStage, packSlots]
  );

  const handlePopCapsule = useCallback(() => {
    if (!activeSlotHasCapsule || capsulePoppedThisStick) return;
    setCapsulePoppedThisStick(true);
  }, [activeSlotHasCapsule, capsulePoppedThisStick]);

  const handleReturnStickToPack = useCallback(() => {
    if (ritualStage !== 'extracted' || activeSlotIndex === null) return;

    if (capsulePoppedThisStick) {
      setPacksByBrand((prev) => ({
        ...prev,
        [activeBrandId]: {
          ...prev[activeBrandId],
          slots: prev[activeBrandId].slots.map((slot) =>
            slot.index === activeSlotIndex ? { ...slot, hasCapsule: false } : slot
          ),
        },
      }));
    }

    setRitualStage('in_pack');
    setActiveSlotIndex(null);
    setCapsulePoppedThisStick(false);
    setBurnFraction(0);
  }, [ritualStage, activeSlotIndex, capsulePoppedThisStick, activeBrandId]);

  const handleLightStick = useCallback(() => {
    if (ritualStage !== 'extracted') return;
    smolderSecRef.current = IDLE_SMOLDER_INTERVAL_SEC;
    setSmolderSecondsLeft(IDLE_SMOLDER_INTERVAL_SEC);
    setRitualStage('lit');
  }, [ritualStage]);

  const handleTakePuff = useCallback(() => {
    if (ritualStage !== 'lit' || activeSlotIndex === null) return;
    setRitualStage('puffing');
    setPuffNonce((n) => n + 1);
    smolderSecRef.current = IDLE_SMOLDER_INTERVAL_SEC;
    setSmolderSecondsLeft(IDLE_SMOLDER_INTERVAL_SEC);

    if (puffTimerRef.current) window.clearTimeout(puffTimerRef.current);
    puffTimerRef.current = window.setTimeout(() => {
      setBurnFraction((prev) => Math.min(1, prev + PUFF_LENGTH_STEP));
      setRitualStage('lit');
    }, 900);
  }, [ritualStage, activeSlotIndex]);

  const handleFinishStick = useCallback(() => {
    if (ritualStage !== 'lit' || activeSlotIndex === null) return;
    setRitualStage('puffing');
    setPuffNonce((n) => n + 1);

    if (puffTimerRef.current) window.clearTimeout(puffTimerRef.current);
    puffTimerRef.current = window.setTimeout(() => {
      commitStickLog(activeBrandId, activeSlotIndex, effectiveCapsuleForVisualizer);
      setRitualStage('in_pack');
      setActiveSlotIndex(null);
      setCapsulePoppedThisStick(false);
      setBurnFraction(0);
    }, 900);
  }, [ritualStage, activeSlotIndex, activeBrandId, commitStickLog, effectiveCapsuleForVisualizer]);

  const handlePutOutStick = useCallback(() => {
    if (activeSlotIndex === null) return;
    if (puffTimerRef.current) window.clearTimeout(puffTimerRef.current);

    if (burnFraction > 0) {
      commitStickLog(activeBrandId, activeSlotIndex, effectiveCapsuleForVisualizer);
    }
    setRitualStage('in_pack');
    setActiveSlotIndex(null);
    setCapsulePoppedThisStick(false);
    setBurnFraction(0);
  }, [activeSlotIndex, burnFraction, activeBrandId, commitStickLog, effectiveCapsuleForVisualizer]);

  const handleOpenNewPack = useCallback(() => {
    if (ritualStage !== 'in_pack') return;
    setPacksByBrand((prev) => ({
      ...prev,
      [activeBrandId]: {
        ...prev[activeBrandId],
        slots: createFreshPackSlots(activeBrand.hasCapsuleFeature),
        isCellophaneWrapped: true,
        packNumber: prev[activeBrandId].packNumber + 1,
      },
    }));
    setIsPeelingCellophane(false);
  }, [ritualStage, activeBrandId, activeBrand.hasCapsuleFeature]);

  const handleUndoOne = useCallback(() => {
    if (ritualStage !== 'in_pack' || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];
    const restoreBrand = getCigaretteSpec(lastLog.brandId);
    const restoreIndex = Math.max(0, Math.min(19, lastLog.stickNumberInPack - 1));

    setPacksByBrand((prev) => ({
      ...prev,
      [lastLog.brandId]: {
        ...prev[lastLog.brandId],
        slots: prev[lastLog.brandId].slots.map((slot) =>
          slot.index === restoreIndex
            ? { ...slot, isPresent: true, hasCapsule: restoreBrand.hasCapsuleFeature }
            : slot
        ),
      },
    }));
    setLogs((prev) => prev.slice(0, -1));
  }, [ritualStage, logs]);

  const handleResetAll = useCallback(() => {
    if (puffTimerRef.current) window.clearTimeout(puffTimerRef.current);
    if (peelTimerRef.current) window.clearTimeout(peelTimerRef.current);
    setLogs([]);
    setPacksByBrand(createInitialPacksByBrand());
    setIsPeelingCellophane(false);
    setRitualStage('in_pack');
    setActiveSlotIndex(null);
    setCapsulePoppedThisStick(false);
    setBurnFraction(0);
    setActiveTenureId('live');
    setSelectedMilestoneIndex(null);
  }, []);

  const handleSelectTenure = useCallback((id: TenurePresetId) => {
    if (puffTimerRef.current) window.clearTimeout(puffTimerRef.current);
    setRitualStage('in_pack');
    setActiveSlotIndex(null);
    setCapsulePoppedThisStick(false);
    setBurnFraction(0);
    setActiveTenureId(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col">
      {/* Top Bar Contract: 3 exact zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#070A10]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          <a
            href="#simulator"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            ClearLung
          </a>

          <nav
            aria-label="주요 섹션 이동"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
          >
            <a
              href="#simulator"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              폐 시뮬레이터
            </a>
            <a
              href="#metrics"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              건강 지표
            </a>
            <a
              href="#recovery"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              금연 회복
            </a>
            <a
              href="#illusion"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              착시 분석
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              새 담배갑 리셋
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span>{activeBrand.brandName} 선택 중</span>
              <span aria-hidden="true">·</span>
              <span>
                타르 {activeBrand.tarMg.toFixed(1)}mg / 니코틴 {activeBrand.nicotineMg.toFixed(2)}mg
              </span>
              <span aria-hidden="true">·</span>
              <span>갑당 {activeBrand.pricePerPack.toLocaleString('ko-KR')}원</span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
              비닐을 뜯고 불을 붙여 피울 때, 내 투명한 폐에 남는 기록
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            각 담배 종류마다 뜯어 둔 갑과 남은 개비, 캡슐 상태가 그대로 유지됩니다. 여러 담배를 번갈아 피우며 타르·니코틴에 따른 폐 변화를 비교해 보세요.
          </p>
        </section>

        {/* Tenure Timeline Selector Bar */}
        <section
          aria-label="흡연 기간별 폐 상태 비교"
          className="bg-[#0C121D] border border-slate-800/90 rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <CalendarClock className="w-4 h-4 text-sky-400" />
              <span>
                흡연 기간별 폐 변화 비교 ({activeBrand.shortName} · 하루 10개비 기준)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono-tabular">
              {activeTenure.description}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {TENURE_PRESETS.map((preset) => {
              const isActive = activeTenureId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectTenure(preset.id)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/15 border-sky-400/70 text-white'
                      : 'bg-[#070B13] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-100 whitespace-nowrap">
                    {preset.label}
                  </div>
                  <div className="mt-0.5 text-[11px] font-mono-tabular text-slate-400 whitespace-nowrap">
                    {preset.id === 'live'
                      ? `내 기록 (${logs.length}개비)`
                      : `${preset.totalSticks.toLocaleString('ko-KR')}개비`}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Core Two-Column Side-by-Side Stage */}
        <section
          id="simulator"
          aria-label="담배갑 및 투명 폐 시뮬레이터"
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
        >
          <div className="lg:col-span-5 flex flex-col">
            <CigarettePack
              activeBrand={activeBrand}
              packsByBrand={packsByBrand}
              onSelectBrand={handleSelectBrand}
              packSlots={packSlots}
              isCellophaneWrapped={isCellophaneWrapped}
              isPeelingCellophane={isPeelingCellophane}
              onTearCellophane={handleTearCellophane}
              activeSlotIndex={activeSlotIndex}
              activeSlotHasCapsule={activeSlotHasCapsule}
              capsulePoppedThisStick={capsulePoppedThisStick}
              currentPackNumber={metrics.currentPackNumber}
              totalSmoked={logs.length}
              ritualStage={ritualStage}
              burnFraction={burnFraction}
              smolderSecondsLeft={smolderSecondsLeft}
              onExtractStick={handleExtractStick}
              onPopCapsule={handlePopCapsule}
              onLightStick={handleLightStick}
              onTakePuff={handleTakePuff}
              onFinishStick={handleFinishStick}
              onPutOutStick={handlePutOutStick}
              onReturnStickToPack={handleReturnStickToPack}
              onUndoOne={handleUndoOne}
              onOpenNewPack={handleOpenNewPack}
              onResetAll={handleResetAll}
              brandMode={brandMode}
              onToggleBrandMode={() =>
                setBrandMode((m) => (m === 'real' ? 'homage' : 'real'))
              }
              activeTenureId={activeTenureId}
              onReturnToLive={() => handleSelectTenure('live')}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <LungTorsoVisualizer
              activeBrand={activeBrand}
              metrics={metrics}
              ritualStage={ritualStage}
              capsuleEnabled={effectiveCapsuleForVisualizer}
              recoveryFactor={activeRecoveryFactor}
              puffNonce={puffNonce}
            />
          </div>
        </section>

        {/* Full-Width 4-Column Telemetry Strip */}
        <TelemetryStrip
          activeBrand={activeBrand}
          metrics={metrics}
          activeTenure={activeTenure}
        />

        {/* Quit Smoking Recovery Timeline Simulator */}
        <RecoverySimulator
          totalSmoked={metrics.totalSmoked}
          selectedMilestoneIndex={selectedMilestoneIndex}
          onSelectMilestone={setSelectedMilestoneIndex}
        />

        {/* Low-Tar & Cooling Illusion Analysis */}
        <IllusionAnalysis />
      </main>

      <footer className="border-t border-slate-800/80 mt-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            ClearLung · 금연 동기 부여를 위한 시각적 시뮬레이션
          </span>
          <span>
            본 화면의 폐 변화와 수치는 일반 의학·금연 연구를 바탕으로 한 교육용 시뮬레이션이며 실제 의학적 진단이 아닙니다.
          </span>
        </div>
      </footer>
    </div>
  );
}
