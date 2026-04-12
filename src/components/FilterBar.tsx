import { BarChart2, DollarSign, Bitcoin, Globe, TrendingUp } from 'lucide-react';
import type { Category } from '../types/database';

type FilterBarProps = {
  active: Category;
  onChange: (cat: Category) => void;
};

const FILTERS: { label: string; value: Category; icon: React.ReactNode }[] = [
  { label: 'All News', value: 'all', icon: <Globe className="w-3.5 h-3.5" /> },
  { label: 'Economy', value: 'economy', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { label: 'Stocks', value: 'stocks', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { label: 'Forex', value: 'forex', icon: <DollarSign className="w-3.5 h-3.5" /> },
  { label: 'Crypto', value: 'crypto', icon: <Bitcoin className="w-3.5 h-3.5" /> },
];

const CATEGORY_COLORS: Record<Category, string> = {
  all: 'bg-slate-900 text-white border-slate-900',
  general: 'bg-blue-600 text-white border-blue-600',
  economy: 'bg-blue-700 text-white border-blue-700', // ลองเปลี่ยนเป็น blue-700
  stocks: 'bg-emerald-600 text-white border-emerald-600',
  forex: 'bg-amber-600 text-white border-amber-600',
  crypto: 'bg-orange-500 text-white border-orange-500',
};

const CATEGORY_HOVER: Record<Category, string> = {
  all: 'hover:bg-slate-800',
  general: 'hover:bg-blue-700',
  economy: 'hover:bg-blue-800', // เปลี่ยนให้เข้ากับสีใหม่
  stocks: 'hover:bg-emerald-700',
  forex: 'hover:bg-amber-700',
  crypto: 'hover:bg-orange-600',
};

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onChange(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${
                active === f.value
                  ? CATEGORY_COLORS[f.value]
                  : `border-gray-200 text-gray-600 bg-white ${CATEGORY_HOVER[f.value]}`
              }`}
              aria-pressed={active === f.value}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
