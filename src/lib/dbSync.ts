/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, increment 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { NewsPost, Comment, AdSetting, ContactSetting, Subscriber, PushCampaign } from '../types';
import { NEWS_ARTICLES, MOCK_COMMENTS, MOCK_ADS_CONFIG, ALERTS_TICKER, SCHEME_STATS } from '../data';

// --- Local Storage Keys for Fallback ---
const STORAGE_KEYS = {
  posts: 'annapurna_news_articles_2026',
  tickers: 'annapurna_tickers_2026',
  ads: 'annapurna_ad_settings_2026',
  seo: 'annapurna_seo_settings_2026',
  categories: 'annapurna_categories_2026',
  comments: 'annapurna_comments_2026',
  analytics: 'annapurna_analytics_2026',
  homepage: 'annapurna_homepage_layout_2026',
  contacts: 'annapurna_contacts_2026',
};

// --- Interfaces for categories, seo, ticker, and analytics ---
export interface TickerItem {
  id: string;
  text: string;
  link: string;
  active: boolean;
  createdAt: string;
}

export interface SeoSetting {
  id: string;
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogImage: string;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  googleAdSenseId?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
}

export interface HomepageLayout {
  id: string;
  heroEnabled: boolean;
  tickerEnabled: boolean;
  newsEnabled: boolean;
  calculatorEnabled: boolean;
  statusCheckerEnabled: boolean;
  documentsEnabled: boolean;
  faqEnabled: boolean;
}

export interface AnalyticStats {
  id: string;
  visitors: number;
  pageviews: number;
}

// ==========================================
// 1. NEWS POSTS (ARTICLES)
// ==========================================

export async function fetchPosts(): Promise<NewsPost[]> {
  const collectionName = 'posts';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Auto Seed
      console.log('Posts collection empty, seeding default entries...');
      const seedData = [...NEWS_ARTICLES];
      for (const article of seedData) {
        const postDoc = doc(db, collectionName, article.id);
        const postData = {
          ...article,
          published: true,
          scheduledAt: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(postDoc, postData);
      }
      localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(seedData));
      return seedData;
    }

    const posts: NewsPost[] = [];
    snapshot.forEach((doc) => {
      posts.push(doc.data() as NewsPost);
    });

    // Automatical self-healing sync for the specialized SEO high-traffic article
    const dbtArticleId = 'annapurna-bhandar-dbt-link-how-to-link-aadhaar-with-bank-account';
    const hasDbtArticle = posts.some(p => p.id === dbtArticleId);
    if (!hasDbtArticle) {
      console.log('Specialized SEO article missing in active database, seeding it atomically...');
      const dbtArticle = NEWS_ARTICLES.find(a => a.id === dbtArticleId);
      if (dbtArticle) {
        try {
          const postDoc = doc(db, collectionName, dbtArticle.id);
          const postData = {
            ...dbtArticle,
            published: true,
            scheduledAt: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(postDoc, postData);
          posts.push(postData as NewsPost);
        } catch (e) {
          console.error('Failed to seed missing SEO article:', e);
        }
      }
    }
    
    // Sort posts by date/createdAt descending
    posts.sort((a, b) => {
      const aTime = a.id.startsWith('custom-news-') ? parseInt(a.id.replace('custom-news-', '')) : Date.now();
      const bTime = b.id.startsWith('custom-news-') ? parseInt(b.id.replace('custom-news-', '')) : Date.now();
      return bTime - aTime;
    });

    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
    return posts;
  } catch (err) {
    console.warn('Firestore fetchPosts failed, loading from localstorage:', err);
    // Fallback
    const saved = localStorage.getItem(STORAGE_KEYS.posts);
    if (saved) return JSON.parse(saved);
    return NEWS_ARTICLES;
  }
}

