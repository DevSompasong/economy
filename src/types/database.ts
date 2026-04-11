export type Database = {
  public: {
    Tables: {
      news_articles: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content: string | null;
          url: string;
          image_url: string | null;
          source_name: string | null;
          category: string;
          published_at: string | null;
          is_published: boolean;
          created_at: string;
          title_th: string | null;       // เพิ่มบรรทัดนี้
          description_th: string | null; // เพิ่มบรรทัดนี้
        };
        Insert: Omit<Database['public']['Tables']['news_articles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['news_articles']['Insert']>;
      };
    };
  };
};

export type NewsArticle = Database['public']['Tables']['news_articles']['Row'];

export type Category = 'all' | 'general' | 'economy' | 'stocks' | 'forex' | 'crypto';