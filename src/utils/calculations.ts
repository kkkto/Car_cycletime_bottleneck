import {
  VehicleGrade,
  VEHICLE_GRADES,
  ProductionCondition,
  ProcessItem,
  ProcessAnalysis,
  BottleneckStatus,
  ProductionAnalysisResult,
  RuleBasedSummary,
} from '../types';

/**
 * STEP 1. 가용 생산시간 계산
 * 가용시간 = 근무시간 - 휴식시간 - 비가동시간
 */
export function calculateAvailableTime(condition: ProductionCondition): {
  availableMinutes: number;
  availableSeconds: number;
  isValid: boolean;
  error?: string;
} {
  const { workingHoursMinutes, breakMinutes, downtimeMinutes } = condition;

  if (workingHoursMinutes <= 0) {
    return {
      availableMinutes: 0,
      availableSeconds: 0,
      isValid: false,
      error: '일일 근무시간은 0보다 커야 합니다.',
    };
  }

  const nonWorkingMinutes = breakMinutes + downtimeMinutes;
  if (nonWorkingMinutes >= workingHoursMinutes) {
    return {
      availableMinutes: 0,
      availableSeconds: 0,
      isValid: false,
      error: `휴식시간(${breakMinutes}분)과 비가동시간(${downtimeMinutes}분)의 합계가 총 근무시간(${workingHoursMinutes}분) 이상입니다.`,
    };
  }

  const availableMinutes = workingHoursMinutes - nonWorkingMinutes;
  const availableSeconds = availableMinutes * 60;

  return {
    availableMinutes,
    availableSeconds,
    isValid: true,
  };
}

/**
 * STEP 2. 목표 Takt Time 계산
 * Takt Time = 가용 생산시간(초) / 일일 생산 목표
 */
export function calculateTaktTime(
  availableSeconds: number,
  dailyTarget: number
): number {
  if (availableSeconds <= 0 || dailyTarget <= 0) {
    return 0;
  }
  return Number((availableSeconds / dailyTarget).toFixed(2));
}

/**
 * STEP 3. 등급별 생산 비율 계산
 * 등급별 생산 비율(%) = 등급별 생산 대수 / 총 생산 대수 × 100
 */
export function calculateGradeRatios(
  gradeQuantities: Record<VehicleGrade, number>
): {
  totalUnits: number;
  ratios: Record<VehicleGrade, number>;
} {
  const totalUnits = VEHICLE_GRADES.reduce(
    (sum, grade) => sum + Math.max(0, gradeQuantities[grade] || 0),
    0
  );

  const ratios: Record<VehicleGrade, number> = {
    Basic: 0,
    Classic: 0,
    Premium: 0,
    Special: 0,
  };

  if (totalUnits > 0) {
    VEHICLE_GRADES.forEach((grade) => {
      const qty = Math.max(0, gradeQuantities[grade] || 0);
      ratios[grade] = Number(((qty / totalUnits) * 100).toFixed(1));
    });
  }

  return { totalUnits, ratios };
}

/**
 * STEP 4. 공정별 가중평균 CT 계산
 * 평균 CT(i) = Σ(등급별 생산 대수 × 해당 등급의 공정 CT) / 총 생산 대수
 */
export function calculateProcessWeightedCT(
  cycleTimeByGrade: Record<VehicleGrade, number>,
  gradeQuantities: Record<VehicleGrade, number>,
  totalUnits: number
): number {
  if (totalUnits <= 0) return 0;

  let totalWorkSeconds = 0;
  for (const grade of VEHICLE_GRADES) {
    const qty = Math.max(0, gradeQuantities[grade] || 0);
    const ct = Math.max(0, cycleTimeByGrade[grade] || 0);
    totalWorkSeconds += qty * ct;
  }

  return Number((totalWorkSeconds / totalUnits).toFixed(2));
}

/**
 * STEP 5. 공정별 부하율 및 병목 판정
 * 부하율(%) = 공정별 평균 CT / 목표 Takt Time × 100
 * < 90%: 정상
 * 90% ~ 100%: 주의
 * > 100%: 병목 위험
 */
