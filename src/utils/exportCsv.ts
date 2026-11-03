import { ProductionAnalysisResult, VehicleOption, ProcessItem } from '../types';

export function exportAnalysisToCSV(
  analysis: ProductionAnalysisResult,
  processes: ProcessItem[],
  options: VehicleOption[]
) {
  const lines: string[] = [];

  // UTF-8 BOM for Excel Korean support
  const bom = '\uFEFF';

  lines.push('=== 자동차 의장공정 병목 탐지 생산 분석 보고서 ===');
  lines.push(`작성일시,${new Date().toLocaleString()}`);
  lines.push('');

  // 1. Production condition summary
  lines.push('--- [1. 생산 조건 요약] ---');
  lines.push(`일일 생산 목표 (대),${analysis.dailyTarget}`);
  lines.push(`총 생산 예정 대수 (대),${analysis.totalPlannedUnits}`);
  lines.push(`가용 생산시간 (분),${analysis.availableMinutes}`);
  lines.push(`가용 생산시간 (초),${analysis.availableSeconds}`);
  lines.push(`목표 Takt Time (초/대),${analysis.targetTaktTime}`);
  lines.push(`라인 최고 CT (초/대),${analysis.lineCT}`);
  lines.push(`예상 일일 생산 가능 대수 (대),${analysis.expectedCapacityUnits}`);
  lines.push(`목표 달성률 (%),${analysis.capacityAchievementRate}%`);
  lines.push('');

  // 2. Process Analysis Table
  lines.push('--- [2. 공정별 Cycle Time 및 부하율 분석] ---');
  lines.push('공정순서,공정명,Basic CT(s),Classic CT(s),Premium CT(s),Special CT(s),가중평균 CT(s),목표 Takt Time(s),초과시간(s),부하율(%),상태');

  analysis.processAnalyses.forEach((p) => {
    const statusText = p.status === 'BOTTLENECK' ? '병목 위험' : p.status === 'WARNING' ? '주의' : '정상';
    lines.push(
      `${p.order},${p.processName},${p.cycleTimeByGrade.Basic},${p.cycleTimeByGrade.Classic},${p.cycleTimeByGrade.Premium},${p.cycleTimeByGrade.Special},${p.weightedAvgCT},${p.targetTaktTime},${p.excessTime},${p.loadRate}%,${statusText}`
    );
  });
  lines.push('');

  // 3. Rule-based recommendations
  lines.push('--- [3. 병목 분석 및 조치 권고사항] ---');
  lines.push(`진단 상태,"${analysis.ruleBasedSummary.title}"`);
  lines.push(`분석 의견,"${analysis.ruleBasedSummary.explanation.replace(/"/g, '""')}"`);
  lines.push('권고 조치:');
  analysis.ruleBasedSummary.recommendations.forEach((rec, idx) => {
    lines.push(`${idx + 1},"${rec.replace(/"/g, '""')}"`);
  });

  const csvContent = bom + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `생산_병목_분석보고서_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
