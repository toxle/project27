export type PackBrandMode = 'real' | 'homage';

export type CigaretteBrandId =
  | 'esse-himalaya'
  | 'raison-french'
  | 'mevius-skyblue'
  | 'marlboro-red';

export type TenurePresetId = 'live' | '1w' | '1m' | '1y' | '5y' | '10y';

export type SmokingRitualStage = 'in_pack' | 'extracted' | 'lit' | 'puffing';

export interface PackSlot {
  index: number; // 0..19
  isPresent: boolean;
  hasCapsule: boolean; // true if intact capsule exists; false if popped & returned or non-capsule brand
}

export interface BrandPackState {
  brandId: CigaretteBrandId;
  slots: PackSlot[];
  isCellophaneWrapped: boolean;
  packNumber: number;
}

export interface TenurePreset {
  id: TenurePresetId;
  label: string;
  shortLabel: string;
  days: number;
  dailySticks: number;
  totalSticks: number;
  description: string;
}

export interface CigaretteSpec {
  id: CigaretteBrandId;
  brandName: string;
  homageName: string;
  shortName: string;
  format: string;
  formatType: 'slim' | 'king';
  tarMg: number;
  nicotineMg: number;
  pricePerPack: number;
  sticksPerPack: number;
  pricePerStick: number;
  hasCapsuleFeature: boolean;
  capsuleName: string;
  capsuleColorHex: string;
  tarLoadPerStick: number; // physiological tar load including compensation factor
  description: string;
}

export interface SmokedStickLog {
  id: string;
  brandId: CigaretteBrandId;
  tarMg: number;
  nicotineMg: number;
  stickNumberInPack: number;
  packNumber: number;
  capsulePopped: boolean;
  timestamp: number;
}

export interface LungHealthMetrics {
  totalSmoked: number;
  capsuleCount: number;
  currentPackRemaining: number;
  currentPackNumber: number;
  labeledTarMg: number;
  estimatedInhaledTarMg: number;
  labeledNicotineMg: number;
  totalSpentKrw: number;
  lungElasticityPct: number;
  oxygenEfficiencyPct: number;
  breathsPerMinute: number;
  carbonMonoxidePpm: number;
  nicotineImpactPct: number; // 0 to 100 based on average nicotine concentration
  damageRatio: number; // 0.0 (clean) to 1.0 (severe long-term high-tar burden)
  stageLevel: 0 | 1 | 2 | 3 | 4;
  stageLabel: string;
  stageGlyph: '●' | '▲' | '✖';
  stageTone: 'nominal' | 'caution' | 'warning' | 'critical';
  stageSummary: string;
}

export interface TarDepositSpot {
  id: number;
  side: 'left' | 'right';
  cx: number;
  cy: number;
  baseRadius: number;
  unlockAtDamage: number;
  lobe: 'upper' | 'middle' | 'lower';
  rotation: number;
}

export interface AnatomicalHotspot {
  id: 'trachea' | 'bronchi' | 'upper_lung' | 'lower_lung' | 'diaphragm' | 'navel';
  title: string;
  subtitle: string;
  x: number;
  y: number;
  getDescription: (metrics: LungHealthMetrics, recoveryPct: number, brand: CigaretteSpec) => string;
}

export interface RecoveryMilestone {
  id: string;
  timeLabel: string;
  hoursElapsed: number;
  recoveryFactor: number;
  title: string;
  physiologicalChange: string;
  visualEffectNote: string;
}
