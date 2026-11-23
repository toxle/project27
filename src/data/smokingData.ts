import {
  AnatomicalHotspot,
  BrandPackState,
  CigaretteBrandId,
  CigaretteSpec,
  LungHealthMetrics,
  PackSlot,
  RecoveryMilestone,
  SmokedStickLog,
  TarDepositSpot,
  TenurePreset,
} from '../types/smoking';

export const CIGARETTE_CATALOG: CigaretteSpec[] = [
  {
    id: 'esse-himalaya',
    brandName: '에쎄 히말라야 윈터',
    homageName: '스노우 피크 1mg',
    shortName: '에쎄 히말라야',
    format: '초슬림 · 20개비',
    formatType: 'slim',
    tarMg: 1.0,
    nicotineMg: 0.1,
    pricePerPack: 4500,
    sticksPerPack: 20,
    pricePerStick: 225,
    hasCapsuleFeature: true,
    capsuleName: '아이스 블루 캡슐',
    capsuleColorHex: '#38BDF8',
    tarLoadPerStick: 2.1, // compensatory smoking on 1mg
    description: '저타르 1mg 초슬림 · 냉각 캡슐과 입냄새 저감 기술 적용',
  },
  {
    id: 'raison-french',
    brandName: '레종 프렌치 블랙',
    homageName: '누아르 프렌치 3mg',
    shortName: '레종 프렌치 블랙',
    format: '킹사이즈 · 20개비',
    formatType: 'king',
    tarMg: 3.0,
    nicotineMg: 0.2,
    pricePerPack: 4500,
    sticksPerPack: 20,
    pricePerStick: 225,
    hasCapsuleFeature: true,
    capsuleName: '프렌치 퍼플 캡슐',
    capsuleColorHex: '#C084FC',
    tarLoadPerStick: 3.8,
    description: '중저타르 3mg · 달콤한 향 캡슐이 목 자극을 감추는 제품',
  },
  {
    id: 'mevius-skyblue',
    brandName: '메비우스 스카이블루 (마쎄 곽)',
    homageName: '스카이 블루 6mg (곽)',
    shortName: '마쎄 곽 (스카이블루)',
    format: '킹사이즈 곽 · 20개비',
    formatType: 'king',
    tarMg: 6.0,
    nicotineMg: 0.5,
    pricePerPack: 4500,
    sticksPerPack: 20,
    pricePerStick: 225,
    hasCapsuleFeature: false,
    capsuleName: '캡슐 없음',
    capsuleColorHex: '#94A3B8',
    tarLoadPerStick: 6.3,
    description: '구 마일드세븐(마쎄) 곽 · 타르 6.0mg / 니코틴 0.50mg 하드팩',
  },
  {
    id: 'marlboro-red',
    brandName: '말보로 레드',
    homageName: '크림슨 8mg',
    shortName: '말보로 레드',
    format: '킹사이즈 · 20개비',
    formatType: 'king',
    tarMg: 8.0,
    nicotineMg: 0.7,
    pricePerPack: 4500,
    sticksPerPack: 20,
    pricePerStick: 225,
    hasCapsuleFeature: false,
    capsuleName: '캡슐 없음',
    capsuleColorHex: '#94A3B8',
    tarLoadPerStick: 8.5,
    description: '고타르 8mg · 국내 최고 수준 타르/니코틴으로 빠른 폐 손상 진행',
  },
];

export const ESSE_HIMALAYA_WINTER_SPEC = CIGARETTE_CATALOG[0];

export function getCigaretteSpec(id: CigaretteBrandId): CigaretteSpec {
  return CIGARETTE_CATALOG.find((c) => c.id === id) ?? CIGARETTE_CATALOG[0];
}

export function createFreshPackSlots(hasCapsuleFeature: boolean): PackSlot[] {
  return Array.from({ length: 20 }, (_, index) => ({
    index,
    isPresent: true,
    hasCapsule: hasCapsuleFeature,
  }));
}

export function createInitialPacksByBrand(): Record<CigaretteBrandId, BrandPackState> {
  const result = {} as Record<CigaretteBrandId, BrandPackState>;
  for (const spec of CIGARETTE_CATALOG) {
    result[spec.id] = {
      brandId: spec.id,
      slots: createFreshPackSlots(spec.hasCapsuleFeature),
      isCellophaneWrapped: true,
      packNumber: 1,
    };
  }
  return result;
}

