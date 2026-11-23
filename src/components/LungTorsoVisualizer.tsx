import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Layers, Activity } from 'lucide-react';
import { ANATOMICAL_HOTSPOTS, TAR_DEPOSIT_SPOTS } from '../data/smokingData';
import {
  AnatomicalHotspot,
  CigaretteSpec,
  LungHealthMetrics,
  SmokingRitualStage,
} from '../types/smoking';

interface LungTorsoVisualizerProps {
  activeBrand: CigaretteSpec;
  metrics: LungHealthMetrics;
  ritualStage: SmokingRitualStage;
  capsuleEnabled: boolean;
  recoveryFactor: number;
  puffNonce: number; // increments on every single puff / inhalation
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  targetSide: 'left' | 'right';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpColor(hexA: string, hexB: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const rr = Math.round(lerp(ar, br, clamped));
  const rg = Math.round(lerp(ag, bg, clamped));
  const rb = Math.round(lerp(ab, bb, clamped));
  return `rgb(${rr}, ${rg}, ${rb})`;
}

export const LungTorsoVisualizer: React.FC<LungTorsoVisualizerProps> = ({
  activeBrand,
  metrics,
  ritualStage,
  capsuleEnabled,
  recoveryFactor,
  puffNonce,
}) => {
  const [showRibs, setShowRibs] = useState(true);
  const [highlightTar, setHighlightTar] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<AnatomicalHotspot['id']>('lower_lung');

  const [breathPhase, setBreathPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);

  const isPuffing = ritualStage === 'puffing';

  // Smooth breathing loop (expands noticeably when actively inhaling a puff)
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setBreathPhase(0.4);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const freqHz = metrics.breathsPerMinute / 60;
      const rawSin = Math.sin(elapsedSec * freqHz * Math.PI * 2);
      const tremor =
        metrics.stageLevel >= 3
          ? Math.sin(elapsedSec * 24) * 0.04 * Math.min(1, metrics.damageRatio)
          : 0;
      setBreathPhase(rawSin + tremor);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [metrics.breathsPerMinute, metrics.stageLevel, metrics.damageRatio]);

