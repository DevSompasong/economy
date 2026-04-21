import { useState, useEffect, useCallback } from 'react';
import { fetchArticlesFromDB } from '../services/newsService';
import type { NewsArticle, Category } from '../types/database';

// ปิดระบบ Auto Refresh อัตโนมัติ เพื่อประหยัด Token
// const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; 

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
  // const autoRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadArticles = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      // ดึงข้อมูลจากฐานข้อมูล Supabase โดยตรง (ไม่เสีย Token ดึงข่าว/แปลภาษา)
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

  // ปรับปรุงฟังก์ชัน Refresh ให้แค่โหลดข้อมูลล่าสุดจาก DB
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      
      // ปิดบรรทัดนี้: เพื่อไม่ให้หน้าบ้านสั่งบอททำงานเองทุกครั้งที่ Refresh
      // await triggerAllCategoriesFetch(); 
      
      setLastRefreshed(new Date());
      setRefreshMessage('Syncing with database...');
      await loadArticles(true);
    } catch {
      setRefreshMessage('Failed to sync. Please try again.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMessage(null), 4000);
    }
  }, [loadArticles]);

  const handleCategoryRefresh = useCallback(async (_cat: string) => {
    try {
      // ปิดการสั่งดึงข่าวรายหมวดหมู่จากหน้าบ้าน
      // await triggerNewsFetch(cat);
    } catch {
      // silent fail
    }
  }, []);

  // โหลดข่าวจาก DB ตอนเปลี่ยนหมวดหมู่หรือค้นหา
  useEffect(() => {
    loadArticles(true);
  }, [category, searchQuery]);

  // โหลดข่าวหน้าถัดไป
  useEffect(() => {
    if (page > 1) loadArticles(false);
  }, [page]);

  // ลบ useEffect ที่เคยสั่ง handleRefresh() ตอนเปิดเว็บออก
  /* useEffect(() => {
    handleRefresh();
  }, []); 
  */

  // ลบระบบ Auto Refresh Timer ออก
  /*
  useEffect(() => {
    autoRefreshTimer.current = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    };
  }, [handleRefresh]);
  */

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