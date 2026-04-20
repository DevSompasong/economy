import { ExternalLink, Clock, Tag } from 'lucide-react';
import type { NewsArticle } from '../types/database';

type FeaturedNewsProps = {
  article: NewsArticle;
};

const CATEGORY_BADGE: Record<string, string> = {
  general: 'bg-blue-600',
  stocks: 'bg-emerald-600',
  forex: 'bg-amber-600',
  crypto: 'bg-orange-500',
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FeaturedNews({ article }: FeaturedNewsProps) {
  const badgeColor = CATEGORY_BADGE[article.category] || 'bg-slate-600';
  const fallbackImage = "https://images.unsplash.com/photo-1611974714851-eb605161882c?q=80&w=1200&auto=format&fit=crop";

  return (
    <article
      className="relative rounded-xl overflow-hidden bg-slate-900 text-white shadow-lg group h-[300px] sm:h-[400px]"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <meta itemProp="headline" content={article.title} />
      <meta itemProp="datePublished" content={article.published_at || ''} />
      {article.source_name && <meta itemProp="author" content={article.source_name} />}

      {/* ส่วนรูปและเงา (Layer ล่าง) */}
      <div className="absolute inset-0 z-0">
        <img
          src={article.image_url || fallbackImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        {/* ปรับแก้ให้รูปสว่างขึ้น: ลดความเข้มของ Gradient ลง (via-slate-900/40 และ via-20%) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/40 via-20% to-slate-900 z-10" />
      </div>

      {/* ส่วนเนื้อหา (Layer บนสุด - ใส่ z-index ให้ลอยเหนือเงา) */}
      <div className="relative h-full flex flex-col p-6 z-20">
        {/* 1. แท็กและแหล่งข่าว: ย้ายมาไว้ด้านบนสุด (flex justify-start) */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${badgeColor}`}>
            <Tag className="w-2.5 h-2.5" />
            {article.category}
          </span>
          {article.source_name && (
            <span className="text-xs font-semibold text-gray-300 z-20">{article.source_name}</span>
          )}
        </div>

        {/* 2. พาดหัวข่าวและคำอธิบาย: ย้ายลงมาไว้ด้านล่างสุด (mt-auto) */}
        <div className="mt-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 text-white">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-4 max-w-2xl">
              {article.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <time>{timeAgo(article.published_at)}</time>
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold transition-colors z-20"
            >
              Read Full Story
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}