export async function addPost(post: Omit<NewsPost, 'id'> & { id?: string, published?: boolean, scheduledAt?: string }): Promise<NewsPost> {
  const collectionName = 'posts';
  const id = post.id || `custom-news-${Date.now()}`;
  const fullPost = {
    ...post,
    id,
    published: post.published !== undefined ? post.published : true,
    scheduledAt: post.scheduledAt || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as NewsPost;

  try {
    const postDoc = doc(db, collectionName, id);
    await setDoc(postDoc, fullPost);
    
    // Sync local
    const current = await fetchPosts();
    const updated = [fullPost, ...current.filter(p => p.id !== id)];
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    
    return fullPost;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function updatePost(id: string, updates: Partial<NewsPost> & { published?: boolean, scheduledAt?: string }): Promise<void> {
  const collectionName = 'posts';
  try {
    const postRef = doc(db, collectionName, id);
    const cleanedUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(postRef, cleanedUpdates);
    
    // Sync local
    const current = await fetchPosts();
    const updated = current.map(p => p.id === id ? { ...p, ...cleanedUpdates } as NewsPost : p);
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function deletePost(id: string): Promise<void> {
  const collectionName = 'posts';
  try {
    await deleteDoc(doc(db, collectionName, id));
    
    // Sync local
    const current = await fetchPosts();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function incrementPostViews(id: string): Promise<void> {
  const collectionName = 'posts';
  try {
    const postRef = doc(db, collectionName, id);
    await updateDoc(postRef, {
      views: increment(1)
    });
  } catch (err) {
    // silently catch or increment locally
    const saved = localStorage.getItem(STORAGE_KEYS.posts);
    if (saved) {
      const posts: NewsPost[] = JSON.parse(saved);
      const updated = posts.map(p => p.id === id ? { ...p, views: p.views + 1 } : p);
      localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  }
}

// ==========================================
// 2. BREAKING NEWS TICKER
// ==========================================

export async function fetchTickers(): Promise<TickerItem[]> {
  const collectionName = 'tickers';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      console.log('Tickers empty, seeding defaults...');
      const defaultTickers: TickerItem[] = ALERTS_TICKER.map((t, idx) => ({
        id: `ticker-${idx}`,
        text: t,
        link: '',
        active: true,
        createdAt: new Date().toISOString()
      }));
      for (const item of defaultTickers) {
        await setDoc(doc(db, collectionName, item.id), item);
      }
      localStorage.setItem(STORAGE_KEYS.tickers, JSON.stringify(defaultTickers));
      return defaultTickers;
    }
    
    const items: TickerItem[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as TickerItem));
    localStorage.setItem(STORAGE_KEYS.tickers, JSON.stringify(items));
    return items;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.tickers);
    if (saved) return JSON.parse(saved);
    return ALERTS_TICKER.map((t, idx) => ({
      id: `ticker-${idx}`,
      text: t,
      link: '',
      active: true,
      createdAt: new Date().toISOString()
    }));
  }
}

export async function saveTicker(item: TickerItem): Promise<void> {
  const collectionName = 'tickers';
  try {
    await setDoc(doc(db, collectionName, item.id), item);
    const current = await fetchTickers();
    const updated = [item, ...current.filter(t => t.id !== item.id)];
    localStorage.setItem(STORAGE_KEYS.tickers, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
    throw err;
  }
}

export async function deleteTicker(id: string): Promise<void> {
  const collectionName = 'tickers';
  try {
    await deleteDoc(doc(db, collectionName, id));
    const current = await fetchTickers();
    const updated = current.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.tickers, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    throw err;
  }
}

// ==========================================
// 3. ADSENSE CONFIG (ADSETTINGS)
// ==========================================

export async function fetchAds(): Promise<AdSetting[]> {
  const collectionName = 'ads';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      console.log('Ads empty, seeding defaults...');
      const defaultAds = MOCK_ADS_CONFIG;
      for (const ad of defaultAds) {
        await setDoc(doc(db, collectionName, ad.id), {
          ...ad,
          code: `<div class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-orange-200 rounded text-center"><p class="text-xs text-orange-600 font-bold">SPONSORED GOOGLE ADSENSE PLACEMENT</p><h4 class="text-sm font-black text-slate-800 mt-1">${ad.title}</h4><a href="${ad.linkUrl}" class="inline-block bg-orange-600 text-white text-xs px-3 py-1.5 rounded mt-2 font-bold">${ad.ctaText}</a></div>`,
          active: true
        });
      }
      localStorage.setItem(STORAGE_KEYS.ads, JSON.stringify(defaultAds));
      return defaultAds;
    }
    const items: AdSetting[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as AdSetting));
    localStorage.setItem(STORAGE_KEYS.ads, JSON.stringify(items));
    return items;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.ads);
    if (saved) return JSON.parse(saved);
    return MOCK_ADS_CONFIG;
  }
}

export async function saveAd(ad: AdSetting & { code?: string }): Promise<void> {
  const collectionName = 'ads';
  try {
    await setDoc(doc(db, collectionName, ad.id), ad);
    const current = await fetchAds();
    const updated = current.map(item => item.id === ad.id ? ad : item);
    localStorage.setItem(STORAGE_KEYS.ads, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${ad.id}`);
    throw err;
  }
}

// ==========================================
// 4. SEO SETTINGS
// ==========================================

const DEFAULT_SEO: SeoSetting = {
  id: 'global',
  title: 'অন্নপূর্ণা ভান্ডার যোজনা ২০২৬',
  description: 'অন্নপূর্ণা ভান্ডার যোজনা ২০২৬ পোর্টাল - যোগ্যতা, অনলাইন আবেদন এবং পেমেন্ট স্ট্যাটাস চেক করার সম্পূর্ণ তথ্য',
  keywords: 'annapurna bhandar, bhandar scheme, 2026 scheme, govt schemes west bengal, 3000 rupees direct benefit transfer',
  author: 'West Bengal Women and Child Development Department',
  ogImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
  googleSiteVerification: '',
  googleAnalyticsId: '',
  googleAdSenseId: '',
};

export async function fetchSeoSettings(): Promise<SeoSetting> {
  const path = 'seo/global';
  try {
    const snap = await getDoc(doc(db, 'seo', 'global'));
    if (!snap.exists()) {
      console.log('Seo empty, seeding global default...');
      await setDoc(doc(db, 'seo', 'global'), DEFAULT_SEO);
      localStorage.setItem(STORAGE_KEYS.seo, JSON.stringify(DEFAULT_SEO));
      return DEFAULT_SEO;
    }
    const data = snap.data() as SeoSetting;
    localStorage.setItem(STORAGE_KEYS.seo, JSON.stringify(data));
    return data;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.seo);
    if (saved) return JSON.parse(saved);
    return DEFAULT_SEO;
  }
}

export async function saveSeoSettings(data: SeoSetting): Promise<void> {
  const path = 'seo/global';
  try {
    await setDoc(doc(db, 'seo', 'global'), data);
    localStorage.setItem(STORAGE_KEYS.seo, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// ==========================================
// 4B. CONTACT SETTINGS
// ==========================================

const DEFAULT_CONTACT: ContactSetting = {
  id: 'global',
  phone: '১৮০০-৩৪৫-৫৬৭৮ (বিনামূল্যে কল করুন)',
  phoneSubtext: 'ব্যবসায়িক দিনগুলিতে সকাল ১০টা থেকে বিকেল ৫টা পর্যন্ত',
  email: 'support@annapurna-bhandar-portal.org',
  address: 'বিকাশ ভবন, সল্টলেক সিটি, ৭ম তলা, কলকাতা ৭০০০৯১, পশ্চিমবঙ্গ, ভারত।',
  warning: '⚠️ মনে রাখবেন: আমরা কোনো আবেদন ফি গ্রহণ করি না। কোনো ব্যক্তি কোনো টাকা চাইলে এই উপরের ইমেল অথবা আপনার স্থানীয় পশ্চিমবঙ্গ পুলিশ সাইবার সেলে রিপোর্ট করুন।',
};

export async function fetchContactSettings(): Promise<ContactSetting> {
  const path = 'contacts/global';
  try {
    const snap = await getDoc(doc(db, 'contacts', 'global'));
    if (!snap.exists()) {
      console.log('Contact empty, seeding global default...');
      await setDoc(doc(db, 'contacts', 'global'), DEFAULT_CONTACT);
      localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(DEFAULT_CONTACT));
      return DEFAULT_CONTACT;
    }
    const data = snap.data() as ContactSetting;
    localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(data));
    return data;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.contacts);
    if (saved) return JSON.parse(saved);
    return DEFAULT_CONTACT;
  }
}

export async function saveContactSettings(data: ContactSetting): Promise<void> {
  const path = 'contacts/global';
  try {
    await setDoc(doc(db, 'contacts', 'global'), data);
    localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// ==========================================
// 5. COMMENTS MODERATION
// ==========================================

export async function fetchComments(): Promise<Comment[]> {
  const collectionName = 'comments';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      console.log('Comments empty, seeding defaults...');
      const defaultComments: Comment[] = MOCK_COMMENTS.map((c) => ({
        id: c.id,
        postId: 'news-1',
        author: c.author,
        content: c.content,
        date: c.date,
        likes: c.likes,
        approved: true,
        createdAt: new Date().toISOString()
      }));
      for (const comment of defaultComments) {
        await setDoc(doc(db, collectionName, comment.id), comment);
      }
      localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(defaultComments));
      return defaultComments;
    }
    const items: Comment[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as Comment));
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(items));
    return items;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.comments);
    if (saved) return JSON.parse(saved);
    return MOCK_COMMENTS.map((c) => ({
      id: c.id,
      postId: 'news-1',
      author: c.author,
      content: c.content,
      date: c.date,
      likes: c.likes,
      approved: true,
      createdAt: new Date().toISOString()
    }));
  }
}

export async function addComment(postId: string, author: string, content: string): Promise<Comment> {
  const collectionName = 'comments';
  const id = `comment-${Date.now()}`;
  const newComment: Comment & { postId: string, approved: boolean, createdAt: string } = {
    id,
    postId,
    author: author.trim() || 'বেনামী উপভোক্তা',
    content: content.trim(),
    date: 'সদ্য করা মন্তব্য',
    likes: 0,
    approved: false, // Default unapproved for moderator queue!
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, collectionName, id), newComment);
    
    const current = await fetchComments();
    const updated = [newComment as Comment, ...current];
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    
    return newComment as Comment;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function approveComment(id: string): Promise<void> {
  const collectionName = 'comments';
  try {
    await updateDoc(doc(db, collectionName, id), { approved: true });
    const current = await fetchComments();
    const updated = current.map(c => c.id === id ? { ...c, approved: true } : c);
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function deleteComment(id: string): Promise<void> {
  const collectionName = 'comments';
  try {
    await deleteDoc(doc(db, collectionName, id));
    const current = await fetchComments();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function incrementCommentLikes(id: string): Promise<void> {
  const collectionName = 'comments';
  try {
    await updateDoc(doc(db, collectionName, id), { likes: increment(1) });
  } catch (err) {
    const current = await fetchComments();
    const updated = current.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c);
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
}

// ==========================================
// 6. HOMEPAGE SECTIONS CONFIG
// ==========================================

const DEFAULT_LAYOUT: HomepageLayout = {
  id: 'layout',
  heroEnabled: true,
  tickerEnabled: true,
  newsEnabled: true,
  calculatorEnabled: true,
  statusCheckerEnabled: true,
  documentsEnabled: true,
  faqEnabled: true
};

export async function fetchHomepageLayout(): Promise<HomepageLayout> {
  const path = 'homepage/layout';
  try {
    const snap = await getDoc(doc(db, 'homepage', 'layout'));
    if (!snap.exists()) {
      await setDoc(doc(db, 'homepage', 'layout'), DEFAULT_LAYOUT);
      localStorage.setItem(STORAGE_KEYS.homepage, JSON.stringify(DEFAULT_LAYOUT));
      return DEFAULT_LAYOUT;
    }
    const data = snap.data() as HomepageLayout;
    localStorage.setItem(STORAGE_KEYS.homepage, JSON.stringify(data));
    return data;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.homepage);
    if (saved) return JSON.parse(saved);
    return DEFAULT_LAYOUT;
  }
}

export async function saveHomepageLayout(data: HomepageLayout): Promise<void> {
  const path = 'homepage/layout';
  try {
    await setDoc(doc(db, 'homepage', 'layout'), data);
    localStorage.setItem(STORAGE_KEYS.homepage, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// ==========================================
// 7. PUBLIC CATEGORIES
// ==========================================

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'payment', name: '💰 পেমেন্ট আপডেট' },
  { id: 'camp', name: '⛺ ক্যাম্প ও আবেদন' },
  { id: 'warning', name: '⚠️ জনস্বার্থে সতর্কবার্তা' },
  { id: 'notice', name: '📢 সরকারি বিজ্ঞপ্তি' },
  { id: 'info', name: 'ℹ️ সাধারণ তথ্য' }
];

export async function fetchCategories(): Promise<CategoryItem[]> {
  const collectionName = 'categories';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, collectionName, cat.id), cat);
      }
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const items: CategoryItem[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as CategoryItem));
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(items));
    return items;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.categories);
    if (saved) return JSON.parse(saved);
    return DEFAULT_CATEGORIES;
  }
}

export async function addCategory(id: string, name: string): Promise<void> {
  const collectionName = 'categories';
  try {
    const item = { id, name };
    await setDoc(doc(db, collectionName, id), item);
    const current = await fetchCategories();
    const updated = [...current.filter(c => c.id !== id), item];
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${id}`);
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const collectionName = 'categories';
  try {
    await deleteDoc(doc(db, collectionName, id));
    const current = await fetchCategories();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    throw err;
  }
}

// ==========================================
// 8. VISITOR COUNTER & ANALYTICS
// ==========================================

export async function fetchAnalytics(): Promise<AnalyticStats[]> {
  const collectionName = 'analytics';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      const defaultItem = { id: 'summary', visitors: 145000, pageviews: 489000 };
      await setDoc(doc(db, collectionName, 'summary'), defaultItem);
      localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify([defaultItem]));
      return [defaultItem];
    }
    const items: AnalyticStats[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as AnalyticStats));
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(items));
    return items;
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.analytics);
    if (saved) return JSON.parse(saved);
    return [{ id: 'summary', visitors: 145000, pageviews: 489000 }];
  }
}

