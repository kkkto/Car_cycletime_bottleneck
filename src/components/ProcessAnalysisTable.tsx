import React, { useState } from 'react';
import { ProcessAnalysis, BottleneckStatus } from '../types';
import {
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';

interface ProcessAnalysisTableProps {
  analyses: ProcessAnalysis[];
  targetTaktTime: number;
  onEditProcess?: (processId: string) => void;
}

type SortField = 'order' | 'name' | 'weightedAvgCT' | 'loadRate' | 'excessTime';

export const ProcessAnalysisTable: React.FC<ProcessAnalysisTableProps> = ({
  analyses,
  targetTaktTime,
  onEditProcess,
}) => {
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | BottleneckStatus>('ALL');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for metrics
    }
  };

  const filtered = analyses.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === 'order') diff = a.order - b.order;
    else if (sortField === 'name') diff = a.processName.localeCompare(b.processName);
    else if (sortField === 'weightedAvgCT') diff = a.weightedAvgCT - b.weightedAvgCT;
    else if (sortField === 'loadRate') diff = a.loadRate - b.loadRate;
    else if (sortField === 'excessTime') diff = a.excessTime - b.excessTime;
    return sortAsc ? diff : -diff;
  });

  const getStatusBadge = (status: BottleneckStatus) => {
    switch (status) {
      case 'BOTTLENECK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            병목 위험
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            주의 단계
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            정상 여유
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header and Filter */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              공정별 부하율 및 병목 분석 테이블
            </h3>
            <span className="text-xs text-slate-500 font-mono">[Section 9-3]</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            가중평균 CT 및 목표 Takt Time({targetTaktTime.toFixed(1)}초) 대비 부하율 상세 지표
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 ({analyses.length})
          </button>
          <button
            onClick={() => setFilterStatus('BOTTLENECK')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'BOTTLENECK'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            병목 위험 ({analyses.filter((a) => a.status === 'BOTTLENECK').length})
          </button>
          <button
            onClick={() => setFilterStatus('WARNING')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'WARNING'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            주의 ({analyses.filter((a) => a.status === 'WARNING').length})
          </button>
          <button
            onClick={() => setFilterStatus('NORMAL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'NORMAL'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            정상 ({analyses.filter((a) => a.status === 'NORMAL').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th
                onClick={() => handleSort('order')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors w-16 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>공정</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>공정명</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                <span>차량 등급별 CT (B / C / P / S)</span>
              </th>
              <th
                onClick={() => handleSort('weightedAvgCT')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>평균 CT</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('excessTime')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>초과시간</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('loadRate')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors min-w-[170px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>부하율 (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">
                <span>상태</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span>피크 사양</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sorted.map((item) => {
              const isBottleneck = item.status === 'BOTTLENECK';
              const isWarning = item.status === 'WARNING';

              return (
                <tr
                  key={item.processId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isBottleneck ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400 font-semibold">
                    {item.order}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {item.processName}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                      <span title="Basic CT" className="text-slate-500">
                        {item.cycleTimeByGrade.Basic}s
                      </span>
                      <span className="text-slate-300">/</span>
                      <span title="Classic CT" className="text-slate-600">
                        {item.cycleTimeByGrade.Classic}s
                      </span>
                      <span className="text-slate-300">/</span>
                      <span title="Premium CT" className="text-amber-700 font-medium">
                        {item.cycleTimeByGrade.Premium}s
                      </span>
                      <span className="text-slate-300">/</span>
                      <span title="Special CT" className="text-rose-700 font-bold">
                        {item.cycleTimeByGrade.Special}s
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {item.weightedAvgCT.toFixed(1)}초
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs font-semibold">
                    {item.excessTime > 0 ? (
                      <span className="text-rose-600 font-bold">+{item.excessTime.toFixed(1)}초</span>
                    ) : item.excessTime === 0 ? (
                      <span className="text-slate-400">0.0초</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">{item.excessTime.toFixed(1)}초</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isBottleneck
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.loadRate / 130) * 100)}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs font-bold tabular-nums min-w-[50px] text-right ${
                          isBottleneck
                            ? 'text-rose-700'
                            : isWarning
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.loadRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-600 whitespace-nowrap">
                    <span className="text-slate-400 mr-1">{item.maxGrade.grade}</span>
                    <span className="font-bold text-slate-800">{item.maxGrade.ct}s</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer explanation note */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">부하율 산출식:</span>
          <span className="font-mono text-slate-600">공정별 평균 CT / 목표 Takt Time ({targetTaktTime.toFixed(1)}s) × 100</span>
        </div>
        <div className="text-slate-400">
          초과 작업시간 = 공정별 평균 CT - 목표 Takt Time
        </div>
      </div>
    </div>
  );
};
