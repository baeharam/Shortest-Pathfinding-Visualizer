import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { MinHeap, getNeighbors, reconstructPath, toKey, manhattan, buildResult } from './utils';

// Greedy Best-First Search: 휴리스틱만 사용, 최단경로 미보장
export function greedyBfs(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const visited = new Set<string>();
  const prev = new Map<string, Coordinate | null>();
  const visitedInOrder: Coordinate[] = [];
  const pq = new MinHeap<Coordinate>();

  visited.add(toKey(start));
  pq.push(start, manhattan(start, end));

  while (!pq.isEmpty()) {
    const curr = pq.pop()!;
    const currKey = toKey(curr);
    visitedInOrder.push(curr);

    if (curr.row === end.row && curr.col === end.col) {
      const path = reconstructPath(prev, start, end);
      return buildResult(visitedInOrder, path, true);
    }

    for (const neighbor of getNeighbors(grid, curr)) {
      const nKey = toKey(neighbor);
      if (!visited.has(nKey)) {
        visited.add(nKey);
        prev.set(nKey, curr);
        pq.push(neighbor, manhattan(neighbor, end));
      }
    }

    void currKey; // 사용하지 않는 변수 억제
  }

  return buildResult(visitedInOrder, [], false);
}
