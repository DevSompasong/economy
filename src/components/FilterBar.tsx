import {
  BarChart2,
  DollarSign,
  Bitcoin,
  Globe,
  TrendingUp,
} from "lucide-react";
import type { Category } from "../types/database";

type FilterBarProps = {
  active: Category;
  onChange: (cat: Category) => void;
};

// 1. ใส่รายการปุ่มกลับมาให้ครบ (สำคัญมาก!)
const FILTERS: { label: string; value: Category; icon: React.ReactNode }[] = [
  { label: "All News", value: "all", icon: <Globe className="w-3.5 h-3.5" /> },
  {
    label: "Economy",
    value: "economy",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    label: "Stocks",
    value: "stocks",
    icon: <BarChart2 className="w-3.5 h-3.5" />,
  },
  {
    label: "Forex",
    value: "forex",
    icon: <DollarSign className="w-3.5 h-3.5" />,
  },
  {
    label: "Crypto",
    value: "crypto",
    icon: <Bitcoin className="w-3.5 h-3.5" />,
  },
];

// 2. แก้สีให้กลับมาเห็นตัวหนังสือชัดๆ (ใช้ text-white)
const CATEGORY_COLORS: Record<Category, string> = {
  all: "bg-slate-900 text-white border-slate-900",
  general: "bg-blue-600 text-white border-blue-600",
  economy: "bg-indigo-600 text-white border-indigo-600",
  stocks: "bg-emerald-600 text-white border-emerald-600",
  forex: "bg-amber-600 text-white border-amber-600",
  crypto: "bg-orange-500 text-white border-orange-500",
};

const CATEGORY_HOVER: Record<Category, string> = {
  all: "hover:bg-slate-800 text-white",
  general: "hover:bg-blue-700 text-white",
  economy: "hover:bg-indigo-700 text-white",
  stocks: "hover:bg-emerald-700 text-white",
  forex: "hover:bg-amber-700 text-white",
  crypto: "hover:bg-orange-600 text-white",
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 whitespace-nowrap flex-shrink-0 shadow-sm ${
                active === f.value
                  ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white border-indigo-600 shadow-indigo-200/50 scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
              }`}
            >
              <span className={`${active === f.value ? "animate-pulse" : ""}`}>
                {f.icon}
              </span>
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
