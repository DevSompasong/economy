import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Header from "./components/Header";
import TickerBar from "./components/TickerBar";
import FilterBar from "./components/FilterBar";
import FeaturedNews from "./components/FeaturedNews";
import NewsGrid from "./components/NewsGrid";
import Sidebar from "./components/Sidebar";
import AdBanner from "./components/AdBanner";
import { useNews } from "./hooks/useNews";
import NewsDetailPage from "./NewsDetailPage";
import { ArrowLeft } from "lucide-react";

const PAGE_SIZE = 12;

// 1. หน้าแรก (HomePage)
function HomePage() {
  const {
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
  } = useNews();

  const gridArticles = featuredArticle
    ? articles.filter((a) => a.id !== featuredArticle.id)
    : articles;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastRefreshed={lastRefreshed}
      />
      <TickerBar />
      <FilterBar
        active={category}
        onChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <AdBanner slot="header" className="mb-6" />

        {(refreshMessage || error) && (
          <div
            className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${error || (refreshMessage && refreshMessage.includes("failed")) ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {error || refreshMessage}
          </div>
        )}

        <div className="flex gap-6">
          <main className="flex-1 min-w-0">
            {!loading && featuredArticle && (
              <section className="mb-8">
                <FeaturedNews article={featuredArticle} />
              </section>
            )}
            <NewsGrid
              articles={gridArticles}
              loading={loading}
              page={page}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </main>
          <div className="hidden xl:block w-72 flex-shrink-0">
            <Sidebar trendingArticles={articles.slice(0, 8)} />
            {/* --- เพิ่มโฆษณา Sidebar ตรงนี้ --- */}
            <div className="mt-6 sticky top-24">
              <AdBanner slot="sidebar" />
              <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-widest">
                Advertisement
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* เพิ่ม Footer ตรงนี้ครับ */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EconoFeed</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
              <a
                href="/about"
                className="hover:text-blue-600 transition-colors"
              >
                About Us
              </a>
              <a
                href="/privacy"
                className="hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/contact"
                className="hover:text-blue-600 transition-colors"
              >
                Contact Us
              </a>
            </nav>

            <p className="text-sm text-gray-400">
              © 2026 EconoFeed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 2. ตัวควบคุม Routing หลัก
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้าแรก */}
        <Route path="/" element={<HomePage />} />

        {/* หน้าอ่านรายละเอียดข่าว */}
        <Route path="/news/:id" element={<NewsDetailPage />} />

        {/* หน้า About Us */}
        <Route
          path="/about"
          element={
            <div className="max-w-4xl mx-auto p-10 bg-white mt-10 rounded-lg shadow">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
              </Link>
              <h1 className="text-3xl font-bold mb-6">About EconoFeed</h1>
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                ยินดีต้อนรับสู่ EconoFeed{"\n"}
                แพลตฟอร์ม rวบรวมข่าวสารด้านเศรษฐกิจและการลงทุนแบบเรียลไทม์{"\n"}
                เรามุ่งมั่นที่จะเป็นศูนย์กลางข้อมูลสำหรับนักลงทุนและผู้ที่สนใจสถานการณ์โลก
                {"\n"}
                โดยการนำเสนอข้อมูลที่สดใหม่ ครอบคลุมทั้ง ตลาดหุ้น (Stocks),
                อัตราแลกเปลี่ยน (Forex), คริปโตเคอเรนซี (Crypto)
                และนโยบายทางการเงินจากธนาคารกลางทั่วโลก{"\n\n"}
                <strong>พันธกิจของเรา:</strong>
                {"\n"}
                รวบรวมข่าวสารจากแหล่งข่าวชั้นนำทั่วโลกผ่านเทคโนโลยี NewsAPI
                เพื่อความรวดเร็ว นำเสนอข้อมูลในรูปแบบที่เข้าใจง่าย
                เข้าถึงได้ทุกที่ทุกเวลา
                สนับสนุนการตัดสินใจด้วยข้อมูลที่เป็นปัจจุบันที่สุด
              </p>
            </div>
          }
        />

        {/* หน้า Privacy Policy */}
        <Route
          path="/privacy"
          element={
            <div className="max-w-4xl mx-auto p-10 bg-white mt-10 rounded-lg shadow">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
              </Link>
              <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
              <div className="text-gray-700 space-y-4">
                <p>
                  นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการที่ EconoFeed
                  จัดการกับข้อมูลของคุณ:
                </p>
                <p>
                  <strong>การเก็บข้อมูล:</strong>{" "}
                  เราไม่มีการเก็บข้อมูลส่วนบุคคลโดยตรงจากผู้ใช้งาน
                  เว็บไซต์ของเราทำหน้าที่รวบรวมและแสดงผลข่าวสารจากแหล่งข้อมูลภายนอก
                </p>
                <p>
                  <strong>Cookies:</strong> เรามีการใช้งาน Cookies
                  เพื่อปรับปรุงประสบการณ์การใช้งาน และอาจมีการใช้งาน Cookies
                  จากบุคคลที่สาม เช่น Google AdSense
                  เพื่อวิเคราะห์การเข้าชมและแสดงโฆษณาที่เหมาะสมกับความสนใจของคุณ
                </p>
                <p>
                  <strong>ลิงก์ภายนอก:</strong>{" "}
                  ข่าวสารบนเว็บของเรามีการเชื่อมโยงไปยังเว็บไซต์ต้นฉบับ
                  เราไม่ได้รับผิดชอบต่อเนื้อหาหรือนโยบายความเป็นส่วนตัวของเว็บไซต์เหล่านั้น
                </p>
                <p>
                  <strong>การติดต่อ:</strong> หากคุณมีคำถามเกี่ยวกับนโยบายนี้
                  สามารถติดต่อเราได้ผ่านหน้า Contact Us
                </p>
              </div>
            </div>
          }
        />

        {/* หน้า Contact Us */}
        <Route
          path="/contact"
          element={
            <div className="max-w-4xl mx-auto p-10 bg-white mt-10 rounded-lg shadow text-center">
              <div className="text-left">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                </Link>
              </div>
              <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
              <div className="text-gray-700 space-y-2">
                <p>
                  หากคุณมีข้อสงสัย ข้อเสนอแนะ
                  หรือต้องการแจ้งปัญหาการใช้งานเว็บไซต์ EconoFeed
                  สามารถติดต่อทีมงานได้ที่:
                </p>
                <p className="font-semibold text-blue-600">
                  Email: support@econofeed.mu
                </p>
                <p>เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 18:00 น.)</p>
                <p className="pt-4">
                  เรายินดีรับฟังทุกความคิดเห็นเพื่อนำมาพัฒนาเว็บไซต์ให้ดียิ่งขึ้นครับ
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
