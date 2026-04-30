import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ฟังก์ชันหน่วงเวลา 1.5 วินาที เพื่อเลี่ยงโดนบล็อก Quota
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// 1. ฟังก์ชันแปลภาษา
async function translateToThai(text: string): Promise<string> {
  if (!text) return "";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th&de=sompasong754@gmail.com`,
    );
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

async function expandContentWithAI(
  title: string,
  desc: string,
): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY"); // ใช้ Key ของ Groq
  if (!apiKey || !desc) return desc;

  try {
    // URL สำหรับ Groq API
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const prompt = `คุณคือบรรณาธิการข่าวเศรษฐกิจมืออาชีพ ช่วยเขียนเนื้อหาข่าวภาษาไทยฉบับเต็มจากหัวข้อ "${title}" และบทสรุปสั้นๆ "${desc}" ให้มีความยาวประมาณ 4 ย่อหน้า โดยเน้นรายละเอียดเหตุการณ์และผลกระทบตลาด (ห้ามมีคำนำหรือสรุปซ้ำ)`;

    // แก้ไขเฉพาะส่วนนี้ในฟังก์ชัน expandContentWithAI ครับ
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // เปลี่ยนมาใช้รุ่นล่าสุดที่ Groq รองรับ
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      console.error("Groq Error:", JSON.stringify(data));
      return desc;
    }
  } catch (error) {
    console.error("Groq Fetch Exception:", error);
    return desc;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const newsApiKey = Deno.env.get("NEWSAPI_KEY");
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(now.setDate(now.getDate() - 1))
      .toISOString()
      .split("T")[0];

    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
        `q=(economy OR stocks OR forex OR crypto OR "central bank" OR inflation OR "market news" OR "gold price" OR "interest rates" OR "stock market" OR "federal reserve" OR "nasdaq" OR "bitcoin news" OR "commodities")&` +
        `from=${yesterday}&` +
        `to=${today}&` +
        `sortBy=publishedAt&` +
        `language=en&` +
        `pageSize=10&` +
        `apiKey=${newsApiKey}`,
    );

    const data = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error(data.message || "NewsAPI Error");
    }

    const resolvedArticles = [];
    // ใช้ for...of เพื่อให้รันทีละข่าว ป้องกัน Error 429
    for (const article of data.articles) {
      const titleTh = await translateToThai(article.title);
      const descTh = await translateToThai(article.description);

      // เรียกใช้ AI ขยายความ
      const fullContentTh = await expandContentWithAI(titleTh, descTh);

      const titleLower = (article.title || "").toLowerCase();
      const descLower = (article.description || "").toLowerCase();
      const combinedText = `${titleLower} ${descLower}`;

      let categoryTag = "ECONOMY";
      if (
        combinedText.includes("forex") ||
        combinedText.includes("currency") ||
        combinedText.includes("exchange rate")
      ) {
        categoryTag = "FOREX";
      } else if (
        combinedText.includes("stock") ||
        combinedText.includes("market") ||
        combinedText.includes("nasdaq") ||
        combinedText.includes("dividend")
      ) {
        categoryTag = "STOCKS";
      } else if (
        combinedText.includes("crypto") ||
        combinedText.includes("bitcoin") ||
        combinedText.includes("ethereum") ||
        combinedText.includes("blockchain")
      ) {
        categoryTag = "CRYPTO";
      }

      resolvedArticles.push({
        title: titleTh,
        description: descTh,
        title_th: titleTh,
        description_th: descTh,
        content: fullContentTh,
        url: article.url,
        image_url: article.urlToImage,
        published_at: article.publishedAt,
        source_name: article.source.name,
        category: categoryTag,
        is_published: true,
      });

      await delay(3000);
    }

    const { error: upsertError } = await supabase
      .from("news_articles")
      .upsert(resolvedArticles, { onConflict: "url" });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({
        success: true,
        count: resolvedArticles.length,
        ai_status: "Content expanded with Groq API 3.3",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err: any) {
    // แก้ไขการส่ง Error ให้ปลอดภัยและอ่านง่าย
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Function Error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
