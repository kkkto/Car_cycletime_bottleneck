import {
  ProductionCondition,
  VehicleGrade,
  VehicleOption,
  ProcessItem,
  SimulationScenario,
} from '../types';

export const INITIAL_PRODUCTION_CONDITION: ProductionCondition = {
  dailyTarget: 500, // 500대
  workingHoursMinutes: 480, // 8시간 (480분)
  breakMinutes: 60, // 60분
  downtimeMinutes: 20, // 20분
};

export const INITIAL_GRADE_QUANTITIES: Record<VehicleGrade, number> = {
  Basic: 200,
  Classic: 150,
  Premium: 100,
  Special: 50,
};

export const INITIAL_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'opt_surround_view',
    name: '서라운드 뷰 카메라',
    description: '360도 전방위 카메라 및 측후방 어라운드 뷰 와이어링 하네스',
    gradeApplied: {
      Basic: false,
      Classic: false,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_front_radar',
    name: '전방 레이더 센서',
    description: '스마트 크루즈 컨트롤(SCC) 및 긴급제동(FCA)용 레이더 모듈',
    gradeApplied: {
      Basic: false,
      Classic: true,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_hud',
    name: '헤드업 디스플레이 (HUD)',
    description: '윈드실드 투영 디스플레이 유닛 및 광학 정렬 모듈',
    gradeApplied: {
      Basic: false,
      Classic: false,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_ventilated_seat',
    name: '전동·통풍 시트',
    description: '운전석/동승석 전동 조절 모터, 통풍 블로워 및 메모리 와이어링',
    gradeApplied: {
      Basic: false,
      Classic: true,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_sunroof',
    name: '파노라마 선루프',
    description: '글래스 루프 어셈블리, 전동 롤 블라인드 및 구동 모터',
    gradeApplied: {
      Basic: false,
      Classic: false,
      Premium: false,
      Special: true,
    },
  },
];

export const INITIAL_PROCESSES: ProcessItem[] = [
  {
    id: 'proc_1',
    name: '대시보드 조립',
    order: 1,
    cycleTimeByGrade: {
      Basic: 40,
      Classic: 45,
      Premium: 65,
      Special: 75,
    },
  },
  {
    id: 'proc_2',
    name: '전장 조립',
    order: 2,
    cycleTimeByGrade: {
      Basic: 35,
      Classic: 45,
      Premium: 55,
      Special: 60,
    },
  },
  {
    id: 'proc_3',
    name: '시트 장착',
    order: 3,
    cycleTimeByGrade: {
      Basic: 40,
      Classic: 50,
      Premium: 65,
      Special: 75,
    },
  },
  {
    id: 'proc_4',
    name: '루프 조립',
    order: 4,
    cycleTimeByGrade: {
      Basic: 30,
      Classic: 35,
      Premium: 40,
      Special: 65,
    },
  },
  {
    id: 'proc_5',
    name: '외장 조립',
    order: 5,
    cycleTimeByGrade: {
      Basic: 35,
      Classic: 40,
      Premium: 45,
      Special: 50,
    },
  },
];

export const PRESET_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scenario_a',
    name: '시나리오 A (기준 계획)',
    description: 'Basic 40% (200대), Classic 30% (150대), Premium 20% (100대), Special 10% (50대)',
    gradeQuantities: {
      Basic: 200,
      Classic: 150,
      Premium: 100,
      Special: 50,
    },
  },
  {
    id: 'scenario_b',
    name: '시나리오 B (중/고사양 확대)',
    description: 'Basic 20% (100대), Classic 30% (150대), Premium 30% (150대), Special 20% (100대)',
    gradeQuantities: {
      Basic: 100,
      Classic: 150,
      Premium: 150,
      Special: 100,
    },
  },
  {
    id: 'scenario_c',
    name: '시나리오 C (최고급 스페셜 집중)',
    description: 'Basic 10% (50대), Classic 20% (100대), Premium 30% (150대), Special 40% (200대)',
    gradeQuantities: {
      Basic: 50,
      Classic: 100,
      Premium: 150,
      Special: 200,
    },
  },
];

export const TEST_SUITE_PRESETS: Array<{
  id: string;
  name: string;
  category: string;
  description: string;
  expectedOutcome: string;
  gradeQuantities?: Record<VehicleGrade, number>;
  conditionPatch?: Partial<ProductionCondition>;
  processCTPatch?: { processId: string; grade: VehicleGrade; newCT: number }[];
}> = [
  {
    id: 'test_1_basic_surge',
    name: '테스트 1. Basic 생산 비율 증가',
    category: '믹스 비율 검증',
    description: 'Basic 70% (350대), Classic 20% (100대), Premium 6% (30대), Special 4% (20대)',
    expectedOutcome: '옵션 작업이 적은 Basic 비중 확대로 모든 공정 평균 CT 감소 및 부하율 90% 이하 정상권 진입',
    gradeQuantities: {
      Basic: 350,
      Classic: 100,
      Premium: 30,
      Special: 20,
    },
  },
  {
    id: 'test_2_special_surge',
    name: '테스트 2. Special 생산 비율 증가',
    category: '믹스 비율 검증',
    description: 'Basic 10% (50대), Classic 10% (50대), Premium 30% (150대), Special 50% (250대)',
    expectedOutcome: '옵션 장착이 많은 Special 급증으로 시트/대시보드 공정 CT 급상승, 심각한 라인 병목 발생',
    gradeQuantities: {
      Basic: 50,
      Classic: 50,
      Premium: 150,
      Special: 250,
    },
  },
  {
    id: 'test_3_extreme_shift',
    name: '테스트 3. 특정 등급 비율 급변',
    category: '민감도 검증',
    description: 'Premium 단일 등급을 60%(300대)로 급증시키고 Basic을 10%(50대)로 축소',
    expectedOutcome: '대시보드/시트 장착 공정의 부하율이 110%를 초과하며 즉시 병목 공정으로 탐지 및 알림 갱신',
    gradeQuantities: {
      Basic: 50,
      Classic: 100,
      Premium: 300,
      Special: 50,
    },
  },
  {
    id: 'test_5_target_increase',
    name: '테스트 5. 일일 생산 목표 상향 (500대 -> 600대)',
    category: 'Takt Time 검증',
    description: '근무시간(400분) 유지 상태에서 일일 생산 목표를 600대로 상향',
    expectedOutcome: 'Takt Time이 48초에서 40초로 단축되며 전 공정 부하율 급증(대시보드 125%, 시트 128.8%)',
    conditionPatch: {
      dailyTarget: 600,
    },
  },
  {
    id: 'test_6_available_time_drop',
    name: '테스트 6. 가용 생산시간 감소 (비가동시간 +60분)',
    category: 'Takt Time 검증',
    description: '비가동시간을 20분에서 80분으로 증가 (가용시간 400분 -> 340분으로 축소)',
    expectedOutcome: '가용시간 축소로 Takt Time이 40.8초로 단축되어 전장 조립까지 병목 상태로 추가 전이',
    conditionPatch: {
      downtimeMinutes: 80,
    },
  },
];