export const PUFFS_PER_CIGARETTE = 5;
export const IDLE_SMOLDER_INTERVAL_SEC = 10;

export const TENURE_PRESETS: TenurePreset[] = [
  {
    id: 'live',
    label: '직접 피우기',
    shortLabel: '직접 체험',
    days: 0,
    dailySticks: 0,
    totalSticks: 0,
    description: '담배갑 비닐을 뜯고 직접 꺼내 불을 붙이며 1개비씩 변화를 확인합니다.',
  },
  {
    id: '1w',
    label: '1주일차',
    shortLabel: '1주일 (70개비)',
    days: 7,
    dailySticks: 10,
    totalSticks: 70,
    description: '하루 10개비 × 7일 = 70개비(3.5갑). 선택한 담배의 타르·니코틴 기준 단기 누적 변화입니다.',
  },
  {
    id: '1m',
    label: '1개월차',
    shortLabel: '1개월 (300개비)',
    days: 30,
    dailySticks: 10,
    totalSticks: 300,
    description: '하루 10개비 × 30일 = 300개비(15갑). 폐 표면 변색과 섬모 정화 기능 저하가 시작됩니다.',
  },
  {
    id: '1y',
    label: '1년차',
    shortLabel: '1년 (3,650개비)',
    days: 365,
    dailySticks: 10,
    totalSticks: 3650,
    description: '하루 10개비 × 1년 = 3,650개비(182.5갑). 타르 침착과 호흡 탄성 저하가 뚜렷해집니다.',
  },
  {
    id: '5y',
    label: '5년차',
    shortLabel: '5년 (18,250개비)',
    days: 1825,
    dailySticks: 10,
    totalSticks: 18250,
    description: '하루 10개비 × 5년 = 18,250개비(912.5갑). 폐 조직 전반이 어두워지고 만성 호흡 압박이 심화됩니다.',
  },
  {
    id: '10y',
    label: '10년차',
    shortLabel: '10년 (36,500개비)',
    days: 3650,
    dailySticks: 10,
    totalSticks: 36500,
    description: '하루 10개비 × 10년 = 36,500개비(1,825갑). 10년간 축적된 타르·니코틴 부하를 시각화합니다.',
  },
];

export const RECOVERY_MILESTONES: RecoveryMilestone[] = [
  {
    id: 'now',
    timeLabel: '금연 직후 (0분)',
    hoursElapsed: 0,
    recoveryFactor: 0,
    title: '잔류 연기 및 일산화탄소 최고조',
    physiologicalChange:
      '혈중 일산화탄소 농도가 높고 기관지 섬모 운동이 마비된 상태입니다. 폐포 내 타르와 미세 독성 입자가 그대로 남아 있습니다.',
    visualEffectNote: '현재 손상 상태 그대로 표시',
  },
  {
    id: '20m',
    timeLabel: '20분 경과',
    hoursElapsed: 0.33,
    recoveryFactor: 0.08,
    title: '심박수·말초 혈압 정상화 시작',
    physiologicalChange:
      '니코틴에 의해 수축되었던 말초 혈관이 이완되며 급격히 빨라졌던 호흡 리듬과 심박수가 안정을 찾기 시작합니다.',
    visualEffectNote: '호흡 주기 안정화 · 얕은 호흡 떨림 완화',
  },
  {
    id: '12h',
    timeLabel: '12시간 경과',
    hoursElapsed: 12,
    recoveryFactor: 0.24,
    title: '혈중 일산화탄소 수치 정상 복귀',
    physiologicalChange:
      '헤모글로빈에서 일산화탄소가 분리되어 혈액의 산소 운반 능력이 정상 수준으로 회복됩니다. 폐 내부 정체 연무가 걷힙니다.',
    visualEffectNote: '회색 잔류 연무 제거 · 혈중 산소 효율 개선',
  },
  {
    id: '48h',
    timeLabel: '48시간 (2일) 경과',
    hoursElapsed: 48,
    recoveryFactor: 0.42,
    title: '기관지 섬모 운동 재개 및 점액 배출',
    physiologicalChange:
      '타르에 눌려 멈춰 있던 기관지 섬모들이 다시 움직이며 기도와 폐포 표면의 점액과 찌꺼기를 밖으로 밀어내기 시작합니다.',
    visualEffectNote: '기관지 충혈 감소 · 상엽 타르 막 옅어짐',
  },
  {
    id: '2w',
    timeLabel: '2주 경과',
    hoursElapsed: 336,
    recoveryFactor: 0.65,
    title: '폐 순환 개선 및 폐활량 체감 회복',
    physiologicalChange:
      '폐 혈류량이 증가하고 횡격막을 이용한 깊은 호흡이 훨씬 수월해집니다. 호흡 폭이 눈에 띄게 깊어집니다.',
    visualEffectNote: '폐 팽창 폭 85% 이상 복구 · 선홍빛 조직 점진적 회복',
  },
  {
    id: '3m',
    timeLabel: '3개월 경과',
    hoursElapsed: 2160,
    recoveryFactor: 0.86,
    title: '폐 기능 최대 30% 향상 · 섬모 재생',
    physiologicalChange:
      '손상되었던 기관지 섬모가 새 조직으로 상당 부분 재생되어 감염 방어력과 정화 기능이 크게 회복됩니다.',
    visualEffectNote: '검은 타르 반점 대부분 소실 · 맑은 혈관망 복원',
  },
  {
    id: '1y',
    timeLabel: '1년 경과',
    hoursElapsed: 8760,
    recoveryFactor: 0.97,
    title: '심폐 질환 위험 절반 감소 · 맑은 폐 회복',
    physiologicalChange:
      '만성 기관지 염증과 점액 분비가 현저히 줄어들고, 심혈관 및 호흡기 질환 발병 위험이 흡연 시 대비 크게 감소합니다.',
    visualEffectNote: '건강한 선홍빛 폐 조직 및 100%에 가까운 깊은 호흡',
  },
];

