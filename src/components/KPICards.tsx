import React from 'react';
import {
  Target,
  Clock,
  Zap,
  AlertOctagon,
  TrendingDown,
  Timer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ProductionAnalysisResult } from '../types';

interface KPICardsProps {
  analysis: ProductionAnalysisResult;
  onOpenConditions: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ analysis, onOpenConditions }) => {
  const {
    dailyTarget,
    totalPlannedUnits,
    targetTaktTime,
    lineCT,
    bottleneckProcesses,
    warningProcesses,
    expectedCapacityUnits,
    capacityAchievementRate,
    availableMinutes,
    targetDiscrepancy,
    isValid,
  } = analysis;

  const primaryBottleneck = bottleneckProcesses.length > 0
    ? bottleneckProcesses.reduce((prev, curr) => (curr.weightedAvgCT > prev.weightedAvgCT ? curr : prev))
    : null;

  const excessTime = primaryBottleneck ? primaryBottleneck.excessTime : (lineCT - targetTaktTime);
  const capacityShortfall = dailyTarget - expectedCapacityUnits;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. 일일 생산 목표 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">일일 생산 목표</span>
          <Target className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {dailyTarget.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">대/일</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {targetDiscrepancy === 0 ? (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                계획 일치 ({totalPlannedUnits}대)
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3" />
                계획 {totalPlannedUnits}대 ({targetDiscrepancy > 0 ? `+${targetDiscrepancy}` : targetDiscrepancy}대)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 목표 Takt Time */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">목표 Takt Time</span>
          <Clock className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {isValid ? targetTaktTime.toFixed(1) : '-'}
            </span>
            <span className="text-xs text-slate-500 font-medium">초/대</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>가용 {availableMinutes}분</span>
            <button
              onClick={onOpenConditions}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline text-[11px]"
            >
              조건 변경
            </button>
          </div>
        </div>
      </div>

      {/* 3. 최대 공정 CT (라인 속도 제약) */}
      <div className={`bg-white rounded-xl border p-4 flex flex-col justify-between shadow-2xs transition-colors ${
        lineCT > targetTaktTime ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">라인 최고 CT</span>
          <Zap className={`w-4 h-4 ${lineCT > targetTaktTime ? 'text-rose-600' : 'text-amber-600'}`} />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold tabular-nums ${
              lineCT > targetTaktTime ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {isValid ? lineCT.toFixed(1) : '-'}
            </span>
            <span className="text-xs text-slate-500 font-medium">초/대</span>
          </div>
          <div className="mt-1 text-xs flex items-center justify-between">
            <span className="text-slate-500 truncate max-w-[100px]" title={primaryBottleneck?.processName || '해당 없음'}>
              {primaryBottleneck?.processName || '정상 밸런싱'}
            </span>
            <span className={`font-mono text-[11px] font-semibold ${
              excessTime > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {excessTime > 0 ? `+${excessTime.toFixed(1)}s` : `${excessTime.toFixed(1)}s`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. 병목 위험 공정 */}
      <div className={`bg-white rounded-xl border p-4 flex flex-col justify-between shadow-2xs transition-colors ${
        bottleneckProcesses.length > 0
          ? 'border-rose-300 bg-rose-50/40'
          : warningProcesses.length > 0
          ? 'border-amber-200 bg-amber-50/30'
          : 'border-emerald-200 bg-emerald-50/30'
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">병목 위험 공정</span>
          <AlertOctagon className={`w-4 h-4 ${
            bottleneckProcesses.length > 0
              ? 'text-rose-600'
              : warningProcesses.length > 0
              ? 'text-amber-600'
              : 'text-emerald-600'
          }`} />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold tabular-nums ${
              bottleneckProcesses.length > 0
                ? 'text-rose-700'
                : warningProcesses.length > 0
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}>
              {bottleneckProcesses.length > 0
                ? `${bottleneckProcesses.length}개 공정`
                : warningProcesses.length > 0
                ? `${warningProcesses.length}개 주의`
                : '0개 (정상)'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-600 truncate font-medium">
            {bottleneckProcesses.length > 0
              ? bottleneckProcesses.map((b) => b.processName).join(', ')
              : warningProcesses.length > 0
              ? '주의 구간 집중 모니터링'
              : '전 공정 작업 여유 확보'}
          </div>
        </div>
      </div>

      {/* 5. 예상 생산 가능 대수 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">예상 생산 가능 대수</span>
          <TrendingDown className={`w-4 h-4 ${capacityShortfall > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              약 {expectedCapacityUnits.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">대</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">달성률 {capacityAchievementRate.toFixed(1)}%</span>
            <span className={`font-mono text-[11px] font-semibold ${
              capacityShortfall > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {capacityShortfall > 0 ? `-${capacityShortfall}대` : '목표 달성'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. 가용 생산시간 요약 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">가용 생산시간</span>
          <Timer className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {availableMinutes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">분</span>
            <span className="text-xs text-slate-400 tabular-nums">({(analysis.availableSeconds).toLocaleString()}초)</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            총 480분 중 휴식·비가동 80분 차감
          </div>
        </div>
      </div>
    </div>
  );
};
