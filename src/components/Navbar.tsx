import React from 'react';
import {
  Activity,
  Layers,
  Sliders,
  Sparkles,
  RotateCcw,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'processes' | 'grades' | 'simulation' | 'review';
  setActiveTab: (tab: 'dashboard' | 'processes' | 'grades' | 'simulation' | 'review') => void;
  onReset: () => void;
  onExportCSV: () => void;
  bottleneckCount: number;
  hasDiscrepancy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  onExportCSV,
  bottleneckCount,
  hasDiscrepancy,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                의장라인 병목 탐지 대시보드
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Trim Assembly Bottleneck Simulator
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>종합 대시보드</span>
              {bottleneckCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 tabular-nums">
                  {bottleneckCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('processes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'processes'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>공정 & CT 설정</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>등급·옵션 매트릭스</span>
              {hasDiscrepancy && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'simulation'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>What-If 시뮬레이션</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'review'
                  ? 'bg-amber-50 text-amber-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>20년차 엔지니어 검토서</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReset}
              title="기획서 표준 목업 데이터로 초기화"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>목업 초기화</span>
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>분석 보고서 (CSV)</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            종합 대시보드
          </button>
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'processes' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            공정 CT
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'grades' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            등급 & 옵션
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'simulation' ? 'bg-purple-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            시뮬레이션
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'review' ? 'bg-amber-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            엔지니어 검토서
          </button>
        </div>
      </div>
    </header>
  );
};
