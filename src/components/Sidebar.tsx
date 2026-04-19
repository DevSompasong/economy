import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  BarChart2,
} from "lucide-react";
import AdBanner from "./AdBanner";
import type { NewsArticle } from "../types/database";

type SidebarProps = {
  trendingArticles: NewsArticle[];
};

const INITIAL_MARKET = [
  { name: "S&P 500", value: 5218.19, change: 0.52, up: true },
  { name: "NASDAQ", value: 16399.52, change: 0.7, up: true },
  { name: "DOW", value: 39127.14, change: -0.11, up: false },
  { name: "BTC", value: 68412.0, change: 1.23, up: true },
  { name: "EUR/USD", value: 1.0831, change: 0.03, up: true },
  { name: "GOLD", value: 2331.5, change: 0.42, up: true },
];

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Sidebar({ trendingArticles }: SidebarProps) {
  const [marketData, setMarketData] = useState(INITIAL_MARKET);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((current) =>
        current.map((item) => ({
          ...item,
          value: item.value + (Math.random() - 0.5) * (item.value * 0.0001),
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex flex-col gap-6"> 
      {/* 1. Market Snapshot */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-slate-50">
          <BarChart2 className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Market Snapshot
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {marketData.map((item) => (
            <div key={item.name} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-semibold text-slate-700">{item.name}</span>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  {item.name === "BTC" || item.name === "GOLD" ? "$" : ""}
                  {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold ${item.up ? "text-emerald-600" : "text-red-500"}`}>
                  {item.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {item.up ? "+" : ""}{item.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Trending Now */}
      {trendingArticles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-slate-50">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trending Now</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {trendingArticles.slice(0, 6).map((article, i) => (
              <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                <span className="text-xl font-black text-gray-200 group-hover:text-gray-300 transition-colors flex-shrink-0 leading-none mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">{article.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{timeAgo(article.published_at)}</span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 3. AdBanner - มีแค่อันเดียว อยู่ล่างสุด ไม่ซ้อนแน่นอน */}
      <div className="w-full">
        <div className="bg-gray-50/50 rounded-lg border border-dashed border-gray-200 p-2 text-center">
          <AdBanner slot="sidebar" className="min-h-[250px]" />
        </div>
        <p className="text-[9px] text-gray-400 text-center mt-2 uppercase tracking-widest font-medium">
          Advertisement
        </p>
      </div>
    </aside>
  );
}