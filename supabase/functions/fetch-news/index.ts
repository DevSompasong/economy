import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function translateToThai(text: string): Promise<string> {
  if (!text) return "";
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const newsApiKey = Deno.env.get('NEWSAPI_KEY')
    const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${newsApiKey}`)
    const data = await response.json()

    // ใช้ Promise.all เพื่อรอให้แปลครบทุกข่าว
    const resolvedArticles = await Promise.all(
      data.articles.map(async (article: any) => {
        const titleTh = await translateToThai(article.title);
        const descTh = await translateToThai(article.description);

        return {
          title: titleTh,
          description: descTh,
          title_th: titleTh,
          description_th: descTh,
          url: article.url,
          image_url: article.urlToImage,
          url_to_image: article.urlToImage,
          published_at: article.publishedAt,
          source_name: article.source.name,
          category: 'business'
        }
      })
    );

    const { error } = await supabase
      .from('news_articles') // ตรวจสอบชื่อตารางให้ตรงกับใน Screenshot (369)
      .upsert(resolvedArticles, { onConflict: 'url' })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, count: resolvedArticles.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})