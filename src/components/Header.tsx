import { TrendingUp, RefreshCw, Bell } from 'lucide-react';
import SearchBar from './SearchBar';

type HeaderProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefreshed: Date | null;
};

export default function Header({ searchQuery, onSearchChange, onRefresh, refreshing, lastRefreshed }: HeaderProps) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight">EconoFeed</span>
              <span className="ml-1 text-[10px] font-semibold text-blue-400 uppercase tracking-widest">
                Markets
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-lg">
            <SearchBar value={searchQuery} onChange={onSearchChange} />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {lastRefreshed && (
              <span className="hidden lg:block text-[11px] text-slate-400">
                Updated {formatTime(lastRefreshed)}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors text-xs font-semibold"
              aria-label="Refresh news"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              className="p-1.5 rounded hover:bg-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
