import { useRef, useCallback } from 'react';
import { useVisualizerStore } from '@/store/visualizer';
import { runAlgorithm } from '@/algorithms';
import { SPEED_MAP } from '@/types';

export function useVisualization() {
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(0);

  const {
    grid,
    startNode,
    endNode,
    selectedAlgorithm,
    speed,
    status,
    setCell,
    setResult,
    setStatus,
    setStats,
    clearPath,
  } = useVisualizerStore();

  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (status === 'running') return;

    // 이전 경로 초기화
    clearPath();
    setStatus('running');
    stepIndexRef.current = 0;

    const startTime = performance.now();
    const result = runAlgorithm(selectedAlgorithm, grid, startNode, endNode);
    const executionMs = performance.now() - startTime;

    setResult(result);

    const delayMs = SPEED_MAP[speed];
    const steps = result.steps;

    const animate = (index: number) => {
      if (index >= steps.length) {
        setStatus('done');
        setStats({
          visitedCount: result.visitedCount,
          pathLength: result.pathLength,
          executionMs,
        });
        return;
      }

      const step = steps[index]!;
      for (const coord of step.cells) {
        setCell(coord.row, coord.col, step.type === 'visit' ? 'visited' : 'path');
      }

      stepIndexRef.current = index + 1;
      animationRef.current = setTimeout(() => animate(index + 1), delayMs);
    };

    animate(0);
  }, [
    status,
    clearPath,
    setStatus,
    selectedAlgorithm,
    grid,
    startNode,
    endNode,
    speed,
    setResult,
    setStats,
    setCell,
  ]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    cancelAnimation();
    setStatus('paused');
  }, [status, cancelAnimation, setStatus]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    setStatus('running');

    const result = useVisualizerStore.getState().result;
    if (!result) return;

    const delayMs = SPEED_MAP[useVisualizerStore.getState().speed];
    const steps = result.steps;
    const startIdx = stepIndexRef.current;

    const animate = (index: number) => {
      if (index >= steps.length) {
        setStatus('done');
        return;
      }

      const step = steps[index]!;
      for (const coord of step.cells) {
        setCell(coord.row, coord.col, step.type === 'visit' ? 'visited' : 'path');
      }

      stepIndexRef.current = index + 1;
      animationRef.current = setTimeout(() => animate(index + 1), delayMs);
    };

    animate(startIdx);
  }, [status, setStatus, setCell]);

  const stop = useCallback(() => {
    cancelAnimation();
    clearPath();
    setStatus('idle');
    stepIndexRef.current = 0;
  }, [cancelAnimation, clearPath, setStatus]);

  return { start, pause, resume, stop, isRunning: status === 'running' };
}
