export type VehicleGrade = 'Basic' | 'Classic' | 'Premium' | 'Special';

export const VEHICLE_GRADES: VehicleGrade[] = ['Basic', 'Classic', 'Premium', 'Special'];

export interface ProductionCondition {
  dailyTarget: number; // 일일 생산 목표 (대)
  workingHoursMinutes: number; // 일일 근무시간 (분)
  breakMinutes: number; // 휴식시간 (분)
  downtimeMinutes: number; // 기타 비가동시간 (분)
}

export interface GradeProduction {
  grade: VehicleGrade;
  quantity: number;
  ratio: number; // %
}

export interface VehicleOption {
  id: string;
  name: string;
  description: string;
  gradeApplied: Record<VehicleGrade, boolean>;
}

export interface ProcessItem {
  id: string;
  name: string;
  order: number;
  cycleTimeByGrade: Record<VehicleGrade, number>; // in seconds
}

export type BottleneckStatus = 'NORMAL' | 'WARNING' | 'BOTTLENECK';

export interface ProcessAnalysis {
  processId: string;
  processName: string;
  order: number;
  cycleTimeByGrade: Record<VehicleGrade, number>;
  weightedAvgCT: number; // 초 (가중평균)
  targetTaktTime: number; // 초
  loadRate: number; // % (부하율)
  excessTime: number; // 초 (가중평균 CT - Takt Time)
  status: BottleneckStatus;
  maxGrade: { grade: VehicleGrade; ct: number };
  minGrade: { grade: VehicleGrade; ct: number };
}

export interface RuleBasedSummary {
  statusType: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'INVALID';
  title: string;
  keyBottlenecks: string[];
  explanation: string;
  recommendations: string[];
}

export interface ProductionAnalysisResult {
  availableMinutes: number;
  availableSeconds: number;
  dailyTarget: number;
  totalPlannedUnits: number;
  targetTaktTime: number;
  lineCT: number; // MAX(공정별 평균 CT)
  bottleneckProcesses: ProcessAnalysis[];
  warningProcesses: ProcessAnalysis[];
  normalProcesses: ProcessAnalysis[];
  expectedCapacityUnits: number; // floor(가용초 / 라인 CT)
  capacityAchievementRate: number; // %
  targetDiscrepancy: number; // totalPlannedUnits - dailyTarget
  processAnalyses: ProcessAnalysis[];
  ruleBasedSummary: RuleBasedSummary;
  isValid: boolean;
  validationError?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  gradeQuantities: Record<VehicleGrade, number>;
  conditions?: Partial<ProductionCondition>;
}
