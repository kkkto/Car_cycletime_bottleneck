import React, { useState } from 'react';
import { ProcessAnalysis } from '../types';
import { Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ProcessCTChartProps {
  analyses: ProcessAnalysis[];
  targetTaktTime: number;
  lineCT: number;
  onSelectProcess?: (processId: string) => void;
}

export const ProcessCTChart: React.FC<ProcessCTChartProps> = ({
  analyses,
  targetTaktTime,
  lineCT,
  onSelectProcess,
}) => {
  const [hoveredProcessId, setHoveredProcessId] = useState<string | null>(null);

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        표시할 공정 데이터가 없습니다. 공정을 추가해 주세요.
      </div>
    );
  }

  // Calculate chart scale
  const maxCT = Math.max(...analyses.map((a) => a.weightedAvgCT), targetTaktTime, lineCT, 70);
  const chartHeight = 320;
  const chartPaddingTop = 40;
  const chartPaddingBottom = 60;
  const usableHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  // Round max for Y-axis ticks
  const yMax = Math.ceil((maxCT * 1.15) / 10) * 10;
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

  const getY = (val: number) => {
    return chartPaddingTop + usableHeight - (val / yMax) * usableHeight;
  };

  const taktY = getY(targetTaktTime);
  const warningTaktY = getY(targetTaktTime * 0.9);

  const hoveredItem = analyses.find((a) => a.processId === hoveredProcessId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              공정별 가중평균 Cycle Time vs 목표 Takt Time 비교
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              [Section 9-2]
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            목표 Takt Time({targetTaktTime.toFixed(1)}초) 초과 시 적색(병목 위험), 90% 이상 시 황색(주의), 90% 미만 시 녹색(정상)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
            <span className="text-slate-700 font-medium">병목 위험 (&gt;100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
            <span className="text-slate-700 font-medium">주의 (90~100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-slate-700 font-medium">정상 (&lt;90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-600 inline-block" />
            <span className="text-slate-700 font-medium">목표 Takt Time</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Viewport */}
      <div className="relative mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 800 ${chartHeight}`}
          className="w-full h-[320px] select-none"
          preserveAspectRatio="none"
        >
          {/* Grid lines & Y Axis Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1="55"
                  y1={y}
                  x2="790"
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x="48"
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tick.toFixed(0)}s
                </text>
              </g>
            );
          })}

          {/* 90% Warning Threshold Guideline */}
          {warningTaktY >= chartPaddingTop && (
            <g>
              <line
                x1="55"
                y1={warningTaktY}
                x2="790"
                y2={warningTaktY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x="785"
                y={warningTaktY - 4}
                textAnchor="end"
                fontSize="10"
                fill="#b45309"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                90% 주의 기준: {(targetTaktTime * 0.9).toFixed(1)}초
              </text>
            </g>
          )}

          {/* Target Takt Time Benchmark Line */}
          {taktY >= chartPaddingTop && (
            <g>
              <line
                x1="55"
                y1={taktY}
                x2="790"
                y2={taktY}
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <rect
                x="640"
                y={taktY - 22}
                width="145"
                height="18"
                rx="3"
                fill="#dc2626"
              />
              <text
                x="712"
                y={taktY - 9}
                textAnchor="middle"
                fontSize="10.5"
                fill="#ffffff"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                목표 Takt Time {targetTaktTime.toFixed(1)}초
              </text>
            </g>
          )}

          {/* Bars */}
          {analyses.map((proc, index) => {
            const barWidth = Math.min(65, (735 / analyses.length) * 0.55);
            const slotWidth = (790 - 55) / analyses.length;
            const x = 55 + index * slotWidth + (slotWidth - barWidth) / 2;
            const barY = getY(proc.weightedAvgCT);
            const barHeight = Math.max(4, chartPaddingTop + usableHeight - barY);

            const isHovered = hoveredProcessId === proc.processId;
            const isBottleneck = proc.status === 'BOTTLENECK';
            const isWarning = proc.status === 'WARNING';

            const fillColor = isBottleneck
              ? '#f43f5e' // Rose-500
              : isWarning
              ? '#f59e0b' // Amber-500
              : '#10b981'; // Emerald-500

            const strokeColor = isBottleneck
              ? '#be123c'
              : isWarning
              ? '#d97706'
              : '#047857';

            return (
              <g
                key={proc.processId}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredProcessId(proc.processId)}
                onMouseLeave={() => setHoveredProcessId(null)}
                onClick={() => onSelectProcess && onSelectProcess(proc.processId)}
              >
                {/* Column background hover highlight */}
                <rect
                  x={x - 8}
                  y={chartPaddingTop}
                  width={barWidth + 16}
                  height={usableHeight + 10}
                  fill={isHovered ? '#f8fafc' : 'transparent'}
                  rx="4"
                />

                {/* The CT Bar */}
                <rect
                  x={x}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={fillColor}
                  stroke={isHovered ? strokeColor : 'none'}
                  strokeWidth={isHovered ? 2 : 0}
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all duration-200"
                />

                {/* Over Takt Time Delta Badge on top of Bar */}
                {proc.excessTime > 0 && (
                  <g>
                    <rect
                      x={x - 4}
                      y={barY - 24}
                      width={barWidth + 8}
                      height="18"
                      rx="3"
                      fill="#be123c"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={barY - 11}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#ffffff"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      +{proc.excessTime.toFixed(1)}s
                    </text>
                  </g>
                )}

                {/* CT Value Label directly on top or inside bar */}
                {proc.excessTime <= 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={barY - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#334155"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {proc.weightedAvgCT.toFixed(1)}s
                  </text>
                )}

                {/* X Axis Process Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 35}
                  textAnchor="middle"
                  fontSize="12"
                  fill={isHovered ? '#0f172a' : '#475569'}
                  fontWeight={isHovered ? 'bold' : '600'}
                >
                  {proc.processName}
                </text>

                {/* Load rate indicator under label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 18}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill={isBottleneck ? '#e11d48' : isWarning ? '#d97706' : '#059669'}
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {proc.loadRate.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Breakdown Popover */}
        {hoveredItem && (
          <div className="absolute top-4 right-4 bg-slate-900 text-white rounded-lg p-3.5 shadow-xl text-xs z-20 pointer-events-none max-w-xs border border-slate-700 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700 font-semibold">
              <span className="text-sm font-bold text-slate-100">{hoveredItem.processName}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  hoveredItem.status === 'BOTTLENECK'
                    ? 'bg-rose-500/30 text-rose-300'
                    : hoveredItem.status === 'WARNING'
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/30 text-emerald-300'
                }`}
              >
                {hoveredItem.status === 'BOTTLENECK'
                  ? '병목 위험'
                  : hoveredItem.status === 'WARNING'
                  ? '주의 단계'
                  : '정상 여유'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">가중평균 CT</span>
                <span className="text-sm font-bold text-white font-mono">
                  {hoveredItem.weightedAvgCT.toFixed(1)}초
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">부하율 (vs TT)</span>
                <span className="text-sm font-bold font-mono text-white">
                  {hoveredItem.loadRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">차량 등급별 Cycle Time:</span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                <div className="bg-slate-800/80 p-1 rounded">
                  <span className="text-slate-400 block text-[10px]">Basic</span>
                  <span className="font-semibold text-slate-200">
                    {hoveredItem.cycleTimeByGrade.Basic}s
                  </span>
                </div>
                <div className="bg-slate-800/80 p-1 rounded">
                  <span className="text-slate-400 block text-[10px]">Classic</span>
                  <span className="font-semibold text-slate-200">
                    {hoveredItem.cycleTimeByGrade.Classic}s
                  </span>
                </div>
                <div className="bg-slate-800/80 p-1 rounded">
                  <span className="text-slate-400 block text-[10px]">Premium</span>
                  <span className="font-semibold text-amber-300">
                    {hoveredItem.cycleTimeByGrade.Premium}s
                  </span>
                </div>
                <div className="bg-slate-800/80 p-1 rounded">
                  <span className="text-slate-400 block text-[10px]">Special</span>
                  <span className="font-semibold text-rose-400">
                    {hoveredItem.cycleTimeByGrade.Special}s
                  </span>
                </div>
              </div>
            </div>

            {hoveredItem.excessTime > 0 && (
              <div className="mt-2.5 bg-rose-950/60 border border-rose-800/50 rounded p-1.5 text-[11px] text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>목표 Takt Time보다 <strong>{hoveredItem.excessTime.toFixed(1)}초</strong> 초과되어 라인 병목을 유발합니다.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
