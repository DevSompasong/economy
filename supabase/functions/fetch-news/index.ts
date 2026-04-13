import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function translateToThai(text: string): Promise<string> {
  if (!text) return "";
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th&de=sompasong754@gmail.com`);
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
   
    const response = await fetch(`https://newsapi.org/v2/everything?q=(economy OR stocks OR forex OR crypto OR "central bank" OR inflation OR "market news" OR "gold price")&language=en&pageSize=50&apiKey=${newsApiKey}`)
    const data = await response.json()

    // --- ส่วนที่แก้ไข: ตรวจสอบว่ามีข้อมูล articles ส่งมาจริงไหม ถ้าไม่มีให้หยุดรันและบอกสาเหตุ ---
    if (!data.articles || !Array.isArray(data.articles)) {
      return new Response(JSON.stringify({ 
        error: "NewsAPI Error", 
        details: data.message || "No articles found in response" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const resolvedArticles = await Promise.all(
      data.articles.map(async (article: any) => {
        const titleTh = await translateToThai(article.title);
        const descTh = await translateToThai(article.description);
        
        const titleLower = (article.title || "").toLowerCase();
        const descLower = (article.description || "").toLowerCase();
        const combinedText = `${titleLower} ${descLower}`;

        let categoryTag = 'ECONOMY';

        if (combinedText.includes('forex') || combinedText.includes('currency') || combinedText.includes('exchange rate')) {
          categoryTag = 'FOREX';
        } else if (combinedText.includes('stock') || combinedText.includes('market') || combinedText.includes('nasdaq') || combinedText.includes('dividend')) {
          categoryTag = 'STOCKS';
        } else if (combinedText.includes('crypto') || combinedText.includes('bitcoin') || combinedText.includes('ethereum') || combinedText.includes('blockchain')) {
          categoryTag = 'CRYPTO';
        }

        return {
          title: titleTh,
          description: descTh,
          title_th: titleTh,
          description_th: descTh,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source_name: article.source.name,
          category: categoryTag
        }
      })
    );

    const { error } = await supabase
      .from('news_articles')
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