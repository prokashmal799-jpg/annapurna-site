/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Flame, Search, ChevronRight, BookOpen, Calendar, Eye, 
  Share2, PenSquare, ArrowLeft, Heart, Check
} from 'lucide-react';
import { NewsPost } from '../types';
import { fetchPosts, incrementPostViews } from '../lib/dbSync';

interface NewsSectionProps {
  searchQuery: string;
}

export default function NewsSection({ searchQuery }: NewsSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [articleList, setArticleList] = useState<NewsPost[]>([]);

  const syncArticles = async () => {
    try {
      const fetched = await fetchPosts();
      // On public page, only render published posts and those whose scheduled time has passed!
      const now = new Date();
      const filtered = fetched.filter(p => {
        const isPublished = (p as any).published !== false;
        const scheduledTime = (p as any).scheduledAt;
        if (!isPublished) return false;
        if (scheduledTime) {
          const schedDate = new Date(scheduledTime);
          if (schedDate > now) return false; // Scheduled in the future!
        }
        return true;
      });
      setArticleList(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  // Initial load
  useEffect(() => {
    syncArticles();

    // Listen for storage modification events from the Admin panel dynamically
    const handleStorageChange = () => {
      syncArticles();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync back deleted check
  useEffect(() => {
    if (selectedArticle && articleList.length > 0) {
      const stillExists = articleList.some(a => a.id === selectedArticle.id);
      if (!stillExists) {
        setSelectedArticle(null);
      }
    }
  }, [articleList, selectedArticle]);

  // Auto-open specific article based on URL pathway dynamically (SEO Friendly)
  useEffect(() => {
    if (articleList.length > 0 && !selectedArticle) {
      const path = window.location.pathname;
      if (path.includes('annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account')) {
        const found = articleList.find(a => a.id === 'annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account');
        if (found) {
          setSelectedArticle(found);
        }
      }
    }
  }, [articleList, selectedArticle]);

  // Dynamic Title & Description for SEO optimization when a news article is opened
  useEffect(() => {
    if (selectedArticle) {
      const originalTitle = document.title;
      const originalDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

      document.title = `${selectedArticle.title} - অন্নপূর্ণা ভান্ডার যোজনা ২০২৬`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `${selectedArticle.excerpt} | অন্নপূর্ণা ভান্ডার যোজনা ২০২৬-এর বিস্তারিত সরকারি বিজ্ঞপ্তি ও সম্পূর্ণ নির্দেশিকা পড়ুন।`);
      }

      return () => {
        document.title = originalTitle;
        if (metaDesc && originalDesc) {
          metaDesc.setAttribute("content", originalDesc);
        }
      };
    }
  }, [selectedArticle]);

  // Handle open article and increment views
  const handleOpenArticle = async (article: NewsPost) => {
    setSelectedArticle(article);
    if (article.id === 'annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account') {
      window.history.pushState({ tab: 'news' }, '', '/annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account/');
    }
    try {
      await incrementPostViews(article.id);
      setArticleList(prev => prev.map(a => a.id === article.id ? { ...a, views: a.views + 1 } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle URL Copy sharing
  const handleShare = (article: NewsPost) => {
    let url = window.location.origin;
    if (article.id === 'annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account') {
      url += '/annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account/';
    } else {
      url += '/news';
    }
    const shareText = `অন্নপূর্ণা ভান্ডার যোজনা ২০২৬ আপডেট: ${article.title}. সম্পূর্ণ খবরটি পড়ুন এখানে: ${url}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setToastMessage("খবরের লিঙ্ক সফলভাবে কপি করা হয়েছে!");
    setShowSuccessToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowSuccessToast(false);
    }, 2500);
  };

  // Filter based on parent search queries
  const filteredArticles = articleList.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate back to security admin tab panel seamlessly
  const handleGoToAdmin = () => {
    window.history.pushState({ tab: 'admin' }, '', '/admin');
    window.dispatchEvent(new Event('popstate'));
  };

  if (selectedArticle) {
    return (
      <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md text-left">
        {/* Back button */}
        <button
          onClick={() => {
            setSelectedArticle(null);
            if (window.location.pathname.includes('annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account')) {
              window.history.pushState({ tab: 'news' }, '', '/');
            }
          }}
          className="mb-6 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-slate-800 dark:text-orange-400 py-2.5 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← খবর তালিকায় ফিরে যান</span>
        </button>

        <article className="space-y-4 font-sans">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-red-100 dark:bg-red-950/40 text-red-650 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
              {selectedArticle.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{selectedArticle.date}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Eye className="h-3 w-3" />
              <span>{selectedArticle.views.toLocaleString('bn-IN')} বার পড়া হয়েছে</span>
            </span>
          </div>

          <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
            {selectedArticle.title}
          </h1>

          <div className="my-6 overflow-hidden rounded-xl bg-gray-150 border border-gray-205 dark:border-slate-800">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full max-h-[350px] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Sharing card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-orange-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-orange-100 dark:border-slate-800">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-350">
              📢 বন্ধুদের সাথে খবরটি শেয়ার করতে লিঙ্কটি কপি করুন:
            </span>
            <button
              onClick={() => handleShare(selectedArticle)}
              className="flex items-center gap-1.5 rounded-lg bg-orange-655 hover:bg-orange-700 text-white text-xs font-bold py-2 px-4 cursor-pointer transition bg-gradient-to-r from-red-600 to-orange-500 border-0"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? 'অনুলিপি করা হয়েছে!' : 'লিঙ্ক কপি করুন'}</span>
            </button>
          </div>

          <div className="prose prose-orange max-w-none text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed pt-2 space-y-4">
            <p className="font-bold text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-950/45 p-4 rounded-lg border-l-4 border-orange-500">
              {selectedArticle.excerpt}
            </p>
            {selectedArticle.content.split('\n').filter(p => p.trim()).map((para, idx) => {
              if (para.startsWith('### ')) {
                return (
                  <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-5 mb-2 pl-3 border-l-4 border-orange-500" key={idx}>
                    {para.replace('### ', '')}
                  </h3>
                );
              }
              if (para.startsWith('## ')) {
                return (
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-4 border-b border-orange-100 dark:border-slate-850 pb-2 flex items-center gap-2" key={idx}>
                    {para.replace('## ', '')}
                  </h2>
                );
              }
              if (para.startsWith('- ')) {
                return (
                  <li className="list-none flex items-start gap-2 ml-4 my-2 text-slate-700 dark:text-slate-300" key={idx}>
                    <span className="text-orange-500 font-extrabold mt-0.5">✦</span>
                    <span>{para.replace('- ', '')}</span>
                  </li>
                );
              }
              if (para.includes('|') && !para.includes('---')) {
                const cols = para.split('|').map(c => c.trim()).filter(Boolean);
                return (
                  <div className="overflow-x-auto w-full my-4 rounded-xl border border-orange-100 dark:border-slate-800" key={idx}>
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-orange-50/5 dark:bg-slate-950/10">
                        <tr>
                          {cols.map((col, cidx) => (
                            <td key={cidx} className="px-4 py-3 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {col}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base" key={idx}>
                  {para}
                </p>
              );
            })}
          </div>

          {/* Simulated Native High CPC Ad Block */}
          <div className="border border-dashed border-red-200 rounded-lg p-5 bg-gradient-to-r from-amber-50 to-orange-50/30 dark:from-slate-950/30 dark:to-slate-950/10 my-6">
            <div className="text-[10px] font-bold text-orange-600 mb-2">SPONSORED LINKS / বিজ্ঞাপন</div>
            <h4 className="text-sm font-bold text-gray-805 dark:text-orange-100 mb-2">👉 নতুন দুয়ারে সরকারের সরাসরি ফর্ম ফিলাপ করতে ক্লিক করুন!</h4>
            <div className="flex items-center gap-2">
              <a href="#apply" className="inline-block bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded">
                Download Scheme Form PDF 🔗
              </a>
              <span className="text-[10px] text-gray-400">High CPC Social Aid Ad Campaign</span>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Toast popup */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-emerald-500 font-sans transform transition duration-300">
          <Check className="h-5 w-5 bg-white text-emerald-600 rounded-full p-0.5" />
          <span className="text-xs md:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header section with clean Admin button linking securely */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-orange-100 dark:border-slate-800 pb-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-655 text-white font-bold shadow-md bg-gradient-to-tr from-red-650 to-orange-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-lg md:text-xl font-black text-slate-900 dark:text-white">
              অন্নপূর্ণা ভান্ডার সাম্প্রতিক খবরাখবর (Latest News Block)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-450">
              নতুন সরকারি ডিক্রি, কিস্তি পাওয়ার দিন এবং গুরুত্বপূর্ণ নির্দেশিকা সবার আগে জানুন
            </p>
          </div>
        </div>

        {/* Dynamic transition to secure control center */}
        <button
          onClick={handleGoToAdmin}
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 px-4 shadow-sm text-xs font-bold cursor-pointer transition border duration-200 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-slate-800 dark:text-orange-400 dark:border-slate-700"
        >
          <PenSquare className="h-3.5 w-3.5" />
          <span>✍️ সিকিউর এডমিন কন্ট্রোল</span>
        </button>
      </div>

      {/* Articles Grid layout */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-950/20 rounded-2xl border border-gray-150 dark:border-slate-800">
          <p className="text-sm font-semibold text-gray-500">খবর পাওয়া যায়নি! অন্য কিছু লিখে সার্চ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-orange-100/70 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-orange-200 transition-all duration-300 overflow-hidden text-left group"
            >
              {/* Cover Banner with zoom hover */}
              <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded bg-gradient-to-r from-red-600 to-orange-500">
                  {article.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-450 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{article.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{article.views} পড়া হয়েছে</span>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {article.title}
                  </h4>

                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">অফিশিয়াল গাইড ২০২৬</span>
                  <button
                    onClick={() => handleOpenArticle(article)}
                    className="flex items-center gap-0.5 text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition shrink-0 cursor-pointer bg-none border-0"
                  >
                    <span>সম্পূর্ণ খবর পড়ুন</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
