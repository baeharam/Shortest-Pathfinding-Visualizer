import { useVisualizerStore } from '@/store/visualizer';
import { useVisualization } from '@/hooks/useVisualization';
import { ALGORITHM_LIST } from '@/types';
import type { AlgorithmId, SpeedLevel } from '@/types';
import { CustomSelect } from './CustomSelect';
import type { SelectOption } from './CustomSelect';

export function Header() {
  const selectedAlgorithm = useVisualizerStore((s) => s.selectedAlgorithm);
  const status = useVisualizerStore((s) => s.status);
  const speed = useVisualizerStore((s) => s.speed);
  const stats = useVisualizerStore((s) => s.stats);
  const { setAlgorithm, setSpeed, clearGrid, clearPath } = useVisualizerStore();
  const { start, pause, resume, stop } = useVisualization();

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isDone = status === 'done';
  const isActive = isRunning || isPaused;

  const algoInfo = ALGORITHM_LIST.find((a) => a.id === selectedAlgorithm);

  return (
    <header className="bg-[#080818] border-b border-cyan-900/40 px-6 py-4 flex items-center gap-4 flex-wrap">
      {/* 타이틀 */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-cyan-400 text-xl font-bold tracking-tight">⬡</span>
        <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
          Pathfinder
        </h1>
      </div>

      <div className="h-5 w-px bg-slate-600" />

      {/* 알고리즘 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm whitespace-nowrap">알고리즘</label>
        <CustomSelect
          value={selectedAlgorithm}
          onChange={(v) => setAlgorithm(v as AlgorithmId)}
          options={ALGORITHM_LIST.map<SelectOption>((algo) => ({ value: algo.id, label: algo.name }))}
          disabled={isActive}
        />
      </div>

      {/* 속도 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm whitespace-nowrap">속도</label>
        <CustomSelect
          value={speed}
          onChange={(v) => setSpeed(v as SpeedLevel)}
          options={[
            { value: 'fast', label: '빠름' },
            { value: 'normal', label: '보통' },
            { value: 'slow', label: '느림' },
          ]}
          disabled={isRunning}
        />
      </div>

      <div className="h-5 w-px bg-slate-600" />

      {/* 실행 버튼들 */}
      <div className="flex items-center gap-2">
        {!isActive && (
          <button
            onClick={start}
            disabled={isDone}
            className="bg-cyan-600 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed
                       text-white text-sm font-medium px-4 py-1.5 rounded transition-colors shadow-[0_0_14px_rgba(0,229,255,0.4)]"
          >
            ▶ 시각화
          </button>
        )}

        {isRunning && (
          <button
            onClick={pause}
            className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors shadow-[0_0_12px_rgba(245,158,11,0.5)]"
          >
            ⏸ 일시정지
          </button>
        )}

        {isPaused && (
          <button
            onClick={resume}
            className="bg-emerald-700 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors shadow-[0_0_12px_rgba(0,230,118,0.5)]"
          >
            ▶ 재개
          </button>
        )}

        {isActive && (
          <button
            onClick={stop}
            className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors border border-slate-600"
          >
            ✕ 중지
          </button>
        )}
      </div>

      <div className="h-5 w-px bg-slate-600" />

      {/* 초기화 버튼들 */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearPath}
          disabled={isActive}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed
                     text-slate-300 text-sm px-3 py-1.5 rounded transition-colors border border-slate-700"
        >
          경로 초기화
        </button>
        <button
          onClick={clearGrid}
          disabled={isActive}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed
                     text-slate-300 text-sm px-3 py-1.5 rounded transition-colors border border-slate-700"
        >
          그리드 초기화
        </button>
      </div>

      {/* 통계 (완료 후 표시) */}
      {isDone && stats && (
        <>
          <div className="h-5 w-px bg-slate-600" />
          <div className="flex items-center gap-3 text-xs">
            {algoInfo?.guaranteed ? (
              <span className="text-emerald-400 font-medium">✓ 최단경로 보장</span>
            ) : (
              <span className="text-amber-400 font-medium">⚠ 최단경로 미보장</span>
            )}
            <span className="text-slate-500">방문: <span className="text-cyan-400 font-medium">{stats.visitedCount}</span></span>
            <span className="text-slate-500">경로: <span className="text-cyan-300 font-medium">{stats.pathLength}</span> 칸</span>
            <span className="text-slate-500">시간: <span className="text-cyan-300 font-medium">{stats.executionMs.toFixed(2)}</span>ms</span>
          </div>
        </>
      )}

      {/* 알고리즘 설명 (우측) */}
      {algoInfo && (
        <div className="ml-auto text-xs text-slate-500 hidden xl:block max-w-xs text-right">
          {algoInfo.description}
        </div>
      )}
    </header>
  );
}
