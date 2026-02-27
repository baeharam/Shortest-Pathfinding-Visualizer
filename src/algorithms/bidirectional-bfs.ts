import type { Cell, Coordinate, AlgorithmResult } from '@/types';
import { getNeighbors, toKey, buildResult, isSameCoord, reconstructPath } from './utils';

export function bidirectionalBfs(
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  // 시작과 끝이 같으면 즉시 반환
  if (isSameCoord(start, end)) {
    return buildResult([start], [start], true);
  }

  const visitedInOrder: Coordinate[] = [];

  // 양방향 각각의 방문 집합과 이전 경로
  const visitedFwd = new Set<string>([toKey(start)]);
  const visitedBwd = new Set<string>([toKey(end)]);
  const prevFwd = new Map<string, Coordinate | null>();
  const prevBwd = new Map<string, Coordinate | null>();

  let queueFwd: Coordinate[] = [start];
  let queueBwd: Coordinate[] = [end];

  const expandLayer = (
    queue: Coordinate[],
    visited: Set<string>,
    prev: Map<string, Coordinate | null>,
    otherVisited: Set<string>
  ): Coordinate | null => {
    const nextQueue: Coordinate[] = [];

    for (const curr of queue) {
      visitedInOrder.push(curr);

      for (const neighbor of getNeighbors(grid, curr)) {
        const nKey = toKey(neighbor);

        // 반대편이 이미 방문한 노드 → 만남!
        if (otherVisited.has(nKey)) {
          prev.set(nKey, curr);
          return neighbor;
        }

        if (!visited.has(nKey)) {
          visited.add(nKey);
          prev.set(nKey, curr);
          nextQueue.push(neighbor);
        }
      }
    }

    return null; // 교차점 미발견, 다음 큐 반환을 위해 null
  };

  // 실제 교차점을 찾고 큐를 업데이트하는 함수
  const step = (
    queue: Coordinate[],
    visited: Set<string>,
    prev: Map<string, Coordinate | null>,
    otherVisited: Set<string>
  ): { next: Coordinate[]; meeting: Coordinate | null } => {
    const nextQueue: Coordinate[] = [];
    let meeting: Coordinate | null = null;

    for (const curr of queue) {
      visitedInOrder.push(curr);

      for (const neighbor of getNeighbors(grid, curr)) {
        const nKey = toKey(neighbor);

        if (otherVisited.has(nKey)) {
          if (!meeting) {
            prev.set(nKey, curr);
            meeting = neighbor;
          }
        }

        if (!visited.has(nKey)) {
          visited.add(nKey);
          prev.set(nKey, curr);
          nextQueue.push(neighbor);
        }
      }
    }

    return { next: nextQueue, meeting };
  };

  while (queueFwd.length > 0 || queueBwd.length > 0) {
    // 정방향 확장
    if (queueFwd.length > 0) {
      const { next, meeting } = step(queueFwd, visitedFwd, prevFwd, visitedBwd);
      queueFwd = next;

      if (meeting) {
        const path = buildBidirectionalPath(prevFwd, prevBwd, start, end, meeting);
        return buildResult(visitedInOrder, path, true);
      }
    }

    // 역방향 확장
    if (queueBwd.length > 0) {
      const { next, meeting } = step(queueBwd, visitedBwd, prevBwd, visitedFwd);
      queueBwd = next;

      if (meeting) {
        const path = buildBidirectionalPath(prevFwd, prevBwd, start, end, meeting);
        return buildResult(visitedInOrder, path, true);
      }
    }
  }

  // 사용하지 않는 expandLayer 함수 억제
  void expandLayer;

  return buildResult(visitedInOrder, [], false);
}

function buildBidirectionalPath(
  prevFwd: Map<string, Coordinate | null>,
  prevBwd: Map<string, Coordinate | null>,
  start: Coordinate,
  end: Coordinate,
  meeting: Coordinate
): Coordinate[] {
  // 정방향: start → meeting
  const fwdPath = reconstructPath(prevFwd, start, meeting);

  // 역방향: end → meeting → start 방향으로 prev 역추적
  const bwdPath: Coordinate[] = [];
  let curr: Coordinate | null = prevBwd.get(toKey(meeting)) ?? null;
  while (curr) {
    bwdPath.push(curr);
    if (isSameCoord(curr, end)) break;
    curr = prevBwd.get(toKey(curr)) ?? null;
  }

  return [...fwdPath, ...bwdPath];
}
