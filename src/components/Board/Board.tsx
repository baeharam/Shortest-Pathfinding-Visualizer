import { useRef, useEffect, useCallback, memo } from 'react';
import { useVisualizerStore } from '@/store/visualizer';
import type { Cell, Coordinate, DragMode } from '@/types';

// ─── 상수 ──────────────────────────────────────────────────────────────────
const CELL = 30;
const GAP = 1;
const RADIUS = 4;
const STEP = CELL + GAP;

// ─── 색상 팔레트 ─────────────────────────────────────────────────────────
const C = {
  empty:        [ 10,  10,  26] as const,   // #0a0a1a — 어두운 다크
  emptyBorder:  [  0, 229, 255] as const,   // #00e5ff — neon cyan (희미하게)
  wall:         [ 55,  45,  90] as const,   // #372d5a — 보라빛 슈슬레이트 (배경과 확연히 구분)
  wallMid:      [ 90,  75, 140] as const,   // 애니메이션 시작색 (더 밝게)
  start:        [  0, 230, 118] as const,   // #00e676 — neon green
  startGlow:    [ 80, 255, 160] as const,   // brighter neon green glow
  end:          [224,  64, 251] as const,   // #e040fb — hot magenta
  endGlow:      [240, 140, 255] as const,   // lighter magenta glow
  visitedFrom:  [  0, 229, 255] as const,   // #00e5ff — neon cyan
  visitedTo:    [  2, 136, 209] as const,   // #0288d1 — electric blue
  visitedMid:   [ 80,  40, 220] as const,   // cyber purple
  pathFrom:     [255, 214,   0] as const,   // #ffd600 — golden yellow
  pathTo:       [255, 109,   0] as const,   // #ff6d00 — hot orange
  pathMid:      [255,  80,  20] as const,   // intense orange-red
  weight:       [ 80,  40, 220] as const,   // cyber purple weight
  weightText:   [200, 180, 255] as const,   // light purple text
} as const;

// ─── 애니메이션 타입 ─────────────────────────────────────────────────────
type AnimType = 'visited' | 'path' | 'wall' | 'clear';
interface CellAnim { type: AnimType; startTime: number; duration: number; }

const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2; };
const easeOutElastic = (t: number) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function lerpRgb(a: readonly number[], b: readonly number[], t: number): string {
  return `rgb(${Math.round(a[0]! + (b[0]! - a[0]!) * t)},${Math.round(a[1]! + (b[1]! - a[1]!) * t)},${Math.round(a[2]! + (b[2]! - a[2]!) * t)})`;
}

