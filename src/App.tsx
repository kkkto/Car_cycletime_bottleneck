import React, { useState, useEffect } from 'react';
import {
  ProductionCondition,
  VehicleGrade,
  VehicleOption,
  ProcessItem,
} from './types';
import {
  INITIAL_PRODUCTION_CONDITION,
  INITIAL_GRADE_QUANTITIES,
  INITIAL_VEHICLE_OPTIONS,
  INITIAL_PROCESSES,
  PRESET_SCENARIOS,
} from './data/mockData';
import { runProductionSimulation } from './utils/calculations';
import { exportAnalysisToCSV } from './utils/exportCsv';

import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { ProcessCTChart } from './components/ProcessCTChart';
import { ProcessAnalysisTable } from './components/ProcessAnalysisTable';
import { RuleBasedAdvisor } from './components/RuleBasedAdvisor';
import { ProductionConditionsCard } from './components/ProductionConditionsCard';
import { GradeProductionManager } from './components/GradeProductionManager';
import { ProcessCTEditor } from './components/ProcessCTEditor';
import { OptionMatrixView } from './components/OptionMatrixView';
import { SimulationCompareView } from './components/SimulationCompareView';
import { VeteranReviewModal } from './components/VeteranReviewModal';

import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Main states initialized with spec mock data or saved local storage
  const [condition, setCondition] = useState<ProductionCondition>(() => {
    const saved = localStorage.getItem('tb_condition');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_CONDITION;
  });

  const [gradeQuantities, setGradeQuantities] = useState<Record<VehicleGrade, number>>(() => {
    const saved = localStorage.getItem('tb_quantities');
    return saved ? JSON.parse(saved) : INITIAL_GRADE_QUANTITIES;
  });

  const [options, setOptions] = useState<VehicleOption[]>(() => {
    const saved = localStorage.getItem('tb_options');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_OPTIONS;
  });

  const [processes, setProcesses] = useState<ProcessItem[]>(() => {
    const saved = localStorage.getItem('tb_processes');
    return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'processes' | 'grades' | 'simulation' | 'review'
  >('dashboard');

  const [warningThreshold, setWarningThreshold] = useState<number>(90);
  const [bottleneckThreshold, setBottleneckThreshold] = useState<number>(100);
  const [showThresholdSettings, setShowThresholdSettings] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('tb_condition', JSON.stringify(condition));
  }, [condition]);

  useEffect(() => {
    localStorage.setItem('tb_quantities', JSON.stringify(gradeQuantities));
  }, [gradeQuantities]);

  useEffect(() => {
    localStorage.setItem('tb_options', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem('tb_processes', JSON.stringify(processes));
  }, [processes]);

  // Reactive Simulation Pipeline
  const analysis = runProductionSimulation(
    condition,
    gradeQuantities,
    processes,
    { warning: warningThreshold, bottleneck: bottleneckThreshold }
  );

  // Handlers
  const handleResetToSpecMock = () => {
    if (window.confirm('기획서에 명시된 기본 목업 데이터(500대, 400분 가용, 5개 공정)로 복원하시겠습니까?')) {
      setCondition({ ...INITIAL_PRODUCTION_CONDITION });
      setGradeQuantities({ ...INITIAL_GRADE_QUANTITIES });
      setOptions([...INITIAL_VEHICLE_OPTIONS]);
      setProcesses([...INITIAL_PROCESSES]);
      setWarningThreshold(90);
      setBottleneckThreshold(100);
    }
  };

  const handleApplyScenario = (scenarioId: string) => {
    const sc = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (sc) {
      setGradeQuantities({ ...sc.gradeQuantities });
    }
  };

  const handleToggleOption = (optionId: string, grade: VehicleGrade) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id !== optionId) return opt;
        return {
          ...opt,
          gradeApplied: {
            ...opt.gradeApplied,
            [grade]: !opt.gradeApplied[grade],
          },
        };
      })
    );
  };

  const handleApplySimulationWhatIf = (
    newQuantities: Record<VehicleGrade, number>,
    newCondition?: ProductionCondition
  ) => {
    setGradeQuantities({ ...newQuantities });
    if (newCondition) {
      setCondition({ ...newCondition });
    }
    setActiveTab('dashboard');
  };

  const handleExportCSV = () => {
    exportAnalysisToCSV(analysis, processes, options);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Contract Compliant Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleResetToSpecMock}
        onExportCSV={handleExportCSV}
        bottleneckCount={analysis.bottleneckProcesses.length}
        hasDiscrepancy={analysis.targetDiscrepancy !== 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Discrepancy Warning Alert if Sum != Daily Target */}
        {analysis.targetDiscrepancy !== 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>[생산계획 경고]</strong> 입력된 등급별 총 생산 대수(
                <strong>{analysis.totalPlannedUnits}대</strong>)가 일일 생산 목표(
                <strong>{condition.dailyTarget}대</strong>)와{' '}
                {analysis.targetDiscrepancy > 0
                  ? `${analysis.targetDiscrepancy}대 초과`
                  : `${Math.abs(analysis.targetDiscrepancy)}대 미달`}
                되었습니다.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('grades')}
              className="underline font-bold text-amber-800 hover:text-amber-950 shrink-0"
            >
              대수 수정하기
            </button>
          </div>
        )}

        {/* Threshold Settings Accordion Toggle (Subtle Industrial Utility) */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">자동차 의장공정 순차 라인 시뮬레이터</span>
            <span>·</span>
            <span className="font-mono">TOC 제약이론 기반 병목 자동 감지</span>
          </div>
          <button
            onClick={() => setShowThresholdSettings(!showThresholdSettings)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>부하율 판정 기준 설정 ({warningThreshold}% / {bottleneckThreshold}%)</span>
          </button>
        </div>

        {showThresholdSettings && (
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-6 text-xs animate-in fade-in duration-150">
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                기획서 8-3 병목 위험도 기준 임계값 조절:
              </span>
              <span className="text-slate-500">
                기본값: 정상 &lt; 90%, 주의 90%~100%, 병목 위험 &gt; 100%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-700">주의 임계값 (%):</label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value) || 90)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-700">병목 임계값 (%):</label>
                <input
                  type="number"
                  min="100"
                  max="150"
                  value={bottleneckThreshold}
                  onChange={(e) => setBottleneckThreshold(Number(e.target.value) || 100)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold text-rose-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: 종합 대시보드 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Core KPI Cards [Section 9-1] */}
            <KPICards
              analysis={analysis}
              onOpenConditions={() => setActiveTab('grades')}
            />

            {/* Quick Production Condition Editor Row */}
            <ProductionConditionsCard
              condition={condition}
              onChange={setCondition}
              onReset={() => setCondition({ ...INITIAL_PRODUCTION_CONDITION })}
            />

            {/* Visual Process CT Comparison Bar Chart with Takt Time Guideline [Section 9-2] */}
            <ProcessCTChart
              analyses={analysis.processAnalyses}
              targetTaktTime={analysis.targetTaktTime}
              lineCT={analysis.lineCT}
              onSelectProcess={() => setActiveTab('processes')}
            />

            {/* Process Analysis Table [Section 9-3] */}
            <ProcessAnalysisTable
              analyses={analysis.processAnalyses}
              targetTaktTime={analysis.targetTaktTime}
              onEditProcess={() => setActiveTab('processes')}
            />

            {/* Rule-based Diagnostic Advisor & Management Recommendations [Section 9-4] */}
            <RuleBasedAdvisor
              summary={analysis.ruleBasedSummary}
              primaryBottleneck={
                analysis.bottleneckProcesses.length > 0
                  ? analysis.bottleneckProcesses.reduce((p, c) =>
                      c.weightedAvgCT > p.weightedAvgCT ? c : p
                    )
                  : null
              }
              targetTaktTime={analysis.targetTaktTime}
            />
          </div>
        )}

        {/* TAB 2: 공정 & CT 설정 */}
        {activeTab === 'processes' && (
          <div className="space-y-6">
            <ProcessCTEditor
              processes={processes}
              gradeQuantities={gradeQuantities}
              totalUnits={analysis.totalPlannedUnits}
              targetTaktTime={analysis.targetTaktTime}
              onChange={setProcesses}
              onReset={() => setProcesses([...INITIAL_PROCESSES])}
            />

            <ProcessCTChart
              analyses={analysis.processAnalyses}
              targetTaktTime={analysis.targetTaktTime}
              lineCT={analysis.lineCT}
            />

            <ProcessAnalysisTable
              analyses={analysis.processAnalyses}
              targetTaktTime={analysis.targetTaktTime}
            />
          </div>
        )}

        {/* TAB 3: 등급 및 옵션 매트릭스 */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            <GradeProductionManager
              gradeQuantities={gradeQuantities}
              dailyTarget={condition.dailyTarget}
              onChange={setGradeQuantities}
              onApplyScenario={handleApplyScenario}
            />

            <OptionMatrixView
              options={options}
              onToggleOption={handleToggleOption}
              onReset={() => setOptions([...INITIAL_VEHICLE_OPTIONS])}
            />

            <ProductionConditionsCard
              condition={condition}
              onChange={setCondition}
              onReset={() => setCondition({ ...INITIAL_PRODUCTION_CONDITION })}
            />
          </div>
        )}

        {/* TAB 4: What-If 시뮬레이션 및 비교 */}
        {activeTab === 'simulation' && (
          <SimulationCompareView
            baselineCondition={condition}
            baselineQuantities={gradeQuantities}
            processes={processes}
            onApplyToCurrent={handleApplySimulationWhatIf}
          />
        )}

        {/* TAB 5: 20년차 시니어 엔지니어 기술 검토서 */}
        {activeTab === 'review' && <VeteranReviewModal />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              병목 현상 탐지 생산 대시보드
            </span>
            <span>·</span>
            <span>자동차 의장 순차 생산라인 시뮬레이션 시스템</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serverless Ready</span>
            <span>·</span>
            <span>순수 수학적 결정론 엔진 (Zero AI Dependency)</span>
            <span>·</span>
            <span>TOC 라인 밸런싱 최적화</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