export const TAR_DEPOSIT_SPOTS: TarDepositSpot[] = [
  { id: 1, side: 'right', cx: 176, cy: 192, baseRadius: 5.5, unlockAtDamage: 0.04, lobe: 'upper', rotation: 15 },
  { id: 2, side: 'left', cx: 244, cy: 196, baseRadius: 5.5, unlockAtDamage: 0.07, lobe: 'upper', rotation: -20 },
  { id: 3, side: 'right', cx: 162, cy: 230, baseRadius: 7.5, unlockAtDamage: 0.11, lobe: 'middle', rotation: 35 },
  { id: 4, side: 'left', cx: 262, cy: 238, baseRadius: 7.5, unlockAtDamage: 0.15, lobe: 'lower', rotation: -12 },
  { id: 5, side: 'right', cx: 148, cy: 266, baseRadius: 9.5, unlockAtDamage: 0.21, lobe: 'lower', rotation: 48 },
  { id: 6, side: 'left', cx: 274, cy: 272, baseRadius: 9.5, unlockAtDamage: 0.26, lobe: 'lower', rotation: -38 },
  { id: 7, side: 'right', cx: 168, cy: 168, baseRadius: 9, unlockAtDamage: 0.30, lobe: 'upper', rotation: 18 },
  { id: 8, side: 'left', cx: 252, cy: 172, baseRadius: 9, unlockAtDamage: 0.35, lobe: 'upper', rotation: -24 },
  { id: 9, side: 'right', cx: 138, cy: 244, baseRadius: 12, unlockAtDamage: 0.41, lobe: 'middle', rotation: 60 },
  { id: 10, side: 'left', cx: 280, cy: 248, baseRadius: 12, unlockAtDamage: 0.46, lobe: 'lower', rotation: -50 },
  { id: 11, side: 'right', cx: 178, cy: 258, baseRadius: 13.5, unlockAtDamage: 0.52, lobe: 'lower', rotation: 22 },
  { id: 12, side: 'left', cx: 240, cy: 262, baseRadius: 13.5, unlockAtDamage: 0.57, lobe: 'lower', rotation: -15 },
  { id: 13, side: 'right', cx: 152, cy: 205, baseRadius: 14, unlockAtDamage: 0.63, lobe: 'middle', rotation: 41 },
  { id: 14, side: 'left', cx: 268, cy: 210, baseRadius: 14, unlockAtDamage: 0.68, lobe: 'upper', rotation: -31 },
  { id: 15, side: 'right', cx: 132, cy: 276, baseRadius: 15.5, unlockAtDamage: 0.74, lobe: 'lower', rotation: 75 },
  { id: 16, side: 'left', cx: 288, cy: 278, baseRadius: 15.5, unlockAtDamage: 0.78, lobe: 'lower', rotation: -65 },
  { id: 17, side: 'right', cx: 160, cy: 284, baseRadius: 16, unlockAtDamage: 0.82, lobe: 'lower', rotation: 10 },
  { id: 18, side: 'left', cx: 258, cy: 286, baseRadius: 16, unlockAtDamage: 0.86, lobe: 'lower', rotation: -18 },
  { id: 19, side: 'right', cx: 142, cy: 218, baseRadius: 17, unlockAtDamage: 0.89, lobe: 'middle', rotation: 30 },
  { id: 20, side: 'left', cx: 278, cy: 222, baseRadius: 17, unlockAtDamage: 0.93, lobe: 'upper', rotation: -28 },
];

