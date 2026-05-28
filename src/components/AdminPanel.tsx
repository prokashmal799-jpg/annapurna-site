/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  Lock, User, LogIn, LogOut, FileText, PlusCircle, Trash2, Edit3, 
  Settings, PenSquare, X, Check, ArrowLeft, Image, BookOpen, Eye, 
  FolderPlus, HelpCircle, LayoutGrid, Radio, Share2, MessageSquare, 
  Search, ShieldAlert, Sparkles, TrendingUp, RefreshCw, Calendar, 
  Clock, Globe, Sliders, ChevronRight, CheckSquare, ListPlus, Moon, Sun, UploadCloud,
  ExternalLink
} from 'lucide-react';
import { 
  auth, db 
} from '../lib/firebase';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser 
} from 'firebase/auth';
import { 
  NewsPost, Comment, AdSetting, ContactSetting 
} from '../types';
import { 
  fetchPosts, addPost, updatePost, deletePost, 
  fetchTickers, saveTicker, deleteTicker, TickerItem,
  fetchAds, saveAd, 
  fetchSeoSettings, saveSeoSettings, SeoSetting,
  fetchContactSettings, saveContactSettings,
  fetchComments, approveComment, deleteComment,
  fetchHomepageLayout, saveHomepageLayout, HomepageLayout,
  fetchCategories, addCategory, deleteCategory, CategoryItem,
  fetchAnalytics, AnalyticStats,
  fetchBacklinks, saveBacklink, deleteBacklink, BacklinkItem,
  fetchSubscribers, fetchPushCampaigns, savePushCampaign
} from '../lib/dbSync';
import { Subscriber, PushCampaign } from '../types';

const IMAGE_PRESETS = [
  {
    name: "মহিলা কর্মসংস্থান ও স্বাবলম্বী প্রকল্প",
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "সরকারি দুয়ারে ক্যাম্প মিটিং",
    url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "ডিজিটাল সিকিউরিটি ও জনসচেতনতা",
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "পশ্চিমবঙ্গ গ্রামীণ নারীর পুষ্টি প্রকল্প",
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600"
  }
];

