import { useState, useEffect, useCallback } from "react";
// 1. เพิ่มการ Import useSearchParams
import { useSearchParams } from "react-router-dom";
import { fetchArticlesFromDB } from "../services/newsService";
import type { NewsArticle, Category } from "../types/database";

export function useNews() {
  // 2. เรียกใช้งาน searchParams
  const [searchParams, setSearchParams] = useSearchParams();

  // 3. อ่านค่าหน้าจาก URL ถ้าไม่มีให้เป็นหน้า 1
  const urlPage = parseInt(searchParams.get("page") || "1");

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 4. ใช้ค่าจาก URL เป็นค่าเริ่มต้นของ State
  const [page, setPage] = useState(urlPage);
  const [totalCount, setTotalCount] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // 5. ฟังก์ชันเปลี่ยนหน้าที่จะไปแก้เลขบน URL ด้วย
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      setSearchParams(
        (prev) => {
          prev.set("page", newPage.toString());
          return prev;
        },
        { replace: true },
      ); // replace: true เพื่อไม่ให้รกประวัติ History
    },
    [setSearchParams],
  );

  const loadArticles = useCallback(
    async (resetPage = false) => {
      try {
        setLoading(true);
        setError(null);
        const currentPage = resetPage ? 1 : page;

        if (resetPage) {
          handlePageChange(1); // รีเซ็ต URL เป็นหน้า 1
        }

        const { articles: data, count } = await fetchArticlesFromDB(
          category,
          searchQuery,
          currentPage,
        );
        setArticles(data);
        setTotalCount(count);

        if (resetPage && data.length > 0) {
          setFeaturedArticle(data[0]);
        }
      } catch (err) {
        setError("Failed to load articles. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [category, searchQuery, page, handlePageChange],
  );

  // ซิงค์ State page เมื่อกดย้อนกลับ (Back Button)
  useEffect(() => {
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [urlPage]);

  // โหลดข่าวจาก DB
  useEffect(() => {
    loadArticles(true);
  }, [category, searchQuery]);


  useEffect(() => {
    if (page >= 1) loadArticles(false);
  }, [page]);


  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setRefreshMessage(null);
      setLastRefreshed(new Date());
      setRefreshMessage("Syncing with database...");
      await loadArticles(true);
    } catch {
      setRefreshMessage("Failed to sync. Please try again.");
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMessage(null), 4000);
    }
  }, [loadArticles]);

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
    setPage: handlePageChange, // ส่งฟังก์ชันใหม่ไปแทน
    handleRefresh,
  };
}