export const ANATOMICAL_HOTSPOTS: AnatomicalHotspot[] = [
  {
    id: 'trachea',
    title: '기관 (Trachea)',
    subtitle: '유독가스 유입 통로',
    x: 210,
    y: 128,
    getDescription: (m, rec, brand) => {
      if (m.totalSmoked === 0 || rec > 0.9) {
        return '기관 내벽 점막이 맑고 매끄러워 공기가 저항 없이 폐로 이동합니다.';
      }
      return `현재 ${brand.brandName}(타르 ${brand.tarMg.toFixed(1)}mg · 니코틴 ${brand.nicotineMg.toFixed(2)}mg) 기준으로 누적 ${m.totalSmoked.toLocaleString('ko-KR')}개비의 연기가 기도를 통과했습니다.`;
    },
  },
  {
    id: 'bronchi',
    title: '기관지 & 섬모',
    subtitle: '이물질 방어선',
    x: 188,
    y: 184,
    getDescription: (m, rec, brand) => {
      if (m.totalSmoked === 0 || rec > 0.9) {
        return '미세 섬모들이 1분에 수백 번씩 움직이며 먼지와 노폐물을 밖으로 쓸어냅니다.';
      }
      const capsuleNote =
        m.capsuleCount > 0
          ? ` (캡슐 ${m.capsuleCount.toLocaleString('ko-KR')}회 사용으로 냉각·향 마비 가속)`
          : '';
      return `타르(${brand.tarMg.toFixed(1)}mg/개비)와 니코틴(${brand.nicotineMg.toFixed(2)}mg/개비)이 섬모 운동을 둔화시키고 기관지 혈관을 수축시킵니다.${capsuleNote}`;
    },
  },
  {
    id: 'upper_lung',
    title: '폐 상엽 (폐포 조직)',
    subtitle: '타르 초기 침착 부위',
    x: 264,
    y: 192,
    getDescription: (m, rec) => {
      if (m.totalSmoked === 0 || rec > 0.9) {
        return '탄력 있는 수억 개의 폐포가 붉고 건강하게 산소와 이산화탄소를 교환합니다.';
      }
      return `갑 표기 기준 누적 타르 ${m.labeledTarMg.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}mg, 실제 체내 유입 추정치 약 ${m.estimatedInhaledTarMg.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}mg이 폐포 벽에 쌓였습니다.`;
    },
  },
  {
    id: 'lower_lung',
    title: '폐 하엽 (심부 폐포)',
    subtitle: '깊은 흡입 도달점',
    x: 146,
    y: 268,
    getDescription: (m, rec, brand) => {
      if (m.totalSmoked === 0 || rec > 0.9) {
        return '하엽 깊숙한 곳까지 신선한 공기가 채워지며 100% 폐활량을 유지하고 있습니다.';
      }
      return `${brand.hasCapsuleFeature ? '캡슐을 깨면 목 자극이 무뎌져 연기가 하엽 끝까지 깊게 침투합니다. ' : ''}현재 폐 탄성률은 ${m.lungElasticityPct.toFixed(0)}%입니다.`;
    },
  },
  {
    id: 'diaphragm',
    title: '횡격막 (Diaphragm)',
    subtitle: '호흡 펌프 근육',
    x: 210,
    y: 312,
    getDescription: (m, rec) => {
      if (m.totalSmoked === 0 || rec > 0.9) {
        return '횡격막이 아래로 깊고 부드럽게 내려가며 안정적인 복식 호흡을 만듭니다.';
      }
      return `니코틴 자극(부하 ${m.nicotineImpactPct.toFixed(0)}%)과 탄성 감소로 횡격막 가동 폭이 좁아졌으며 분당 호흡수가 ${m.breathsPerMinute.toFixed(0)}회로 빨라졌습니다.`;
    },
  },
  {
    id: 'navel',
    title: '복부 · 배꼽 기준선',
    subtitle: '상반신 흉복부 해부학 기준',
    x: 210,
    y: 446,
    getDescription: (m) =>
      `배꼽 위 흉복부 전체의 호흡 팽창과 횡격막 하강 깊이를 통해 누적 ${m.totalSmoked.toLocaleString('ko-KR')}개비(니코틴 ${m.labeledNicotineMg.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}mg)로 인한 호흡 변화를 비교할 수 있습니다.`,
  },
];

