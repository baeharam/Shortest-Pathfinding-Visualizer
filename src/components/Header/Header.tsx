import { useVisualizerStore } from '@/store/visualizer';
import { useVisualization } from '@/hooks/useVisualization';
import { ALGORITHM_LIST } from '@/types';
import type { AlgorithmId, SpeedLevel } from '@/types';

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
    <header className="bg-[#0f172a] border-b border-slate-700 px-6 py-3 flex items-center gap-4 flex-wrap">
      {/* 타이틀 */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-indigo-400 text-xl font-bold tracking-tight">⬡</span>
        <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
          Pathfinder
        </h1>
      </div>

      <div className="h-5 w-px bg-slate-600" />

      {/* 알고리즘 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm whitespace-nowrap">Algorithm</label>
        <select
          value={selectedAlgorithm}
          onChange={(e) => setAlgorithm(e.target.value as AlgorithmId)}
          disabled={isActive}
          className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-slate-600
                     focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                     hover:border-slate-500 transition-colors"
        >
          {ALGORITHM_LIST.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.name}
            </option>
          ))}
        </select>
      </div>

      {/* 속도 선택 */}
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm whitespace-nowrap">Speed</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value as SpeedLevel)}
          disabled={isRunning}
          className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-slate-600
                     focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                     hover:border-slate-500 transition-colors"
        >
          <option value="fast">Fast</option>
          <option value="normal">Normal</option>
          <option value="slow">Slow</option>
        </select>
      </div>

      <div className="h-5 w-px bg-slate-600" />

      {/* 실행 버튼들 */}
      <div className="flex items-center gap-2">
        {!isActive && (
          <button
            onClick={start}
            disabled={isDone}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                       text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            ▶ Visualize
          </button>
        )}

        {isRunning && (
          <button
            onClick={pause}
            className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            ⏸ Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={resume}
            className="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            ▶ Resume
          </button>
        )}

        {isActive && (
          <button
            onClick={stop}
            className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            ✕ Stop
          </button>
        )}
      </div>

      <div className="h-5 w-px bg-slate-600" />

      {/* 초기화 버튼들 */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearPath}
          disabled={isActive}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed
                     text-slate-200 text-sm px-3 py-1.5 rounded transition-colors"
        >
          Clear Path
        </button>
        <button
          onClick={clearGrid}
          disabled={isActive}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed
                     text-slate-200 text-sm px-3 py-1.5 rounded transition-colors"
        >
          Clear Grid
        </button>
      </div>

      {/* 통계 (완료 후 표시) */}
      {isDone && stats && (
        <>
          <div className="h-5 w-px bg-slate-600" />
          <div className="flex items-center gap-3 text-xs">
            {algoInfo?.guaranteed ? (
              <span className="text-emerald-400 font-medium">✓ Shortest Path</span>
            ) : (
              <span className="text-amber-400 font-medium">⚠ Not Guaranteed</span>
            )}
            <span className="text-slate-400">
              Visited: <span className="text-white font-medium">{stats.visitedCount}</span>
            </span>
            <span className="text-slate-400">
              Path: <span className="text-white font-medium">{stats.pathLength}</span> cells
            </span>
            <span className="text-slate-400">
              Time: <span className="text-white font-medium">{stats.executionMs.toFixed(2)}</span>ms
            </span>
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
