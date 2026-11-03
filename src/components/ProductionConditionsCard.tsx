import React from 'react';
import { ProductionCondition } from '../types';
import { calculateAvailableTime, calculateTaktTime } from '../utils/calculations';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

interface ProductionConditionsCardProps {
  condition: ProductionCondition;
  onChange: (updated: ProductionCondition) => void;
  onReset: () => void;
}

export const ProductionConditionsCard: React.FC<ProductionConditionsCardProps> = ({
  condition,
  onChange,
  onReset,
}) => {
  const timeCalc = calculateAvailableTime(condition);
  const targetTaktTime = calculateTaktTime(timeCalc.availableSeconds, condition.dailyTarget);

  const handleFieldChange = (field: keyof ProductionCondition, value: number) => {
    onChange({
      ...condition,
      [field]: Math.max(0, value),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            생산 조건 설정 (STEP 1)
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
        >
          기본값 복원
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 일일 생산 목표 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            일일 생산 목표 (대)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={condition.dailyTarget || ''}
              onChange={(e) => handleFieldChange('dailyTarget', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              placeholder="500"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">대</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">기준: 500대</span>
        </div>

        {/* 일일 근무시간 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            일일 총 근무시간 (분)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={condition.workingHoursMinutes || ''}
              onChange={(e) => handleFieldChange('workingHoursMinutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              placeholder="480"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">분</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">8시간 = 480분</span>
        </div>

        {/* 휴식시간 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            휴식시간 (분)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={condition.breakMinutes || ''}
              onChange={(e) => handleFieldChange('breakMinutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              placeholder="60"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">분</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">점심 및 정기휴식</span>
        </div>

        {/* 비가동시간 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            기타 비가동시간 (분)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={condition.downtimeMinutes || ''}
              onChange={(e) => handleFieldChange('downtimeMinutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              placeholder="20"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">분</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">조회, 청소, 모델 체인지</span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {!timeCalc.isValid && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{timeCalc.error}</span>
        </div>
      )}

      {/* Real-time Calculation Summary Bar */}
      {timeCalc.isValid && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">
              가용 생산시간:
            </span>
            <span className="font-mono font-bold text-slate-900">
              {timeCalc.availableMinutes}분 ({timeCalc.availableSeconds.toLocaleString()}초)
            </span>
            <span className="text-slate-400 text-[11px]">
              (= {condition.workingHoursMinutes}m - {condition.breakMinutes}m - {condition.downtimeMinutes}m)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">목표 Takt Time:</span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {targetTaktTime.toFixed(1)}초/대
            </span>
            <span className="text-slate-400 text-[11px]">
              (= {timeCalc.availableSeconds}s / {condition.dailyTarget}대)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
