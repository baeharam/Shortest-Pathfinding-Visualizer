import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Cell,
  Coordinate,
  AlgorithmId,
  AlgorithmResult,
  VisualizationStatus,
  SpeedLevel,
  DragMode,
  GridConfig,
} from '@/types';
import { DEFAULT_GRID_CONFIG, SPEED_MAP } from '@/types';

// ===== 그리드 초기화 유틸 =====
function createGrid(rows: number, cols: number, start: Coordinate, end: Coordinate): Cell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      type:
        r === start.row && c === start.col
          ? ('start' as const)
          : r === end.row && c === end.col
            ? ('end' as const)
            : ('empty' as const),
      weight: 1,
      isAnimating: false,
    }))
  );
}

// ===== 기본 start/end 위치 =====
const DEFAULT_START: Coordinate = {
  row: Math.floor(DEFAULT_GRID_CONFIG.rows / 2),
  col: Math.floor(DEFAULT_GRID_CONFIG.cols / 4),
};

const DEFAULT_END: Coordinate = {
  row: Math.floor(DEFAULT_GRID_CONFIG.rows / 2),
  col: Math.floor((DEFAULT_GRID_CONFIG.cols * 3) / 4),
};

// ===== 스토어 타입 =====
interface VisualizerState {
  // 그리드
  grid: Cell[][];
  gridConfig: GridConfig;
  startNode: Coordinate;
  endNode: Coordinate;

  // 알고리즘
  selectedAlgorithm: AlgorithmId;
  result: AlgorithmResult | null;

  // 시각화 제어
  status: VisualizationStatus;
  speed: SpeedLevel;

  // 드래그 모드
  dragMode: DragMode;
  isMouseDown: boolean;

  // 통계
  stats: {
    visitedCount: number;
    pathLength: number;
    executionMs: number;
  } | null;
}

interface VisualizerActions {
  // 그리드 조작
  setCell: (row: number, col: number, type: Cell['type']) => void;
  setCellWeight: (row: number, col: number, weight: number) => void;
  setStartNode: (coord: Coordinate) => void;
  setEndNode: (coord: Coordinate) => void;
  clearGrid: () => void;
  clearPath: () => void;
  resetGrid: () => void;

  // 알고리즘
  setAlgorithm: (id: AlgorithmId) => void;
  setResult: (result: AlgorithmResult | null) => void;

  // 시각화 제어
  setStatus: (status: VisualizationStatus) => void;
  setSpeed: (speed: SpeedLevel) => void;

  // 드래그
  setDragMode: (mode: DragMode) => void;
  setMouseDown: (down: boolean) => void;

  // 통계
  setStats: (stats: VisualizerState['stats']) => void;
}

type VisualizerStore = VisualizerState & VisualizerActions;

