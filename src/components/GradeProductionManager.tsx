import React from 'react';
import { VehicleGrade, VEHICLE_GRADES } from '../types';
import { calculateGradeRatios } from '../utils/calculations';
import { PRESET_SCENARIOS } from '../data/mockData';
import { Car, AlertTriangle, CheckCircle2, BookmarkCheck } from 'lucide-react';

interface GradeProductionManagerProps {
  gradeQuantities: Record<VehicleGrade, number>;
  dailyTarget: number;
  onChange: (updated: Record<VehicleGrade, number>) => void;
  onApplyScenario: (scenarioId: string) => void;
}

export const GradeProductionManager: React.FC<GradeProductionManagerProps> = ({
  gradeQuantities,
  dailyTarget,
  onChange,
  onApplyScenario,
}) => {
  const { totalUnits, ratios } = calculateGradeRatios(gradeQuantities);
  const discrepancy = totalUnits - dailyTarget;

  const handleQuantityChange = (grade: VehicleGrade, val: number) => {
    onChange({
      ...gradeQuantities,
      [grade]: Math.max(0, val),
    });
  };

  const gradeColors: Record<VehicleGrade, { bg: string; text: string; border: string; accent: string }> = {
    Basic: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', accent: 'text-slate-600' },
    Classic: { bg: 'bg-blue-50/50', text: 'text-blue-800', border: 'border-blue-200', accent: 'text-blue-600' },
    Premium: { bg: 'bg-indigo-50/50', text: 'text-indigo-800', border: 'border-indigo-200', accent: 'text-indigo-600' },
    Special: { bg: 'bg-purple-50/50', text: 'text-purple-800', border: 'border-purple-200', accent: 'text-purple-600' },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              차량 등급별 생산 대수 및 믹스 비율 (STEP 2)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Basic, Classic, Premium, Special 4개 등급의 생산 대수 입력 및 비율 자동 계산
          </p>
        </div>

        {/* Preset scenario quick selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">시나리오 프리셋:</span>
          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onApplyScenario(sc.id)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              title={sc.description}
            >
              {sc.name.split(' ')[0]} {sc.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Grade cards grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VEHICLE_GRADES.map((grade) => {
          const style = gradeColors[grade];
          const qty = gradeQuantities[grade] || 0;
          const ratio = ratios[grade] || 0;

          return (
            <div
              key={grade}
              className={`p-4 rounded-xl border ${style.border} ${style.bg} flex flex-col justify-between transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${style.text}`}>{grade}</span>
                <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                  {ratio.toFixed(1)}%
                </span>
              </div>

              <div className="my-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={qty || ''}
                    onChange={(e) => handleQuantityChange(grade, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-base font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden tabular-nums"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">대</span>
                </div>

                {/* Range Slider for rapid what-if exploration */}
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  value={qty}
                  onChange={(e) => handleQuantityChange(grade, parseInt(e.target.value) || 0)}
                  className="w-full mt-2 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span>차량 사양</span>
                <span className="font-medium text-slate-700">
                  {grade === 'Basic'
                    ? '기본형'
                    : grade === 'Classic'
                    ? '실속형 (레이더/시트)'
                    : grade === 'Premium'
                    ? '고급형 (HUD/서라운드)'
                    : '풀옵션 (선루프 포함)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary and Target discrepancy banner */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">총 생산 예정 대수:</span>
          <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
            {totalUnits.toLocaleString()}대
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">일일 목표:</span>
          <span className="font-mono font-semibold text-slate-700 tabular-nums">
            {dailyTarget.toLocaleString()}대
          </span>
        </div>

        <div>
          {discrepancy === 0 ? (
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>생산 목표({dailyTarget}대)와 일치함 (100%)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {discrepancy > 0
                  ? `목표보다 ${discrepancy}대 초과 입력됨 (경고)`
                  : `목표보다 ${Math.abs(discrepancy)}대 부족 입력됨 (경고)`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
