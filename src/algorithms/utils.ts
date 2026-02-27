import type { Cell, Coordinate, AlgorithmResult, AlgorithmStep } from '@/types';

// ===== 방향 벡터 (상하좌우) =====
export const DIRECTIONS: Coordinate[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

// ===== 좌표 키 변환 =====
export const toKey = (coord: Coordinate): string => `${coord.row},${coord.col}`;

export const fromKey = (key: string): Coordinate => {
  const [row, col] = key.split(',').map(Number);
  return { row: row!, col: col! };
};

// ===== 좌표 동일 여부 =====
export const isSameCoord = (a: Coordinate, b: Coordinate): boolean =>
  a.row === b.row && a.col === b.col;

// ===== 유효한 이웃 셀 반환 =====
export const getNeighbors = (
  grid: Cell[][],
  coord: Coordinate,
  allowDiagonal = false
): Coordinate[] => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const neighbors: Coordinate[] = [];

  const dirs = allowDiagonal
    ? [
        ...DIRECTIONS,
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 },
      ]
    : DIRECTIONS;

  for (const d of dirs) {
    const nr = coord.row + d.row;
    const nc = coord.col + d.col;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr]![nc]!.type !== 'wall') {
      neighbors.push({ row: nr, col: nc });
    }
  }

  return neighbors;
};

// ===== 경로 재구성 =====
export const reconstructPath = (
  prev: Map<string, Coordinate | null>,
  start: Coordinate,
  end: Coordinate
): Coordinate[] => {
  const path: Coordinate[] = [];
  let current: Coordinate | null = end;

  while (current && !isSameCoord(current, start)) {
    path.unshift(current);
    current = prev.get(toKey(current)) ?? null;
  }

  if (current) path.unshift(start);
  return path;
};

// ===== 맨해튼 거리 (휴리스틱) =====
export const manhattan = (a: Coordinate, b: Coordinate): number =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

// ===== 결과 빌더 =====
export const buildResult = (
  visitedInOrder: Coordinate[],
  path: Coordinate[],
  found: boolean
): AlgorithmResult => {
  const steps: AlgorithmStep[] = [];

  // 방문 셀을 하나씩 애니메이션 단계로
  for (const cell of visitedInOrder) {
    steps.push({ type: 'visit', cells: [cell] });
  }

  // 경로 셀 단계
  if (found && path.length > 0) {
    for (const cell of path) {
      steps.push({ type: 'path', cells: [cell] });
    }
  }

  return {
    steps,
    path,
    found,
    visitedCount: visitedInOrder.length,
    pathLength: path.length,
  };
};

// ===== 최소 힙 (우선순위 큐) =====
export class MinHeap<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  push(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top.item;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent]!.priority <= this.heap[i]!.priority) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i]!, this.heap[parent]!];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l]!.priority < this.heap[smallest]!.priority) smallest = l;
      if (r < n && this.heap[r]!.priority < this.heap[smallest]!.priority) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i]!, this.heap[smallest]!];
      i = smallest;
    }
  }
}
