import { describe, it, expect } from 'vitest';
import type { Cell, Coordinate } from '@/types';
import { dijkstra } from '@/algorithms/dijkstra';
import { astar } from '@/algorithms/astar';
import { bfs } from '@/algorithms/bfs';
import { dfs } from '@/algorithms/dfs';
import { bellmanFord } from '@/algorithms/bellman-ford';
import { bidirectionalBfs } from '@/algorithms/bidirectional-bfs';
import { greedyBfs } from '@/algorithms/greedy-bfs';

// ===== 테스트용 그리드 생성 =====
function makeGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      type: 'empty' as const,
      weight: 1,
      isAnimating: false,
    }))
  );
}

function setWall(grid: Cell[][], row: number, col: number): void {
  grid[row]![col]!.type = 'wall';
}

const START: Coordinate = { row: 0, col: 0 };
const END: Coordinate = { row: 4, col: 4 };

// ===== 공통 테스트 =====
const SHORTEST_PATH_ALGOS = [
  { name: 'Dijkstra', fn: dijkstra },
  { name: 'A*', fn: astar },
  { name: 'BFS', fn: bfs },
  { name: 'Bellman-Ford', fn: bellmanFord },
  { name: 'Bidirectional BFS', fn: bidirectionalBfs },
];

describe('Shortest-path algorithms', () => {
  for (const { name, fn } of SHORTEST_PATH_ALGOS) {
    describe(name, () => {
      it('open grid에서 경로를 찾는다', () => {
        const grid = makeGrid(5, 5);
        const result = fn(grid, START, END);

        expect(result.found).toBe(true);
        expect(result.path.length).toBeGreaterThan(0);
        expect(result.path[0]).toEqual(START);
        expect(result.path[result.path.length - 1]).toEqual(END);
      });

      it('경로가 없을 때 found=false 반환', () => {
        const grid = makeGrid(5, 5);
        // 수직 벽으로 막기
        for (let r = 0; r < 5; r++) setWall(grid, r, 2);

        const result = fn(grid, START, END);
        expect(result.found).toBe(false);
        expect(result.path).toHaveLength(0);
      });

      it('방문 셀을 기록한다', () => {
        const grid = makeGrid(5, 5);
        const result = fn(grid, START, END);

        expect(result.visitedCount).toBeGreaterThan(0);
        expect(result.steps.length).toBeGreaterThan(0);
      });
    });
  }
});

// ===== DFS 개별 테스트 (최단경로 미보장) =====
describe('DFS', () => {
  it('open grid에서 경로를 찾는다 (최단경로 미보장)', () => {
    const grid = makeGrid(5, 5);
    const result = dfs(grid, START, END);

    expect(result.found).toBe(true);
    expect(result.path.length).toBeGreaterThan(0);
  });

  it('경로가 없을 때 found=false 반환', () => {
    const grid = makeGrid(5, 5);
    for (let r = 0; r < 5; r++) setWall(grid, r, 2);

    const result = dfs(grid, START, END);
    expect(result.found).toBe(false);
  });
});

// ===== Greedy BFS 개별 테스트 (최단경로 미보장) =====
describe('Greedy BFS', () => {
  it('open grid에서 경로를 찾는다', () => {
    const grid = makeGrid(5, 5);
    const result = greedyBfs(grid, START, END);

    expect(result.found).toBe(true);
    expect(result.path.length).toBeGreaterThan(0);
  });
});

// ===== 가중치 테스트 (Dijkstra, A*) =====
describe('Weighted algorithms', () => {
  it('Dijkstra - 가중치가 낮은 경로를 선택한다', () => {
    const grid = makeGrid(3, 3);
    // 중앙 경로에 높은 가중치
    grid[1]![1]!.weight = 10;
    grid[1]![1]!.type = 'weight';

    const s: Coordinate = { row: 0, col: 0 };
    const e: Coordinate = { row: 2, col: 2 };

    const result = dijkstra(grid, s, e);
    expect(result.found).toBe(true);
    // 가중치 10 노드를 우회해야 함
    const passesCenter = result.path.some((c) => c.row === 1 && c.col === 1);
    expect(passesCenter).toBe(false); // 높은 가중치 셀 우회
  });
});

// ===== 엣지 케이스 =====
describe('Edge cases', () => {
  it('시작점과 끝점이 인접한 경우', () => {
    const grid = makeGrid(3, 3);
    const s: Coordinate = { row: 0, col: 0 };
    const e: Coordinate = { row: 0, col: 1 };

    for (const { fn } of SHORTEST_PATH_ALGOS) {
      const result = fn(grid, s, e);
      expect(result.found).toBe(true);
      expect(result.path.length).toBe(2);
    }
  });

  it('1x1 그리드 - 시작==끝', () => {
    const grid = makeGrid(1, 1);
    const coord: Coordinate = { row: 0, col: 0 };

    const result = bfs(grid, coord, coord);
    expect(result.found).toBe(true);
  });
});