export function evaluateBottleneckStatus(
  loadRate: number,
  warningThreshold = 90,
  bottleneckThreshold = 100
): BottleneckStatus {
  if (loadRate > bottleneckThreshold) {
    return 'BOTTLENECK';
  }
  if (loadRate >= warningThreshold) {
    return 'WARNING';
  }
  return 'NORMAL';
}

/**
 * STEP 6. 예상 생산 가능 대수 계산
 * 예상 생산 가능 대수 = 가용 생산시간(초) / 라인 CT (MAX 공정 평균 CT)
 * 소수점 이하 버림 (정수)
 */
export function calculateExpectedCapacity(
  availableSeconds: number,
  lineCT: number
): number {
  if (availableSeconds <= 0 || lineCT <= 0) {
    return 0;
  }
  return Math.floor(availableSeconds / lineCT);
}

/**
 * 종합 시뮬레이션 및 병목 탐지 파이프라인
 */
export function runProductionSimulation(
  condition: ProductionCondition,
  gradeQuantities: Record<VehicleGrade, number>,
  processes: ProcessItem[],
  thresholds = { warning: 90, bottleneck: 100 }
): ProductionAnalysisResult {
  const timeCalc = calculateAvailableTime(condition);
  const { totalUnits } = calculateGradeRatios(gradeQuantities);

  // Validation
  if (!timeCalc.isValid) {
    return createEmptyAnalysisResult(
      condition,
      gradeQuantities,
      processes,
      timeCalc.error || '생산 시간 입력 조건이 올바르지 않습니다.'
    );
  }

  if (condition.dailyTarget <= 0) {
    return createEmptyAnalysisResult(
      condition,
      gradeQuantities,
      processes,
      '일일 생산 목표 대수는 1대 이상이어야 합니다.'
    );
  }

  if (totalUnits <= 0) {
    return createEmptyAnalysisResult(
      condition,
      gradeQuantities,
      processes,
      '총 생산 예정 대수가 0대입니다. 차량 등급별 생산 대수를 1대 이상 입력해 주세요.'
    );
  }

  // Missing or negative CT check
  for (const proc of processes) {
    for (const grade of VEHICLE_GRADES) {
      const ct = proc.cycleTimeByGrade[grade];
      if (ct === undefined || ct === null || ct <= 0) {
        return createEmptyAnalysisResult(
          condition,
          gradeQuantities,
          processes,
          `'${proc.name}' 공정의 ${grade} 등급 Cycle Time(CT)이 누락되었거나 0 이하입니다.`
        );
      }
    }
  }

  const targetTaktTime = calculateTaktTime(timeCalc.availableSeconds, condition.dailyTarget);

  // Process analysis list
  const processAnalyses: ProcessAnalysis[] = processes.map((proc) => {
    const weightedAvgCT = calculateProcessWeightedCT(
      proc.cycleTimeByGrade,
      gradeQuantities,
      totalUnits
    );

    const loadRate = targetTaktTime > 0
      ? Number(((weightedAvgCT / targetTaktTime) * 100).toFixed(1))
      : 0;

    const excessTime = Number((weightedAvgCT - targetTaktTime).toFixed(2));
    const status = evaluateBottleneckStatus(loadRate, thresholds.warning, thresholds.bottleneck);

    let maxGrade: { grade: VehicleGrade; ct: number } = { grade: 'Basic', ct: 0 };
    let minGrade: { grade: VehicleGrade; ct: number } = { grade: 'Basic', ct: Infinity };

    VEHICLE_GRADES.forEach((grade) => {
      const ct = proc.cycleTimeByGrade[grade] || 0;
      if (ct > maxGrade.ct) maxGrade = { grade, ct };
      if (ct < minGrade.ct) minGrade = { grade, ct };
    });

    return {
      processId: proc.id,
      processName: proc.name,
      order: proc.order,
      cycleTimeByGrade: proc.cycleTimeByGrade,
      weightedAvgCT,
      targetTaktTime,
      loadRate,
      excessTime,
      status,
      maxGrade,
      minGrade,
    };
  });

  // 순차 생산라인: 라인 CT = MAX(공정별 평균 CT)
  const lineCT = processAnalyses.length > 0
    ? Number(Math.max(...processAnalyses.map((p) => p.weightedAvgCT)).toFixed(2))
    : 0;

  const bottleneckProcesses = processAnalyses.filter((p) => p.status === 'BOTTLENECK');
  const warningProcesses = processAnalyses.filter((p) => p.status === 'WARNING');
  const normalProcesses = processAnalyses.filter((p) => p.status === 'NORMAL');

  const expectedCapacityUnits = calculateExpectedCapacity(timeCalc.availableSeconds, lineCT);
  const capacityAchievementRate = condition.dailyTarget > 0
    ? Number(((expectedCapacityUnits / condition.dailyTarget) * 100).toFixed(1))
    : 0;

  const targetDiscrepancy = totalUnits - condition.dailyTarget;

  // 룰 기반 분석 보고서 생성
  const ruleBasedSummary = generateRuleBasedSummary(
    targetTaktTime,
    lineCT,
    bottleneckProcesses,
    warningProcesses,
    expectedCapacityUnits,
    condition.dailyTarget,
    gradeQuantities,
    totalUnits
  );

  return {
    availableMinutes: timeCalc.availableMinutes,
    availableSeconds: timeCalc.availableSeconds,
    dailyTarget: condition.dailyTarget,
    totalPlannedUnits: totalUnits,
    targetTaktTime,
    lineCT,
    bottleneckProcesses,
    warningProcesses,
    normalProcesses,
    expectedCapacityUnits,
    capacityAchievementRate,
    targetDiscrepancy,
    processAnalyses,
    ruleBasedSummary,
    isValid: true,
  };
}

