import { Search, X } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (q: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search markets, stocks, crypto..."
        className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded border border-slate-700 focus:border-blue-500 focus:outline-none pl-9 pr-8 py-1.5 transition-colors"
        aria-label="Search news"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
