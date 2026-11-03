import React, { useState } from 'react';
import {
  VehicleGrade,
  VEHICLE_GRADES,
  ProductionCondition,
  ProcessItem,
  ProductionAnalysisResult,
} from '../types';
import {
  runProductionSimulation,
  calculateGradeRatios,
} from '../utils/calculations';
import { PRESET_SCENARIOS, TEST_SUITE_PRESETS } from '../data/mockData';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Copy,
} from 'lucide-react';

interface SimulationCompareViewProps {
  baselineCondition: ProductionCondition;
  baselineQuantities: Record<VehicleGrade, number>;
  processes: ProcessItem[];
  onApplyToCurrent: (
    quantities: Record<VehicleGrade, number>,
    condition?: ProductionCondition
  ) => void;
}

export const SimulationCompareView: React.FC<SimulationCompareViewProps> = ({
  baselineCondition,
  baselineQuantities,
  processes,
  onApplyToCurrent,
}) => {
  // What-If scenario states
  const [whatIfCondition, setWhatIfCondition] = useState<ProductionCondition>({
    ...baselineCondition,
  });
  const [whatIfQuantities, setWhatIfQuantities] = useState<Record<VehicleGrade, number>>({
    Basic: 100,
    Classic: 150,
    Premium: 150,
    Special: 100, // Scenario B default
  });

  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  // Run simulation for both
  const baselineResult = runProductionSimulation(baselineCondition, baselineQuantities, processes);
  const whatIfResult = runProductionSimulation(whatIfCondition, whatIfQuantities, processes);

  const baselineRatios = calculateGradeRatios(baselineQuantities).ratios;
  const whatIfRatios = calculateGradeRatios(whatIfQuantities).ratios;

  // Handlers
  const handleQuantityChange = (grade: VehicleGrade, val: number) => {
    setActiveTestId(null);
    setWhatIfQuantities({
      ...whatIfQuantities,
      [grade]: Math.max(0, val),
    });
  };

  const handleApplyPreset = (scenarioId: string) => {
    setActiveTestId(null);
    const found = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (found) {
      setWhatIfQuantities({ ...found.gradeQuantities });
    }
  };

  const handleApplyTestSuite = (testId: string) => {
    const test = TEST_SUITE_PRESETS.find((t) => t.id === testId);
    if (!test) return;

    setActiveTestId(test.id);

    if (test.gradeQuantities) {
      setWhatIfQuantities({ ...test.gradeQuantities });
    } else {
      setWhatIfQuantities({ ...baselineQuantities });
    }

    if (test.conditionPatch) {
      setWhatIfCondition({
        ...baselineCondition,
        ...test.conditionPatch,
      });
    } else {
      setWhatIfCondition({ ...baselineCondition });
    }
  };

  const handleResetToBaseline = () => {
    setActiveTestId(null);
    setWhatIfCondition({ ...baselineCondition });
    setWhatIfQuantities({ ...baselineQuantities });
  };

  const handleCommitToCurrent = () => {
    onApplyToCurrent(whatIfQuantities, whatIfCondition);
  };

  // Deltas
  const deltaTaktTime = whatIfResult.targetTaktTime - baselineResult.targetTaktTime;
  const deltaLineCT = whatIfResult.lineCT - baselineResult.lineCT;
  const deltaCapacity = whatIfResult.expectedCapacityUnits - baselineResult.expectedCapacityUnits;
  const deltaBottlenecks = whatIfResult.bottleneckProcesses.length - baselineResult.bottleneckProcesses.length;

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                생산계획 What-If 시뮬레이션 및 비교 분석 (STEP 8 & Section 10)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              차량 등급별 생산 대수 및 생산 조건을 변경하여 기존 기준 계획(Baseline)과 실시간 나란히 비교합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToBaseline}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기준 계획과 동일하게 맞춤</span>
            </button>
            <button
              onClick={handleCommitToCurrent}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>현재 변경 계획을 실제 적용</span>
            </button>
          </div>
        </div>

        {/* Section 11-2 Test Suite Quick Runner Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-800">
              📋 기획서 11-2 테스트 시나리오 원클릭 검증:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {TEST_SUITE_PRESETS.map((test) => {
              const isActive = activeTestId === test.id;
              return (
                <button
                  key={test.id}
                  onClick={() => handleApplyTestSuite(test.id)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-200'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="truncate">{test.name.split('.')[0]}</span>
                    <Play className={`w-3 h-3 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {test.name.split('.')[1]}
                  </div>
                </button>
              );
            })}
          </div>

          {activeTestId && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-purple-50/60 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
              <span className="font-bold shrink-0">기획서 검증 기대 결과:</span>
              <span>{TEST_SUITE_PRESETS.find((t) => t.id === activeTestId)?.expectedOutcome}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delta KPI Comparison Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Delta Takt Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">목표 Takt Time 변화</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {whatIfResult.targetTaktTime.toFixed(1)}초
            </span>
            <span
              className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                deltaTaktTime > 0
                  ? 'text-emerald-600'
                  : deltaTaktTime < 0
                  ? 'text-rose-600'
                  : 'text-slate-400'
              }`}
            >
              {deltaTaktTime > 0 ? `+${deltaTaktTime.toFixed(1)}s` : `${deltaTaktTime.toFixed(1)}s`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            기존: {baselineResult.targetTaktTime.toFixed(1)}초
          </span>
        </div>

        {/* Delta Line CT */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">라인 최고 CT 변화</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {whatIfResult.lineCT.toFixed(1)}초
            </span>
            <span
              className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                deltaLineCT > 0
                  ? 'text-rose-600'
                  : deltaLineCT < 0
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              {deltaLineCT > 0 ? `+${deltaLineCT.toFixed(1)}s` : `${deltaLineCT.toFixed(1)}s`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            기존: {baselineResult.lineCT.toFixed(1)}초
          </span>
        </div>

        {/* Delta Bottleneck Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">병목 위험 공정 수</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {whatIfResult.bottleneckProcesses.length}개 공정
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                deltaBottlenecks > 0
                  ? 'text-rose-600'
                  : deltaBottlenecks < 0
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              {deltaBottlenecks > 0 ? `+${deltaBottlenecks}개 증가` : deltaBottlenecks < 0 ? `${deltaBottlenecks}개 감소` : '변동없음'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            기존: {baselineResult.bottleneckProcesses.length}개 공정
          </span>
        </div>

        {/* Delta Expected Capacity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">예상 일일 생산능력</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              약 {whatIfResult.expectedCapacityUnits}대
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                deltaCapacity > 0
                  ? 'text-emerald-600'
                  : deltaCapacity < 0
                  ? 'text-rose-600'
                  : 'text-slate-400'
              }`}
            >
              {deltaCapacity > 0 ? `+${deltaCapacity}대` : `${deltaCapacity}대`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            기존: 약 {baselineResult.expectedCapacityUnits}대
          </span>
        </div>
      </div>

      {/* Side-by-Side Plan Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan 1: Baseline (Locked View) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                PLAN 1 (기준 계획)
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">기존 생산계획 (Baseline)</h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              총 {baselineResult.totalPlannedUnits}대
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {VEHICLE_GRADES.map((grade) => (
              <div key={grade} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="font-semibold">{grade}</span>
                  <span className="font-mono">{baselineRatios[grade]}%</span>
                </div>
                <div className="text-base font-mono font-bold text-slate-900">
                  {baselineQuantities[grade]}대
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>목표: {baselineCondition.dailyTarget}대 / 가용: {baselineResult.availableMinutes}분</span>
            <span className="font-bold text-slate-900">Takt Time {baselineResult.targetTaktTime}s</span>
          </div>
        </div>

        {/* Plan 2: What-If Scenario (Interactive Controls) */}
        <div className="bg-white rounded-xl border-2 border-purple-300 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                PLAN 2 (변경 시나리오)
              </span>
              <h4 className="text-sm font-bold text-purple-900 mt-1">What-If 가상 시뮬레이션</h4>
            </div>

            <div className="flex items-center gap-1 text-xs">
              {PRESET_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleApplyPreset(sc.id)}
                  className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 font-semibold"
                >
                  {sc.name.split(' ')[0]} {sc.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {VEHICLE_GRADES.map((grade) => (
              <div key={grade} className="p-2.5 rounded-lg bg-purple-50/40 border border-purple-200">
                <div className="flex justify-between text-purple-900 mb-1">
                  <span className="font-semibold">{grade}</span>
                  <span className="font-mono font-bold">{whatIfRatios[grade]}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={whatIfQuantities[grade] || ''}
                  onChange={(e) => handleQuantityChange(grade, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm font-mono font-bold bg-white border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 outline-hidden tabular-nums"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 text-xs text-purple-900 flex justify-between">
            <span>총 {whatIfResult.totalPlannedUnits}대 (목표 {whatIfCondition.dailyTarget}대)</span>
            <span className="font-bold">Takt Time {whatIfResult.targetTaktTime}s</span>
          </div>
        </div>
      </div>

      {/* Process-by-Process CT and Load Rate Delta Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900">
            공정별 평균 CT 및 부하율 비교표 (Baseline vs What-If)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            차량 등급 믹스 변경에 따른 각 공정별 가중평균 CT 및 병목 상태의 실시간 변화
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">공정명</th>
                <th className="py-2.5 px-4 text-right">기준 CT</th>
                <th className="py-2.5 px-4 text-right">변경 CT</th>
                <th className="py-2.5 px-4 text-right">CT 변동 (Δ)</th>
                <th className="py-2.5 px-4 text-right">기준 부하율</th>
                <th className="py-2.5 px-4 text-right">변경 부하율</th>
                <th className="py-2.5 px-4 text-center">기준 상태</th>
                <th className="py-2.5 px-4 text-center">변경 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {processes.map((proc) => {
                const bProc = baselineResult.processAnalyses.find((p) => p.processId === proc.id);
                const wProc = whatIfResult.processAnalyses.find((p) => p.processId === proc.id);

                if (!bProc || !wProc) return null;

                const deltaCT = wProc.weightedAvgCT - bProc.weightedAvgCT;
                const deltaLoad = wProc.loadRate - bProc.loadRate;

                const statusColor = (st: string) => {
                  if (st === 'BOTTLENECK') return 'text-rose-700 bg-rose-50 border-rose-200';
                  if (st === 'WARNING') return 'text-amber-700 bg-amber-50 border-amber-200';
                  return 'text-emerald-700 bg-emerald-50 border-emerald-200';
                };

                const statusLabel = (st: string) => {
                  if (st === 'BOTTLENECK') return '병목 위험';
                  if (st === 'WARNING') return '주의';
                  return '정상';
                };

                return (
                  <tr key={proc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{proc.order}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{proc.name}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{bProc.weightedAvgCT.toFixed(1)}s</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-900 tabular-nums">
                      {wProc.weightedAvgCT.toFixed(1)}s
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {deltaCT > 0 ? (
                        <span className="text-rose-600">+{deltaCT.toFixed(1)}s</span>
                      ) : deltaCT < 0 ? (
                        <span className="text-emerald-600">{deltaCT.toFixed(1)}s</span>
                      ) : (
                        <span className="text-slate-400">0.0s</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{bProc.loadRate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {wProc.loadRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${statusColor(bProc.status)}`}>
                        {statusLabel(bProc.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${statusColor(wProc.status)}`}>
                        {statusLabel(wProc.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
