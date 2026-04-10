import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import NewsCard from './NewsCard';
import AdBanner from './AdBanner';
import type { NewsArticle } from '../types/database';

type NewsGridProps = {
  articles: NewsArticle[];
  loading: boolean;
  page: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (p: number) => void;
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4 mt-3" />
      </div>
    </div>
  );
}

export default function NewsGrid({ articles, loading, page, totalCount, pageSize = 12, onPageChange }: NewsGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const showAdAfter = 6;

  if (!loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Newspaper className="w-12 h-12 mb-3 opacity-30" />
        <p className="font-semibold text-gray-500">No articles found</p>
        <p className="text-sm mt-1">Try a different category or search term</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)
          : articles.slice(0, showAdAfter).map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
      </div>

      {!loading && articles.length > showAdAfter && (
        <>
          <div className="my-6">
            <AdBanner slot="inline" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.slice(showAdAfter).map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <span className="text-sm text-gray-500 px-3">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
