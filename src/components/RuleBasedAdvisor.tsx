import React from 'react';
import { RuleBasedSummary, ProcessAnalysis } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RuleBasedAdvisorProps {
  summary: RuleBasedSummary;
  primaryBottleneck: ProcessAnalysis | null;
  targetTaktTime: number;
}

export const RuleBasedAdvisor: React.FC<RuleBasedAdvisorProps> = ({
  summary,
  primaryBottleneck,
  targetTaktTime,
}) => {
  const isCritical = summary.statusType === 'CRITICAL';
  const isWarning = summary.statusType === 'WARNING';
  const isHealthy = summary.statusType === 'HEALTHY';

  return (
    <div
      className={`rounded-xl border p-5 shadow-2xs transition-all ${
        isCritical
          ? 'bg-rose-50/40 border-rose-200'
          : isWarning
          ? 'bg-amber-50/40 border-amber-200'
          : isHealthy
          ? 'bg-emerald-50/30 border-emerald-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isCritical
                ? 'bg-rose-600 text-white'
                : isWarning
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-5 h-5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{summary.title}</h3>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                규칙형 분석 엔진 [Section 9-4]
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              공정별 Cycle Time 계산 및 직렬 생산라인 부하율 모델 기반의 실시간 의사결정 보고서
            </p>
          </div>
        </div>

        {primaryBottleneck && (
          <div className="hidden sm:flex flex-col items-end text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400">최대 병목 공정</span>
            <span className="font-bold text-rose-700">{primaryBottleneck.processName}</span>
          </div>
        )}
      </div>

      {/* Primary Bottleneck Spotlight (if exists) */}
      {primaryBottleneck && isCritical && (
        <div className="mt-4 bg-white rounded-lg p-3.5 border border-rose-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">병목 공정명</span>
            <span className="font-bold text-slate-900 text-sm">{primaryBottleneck.processName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">평균 작업시간 (CT)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {primaryBottleneck.weightedAvgCT.toFixed(1)}초
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">목표 Takt Time 초과</span>
            <span className="font-mono font-bold text-rose-600 text-sm">
              +{primaryBottleneck.excessTime.toFixed(1)}초/대
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">공정 부하율</span>
            <span className="font-mono font-bold text-rose-700 text-sm">
              {primaryBottleneck.loadRate.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Analysis opinion prose */}
      <div className="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white/70 p-3.5 rounded-lg border border-slate-200/70">
        <span className="font-semibold text-slate-900 mr-1.5">💡 분석 의견:</span>
        {summary.explanation}
      </div>

      {/* Action Recommendations */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>생산 관리자 조치 검토 권고사항:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {summary.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white/80 border border-slate-200/80 rounded-lg p-2.5 flex items-start gap-2 shadow-2xs"
            >
              <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                {idx + 1}
              </div>
              <span className="text-slate-700 leading-snug">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