// Max reference tar load: 10 years @ 10 sticks/day of 8mg Marlboro Red (~8.5 tarLoad/stick * 36500 = 310,250)
const MAX_TAR_LOG_DENOM = Math.log10(1 + 310250 * 0.105);

export function computeLungHealthMetrics(
  logs: SmokedStickLog[],
  activeBrand: CigaretteSpec,
  overrideCount?: number,
  overrideCapsuleActive = false,
  recoveryFactor = 0,
  currentBurnFraction = 0,
  currentStickCapsulePopped = false,
  actualPackRemaining?: number,
  actualPackNumber?: number
): LungHealthMetrics {
  const isOverride = overrideCount !== undefined;
  const totalSmoked = isOverride ? overrideCount : logs.length;

  const capsuleCount = isOverride
    ? activeBrand.hasCapsuleFeature && overrideCapsuleActive
      ? totalSmoked
      : 0
    : logs.filter((l) => l.capsulePopped).length;

  const sticksPerPack = activeBrand.sticksPerPack;
  const computedPackNumber =
    totalSmoked === 0 ? 1 : Math.floor((totalSmoked - 1) / sticksPerPack) + 1;
  const currentPackNumber =
    actualPackNumber !== undefined ? actualPackNumber : computedPackNumber;
  const usedInCurrentPack =
    totalSmoked === 0 ? 0 : ((totalSmoked - 1) % sticksPerPack) + 1;
  const currentPackRemaining =
    actualPackRemaining !== undefined ? actualPackRemaining : sticksPerPack - usedInCurrentPack;

  // Sum tar & nicotine accurately across mixed smoked logs OR selected brand in tenure preset
  let labeledTarMg = 0;
  let labeledNicotineMg = 0;
  let totalWeightedTarUnits = 0;

  if (isOverride) {
    labeledTarMg = totalSmoked * activeBrand.tarMg;
    labeledNicotineMg = totalSmoked * activeBrand.nicotineMg;
    const capBoost = activeBrand.hasCapsuleFeature && overrideCapsuleActive ? 1.2 : 1.0;
    totalWeightedTarUnits = totalSmoked * activeBrand.tarLoadPerStick * capBoost;
  } else {
    for (const log of logs) {
      const spec = getCigaretteSpec(log.brandId);
      labeledTarMg += log.tarMg;
      labeledNicotineMg += log.nicotineMg;
      const capBoost = log.capsulePopped ? 1.2 : 1.0;
      totalWeightedTarUnits += spec.tarLoadPerStick * capBoost;
    }
    // Add partial impact of currently burning cigarette
    if (currentBurnFraction > 0) {
      const activeBoost = currentStickCapsulePopped ? 1.2 : 1.0;
      totalWeightedTarUnits += currentBurnFraction * activeBrand.tarLoadPerStick * activeBoost;
    }
  }

  // Real-world estimated inhaled tar (higher compensation on low-tar 1mg, closer to 1.1x on 8mg)
  const estimatedInhaledTarMg = totalWeightedTarUnits * (1 - recoveryFactor * 0.7);
  const totalSpentKrw = totalSmoked * activeBrand.pricePerStick;

  const rawDamageRatio =
    totalWeightedTarUnits <= 0
      ? 0
      : Math.min(1.0, Math.log10(1 + totalWeightedTarUnits * 0.105) / MAX_TAR_LOG_DENOM);

  const damageRatio = Math.max(0, rawDamageRatio * (1 - recoveryFactor));

  // Nicotine drives acute sympathetic stimulation (breathing speed & vascular stress)
  const effectiveNicotinePerStick =
    totalSmoked > 0 ? labeledNicotineMg / totalSmoked : activeBrand.nicotineMg;
  const nicotineIntensity = Math.min(1, effectiveNicotinePerStick / 0.7); // 0.10mg -> 0.14, 0.70mg -> 1.0
  const nicotineImpactPct =
    totalSmoked === 0 && currentBurnFraction === 0
      ? 0
      : Math.max(0, (25 + nicotineIntensity * 75) * (1 - recoveryFactor));

  const lungElasticityPct = Math.max(36, 100 - damageRatio * 58);
  const oxygenEfficiencyPct = Math.max(52, 100 - damageRatio * 42);
  const breathsPerMinute =
    13 +
    damageRatio * 7.5 +
    (totalSmoked > 0 || currentBurnFraction > 0 ? nicotineIntensity * 2.5 * (1 - recoveryFactor) : 0);

  const acuteCo = Math.min(26, (totalWeightedTarUnits / 3.5) * 1.4);
  const chronicCo = damageRatio * 20;
  const carbonMonoxidePpm = Math.max(
    1.5,
    1.5 + Math.max(acuteCo, chronicCo) * (1 - recoveryFactor)
  );

  let stageLevel: 0 | 1 | 2 | 3 | 4 = 0;
  let stageLabel = '정상 (깨끗한 폐)';
  let stageGlyph: '●' | '▲' | '✖' = '●';
  let stageTone: 'nominal' | 'caution' | 'warning' | 'critical' = 'nominal';
  let stageSummary = '타르 침착이 없는 건강한 선홍빛 폐와 깊은 호흡 상태입니다.';

  if (damageRatio < 0.015) {
    stageLevel = 0;
    stageLabel = '정상 (깨끗한 폐)';
    stageGlyph = '●';
    stageTone = 'nominal';
    stageSummary =
      recoveryFactor > 0 && totalSmoked > 0
        ? '금연 유지로 폐 조직이 맑고 건강한 탄성을 되찾았습니다.'
        : '타르 침착이 없는 건강한 선홍빛 폐와 깊은 호흡 상태입니다.';
  } else if (damageRatio < 0.24) {
    stageLevel = 1;
    stageLabel = '단기 자극 · 연무 잔류';
    stageGlyph = '▲';
    stageTone = 'caution';
    stageSummary = `${activeBrand.shortName}(타르 ${activeBrand.tarMg}mg) 흡입으로 기관지 점막 자극과 초기 미세 입자가 남고 있습니다.`;
  } else if (damageRatio < 0.52) {
    stageLevel = 2;
    stageLabel = '초기 변색 · 타르 축적';
    stageGlyph = '▲';
    stageTone = 'warning';
    stageSummary =
      '누적 타르로 폐 조직이 칙칙한 회갈색으로 변하고 기관지 주변 반점이 확산되고 있습니다.';
  } else if (damageRatio < 0.80) {
    stageLevel = 3;
    stageLabel = '만성 침착 · 탄성 저하';
    stageGlyph = '▲';
    stageTone = 'warning';
    stageSummary =
      '암갈색 타르 침착이 폐 전체로 확대되어 폐활량과 산소 교환 효율이 뚜렷하게 저하되었습니다.';
  } else {
    stageLevel = 4;
    stageLabel = '장기 고위험 손상';
    stageGlyph = '✖';
    stageTone = 'critical';
    stageSummary =
      '장기간 축적된 고밀도 타르와 니코틴 부하로 횡격막 호흡이 얕고 거칠어진 고위험 상태입니다.';
  }

  return {
    totalSmoked,
    capsuleCount,
    currentPackRemaining,
    currentPackNumber,
    labeledTarMg,
    estimatedInhaledTarMg,
    labeledNicotineMg,
    totalSpentKrw,
    lungElasticityPct,
    oxygenEfficiencyPct,
    breathsPerMinute,
    carbonMonoxidePpm,
    nicotineImpactPct,
    damageRatio,
    stageLevel,
    stageLabel,
    stageGlyph,
    stageTone,
    stageSummary,
  };
}
