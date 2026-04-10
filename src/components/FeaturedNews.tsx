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

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

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

  return (
    <article
      className="relative rounded-xl overflow-hidden bg-slate-900 text-white shadow-lg group"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <meta itemProp="headline" content={article.title} />
      <meta itemProp="datePublished" content={article.published_at || ''} />
      {article.source_name && <meta itemProp="author" content={article.source_name} />}

      {article.image_url ? (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
      ) : (
        <div className="h-72 sm:h-96 bg-gradient-to-br from-slate-800 to-slate-700" />
      )}

      <div className={`absolute ${article.image_url ? 'bottom-0 left-0 right-0' : 'inset-0 flex flex-col justify-end'} p-6`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${badgeColor}`}>
            <Tag className="w-2.5 h-2.5" />
            {article.category}
          </span>
          {article.source_name && (
            <span className="text-xs font-semibold text-gray-300">{article.source_name}</span>
          )}
        </div>

        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-3 text-white"
          itemProp="name"
        >
          {article.title}
        </h1>

        {article.description && (
          <p className="text-sm text-gray-300 line-clamp-2 mb-4 max-w-2xl" itemProp="description">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <time dateTime={article.published_at || ''} title={formatDate(article.published_at)}>
              {timeAgo(article.published_at)}
            </time>
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold transition-colors"
            aria-label={`Read full article: ${article.title}`}
          >
            Read Full Story
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
