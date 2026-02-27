import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { MinHeap, getNeighbors, reconstructPath, toKey, buildResult } from './utils';

export function dijkstra(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const dist = new Map<string, number>();
  const prev = new Map<string, Coordinate | null>();
  const visited = new Set<string>();
  const visitedInOrder: Coordinate[] = [];
  const pq = new MinHeap<Coordinate>();

  const startKey = toKey(start);
  dist.set(startKey, 0);
  pq.push(start, 0);

  while (!pq.isEmpty()) {
    const curr = pq.pop()!;
    const currKey = toKey(curr);

    if (visited.has(currKey)) continue;
    visited.add(currKey);
    visitedInOrder.push(curr);

    if (curr.row === end.row && curr.col === end.col) {
      const path = reconstructPath(prev, start, end);
      return buildResult(visitedInOrder, path, true);
    }

    for (const neighbor of getNeighbors(grid, curr)) {
      const nKey = toKey(neighbor);
      const cell = grid[neighbor.row]![neighbor.col]!;
      const newDist = (dist.get(currKey) ?? Infinity) + cell.weight;

      if (newDist < (dist.get(nKey) ?? Infinity)) {
        dist.set(nKey, newDist);
        prev.set(nKey, curr);
        pq.push(neighbor, newDist);
      }
    }
  }

  return buildResult(visitedInOrder, [], false);
}
