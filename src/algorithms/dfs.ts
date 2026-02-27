import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { getNeighbors, reconstructPath, toKey, buildResult, isSameCoord } from './utils';

export function dfs(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const visited = new Set<string>();
  const prev = new Map<string, Coordinate | null>();
  const visitedInOrder: Coordinate[] = [];
  const stack: Coordinate[] = [start];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const currKey = toKey(curr);

    if (visited.has(currKey)) continue;
    visited.add(currKey);
    visitedInOrder.push(curr);

    if (isSameCoord(curr, end)) {
      const path = reconstructPath(prev, start, end);
      return buildResult(visitedInOrder, path, true);
    }

    for (const neighbor of getNeighbors(grid, curr)) {
      const nKey = toKey(neighbor);
      if (!visited.has(nKey)) {
        prev.set(nKey, curr);
        stack.push(neighbor);
      }
    }
  }

  return buildResult(visitedInOrder, [], false);
}
