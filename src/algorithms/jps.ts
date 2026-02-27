import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { MinHeap, toKey, buildResult, isSameCoord, manhattan, reconstructPath } from './utils';

// JPS: Jump Point Search
// 격자 그래프에서 A*를 최적화한 알고리즘 (비가중치, 4방향)
export function jps(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const isWalkable = (r: number, c: number): boolean =>
    r >= 0 && r < rows && c >= 0 && c < cols && grid[r]![c]!.type !== 'wall';

  const gCost = new Map<string, number>();
  const prev = new Map<string, Coordinate | null>();
  const visitedInOrder: Coordinate[] = [];
  const visited = new Set<string>();
  const pq = new MinHeap<Coordinate>();

  gCost.set(toKey(start), 0);
  pq.push(start, manhattan(start, end));

  while (!pq.isEmpty()) {
    const curr = pq.pop()!;
    const currKey = toKey(curr);

    if (visited.has(currKey)) continue;
    visited.add(currKey);
    visitedInOrder.push(curr);

    if (isSameCoord(curr, end)) {
      const path = reconstructPath(prev, start, end);
      return buildResult(visitedInOrder, path, true);
    }

    // JPS: 수평/수직 4방향으로 점프
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    for (const { dr, dc } of directions) {
      const jp = jump(curr.row, curr.col, dr, dc, end, isWalkable, rows, cols);

      if (jp) {
        const jpKey = toKey(jp);
        const dist = Math.abs(jp.row - curr.row) + Math.abs(jp.col - curr.col);
        const newG = (gCost.get(currKey) ?? Infinity) + dist;

        if (newG < (gCost.get(jpKey) ?? Infinity)) {
          gCost.set(jpKey, newG);
          prev.set(jpKey, curr);
          pq.push(jp, newG + manhattan(jp, end));

          // 점프 경로 중간 셀도 방문 기록
          const intermediate = getIntermediateCells(curr, jp);
          for (const cell of intermediate) {
            if (!visited.has(toKey(cell))) {
              visitedInOrder.push(cell);
            }
          }
        }
      }
    }
  }

  return buildResult(visitedInOrder, [], false);
}

// 점프 함수: 점프 포인트(강제 이웃이 있는 노드)를 찾음
function jump(
  r: number,
  c: number,
  dr: number,
  dc: number,
  end: Coordinate,
  isWalkable: (r: number, c: number) => boolean,
  rows: number,
  cols: number
): Coordinate | null {
  let cr = r + dr;
  let cc = c + dc;

  while (isWalkable(cr, cc)) {
    // 목표 도달
    if (cr === end.row && cc === end.col) return { row: cr, col: cc };

    // 강제 이웃 확인 (수평 이동)
    if (dc !== 0) {
      if (
        (!isWalkable(cr - 1, cc - dc) && isWalkable(cr - 1, cc)) ||
        (!isWalkable(cr + 1, cc - dc) && isWalkable(cr + 1, cc))
      ) {
        return { row: cr, col: cc };
      }
    }

    // 강제 이웃 확인 (수직 이동)
    if (dr !== 0) {
      if (
        (!isWalkable(cr - dr, cc - 1) && isWalkable(cr, cc - 1)) ||
        (!isWalkable(cr - dr, cc + 1) && isWalkable(cr, cc + 1))
      ) {
        return { row: cr, col: cc };
      }
    }

    // 경계 체크
    if (cr + dr < 0 || cr + dr >= rows || cc + dc < 0 || cc + dc >= cols) break;

    cr += dr;
    cc += dc;
  }

  return null;
}

// 두 좌표 사이의 직선 경로 셀들
function getIntermediateCells(from: Coordinate, to: Coordinate): Coordinate[] {
  const cells: Coordinate[] = [];
  const dr = Math.sign(to.row - from.row);
  const dc = Math.sign(to.col - from.col);
  let r = from.row + dr;
  let c = from.col + dc;

  while (r !== to.row || c !== to.col) {
    cells.push({ row: r, col: c });
    r += dr;
    c += dc;
  }

  return cells;
}
