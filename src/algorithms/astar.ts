import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { MinHeap, getNeighbors, reconstructPath, toKey, manhattan, buildResult } from './utils';

export function astar(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const gCost = new Map<string, number>();
  const fCost = new Map<string, number>();
  const prev = new Map<string, Coordinate | null>();
  const visited = new Set<string>();
  const visitedInOrder: Coordinate[] = [];
  const pq = new MinHeap<Coordinate>();

  const startKey = toKey(start);
  gCost.set(startKey, 0);
  fCost.set(startKey, manhattan(start, end));
  pq.push(start, fCost.get(startKey)!);

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
      const newG = (gCost.get(currKey) ?? Infinity) + cell.weight;

      if (newG < (gCost.get(nKey) ?? Infinity)) {
        gCost.set(nKey, newG);
        const f = newG + manhattan(neighbor, end);
        fCost.set(nKey, f);
        prev.set(nKey, curr);
        pq.push(neighbor, f);
      }
    }
  }

  return buildResult(visitedInOrder, [], false);
}
