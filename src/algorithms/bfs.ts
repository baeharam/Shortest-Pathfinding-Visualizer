import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { getNeighbors, reconstructPath, toKey, buildResult, isSameCoord } from './utils';

export function bfs(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const visited = new Set<string>();
  const prev = new Map<string, Coordinate | null>();
  const visitedInOrder: Coordinate[] = [];
  const queue: Coordinate[] = [start];

  visited.add(toKey(start));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedInOrder.push(curr);

    if (isSameCoord(curr, end)) {
      const path = reconstructPath(prev, start, end);
      return buildResult(visitedInOrder, path, true);
    }

    for (const neighbor of getNeighbors(grid, curr)) {
      const nKey = toKey(neighbor);
      if (!visited.has(nKey)) {
        visited.add(nKey);
        prev.set(nKey, curr);
        queue.push(neighbor);
      }
    }
  }

  return buildResult(visitedInOrder, [], false);
}
