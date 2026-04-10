import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchArticlesFromDB, triggerAllCategoriesFetch, triggerNewsFetch } from '../services/newsService';
import type { NewsArticle, Category } from '../types/database';

const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000;

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const autoRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadArticles = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      const { articles: data, count } = await fetchArticlesFromDB(category, searchQuery, currentPage);
      setArticles(data);
      setTotalCount(count);

      if (resetPage && data.length > 0) {
        setFeaturedArticle(data[0]);
      }
    } catch (err) {
      setError('Failed to load articles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, page]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      await triggerAllCategoriesFetch();
      setLastRefreshed(new Date());
      setRefreshMessage('News updated successfully');
      await loadArticles(true);
    } catch {
      setRefreshMessage('Refresh failed. Please try again.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMessage(null), 4000);
    }
  }, [loadArticles]);

  const handleCategoryRefresh = useCallback(async (cat: string) => {
    try {
      await triggerNewsFetch(cat);
    } catch {
      // silent fail for background category fetch
    }
  }, []);

  useEffect(() => {
    loadArticles(true);
  }, [category, searchQuery]);

  useEffect(() => {
    if (page > 1) loadArticles(false);
  }, [page]);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    autoRefreshTimer.current = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    };
  }, [handleRefresh]);

  return {
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
    handleCategoryRefresh,
  };
}
