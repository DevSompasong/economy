import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { ArrowLeft, Clock, Globe, BookOpen } from 'lucide-react';
import AdBanner from './components/AdBanner';

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDetail() {
      try {
        if (!id) return;
        const { data, error } = await supabase
          .from('news_articles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error("Error loading news:", err);
      } finally {
        setLoading(false);
      }
    }
    getDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-gray-500 mb-4 font-bold">ไม่พบข้อมูลข่าว</p>
      <button onClick={() => navigate('/')} className="text-blue-600 underline font-bold">กลับหน้าแรก</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* โฆษณาด้านบน */}
        <AdBanner slot="header" className="mb-8" />

        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 mb-6 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> ย้อนกลับ
        </button>

        <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {/* แก้ไขตรงนี้: ใช้ image_url จาก article */}
          {article.image_url && (
            <img 
              src={article.image_url} 
              className="w-full h-[300px] sm:h-[450px] object-cover" 
              alt="news"
            />
          )}
          
          <div className="p-6 sm:p-10">
            <div className="flex gap-4 text-sm text-slate-400 mb-6 uppercase font-bold tracking-wider">
              <span className="text-blue-600 font-extrabold">{article.source_name}</span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> 
                {new Date(article.published_at).toLocaleDateString('th-TH')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
              {article.title_th || article.title}
            </h1>
            
            <div className="prose prose-lg max-w-none text-slate-700">
              {/* บทนำ/คำอธิบายข่าว */}
              <div className="text-xl leading-relaxed font-medium text-slate-600 mb-8 p-6 bg-blue-50/50 rounded-2xl border-l-4 border-blue-500">
                {article.description_th || article.description}
              </div>

              {/* เนื้อหาข่าวหลัก */}
              <div className="whitespace-pre-wrap leading-loose text-lg text-slate-800">
                {article.content || article.description || "ขออภัย ระบบไม่พบเนื้อหาข่าวเพิ่มเติม"}
              </div>
            </div>

            {/* โฆษณาด้านล่าง */}
            <div className="mt-12 pt-10 border-t border-gray-100">
              <AdBanner slot="inline" />
            </div>
            
            <div className="mt-10 flex justify-center">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                <BookOpen size={18} /> อ่านข่าวต้นฉบับ
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}