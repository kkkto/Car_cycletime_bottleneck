import React from 'react';
import { VehicleOption, VehicleGrade, VEHICLE_GRADES } from '../types';
import { Check, X, Sliders, Info, RotateCcw } from 'lucide-react';

interface OptionMatrixViewProps {
  options: VehicleOption[];
  onToggleOption: (optionId: string, grade: VehicleGrade) => void;
  onReset: () => void;
}

export const OptionMatrixView: React.FC<OptionMatrixViewProps> = ({
  options,
  onToggleOption,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              차량 등급별 옵션 구성 매트릭스 (STEP 3)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            5종 핵심 편의·안전 옵션의 등급별 적용 여부 확인 및 구성 변경
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>옵션 기본값 복원</span>
        </button>
      </div>

      {/* Engineering Design Principle Notice (Section 5-4) */}
      <div className="mt-4 p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">[기획서 5-4 설계 원칙 준수]</span> 옵션 구성은 차량 등급별 작업시간 차이를 명확히 이해하기 위한 <strong>참고 정보(Reference)</strong>로 작동합니다. 옵션별 가산 CT를 중복 덧셈하지 않으며, 등급별 공정 CT에 이미 옵션 장착 작업시간이 내포되어 있습니다. 실제 사양 변경으로 CT가 달라지는 경우 <strong>'공정 & CT 설정'</strong>에서 해당 등급의 CT를 직접 수정하십시오.
        </div>
      </div>

      {/* Matrix Table */}
      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
              <th className="py-3 px-4 w-1/3">옵션 종류</th>
              <th className="py-3 px-4 hidden md:table-cell">옵션 상세 사양</th>
              {VEHICLE_GRADES.map((grade) => (
                <th key={grade} className="py-3 px-4 text-center">
                  <span className="font-bold text-slate-900">{grade}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {options.map((opt) => (
              <tr key={opt.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                  {opt.name}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500 hidden md:table-cell">
                  {opt.description}
                </td>
                {VEHICLE_GRADES.map((grade) => {
                  const isApplied = opt.gradeApplied[grade];
                  return (
                    <td key={grade} className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleOption(opt.id, grade)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                          isApplied
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs hover:bg-blue-700'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                        title={`${grade} 등급에 ${opt.name} ${isApplied ? '적용 해제' : '적용'}`}
                      >
                        {isApplied ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <X className="w-4 h-4 stroke-[2]" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
