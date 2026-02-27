// ===== 좌표 =====
export interface Coordinate {
  row: number;
  col: number;
}

// ===== 셀 상태 =====
export type CellType =
  | 'empty'
  | 'wall'
  | 'start'
  | 'end'
  | 'visited'
  | 'path'
  | 'weight';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  weight: number; // 1 = 일반, 5 = 가중치 노드
  isAnimating: boolean;
}

// ===== 알고리즘 =====
export type AlgorithmId =
  | 'dijkstra'
  | 'astar'
  | 'bfs'
  | 'dfs'
  | 'bellman-ford'
  | 'bidirectional-bfs'
  | 'jps'
  | 'greedy-bfs';

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  description: string;
  weighted: boolean; // 가중치 지원 여부
  guaranteed: boolean; // 최단경로 보장 여부
}

export const ALGORITHM_LIST: AlgorithmInfo[] = [
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    description: '가중치 그래프에서 최단경로를 보장하는 알고리즘',
    weighted: true,
    guaranteed: true,
  },
  {
    id: 'astar',
    name: 'A* Search',
    description: '휴리스틱을 활용해 최단경로를 효율적으로 탐색',
    weighted: true,
    guaranteed: true,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    description: '비가중치 그래프에서 최단경로를 보장',
    weighted: false,
    guaranteed: true,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    description: '최단경로를 보장하지 않는 깊이 우선 탐색',
    weighted: false,
    guaranteed: false,
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford',
    description: '음수 가중치도 처리 가능한 최단경로 알고리즘',
    weighted: true,
    guaranteed: true,
  },
  {
    id: 'bidirectional-bfs',
    name: 'Bidirectional BFS',
    description: '시작과 끝에서 동시에 탐색하는 양방향 BFS',
    weighted: false,
    guaranteed: true,
  },
  {
    id: 'jps',
    name: 'Jump Point Search',
    description: '격자 탐색에 최적화된 A* 변형 알고리즘',
    weighted: false,
    guaranteed: true,
  },
  {
    id: 'greedy-bfs',
    name: 'Greedy Best-First Search',
    description: '휴리스틱만 사용하는 탐욕적 탐색 (최단경로 미보장)',
    weighted: false,
    guaranteed: false,
  },
];

// ===== 알고리즘 실행 결과 =====
export interface AlgorithmStep {
  type: 'visit' | 'path';
  cells: Coordinate[];
}

export interface AlgorithmResult {
  steps: AlgorithmStep[]; // 애니메이션 단계
  path: Coordinate[]; // 최종 최단경로
  found: boolean;
  visitedCount: number;
  pathLength: number;
}

// ===== 애니메이션 상태 =====
export type VisualizationStatus = 'idle' | 'running' | 'paused' | 'done';

// ===== 그리드 설정 =====
export interface GridConfig {
  rows: number;
  cols: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  rows: 22,
  cols: 55,
};

// ===== 마우스 드래그 모드 =====
export type DragMode = 'wall' | 'erase' | 'move-start' | 'move-end' | 'weight' | null;

// ===== 속도 설정 =====
export type SpeedLevel = 'fast' | 'normal' | 'slow';

export const SPEED_MAP: Record<SpeedLevel, number> = {
  fast: 10,
  normal: 30,
  slow: 80,
};