// ─── 둥근 사각형 ─────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── 단일 셀 렌더 ────────────────────────────────────────────────────────
function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: Cell, x: number, y: number,
  anim: CellAnim | undefined, now: number, hover: boolean,
): void {
  const progress = anim ? Math.min(1, (now - anim.startTime) / anim.duration) : 1;

  let scale = 1;
  let color: string;
  let shadowColor = '';
  let shadowBlur = 0;

  if (anim && progress < 1) {
    if (anim.type === 'visited') {
      scale = 0.3 + easeOutElastic(progress) * 0.7;
      color = progress < 0.5 ? lerpRgb(C.visitedMid, C.visitedFrom, progress * 2) : lerpRgb(C.visitedFrom, C.visitedTo, (progress - 0.5) * 2);
      shadowColor = `rgba(${C.visitedMid.join(',')},${0.6 * (1 - progress)})`;
      shadowBlur = 16 * (1 - progress);
    } else if (anim.type === 'path') {
      scale = 0.5 + easeOutBack(progress) * 0.5;
      color = progress < 0.5 ? lerpRgb(C.pathMid, C.pathFrom, progress * 2) : lerpRgb(C.pathFrom, C.pathTo, (progress - 0.5) * 2);
      shadowColor = `rgba(${C.pathMid.join(',')},${0.8 * (1 - progress)})`;
      shadowBlur = 24 * (1 - progress);
    } else if (anim.type === 'wall') {
      scale = 0.4 + easeOutCubic(progress) * 0.6;
      color = lerpRgb(C.wallMid, C.wall, progress);
    } else {
      color = lerpRgb(C.wall, C.empty, easeOutCubic(progress));
    }
  } else {
    switch (cell.type) {
      case 'empty':   color = `rgb(${C.empty.join(',')})`; break;
      case 'wall':    color = `rgb(${C.wall.join(',')})`; break;
      case 'start':   color = `rgb(${C.start.join(',')})`; break;
      case 'end':     color = `rgb(${C.end.join(',')})`; break;
      case 'visited': color = `rgb(${C.visitedTo.join(',')})`; break;
      case 'path':    color = `rgb(${C.pathTo.join(',')})`; break;
      case 'weight':  color = `rgb(${C.weight.join(',')})`; break;
    }
  }

  // start/end pulsing glow
  if (cell.type === 'start') {
    const p = (Math.sin(now * 0.003) + 1) * 0.5;
    color = lerpRgb(C.start, C.startGlow, p * 0.5);
    shadowColor = `rgba(${C.start.join(',')},0.8)`;
    shadowBlur = 20 + p * 20;
  }
  if (cell.type === 'end') {
    const p = (Math.sin(now * 0.003 + Math.PI) + 1) * 0.5;
    color = lerpRgb(C.end, C.endGlow, p * 0.5);
    shadowColor = `rgba(${C.end.join(',')},0.8)`;
    shadowBlur = 20 + p * 20;
  }

  const cx = x + CELL / 2;
  const cy = y + CELL / 2;
  const sw = CELL * scale;
  const hw = sw / 2;

  ctx.save();
  if (shadowBlur > 0 && shadowColor) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
  }
  ctx.fillStyle = color;
  roundRect(ctx, cx - hw, cy - hw, sw, sw, RADIUS * scale);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  if (hover && cell.type !== 'start' && cell.type !== 'end') {
    ctx.fillStyle = 'rgba(0,229,255,0.10)';
    roundRect(ctx, cx - hw, cy - hw, sw, sw, RADIUS * scale);
    ctx.fill();
  }
  if (cell.type !== 'wall') {
    ctx.strokeStyle = `rgba(${C.emptyBorder.join(',')},0.15)`;
    ctx.lineWidth = 0.5;
    roundRect(ctx, cx - hw, cy - hw, sw, sw, RADIUS * scale);
    ctx.stroke();
  }
  ctx.restore();

  if (scale >= 0.5) {
    ctx.font = `700 ${Math.max(8, Math.round(13 * scale))}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (cell.type === 'start') { ctx.fillStyle = '#fff'; ctx.fillText('S', cx, cy); }
    else if (cell.type === 'end') { ctx.fillStyle = '#fff'; ctx.fillText('E', cx, cy); }
    else if (cell.type === 'weight') { ctx.fillStyle = `rgb(${C.weightText.join(',')})`; ctx.fillText(String(cell.weight), cx, cy); }
  }
}

// ─── Board ────────────────────────────────────────────────────────────────
interface BoardProps {
  onCellInteract?: (row: number, col: number, mode: DragMode) => void;
}

export const Board = memo(function Board({ onCellInteract }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<Coordinate | null>(null);
  const animMapRef = useRef<Map<string, CellAnim>>(new Map());
  const rafRef = useRef<number | null>(null);
  const prevGridRef = useRef<Cell[][] | null>(null);

  const grid = useVisualizerStore((s) => s.grid);
  const status = useVisualizerStore((s) => s.status);
  const dragMode = useVisualizerStore((s) => s.dragMode);
  const isMouseDown = useVisualizerStore((s) => s.isMouseDown);
  const { setDragMode, setMouseDown, setCell, setStartNode, setEndNode } = useVisualizerStore();

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // ── 단일 프레임 렌더 (grid를 인자로 받음 — stale closure 없음) ──────────
  const renderFrame = useCallback((
    currentGrid: Cell[][],
    currentRows: number,
    currentCols: number,
  ): boolean => {
    const canvas = canvasRef.current;
    if (!canvas || currentRows === 0 || currentCols === 0) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const totalW = currentCols * STEP - GAP;
    const totalH = currentRows * STEP - GAP;

    if (canvas.width !== totalW || canvas.height !== totalH) {
      canvas.width = totalW;
      canvas.height = totalH;
    }

    const now = performance.now();
    const hover = hoverRef.current;
    let keepGoing = false;

    ctx.clearRect(0, 0, totalW, totalH);

    for (let r = 0; r < currentRows; r++) {
      for (let c = 0; c < currentCols; c++) {
        const cell = currentGrid[r]![c]!;
        const anim = animMapRef.current.get(`${r},${c}`);
        const isHover = hover !== null && hover.row === r && hover.col === c;
        drawCell(ctx, cell, c * STEP, r * STEP, anim, now, isHover);
        if (cell.type === 'start' || cell.type === 'end') keepGoing = true;
        if (anim && now - anim.startTime < anim.duration) keepGoing = true;
      }
    }

    for (const [key, anim] of animMapRef.current) {
      if (now - anim.startTime >= anim.duration) animMapRef.current.delete(key);
    }

    if (hover) keepGoing = true;
    return keepGoing;
  }, []);

  // ── rAF 루프 시작 (grid를 클로저로 캡처) ──────────────────────────────
  const startLoop = useCallback((currentGrid: Cell[][], currentRows: number, currentCols: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const loop = () => {
      const keepGoing = renderFrame(currentGrid, currentRows, currentCols);
      if (keepGoing) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [renderFrame]);

  // ── grid 변경 감지 → 애니메이션 등록 + 루프 재시작 ────────────────────
  useEffect(() => {
    const prev = prevGridRef.current;
    if (prev) {
      const now = performance.now();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cur = grid[r]![c]!;
          const pre = prev[r]?.[c];
          if (!pre || cur.type === pre.type) continue;
          const key = `${r},${c}`;
          if (cur.type === 'visited') animMapRef.current.set(key, { type: 'visited', startTime: now, duration: 600 });
          else if (cur.type === 'path') animMapRef.current.set(key, { type: 'path', startTime: now, duration: 500 });
          else if (cur.type === 'wall') animMapRef.current.set(key, { type: 'wall', startTime: now, duration: 220 });
          else if (cur.type === 'empty' && (pre.type === 'visited' || pre.type === 'path' || pre.type === 'wall')) {
            animMapRef.current.set(key, { type: 'clear', startTime: now, duration: 200 });
          } else {
            animMapRef.current.delete(key);
          }
        }
      }
    }
    prevGridRef.current = grid;
    startLoop(grid, rows, cols);
  }, [grid, rows, cols, startLoop]);

  // 언마운트 시 rAF 정리
  useEffect(() => {
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── 마우스 이벤트 ─────────────────────────────────────────────────────
  const getCell = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Coordinate | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const c = Math.floor((e.clientX - rect.left) / STEP);
      const r = Math.floor((e.clientY - rect.top) / STEP);
      if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
      return { row: r, col: c };
    },
    [rows, cols]
  );

  const handleCellAction = useCallback(
    (coord: Coordinate, mode: DragMode) => {
      if (status === 'running') return;
      const cell = grid[coord.row]?.[coord.col];
      if (!cell) return;
      if (mode === 'move-start') setStartNode(coord);
      else if (mode === 'move-end') setEndNode(coord);
      else if (mode === 'wall') { if (cell.type !== 'start' && cell.type !== 'end') setCell(coord.row, coord.col, 'wall'); }
      else if (mode === 'erase') { if (cell.type !== 'start' && cell.type !== 'end') setCell(coord.row, coord.col, 'empty'); }
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
      hoverRef.current = coord;
      if (rafRef.current === null) startLoop(grid, rows, cols);
      // 커서: running이면 not-allowed, 드래그 중이면 grab, hover 셀에 따라 pointer/crosshair
      if (status !== 'running' && !dragMode) {
        const canvas = canvasRef.current;
        if (canvas && coord) {
          const cell = grid[coord.row]?.[coord.col];
          canvas.style.cursor = (cell?.type === 'start' || cell?.type === 'end') ? 'grab' : 'pointer';
        } else if (canvas) {
          canvas.style.cursor = 'crosshair';
        }
      }
      if (!isMouseDown || !dragMode || !coord) return;
      handleCellAction(coord, dragMode);
    },
    [getCell, grid, rows, cols, isMouseDown, dragMode, status, handleCellAction, startLoop]
  );

  const onMouseUp = useCallback(() => { setMouseDown(false); setDragMode(null); }, [setMouseDown, setDragMode]);

  const onMouseLeave = useCallback(() => {
    hoverRef.current = null;
    if (rafRef.current === null) startLoop(grid, rows, cols);
    setMouseDown(false);
    setDragMode(null);
  }, [grid, rows, cols, startLoop, setMouseDown, setDragMode]);

  const cursor = status === 'running' ? 'not-allowed'
    : dragMode === 'move-start' || dragMode === 'move-end' ? 'grab' : 'pointer';

  return (
    <div className="flex items-center justify-center h-full p-8">
      <canvas
        ref={canvasRef}
        style={{ cursor }}
        className="rounded-lg select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
});