  // Spawn smoke stream from mouth (y ~ 34) down trachea into lungs on every puff
  useEffect(() => {
    if (puffNonce === 0) return;
    const count = capsuleEnabled ? 56 : Math.round(36 + activeBrand.tarMg * 2.5);
    const particleRgb = capsuleEnabled
      ? activeBrand.id === 'raison-french'
        ? '192, 132, 252'
        : '56, 189, 248'
      : activeBrand.tarMg >= 6
      ? '180, 172, 168'
      : '203, 213, 225';

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 'left' : 'right';
      const delayOffset = i * 1.1;
      particlesRef.current.push({
        x: 210 + (Math.random() - 0.5) * 4,
        y: 36 - delayOffset * 0.65,
        vx: (Math.random() - 0.5) * 0.35,
        vy: 1.7 + Math.random() * 0.9,
        radius: (activeBrand.tarMg >= 6 ? 2.8 : 2.2) + Math.random() * 4.2,
        alpha: Math.min(0.9, 0.72 + activeBrand.tarMg * 0.02),
        life: 0,
        maxLife: 94 + Math.random() * 40,
        color: particleRgb,
        targetSide: side,
      });
    }
  }, [puffNonce, capsuleEnabled, activeBrand]);

  // Canvas particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient residual haze inside lungs proportional to damageRatio
      if (metrics.damageRatio > 0.04 && Math.random() < Math.min(0.45, metrics.damageRatio * 0.4)) {
        const isRightLungViewerLeft = Math.random() > 0.5;
        particlesRef.current.push({
          x: isRightLungViewerLeft ? 138 + Math.random() * 46 : 236 + Math.random() * 46,
          y: 176 + Math.random() * 104,
          vx: (Math.random() - 0.5) * 0.24,
          vy: -0.22 - Math.random() * 0.25,
          radius: 3 + Math.random() * 6,
          alpha: Math.min(0.22, metrics.damageRatio * 0.22),
          life: 0,
          maxLife: 55 + Math.random() * 30,
          color: '148, 163, 184',
          targetSide: isRightLungViewerLeft ? 'right' : 'left',
        });
      }

      const nextParticles: SmokeParticle[] = [];
      for (const p of particlesRef.current) {
        p.life += 1;
        if (p.life >= p.maxLife) continue;

        if (p.y < 168) {
          p.y += p.vy;
          p.x += Math.sin(p.life * 0.15) * 0.2;
        } else {
          const targetX = p.targetSide === 'right' ? 156 : 264;
          const maxDepthY = capsuleEnabled ? 286 : 254;
          if (p.y < maxDepthY) {
            p.x += (targetX - p.x) * 0.034 + p.vx;
            p.y += p.vy * 0.72;
          } else {
            p.x += p.vx * 1.3;
            p.y += (Math.random() - 0.5) * 0.45;
          }
          p.radius += 0.075;
        }

        const progress = p.life / p.maxLife;
        const fade = Math.sin(progress * Math.PI) * p.alpha;
        const sootMix = progress > 0.58 ? (progress - 0.58) / 0.42 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (sootMix > 0.1 && p.color !== '148, 163, 184') {
          ctx.fillStyle = `rgba(38, 32, 34, ${fade * 0.9})`;
        } else {
          ctx.fillStyle = `rgba(${p.color}, ${fade})`;
        }
        ctx.fill();

        nextParticles.push(p);
      }

      particlesRef.current = nextParticles;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [metrics.damageRatio, capsuleEnabled]);

  // Realistic tissue color curve mapped strictly to 0.0..1.0 damageRatio:
  // 0.00 -> Healthy bright rose pink (#F47296)
  // 0.20 (1 pack) -> Slightly muted warm rose (#D66D7D) — NOT rotten!
  // 0.45 (1 month) -> Dusky brownish-gray (#8B605D)
  // 0.75 (1 year) -> Dark charcoal-brown (#483937)
  // 1.00 (10 years) -> Severe tar obsidian (#221C1D)
  const effectiveDamage = Math.max(0, Math.min(1, metrics.damageRatio));
  const lungBaseColor = useMemo(() => {
    if (effectiveDamage <= 0.22) {
      return lerpColor('#F47296', '#D46E7E', effectiveDamage / 0.22);
    }
    if (effectiveDamage <= 0.50) {
      return lerpColor('#D46E7E', '#835C58', (effectiveDamage - 0.22) / 0.28);
    }
    if (effectiveDamage <= 0.80) {
      return lerpColor('#835C58', '#463735', (effectiveDamage - 0.50) / 0.30);
    }
    return lerpColor('#463735', '#211B1C', (effectiveDamage - 0.80) / 0.20);
  }, [effectiveDamage]);

  const lungHighlightColor = useMemo(() => {
    if (effectiveDamage <= 0.25) {
      return lerpColor('#FDA4AF', '#E58A94', effectiveDamage / 0.25);
    }
    if (effectiveDamage <= 0.65) {
      return lerpColor('#E58A94', '#7B605C', (effectiveDamage - 0.25) / 0.40);
    }
    return lerpColor('#7B605C', '#3B302F', (effectiveDamage - 0.65) / 0.35);
  }, [effectiveDamage]);

  const bronchiColor = useMemo(() => {
    if (effectiveDamage <= 0.22) {
      return lerpColor('#FB929E', '#EF4444', effectiveDamage / 0.22);
    }
    return lerpColor('#EF4444', '#382B2B', (effectiveDamage - 0.22) / 0.78);
  }, [effectiveDamage]);

  // Breathing transform math (extra expansion while puffing)
  const maxExpansion = lerp(0.056, 0.017, effectiveDamage);
  const puffBoost = isPuffing ? 0.032 : 0;
  const lungScale = 1 + breathPhase * maxExpansion + puffBoost;
  const diaphragmOffsetY = breathPhase * lerp(8.5, 2.2, effectiveDamage) + (isPuffing ? 4.5 : 0);
  const navelOffsetY = breathPhase * lerp(2.6, 0.7, effectiveDamage) + (isPuffing ? 1.5 : 0);

  const selectedHotspot =
    ANATOMICAL_HOTSPOTS.find((h) => h.id === selectedHotspotId) ?? ANATOMICAL_HOTSPOTS[0];

  const toneBadgeColor =
    metrics.stageTone === 'nominal'
      ? 'text-emerald-400'
      : metrics.stageTone === 'caution'
      ? 'text-amber-300'
      : metrics.stageTone === 'warning'
      ? 'text-orange-400'
      : 'text-rose-400';

  return (
    <div className="flex flex-col justify-between h-full bg-[#0C121D] border border-slate-800/90 rounded-xl p-5 gap-4">
      {/* Top Viewport Header & Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-semibold ${toneBadgeColor}`}>
              {metrics.stageGlyph} {metrics.stageLabel}
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono-tabular">
              분당 호흡 {metrics.breathsPerMinute.toFixed(0)}회 · 탄성 {metrics.lungElasticityPct.toFixed(0)}%
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-300">{metrics.stageSummary}</p>
        </div>

        {/* Interactive Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-[#070B13] p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setShowRibs((v) => !v)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showRibs
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>흉곽 가이드</span>
          </button>
          <button
            type="button"
            onClick={() => setHighlightTar((v) => !v)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              highlightTar
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>타르 강조</span>
          </button>
        </div>
      </div>

      {/* Main Anatomical Torso Stage (Chin/Mouth down to Belly Button) */}
      <div className="relative flex-1 min-h-[460px] flex items-center justify-center bg-[#060911] border border-slate-800/80 rounded-lg overflow-hidden">
        {/* Subtle clinical coordinate grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Recovery Mode Active Indicator */}
        {recoveryFactor > 0 && (
          <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-xs font-medium text-emerald-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>금연 회복 시뮬레이션 적용 중 ({Math.round(recoveryFactor * 100)}% 정화)</span>
          </div>
        )}

        {/* Active Puffing Indicator */}
        {isPuffing && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-md bg-slate-900/95 border border-sky-500/40 text-xs font-medium text-sky-300">
            {capsuleEnabled ? '아이스 캡슐 연기 깊은 흡입 중' : '연기 기관지 · 폐포 유입 중'}
          </div>
        )}

        <div className="relative w-full max-w-[420px] aspect-[420/520]">
          <svg
            viewBox="0 0 420 520"
            className="w-full h-full select-none"
            role="img"
            aria-label="입·목부터 배꼽까지 보이는 반투명 상반신 및 실시간 폐 변화 시각화"
          >
            <defs>
              <linearGradient id="torsoGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.16" />
                <stop offset="45%" stopColor="#64748B" stopOpacity="0.09" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.14" />
              </linearGradient>

              <radialGradient id="lungSurface" cx="45%" cy="40%" r="65%">
                <stop offset="0%" stopColor={lungHighlightColor} stopOpacity="0.95" />
                <stop offset="68%" stopColor={lungBaseColor} stopOpacity="0.92" />
                <stop offset="100%" stopColor="#120E10" stopOpacity="0.95" />
              </radialGradient>

              <filter id="tarBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.8" />
              </filter>

              <filter id="lungGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id="rightLungClip">
                <path d="M196 142 C178 140 156 154 140 182 C125 210 116 250 118 286 C120 302 136 308 156 302 C175 296 190 292 197 294 C200 264 198 188 196 142 Z" />
              </clipPath>
              <clipPath id="leftLungClip">
                <path d="M224 142 C242 140 264 154 280 182 C295 210 304 250 302 286 C300 302 284 308 264 302 C245 296 234 288 228 284 C236 270 238 250 227 236 C222 212 223 172 224 142 Z" />
              </clipPath>
            </defs>

            {/* 1. TRANSLUCENT HUMAN UPPER BODY (Mouth/Chin -> Neck -> Shoulders -> Ribcage -> Belly Button / Navel) */}
            <g>
              {/* Lower face / jawline & mouth intake contour */}
              <path
                d="M172 8 C172 34 185 56 210 56 C235 56 248 34 248 8"
                fill="url(#torsoGlass)"
                stroke="#64748B"
                strokeOpacity="0.5"
                strokeWidth="1.5"
              />
              {/* Mouth / Lip line */}
              <path
                d="M198 34 Q210 37 222 34"
                fill="none"
                stroke="#94A3B8"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Main Torso Silhouette down to below belly button */}
              <path
                d="M184 52
                   L182 82
                   C155 92 104 104 82 126
                   C64 144 58 186 58 232
                   L54 335
                   L84 338
                   L94 214
                   C96 250 100 288 108 326
                   C114 356 114 398 104 452
                   L100 502
                   L320 502
                   L316 452
                   C306 398 306 356 312 326
                   C320 288 324 250 326 214
                   L336 338
                   L366 335
                   L362 232
                   C362 186 356 144 338 126
                   C316 104 265 92 238 82
                   L236 52"
                fill="url(#torsoGlass)"
                stroke="#475569"
                strokeOpacity="0.65"
                strokeWidth="1.5"
              />

              {/* Lit Slim Cigarette Held at Mouth during lit / puffing state */}
              {(ritualStage === 'lit' || ritualStage === 'puffing') && (
                <g
                  transform={
                    isPuffing ? 'translate(0, 0)' : 'translate(-12, 6) rotate(8 202 36)'
                  }
                  className="transition-transform duration-200"
                >
                  {/* Slim cigarette angled from mouth (202, 35) outward to left */}
                  <line
                    x1="146"
                    y1="44"
                    x2="202"
                    y2="35"
                    stroke="#E2E8F0"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  {/* Filter near mouth */}
                  <line
                    x1="186"
                    y1="37.5"
                    x2="202"
                    y2="35"
                    stroke={
                      capsuleEnabled
                        ? activeBrand.capsuleColorHex
                        : activeBrand.id === 'marlboro-red'
                        ? '#D97706'
                        : '#CBD5E1'
                    }
                    strokeWidth="4.4"
                    strokeLinecap="round"
                  />
                  {/* Glowing ember tip */}
                  <circle
                    cx="145"
                    cy="44"
                    r={isPuffing ? 4.2 : 2.8}
                    fill={isPuffing ? '#FB923C' : '#EA580C'}
                    opacity={isPuffing ? 1 : 0.8}
                  />
                </g>
              )}

              {/* Clavicle (Collarbones) */}
              <path
                d="M126 114 Q165 104 202 114 M294 114 Q255 104 218 114"
                fill="none"
                stroke="#64748B"
                strokeOpacity="0.4"
                strokeWidth="1.4"
                strokeLinecap="round"
              />

              {/* Abdominal linea alba & waist contour */}
              <path
                d="M210 318 L210 434"
                stroke="#475569"
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <path
                d="M150 358 Q175 376 184 422 M270 358 Q245 376 236 422"
                fill="none"
                stroke="#475569"
                strokeOpacity="0.24"
                strokeWidth="1.2"
              />

              {/* EXPLICIT NAVEL / BELLY BUTTON (배꼽) */}
              <g transform={`translate(0, ${navelOffsetY.toFixed(2)})`}>
                <ellipse
                  cx="210"
                  cy="446"
                  rx="7.5"
                  ry="9.5"
                  fill="#070B13"
                  fillOpacity="0.85"
                  stroke="#64748B"
                  strokeOpacity="0.65"
                  strokeWidth="1.3"
                />
                <path
                  d="M206 443 Q210 439 214 443"
                  fill="none"
                  stroke="#94A3B8"
                  strokeOpacity="0.5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="210" cy="447" r="2.2" fill="#334155" />
                <line x1="222" y1="446" x2="262" y2="446" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                <text x="266" y="450" fill="#94A3B8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  배꼽 (NAVEL)
                </text>
              </g>
            </g>

            {/* 2. DIAPHRAGM */}
            <g transform={`translate(0, ${diaphragmOffsetY.toFixed(2)})`}>
              <path
                d="M114 316 Q162 292 210 308 Q258 292 306 316"
                fill="none"
                stroke={metrics.stageLevel >= 3 ? '#F59E0B' : '#38BDF8'}
                strokeOpacity={0.55}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M116 322 Q162 300 210 314 Q258 300 304 322"
                fill="none"
                stroke="#64748B"
                strokeOpacity="0.25"
                strokeWidth="1.2"
              />
            </g>

            {/* 3. PHARYNX & TRACHEA */}
            <g>
              <path
                d="M204 42 L203 166 M216 42 L217 166"
                stroke={bronchiColor}
                strokeWidth="2.0"
                strokeOpacity="0.75"
              />
              <rect
                x="204"
                y="64"
                width="12"
                height="102"
                fill={bronchiColor}
                fillOpacity="0.16"
              />
              {[76, 86, 96, 106, 116, 126, 136, 146, 156].map((ry) => (
                <line
                  key={ry}
                  x1="203"
                  y1={ry}
                  x2="217"
                  y2={ry}
                  stroke="#CBD5E1"
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                />
              ))}
            </g>

            {/* 4. BREATHING LUNGS + BRONCHIAL TREE + TAR DEPOSITS */}
            <g
              transform={`translate(210, 224) scale(${lungScale.toFixed(4)}) translate(-210, -224)`}
            >
              <path
                d="M196 142 C178 140 156 154 140 182 C125 210 116 250 118 286 C120 302 136 308 156 302 C175 296 190 292 197 294 C200 264 198 188 196 142 Z"
                fill="url(#lungSurface)"
                stroke={lungHighlightColor}
                strokeOpacity="0.55"
                strokeWidth="1.6"
                filter={metrics.stageLevel === 0 ? 'url(#lungGlow)' : undefined}
              />

              <path
                d="M224 142 C242 140 264 154 280 182 C295 210 304 250 302 286 C300 302 284 308 264 302 C245 296 234 288 228 284 C236 270 238 250 227 236 C222 212 223 172 224 142 Z"
                fill="url(#lungSurface)"
                stroke={lungHighlightColor}
                strokeOpacity="0.55"
                strokeWidth="1.6"
                filter={metrics.stageLevel === 0 ? 'url(#lungGlow)' : undefined}
              />

              {/* Lobe fissure lines */}
              <path
                d="M126 226 Q160 222 196 238 M132 264 Q165 256 196 266"
                fill="none"
                stroke="#0F172A"
                strokeOpacity="0.28"
                strokeWidth="1.2"
              />
              <path
                d="M294 228 Q260 224 224 240"
                fill="none"
                stroke="#0F172A"
                strokeOpacity="0.28"
                strokeWidth="1.2"
              />

              {/* Bronchial Vascular Tree */}
              <g fill="none" stroke={bronchiColor} strokeLinecap="round" strokeOpacity={0.78}>
                <path d="M210 164 L182 186 L158 176" strokeWidth="3.2" />
                <path d="M182 186 L160 218 L142 232" strokeWidth="2.4" />
                <path d="M160 218 L174 256 L164 280" strokeWidth="1.8" />
                <path d="M182 186 L146 200 L132 212" strokeWidth="1.6" />
                <path d="M160 218 L144 264 L134 282" strokeWidth="1.5" />

                <path d="M210 164 L238 188 L262 178" strokeWidth="3.2" />
                <path d="M238 188 L262 220 L280 236" strokeWidth="2.4" />
                <path d="M262 220 L248 258 L258 282" strokeWidth="1.8" />
                <path d="M238 188 L272 202 L286 214" strokeWidth="1.6" />
                <path d="M262 220 L278 266 L288 284" strokeWidth="1.5" />
              </g>

              {/* Realistic Tar Deposition Spots unlocked progressively across 0..10 years */}
              <g clipPath="url(#rightLungClip)" filter="url(#tarBlur)">
                {TAR_DEPOSIT_SPOTS.filter((s) => s.side === 'right').map((spot) => {
                  const progress = Math.max(
                    0,
                    Math.min(1, (effectiveDamage - spot.unlockAtDamage) / 0.14)
                  );
                  if (progress <= 0) return null;
                  const r = spot.baseRadius * (0.4 + progress * 0.72);
                  return (
                    <ellipse
                      key={spot.id}
                      cx={spot.cx}
                      cy={spot.cy}
                      rx={r * 1.15}
                      ry={r * 0.85}
                      transform={`rotate(${spot.rotation} ${spot.cx} ${spot.cy})`}
                      fill={highlightTar ? '#F59E0B' : '#0D0A0B'}
                      fillOpacity={highlightTar ? progress * 0.85 : progress * 0.78}
                    />
                  );
                })}
              </g>

              <g clipPath="url(#leftLungClip)" filter="url(#tarBlur)">
                {TAR_DEPOSIT_SPOTS.filter((s) => s.side === 'left').map((spot) => {
                  const progress = Math.max(
                    0,
                    Math.min(1, (effectiveDamage - spot.unlockAtDamage) / 0.14)
                  );
                  if (progress <= 0) return null;
                  const r = spot.baseRadius * (0.4 + progress * 0.72);
                  return (
                    <ellipse
                      key={spot.id}
                      cx={spot.cx}
                      cy={spot.cy}
                      rx={r * 1.15}
                      ry={r * 0.85}
                      transform={`rotate(${spot.rotation} ${spot.cx} ${spot.cy})`}
                      fill={highlightTar ? '#F59E0B' : '#0D0A0B'}
                      fillOpacity={highlightTar ? progress * 0.85 : progress * 0.78}
                    />
                  );
                })}
              </g>
            </g>

            {/* 5. OPTIONAL RIBCAGE TRANSPARENT X-RAY OVERLAY */}
            {showRibs && (
              <g
                fill="none"
                stroke="#94A3B8"
                strokeOpacity="0.22"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="pointer-events-none"
              >
                <line x1="210" y1="122" x2="210" y2="262" strokeWidth="3" strokeOpacity="0.16" />
                {[142, 166, 192, 220, 248, 276].map((ry, idx) => {
                  const spread = 56 + idx * 8;
                  return (
                    <g key={ry}>
                      <path d={`M206 ${ry} Q${206 - spread * 0.65} ${ry - 10} ${206 - spread} ${ry + 18}`} />
                      <path d={`M214 ${ry} Q${214 + spread * 0.65} ${ry - 10} ${214 + spread} ${ry + 18}`} />
                    </g>
                  );
                })}
              </g>
            )}

            {/* 6. INTERACTIVE ANATOMICAL HOTSPOTS */}
            {ANATOMICAL_HOTSPOTS.map((spot) => {
              const isSelected = spot.id === selectedHotspotId;
              return (
                <g
                  key={spot.id}
                  onClick={() => setSelectedHotspotId(spot.id)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${spot.title} 상태 보기`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedHotspotId(spot.id);
                    }
                  }}
                >
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={isSelected ? 12 : 9}
                    fill={isSelected ? '#38BDF8' : '#0F172A'}
                    fillOpacity={isSelected ? 0.25 : 0.7}
                    stroke={isSelected ? '#38BDF8' : '#94A3B8'}
                    strokeWidth={isSelected ? 1.8 : 1.1}
                  />
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={3.2}
                    fill={isSelected ? '#38BDF8' : '#E2E8F0'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Smoke & Cooling Mist Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={420}
            height={520}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>
      </div>

      {/* Selected Anatomical Region Callout */}
      <div className="bg-[#070B13] border border-slate-800/80 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>{selectedHotspot.title}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400">{selectedHotspot.subtitle}</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-200 leading-relaxed">
            {selectedHotspot.getDescription(metrics, recoveryFactor, activeBrand)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          {ANATOMICAL_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => setSelectedHotspotId(spot.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                spot.id === selectedHotspotId
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              {spot.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
