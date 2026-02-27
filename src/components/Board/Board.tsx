import { useRef, useEffect, useCallback, memo } from 'react';
import { useVisualizerStore } from '@/store/visualizer';
import type { Cell, Coordinate, DragMode } from '@/types';

// 셀 크기 (px)
const CELL = 24;
const BORDER = 1;

// 셀 타입별 색상
const COLORS: Record<Cell['type'], string> = {
  empty: '#ffffff',
  wall: '#1f2937',
  start: '#10b981',
  end: '#ef4444',
  visited: '#93c5fd',
  path: '#f59e0b',
  weight: '#c4b5fd',
};

const BORDER_COLOR = '#e2e8f0';
const HOVER_COLOR = 'rgba(99, 102, 241, 0.15)';

interface BoardProps {
  onCellInteract?: (row: number, col: number, mode: DragMode) => void;
}

export const Board = memo(function Board({ onCellInteract }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<Coordinate | null>(null);

  const grid = useVisualizerStore((s) => s.grid);
  const status = useVisualizerStore((s) => s.status);
  const dragMode = useVisualizerStore((s) => s.dragMode);
  const isMouseDown = useVisualizerStore((s) => s.isMouseDown);
  const { setDragMode, setMouseDown, setCell, setStartNode, setEndNode } = useVisualizerStore();

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // 캔버스에 전체 그리드 그리기
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || rows === 0 || cols === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = cols * CELL;
    canvas.height = rows * CELL;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r]![c]!;
        const x = c * CELL;
        const y = r * CELL;

        // 셀 배경
        ctx.fillStyle = COLORS[cell.type];
        ctx.fillRect(x, y, CELL, CELL);

        // 가중치 노드 숫자 표시
        if (cell.type === 'weight') {
          ctx.fillStyle = '#4c1d95';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cell.weight), x + CELL / 2, y + CELL / 2);
        }

        // start/end 아이콘
        if (cell.type === 'start') {
          ctx.fillStyle = '#065f46';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S', x + CELL / 2, y + CELL / 2);
        }
        if (cell.type === 'end') {
          ctx.fillStyle = '#7f1d1d';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('E', x + CELL / 2, y + CELL / 2);
        }

        // 호버 효과
        const hover = hoverRef.current;
        if (hover && hover.row === r && hover.col === c) {
          ctx.fillStyle = HOVER_COLOR;
          ctx.fillRect(x, y, CELL, CELL);
        }

        // 셀 테두리
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = BORDER;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
      }
    }
  }, [grid, rows, cols]);

  // 그리드 변경 시 재렌더링
  useEffect(() => {
    draw();
  }, [draw]);

  // 캔버스 좌표 → 셀 좌표
  const getCell = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Coordinate | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const c = Math.floor((e.clientX - rect.left) / CELL);
      const r = Math.floor((e.clientY - rect.top) / CELL);
      if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
      return { row: r, col: c };
    },
    [rows, cols]
  );

  // 셀 상호작용 처리
  const handleCellAction = useCallback(
    (coord: Coordinate, mode: DragMode) => {
      if (status === 'running') return;
      const cell = grid[coord.row]?.[coord.col];
      if (!cell) return;

      if (mode === 'move-start') {
        setStartNode(coord);
      } else if (mode === 'move-end') {
        setEndNode(coord);
      } else if (mode === 'wall') {
        if (cell.type !== 'start' && cell.type !== 'end') {
          setCell(coord.row, coord.col, 'wall');
        }
      } else if (mode === 'erase') {
        if (cell.type !== 'start' && cell.type !== 'end') {
          setCell(coord.row, coord.col, 'empty');
        }
      }

      onCellInteract?.(coord.row, coord.col, mode);
    },
    [status, grid, setStartNode, setEndNode, setCell, onCellInteract]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const coord = getCell(e);
      if (!coord) return;

      setMouseDown(true);
      const cell = grid[coord.row]?.[coord.col];
      if (!cell) return;

      let mode: DragMode = e.shiftKey ? 'erase' : 'wall';
      if (cell.type === 'start') mode = 'move-start';
      else if (cell.type === 'end') mode = 'move-end';

      setDragMode(mode);
      handleCellAction(coord, mode);
    },
    [getCell, grid, setMouseDown, setDragMode, handleCellAction]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coord = getCell(e);

      // 호버 업데이트
      hoverRef.current = coord;
      draw();

      if (!isMouseDown || !dragMode || !coord) return;
      handleCellAction(coord, dragMode);
    },
    [getCell, isMouseDown, dragMode, handleCellAction, draw]
  );

  const onMouseUp = useCallback(() => {
    setMouseDown(false);
    setDragMode(null);
  }, [setMouseDown, setDragMode]);

  const onMouseLeave = useCallback(() => {
    hoverRef.current = null;
    draw();
    setMouseDown(false);
    setDragMode(null);
  }, [draw, setMouseDown, setDragMode]);

  const cursor =
    status === 'running'
      ? 'not-allowed'
      : dragMode === 'move-start' || dragMode === 'move-end'
        ? 'grab'
        : 'crosshair';

  return (
    <div className="flex items-center justify-center overflow-auto p-4">
      <canvas
        ref={canvasRef}
        style={{ cursor }}
        className="shadow-xl rounded border border-slate-300 select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
});
