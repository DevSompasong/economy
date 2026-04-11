import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Header from './components/Header';
import TickerBar from './components/TickerBar';
import FilterBar from './components/FilterBar';
import FeaturedNews from './components/FeaturedNews';
import NewsGrid from './components/NewsGrid';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';
import { useNews } from './hooks/useNews';
import NewsDetailPage from './NewsDetailPage'; 

const PAGE_SIZE = 12;

// 1. หน้าแรก (HomePage)
function HomePage() {
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

        {(refreshMessage || error) && (
          <div className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${error || (refreshMessage && refreshMessage.includes('failed')) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {error || refreshMessage}
          </div>
        )}

        <div className="flex gap-6">
          <main className="flex-1 min-w-0">
            {!loading && featuredArticle && (
              <section className="mb-8">
                <FeaturedNews article={featuredArticle} />
              </section>
            )}
            <NewsGrid 
              articles={gridArticles} 
              loading={loading} 
              page={page} 
              totalCount={totalCount} 
              pageSize={PAGE_SIZE} 
              onPageChange={setPage} 
            />
          </main>
          <div className="hidden xl:block w-72 flex-shrink-0">
            <Sidebar trendingArticles={articles.slice(0, 8)} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. ตัวควบคุม Routing หลัก
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}