import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
}

export function CustomSelect({ value, onChange, options, disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  function handleToggle() {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={[
          'flex items-center justify-between gap-2 min-w-[130px]',
          'bg-[#0d0d1f] text-cyan-300 text-sm',
          'px-3 py-1.5 rounded',
          'border transition-all duration-200',
          isOpen
            ? 'border-cyan-500/70 shadow-[0_0_10px_rgba(0,229,255,0.25)]'
            : 'border-cyan-900/60',
          !disabled && !isOpen ? 'hover:border-cyan-500/70 hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <span
          className={[
            'text-cyan-500 text-[10px] transition-transform duration-200 flex-shrink-0',
            isOpen ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
        >
          ▼
        </span>
      </button>

      {/* 드롭다운 목록 */}
      <div
        className={[
          'absolute top-full left-0 mt-1 min-w-full z-50',
          'rounded border border-cyan-900/60',
          'bg-[#080818]/95 backdrop-blur-sm',
          'overflow-hidden',
          'transition-all duration-200 origin-top',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto shadow-[0_4px_24px_rgba(0,229,255,0.15)]'
            : 'opacity-0 -translate-y-1 pointer-events-none',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={[
                'flex items-center gap-2 w-full text-left text-sm px-3 py-1.5',
                'transition-colors duration-150',
                isSelected
                  ? 'text-cyan-400 font-semibold bg-cyan-950/40'
                  : 'text-slate-300 hover:bg-cyan-950/60 hover:text-cyan-200',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={[
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  isSelected ? 'bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.8)]' : 'bg-transparent',
                ].join(' ')}
              />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
