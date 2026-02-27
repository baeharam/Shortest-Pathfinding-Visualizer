export function Legend() {
  const items = [
    { color: 'bg-[#0a0a1a] border border-cyan-900/50', label: '비어있음' },
    { color: 'bg-[#372d5a]', label: '벽' },
    { color: 'bg-[#00e676]', label: '시작' },
    { color: 'bg-[#e040fb]', label: '도착' },
    { color: 'bg-[#00e5ff]', label: '방문함' },
    { color: 'bg-[#ffd600]', label: '최단경로' },
    { color: 'bg-[#5028dc]', label: '가중치' },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-4 px-6 py-4 bg-[#080818] border-b border-cyan-900/30 flex-wrap">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-sm ${color}`} />
          <span className="text-slate-400 text-xs">{label}</span>
        </div>
      ))}
      <div className="ml-4 text-slate-600 text-xs">
        <span className="text-slate-500">클릭/드래그</span> → 벽 &nbsp;
        <span className="text-slate-500">Shift+드래그</span> → 지우기 &nbsp;
        <span className="text-slate-500">S/E 드래그</span> → 이동
      </div>
    </div>
  );
}