/**
 * 기획서 9-4 규칙 기반 분석 의견 생성
 */
function generateRuleBasedSummary(
  targetTaktTime: number,
  lineCT: number,
  bottlenecks: ProcessAnalysis[],
  warnings: ProcessAnalysis[],
  expectedCapacity: number,
  dailyTarget: number,
  gradeQuantities: Record<VehicleGrade, number>,
  totalUnits: number
): RuleBasedSummary {
  if (bottlenecks.length > 0) {
    const primary = bottlenecks.reduce((prev, curr) =>
      curr.weightedAvgCT > prev.weightedAvgCT ? curr : prev
    );

    const specialRatio = totalUnits > 0 ? (gradeQuantities.Special / totalUnits) * 100 : 0;
    const premiumRatio = totalUnits > 0 ? (gradeQuantities.Premium / totalUnits) * 100 : 0;
    const highSpecTotal = specialRatio + premiumRatio;

    let explanation = `현재 생산계획에서는 [${primary.processName}] 공정의 평균 작업시간(${primary.weightedAvgCT}초)이 목표 Takt Time(${targetTaktTime}초)을 ${primary.excessTime > 0 ? primary.excessTime : 0}초 초과(부하율 ${primary.loadRate}%)하고 있습니다.`;

    if (bottlenecks.length > 1) {
      const others = bottlenecks
        .filter((b) => b.processId !== primary.processId)
        .map((b) => `${b.processName}(${b.weightedAvgCT}초, ${b.loadRate}%)`)
        .join(', ');
      explanation += ` 또한 추가로 [${others}] 공정에서도 목표 속도를 초과하여 라인 전반의 정체 및 블로킹(Blocking) 위험이 발생합니다.`;
    }

    if (highSpecTotal >= 35) {
      explanation += ` 특히 고사양 옵션이 집중된 Premium/Special 등급 생산 비중이 전체의 ${highSpecTotal.toFixed(1)}%로 높아 특정 조립 부하가 급증한 상태입니다.`;
    }

    const capacityGap = dailyTarget - expectedCapacity;

    const recommendations: string[] = [
      `[라인 밸런싱 재편] 가장 부하가 높은 '${primary.processName}' 공정의 단위 작업 요소를 분할하여 여유 공정(루프·외장 조립 등)으로 이관 검토`,
      `[작업자 유동 배치] 병목 구간(${bottlenecks.map((b) => b.processName).join(', ')})에 서포트 작업자 추가 배치 또는 2인 1조 셀 작업 편성`,
      `[믹스 비율 조정] Special/Premium 등급 연속 투입을 피하고 Basic/Classic 모델을 교차 투입(Leveling/Heijunka)하여 순간 피크 부하 분산`,
      capacityGap > 0
        ? `[목표 미달 대비] 현 라인 CT(${lineCT}초) 기준 예상 일일 생산량은 약 ${expectedCapacity}대로 일일 목표(${dailyTarget}대) 대비 ${capacityGap}대 결손 예상. 잔업(+${Math.ceil((capacityGap * lineCT) / 60)}분) 또는 비가동시간 단축 검토 필요`
        : `가용 시간 내 목표 수량 완수를 위해 설비 인터록 및 툴링 최적화 진행`,
    ];

    return {
      statusType: 'CRITICAL',
      title: `[병목 위험 감지] ${primary.processName} 등 ${bottlenecks.length}개 공정 부하 초과`,
      keyBottlenecks: bottlenecks.map((b) => b.processName),
      explanation,
      recommendations,
    };
  }

  if (warnings.length > 0) {
    const warningNames = warnings.map((w) => w.processName).join(', ');
    return {
      statusType: 'WARNING',
      title: `[주의 단계] ${warnings.length}개 공정 여유율 부족 (부하율 90~100%)`,
      keyBottlenecks: warnings.map((w) => w.processName),
      explanation: `현재 [${warningNames}] 공정의 부하율이 90%를 초과하여 작업시간 여유가 타이트합니다. 사소한 부품 불량이나 작업자 숙련도 차이로 인해 즉시 병목으로 전이될 수 있는 한계 상황입니다.`,
      recommendations: [
        '해당 주의 공정의 작업 표준 및 툴 세팅을 사전 점검하여 예기치 않은 지연 방지',
        '고난이도 옵션 차량(Special 등급)의 투입 간격을 2~3대 이상 유지하도록 시퀀싱(Sequencing) 관리',
        '현 생산계획 유지 시 예상 생산량은 ' + expectedCapacity + '대로 목표 달성 가능하나 안전 마진 확보 권장',
      ],
    };
  }

  return {
    statusType: 'HEALTHY',
    title: '[정상 운영] 전 공정 부하율 90% 미만 안정권',
    keyBottlenecks: [],
    explanation: `모든 공정의 평균 Cycle Time이 목표 Takt Time(${targetTaktTime}초) 대비 90% 미만으로 충분한 작업 여유를 확보하고 있습니다. 라인 최고 CT는 ${lineCT}초이며 안정적인 목표 달성이 가능합니다.`,
    recommendations: [
      '현재 생산계획 유지 및 일일 생산목표 달성 순항 모니터링',
      '잉여 시간(Idle time)을 활용한 품질 검사 강화 및 공정 5S 활동 추진',
      `필요시 일일 생산 목표를 최대 ${expectedCapacity}대까지 상향 조정 가능한 여력 확보`,
    ],
  };
}

function createEmptyAnalysisResult(
  condition: ProductionCondition,
  gradeQuantities: Record<VehicleGrade, number>,
  processes: ProcessItem[],
  errorMessage: string
): ProductionAnalysisResult {
  const { totalUnits } = calculateGradeRatios(gradeQuantities);
  return {
    availableMinutes: 0,
    availableSeconds: 0,
    dailyTarget: condition.dailyTarget,
    totalPlannedUnits: totalUnits,
    targetTaktTime: 0,
    lineCT: 0,
    bottleneckProcesses: [],
    warningProcesses: [],
    normalProcesses: [],
    expectedCapacityUnits: 0,
    capacityAchievementRate: 0,
    targetDiscrepancy: totalUnits - condition.dailyTarget,
    processAnalyses: [],
    ruleBasedSummary: {
      statusType: 'INVALID',
      title: '[입력 데이터 오류/확인 필요]',
      keyBottlenecks: [],
      explanation: errorMessage,
      recommendations: ['상단 입력창의 근무시간, 목표 생산대수, 공정별 CT 값을 확인해 주시기 바랍니다.'],
    },
    isValid: false,
    validationError: errorMessage,
  };
}