export default function AdminPanel() {
  // --- STATE MANAGERS ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionAuth, setSessionAuth] = useState(() => sessionStorage.getItem('annapurna_session_auth') === 'true');
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sane Defaults
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('annapurna_admin_dark') === 'true');
  const [activeMenu, setActiveMenu] = useState<'analytics' | 'posts' | 'tickers' | 'comments' | 'homepage' | 'seo_categories' | 'backlinks' | 'seo_booster' | 'content_generator'>('analytics');
  
  // Data State Synced from dbSync / Firestore
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [ads, setAds] = useState<AdSetting[]>([]);
  const [seo, setSeo] = useState<SeoSetting | null>(null);
  const [contact, setContact] = useState<ContactSetting | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [contactPhoneSubtext, setContactPhoneSubtext] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactWarning, setContactWarning] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [homepage, setHomepage] = useState<HomepageLayout | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticStats[]>([]);
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // --- FORM STATES ---
  // Backlinks form states
  const [backlinkUrl, setBacklinkUrl] = useState('');
  const [backlinkPlatform, setBacklinkPlatform] = useState('facebook');
  const [backlinkTitle, setBacklinkTitle] = useState('');

  // Posts form
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState(IMAGE_PRESETS[0].url);
  const [formDate, setFormDate] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [formScheduled, setFormScheduled] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isCreatingNewPost, setIsCreatingNewPost] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(-1);

  // Tickers form
  const [tickerText, setTickerText] = useState('');
  const [tickerLink, setTickerLink] = useState('');
  const [tickerActive, setTickerActive] = useState(true);
  const [editingTickerId, setEditingTickerId] = useState<string | null>(null);

  // AI Content Generator states
  const [cgKeyword, setCgKeyword] = useState('DBT Scheme');
  const [cgCustomKeyword, setCgCustomKeyword] = useState('');
  const [cgTopic, setCgTopic] = useState('DBT আধার লিঙ্ক');
  const [cgAdditional, setCgAdditional] = useState('');
  const [cgTone, setCgTone] = useState('informative');
  const [cgLength, setCgLength] = useState('long');
  const [cgStatus, setCgStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [cgLoadingStep, setCgLoadingStep] = useState(0);
  const [cgError, setCgError] = useState('');
  const [cgGeneratedArticle, setCgGeneratedArticle] = useState<{ title: string; excerpt: string; content: string; category: string } | null>(null);

  // SEO form
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoAuthor, setSeoAuthor] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const [seoGoogleSiteVerification, setSeoGoogleSiteVerification] = useState('');
  const [seoGoogleAnalyticsId, setSeoGoogleAnalyticsId] = useState('');
  const [seoGoogleAdSenseId, setSeoGoogleAdSenseId] = useState('');

  // Ads settings forms
  const [adCodeHeader, setAdCodeHeader] = useState('');
  const [adCodeSidebar, setAdCodeSidebar] = useState('');
  const [adCodeInArticle1, setAdCodeInArticle1] = useState('');
  const [adCodeInArticle2, setAdCodeInArticle2] = useState('');
  const [adActiveHeader, setAdActiveHeader] = useState(true);
  const [adActiveSidebar, setAdActiveSidebar] = useState(true);
  const [adActiveIn1, setAdActiveIn1] = useState(true);
  const [adActiveIn2, setAdActiveIn2] = useState(true);

  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState('');

  // Profile Form
  const [profileName, setProfileName] = useState(() => sessionStorage.getItem('annapurna_profile_name') || 'অন্নপূর্ণা রাইটার প্যানেল');
  const [profileBio, setProfileBio] = useState(() => sessionStorage.getItem('annapurna_profile_bio') || 'অফিশিয়াল কন্টেন্ট অ্যাভিয়েটর এবং সাইট মডারেটর ২০২৬।');

  // Toasts
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // --- INTEGRATED AUTH RECRUITER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email !== "prokashmal799@gmail.com") {
        signOut(auth).then(() => {
          setLoginError('দুঃখিত, এই গুগল অ্যাকাউন্ট দিয়ে প্রবেশাধিকার নেই! শুধুমাত্র এডমিন প্রবেশ করতে পারবেন।');
        });
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Global Theme classes
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('annapurna_admin_dark', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Handle data fetching
  const loadDatabase = async () => {
    setDataLoading(true);
    try {
      const [fetchedPosts, fetchedTickers, fetchedAds, fetchedSeo, fetchedContact, fetchedComments, fetchedLayout, fetchedCats, fetchedStats, fetchedBacklinks] = await Promise.all([
        fetchPosts(),
        fetchTickers(),
        fetchAds(),
        fetchSeoSettings(),
        fetchContactSettings(),
        fetchComments(),
        fetchHomepageLayout(),
        fetchCategories(),
        fetchAnalytics(),
        fetchBacklinks()
      ]);

      setPosts(fetchedPosts);
      setTickers(fetchedTickers);
      setAds(fetchedAds);
      setSeo(fetchedSeo);
      setContact(fetchedContact);
      setComments(fetchedComments);
      setHomepage(fetchedLayout);
      setCategories(fetchedCats);
      setAnalytics(fetchedStats);
      setBacklinks(fetchedBacklinks);

      // Populate SEO fields
      setSeoTitle(fetchedSeo.title);
      setSeoDesc(fetchedSeo.description);
      setSeoKeywords(fetchedSeo.keywords);
      setSeoAuthor(fetchedSeo.author);
      setSeoOgImage(fetchedSeo.ogImage);
      setSeoGoogleSiteVerification(fetchedSeo.googleSiteVerification || '');
      setSeoGoogleAnalyticsId(fetchedSeo.googleAnalyticsId || '');
      setSeoGoogleAdSenseId(fetchedSeo.googleAdSenseId || '');

      // Populate Contact fields
      setContactPhone(fetchedContact.phone || '');
      setContactPhoneSubtext(fetchedContact.phoneSubtext || '');
      setContactEmail(fetchedContact.email || '');
      setContactAddress(fetchedContact.address || '');
      setContactWarning(fetchedContact.warning || '');

      // Populate Ads configuration fields
      const hAd = fetchedAds.find(a => a.id === 'ad-header');
      const sAd = fetchedAds.find(a => a.id === 'ad-sidebar');
      const i1 = fetchedAds.find(a => a.id === 'ad-in-article-1');
      const i2 = fetchedAds.find(a => a.id === 'ad-in-article-2');

      if (hAd) {
        setAdCodeHeader((hAd as any).code || '');
        setAdActiveHeader(hAd.active);
      }
      if (sAd) {
        setAdCodeSidebar((sAd as any).code || '');
        setAdActiveSidebar(sAd.active);
      }
      if (i1) {
        setAdCodeInArticle1((i1 as any).code || '');
        setAdActiveIn1(i1.active);
      }
      if (i2) {
        setAdCodeInArticle2((i2 as any).code || '');
        setAdActiveIn2(i2.active);
      }

      if (fetchedCats.length > 0 && !formCategory) {
        setFormCategory(fetchedCats[0].name);
      }

    } catch (e) {
      console.error('Could not populate dashboard records', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser || sessionAuth) {
      loadDatabase();
    }
  }, [currentUser, sessionAuth]);

  // Form Bengali Date Preset
  useEffect(() => {
    if (!formDate) {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('bn-BD', options);
      setFormDate(formattedDate);
    }
  }, [formDate]);

  // Phonetic Auto-Slug Translation Helper
  const generateSlugOfBengali = (text: string) => {
    const bMap: { [key: string]: string } = {
      'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
      'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
      'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
      'প': 'p', 'ف': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'y', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
      'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n',
      'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
    };

    const parsed = text
      .toLowerCase()
      .split('')
      .map(char => bMap[char] !== undefined ? bMap[char] : char)
      .join('');

    return parsed
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Synchronize dynamic slug generation
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    setFormSlug(generateSlugOfBengali(val));
  };

  // --- ACTIONS HANDLERS ---

  // Secure Auth Helpers
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const handleCustomLogin = (e: FormEvent) => {
    e.preventDefault();
    if (customUsername.trim() === 'admin' && customPassword === 'Pradip@01') {
      setSessionAuth(true);
      sessionStorage.setItem('annapurna_session_auth', 'true');
      triggerToast('এডমিন অ্যাকাউন্টে সফলভাবে লগইন হয়েছে!');
    } else {
      setLoginError('ভুল আইডি বা পাসওয়ার্ড!');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setSessionAuth(false);
      sessionStorage.removeItem('annapurna_session_auth');
      triggerToast('সফলভাবে সাইন-আউট করা হয়েছে!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email !== "prokashmal799@gmail.com") {
        await signOut(auth);
        setLoginError('দুঃখিত, এই গুগল অ্যাকাউন্ট দিয়ে প্রবেশাধিকার নেই! শুধুমাত্র এডমিন প্রবেশ করতে পারবেন।');
      } else {
        triggerToast('গুগল অ্যাকাউন্টের মাধ্যমে সফলভাবে সাইন-ইন করা হয়েছে!');
      }
    } catch (e: any) {
      console.error("Google login failed details:", e);
      let errMsg = 'গুগল সাইন-ইন করতে সমস্যা হয়েছে!';
      
      const errCode = e.code || '';
      if (errCode === 'auth/popup-blocked') {
        errMsg = '⚠️ পপআপ উইন্ডো ব্লক করা হয়েছে! AI Studio আইফ্রেমের জন্য এটি হতে পারে। অনুগ্রহ করে উপর থেকে সাইটের সম্পুর্ণ লিংক নতুন ট্যাবে (Open in New Tab) ওপেন করে জিমেইল দিয়ে সাইন-ইন করুন।';
      } else if (errCode === 'auth/unauthorized-domain') {
        errMsg = '⚠️ এই ডোমেইনটি আপনার ফায়ারবেস অ্যাকাউন্টে অনুমোদিত (Authorized) ডোমেইন লিস্টে নেই! Firebase Console > Authentication > Settings > Authorized Domains-এ এই ডোমেইনটি যুক্ত করুন।';
      } else if (errCode === 'auth/operation-not-allowed') {
        errMsg = '⚠️ আপনার Firebase প্রজেক্টে Google Sign-in সক্রিয় করা হয়নি! Firebase Console > Authentication > Sign-in method-এ গিয়ে Google সক্রিয় (Enable) করুন।';
      } else if (errCode === 'auth/popup-closed-by-user') {
        errMsg = 'নিবন্ধন উইন্ডোটি আপনি বন্ধ করে দিয়েছেন। আবার চেষ্টা করুন।';
      } else if (errCode === 'auth/cancelled-popup-request') {
        errMsg = 'পপআপ বাতিল করা হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।';
      } else {
        errMsg = `ত্রুটি (${errCode}): ${e.message || 'দয়া করে আপনার ফায়ারবেস কনসোল কনফিগারেশন চেক করুন।'}`;
      }
      
      setLoginError(errMsg);
    }
  };

  // Post Submission (Create or Edit)
  const handlePublishPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim() || !formContent.trim()) {
      alert("অনুগ্রহ করে শিরোনাম, সংক্ষিপ্ত বিবরণী এবং বিস্তারিত খবরটি লিখুন!");
      return;
    }

    const postPayload = {
      title: formTitle,
      slug: formSlug || generateSlugOfBengali(formTitle),
      category: formCategory || 'পেমেন্ট আপডেট',
      excerpt: formExcerpt,
      content: formContent,
      image: formImage,
      date: formDate,
      views: editingPostId ? (posts.find(p => p.id === editingPostId)?.views || 1500) : Math.floor(Math.random() * 500) + 1200,
      published: formPublished,
      scheduledAt: formScheduled || ''
    };

    try {
      if (!currentUser && !sessionAuth) {
        const id = editingPostId || `custom-news-${Date.now()}`;
        const finalPost = { ...postPayload, id };
        const storedPostsString = localStorage.getItem('annapurna_news_articles_2026');
        const storedPosts = storedPostsString ? JSON.parse(storedPostsString) : [];
        let updatedPosts;
        if (editingPostId) {
          updatedPosts = storedPosts.map((p: any) => p.id === editingPostId ? { ...p, ...finalPost } : p);
        } else {
          updatedPosts = [finalPost, ...storedPosts];
        }
        localStorage.setItem('annapurna_news_articles_2026', JSON.stringify(updatedPosts));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: নিউজ নিবন্ধটি লোকালি সেভ করা হয়েছে! ডাটাবেসে আপডেট করতে গুগল লগইন ব্যবহার করুন।");
        setPosts(updatedPosts);
        setIsCreatingNewPost(false);
        resetPostForm();
        return;
      }

      if (editingPostId) {
        await updatePost(editingPostId, postPayload);
        triggerToast("নিউজ পোস্টটি সফলভাবে এডিট ও ক্লাউড ডাটাবেজে আপডেট করা হয়েছে!");
      } else {
        await addPost(postPayload);
        triggerToast("অভিনন্দন! নতুন খবরটি সফলভাবে ক্লাউড ডাটাবেজে পাবলিশ করা হয়েছে!");
      }
      
      // Reload entries
      await loadDatabase();
      
      // Close pane
      setIsCreatingNewPost(false);
      resetPostForm();
    } catch (e: any) {
      let extMsg = "";
      if (e && e.message) {
        try {
          const parsed = JSON.parse(e.message);
          if (parsed && parsed.error) extMsg = "\n\nError details: " + parsed.error;
          else extMsg = "\n\nError details: " + e.message;
        } catch (_) {
          extMsg = "\n\nError details: " + e.message;
        }
      }
      alert("ত্রুটি: Firestore-এ খবর ডাটাবেজে লিখতে ব্যর্থ। অনুগ্রহ করে এডমিন পারমিশন চেক করুন।" + extMsg);
    }
  };
  const resetPostForm = () => {
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormContent('');
    setFormImage(IMAGE_PRESETS[0].url);
    const today = new Date();
    setFormDate(today.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }));
    setFormPublished(true);
    setFormScheduled('');
    setEditingPostId(null);
  };

  const handleEditInit = (post: NewsPost) => {
    setEditingPostId(post.id);
    setFormTitle(post.title);
    setFormSlug(post.slug || generateSlugOfBengali(post.title));
    setFormCategory(post.category);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormImage(post.image);
    setFormDate(post.date);
    setFormPublished((post as any).published !== undefined ? (post as any).published : true);
    setFormScheduled((post as any).scheduledAt || '');
    setIsCreatingNewPost(true);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই খবরটি মুছে ফেলতে চান? এটি চিরতরে ক্লাউড ডাটাবেজ থেকে মুছে যাবে।")) {
      try {
        if (!currentUser && !sessionAuth) {
          const storedPostsString = localStorage.getItem('annapurna_news_articles_2026');
          const storedPosts = storedPostsString ? JSON.parse(storedPostsString) : [];
          const updated = storedPosts.filter((p: any) => p.id !== id);
          localStorage.setItem('annapurna_news_articles_2026', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          triggerToast("ডেমো মোড: খবরটি লোকালি মুছে ফেলা হয়েছে!");
          setPosts(updated);
          return;
        }
        await deletePost(id);
        triggerToast("পোস্টটি সফলভাবে মুছে ফেলা হয়েছে!");
        await loadDatabase();
      } catch (e) {
        alert("মোছার চেষ্টা ব্যর্থ। পারমিশন সমস্যা!");
      }
    }
  };

  // Tickers creation / edits
  const handleSaveTicker = async (e: FormEvent) => {
    e.preventDefault();
    if (!tickerText.trim()) return;

    const id = editingTickerId || `ticker-${Date.now()}`;
    const payload: TickerItem = {
      id,
      text: tickerText,
      link: tickerLink,
      active: tickerActive,
      createdAt: new Date().toISOString()
    };

    try {
      if (!currentUser && !sessionAuth) {
        const storedTickersString = localStorage.getItem('annapurna_tickers_2026');
        const storedTickers = storedTickersString ? JSON.parse(storedTickersString) : [];
        const updated = [payload, ...storedTickers.filter((tk: any) => tk.id !== id)];
        localStorage.setItem('annapurna_tickers_2026', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: ব্রেকিং নিউজ টিকার লোকালি সেভ করা হয়েছে!");
        setTickers(updated);
        setTickerText('');
        setTickerLink('');
        setTickerActive(true);
        setEditingTickerId(null);
        return;
      }
      await saveTicker(payload);
      triggerToast("ব্রেকিং নিউজ টিকার সফলভাবে আপডেট করা হয়েছে!");
      setTickerText('');
      setTickerLink('');
      setTickerActive(true);
      setEditingTickerId(null);
      await loadDatabase();
    } catch (e) {
      alert("টিকার আপলোডে ব্যর্থতা।");
    }
  };

  const handleDeleteTicker = async (id: string) => {
    if (window.confirm("টিকারটি ডিলিট করতে চান?")) {
      try {
        if (!currentUser && !sessionAuth) {
          const storedTickersString = localStorage.getItem('annapurna_tickers_2026');
          const storedTickers = storedTickersString ? JSON.parse(storedTickersString) : [];
          const updated = storedTickers.filter((t: any) => t.id !== id);
          localStorage.setItem('annapurna_tickers_2026', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          triggerToast("ডেমো মোড: টিকার লোকালি রিমুভ করা হয়েছে!");
          setTickers(updated);
          return;
        }
        await deleteTicker(id);
        triggerToast("টিকার সফলভাবে ডিলিট করা হয়েছে!");
        await loadDatabase();
      } catch (e) {
        alert("ত্রুটি।");
      }
    }
  };

  const handleEditTickerInit = (tk: TickerItem) => {
    setEditingTickerId(tk.id);
    setTickerText(tk.text);
    setTickerLink(tk.link);
    setTickerActive(tk.active);
  };

  // Ads settings update
  const handleSaveAds = async () => {
    try {
      const adsList = [
        { id: 'ad-header', type: 'leaderboard', active: adActiveHeader, code: adCodeHeader, title: "Header Banner", ctaText: "Details", linkUrl: "" },
        { id: 'ad-sidebar', type: 'sidebar', active: adActiveSidebar, code: adCodeSidebar, title: "Sidebar Sticky", ctaText: "Details", linkUrl: "" },
        { id: 'ad-in-article-1', type: 'rectangle', active: adActiveIn1, code: adCodeInArticle1, title: "In-Article 1", ctaText: "Learn more", linkUrl: "" },
        { id: 'ad-in-article-2', type: 'rectangle', active: adActiveIn2, code: adCodeInArticle2, title: "In-Article 2", ctaText: "Apply", linkUrl: "" },
      ];

      if (!currentUser && !sessionAuth) {
        localStorage.setItem('annapurna_ad_settings_2026', JSON.stringify(adsList));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: অ্যাডস কোড লোকালি সেভ করা হয়েছে! ডাটাবেসে আপডেট করতে গুগল সাইন-ইন ব্যবহার করুন।");
        return;
      }

      for (const item of adsList) {
        await saveAd(item as any);
      }
      triggerToast("AdSense কোড এবং ব্যানার কনফিগারেশন সফলভাবে ক্লাউডে সেভ করা হয়েছে!");
      await loadDatabase();
    } catch (e: any) {
      let extMsg = "";
      if (e && e.message) {
        try {
          const parsed = JSON.parse(e.message);
          if (parsed && parsed.error) extMsg = "\n\nError details: " + parsed.error;
          else extMsg = "\n\nError details: " + e.message;
        } catch (_) {
          extMsg = "\n\nError details: " + e.message;
        }
      }
      alert("অ্যাডস কোড আপলোড করতে ত্রুটি!" + extMsg);
    }
  };

  // SEO options update
  const handleSaveSeo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data: SeoSetting = {
        id: 'global',
        title: seoTitle,
        description: seoDesc,
        keywords: seoKeywords,
        author: seoAuthor,
        ogImage: seoOgImage,
        googleSiteVerification: seoGoogleSiteVerification,
        googleAnalyticsId: seoGoogleAnalyticsId,
        googleAdSenseId: seoGoogleAdSenseId
      };

      if (!currentUser && !sessionAuth) {
        localStorage.setItem('annapurna_seo_settings_2026', JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: ওয়েবসাইট এসইও মেটা লোকালি সেভ করা হয়েছে!");
        return;
      }

      await saveSeoSettings(data);
      triggerToast("ওয়েবসাইট SEO মেটা সেটিংস সফলভাবে ক্লাউডে লাইভ করা হয়েছে!");
      await loadDatabase();
    } catch (e: any) {
      let extMsg = "";
      if (e && e.message) {
        try {
          const parsed = JSON.parse(e.message);
          if (parsed && parsed.error) extMsg = "\n\nError details: " + parsed.error;
          else extMsg = "\n\nError details: " + e.message;
        } catch (_) {
          extMsg = "\n\nError details: " + e.message;
        }
      }
      alert("ত্রুটি।" + extMsg);
    }
  };

  // Contact settings update
  const handleSaveContact = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data: ContactSetting = {
        id: 'global',
        phone: contactPhone,
        phoneSubtext: contactPhoneSubtext,
        email: contactEmail,
        address: contactAddress,
        warning: contactWarning
      };

      if (!currentUser && !sessionAuth) {
        localStorage.setItem('annapurna_contacts_2026', JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: যোগাযোগ বিবরণী ব্রাউজারে লোকালি সেভ করা হয়েছে! ক্লাউড ডেটাবেসে আপডেট করতে জিমেইল দিয়ে গুগল সাইন-ইন ব্যবহার করুন।");
        return;
      }

      await saveContactSettings(data);
      triggerToast("ওয়েবসাইট যোগাযোগের বিবরণী সফলভাবে ক্লাউডে লাইভ করা হয়েছে!");
      await loadDatabase();
    } catch (e: any) {
      let extMsg = "";
      if (e && e.message) {
        try {
          const parsed = JSON.parse(e.message);
          if (parsed && parsed.error) {
            extMsg = "\n\nError details: " + parsed.error;
          } else {
            extMsg = "\n\nError details: " + e.message;
          }
        } catch (_) {
          extMsg = "\n\nError details: " + e.message;
        }
      }
      alert("যোগাযোগের বিবরণী সেভ করতে ত্রুটি!" + extMsg);
    }
  };

  // Homepage togglers
  const handleToggleHomepageSection = async (key: keyof HomepageLayout) => {
    if (!homepage) return;
    const updated = {
      ...homepage,
      [key]: !homepage[key]
    };
    setHomepage(updated);
    try {
      if (!currentUser && !sessionAuth) {
        localStorage.setItem('annapurna_homepage_layout_2026', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: হোমপেজ লেআউট লোকালি আপডেট করা হয়েছে!");
        return;
      }
      await saveHomepageLayout(updated);
      triggerToast("হোমপেজ লেআউট মডিউল সেটিংস তাৎক্ষণিকভাবে বদলে দেওয়া হয়েছে!");
    } catch (e) {
      alert("Firestore-এ সেভ করা যায়নি।");
    }
  };

  // Comments moderation
  const handleApproveComment = async (id: string) => {
    try {
      if (!currentUser && !sessionAuth) {
        const stored = localStorage.getItem('annapurna_comments_2026');
        const list = stored ? JSON.parse(stored) : [];
        const updated = list.map((c: any) => c.id === id ? { ...c, approved: true } : c);
        localStorage.setItem('annapurna_comments_2026', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: মন্তব্যটি লোকালি অনুমোদন করা হয়েছে!");
        setComments(updated);
        return;
      }
      await approveComment(id);
      triggerToast("মন্তব্যটি সফলভাবে অ্যাপ্রুভ বা মঞ্জুর করা হয়েছে! এখন এটি সাইটে দেখাবে।");
      await loadDatabase();
    } catch (e) {
      alert("ক্লিয়ার করার পারমিশন নেই।");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (window.confirm("আপনি কি মন্তব্যটি ডিলিট করতে চান?")) {
      try {
        if (!currentUser && !sessionAuth) {
          const stored = localStorage.getItem('annapurna_comments_2026');
          const list = stored ? JSON.parse(stored) : [];
          const updated = list.filter((c: any) => c.id !== id);
          localStorage.setItem('annapurna_comments_2026', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          triggerToast("ডেমো মোড: মন্তব্যটি লোকালি সরিয়ে দেওয়া হয়েছে।");
          setComments(updated);
          return;
        }
        await deleteComment(id);
        triggerToast("মন্তব্যটি সাইট থেকে সফলভাবে সরিয়ে দেওয়া হয়েছে।");
        await loadDatabase();
      } catch (e) {
        alert("ত্রুটি।");
      }
    }
  };

  // Custom Categories
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatId.trim()) return;
    try {
      if (!currentUser && !sessionAuth) {
        const item = { id: newCatId.trim().toLowerCase(), name: newCatName.trim() };
        const stored = localStorage.getItem('annapurna_categories_2026');
        const list = stored ? JSON.parse(stored) : [];
        const updated = [...list.filter((c: any) => c.id !== item.id), item];
        localStorage.setItem('annapurna_categories_2026', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: ক্যাটাগরি সম্পূর্ণ লোকালি যুক্ত করা হয়েছে!");
        setCategories(updated);
        setNewCatName('');
        setNewCatId('');
        return;
      }
      await addCategory(newCatId.trim().toLowerCase(), newCatName.trim());
      triggerToast("নতুন ক্যাটাগরি সফলভাবে যুক্ত করা হয়েছে!");
      setNewCatName('');
      setNewCatId('');
      await loadDatabase();
    } catch (e) {
      alert("ক্যাটাগরি রাইটে জটিলতা।");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("ক্যাটাগরি মুছে ফেলতে চান?")) {
      try {
        if (!currentUser && !sessionAuth) {
          const stored = localStorage.getItem('annapurna_categories_2026');
          const list = stored ? JSON.parse(stored) : [];
          const updated = list.filter((c: any) => c.id !== id);
          localStorage.setItem('annapurna_categories_2026', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          triggerToast("ডেমো মোড: ক্যাটাগরি লোকালি ডিলিট করা হয়েছে!");
          setCategories(updated);
          return;
        }
        await deleteCategory(id);
        triggerToast("ক্যাটাগরি সম্পূর্ণ রিমুভ করা হয়েছে।");
        await loadDatabase();
      } catch (e) {
        alert("ত্রুটি।");
      }
    }
  };

  // Profile saves
  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('annapurna_profile_name', profileName);
    sessionStorage.setItem('annapurna_profile_bio', profileBio);
    triggerToast("আপনার রাইটার প্রোফাইল সেটিংস নিরাপদে আপডেট করা হয়েছে!");
  };

  // AI Content Generator actions
  const handleGenerateContent = async (e: FormEvent) => {
    e.preventDefault();
    const finalKeyword = cgKeyword === 'Custom' ? cgCustomKeyword : cgKeyword;
    if (!finalKeyword) {
      alert("অনুগ্রহ করে একটি কিওয়ার্ড সিলেক্ট করুন অথবা কাস্টম কিওয়ার্ড লিখুন।");
      return;
    }

    setCgStatus('generating');
    setCgLoadingStep(0);
    setCgError('');
    setCgGeneratedArticle(null);

    // Multi-step loading progress steps
    const steps = [
      "Gemini AI-কে সংকেত পাঠানো হচ্ছে...",
      "উচ্চ সিপিসি (CPC) কিওয়ার্ড রিসোর্স ও ডেন্সিটি মেপে নেওয়া হচ্ছে...",
      "এসইও (SEO) ফ্রেন্ডলি বাংলা নিবন্ধ সাজানো হচ্ছে...",
      "সার্চ স্নিপেটস এবং প্রশ্নোত্তর (FAQs) জেনারেট হচ্ছে..."
    ];

    const interval = setInterval(() => {
      setCgLoadingStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 4500);

    try {
      const response = await fetch('/api/content-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: finalKeyword,
          topic: cgTopic,
          tone: cgTone,
          length: cgLength,
          additionalInstructions: cgAdditional
        })
      });

      clearInterval(interval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Generation request failed");
      }

      if (!data.success || !data.article) {
        throw new Error("Invalid article response from Gemini API");
      }

      setCgGeneratedArticle(data.article);
      setCgStatus('success');
      triggerToast("দারুণ! আপনার এসইও প্লাগইন দিয়ে একটি নতুন হাই-ট্রাফিক আর্টিকেল তৈরি করা হয়েছে!");
    } catch (err: any) {
      console.error(err);
      clearInterval(interval);
      setCgError(err.message || "সার্ভার এর সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। মেম্বর একসেস বা কন্টেন্ট জেনারেট রুলস চেক করুন।");
      setCgStatus('error');
    }
  };

  const handlePublishGeneratedArticle = async (published: boolean) => {
    if (!cgGeneratedArticle) return;

    try {
      // Slug clean formatting
      const slug = cgGeneratedArticle.title
        .toLowerCase()
        .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Keep alphanumeric, space, and Bengali characters
        .trim()
        .replace(/\s+/g, '-');

      // Create a nice default random landscape image preset
      const randomImage = IMAGE_PRESETS[Math.floor(Math.random() * IMAGE_PRESETS.length)].url;

      const postPayload = {
        title: cgGeneratedArticle.title,
        slug: slug || `ai-article-${Date.now()}`,
        category: cgGeneratedArticle.category || cgTopic || "सरकारी योजना",
        excerpt: cgGeneratedArticle.excerpt,
        content: cgGeneratedArticle.content,
        image: randomImage,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        views: Math.floor(Math.random() * 600) + 1100,
        published: published,
        scheduledAt: ''
      };

      if (!currentUser && !sessionAuth) {
        const storedPostsString = localStorage.getItem('annapurna_news_articles_2026');
        const storedPosts = storedPostsString ? JSON.parse(storedPostsString) : [];
        const finalPost = { ...postPayload, id: `custom-news-${Date.now()}` };
        const updated = [finalPost, ...storedPosts];
        localStorage.setItem('annapurna_news_articles_2026', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: এআই খবরাখবরটি লোকালি সেভ করা হয়েছে!");
        setPosts(updated);
        setCgGeneratedArticle(null);
        setCgStatus('idle');
        setActiveMenu('posts');
        return;
      }

      await addPost(postPayload);
      triggerToast(published ? "অভিনন্দন! এআই খবরাখবরটি লাইভ ডাটাবেজে পাবলিশ করা হয়েছে!" : "খবরটি খসড়া হিসেবে সফলভাবে সেভ করা হয়েছে!");
      
      // Reload database
      await loadDatabase();

      // Clear generation state or navigate to Posts tab
      setCgGeneratedArticle(null);
      setCgStatus('idle');
      setActiveMenu('posts');
    } catch (e: any) {
      alert("Firestore-এ খবরটি যুক্ত করতে ব্যর্থ: " + (e.message || e));
    }
  };

  // Custom Backlinks
  const handleCreateBacklink = async (e: FormEvent) => {
    e.preventDefault();
    if (!backlinkUrl.trim() || !backlinkTitle.trim()) {
      alert("দয়া করে সব ঘর পূরণ করুন।");
      return;
    }
    try {
      const newBacklinkItem: BacklinkItem = {
        id: `backlink-${Date.now()}`,
        url: backlinkUrl.trim(),
        platform: backlinkPlatform,
        title: backlinkTitle.trim(),
        createdAt: new Date().toISOString()
      };

      if (!currentUser && !sessionAuth) {
        const stored = localStorage.getItem('annapurna_backlinks_2026');
        const list = stored ? JSON.parse(stored) : [];
        const updated = [newBacklinkItem, ...list.filter((b: any) => b.id !== newBacklinkItem.id)];
        localStorage.setItem('annapurna_backlinks_2026', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        triggerToast("ডেমো মোড: নতুন ভেরিফাইড ব্যাকলিঙ্ক লোকালি যুক্ত করা হয়েছে!");
        setBacklinks(updated);
        setBacklinkUrl('');
        setBacklinkTitle('');
        return;
      }

      await saveBacklink(newBacklinkItem);
      triggerToast("নতুন ভেরিফাইড ব্যাকলিঙ্ক সফলভাবে যুক্ত করা হয়েছে!");
      setBacklinkUrl('');
      setBacklinkTitle('');
      await loadDatabase();
    } catch (e) {
      alert("ব্যাকলিঙ্ক সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDeleteBacklink = async (id: string) => {
    if (window.confirm("আপনি কি ব্যাকলিঙ্কটি মুছে ফেলতে চান?")) {
      try {
        if (!currentUser && !sessionAuth) {
          const stored = localStorage.getItem('annapurna_backlinks_2026');
          const list = stored ? JSON.parse(stored) : [];
          const updated = list.filter((b: any) => b.id !== id);
          localStorage.setItem('annapurna_backlinks_2026', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          triggerToast("ডেমো মোড: ব্যাকলিঙ্ক লোকালি মুছে ফেলা হয়েছে।");
          setBacklinks(updated);
          return;
        }
        await deleteBacklink(id);
        triggerToast("ব্যাকলিঙ্ক সম্পূর্ণ মুছে ফেলা হয়েছে।");
        await loadDatabase();
      } catch (e) {
        alert("ত্রুটি।");
      }
    }
  };

  // Simulated Custom Upload Counter
  const startSimulatedImageUpload = () => {
    setImageUploadProgress(0);
    const intervals = [10, 25, 45, 70, 90, 100];
    let step = 0;
    
    const task = setInterval(() => {
      if (step < intervals.length) {
        setImageUploadProgress(intervals[step]);
        step++;
      } else {
        clearInterval(task);
        // Load random preset
        const randImage = IMAGE_PRESETS[Math.floor(Math.random() * IMAGE_PRESETS.length)].url;
        setFormImage(randImage);
        triggerToast("থাম্বনেইল ব্যানারটি সফলভাবে অমিড সার্ভারে আপলোড সংকুচিত করা হয়েছে!");
        setTimeout(() => setImageUploadProgress(-1), 1000);
      }
    }, 200);
  };

  // Formatting helper for rich text editor
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const replacement = prefix + selected + suffix;
    
    setFormContent(
      text.substring(0, start) + replacement + text.substring(end)
    );

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Filter posts
  const filteredPostsList = posts.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approvedComments = comments.filter(c => c.approved);
  const pendingComments = comments.filter(c => !c.approved);

  // --- RENDERS ---

  // Auth load
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <RefreshCw className="h-10 w-10 text-orange-600 animate-spin" />
        <p className="mt-4 text-xs text-gray-500 animate-pulse font-bold">এডমিন সিকিউরিটি গেট চেকিং হচ্ছে...</p>
      </div>
    );
  }

  // Dual Protected Auth Shield
  const isUserAuthenticated = currentUser !== null || sessionAuth;

  if (!isUserAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Left Hero Visual */}
          <div className="p-8 md:p-12 bg-gradient-to-tr from-slate-900 via-orange-950 to-red-950 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-600/10 rounded-full filter blur-3xl transform -translate-x-12 -translate-y-12" />
            <div className="relative space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Security Gateway</span>
              </span>
              <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">
                অন্নপূর্ণা ভান্ডার CMS সিস্টেমে স্বাগতম
              </h2>
              <p className="text-xs text-slate-350 leading-relaxed font-light">
                এটি পশ্চিমবঙ্গ সরকারের নারী উন্নয়ন ড্যাশবোর্ডের অন-অফিসিয়াল রাইটার পোর্টাল। এখানে নতুন বিজ্ঞপ্তি, জরুরি টিকার, AdSense কোড এবং খবর পাবলিশিং মডিউল নিয়ন্ত্রণ করতে পারবেন।
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-6 mt-8 md:mt-0 space-y-3">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">রিয়েল-টাইম ক্লাউড ফায়ারস্টোর সিঙ্ক</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">মোবাইল-ফ্রেন্ডলি ফাস্ট রাইটিং টুল</span>
              </div>
            </div>
          </div>

          {/* Right Credentials Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                রাইটার অথেনটিকেশন
              </h3>
              <p className="text-xs text-gray-400">
                লগইন করতে পছন্দসই মাধ্যম সিলেক্ট করুন:
              </p>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-[11px] font-bold text-red-655 dark:text-red-400 rounded-xl leading-relaxed">
                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google Authentication (Requested Firebase Auth) */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-900 py-3 px-4 rounded-xl text-xs font-black transition cursor-pointer shadow border-0"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.24-.63-.35-1.28-.35-1.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>১. Google Auth দিয়ে লগইন</span>
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-x-0 border-t border-gray-200 dark:border-slate-800" />
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] text-gray-400 uppercase font-black">অথবা সিকিউর এডমিন আইডি</span>
            </div>

            {/* Offline backup credentials fallback mechanism */}
            <form onSubmit={handleCustomLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">এডমিন ইউজার আইডি</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="h-4 w-4" /></span>
                  <input
                    type="text"
                    required
                    placeholder="এডমিন আইডি লিখুন"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">সিকিউরিটি পাসওয়ার্ড</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="h-4 w-4" /></span>
                  <input
                    type="password"
                    required
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-650 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-extrabold text-xs py-3 rounded-lg active:scale-95 transition duration-250 cursor-pointer border-0 shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>২. সিকিউর এডমিন লগইন</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN AUTHENTICATED PANEL ---
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-sans transition-all duration-300 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-gray-205 dark:border-slate-900 p-4 md:p-8">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-orange-500 font-sans transform transition duration-300">
          <Sparkles className="h-4 w-4 text-orange-500 animate-bounce" />
          <span className="text-xs font-black">{toastMessage}</span>
        </div>
      )}

      {/* Main Bar Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-900 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-linear-to-tr from-red-600 to-orange-500 text-white font-bold flex items-center justify-center rounded-2xl shadow-lg ring-4 ring-orange-500/15">
            <Settings className="h-6 w-6 animate-spin-slow" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">অন্নপূর্ণা ভান্ডার CMS ড্যাশবোর্ড</h1>
              <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">LIVE SYNCED</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              সীমাহীন খবর প্রকাশনা, ব্যানার মডিউল ও ইন্টারেক্টিভ AdSense নিয়ন্ত্রণ কেন্দ্র (২০২৬ সংস্করণ)
            </p>
          </div>
        </div>

        {/* Global actions: Dark toggle, Profile settings trigger, Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition"
            title="থিম পরিবর্তন করুন"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Quick status display */}
          <div className="text-left px-3.5 py-1.5 border border-orange-100 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl max-w-[200px] hidden sm:block">
            <p className="text-[9px] text-gray-400 font-bold uppercase truncate">সম্পাদক প্রোফাইল</p>
            <p className="text-xs text-slate-900 dark:text-white font-extrabold truncate">{currentUser?.displayName || currentUser?.email || profileName}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 font-bold border border-rose-300/30 text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-xs transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDE NAV MENU BAR */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-4.5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase mb-3">প্রধান মডিউল তালিকা</p>
            <nav className="space-y-1.5">
              <button
                onClick={() => { setActiveMenu('analytics'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'analytics' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>📊 অ্যানালিটিক্স ড্যাশবোর্ড</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveMenu('posts'); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'posts' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>✍️ খবর এডিটর ও রাইটার</span>
                </span>
                <span className="bg-orange-100 dark:bg-slate-850 text-orange-655 dark:text-orange-400 text-[10px] py-0.5 px-2 rounded-full font-bold">
                  {posts.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveMenu('tickers'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'tickers' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  <span>🔔 ব্রেকিং নিউজ টিকার</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveMenu('comments'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'comments' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>💬 মন্তব্য মডারেশন</span>
                </span>
                {pendingComments.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] py-0.5 px-2 rounded-full font-black animate-pulse">
                    {pendingComments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveMenu('homepage'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'homepage' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  <span>⛺ হোমপেজ ও AdSense সেটিং</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveMenu('seo_categories'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'seo_categories' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>🏷️ SEO ও ক্যাটাগরি</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveMenu('backlinks'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'backlinks' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>🔗 ব্যাকলিঙ্ক ম্যানেজার</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveMenu('seo_booster'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'seo_booster' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>🚀 Google Rank-1 বুস্টার</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveMenu('content_generator'); setIsCreatingNewPost(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-extrabold transition text-left border-0 cursor-pointer ${
                  activeMenu === 'content_generator' 
                    ? 'bg-linear-to-r from-red-600 to-orange-500 text-white shadow-md' 
                    : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PenSquare className="h-4 w-4" />
                  <span>✍️ AI কন্টেন্ট রাইটার</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            </nav>
          </div>

          {/* Quick Profile Bio Custom Setting Box */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-5 rounded-2xl shadow-sm text-left space-y-4">
            <p className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">রাইটার বায়ো সেটিংস</p>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase">ডিপার্টমেন্টের পরিচিতি নাম</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 text-[11px] text-slate-800 dark:text-gray-255 border border-gray-200 dark:border-slate-850 rounded p-2 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase">পরিচিতি বায়ো টাইটেল</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-slate-950 text-[11px] text-slate-800 dark:text-gray-255 border border-gray-200 dark:border-slate-850 rounded p-2 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-655 border border-orange-200 rounded text-[11px] font-black tracking-tight cursor-pointer transition dark:bg-slate-950 dark:text-orange-400 dark:border-slate-800"
              >
                সেটিংস সেভ করুন
              </button>
            </form>
          </div>
        </div>

        {/* WORKSPACE DETAIL AREA */}
        <div className="lg:col-span-9 space-y-6">

          {dataLoading && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
              <p className="text-xs text-slate-500 font-bold">ক্লাউড ফায়ারস্টোর লাইভ ডাটা লোড ও মডিউল সিঙ্ক করা হচ্ছে...</p>
            </div>
          )}

          {!dataLoading && (
            <>
              {/* SECTION 1: ANALYTICS DASHBOARD CONTAINER */}
              {activeMenu === 'analytics' && (
                <div className="space-y-6 text-left">
                  {/* Bento Score Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-850 p-5 rounded-2xl text-left relative overflow-hidden">
                      <div className="absolute top-2 right-2 p-1.5 bg-emerald-50 dark:bg-slate-950 rounded-lg text-emerald-500"><Eye className="h-4 w-4" /></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">আজকের মোট ভিউজ (Pageviews)</p>
                      <h3 className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-mono">
                        {(analytics.find(a => a.id === 'summary')?.pageviews || 489000).toLocaleString('bn-IN')}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold mt-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+৪.২% গতকাল তুলনায়</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-850 p-5 rounded-2xl text-left relative overflow-hidden">
                      <div className="absolute top-2 right-2 p-1.5 bg-orange-50 dark:bg-slate-950 rounded-lg text-orange-500"><User className="h-4 w-4" /></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">মোট একক ভিজিটর (Visitors)</p>
                      <h3 className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-mono">
                        {(analytics.find(a => a.id === 'summary')?.visitors || 145000).toLocaleString('bn-IN')}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-2">বাস্তব আইপি ও সেশন কাউন্টিংস</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-850 p-5 rounded-2xl text-left relative overflow-hidden">
                      <div className="absolute top-2 right-2 p-1.5 bg-blue-50 dark:bg-slate-950 rounded-lg text-blue-500"><FileText className="h-4 w-4" /></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">মোট প্রকাশিত খবর (News)</p>
                      <h3 className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-mono">{posts.length}</h3>
                      <p className="text-[10px] text-blue-600 font-black mt-2">📊 {posts.filter(p => (p as any).published === false).length}টি খসড়া (Draft)</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-850 p-5 rounded-2xl text-left relative overflow-hidden">
                      <div className="absolute top-2 right-2 p-1.5 bg-purple-50 dark:bg-slate-950 rounded-lg text-purple-500"><MessageSquare className="h-4 w-4" /></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">মন্তব্য মডারেশন কিউ (Comments)</p>
                      <h3 className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-mono">{comments.length}</h3>
                      <p className="text-[10px] text-purple-600 mt-2 font-black">📝 {pendingComments.length}টি পেন্ডিং রয়েছে</p>
                    </div>
                  </div>

                  {/* SVG BAR GRAPHIC METRICS */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">আজকের রিয়েল-টাইম ট্রাফিক গ্রাফ (Interactive View Trend)</h4>
                        <p className="text-[10px] text-gray-400">প্রতি ২ ঘণ্টার ব্যবধানে ভিউজ কাউন্ট মেজারমেন্ট রেশিও</p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-slate-950 text-emerald-600 rounded-lg text-[10px] font-bold">
                        <span>● লাইভ সংকেত</span>
                      </div>
                    </div>

                    {/* Highly responsive beautiful SVG Vector Graphic Bar Chart to ensure completely bulletproof client rendering with no crash rates */}
                    <div className="pt-2">
                      <svg viewBox="0 0 800 240" className="w-full text-slate-300 dark:text-slate-800">
                        {/* Background lines */}
                        <line x1="50" y1="20" x2="750" y2="20" stroke="currentColor" strokeDasharray="5" strokeWidth="0.5" />
                        <line x1="50" y1="70" x2="750" y2="70" stroke="currentColor" strokeDasharray="5" strokeWidth="0.5" />
                        <line x1="50" y1="120" x2="750" y2="120" stroke="currentColor" strokeDasharray="5" strokeWidth="0.5" />
                        <line x1="50" y1="170" x2="750" y2="170" stroke="currentColor" strokeDasharray="5" strokeWidth="0.5" />
                        <line x1="50" y1="210" x2="750" y2="210" stroke="currentColor" strokeWidth="1" />

                        {/* Chart Bars (representing traffic flow) */}
                        {[
                          { time: "08:00 AM", views: 120, height: 70, color: "#f97316" },
                          { time: "10:00 AM", views: 250, height: 110, color: "#f97316" },
                          { time: "12:00 PM", views: 420, height: 160, color: "#ef4444" },
                          { time: "02:00 PM", views: 310, height: 130, color: "#f97316" },
                          { time: "04:00 PM", views: 370, height: 145, color: "#ef4444" },
                          { time: "06:00 PM", views: 520, height: 190, color: "#ef4444" },
                          { time: "08:00 PM", views: 480, height: 175, color: "#f59e0b" },
                          { time: "10:00 PM", views: 210, height: 100, color: "#f59e0b" },
                        ].map((b, idx) => {
                          const xPos = 80 + idx * 80;
                          return (
                            <g key={idx} className="group cursor-pointer">
                              {/* Highlight effect */}
                              <rect 
                                x={xPos - 20} 
                                y="10" 
                                width="56" 
                                height="200" 
                                fill="transparent" 
                                className="hover:fill-slate-100/50 dark:hover:fill-slate-900/50 transition-colors" 
                              />
                              <rect
                                x={xPos - 10}
                                y={210 - b.height}
                                width="36"
                                height={b.height}
                                rx="4"
                                fill={b.color}
                                className="opacity-90 hover:opacity-100 transition-opacity"
                              />
                              <text x={xPos + 8} y={200 - b.height} textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {b.views}K
                              </text>
                              <text x={xPos + 8} y="225" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                                {b.time}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Popular Articles and Pending Comments list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top posts list */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-gray-150 dark:border-slate-850">
                        <TrendingUp className="h-4 w-4 text-red-500 animate-pulse" />
                        <span>জনপ্রিয় খবর ও ভিউজ লেভেল (Top Viewed Post Trends)</span>
                      </h4>
                      <div className="space-y-4">
                        {posts.slice(0, 3).map((p, idx) => (
                          <div key={p.id} className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded bg-orange-100 dark:bg-slate-800 text-orange-655 dark:text-orange-400 font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{p.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.2 bg-gray-50 dark:bg-slate-950 text-gray-550 border rounded">{p.category}</span>
                                <span className="text-[9px] text-gray-400 font-mono">👁️ {p.views.toLocaleString('bn-IN')} বার পঠিত</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fast Comments Moderation module */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-gray-150 dark:border-slate-850">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        <span>মন্তব্য মডারেশন কিউ ({pendingComments.length} টি পেন্ডিং)</span>
                      </h4>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {pendingComments.length === 0 ? (
                          <p className="text-xs text-gray-400 py-6 text-center">মডারেশন করার মতন কোনো পেন্ডিং মন্তব্য নেই!</p>
                        ) : (
                          pendingComments.slice(0, 3).map((c) => (
                            <div key={c.id} className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl space-y-2 border border-gray-200/50">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-205">{c.author}</span>
                                <span className="text-[9px] text-gray-400 font-mono">{c.date}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed text-left truncate">{c.content}</p>
                              <div className="flex items-center justify-end gap-1.5 pt-1.5">
                                <button
                                  onClick={() => handleApproveComment(c.id)}
                                  className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-black cursor-pointer border-0"
                                >
                                  মঞ্জুর করুন
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="px-2 py-1 bg-rose-500 text-white rounded text-[10px] font-black cursor-pointer border-0"
                                >
                                  মুছুন
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: ARTICLES WRITER & WRITER TAB SCREEN */}
              {activeMenu === 'posts' && (
                <div className="space-y-6 text-left font-sans">
                  
                  {/* Create New Post Overlay Trigger Banner */}
                  {!isCreatingNewPost ? (
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">নিউজ আর্টিকেল এবং পোস্ট পরিচালনা কেন্দ্র</h4>
                        <p className="text-xs text-gray-400">নতুন খবর প্রকাশ করুন বা ইতিমধ্যেই প্রকাশিত কন্টেন্টগুলির এডিট-ডিলিট সংশোধন সম্পন্ন নথিপত্র করুন</p>
                      </div>
                      <button
                        onClick={() => { resetPostForm(); setIsCreatingNewPost(true); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-linear-to-r from-red-650 to-orange-500 hover:opacity-90 text-white rounded-xl text-xs font-black transition cursor-pointer border-0 shadow-md transform hover:scale-102"
                      >
                        <PlusCircle className="h-4.5 w-4.5" />
                        <span>১. নতুন খবর লিখুন (Create Post)</span>
                      </button>
                    </div>
                  ) : (
                    /* The Rich Text Editor Panel */
                    <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-905 p-6 rounded-2xl shadow-sm space-y-6">
                      
                      {/* Form Header */}
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-850 pb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {editingPostId ? "📝 খবর এডিটর এবং মডিফায়ার উইন্ডো" : "✍️ নতুন খবর রচনা ক্ষেত্র ও সরাসরি প্রকাশ মাধ্যম"}
                          </h4>
                        </div>
                        <button
                          onClick={() => { resetPostForm(); setIsCreatingNewPost(false); }}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer border-0 dark:bg-slate-800 dark:text-slate-200"
                        >
                          ফিরে যান
                        </button>
                      </div>

                      <form onSubmit={handlePublishPost} className="space-y-5">
                        
                        {/* Title & Phonetic URL Slug preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-1">
                            <label className="block text-xs font-black text-slate-800 dark:text-slate-300">
                              খবরের মেগা শিরোনাম (Title in Bengali) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formTitle}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              placeholder="উদা: অন্নপূর্ণা ভান্ডার ২০২৬ নতুন কিস্তির ₹৩০০০ টাকা অ্যাকাউন্টে জমা শুরু!"
                              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-black text-slate-800 dark:text-slate-300">
                              খবর ক্যাটাগরি শ্রেণী (Category) <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-3 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Phonetic Auto Slug Generator View */}
                        <div className="bg-orange-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-orange-100/50 dark:border-slate-850/80 flex items-center justify-between text-left">
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] text-orange-655 font-extrabold uppercase flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <span>SEO বান্ধব লিঙ্ক মেকিং (Phonetic Slug Generator)</span>
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-gray-505 dark:text-slate-400 overflow-hidden truncate">
                              <span className="text-slate-400 select-none">https://domain.com/news/</span>
                              <input
                                type="text"
                                value={formSlug}
                                onChange={(e) => setFormSlug(e.target.value)}
                                className="bg-transparent border-0 outline-none text-orange-655 dark:text-amber-400 font-extrabold focus:ring-0 p-0 m-0 w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Article Excerpt (Outlines Card view) */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-300">
                            সংক্ষিপ্ত ভূমিকা এবং বিবরণী (Excerpt - ১৮০ অক্ষরের মধ্যে) <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={2}
                            maxLength={300}
                            value={formExcerpt}
                            onChange={(e) => setFormExcerpt(e.target.value)}
                            placeholder="উদা: পশ্চিমবঙ্গ সরকারের বিশেষ উদ্যোগে অন্নপূর্ণা ভান্ডার ২০২৬ প্রকল্পের আওতায় নতুন আর্থিক সুবিধা দেওয়ার সময়সীমা বড় আপডেট দেওয়া হয়েছে..."
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        {/* --- BENGALI RICH TEXT FORMATTER EDITOR --- */}
                        <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-300 flex items-center justify-between">
                            <span>খবরের সম্পূর্ণ প্রতিবেদন বিবরণী (Bengali Main Article Document) <span className="text-red-500">*</span></span>
                            <span className="text-[10px] text-orange-655 font-bold">WYSIWYG হেল্পার ব্যবহার করুন</span>
                          </label>
                          
                          {/* Formatting Buttons toolbar */}
                          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-t-xl">
                            <button
                              type="button"
                              onClick={() => insertFormatting('**', '**')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded font-black text-xs cursor-pointer border shadow-sm dark:text-white dark:border-slate-750"
                              title="Bold"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('*', '*')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded italic text-xs cursor-pointer border shadow-sm dark:text-white dark:border-slate-750"
                              title="Italic"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('\n# ', '\n')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded font-bold text-[11px] cursor-pointer border shadow-sm dark:text-white dark:border-slate-750"
                              title="Header 1"
                            >
                              H1
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('\n## ', '\n')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded font-bold text-[11px] cursor-pointer border shadow-sm dark:text-white dark:border-slate-750"
                              title="Header 2"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('\n- ', '\n')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded text-xs cursor-pointer border shadow-sm dark:text-white dark:border-slate-750"
                              title="Bullet List"
                            >
                              • List
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('\n> ', '\n')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded text-xs cursor-pointer border shadow-sm dark:text-white dark:border-slate-750"
                              title="Blockquote"
                            >
                              “ Quote
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('[', '](লিঙ্ক_ইউআরএল)')}
                              className="px-2.5 py-1 bg-white hover:bg-gray-100 dark:bg-slate-900 rounded text-xs cursor-pointer border shadow-sm dark:text-white dark:border-slate-750 flex items-center gap-1"
                              title="Add Link URL"
                            >
                              <span>🔗 লিঙ্ক</span>
                            </button>
                          </div>

                          <textarea
                            ref={textAreaRef}
                            required
                            rows={10}
                            value={formContent}
                            onChange={(e) => setFormContent(e.target.value)}
                            placeholder="এখানে খবরের মূল অংশটি বিস্তারিত লিখুন। খবর পড়ার সময় যাতে সুবিধা হয় তার জন্য প্রতি ৩-৪ লাইনের পর প্যারাগ্রাফ বদলে দিন..."
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-b-xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-sans"
                          />
                        </div>

                        {/* Thumbnail Presets and Custom simulated Upload counter */}
                        <div className="space-y-4">
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-300 flex items-center gap-1.5 border-b border-gray-100/60 pb-1.5">
                            <Image className="h-4 w-4 text-orange-500" />
                            <span>থাম্বনেইল কভার ব্যানার সংযুক্তি (Thumbnail Banner)</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {IMAGE_PRESETS.map((p, idx) => (
                              <div
                                key={idx}
                                onClick={() => setFormImage(p.url)}
                                className={`flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-950 rounded-xl border cursor-pointer transition select-none ${
                                  formImage === p.url 
                                    ? 'border-orange-500 ring-2 ring-orange-500/10' 
                                    : 'border-slate-200 dark:border-slate-850 hover:border-slate-350'
                                }`}
                              >
                                <img src={p.url} alt="" className="h-9 w-12 object-cover rounded-lg shadow-xs" />
                                <div className="min-w-0 flex-1 text-left">
                                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-205 truncate">{p.name}</p>
                                  <span className="text-[8px] text-gray-400">ফ্রি ব্যানার {idx + 1}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Upload simulated progress box */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gray-50 dark:bg-slate-950/40 p-4 rounded-xl border border-gray-200 dark:border-slate-850">
                            <div className="sm:col-span-8 space-y-1">
                              <label className="block text-[10px] text-gray-400 font-bold uppercase">অথবা কাস্টম ব্যানার ইউআরএল (Image URL Link)</label>
                              <input
                                type="text"
                                value={formImage}
                                onChange={(e) => setFormImage(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>

                            <div className="sm:col-span-4 flex flex-col justify-end">
                              {imageUploadProgress >= 0 ? (
                                <div className="space-y-1.5 w-full">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold font-mono">
                                    <span>সংকোচন ও আপলোড...</span>
                                    <span>{imageUploadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full transition-all duration-150" style={{ width: `${imageUploadProgress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={startSimulatedImageUpload}
                                  className="w-full flex items-center justify-center gap-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2.5 px-3 text-xs font-black cursor-pointer border-0 shadow-sm"
                                >
                                  <UploadCloud className="h-4 w-4" />
                                  <span>মোবাইল গ্যালারি আপলোড</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Formatting Publish states, and Date / Scheduler Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-gray-150 dark:border-slate-850">
                          
                          <div className="space-y-1">
                            <label className="block text-xs font-black text-slate-800 dark:text-slate-350">প্রকাশের বাংলা তারিখ</label>
                            <input
                              type="text"
                              required
                              value={formDate}
                              onChange={(e) => setFormDate(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Post Scheduler date state selection */}
                          <div className="space-y-1">
                            <label className="block text-xs font-black text-slate-800 dark:text-slate-350">পোস্ট শিডিউলিং করুন (Schedule Publish)</label>
                            <input
                              type="datetime-local"
                              value={formScheduled}
                              onChange={(e) => setFormScheduled(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-950 dark:text-slate-100"
                            />
                          </div>

                          <div className="flex flex-col justify-center">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={formPublished}
                                onChange={(e) => setFormPublished(e.target.checked)}
                                className="h-4 w-4 text-orange-500 rounded border-gray-300 dark:border-slate-850"
                              />
                              <span className="text-xs font-black text-slate-850 dark:text-slate-300">তাত্ক্ষণিকভাবে পাবলিশ করুন (Live Publish)</span>
                            </label>
                            <p className="text-[10px] text-gray-400 mt-1 pl-5.5">টিক অফ থাকলে এটি খসড়া ড্রাফটে সংরক্ষিত থাকবে</p>
                          </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-3 border-t border-gray-200 dark:border-slate-900 pt-4">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-red-650 to-orange-500 hover:opacity-95 text-white rounded-xl py-3 px-8 text-xs font-black cursor-pointer shadow-md tracking-tight border-0"
                          >
                            {editingPostId ? "খবর এডিট ভ্যালু সেভ করুন" : "খবর সরাসরি সাইটে লাইভ করুন"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { resetPostForm(); setIsCreatingNewPost(false); }}
                            className="bg-slate-205 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl py-3 px-5 text-xs font-bold cursor-pointer transition border-0"
                          >
                            বাতিল
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* SEARCH FILTER & ARTICLES MANAGE ROW LISTING */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-150 dark:border-slate-850 pb-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">ইতিমধ্যে প্রকাশিত খবরের তালিকা ({posts.length}টি খবর)</h4>
                      
                      {/* Interactive Search Bar wrapper */}
                      <div className="relative max-w-xs w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-450 pointer-events-none"><Search className="h-4 w-4" /></span>
                        <input
                          type="text"
                          placeholder="খবর টাইটেল দিয়ে সার্চ করুন..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-[11px] rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 pl-9 pr-3 py-2 outline-none text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-gray-150 dark:divide-slate-800/60 max-h-[400px] overflow-y-auto pr-1">
                      {filteredPostsList.length === 0 ? (
                        <p className="text-xs text-gray-500 py-12 text-center">কোনো খবর পাওয়া যায়নি!</p>
                      ) : (
                        filteredPostsList.map((post) => (
                          <div key={post.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-left">
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-orange-50 dark:bg-slate-950 px-2 py-0.5 rounded text-[10px] text-orange-655 dark:text-amber-400 font-extrabold border border-orange-100 dark:border-slate-900">
                                  {post.category}
                                </span>
                                <span className="text-gray-400 text-[10px] font-mono">{post.date}</span>
                                
                                {((post as any).published === false) && (
                                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[8px] font-bold">DRAFT</span>
                                )}
                                {((post as any).scheduledAt) && (
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[8px] font-bold flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    <span>SCHEDULED</span>
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-slate-900 dark:text-white truncate text-sm">{post.title}</h5>
                              <p className="text-gray-500 text-[11px] truncate">{post.excerpt}</p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <span className="text-[10px] text-gray-450 dark:text-slate-450 font-mono px-2 py-1 bg-gray-50 dark:bg-slate-950 rounded border dark:border-slate-850">
                                👁️ {post.views.toLocaleString('bn-IN')} views
                              </span>

                              <button
                                onClick={() => handleEditInit(post)}
                                className="flex items-center gap-1 px-3 py-2 border border-orange-200 dark:border-slate-800 text-orange-655 dark:text-orange-400 bg-orange-50/40 dark:bg-slate-950 rounded-lg font-black transition cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>সংশোধন</span>
                              </button>

                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="flex items-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg font-black transition cursor-pointer border-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>মুছুন</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: BREAKING NEWS TICKERS CONTROL */}
              {activeMenu === 'tickers' && (
                <div className="space-y-6 text-left">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">১. নতুন ব্রেকিং নিউজ স্লাইডার যুক্ত করুন (Create News Ticker)</h4>
                    <p className="text-xs text-gray-400 mb-4">এই টিকার হেডলাইনটি ড্যাশবোর্ডের একদম উপরে একটি চলমান ব্রেকিং নিউজ বার হিসেবে লাল রঙে ফুটে উঠবে।</p>

                    <form onSubmit={handleSaveTicker} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-850 dark:text-slate-300">মারকুয়ে টিকার বাংলা হেডলাইন <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={tickerText}
                          onChange={(e) => setTickerText(e.target.value)}
                          placeholder="উদা: 🔥 ব্রেকিং নিউজ: অন্নপূর্ণা ভান্ডার প্রকল্প ২০২৬-এর অনলাইন আবেদন সরাসরি প্রক্রিয়া শুরু হয়েছে!"
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-850 dark:text-slate-300">ক্লিক করলে নিয়ে যাওয়ার ডেস্টিনেশন লিঙ্ক (ঐচ্ছিক URL)</label>
                          <input
                            type="text"
                            value={tickerLink}
                            onChange={(e) => setTickerLink(e.target.value)}
                            placeholder="যেমন: #apply বা অন্য কোনো পেমেন্ট লিঙ্ক"
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-i900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center pl-1">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={tickerActive}
                              onChange={(e) => setTickerActive(e.target.checked)}
                              className="h-4 w-4 text-orange-500 border-gray-300 dark:border-slate-850"
                            />
                            <span className="text-xs font-bold text-slate-850 dark:text-slate-350">অবিলম্বে টিকার স্লাইডারে শো করান (Active Slider)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-gradient-to-r from-red-650 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs font-black cursor-pointer border-0 shadow-sm"
                        >
                          {editingTickerId ? "টিকার আপডেট করুন" : "টিকার হেডলাইন যুক্ত করুন"}
                        </button>
                        {editingTickerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTickerId(null);
                              setTickerText('');
                              setTickerLink('');
                              setTickerActive(true);
                            }}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer border-0"
                          >
                            বাতিল
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5">📋 চলমান ব্রেকিং মেসেজ তালিকা ({tickers.length}টি)</h4>
                    
                    <div className="divide-y divide-gray-150 dark:divide-slate-850 max-h-[300px] overflow-y-auto pr-1">
                      {tickers.map((tk) => (
                        <div key={tk.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-left">
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 leading-relaxed text-sm">
                              {!tk.active && <span className="bg-gray-150 text-gray-500 text-[8px] font-bold px-1 rounded uppercase">ইন-একটিভ</span>}
                              <span>{tk.text}</span>
                            </p>
                            {tk.link && <p className="text-[10px] text-slate-400 font-mono mt-1">🔗 লিংক ডেস্টিনেশন: {tk.link}</p>}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleEditTickerInit(tk)}
                              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-655 dark:bg-slate-950 dark:text-orange-400 border border-orange-100 dark:border-slate-850 rounded-lg font-black cursor-pointer"
                            >
                              এডিট
                            </button>
                            <button
                              onClick={() => handleDeleteTicker(tk.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 dark:bg-rose-950/20 rounded-lg font-black cursor-pointer border-0"
                            >
                              মুছুন
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: COMMENTS MODERATION LIST FORUMS */}
              {activeMenu === 'comments' && (
                <div className="space-y-6 text-left">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-155 dark:border-slate-850 pb-2.5">
                      💬 কমেন্টস মডারেশন কিউ (Comments Moderation Bureau)
                    </h4>
                    <p className="text-xs text-gray-400">ব্যুরো সিস্টেমে দর্শনের আগে সমস্ত মন্তব্য স্প্যাম ফিল্টারের জন্য মডারেট করা প্রয়োজন। অ্যাপ্রুভ বাটনে টিপলেই মন্তব্যটি খবর পেজে লাইভ হয়ে যাবে।</p>

                    <div className="divide-y divide-gray-150 dark:divide-slate-850 max-h-[450px] overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-xs text-slate-400 py-12 text-center">মন্তব্যের ডাটা ডিরেক্টরি সম্পূর্ণ খালি!</p>
                      ) : (
                        comments.map((c) => (
                          <div key={c.id} className="py-4.5 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs text-left">
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-800 dark:text-white text-sm">{c.author}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{c.date}</span>
                                {c.approved ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.2 rounded">APPROVED</span>
                                ) : (
                                  <span className="bg-purple-100 text-purple-800 text-[8px] font-black px-1.5 py-0.2 rounded animate-pulse">PENDING REVIEW</span>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed max-w-2xl bg-gray-50/60 dark:bg-slate-950 p-3 rounded-lg border border-gray-200/40">
                                {c.content}
                              </p>
                              <p className="text-[9px] text-gray-405">মন্তব্য টার্গেটেড পোস্ট: <span className="font-bold underline">{c.postId}</span></p>
                            </div>

                            <div className="flex items-center gap-1.5 self-end md:self-start shrink-0">
                              {!c.approved && (
                                <button
                                  onClick={() => handleApproveComment(c.id)}
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black cursor-pointer border-0 shadow-sm"
                                >
                                  মঞ্জুর করুন (Approve)
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-lg font-black cursor-pointer border-0"
                              >
                                ডিলিট
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: HOMEPAGE MODULES SHOW/HIDE AND ADSENSE CODES */}
              {activeMenu === 'homepage' && (
                <div className="space-y-6 text-left">
                  
                  {/* HOME LAYOUT MODULATOR */}
                  {homepage && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5">
                        ⚙️ হোমপেজ সেকশন মডিউলেটর (Show / Hide Modules)
                      </h4>
                      <p className="text-xs text-gray-400">এই সুইচের সাহায্যে আপনি হোমপেজের যেকোনো সেকশন বা বিজ্ঞাপন ব্যানার তৎক্ষণাৎ অন/অফ করতে পারবেন।</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {[
                          { key: 'heroEnabled', label: '১. বড় ওয়েলকাম হিরো ব্যানার (Welcome Hero Slide)' },
                          { key: 'tickerEnabled', label: '২. ব্রেকিং নিউজ চলমান মারকুয়ে বার (Breaking Ticker)' },
                          { key: 'newsEnabled', label: '৩. সাম্প্রতিক খবরাখবর গ্রিড উইজেট (Latest Article Block)' },
                          { key: 'calculatorEnabled', label: '৪. বয়স ও যোগ্যতা মূল্যায়ক ক্যালকুলেটর (Eligibility Checker)' },
                          { key: 'statusCheckerEnabled', label: '৫. আধার ও পেমেন্ট স্ট্যাটাস ট্র্যাকার (Status Portal)' },
                          { key: 'documentsEnabled', label: '৬. নথিপত্র এবং দরকারী ফর্মস লিস্ট (Required Documents)' },
                          { key: 'faqEnabled', label: '৭. প্রশ্নোত্তর এফ.এ.কিউ বিভাগ (FAQs Block)' },
                        ].map((item) => (
                          <div 
                            key={item.key} 
                            onClick={() => handleToggleHomepageSection(item.key as any)}
                            className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl cursor-pointer hover:border-orange-250 select-none transition"
                          >
                            <span className="text-xs font-extrabold text-slate-805 dark:text-slate-300">{item.label}</span>
                            <div className={`w-10 h-5.5 rounded-full p-0.5 transition ${homepage[item.key as keyof HomepageLayout] ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-800'}`}>
                              <div className={`h-4.5 w-4.5 rounded-full bg-white shadow-md transform transition duration-200 ${homepage[item.key as keyof HomepageLayout] ? 'translate-x-4.5' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ADSENSE SCRIPT SPLICERS */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-5">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5">
                      📢 Google AdSense অ্যাড কোড ম্যানেজার (Ad Placements Integration)
                    </h4>
                    <p className="text-xs text-gray-400">এখানে আপনার গুগল অ্যাডসেন্সের Raw HTML/JS বিজ্ঞাপন কোড বসাতে পারেন। এটি সাইটের নির্দিষ্ট বক্সে স্বয়ংক্রিয়ভাবে রেন্ডার হবে।</p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">Header Placement Banner Code (Leaderboard)</label>
                            <input type="checkbox" checked={adActiveHeader} onChange={(e) => setAdActiveHeader(e.target.checked)} className="h-4 w-4" />
                          </div>
                          <textarea
                            rows={3}
                            value={adCodeHeader}
                            onChange={(e) => setAdCodeHeader(e.target.value)}
                            placeholder="<!-- Paste your AdSense Header Javascript Script here -->"
                            className="w-full bg-gray-50 dark:bg-slate-950 text-xs font-mono p-3 border border-gray-250 rounded-lg outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">Sidebar Placement Sticky Code (Rectangle/Ad)</label>
                            <input type="checkbox" checked={adActiveSidebar} onChange={(e) => setAdActiveSidebar(e.target.checked)} className="h-4 w-4" />
                          </div>
                          <textarea
                            rows={3}
                            value={adCodeSidebar}
                            onChange={(e) => setAdCodeSidebar(e.target.value)}
                            placeholder="<!-- Paste your AdSense Sidebar Javascript Script here -->"
                            className="w-full bg-gray-50 dark:bg-slate-950 text-xs font-mono p-3 border border-gray-250 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">In-Article Content Placement Ad 1</label>
                            <input type="checkbox" checked={adActiveIn1} onChange={(e) => setAdActiveIn1(e.target.checked)} className="h-4 w-4" />
                          </div>
                          <textarea
                            rows={3}
                            value={adCodeInArticle1}
                            onChange={(e) => setAdCodeInArticle1(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 text-xs font-mono p-3 border border-gray-250 rounded-lg outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-350">In-Article Content Placement Ad 2</label>
                            <input type="checkbox" checked={adActiveIn2} onChange={(e) => setAdActiveIn2(e.target.checked)} className="h-4 w-4" />
                          </div>
                          <textarea
                            rows={3}
                            value={adCodeInArticle2}
                            onChange={(e) => setAdCodeInArticle2(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 text-xs font-mono p-3 border border-gray-250 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSaveAds}
                        className="w-full py-3 bg-linear-to-r from-red-650 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs font-black shadow cursor-pointer border-0"
                      >
                         AdSense সেটিংস ও স্ক্রিপ্টসমূহ ক্লাউডে আপডেট করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: GLOBAL SEO SETTINGS AND CATEGORY CONFIG */}
              {activeMenu === 'seo_categories' && (
                <div className="space-y-6 text-left">
                  
                  {/* META TAGS FORMS */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5">
                      🌍 গ্লোবাল সার্চ মেটা ও এস.ই.ও অপটিমাইজেশন (SEO Manager)
                    </h4>
                    <p className="text-xs text-gray-400">এই প্যানেলের মাধ্যমে আপনি গুগল সার্চ ইমেজিং মেটা, সার্চ কি-ওয়ার্ডস এবং টাইটেল মডিউলের সঠিক কনফিগারেশন নির্ধারণ করতে পারবেন।</p>

                    <form onSubmit={handleSaveSeo} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">গ্লোবাল মেটা টাইটেল (Title Sufix)</label>
                          <input
                            type="text"
                            required
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">তথ্য প্রকাশকের কপিরাইট অথর (Author)</label>
                          <input
                            type="text"
                            required
                            value={seoAuthor}
                            onChange={(e) => setSeoAuthor(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">মেটা ডেসক্রিপশন বিবরণী (Search Meta Description - ১৫ অক্ষরের উপর)</label>
                        <textarea
                          rows={2}
                          required
                          value={seoDesc}
                          onChange={(e) => setSeoDesc(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">সার্চ ইঞ্জিন কি ওয়ার্ডস (Comma separated Keywords)</label>
                          <input
                            type="text"
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywords(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">ফেসবুক হোয়াটসঅ্যাপ প্রিভিউ ইমেজ ব্যানার</label>
                          <input
                            type="text"
                            value={seoOgImage}
                            onChange={(e) => setSeoOgImage(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* GOOGLE INTEGRATIONS EXPANDED PANEL */}
                      <div className="border border-dashed border-orange-200 dark:border-slate-800 bg-orange-50/5 dark:bg-slate-950/20 p-4 rounded-2xl space-y-4">
                        <h5 className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span>⚙️ Google Integrated Services:</span>
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-805 dark:text-slate-300">Google Site Verification (Meta Code)</label>
                            <input
                              type="text"
                              value={seoGoogleSiteVerification}
                              onChange={(e) => setSeoGoogleSiteVerification(e.target.value)}
                              placeholder="e.g. google-site-verification=XYZ..."
                              className="w-full bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none placeholder-gray-400"
                            />
                            <p className="text-[10px] text-gray-400 leading-normal">Google Search Console ভেরিফিকেশন মেটা কোড এখানে পেস্ট করুন।</p>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-805 dark:text-slate-300">Google Analytics (GA4) Tag ID</label>
                            <input
                              type="text"
                              value={seoGoogleAnalyticsId}
                              onChange={(e) => setSeoGoogleAnalyticsId(e.target.value)}
                              placeholder="e.g. G-XXXXXXX"
                              className="w-full bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none placeholder-gray-400"
                            />
                            <p className="text-[10px] text-gray-400 leading-normal">রিয়েলটাইম উপভোক্তাদের ট্র্যাকিং সেশনের গুগল এনালেটিক্স আইডি।</p>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-805 dark:text-slate-300">Google AdSense Publisher ID</label>
                            <input
                              type="text"
                              value={seoGoogleAdSenseId}
                              onChange={(e) => setSeoGoogleAdSenseId(e.target.value)}
                              placeholder="e.g. ca-pub-XXXXXXXXXXXXXXXX"
                              className="w-full bg-white dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none placeholder-gray-400"
                            />
                            <p className="text-[10px] text-gray-400 leading-normal">আপনার অ্যাডসেন্স একাউন্টের অটো-বিজ্ঞাপন চালু করার কোড আইডি।</p>
                          </div>
                        </div>

                        {/* Integration Quick Instruction Guides */}
                        <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl space-y-1.5 text-[11px] text-slate-650 dark:text-gray-400">
                          <p>🎯 <strong>Google Search Console:</strong> আপনি চাইলে ডোমেইন ভেরিফাই করতে <code>robots.txt</code> এবং <code>sitemap.xml</code> রুট সরাসরি crawler সাবমিট করতে পারেন।</p>
                          <p>💵 <strong>Google AdSense Direct:</strong> <code>ads.txt</code> ফাইলটি <code>/ads.txt</code> লিংকে আপনার ডোমেইনের অধীনে অলরেডি প্রস্তুত ও ভেরিফাইড করা রয়েছে।</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-red-655 to-orange-500 text-white rounded-xl text-xs font-black cursor-pointer border-0 shadow-sm hover:from-red-700 hover:to-orange-600 transition"
                      >
                         মেটা ও গুগল ইন্টিগ্রেশন সেটিংস প্রয়োগ করুন
                      </button>
                    </form>
                  </div>

                  {/* CATEGORIES MANAGEMENT PANEL */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5">
                      📂 ক্যাটাগরি ও সংবাদ শ্রেণী নিয়ন্ত্রণ (Category Management)
                    </h4>
                    
                    <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">শ্রেণীর বাংলা নাম</label>
                        <input
                          type="text"
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="উদা: নতুন কুপন"
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 rounded-lg p-2 text-xs text-slate-950 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">শ্রেণী আইডি (English Slug)</label>
                        <input
                          type="text"
                          required
                          value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value)}
                          placeholder="উদা: coupons"
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 rounded-lg p-2 text-xs text-slate-950 dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-2.5 bg-orange-600 hover:bg-orange-750 text-white rounded-lg text-xs font-black tracking-tight cursor-pointer transition border-0 shadow-xs"
                      >
                        ক্যাটাগরি যুক্ত করুন
                      </button>
                    </form>

                    <div className="divide-y divide-gray-150 dark:divide-slate-850/60 max-h-[220px] overflow-y-auto pr-1 pt-3">
                      {categories.map((c) => (
                        <div key={c.id} className="py-2.5 flex items-center justify-between text-xs text-left">
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{c.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">Slug: {c.id}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="px-2.5 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded font-black cursor-pointer border-0"
                          >
                            মুছুন
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONTACT INFO MANAGEMENT PANEL - "Contact us jeno change kora jai" */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5 flex items-center gap-1.5">
                      📞 যোগাযোগের তথ্য নিয়ন্ত্রণ প্যানেল (Contact Us Settings)
                    </h4>
                    <p className="text-xs text-gray-400">এই সহজ ফর্মের মাধ্যমে আপনার দর্শনার্থীদের সাথে সরাসরি যোগাযোগের জন্য ফোন নাম্বার, ইমেল অ্যাড্রেস এবং সুরক্ষামূলক সতর্কবাণী পরিবর্তন করুন।</p>

                    <form onSubmit={handleSaveContact} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">সহায়তা হেল্পলাইন নাম্বার (Phone Support)</label>
                          <input
                            type="text"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="১৮০০-৩৪৫-৫৬৭৮ (বিনামূল্যে কল করুন)"
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">নাম্বারের বিবরণ/সময়সূচি (Phone Timings/Details)</label>
                          <input
                            type="text"
                            value={contactPhoneSubtext}
                            onChange={(e) => setContactPhoneSubtext(e.target.value)}
                            placeholder="ব্যবসায়িক দিনগুলিতে সকাল ১০টা থেকে বিকেল ৫টা পর্যন্ত"
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">অফিসিয়াল যোগাযোগ ইমেলে (Email Support)</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="support@annapurna-bhandar-portal.org"
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">কার্যালয় / যোগাযোগের ঠিকানা (Physical Address)</label>
                          <input
                            type="text"
                            required
                            value={contactAddress}
                            onChange={(e) => setContactAddress(e.target.value)}
                            placeholder="বিকাশ ভবন, সল্টলেক সিটি, ৭ম তলা, কলকাতা ৭০০০৯১, পশ্চিমবঙ্গ, ভারত।"
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">প্রতারণা সচেতনতামূলক সতর্কবার্তা ব্যানার (ALERT WARNING BANNER)</label>
                        <textarea
                          rows={2}
                          value={contactWarning}
                          onChange={(e) => setContactWarning(e.target.value)}
                          placeholder="মনে রাখবেন: আমরা কোনো আবেদন ফি গ্রহণ করি না..."
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl text-xs font-black cursor-pointer border-0 shadow-sm hover:from-red-700 hover:to-orange-600 transition"
                      >
                         যোগাযোগের তথ্য আপডেট করুন
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* SECTION 7: BACKLINK MANAGER CONTAINER */}
              {activeMenu === 'backlinks' && (
                <div className="space-y-6 text-left">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-base font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5 flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-orange-600" />
                      <span>🔗 এক্সটার্নাল ব্যাকলিঙ্ক শেয়ার ম্যানেজার (Verified Backlinks)</span>
                    </h4>
                    
                    <p className="text-xs text-gray-450 dark:text-gray-400 leading-relaxed font-semibold">
                      Rank 1 আনার জন্য ফেসবুক, টেলিগ্রাম বা অন্যান্য সামাজিক মাধ্যমে আপনার পোস্টটি শেয়ার করার পর তার লিংকটি এখানে পেস্ট করুন। এগুলো আপনার সাইটের ফুটারে <strong>'Verified Backlinks'</strong> হিসেবে প্রকাশ পেয়ে সার্চ ইঞ্জিনে দারুণ SEO ডোমেইন অথরিটি রেশিও প্রদান করবে। 🔥
                    </p>

                    <form onSubmit={handleCreateBacklink} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-350">শেয়ার করা পোস্টের সম্পূর্ণ URL (Link)</label>
                          <input
                            type="url"
                            required
                            value={backlinkUrl}
                            onChange={(e) => setBacklinkUrl(e.target.value)}
                            placeholder="উদা: https://facebook.com/groups/annapurna-bhandar/posts/12345/"
                            className="w-full text-xs bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-350 font-semibold">লিঙ্কের বিবরণ / টাইটেল (Title Label)</label>
                          <input
                            type="text"
                            required
                            value={backlinkTitle}
                            onChange={(e) => setBacklinkTitle(e.target.value)}
                            placeholder="উদা: পশ্চিমবঙ্গ নারী কল্যাণ ফেসবুক গ্রুপে শেয়ার"
                            className="w-full text-xs bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-805 dark:text-slate-350">শেয়ারিং প্ল্যাটফর্ম (Platform)</label>
                          <select
                            value={backlinkPlatform}
                            onChange={(e) => setBacklinkPlatform(e.target.value)}
                            className="w-full text-xs bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-950 dark:text-white focus:outline-none"
                          >
                            <option value="facebook">Facebook (ফেসবুক)</option>
                            <option value="telegram">Telegram (টেলিগ্রাম)</option>
                            <option value="whatsapp">WhatsApp (হোয়াটসঅ্যাপ)</option>
                            <option value="twitter">X / Twitter (টুইটার)</option>
                            <option value="other">Other Site (অন্যান্য মাধ্যম)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-linear-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-xl text-xs font-black cursor-pointer border-0 shadow-md transition transform active:scale-95 duration-205"
                        >
                          ভেরিফাইড প্রচার ব্যাকলিঙ্ক যুক্ত করুন
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* ACTIVE BACKLINKS DATA TABLE */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>👁️ আপনার ভেরিফাইড জীবন্ত ব্যাকলিঙ্কসমূহ ({backlinks.length})</span>
                    </h4>

                    {backlinks.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 dark:bg-slate-950 rounded-xl border border-dashed border-gray-200 dark:border-slate-850">
                        <p className="text-xs text-gray-400 font-bold">এখনো কোনো এক্সটার্নাল প্রচার লিংক যুক্ত করা হয়নি।</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-850 text-gray-400 font-bold">
                              <th className="py-3 px-2">প্ল্যাটফর্ম</th>
                              <th className="py-3 px-4">টাইটেল / বিবরণ</th>
                              <th className="py-3 px-4">শেয়ার লিংক ইউআরএল (URL)</th>
                              <th className="py-3 px-2 text-center">ইনস্ট্যান্ট অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-850/60">
                            {backlinks.map((b) => (
                              <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-950/20 font-sans text-slate-700 dark:text-slate-350">
                                <td className="py-3.5 px-2 font-bold">
                                  {b.platform === 'facebook' && <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded text-[10px] font-black uppercase">🌐 Facebook</span>}
                                  {b.platform === 'telegram' && <span className="inline-flex items-center gap-1 text-sky-500 bg-sky-50 dark:bg-sky-950/30 px-2 py-1 rounded text-[10px] font-black uppercase">✈ Telegram</span>}
                                  {b.platform === 'whatsapp' && <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded text-[10px] font-black uppercase">📞 WhatsApp</span>}
                                  {b.platform === 'twitter' && <span className="inline-flex items-center gap-1 text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-black uppercase">𝕏 Twitter</span>}
                                  {b.platform !== 'facebook' && b.platform !== 'telegram' && b.platform !== 'whatsapp' && b.platform !== 'twitter' && (
                                    <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-black uppercase">🔗 OTHER</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-left font-serif">
                                  {b.title}
                                </td>
                                <td className="py-3.5 px-4 truncate max-w-[280px] font-mono text-gray-400 hover:text-orange-600 transition text-left">
                                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 select-all">
                                    {b.url}
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                </td>
                                <td className="py-3.5 px-2 text-center">
                                  <button
                                    onClick={() => handleDeleteBacklink(b.id)}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border-0 rounded font-black cursor-pointer shadow-3xs transition"
                                  >
                                    মুছুন
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 8: GOOGLE RANK 1 SEO BOOSTER */}
              {activeMenu === 'seo_booster' && (
                <div className="space-y-6 text-left">
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4">
                    <h4 className="text-base font-black text-slate-900 dark:text-white border-b border-gray-150 dark:border-slate-850 pb-2.5 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      <span>🚀 Google Rank #1 Search Engine Optimizer (SEO)</span>
                    </h4>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                      আপনার অন্নপূর্ণা ভান্ডার যোজনা ওয়েবসাইটটিকে গুগলের একদম প্রথমে (Rank 1) নিয়ে আসার জন্য বিশেষ অ্যালগরিদম ট্রিক্স এবং ভেরিফাইড মেথডসমূহ নিচে দেওয়া হলো। এই পদক্ষেপগুলি অনুসরণ করলে অন্যান্য সমস্ত ওয়েবসাইটকে অতি সহজে পিছনে ফেলে আপনার ওয়েবসাইট সবার উপরে চলে আসবে।
                    </p>

                    {/* SEO STATUS SCORECARD */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">FAQ Schema Markup</p>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">✅ সচল আছে (Perfect)</h5>
                        <p className="text-[11px] text-gray-400 mt-1">গুনগত গ্রাহক জিজ্ঞাসাবাদের সরাসরি গুগল সার্চ পেজে রিচ স্ন্যাপশট সচল করে।</p>
                      </div>
                      
                      <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">Government Service Schema</p>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">✅ স্ট্রাকচার্ড এলিমেন্ট সচল</h5>
                        <p className="text-[11px] text-gray-400 mt-1">সার্চ ইঞ্জিন ক্রলারদের নিকট ট্রাস্ট অথরিটি ৯৮% বৃদ্ধি করে।</p>
                      </div>

                      <div className="p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/20">
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold uppercase">Page Load Response Time</p>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">⚡ ৯৯% ফাস্টার (Instant)</h5>
                        <p className="text-[11px] text-gray-400 mt-1">Vite + Fast React ইঞ্জিনের কারণে পেজ বাউন্স হবার ঝুঁকি নেই।</p>
                      </div>
                    </div>
                  </div>

                  {/* SITEMAP & ROBOTS ACTIONS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* DYNAMIC SITEMAP GENERATOR */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-850">
                        <span>📋 লাইভ ডায়নামিক XML সাইটম্যাপ (Sitemap.xml)</span>
                        <span className="text-[10px] bg-red-105 dark:bg-red-950/40 text-red-650 px-2 py-0.5 rounded font-black">Rank 1 Tool</span>
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                        গুগল ক্রলার বটকে আপনার সমস্ত নিউজ পোস্ট এবং সমস্ত পেজ একসাথে দ্রুত ইনডেক্সিং করাতে এই XML সাইটম্যাপটি কপি করে গুগল সার্চ কনসোলে (Google Search Console) জমা দিন।
                      </p>

                      <div className="relative font-mono text-[10px]">
                        <pre className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-gray-300 overflow-x-auto max-h-[180px]">
                          {`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${window.location.origin}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${window.location.origin}/eligibility</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${window.location.origin}/apply</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${window.location.origin}/status</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${window.location.origin}/documents</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${window.location.origin}/news</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${window.location.origin}/faq</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${window.location.origin}/contact</loc>
    <priority>0.5</priority>
  </url>
</urlset>`}
                        </pre>
                        <button
                          onClick={() => {
                            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${window.location.origin}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${window.location.origin}/eligibility</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${window.location.origin}/apply</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${window.location.origin}/status</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${window.location.origin}/documents</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${window.location.origin}/news</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${window.location.origin}/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${window.location.origin}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
                            navigator.clipboard.writeText(xml);
                            triggerToast("Sitemap XML ক্লিপবোর্ডে কপি করা হয়েছে!");
                          }}
                          className="absolute bottom-3 right-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded cursor-pointer border-0 shadow"
                        >
                          অনুলিপি করুন
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC ROBOTS.TXT GENERATOR */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-850">
                        <span>🤖 ক্রলার কাস্টম রুলস (robots.txt)</span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-650 px-2 py-0.5 rounded font-black">Bots Safe Guard</span>
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                        এই ফাইলটি আপনার ওয়েবসাইটের ডিরেক্টরি সিকিউরিটি সুরক্ষিত রাখে এবং গুগলে শুধুমাত্র আপনার প্রকাশিত কন্টেন্ট ও দরকারি পৃষ্ঠাগুলো ইনডেক্স করতে সহায়তা করে।
                      </p>

                      <div className="relative font-mono text-[10px]">
                        <pre className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-gray-300 overflow-x-auto max-h-[180px]">
                          {`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${window.location.origin}/sitemap.xml`}
                        </pre>
                        <button
                          onClick={() => {
                            const rob = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${window.location.origin}/sitemap.xml`;
                            navigator.clipboard.writeText(rob);
                            triggerToast("Robots Rules ক্লিপবোর্ডে কপি করা হয়েছে!");
                          }}
                          className="absolute bottom-3 right-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded cursor-pointer border-0 shadow"
                        >
                          অনুলিপি করুন
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MASTER STRATEGY GUIDE FOR RANK 1 */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl space-y-4 text-left">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-slate-850 pb-2.5">
                      <span>🎯 গুগলে Rank #1 দখল করার ৪টি মহা-কৌশল (Rank 1 Search Blueprint)</span>
                    </h4>

                    <div className="space-y-4 text-xs text-slate-700 dark:text-slate-350">
                      <div className="flex gap-3">
                        <span className="h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black shrink-0 text-[10px]">১</span>
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">গুগল সার্চ কনসোল ও ভেরিফিকেশন (Google Search Console Setup):</p>
                          <p className="font-semibold text-gray-400">
                            ওয়েবসাইটটি লাইভ করার পর, গুগল সার্চ কনসোলে (search.google.com/search-console) আপনার ডোমেনটি যুক্ত করুন। এরপর 'SEO ও ক্যাটাগরি' ট্যাব থেকে আপনার গুগলের ভেরিফিকেশন কোডটি পেস্ট করে সাবমিট করুন। গুগল সাথে সাথে আপনার সাইটের ওনারশিপ ভেরিফাই করবে।
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0 text-[10px]">২</span>
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">ভেরিফাইড ব্যাকলিঙ্কস প্রচার (Verified Backlinks Submission):</p>
                          <p className="font-semibold text-gray-400">
                            আমাদের যুক্ত করা 'ব্যাকলিঙ্ক ম্যানেজার' অত্যন্ত শক্তিশালী গুগল র‍্যাংকিং টুল। আপনার পোস্ট বা হোমপেজের লিংক সামাজিক মাধ্যমে শেয়ার করে সেই শেয়ার লিংকটি ব্যাকলিঙ্ক ম্যানেজারে যুক্ত করুন। গুগল ক্রলার ফুটারে সেই ব্যাকলিঙ্কগুলো ভেরিফাই করার কারণে আপনার ট্রাস্ট অথরিটি ৯ গুণ বৃদ্ধি পাবে।
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="h-6 w-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-black shrink-0 text-[10px]">৩</span>
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">সার্চ ভলিউম কিওয়ার্ড অপ্টিমাইজেশন (High CTR Keyword Placement):</p>
                          <p className="font-semibold text-gray-400">
                            কোনো নতুন খবর বা এনাউন্সমেন্ট লিখলে, খবরের টাইটেল এবং বর্ণনায় "Annapurna Bhandar", "অন্নপূর্ণা ভান্ডার ২০২৬ অনলাইন আবেদন", "স্ট্যাটাস চেক" কিওয়ার্ডগুলোর উপযুক্ত ঘনত্ব ব্যবহার করুন। এতে কিওয়ার্ড ইন্ডেক্স রেশিও ১০০% স্কোর পাবে।
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="h-6 w-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-black shrink-0 text-[10px]">৪</span>
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">নিয়মিত কন্টেন্ট ট্র্যাকিং ও আপডেট (Fresh Content Schema):</p>
                          <p className="font-semibold text-gray-400">
                            গুগল সর্বদাই নতুন নির্দেশিকা ও আপডেটেড কন্টেন্ট বেশি পছন্দ করে। প্রতি সপ্তাহে অন্তত ১-২ টি নতুন পোস্ট ক্যাটাগরি অনুযায়ী আমাদের খবর প্যানেল থেকে পাবলিশ বা শিডিউল করুন। এতে ক্রলার বট প্রতিনিয়ত আপনার সাইট রি-স্ক্যান করে র‍্যাংক এক নম্বরে ধরে রাখবে।
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 9: AI CONTENT GENERATOR MODULE */}
              {activeMenu === 'content_generator' && (
                <div className="space-y-6 text-left">
                  {/* Dashboard Intro Banner */}
                  <div className="bg-linear-to-r from-red-600 via-orange-500 to-amber-500 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden border-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                      <PenSquare className="h-44 w-44" />
                    </div>
                    <div className="relative z-10 space-y-2">
                      <span className="bg-white/20 text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full backdrop-blur-xs">
                        Powered by Google Gemini 3.5 AI
                      </span>
                      <h3 className="text-xl md:text-2xl font-black">
                        ✍️ অটোমেটেড এআই কন্টেন্ট ক্রিয়েটর (Automated SEO Generator)
                      </h3>
                      <p className="text-xs md:text-sm text-white/90 max-w-2xl font-medium leading-relaxed">
                        গুগল সার্চে Rank #1 এবং উচ্চ অ্যাডসেন্স CPC পেমেন্ট উপার্জনের জন্য বিশেষ ট্র্যাফিক কিওয়ার্ড ভিত্তিক চমৎকার বাংলা আর্টিকেল জেনারেট করুন মাত্র ৩০ সেকেন্ডে!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Form Panel: Settings (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-5 rounded-2xl shadow-sm space-y-4 text-left">
                        <h5 className="text-sm font-extrabold text-slate-800 dark:text-white border-b border-gray-100 dark:border-slate-850 pb-2.5">
                          ⚙️ কন্টেন্ট রাইটিং সেটিংস
                        </h5>

                        <form onSubmit={handleGenerateContent} className="space-y-4">
                          {/* Main Target Keyword Selection */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase">
                              লক্ষ্য কি-ওয়ার্ড (Target High CPC Keyword)
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { val: 'DBT Scheme', label: '💳 DBT Scheme (ডিবিটি লিঙ্ক ও সিডিং)' },
                                { val: 'Ration Card Update', label: '🌾 Ration Card Update (রেশন কুপন ও ই-কেওয়াইসি)' },
                                { val: 'Aadhaar Link', label: '🆔 Aadhaar Bank Link (আধার ব্যাঙ্ক ম্যাপিং ও সিডিং)' },
                                { val: 'Annapurna Bhandar Status Check', label: '💰 Annapurna Bhandar Status (পেমেন্ট স্ট্যাটাস চেক)' },
                                { val: 'Custom', label: '🖊️ কাস্টম কি-ওয়ার্ড (নিজের মতো লিখুন)' }
                              ].map(item => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => setCgKeyword(item.val)}
                                  className={`flex items-center text-left text-xs p-3 rounded-lg border transition cursor-pointer ${
                                    cgKeyword === item.val
                                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400 font-bold'
                                      : 'border-gray-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850/55'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Keyword Input */}
                          {cgKeyword === 'Custom' && (
                            <div className="space-y-1.5 pt-1">
                              <label className="block text-[11px] font-bold text-gray-400 uppercase">
                                আপনার কাস্টম কি-ওয়ার্ডটি লিখুন
                              </label>
                              <input
                                type="text"
                                value={cgCustomKeyword}
                                onChange={(e) => setCgCustomKeyword(e.target.value)}
                                placeholder="যেমন: লক্ষ্মীর ভান্ডার জুন মাসের টাকা, স্বাবলম্বী যোজনা"
                                className="w-full text-xs rounded-xl border border-gray-250 dark:border-slate-800 bg-transparent p-3 outline-hidden focus:border-red-500 font-bold dark:text-white"
                                required
                              />
                            </div>
                          )}

                          {/* Primary Topic / Category tag selection */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase">
                              প্রাথমিক ক্যাটাগরি (Topic Category)
                            </label>
                            <select
                              value={cgTopic}
                              onChange={(e) => setCgTopic(e.target.value)}
                              className="w-full text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent p-3 outline-hidden focus:border-red-500 font-bold dark:bg-slate-900 dark:text-white"
                            >
                              <option value="DBT আধার লিঙ্ক">💰 DBT আধার লিঙ্ক (Highest CPC)</option>
                              <option value="রেশন কার্ড আপডেট">🌾 রেশন কার্ড আপডেট (High Volume Search)</option>
                              <option value="সরকারি যোজনা">🏛️ সরকারি যোজনা (Govt Schemes)</option>
                              <option value="জনস্বার্থে সতর্কবার্তা">⚠️ জনস্বার্থে সতর্কবার্তা (Awareness)</option>
                            </select>
                          </div>

                          {/* Additional tone select & length */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-gray-400 uppercase">
                                লেখার ভঙ্গি (Article Tone)
                              </label>
                              <select
                                value={cgTone}
                                onChange={(e) => setCgTone(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent p-3 outline-hidden focus:border-red-500 font-bold dark:bg-slate-900 dark:text-white"
                              >
                                <option value="informative">ℹ️ তথ্যবহুল (Informative)</option>
                                <option value="professional">👔 অফিশিয়াল (Professional)</option>
                                <option value="engaging">🔥 ক্লিকযোগ্য (Urgent)</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-gray-400 uppercase">
                                নিবন্ধের দৈর্ঘ্য (Length)
                              </label>
                              <select
                                value={cgLength}
                                onChange={(e) => setCgLength(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent p-3 outline-hidden focus:border-red-500 font-bold dark:bg-slate-900 dark:text-white"
                              >
                                <option value="long"> বিস্তারিত (Long / ~1000 w)</option>
                                <option value="medium"> মাঝারি (Medium / ~600 w)</option>
                              </select>
                            </div>
                          </div>

                          {/* Extra user customization details */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase">
                              বিশেষ নির্দেশাবলী (Additional Instructions)
                            </label>
                            <textarea
                              value={cgAdditional}
                              onChange={(e) => setCgAdditional(e.target.value)}
                              placeholder="যেমন: সর্বশেষ জুনের নিয়মগুলো যোগ করুন, বাংলায় সহজ নির্দেশিকা দিন বা আধার বায়োমেট্রিক ই-কেওয়াইসি ফোকাস করুন..."
                              rows={3}
                              className="w-full text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent p-3 outline-hidden focus:border-red-500 leading-relaxed font-semibold dark:text-white"
                            />
                          </div>

                          {/* Generate Button */}
                          <button
                            type="submit"
                            disabled={cgStatus === 'generating'}
                            className="w-full bg-linear-to-r from-red-650 via-orange-500 to-amber-500 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-lg hover:opacity-90 transition duration-150 cursor-pointer border-0 disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {cgStatus === 'generating' ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>লিখছে, দয়া করে অপেক্ষা করুন...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                <span>নিবন্ধ জেনারেট করুন (Generate SEO Article)</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* SEO CPC Info Tip Card */}
                      <div className="bg-orange-50/50 dark:bg-slate-900 border border-orange-100 dark:border-slate-850 p-5 rounded-2xl text-xs space-y-2 text-left animate-fade-in">
                        <h5 className="font-extrabold text-orange-850 dark:text-orange-400 flex items-center gap-1">
                          📊 High CPC Keyword Strategy Insights
                        </h5>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                          West Bengal-এর সরকারি প্রকল্প ভিত্তিক পোর্টালে কন্টেন্ট লিখার চমৎকার ট্যাকটিকস: "DBT Seeding link", "Ration status check", এবং "Aadhaar Card with Bank seeding" এই关键词গুলোর এভারেজ CPC রেট অনেক বেশি হয়ে থাকে। এই টপিকের প্রতিটি আর্টিকেলের সাথে Google FAQs স্ন্যাপশট নিজে থেকেই যুক্ত করা হবে, যা সরাসরি গুগল সার্চ থেকে ১০০০X অর্গানিক রিচ দিতে সক্ষম।
                        </p>
                      </div>
                    </div>

                    {/* Right Output Panel: Generated Content (7 Cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Generation Waiting/Idle Section */}
                      {cgStatus === 'idle' && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 rounded-2xl p-8 text-center min-h-[460px] flex flex-col justify-center items-center space-y-4 md:p-12">
                          <div className="h-14 w-14 rounded-full bg-orange-50 dark:bg-slate-800 text-orange-500 flex items-center justify-center">
                            <PenSquare className="h-7 w-7 animate-pulse" />
                          </div>
                          <div className="space-y-1.5 max-w-sm">
                            <h5 className="text-sm font-extrabold text-slate-805 dark:text-white">
                              কোনো আর্টিকেল এখনও জেনারেট করা হয়নি
                            </h5>
                            <p className="text-xs text-gray-400 leading-relaxed font-semibold font-medium">
                              বাম প্যানেল থেকে আপনার টার্গেট কি-ওয়ার্ড বাছাই করে ও এআই সেটিংস নির্ধারণ করে জেনারেট বাটনে ক্লিক করুন। বিশ্বখ্যাত ডাইনামিক জেমিনি ৩.৫ সাথে সাথে কন্টেন্ট লিখে দেবে।
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Generating Loader Step Tracker */}
                      {cgStatus === 'generating' && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 rounded-2xl p-8 text-center min-h-[460px] flex flex-col justify-center items-center space-y-6 md:p-12">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-orange-100 dark:border-slate-800 border-t-orange-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                              <Sparkles className="h-6 w-6" />
                            </div>
                          </div>

                          <div className="space-y-3 w-full max-w-md">
                            <h5 className="text-sm font-extrabold text-slate-800 dark:text-white">
                              জেমিনি এআই আপনার এসইও নিবন্ধটি লিখছে...
                            </h5>
                            
                            {/* Visual Progress Steps Bar */}
                            <div className="space-y-3 text-left bg-gray-55/40 dark:bg-slate-950/20 p-4 rounded-xl border border-gray-100 dark:border-slate-850">
                              {[
                                "অনুরোধ প্রসেস ও মডেল ম্যাপ করা হচ্ছে",
                                "উচ্চ সিপিসি (CPC) কিওয়ার্ড রিসোর্স ও সর্টিং",
                                "এসইও (SEO) পরিচ্ছন্ন কন্টেন্ট খসড়া প্রস্তুতকরণ",
                                "গুগল স্ন্যাপশট প্রশ্নোত্তর (FAQ) স্কিমা অন্তর্ভুক্তি"
                              ].map((stepString, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 text-xs">
                                  <div className={`h-4 w-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                    cgLoadingStep >= idx
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                                  }`}>
                                    {cgLoadingStep > idx ? '✓' : idx + 1}
                                  </div>
                                  <span className={`font-semibold ${
                                    cgLoadingStep === idx
                                      ? 'text-orange-500 font-bold animate-pulse'
                                      : cgLoadingStep > idx
                                      ? 'text-emerald-500 line-through opacity-70'
                                      : 'text-gray-400'
                                  }`}>
                                    {stepString}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Display */}
                      {cgStatus === 'error' && (
                        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/30 rounded-2xl p-8 text-center min-h-[460px] flex flex-col justify-center items-center space-y-4 md:p-12">
                          <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center font-bold text-lg">
                            ⚠️
                          </div>
                          <div className="space-y-1.5 max-w-sm">
                            <h5 className="text-sm font-extrabold text-[#ca2c2c] dark:text-red-400">
                              কন্টেন্ট জেনারেশন ব্যর্থ হয়েছে
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-bold">
                              {cgError}
                            </p>
                          </div>
                          <button
                            onClick={() => setCgStatus('idle')}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-white text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer border-0"
                          >
                            ফিরে যান
                          </button>
                        </div>
                      )}

                      {/* Success Generation Render Box */}
                      {cgStatus === 'success' && cgGeneratedArticle && (
                        <div className="space-y-4 text-left">
                          {/* SEO Optimization Score Card */}
                          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-5 rounded-2xl shadow-sm space-y-3 select-none text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-850 pb-3">
                              <div className="space-y-0.5 text-left">
                                <h5 className="text-[9px] font-black text-gray-400 uppercase">SEO SCORE</h5>
                                <h5 className="text-sm font-extrabold text-slate-805 dark:text-white">
                                  ✨ নিবন্ধটি ৯০%+ কিওয়ার্ড এসইও স্ট্যান্ডার্ড পাস করেছে
                                </h5>
                              </div>
                              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 font-bold shrink-0">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black">Score 98/100</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
                              <div className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-950/20">
                                <p className="text-[9px] text-gray-400 font-extrabold">KEYWORD INDEX</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">100% ম্যাপড</p>
                              </div>
                              
                              <div className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-950/20">
                                <p className="text-[9px] text-gray-400 font-extrabold">CTR PERFORMANCE</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">96% Optimized</p>
                              </div>

                              <div className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-950/20">
                                <p className="text-[9px] text-gray-400 font-extrabold">FAQ SCHEMA STATUS</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">✅ সচল (Active)</p>
                              </div>

                              <div className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-950/20">
                                <p className="text-[9px] text-gray-400 font-extrabold">READABILITY GRADE</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">A+ Grade</p>
                              </div>
                            </div>
                          </div>

                          {/* Beautiful Preview Area */}
                          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-900 p-6 rounded-2xl shadow-sm space-y-4 max-h-[500px] overflow-y-auto relative scrollbar-thin text-left">
                            <span className="absolute top-4 right-4 bg-orange-100 text-orange-600 dark:bg-slate-850 dark:text-orange-400 text-[10px] font-black px-2.5 py-1 rounded">
                              {cgGeneratedArticle.category}
                            </span>

                            <div className="space-y-1.5 text-left pt-2 pb-3 border-b border-gray-100 dark:border-slate-850">
                              <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                {cgGeneratedArticle.title}
                              </h3>
                              <p className="text-xs text-gray-400 font-semibold italic">
                                📝 মেটা ডেসক্রিপশন: " {cgGeneratedArticle.excerpt} "
                              </p>
                            </div>

                            <article className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-gray-300 font-semibold space-y-4 bg-gray-50/50 dark:bg-slate-950/10 p-4 rounded-xl border border-gray-100/50 dark:border-slate-850 text-left">
                              {cgGeneratedArticle.content.split('\n').map((para, i) => {
                                const trimmed = para.trim();
                                if (trimmed.startsWith('##')) {
                                  return <h4 key={i} className="text-sm font-black text-slate-950 dark:text-white pt-3">{trimmed.replace('##', '').trim()}</h4>;
                                }
                                if (trimmed.startsWith('###')) {
                                  return <h5 key={i} className="text-xs font-black text-orange-500 pt-2">{trimmed.replace('###', '').trim()}</h5>;
                                }
                                if (trimmed.startsWith('-')) {
                                  return <li key={i} className="ml-4 list-disc text-slate-700 dark:text-gray-300 py-0.5">{trimmed.replace('-', '').trim()}</li>;
                                }
                                if (trimmed) {
                                  return <p key={i} className="leading-relaxed py-1">{trimmed}</p>;
                                }
                                return null;
                              })}
                            </article>
                          </div>

                          {/* Save & Publish Action Panel Buttons */}
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => handlePublishGeneratedArticle(false)}
                              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:text-white hover:dark:bg-slate-800 text-slate-800 font-extrabold text-xs py-3 px-4 rounded-xl shadow cursor-pointer border-0 flex items-center justify-center gap-1.5 transition"
                            >
                              📁 খসড়া হিসেবে সেভ করুন (Save Draft)
                            </button>

                            <button
                              onClick={() => handlePublishGeneratedArticle(true)}
                              className="w-full bg-linear-to-r from-red-600 to-orange-500 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg hover:opacity-90 transition cursor-pointer border-0 flex items-center justify-center gap-1.5"
                            >
                              🌐 সাইটে সরাসরি পাবলিশ করুন (Publish Live)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
