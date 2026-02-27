import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { getNeighbors, toKey, buildResult, isSameCoord } from './utils';

export function bellmanFord(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const dist = new Map<string, number>();
  const prev = new Map<string, Coordinate | null>();
  const visitedInOrder: Coordinate[] = [];
  const visitedSet = new Set<string>();

  // 모든 셀 초기화
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dist.set(toKey({ row: r, col: c }), Infinity);
    }
  }
  dist.set(toKey(start), 0);

  // V-1번 반복 (V = 비벽 셀 수)
  const totalCells = rows * cols;
  for (let i = 0; i < totalCells - 1; i++) {
    let updated = false;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const curr: Coordinate = { row: r, col: c };
        const currKey = toKey(curr);
        const currDist = dist.get(currKey) ?? Infinity;

        if (currDist === Infinity) continue;
        if (grid[r]![c]!.type === 'wall') continue;

        for (const neighbor of getNeighbors(grid, curr)) {
          const nKey = toKey(neighbor);
          const cell = grid[neighbor.row]![neighbor.col]!;
          const newDist = currDist + cell.weight;

          if (newDist < (dist.get(nKey) ?? Infinity)) {
            dist.set(nKey, newDist);
            prev.set(nKey, curr);
            updated = true;

            if (!visitedSet.has(nKey)) {
              visitedSet.add(nKey);
              visitedInOrder.push(neighbor);
            }
          }
        }
      }
    }

    if (!updated) break;
  }

  const endKey = toKey(end);
  if (dist.get(endKey) === Infinity) {
    return buildResult(visitedInOrder, [], false);
  }

  // 경로 재구성
  const path: Coordinate[] = [];
  let curr: Coordinate | null = end;
  while (curr && !isSameCoord(curr, start)) {
    path.unshift(curr);
    curr = prev.get(toKey(curr)) ?? null;
  }
  if (curr) path.unshift(start);

  return buildResult(visitedInOrder, path, true);
}
