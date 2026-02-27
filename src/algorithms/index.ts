import type { Cell, Coordinate, AlgorithmId, AlgorithmResult } from '@/types';
import { dijkstra } from './dijkstra';
import { astar } from './astar';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { bellmanFord } from './bellman-ford';
import { bidirectionalBfs } from './bidirectional-bfs';
import { greedyBfs } from './greedy-bfs';

export type AlgorithmFn = (
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
) => AlgorithmResult;

const ALGORITHMS: Record<AlgorithmId, AlgorithmFn> = {
  dijkstra,
  astar,
  bfs,
  dfs,
  'bellman-ford': bellmanFord,
  'bidirectional-bfs': bidirectionalBfs,
  'greedy-bfs': greedyBfs,
};

export function runAlgorithm(
  id: AlgorithmId,
  grid: Cell[][],
  start: Coordinate,
  end: Coordinate
): AlgorithmResult {
  const fn = ALGORITHMS[id];
  return fn(grid, start, end);
}

export { dijkstra, astar, bfs, dfs, bellmanFord, bidirectionalBfs, greedyBfs };