// ===== 스토어 =====
export const useVisualizerStore = create<VisualizerStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      grid: createGrid(DEFAULT_GRID_CONFIG.rows, DEFAULT_GRID_CONFIG.cols, DEFAULT_START, DEFAULT_END),
      gridConfig: DEFAULT_GRID_CONFIG,
      startNode: DEFAULT_START,
      endNode: DEFAULT_END,
      selectedAlgorithm: 'dijkstra',
      result: null,
      status: 'idle',
      speed: 'normal',
      dragMode: null,
      isMouseDown: false,
      stats: null,

      // 단일 셀 타입 변경
      setCell: (row, col, type) =>
        set(
          (state) => {
            const newGrid = state.grid.map((r) => [...r]);
            const cell = { ...newGrid[row]![col]! };

            // start/end는 타입 변경 불가 (전용 액션 사용)
            if (cell.type === 'start' || cell.type === 'end') return state;
            cell.type = type;
            newGrid[row]![col] = cell;
            return { grid: newGrid };
          },
          false,
          'setCell'
        ),

      // 셀 가중치 변경
      setCellWeight: (row, col, weight) =>
        set(
          (state) => {
            const newGrid = state.grid.map((r) => [...r]);
            newGrid[row]![col] = { ...newGrid[row]![col]!, weight, type: 'weight' };
            return { grid: newGrid };
          },
          false,
          'setCellWeight'
        ),

      // 시작점 이동
      setStartNode: (coord) =>
        set(
          (state) => {
            const newGrid = state.grid.map((r) => [...r]);
            const prev = state.startNode;

            // 이전 시작점 초기화
            if (newGrid[prev.row]![prev.col]!.type === 'start') {
              newGrid[prev.row]![prev.col] = {
                ...newGrid[prev.row]![prev.col]!,
                type: 'empty',
              };
            }

            // 새 시작점 설정 (end가 있던 자리면 무시)
            if (newGrid[coord.row]![coord.col]!.type !== 'end') {
              newGrid[coord.row]![coord.col] = {
                ...newGrid[coord.row]![coord.col]!,
                type: 'start',
              };
              return { grid: newGrid, startNode: coord };
            }
            return state;
          },
          false,
          'setStartNode'
        ),

      // 종료점 이동
      setEndNode: (coord) =>
        set(
          (state) => {
            const newGrid = state.grid.map((r) => [...r]);
            const prev = state.endNode;

            if (newGrid[prev.row]![prev.col]!.type === 'end') {
              newGrid[prev.row]![prev.col] = {
                ...newGrid[prev.row]![prev.col]!,
                type: 'empty',
              };
            }

            if (newGrid[coord.row]![coord.col]!.type !== 'start') {
              newGrid[coord.row]![coord.col] = {
                ...newGrid[coord.row]![coord.col]!,
                type: 'end',
              };
              return { grid: newGrid, endNode: coord };
            }
            return state;
          },
          false,
          'setEndNode'
        ),

      // 경로/방문 셀 초기화 (벽은 유지)
      clearPath: () =>
        set(
          (state) => ({
            grid: state.grid.map((row) =>
              row.map((cell) =>
                cell.type === 'visited' || cell.type === 'path'
                  ? { ...cell, type: 'empty' as const }
                  : cell
              )
            ),
            result: null,
            status: 'idle',
            stats: null,
          }),
          false,
          'clearPath'
        ),

      // 전체 그리드 초기화 (벽 포함)
      clearGrid: () => {
        const { gridConfig, startNode, endNode } = get();
        set(
          {
            grid: createGrid(gridConfig.rows, gridConfig.cols, startNode, endNode),
            result: null,
            status: 'idle',
            stats: null,
          },
          false,
          'clearGrid'
        );
      },

      // 그리드 완전 초기화 (start/end 위치도 리셋)
      resetGrid: () =>
        set(
          {
            grid: createGrid(
              DEFAULT_GRID_CONFIG.rows,
              DEFAULT_GRID_CONFIG.cols,
              DEFAULT_START,
              DEFAULT_END
            ),
            startNode: DEFAULT_START,
            endNode: DEFAULT_END,
            result: null,
            status: 'idle',
            stats: null,
          },
          false,
          'resetGrid'
        ),

      // 알고리즘 선택
      setAlgorithm: (id) => set({ selectedAlgorithm: id }, false, 'setAlgorithm'),

      // 결과 저장
      setResult: (result) => set({ result }, false, 'setResult'),

      // 상태 변경
      setStatus: (status) => set({ status }, false, 'setStatus'),

      // 속도 변경
      setSpeed: (speed) => set({ speed }, false, 'setSpeed'),

      // 드래그 모드
      setDragMode: (dragMode) => set({ dragMode }, false, 'setDragMode'),
      setMouseDown: (isMouseDown) => set({ isMouseDown }, false, 'setMouseDown'),

      // 통계
      setStats: (stats) => set({ stats }, false, 'setStats'),
    }),
    { name: 'PathfinderStore' }
  )
);

// ===== 셀렉터 (리렌더링 최소화) =====
export const selectGrid = (s: VisualizerStore) => s.grid;
export const selectStartNode = (s: VisualizerStore) => s.startNode;
export const selectEndNode = (s: VisualizerStore) => s.endNode;
export const selectStatus = (s: VisualizerStore) => s.status;
export const selectAlgorithm = (s: VisualizerStore) => s.selectedAlgorithm;
export const selectSpeed = (s: VisualizerStore) => s.speed;
export const selectSpeedMs = (s: VisualizerStore) => SPEED_MAP[s.speed];
export const selectStats = (s: VisualizerStore) => s.stats;
export const selectDragMode = (s: VisualizerStore) => s.dragMode;
export const selectIsMouseDown = (s: VisualizerStore) => s.isMouseDown;
