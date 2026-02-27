export function Legend() {
  const items = [
    { color: 'bg-white border border-slate-300', label: 'Empty' },
    { color: 'bg-[#1f2937]', label: 'Wall' },
    { color: 'bg-[#10b981]', label: 'Start' },
    { color: 'bg-[#ef4444]', label: 'End' },
    { color: 'bg-[#93c5fd]', label: 'Visited' },
    { color: 'bg-[#f59e0b]', label: 'Shortest Path' },
    { color: 'bg-[#c4b5fd]', label: 'Weight' },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-4 px-6 py-2 bg-[#0f172a] border-b border-slate-800 flex-wrap">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-sm ${color}`} />
          <span className="text-slate-400 text-xs">{label}</span>
        </div>
      ))}
      <div className="ml-4 text-slate-600 text-xs">
        <span className="text-slate-500">Click/Drag</span> → Wall &nbsp;
        <span className="text-slate-500">Shift+Drag</span> → Erase &nbsp;
        <span className="text-slate-500">Drag S/E</span> → Move
      </div>
    </div>
  );
}
