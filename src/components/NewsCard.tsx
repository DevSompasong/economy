import { ExternalLink, Clock } from 'lucide-react';
import type { NewsArticle } from '../types/database';

type NewsCardProps = {
  article: NewsArticle;
};

const CATEGORY_BADGE: Record<string, { bg: string; text: string }> = {
  general: { bg: 'bg-blue-100', text: 'text-blue-700' },
  stocks: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  forex: { bg: 'bg-amber-100', text: 'text-amber-700' },
  crypto: { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const FALLBACK_IMAGES: Record<string, string> = {
  general: 'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=600',
  stocks: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=600',
  forex: 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=600',
  crypto: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600',
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

export default function NewsCard({ article }: NewsCardProps) {
  const badge = CATEGORY_BADGE[article.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  const fallback = FALLBACK_IMAGES[article.category] || FALLBACK_IMAGES.general;

  return (
    <article
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <meta itemProp="headline" content={article.title_th || article.title} />
      <meta itemProp="datePublished" content={article.published_at || ''} />

      <div className="relative h-44 overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          // src={article.image_url || fallback}
          src={article.image_url || `https://loremflickr.com/600/400/finance,business?lock=${article.id}`}
          alt={article.title_th || article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.src !== fallback) img.src = fallback;
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}>
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide truncate max-w-[70%]">
            {article.source_name || 'Unknown'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <time dateTime={article.published_at || ''}>
              {timeAgo(article.published_at)}
            </time>
          </span>
        </div>

        <h2
          className="text-sm font-bold text-slate-900 line-clamp-3 leading-snug mb-2 flex-1"
          itemProp="name"
        >
          {(article as any).title_th || article.title}
        </h2>

        {article.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3" itemProp="description">
           {(article as any).description_th || article.description}
          </p>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group/link"
          aria-label={`Read article: ${article.title}`}
        >
          Read More
          <ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
        </a>
      </div>
    </article>
  );
}
