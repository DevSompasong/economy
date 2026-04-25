import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 1. ฟังก์ชันแปลภาษาเดิม
async function translateToThai(text: string): Promise<string> {
  if (!text) return "";
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th&de=hp15sfq5085tumester@gmail.com`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

// 2. ฟังก์ชันใหม่: ใช้ Gemini AI ขยายความข่าวให้ยาวขึ้น
async function expandContentWithAI(title: string, desc: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey || !desc) return desc;

  try {
    const prompt = `คุณคือบรรณาธิการข่าวเศรษฐกิจและการลงทุนมืออาชีพ ช่วยเขียนเนื้อหาข่าวภาษาไทยฉบับเต็มจากหัวข้อ "${title}" และบทสรุปสั้นๆ "${desc}" ให้มีความยาวประมาณ 4-5 ย่อหน้า โดยเน้นรายละเอียดเหตุการณ์และวิเคราะห์ผลกระทบต่อตลาดหุ้น, Forex หรือการลงทุน (ห้ามสรุปซ้ำกับบทนำและไม่ต้องมีคำขึ้นต้น)`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text || desc;
  } catch (error) {
    console.error("Gemini Error:", error);
    return desc;
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
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];

    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=(economy OR stocks OR forex OR crypto OR "central bank" OR inflation OR "market news" OR "gold price" OR "interest rates" OR "stock market" OR "federal reserve" OR "nasdaq" OR "bitcoin news" OR "commodities")&` +
      `from=${yesterday}&` +
      `to=${today}&` +     
      `sortBy=publishedAt&` + 
      `language=en&` +
      `pageSize=10&` + // ลดจำนวนต่อรอบลงเพื่อให้ AI ประมวลผลได้ไวขึ้น
      `apiKey=${newsApiKey}`
    );

    const data = await response.json()

    if (!data.articles || !Array.isArray(data.articles)) {
      return new Response(JSON.stringify({ error: "NewsAPI Error", details: data.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const resolvedArticles = await Promise.all(
      data.articles.map(async (article: any) => {
        // แปลหัวข้อและคำโปรย
        const titleTh = await translateToThai(article.title);
        const descTh = await translateToThai(article.description);
        
        // ใช้ AI ปั้นเนื้อหาข่าวฉบับเต็มภาษาไทย
        const fullContentTh = await expandContentWithAI(titleTh, descTh);
        
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
          content: fullContentTh, // เก็บเนื้อหาที่ AI เขียนให้
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source_name: article.source.name,
          category: categoryTag,
          is_published: true
        }
      })
    );

    const { error } = await supabase
      .from('news_articles')
      .upsert(resolvedArticles, { onConflict: 'url' })

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      count: resolvedArticles.length,
      ai_status: "Content expanded with Gemini AI" 
    }), {
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