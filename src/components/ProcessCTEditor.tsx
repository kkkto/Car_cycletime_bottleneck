import React, { useState } from 'react';
import { ProcessItem, VehicleGrade, VEHICLE_GRADES } from '../types';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { calculateProcessWeightedCT } from '../utils/calculations';

interface ProcessCTEditorProps {
  processes: ProcessItem[];
  gradeQuantities: Record<VehicleGrade, number>;
  totalUnits: number;
  targetTaktTime: number;
  onChange: (updated: ProcessItem[]) => void;
  onReset: () => void;
}

export const ProcessCTEditor: React.FC<ProcessCTEditorProps> = ({
  processes,
  gradeQuantities,
  totalUnits,
  targetTaktTime,
  onChange,
  onReset,
}) => {
  const [newProcessName, setNewProcessName] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const handleCTChange = (processId: string, grade: VehicleGrade, val: number) => {
    const updated = processes.map((p) => {
      if (p.id !== processId) return p;
      return {
        ...p,
        cycleTimeByGrade: {
          ...p.cycleTimeByGrade,
          [grade]: Math.max(1, val || 1),
        },
      };
    });
    onChange(updated);
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessName.trim()) return;

    const newProc: ProcessItem = {
      id: `proc_${Date.now()}`,
      name: newProcessName.trim(),
      order: processes.length + 1,
      cycleTimeByGrade: {
        Basic: 35,
        Classic: 40,
        Premium: 50,
        Special: 60,
      },
    };

    onChange([...processes, newProc]);
    setNewProcessName('');
  };

  const handleDeleteProcess = (processId: string) => {
    if (processes.length <= 1) {
      alert('최소 1개 이상의 공정이 유지되어야 합니다.');
      return;
    }
    const filtered = processes
      .filter((p) => p.id !== processId)
      .map((p, idx) => ({ ...p, order: idx + 1 }));
    onChange(filtered);
  };

  const handleMoveOrder = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= processes.length) return;

    const reordered = [...processes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((p, idx) => ({ ...p, order: idx + 1 }));
    onChange(updated);
  };

  const startRename = (proc: ProcessItem) => {
    setEditingNameId(proc.id);
    setTempName(proc.name);
  };

  const saveRename = (procId: string) => {
    if (!tempName.trim()) return;
    onChange(
      processes.map((p) => (p.id === procId ? { ...p, name: tempName.trim() } : p))
    );
    setEditingNameId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              등급별 공정 Cycle Time(CT) 입력 및 관리 (STEP 4)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            차량 등급별 실제 공정 소요시간(초)을 직접 입력합니다. 순차 라인 순서 이동 및 추가/삭제 가능
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>공정 CT 기본값 복원</span>
        </button>
      </div>

      {/* Add new process form */}
      <form onSubmit={handleAddProcess} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newProcessName}
          onChange={(e) => setNewProcessName(e.target.value)}
          placeholder="새로운 의장 공정명 입력 (예: 도어 트림 장착, 윈드실드 글래스 실링 등)"
          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>공정 추가</span>
        </button>
      </form>

      {/* Process list */}
      <div className="mt-4 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {processes.map((proc, idx) => {
          const weightedCT = calculateProcessWeightedCT(
            proc.cycleTimeByGrade,
            gradeQuantities,
            totalUnits
          );
          const isOverTakt = targetTaktTime > 0 && weightedCT > targetTaktTime;

          return (
            <div
              key={proc.id}
              className={`p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isOverTakt ? 'bg-rose-50/15' : ''
              }`}
            >
              {/* Left: Reorder, Order number, Process name */}
              <div className="flex items-center gap-3 min-w-[240px]">
                {/* Up/Down buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'UP')}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="공정 순서 위로 이동"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'DOWN')}
                    disabled={idx === processes.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="공정 순서 아래로 이동"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                  #{proc.order}
                </span>

                {/* Name inline edit */}
                {editingNameId === proc.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(proc.id)}
                      autoFocus
                      className="px-2 py-1 text-sm font-semibold border border-blue-400 rounded outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => saveRename(proc.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => startRename(proc)}
                    className="cursor-pointer group flex items-center gap-1.5"
                    title="공정명 클릭하여 수정"
                  >
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {proc.name}
                    </span>
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      (수정)
                    </span>
                  </div>
                )}
              </div>

              {/* Center: Grade CT Inputs */}
              <div className="grid grid-cols-4 gap-2 flex-1 max-w-lg">
                {VEHICLE_GRADES.map((grade) => {
                  const ct = proc.cycleTimeByGrade[grade] || 0;
                  return (
                    <div key={grade} className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-500 mb-0.5 truncate">
                        {grade} CT
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={ct || ''}
                          onChange={(e) =>
                            handleCTChange(proc.id, grade, parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden tabular-nums"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">
                          s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Calculated Weighted Average CT & Delete */}
              <div className="flex items-center justify-between md:justify-end gap-4 min-w-[160px] pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">가중평균 CT</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        isOverTakt ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {weightedCT.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-500">초</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteProcess(proc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="공정 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
