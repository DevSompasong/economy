import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ✅ ฟังก์ชันแปลภาษาด้วย Gemini API
async function translateWithGemini(text: string, apiKey: string): Promise<string> {
  if (!text || text.trim() === "") return "";
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate this financial news content to Thai. Keep it professional and accurate. Return only the translated text:\n\n${text}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return text; // หากแปลพลาด ให้คืนค่าต้นฉบับภาษาอังกฤษ
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // ✅ แก้ไข: ใส่ค่า URL และ Key โดยตรงในกรณีที่ไม่ได้ตั้งค่าใน Environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://lupksqlwyfjutbcvtqtc.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cGtzcWx3eWZqdXRiY3Z0cXRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc3NjQxMywiZXhwIjoyMDkxMzUyNDEzfQ.jIJ3c2fdKzfLQCMEM-ZdE1dUeNar8vpiRxa3wu--Z4g';
    const newsApiKey = Deno.env.get('NEWSAPI_KEY') ?? '342e8492a9f44abeb2254eff2ee3a012';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? 'AIzaSyAToRamsGzLp8WPQNTfY0n8lv7sR04pKug';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ดึงข่าวจาก News API
    const response = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${newsApiKey}`)
    const data = await response.json()

    if (!data.articles) throw new Error("No articles found");

    const resolvedArticles = await Promise.all(
      data.articles.map(async (article: any) => {
        // ✅ ใช้ Gemini แปลหัวข้อและคำอธิบาย
        const titleTh = await translateWithGemini(article.title, geminiApiKey);
        const descTh = await translateWithGemini(article.description, geminiApiKey);

        return {
          title: article.title,
          description: article.description,
          title_th: titleTh,
          description_th: descTh,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source_name: article.source.name,
          category: 'business'
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