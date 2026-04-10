import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from './components/Header';
import TickerBar from './components/TickerBar';
import FilterBar from './components/FilterBar';
import FeaturedNews from './components/FeaturedNews';
import NewsGrid from './components/NewsGrid';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';
import { useNews } from './hooks/useNews';

const PAGE_SIZE = 12;

export default function App() {
  const {
    articles,
    featuredArticle,
    loading,
    refreshing,
    error,
    refreshMessage,
    category,
    searchQuery,
    page,
    totalCount,
    lastRefreshed,
    setCategory,
    setSearchQuery,
    setPage,
    handleRefresh,
  } = useNews();

  const gridArticles = featuredArticle
    ? articles.filter((a) => a.id !== featuredArticle.id)
    : articles;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastRefreshed={lastRefreshed}
      />
      <TickerBar />
      <FilterBar active={category} onChange={(c) => { setCategory(c); setPage(1); }} />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <AdBanner slot="header" className="mb-6" />

        {refreshMessage && (
          <div
            className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
              refreshMessage.includes('failed')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {refreshMessage.includes('failed') ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            {refreshMessage}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-6">
          <main className="flex-1 min-w-0">
            {!loading && featuredArticle && (
              <section aria-label="Featured story" className="mb-8">
                <div className="mb-3">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Featured Story
                  </h2>
                </div>
                <FeaturedNews article={featuredArticle} />
              </section>
            )}

            <section aria-label="Latest news updates">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : category === 'all'
                    ? 'Latest Updates'
                    : `${category.charAt(0).toUpperCase() + category.slice(1)} News`}
                </h2>
                {totalCount > 0 && (
                  <span className="text-xs text-gray-400">{totalCount} articles</span>
                )}
              </div>

              <NewsGrid
                articles={gridArticles}
                loading={loading}
                page={page}
                totalCount={totalCount > 1 ? totalCount - 1 : 0}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </section>
          </main>

          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Sidebar trendingArticles={articles.slice(0, 8)} />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">EconoFeed</span>
              <span className="text-xs text-slate-400">Real-time Economic Intelligence</span>
            </div>
            <p className="text-xs text-gray-400">
              News powered by NewsAPI &bull; Auto-refreshes every 30 minutes &bull; &copy; {new Date().getFullYear()} EconoFeed
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
