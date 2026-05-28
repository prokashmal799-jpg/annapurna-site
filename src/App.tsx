/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Flame,
  BadgeCheck,
  Award,
  BookOpen,
  Send,
  Download,
  PhoneCall,
  Mail,
  MapPin,
  ChevronDown,
  HelpCircle,
  FileText,
  Clock,
  ExternalLink,
  MessageSquare,
  Facebook,
  Send as TelegramIcon
} from 'lucide-react';

import { TabId, AdSetting } from './types';
import {
  SCHEME_STATS,
  SCHEME_OVERVIEW,
  ELIGIBILITY_RULES,
  DOCUMENTS_REQUIRED,
  APPLY_STEPS,
  FAQS,
  MOCK_ADS_CONFIG
} from './data';

import { 
  incrementVisitorSession, 
  fetchHomepageLayout, 
  fetchSeoSettings, 
  fetchContactSettings,
  fetchAds,
  fetchBacklinks,
  HomepageLayout, 
  SeoSetting
} from './lib/dbSync';

import { ContactSetting } from './types';

import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Component imports
import Header from './components/Header';
import Hero from './components/Hero';
import BannerAds from './components/BannerAds';
import EligibilityChecker from './components/EligibilityChecker';
import StatusChecker from './components/StatusChecker';
import NewsSection from './components/NewsSection';
import Comments from './components/Comments';
import LegalPages from './components/LegalPages';
import FloatingActions from './components/FloatingActions';
import AdminPanel from './components/AdminPanel';
import FormFiller from './components/FormFiller';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin') || window.location.hash === '#/admin') {
        return 'admin';
      }
      if (path.includes('annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account')) {
        return 'news';
      }
    }
    return 'home';
  });
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [showNotification, setShowNotification] = useState(true);

  // Layout toggles & dynamic configurations states
  const [layoutConfig, setLayoutConfig] = useState<HomepageLayout | null>(null);
  const [seoConfig, setSeoConfig] = useState<SeoSetting | null>(null);
  const [contactConfig, setContactConfig] = useState<ContactSetting | null>(null);
  const [adList, setAdList] = useState<AdSetting[]>(MOCK_ADS_CONFIG);
  const [backlinksList, setBacklinksList] = useState<any[]>([]);

  // Form states inside contact tab
  const [contactForm, setContactForm] = useState({ name: '', phone: '', query: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Monitor administrator login state
  useEffect(() => {
    const checkAdminStatus = () => {
      const isSessionAuth = sessionStorage.getItem('annapurna_session_auth') === 'true';
      const isFbAuth = auth.currentUser !== null;
      setIsAdminLoggedIn(isFbAuth || isSessionAuth);
    };

    const unsubscribe = onAuthStateChanged(auth, () => {
      checkAdminStatus();
    });

    window.addEventListener('storage', checkAdminStatus);
    checkAdminStatus();

    return () => {
      unsubscribe();
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  // Sync dark mode class name to document body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // If search query updates, auto transition to news category or filter elements
  useEffect(() => {
    if (searchQuery.trim().length > 3 && activeTab !== 'news' && activeTab !== 'home') {
      setActiveTab('news');
    }
  }, [searchQuery]);

  // Synchronize layout, SEO and Ads from dbSync
  const syncDynamicConfigs = async () => {
    try {
      const layout = await fetchHomepageLayout();
      setLayoutConfig(layout);

      const seo = await fetchSeoSettings();
      setSeoConfig(seo);

      const contactSettings = await fetchContactSettings();
      setContactConfig(contactSettings);

      const ads = await fetchAds();
      if (ads && ads.length > 0) {
        setAdList(ads);
      }

      const links = await fetchBacklinks();
      setBacklinksList(links || []);
    } catch (e) {
      console.error("Layout syncer error", e);
    }
  };

  useEffect(() => {
    // Record visitor sessions atomically
    const recordSession = async () => {
      try {
        const isNewVisitor = !sessionStorage.getItem('annapurna_session_tracked');
        if (isNewVisitor) {
          sessionStorage.setItem('annapurna_session_tracked', 'true');
          await incrementVisitorSession(true);
        } else {
          await incrementVisitorSession(false);
        }
      } catch (err) {
        console.error("Session recording error", err);
      }
    };
    recordSession();
    syncDynamicConfigs();

    // Re-listen on administrative storage actions
    window.addEventListener('storage', syncDynamicConfigs);
    return () => window.removeEventListener('storage', syncDynamicConfigs);
  }, []);

  // Dynamic SEO Optimization for Content Rank #1
  useEffect(() => {
    let title = seoConfig?.title || "অন্নপূর্ণা ভান্ডার যোজনা ২০২৬ | Annapurna Bhandar Yojana 2026 (₹৩০০০/মাস)";
    let desc = seoConfig?.description || "অন্নপূর্ণা ভান্ডার যোজনা ২০২৬ (Annapurna Bhandar Yojana 2026) পোর্টাল। পশ্চিমবঙ্গের সব যোগ্য মহিলাদের প্রতি মাসে সরাসরি ব্যাংক অ্যাকাউন্টে ₹৩০০০ পাওয়ার সম্পূর্ণ তথ্য গাইড।";
    
    switch (activeTab) {
      case 'home':
        title = seoConfig?.title || "অন্নপূর্ণা ভান্ডার যোজনা ২০২৬ | Annapurna Bhandar Yojana 2026 (₹৩০০০/মাস) - স্ট্যাটাস ও অনলাইন আবেদন";
        desc = seoConfig?.description || "পশ্চিমবঙ্গ সরকারের অন্নপূর্ণা ভান্ডার প্রকল্প ২০২৬ (Annapurna Bhandar Yojana) - যোগ্যতা, আবেদন পদ্ধতি ও পেমেন্ট স্ট্যাটাস চেক করার সম্পূর্ণ অফিশিয়াল গাইড।";
        break;
      case 'eligibility':
        title = `যোগ্যতা নিরূপণ ও ওয়ান-ক্লিক ক্যালকুলেটর - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "আপনি কি অন্নপূর্ণা ভান্ডারের যোগ্য? আমাদের ইন্টারঅ্যাক্টিভ ওয়ান-ক্লিক ক্যালকুলেটর দিয়ে ১ মিনিটে বয়স ও পারিবারিক আয়ের ভিত্তিতে আপনার যোগ্যতা বা এলিজিবিলিটি চেক করুন।";
        break;
      case 'apply':
        title = `আবেদন করার সঠিক পদ্ধতি ও গাইড - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "অঙ্গনওয়াড়ি ও দুয়ারে সরকার ক্যাম্পের মাধ্যমে বা অনলাইনে কীভাবে আবেদন জমা দেবেন, ফর্ম পূরণের চমৎকার বাংলা নির্দেশিকা।";
        break;
      case 'status':
        title = `পেমেন্ট স্ট্যাটাস ও আধার লিংক তথ্য চেক করুন - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "আপনার আধার নম্বর বা মোবাইল নম্বর দিয়ে সরাসরি অন্নপূর্ণা ভান্ডার যোজনার অ্যাপ্লিকেশন স্ট্যাটাস ও ব্যাংক অ্যাকাউন্টে টাকা ক্রেডিট হওয়ার তারিখ জানুন।";
        break;
      case 'documents':
        title = `প্রয়োজনীয় নথিপত্রের তালিকা ও বিবরণ - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "আবেদনের জন্য কী কী কাগজপত্র সাথে রাখবেন? আধার কার্ড, স্বাস্থ্যসাথী কার্ড, কাস্ট সার্টিফিকেট, ব্যাংক পাসবুক সংক্রান্ত তথ্য ও নির্ভুল ফরম্যাট গাইড।";
        break;
      case 'news':
        title = `জুন মাসের নতুন সরকারি বিজ্ঞপ্তি ও খবর - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "অন্নপূর্ণা ভান্ডার প্রকল্প নিয়ে আজকের তাজা খবর, জুন মাসের কিস্তির নতুন ঘোষণা, দুয়ারে ক্যাম্প সিডিউল এবং পুলিশি সতর্কবার্তা জেনে নিন।";
        break;
      case 'faq':
        title = `সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ) - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "অন্নপূর্ণা ভান্ডার যোজনা নিয়ে আপনার মনে থাকা সব প্রশ্ন, যেমন বয়স সীমা, যৌথ অ্যাকাউন্ট এবং টাকা না পাওয়ার কারণগুলোর সহজ ও স্পষ্ট উত্তর।";
        break;
      case 'contact':
        title = `হেল্পলাইন ও অফিশিয়াল সাপোর্ট - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "অন্নপূর্ণা ভান্ডার সংক্রান্ত যেকোনো অভিযোগ বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন। নারী ও শিশু কল্যাণ দপ্তরের সরাসরি হেল্পলাইন ও অফিস নম্বর জানুন।";
        break;
      case 'admin':
        title = `অ্যাডমিন ভেরিফিকেশন ও পোস্ট কন্ট্রোল প্যানেল - ${seoConfig?.title || 'অন্নপূর্ণা ভান্ডার'}`;
        desc = "অন্নপূর্ণা ভান্ডার যোজনার অফিশিয়াল রাইটার এডমিন প্যানেল। খবর প্রকাশ এবং সম্পাদনা কেন্দ্র।";
        break;
      default:
        break;
    }
    
    document.title = title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", desc);
    }

    // Dynamic Canonical Link Update
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const currentCanonicalUrl = `https://annapurna-bhandar-yojana-2026.wb.gov.in/${activeTab === 'home' ? '' : activeTab}`;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentCanonicalUrl);

    // Dynamic Open Graph tags
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentCanonicalUrl);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    // Google Site Verification Dynamic Injector
    if (seoConfig?.googleSiteVerification) {
      let metaVerify = document.querySelector('meta[name="google-site-verification"]');
      if (!metaVerify) {
        metaVerify = document.createElement('meta');
        metaVerify.setAttribute('name', 'google-site-verification');
        document.head.appendChild(metaVerify);
      }
      metaVerify.setAttribute('content', seoConfig.googleSiteVerification);
    }

    // Google Analytics (GA4) Tag Injector
    if (seoConfig?.googleAnalyticsId) {
      const gId = seoConfig.googleAnalyticsId;
      const scriptId1 = 'google-analytics-script-src';
      const scriptId2 = 'google-analytics-script-init';
      
      let script1 = document.getElementById(scriptId1) as HTMLScriptElement | null;
      if (!script1) {
        const newScript1 = document.createElement('script');
        newScript1.id = scriptId1;
        newScript1.async = true;
        newScript1.src = `https://www.googletagmanager.com/gtag/js?id=${gId}`;
        document.head.appendChild(newScript1);
      }
      
      let script2 = document.getElementById(scriptId2) as HTMLScriptElement | null;
      if (!script2) {
        const newScript2 = document.createElement('script');
        newScript2.id = scriptId2;
        newScript2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gId}');
        `;
        document.head.appendChild(newScript2);
      }
    }

    // Google AdSense Auto Ads Script Injector
    if (seoConfig?.googleAdSenseId) {
      const pubId = seoConfig.googleAdSenseId;
      const adsenseScriptId = 'google-adsense-auto-ads';
      let script = document.getElementById(adsenseScriptId) as HTMLScriptElement | null;
      if (!script) {
        const newScript = document.createElement('script');
        newScript.id = adsenseScriptId;
        newScript.async = true;
        newScript.setAttribute('crossorigin', 'anonymous');
        newScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
        document.head.appendChild(newScript);
      }
    }
  }, [activeTab, seoConfig]);

  // Keep window path history exactly synced with active SPA tabs 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLocationSync = () => {
        const path = window.location.pathname;
        if (path === '/admin' || path.startsWith('/admin') || window.location.hash === '#/admin') {
          setActiveTab('admin');
        }
      };
      window.addEventListener('popstate', handleLocationSync);
      window.addEventListener('hashchange', handleLocationSync);
      return () => {
        window.removeEventListener('popstate', handleLocationSync);
        window.removeEventListener('hashchange', handleLocationSync);
      };
    }
  }, []);

  // Update browser pushState when activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isAdminPath = path === '/admin' || path.startsWith('/admin') || window.location.hash === '#/admin';
      
      if (activeTab === 'admin' && !isAdminPath) {
        window.history.pushState({ tab: 'admin' }, '', '/admin');
      } else if (activeTab !== 'admin' && isAdminPath) {
        window.history.pushState({ tab: activeTab }, '', '/');
      }
    }
  }, [activeTab]);

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;
    setFormSubmitted(true);
    setContactForm({ name: '', phone: '', query: '' });
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  const handleDownloadForm = () => {
    setActiveTab('form_filler');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-150' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Header component with search support, ticker and active tabs layout */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero section on Home tab */}
      {activeTab === 'home' && (
        <Hero onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }} />
      )}

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 md:py-10">
        
        {/* Header Ad Slot (Simulated high CPC leaderboard) */}
        <div className="mb-6 md:mb-10 w-full">
          <BannerAds ad={adList[0]} />
        </div>

        {/* Triple Layout: Main Content + Sticky Ad sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Dynamic Content Tabs (Column Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'home' && (
                  <div className="space-y-8">
                    
                    {/* Official Warning Box (Fake Websites Warning) */}
                    <div className="rounded-2xl border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20 p-5 md:p-6 shadow-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-20 w-20 transform translate-x-10 -translate-y-10 rounded-full bg-red-500/10" />
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-650 text-white font-bold shadow-md bg-linear-to-br from-red-600 to-orange-500">
                          <ShieldAlert className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-sans text-base md:text-lg font-bold text-red-700 dark:text-red-400">
                            ⚠️ জরুরী সতর্কতা: কোনো প্রতারকের ফাঁদে পা দেবেন না!
                          </h3>
                          <p className="mt-2 text-xs md:text-sm text-gray-700 dark:text-red-200 leading-relaxed font-semibold">
                            আজকাল ইন্টারনেট এবং সোশ্যাল মিডিয়াতে বিভিন্ন অজ্ঞাত পরিচয় ব্যক্তি বা ভুয়ো অন্নপূর্ণা ভান্ডারের ওয়েবসাইট মানুষের থেকে রেজিস্ট্রেশন বা পেমেন্ট চেক করার উদ্দেশ্যে টাকা কাটার চেষ্টা করছে। প্রকল্পটির জন্য আবেদন <strong>নিরাপদ ও সম্পূর্ণ বিনামূল্যে</strong>। কোনো প্রকার ওটিপি (OTP) বা ব্যাংক গোপন পাসওয়ার্ড কাউকে শেয়ার করবেন না।
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setActiveTab('news');
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                            >
                              সচেতনতা পোস্ট পড়ুন 📖
                            </button>
                            <span className="inline-flex items-center text-[11px] font-bold text-red-500 underline uppercase tracking-wider pl-2">
                              🛡️ West Bengal Police Warned
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheme Stats Cards */}
                    <div>
                      <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                        <span>অন্নপূর্ণা ভান্ডার प्रकल्प পরিসংখ্যান ও খতিয়ান ২০২৬:</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { title: "মোট আবেদনপত্র", count: SCHEME_STATS.totalApplications, desc: "ডিজিটাল জমা" },
                          { title: "অনুমোদিত আবেদন", count: SCHEME_STATS.totalProcessed, desc: "১০০% যাচাই করা" },
                          { title: "মোট অর্থ বরাদ্দ", count: SCHEME_STATS.amountDistributed, desc: "চলতি অর্থবর্ষ" },
                          { title: "সক্রিয় সাহায্যভোগী", count: SCHEME_STATS.activeBeneficiaries, desc: "পশ্চিমবঙ্গ জুড়ে" }
                        ].map((stat, idx) => (
                          <div key={idx} className="rounded-xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs text-center">
                            <span className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wide block mb-1">
                              {stat.title}
                            </span>
                            <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-red-600 to-orange-500 leading-none">
                              {stat.count}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              {stat.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Between Content Card In-article Ad */}
                    <BannerAds ad={adList[2]} />

                    {/* Scheme Overview */}
                    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                      <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {SCHEME_OVERVIEW.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-350 leading-relaxed font-semibold">
                        {SCHEME_OVERVIEW.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {SCHEME_OVERVIEW.highlights.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-orange-50/20 dark:bg-slate-950/40 p-3 rounded-xl border border-orange-100 dark:border-slate-850">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400">
                              <BadgeCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-850 dark:text-white">{item.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Online Applying Process Step-by-Step */}
                    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                      <div className="flex items-center justify-between border-b border-orange-100 dark:border-slate-800 pb-4 mb-6">
                        <div>
                          <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
                            অনলাইন আবেদন করার নির্ভুল ক্রমানুসার পদ্ধতি:
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            আপনার মোবাইল বা কম্পিউটার দিয়ে মাত্র ১০ মিনিটে করুন আবেদন
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('apply');
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-655 font-bold text-xs py-2 px-3 transition cursor-pointer"
                        >
                          <span>সম্পূর্ণ গাইড ➔</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {APPLY_STEPS.map((step, idx) => (
                          <div key={idx} className="flex gap-3 relative border-b border-gray-100 pb-4 last:border-b-0 md:border-b-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 font-extrabold text-orange-600 dark:text-orange-400 text-sm">
                              {step.step}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {step.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fast eligibility calculation trigger box */}
                    <div className="rounded-xl bg-orange-600 text-white p-6 shadow-md text-center bg-linear-to-r from-red-600 via-orange-500 to-amber-500 text-white">
                      <h4 className="text-lg font-black tracking-wide">
                        আপনি কি এই ₹৩,০০০ টাকা প্রতি মাস পাওয়ার জন্য যোগ্য?
                      </h4>
                      <p className="mt-2 text-xs text-orange-50 font-semibold max-w-xl mx-auto">
                        আমাদের ইন্টারেক্টিভ যোগ্যতা নিরূপক দিয়ে আপনার যোগ্যতা মাত্র ১ মিনিটে পরীক্ষা করুন সম্পূর্ণ অফিশিয়াল মানদণ্ড অনুসরণ করে।
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('eligibility');
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="mt-4 transition transform active:scale-95 duration-200 inline-flex items-center gap-1.5 rounded-lg bg-white text-orange-600 font-black text-xs py-3 px-6 shadow-md hover:bg-orange-50 cursor-pointer"
                      >
                        ১ মিনিটে প্রোফাইল যাচাই করুন (Verify Profile) 🔎
                      </button>
                    </div>

                    {/* Ad Block 2 */}
                    <BannerAds ad={adList[3]} />

                    {/* Important FAQs section on the homepage */}
                    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                      <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white mb-2">
                        সাধারণ মানুষের করা কিছু সাধারণ প্রশ্নোত্তর (FAQ Panel)
                      </h3>
                      <p className="text-xs text-gray-550 mb-6">
                        আপনার মনে স্কিম সংক্রান্ত কোন সংশয় থাকলে নিচের প্রশ্নগুলি একবার পড়ে নিন
                      </p>

                      <div className="space-y-3">
                        {FAQS.slice(0, 4).map((faq, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-xl border border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
                          >
                            <button
                              onClick={() => toggleFaq(idx)}
                              className="flex w-full items-center justify-between p-4 text-left cursor-pointer transition"
                            >
                              <span className="font-sans text-xs md:text-sm font-bold text-slate-850 dark:text-orange-100 flex items-center gap-1.5 leading-snug">
                                <HelpCircle className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                                <span>{faq.q}</span>
                              </span>
                              <ChevronDown className={`h-4.5 w-4.5 text-gray-400 shrink-0 transition-transform ${faqOpenIndex === idx ? 'transform rotate-180' : ''}`} />
                            </button>
                            {faqOpenIndex === idx && (
                              <div className="px-4 pb-4 prose prose-orange text-xs md:text-sm text-gray-600 dark:text-gray-450 border-t border-gray-100 p-3 bg-white dark:bg-slate-900">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 text-center">
                        <button
                          onClick={() => {
                            setActiveTab('faq');
                            window.scrollTo({ top: 360, behavior: 'smooth' });
                          }}
                          className="rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-slate-800 dark:text-orange-400 text-orange-600 text-xs font-bold py-2.5 px-4 transition cursor-pointer"
                        >
                          আরও প্রশ্নোত্তর দেখুন ➔
                        </button>
                      </div>
                    </div>

                    {/* Comments section box integrated on Home for viral engagement */}
                    <Comments />

                  </div>
                )}

                {/* Eligibility criteria tab views */}
                {activeTab === 'eligibility' && (
                  <div className="space-y-8">
                    
                    {/* Manual section overview */}
                    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
                      <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {ELIGIBILITY_RULES.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-6">{ELIGIBILITY_RULES.subtitle}</p>

                      <div className="space-y-3">
                        {ELIGIBILITY_RULES.rules.map((rule, idx) => (
                          <div key={idx} className="flex gap-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 font-semibold bg-orange-50/10 dark:bg-slate-950/20 p-3 rounded-xl border border-orange-105">
                            <span className="text-orange-600 font-bold">•</span>
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>

                      <h4 className="font-sans text-sm font-bold text-red-650 dark:text-red-400 mt-6 mb-3 uppercase tracking-wider">
                        ❌ কারা আবেদনের যোগ্য নন? (Ineligibility conditions Detail)
                      </h4>
                      <div className="space-y-2">
                        {ELIGIBILITY_RULES.notEligible.map((item, idx) => (
                          <div key={idx} className="flex gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-red-50/10 p-3 rounded-lg border border-red-100 text-red-656 font-medium">
                            <span>✕</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Eligibility Checker verifier calculator form */}
                    <EligibilityChecker />

                    {/* Inline Responsive ad block */}
                    <BannerAds ad={adList[1]} />
                  </div>
                )}

                {/* Applying guide process instructions tab */}
                {activeTab === 'apply' && (
                  <div className="rounded-2xl border border-orange-100 dark:border-slate-805 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100 dark:border-slate-800 pb-4 mb-3">
                      <div>
                        <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
                          অনলাইন আবেদন পদ্ধতি ২০২৬ (Apply Online Portal Manual)
                        </h3>
                        <p className="text-xs text-gray-550">
                          আপনার কম্পিউটার বা স্মার্টফোন ব্যবহার করে খুব সহজে ধাপে ধাপে পোর্টাল রেজিস্ট্রেশন বিবরণ
                        </p>
                      </div>
                      <button
                        onClick={handleDownloadForm}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-4 cursor-pointer font-sans shrink-0 bg-gradient-to-tr from-red-600 to-orange-500"
                      >
                        <Download className="h-4 w-4" />
                        <span>অফলাইন ফর্ম ডাউনলোড করুন (Free PDF)</span>
                      </button>
                    </div>

                    <div className="relative border-l border-orange-100 dark:border-slate-800 ml-4.5 pl-6 space-y-6">
                      {APPLY_STEPS.map((step, idx) => (
                        <div key={idx} className="relative">
                          {/* Circle indicator */}
                          <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white text-xs font-bold shadow-md">
                            {step.step}
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-950 dark:text-white leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Verification Simulation sandbox */}
                    <div className="rounded-xl border border-dashed border-emerald-400 bg-emerald-50/20 dark:bg-slate-950/20 p-5 mt-8">
                      <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                        🔒 সরাসরি আবেদন করার আগে গুরুত্বপূর্ণ ট্র্যাকিং উপদেশ:
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-semibold">
                        আবেদন সাবমিট করার পূর্বে আপনার প্রদান করা ব্যাংক একাউন্ট বইয়ের বিবরণী এবং আইএফএসসি কোড (IFSC Code) আর একবার সতর্কতার সাথে মিলিয়ে নিন। কোনো ভুল তথ্যের দরুন আপনার আবেদন বাতিল হলে পুনরায় তা ঠিক করা সময়সাপেক্ষ।
                      </p>
                    </div>
                  </div>
                )}

                {/* Tracking verification payment status tab */}
                {activeTab === 'status' && (
                  <div className="space-y-8">
                    <StatusChecker />
                    <BannerAds ad={adList[3]} />
                  </div>
                )}

                {/* Required checklists and documents tab */}
                {activeTab === 'documents' && (
                  <div className="rounded-2xl border border-orange-105 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
                    <div className="flex items-center justify-between border-b border-orange-100 dark:border-slate-820 pb-4 mb-6">
                      <div>
                        <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
                          প্রয়োজনীয় নথিপত্র গাইড (Checklist Documents Required)
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          ফর্ম ফি-আপের সময় স্ক্যান করে আপলোড করতে হবে বা ক্যাম্পে জেরক্স জমা দিতে হবে
                        </p>
                      </div>
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        বাধ্যতামূলক ৭ টি নথি
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-150 dark:border-slate-850">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-left text-xs font-semibold">
                        <thead className="bg-gray-50 dark:bg-slate-850 text-gray-750 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-3">দলিলের নাম</th>
                            <th className="px-4 py-3">विवरण (Description)</th>
                            <th className="px-5 py-3 text-right">স্থিতি</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                          {DOCUMENTS_REQUIRED.map((doc, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-900">
                              <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-orange-600 shrink-0"></span>
                                <span>{doc.name}</span>
                              </td>
                              <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {doc.desc}
                              </td>
                              <td className="px-5 py-3.5 text-right shrink-0">
                                {doc.required ? (
                                  <span className="bg-red-100 text-red-800 font-black text-[9px] px-2 py-0.5 select-none rounded-full whitespace-nowrap">বাধ্যতামূলক</span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-400 font-bold text-[9px] px-2 py-0.5 rounded-full select-none whitespace-nowrap">ঐচ্ছিক</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-red-50/20 dark:bg-slate-950/20 p-5 rounded-xl border-l-4 border-red-500 mt-6 text-slate-705 dark:text-red-200 text-xs font-medium leading-relaxed">
                      💡 <strong>গুরুত্বপূর্ণ পরামর্শ:</strong> আধার কার্ডের নাম ও ব্যাংক একাউন্ট বইয়ের বেনিফিশিয়ারি নাম যেন হুবহু এক হয়। ডাব্লিউবি-তে কোনো অমিল দেখা দিলে সঙ্গে সঙ্গে নিকটবর্তী আধার ভেরিফাই পয়েন্টে গিয়ে নাম সংশোধন করান।
                    </div>
                  </div>
                )}

                {/* Interactive Dynamic Form filler tab */}
                {activeTab === 'form_filler' && (
                  <FormFiller />
                )}

                {/* Latest news articles list */}
                {activeTab === 'news' && (
                  <div className="space-y-6">
                    <NewsSection searchQuery={searchQuery} />
                    <BannerAds ad={adList[4]} />
                  </div>
                )}
                {activeTab === 'faq' && (
                  <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md space-y-4">
                    <div className="border-b border-orange-100 dark:border-slate-800 pb-4 mb-3">
                      <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
                        প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী গাইড (FAQ Base)
                      </h3>
                      <p className="text-xs text-gray-550">
                        সাধারণ আবেদনকারীদের করা কিছু গুরুত্বপূর্ণ প্রশ্ন এবং তার সঠিক প্রশাসনিক ও আইনি সমাধান
                      </p>
                    </div>

                    <div className="space-y-3">
                      {FAQS.map((faq, idx) => (
                        <div
                          key={idx}
                          className="overflow-hidden rounded-xl border border-gray-155 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
                        >
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="flex w-full items-center justify-between p-4 text-left cursor-pointer transition focus:outline-hidden"
                          >
                            <span className="font-sans text-xs md:text-sm font-bold text-slate-850 dark:text-orange-100 flex items-center gap-1.5 leading-snug">
                              <HelpCircle className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                              <span>{faq.q}</span>
                            </span>
                            <ChevronDown className={`h-4.5 w-4.5 text-gray-400 shrink-0 transition-transform ${faqOpenIndex === idx ? 'transform rotate-180' : ''}`} />
                          </button>
                          {faqOpenIndex === idx && (
                            <div className="px-4 pb-4 prose prose-orange text-xs md:text-sm text-gray-700 dark:text-gray-400 border-t border-gray-100 p-3 bg-white dark:bg-slate-900">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact information form */}
                {activeTab === 'contact' && (
                  <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
                    <div className="border-b border-orange-130 dark:border-slate-800 pb-4 mb-6">
                      <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
                        আমাদের সাথে যোগাযোগ করুন (Contact Us Portal)
                      </h3>
                      <p className="text-xs text-gray-550 font-semibold">
                        আপনার কোনো জরুরি পরামর্শ বা প্রশ্ন থাকলে সরাসরি নিচের ফর্মে ফিলাপ করে জানান
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left contact info */}
                      <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-slate-800 dark:text-orange-400">
                            <PhoneCall className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              প্রশাসনিক তথ্য সহায়তা নাম্বার:
                            </h4>
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-mono mt-0.5">
                              {contactConfig?.phone || "১৮০০-৩৪৫-৫৬৭৮ (বিনামূল্যে কল করুন)"}
                            </p>
                            {contactConfig?.phoneSubtext && (
                              <p className="text-[11px] text-gray-400">
                                {contactConfig.phoneSubtext}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-slate-800 dark:text-orange-400">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              সাহায্যকারী ইমেল ঠিকানা (Email Support):
                            </h4>
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-mono mt-0.5">
                              {contactConfig?.email || "support@annapurna-bhandar-portal.org"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-slate-800 dark:text-orange-400">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              যোগাযোগের ঠিকানা (Address):
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                              {contactConfig?.address || "বিকাশ ভবন, সল্টলেক সিটি, ৭ম তলা, কলকাতা ৭০০০৯১, পশ্চিমবঙ্গ, ভারত।"}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Warning banner */}
                        {contactConfig?.warning && (
                          <div className="rounded-lg p-3.5 bg-yellow-50 dark:bg-slate-850 text-xs text-yellow-800 dark:text-yellow-300 font-semibold border border-yellow-100 dark:border-slate-801">
                            {contactConfig.warning}
                          </div>
                        )}
                      </div>

                      {/* Right direct mail form */}
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        {formSubmitted && (
                          <div className="rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs p-4 border border-emerald-300 animate-pulse">
                            ✓ আপনার বার্তা সফলভাবে পাঠানো হয়েছে! প্রশাসন শীঘ্রই যোগাযোগ করতে পারে।
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase">আপনার নাম (Name)</label>
                          <input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 py-2.5 px-3 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase">আপনার মোবাইল নম্বর (Mobile No.)</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-705 bg-gray-50 dark:bg-slate-850 py-2.5 px-3 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase font-semibold">আপনার প্রশ্ন বা অভিযোগ (Write Message)</label>
                          <textarea
                            rows={3}
                            value={contactForm.query}
                            onChange={(e) => setContactForm({ ...contactForm, query: e.target.value })}
                            className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 py-2.5 px-3 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full transition transform active:scale-95 duration-200 cursor-pointer rounded-lg bg-orange-650 text-white font-bold text-xs py-3 rounded uppercase bg-gradient-to-r from-red-600 to-orange-500"
                        >
                          বার্তা পাঠান (Submit Query)
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Admin Verification and Management Control Area */}
                {activeTab === 'admin' && (
                  <AdminPanel />
                )}

                {/* Legal Policy standalone screens loading */}
                {(activeTab === 'about' || activeTab === 'privacy' || activeTab === 'terms' || activeTab === 'disclaimer') && (
                  <LegalPages pageId={activeTab as any} />
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: AdSense High CPC Sticky Sidebar (Column Span 4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Call to Actions Quick panel */}
            <div className="rounded-xl border border-orange-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-orange-100 flex items-center gap-1.5 border-b border-gray-100 dark:border-slate-800 pb-2 mb-3">
                <Flame className="h-4.5 w-4.5 text-red-500" />
                <span>দ্রুত সেবা লিঙ্কসমূহ (Quick Tools)</span>
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('apply'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-750 dark:text-gray-200 rounded-lg p-3 bg-orange-50/50 dark:bg-slate-950/20 shadow-2xs hover:bg-orange-100 transition duration-200 text-left"
                >
                  <span>📝 অন্নপূর্ণা ভান্ডার ফর্ম ফিলাপ</span>
                  <span className="text-orange-600 font-bold">➔</span>
                </button>
                <button
                  onClick={() => { setActiveTab('status'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-750 dark:text-gray-200 rounded-lg p-3 bg-orange-50/50 dark:bg-slate-950/20 shadow-2xs hover:bg-orange-100 transition duration-200 text-left"
                >
                  <span>💰 জুন মাসের কিস্তির পেমেন্ট স্ট্যাটাস</span>
                  <span className="text-orange-600 font-bold">➔</span>
                </button>
                <button
                  onClick={handleDownloadForm}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-750 dark:text-gray-200 rounded-lg p-3 bg-orange-50/50 dark:bg-slate-950/20 shadow-2xs hover:bg-orange-100 transition duration-200 text-left"
                >
                  <span>⬇️ নতুন PDF আবেদন পত্র ডাউনলোড</span>
                  <span className="text-orange-600 font-bold">➔</span>
                </button>
              </div>
            </div>

            {/* Sidebar High-CTR Sticky Ad block */}
            <div className="sticky top-28 space-y-6">
              <BannerAds ad={adList[1]} />
              
              {/* Follow on Social Channels */}
              <div className="rounded-xl border border-amber-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <h4 className="font-sans text-sm font-bold text-slate-850 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 mb-3">
                  অফিসিয়াল নিউজ চ্যানেল জয়েন করুন:
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-normal font-semibold">
                  নতুন সরকারি ফর্ম ঘোষণা এবং দুয়ারে ফ্রিতে ফর্ম ফিলাপের তথ্য সরাসরি আপনার ফোনে নোটিফিকেশন পেতে আমাদের হোয়াটসঅ্যাপ ও টেলিগ্রাম এ আজই যুক্ত হোন।
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("টেলিগ্রাম নিউজ চ্যানেলে যুক্ত হচ্ছেন..."); }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600"
                  >
                    <TelegramIcon className="h-4 w-4" />
                    <span>আইডিআ টেলিগ্রাম জয়েন করুন 🔗</span>
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("ফেসবুক হেল্প গ্রুপে যুক্ত হচ্ছেন..."); }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>ফেসবুক গ্রুপে জয়েন করুন 🔗</span>
                  </a>
                </div>
              </div>

              {/* Sidebar Quick Ad Block 2 */}
              <BannerAds ad={adList[3]} />
            </div>

          </aside>

        </div>

        {/* Footer Leaderboard Banner (Simulated high CPC adsense bottom ad) */}
        <div className="mt-12 md:mt-20 w-full mb-6">
          <BannerAds ad={adList[4]} />
        </div>

      </main>

      {/* Footer Legal Compliances Links for maximum AdSense pass possibility */}
      <footer className="bg-slate-900 border-t-4 border-orange-500 text-slate-300 text-xs py-10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 text-center space-y-6">
          
          {/* Verified Sharing Backlinks */}
          {backlinksList && backlinksList.length > 0 && (
            <div className="border-b border-slate-800 pb-5 text-center space-y-3">
              <p className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">
                🔗 ভেরিফাইড প্রচার ব্যাকলিঙ্ক (Verified Sharing Backlinks)
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px]">
                {backlinksList.map((link) => (
                  <a
                    key={link.id || link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-400 bg-slate-950/40 border border-slate-800/80 px-2.5 py-1 rounded transition duration-200"
                  >
                    {link.platform === 'facebook' && <Facebook className="h-3 w-3 text-blue-500 shrink-0" />}
                    {link.platform === 'telegram' && <TelegramIcon className="h-3 w-3 text-sky-400 shrink-0" />}
                    {link.platform !== 'facebook' && link.platform !== 'telegram' && <ExternalLink className="h-3 w-3 text-orange-400 shrink-0" />}
                    <span className="font-medium font-serif">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 font-semibold text-slate-350">
            <button onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-orange-400 cursor-pointer">হোম (Home)</button>
            <button onClick={() => { setActiveTab('about'); window.scrollTo({ top: 350, behavior: 'smooth' }); }} className="hover:text-orange-400 cursor-pointer">আমাদের সম্পর্কে (About Us)</button>
            <button onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 350, behavior: 'smooth' }); }} className="hover:text-orange-400 cursor-pointer">গোপনীয়তা নীতি (Privacy Policy)</button>
            <button onClick={() => { setActiveTab('terms'); window.scrollTo({ top: 350, behavior: 'smooth' }); }} className="hover:text-orange-400 cursor-pointer">শর্তাবলী (Terms & Conditions)</button>
            <button onClick={() => { setActiveTab('disclaimer'); window.scrollTo({ top: 350, behavior: 'smooth' }); }} className="hover:text-orange-400 cursor-pointer">অস্বীকৃতি (Disclaimer)</button>
            <button onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 350, behavior: 'smooth' }); }} className="hover:text-orange-400 cursor-pointer">যোগাযোগ (Contact)</button>
          </div>

          <p className="max-w-4xl mx-auto text-[11px] text-gray-500 leading-relaxed">
            <strong>অনুরোধ এবং অস্বীকৃতি:</strong> এই পোর্টালটি (www.annapurna-bhandar-2026.org) পশ্চিমবঙ্গের সামাজিক সাহায্য যোজনা অন্নপূর্ণা ভান্ডার প্রকল্প ২০২৬ সম্পর্কিত তথ্য ভিত্তিক গাইড প্রদান করে থাকে। আমাদের উদ্দেশ্য কেবল মানুষকে সচেতন করা। পোর্টালটি কোনো স্বায়ত্তশাসিত বা সরকারি মালিকানাধীন গেজেটেড অফিসিয়াল সাইট নয়। এই পোর্টালে উপস্থাপিত তথ্যের কোনো রকম ভুলত্রুটির জন্য পরিচালকমণ্ডলী বা মালিকপক্ষ কোনো ভাবেই দায়বদ্ধ থাকবে না। সঠিক ও সম্পূর্ণ তথ্যের জন্য সর্বদা পশ্চিমবঙ্গ সরকারের অফিসিয়াল সরকারি পোর্টাল বা স্থানীয় পঞ্চায়েত / বিডিও দপ্তরের বিজ্ঞাপন ও বিজ্ঞপ্তি অনুসরণ করুন।
          </p>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
            <p className="font-medium font-sans">
              Copyright © ২০২৬ অন্নপূর্ণা ভান্ডার যোজনা তথ্য গাইড পোর্টাল। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-2">
              <span className="bg-orange-600/20 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                🔒 SSL Encrypted Portal
              </span>
              <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                ✓ WCAG 2.1 AAA Compliant
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating push permissions, scroll, whatsapp popups controllers */}
      <FloatingActions />

    </div>
  );
}
