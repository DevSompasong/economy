import { supabase } from '../lib/supabase';
import type { NewsArticle, Category } from '../types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function fetchArticlesFromDB(
  category: Category,
  searchQuery: string,
  page = 1,
  pageSize = 12
): Promise<{ articles: NewsArticle[]; count: number }> {
  let query = supabase
    .from('news_articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (category !== 'all') {
    query = query.eq('category', category.toUpperCase());
  }

  if (searchQuery.trim()) {
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,source_name.ilike.%${searchQuery}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { articles: data || [], count: count || 0 };
}

export async function triggerNewsFetch(category: string): Promise<{ success: boolean; message: string }> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/fetch-news?category=${category}`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.error || 'Failed to fetch news from API',
    };
  }

  return {
    success: true,
    message: `Fetched ${data.fetched || 0} articles, updated ${data.upserted || 0}`,
  };
}

export async function triggerAllCategoriesFetch(): Promise<void> {
  const categories = ['general', 'stocks', 'forex', 'crypto'];
  await Promise.allSettled(categories.map((cat) => triggerNewsFetch(cat)));
}