export async function incrementVisitorSession(isNewVisitor: boolean): Promise<void> {
  const collectionName = 'analytics';
  try {
    const summaryRef = doc(db, collectionName, 'summary');
    await updateDoc(summaryRef, {
      visitors: increment(isNewVisitor ? 1 : 0),
      pageviews: increment(1)
    });
  } catch (err) {
    const saved = localStorage.getItem(STORAGE_KEYS.analytics);
    const items: AnalyticStats[] = saved ? JSON.parse(saved) : [{ id: 'summary', visitors: 145000, pageviews: 489000 }];
    const updated = items.map(item => {
      if (item.id === 'summary') {
        return {
          ...item,
          visitors: item.visitors + (isNewVisitor ? 1 : 0),
          pageviews: item.pageviews + 1
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
}

// ==========================================
// 9. VERIFIED BACKLINKS
// ==========================================

export interface BacklinkItem {
  id: string;
  url: string;
  platform: string;
  title: string;
  createdAt: string;
}

const DEFAULT_BACKLINKS: BacklinkItem[] = [
  {
    id: 'backlink-fb-1',
    url: 'https://facebook.com/annapurna.bhandar.yojana.2026',
    platform: 'facebook',
    title: 'অন্নপূর্ণা ভান্ডার হেল্প ফেসবুক পেজ',
    createdAt: new Date().toISOString()
  },
  {
    id: 'backlink-tg-1',
    url: 'https://t.me/annapurna_bhandar_yojana_wb',
    platform: 'telegram',
    title: 'অফিসিয়াল টেলিগ্রাম নিউজ গ্রুপ',
    createdAt: new Date().toISOString()
  }
];

export async function fetchBacklinks(): Promise<BacklinkItem[]> {
  const collectionName = 'backlinks';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      console.log('Backlinks empty, seeding defaults...');
      for (const item of DEFAULT_BACKLINKS) {
        await setDoc(doc(db, collectionName, item.id), item);
      }
      localStorage.setItem('annapurna_backlinks_2026', JSON.stringify(DEFAULT_BACKLINKS));
      return DEFAULT_BACKLINKS;
    }
    const items: BacklinkItem[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as BacklinkItem));
    
    // Sort buy timestamp or platform
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem('annapurna_backlinks_2026', JSON.stringify(items));
    return items;
  } catch (err) {
    const saved = localStorage.getItem('annapurna_backlinks_2026');
    if (saved) return JSON.parse(saved);
    return DEFAULT_BACKLINKS;
  }
}

export async function saveBacklink(item: BacklinkItem): Promise<void> {
  const collectionName = 'backlinks';
  try {
    await setDoc(doc(db, collectionName, item.id), item);
    const current = await fetchBacklinks();
    const updated = [item, ...current.filter(t => t.id !== item.id)];
    localStorage.setItem('annapurna_backlinks_2026', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
    throw err;
  }
}

export async function deleteBacklink(id: string): Promise<void> {
  const collectionName = 'backlinks';
  try {
    await deleteDoc(doc(db, collectionName, id));
    const current = await fetchBacklinks();
    const updated = current.filter(t => t.id !== id);
    localStorage.setItem('annapurna_backlinks_2026', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    throw err;
  }
}

// ==========================================
// 10. WEB PUSH NOTIFICATION & SUBSCRIBERS
// ==========================================

export async function saveSubscriber(item: Subscriber): Promise<void> {
  const collectionName = 'subscribers';
  try {
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
    throw err;
  }
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const collectionName = 'subscribers';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const items: Subscriber[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as Subscriber));
    return items;
  } catch (err) {
    console.warn('Firestore fetchSubscribers failed:', err);
    return [];
  }
}

export async function savePushCampaign(item: PushCampaign): Promise<void> {
  const collectionName = 'push_campaigns';
  try {
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
    throw err;
  }
}

export async function fetchPushCampaigns(): Promise<PushCampaign[]> {
  const collectionName = 'push_campaigns';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const items: PushCampaign[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as PushCampaign));
    // Sort buy timestamp descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (err) {
    console.warn('Firestore fetchPushCampaigns failed:', err);
    return [];
  }
}

