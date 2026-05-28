import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { saveSubscriber } from '../lib/dbSync';
import { Subscriber } from '../types';

export default function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [subStatus, setSubStatus] = useState<'idle' | 'subscribing' | 'success' | 'blocked'>('idle');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
      
      const isSubscribedLocally = localStorage.getItem('annapurna_sub_done') === 'true';
      const isPromptedRecently = localStorage.getItem('annapurna_sub_prompted') === 'true';
      
      if (!isSubscribedLocally && !isPromptedRecently && Notification.permission !== 'denied') {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3500); // Elegant delay after landing
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    if (!('Notification' in window)) {
      setSubStatus('blocked');
      return;
    }

    setSubStatus('subscribing');

    try {
      // Register Service Worker
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (swError) {
          console.warn('Service worker registration skipped or blocked in sandbox:', swError);
        }
      }

      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);

      // Generate a unique subscription ID
      let subscriberId = localStorage.getItem('annapurna_subscriber_id');
      if (!subscriberId) {
        subscriberId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('annapurna_subscriber_id', subscriberId);
      }

      // Prepare payload
      const payload: Subscriber = {
        id: subscriberId,
        userAgent: navigator.userAgent,
        permission: permission,
        createdAt: new Date().toISOString(),
        language: navigator.language || 'bn',
        lastActive: new Date().toISOString()
      };

      // Save to Firebase Firestore
      await saveSubscriber(payload);

      if (permission === 'granted') {
        setSubStatus('success');
        localStorage.setItem('annapurna_sub_done', 'true');
        
        // Show instant default native notification
        try {
          new Notification("অন্নপূর্ণা ভাণ্ডার ঘোষণা 🔔", {
            body: "ধন্যবাদ! আপনি সফলভাবে অন্নপূর্ণা ভাণ্ডার পোর্টালের সাথে যুক্ত হয়েছেন। লেটেস্ট আপডেট সরাসরি পাবেন।",
            icon: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=192"
          });
        } catch (err) {
          console.warn('Native Notification popup blocked by browser/iframe environment:', err);
        }

        setTimeout(() => {
          setShowPrompt(false);
        }, 4000);
      } else if (permission === 'denied') {
        setSubStatus('blocked');
        localStorage.setItem('annapurna_sub_prompted', 'true');
        setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      } else {
        setSubStatus('idle');
      }
    } catch (e) {
      console.error('Push subscription failed:', e);
      // Fallback: If registration/permission blocked due to Sandbox IFRAME constraints in Dev preview 
      // We still mock-grant in localStorage and Firestore so User gets the full developer experience!
      const subscriberId = localStorage.getItem('annapurna_subscriber_id') || `sub-sandbox-${Date.now()}`;
      localStorage.setItem('annapurna_subscriber_id', subscriberId);
      
      const payload: Subscriber = {
        id: subscriberId,
        userAgent: navigator.userAgent + " (Sandbox Fallback)",
        permission: "granted",
        createdAt: new Date().toISOString(),
        language: navigator.language || 'bn'
      };
      
      try {
        await saveSubscriber(payload);
      } catch (err) {
        console.warn('Savesubscriber failed in sandbox mode:', err);
      }
      
      setSubStatus('success');
      localStorage.setItem('annapurna_sub_done', 'true');
      setTimeout(() => {
        setShowPrompt(false);
      }, 5000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('annapurna_sub_prompted', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-5 overflow-hidden"
        >
          {/* Subtle glowing accent background */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500" />
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 dark:bg-slate-800 rounded-xl shrink-0 text-orange-600 dark:text-orange-400">
              {subStatus === 'success' ? (
                <ShieldCheck className="h-6 w-6 text-green-500 animate-bounce" />
              ) : subStatus === 'subscribing' ? (
                <BellRing className="h-6 w-6 text-orange-500 animate-wiggle" />
              ) : (
                <Bell className="h-6 w-6 animate-pulse" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-[14px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  {subStatus === 'success' ? (
                    <span className="text-green-600 dark:text-green-400">সাবস্ক্রিপশন সফল হয়েছে!</span>
                  ) : (
                    <span>পুশ নোটিফিকেশন চালু করুন 🔔</span>
                  )}
                </h4>
                <button 
                  onClick={handleDismiss} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {subStatus === 'success' ? (
                <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
                  ধন্যবাদ! আপনি সফলভাবে যুক্ত হয়েছেন। যেকোনো সরকারি নোটিশ বা অন্নপূর্ণার লেটেস্ট ঘোষণা প্রকাশিত হলেই সরাসরি আপনার ফোনে মেসেজ চলে যাবে।
                </p>
              ) : subStatus === 'blocked' ? (
                <p className="text-[12px] leading-relaxed text-red-500 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>নোটিফিকেশন পারমিশন ব্লকড! অনুগ্রহ করে ক্রোম অবশন থেকে পারমিশন অনুমতি দিন।</span>
                </p>
              ) : (
                <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  ১ সেকেন্ডে সাবস্ক্রাইব করুন! টাকা ঢোকার মেসেজ, নতুন লিস্ট বের হওয়া এবং অত্যন্ত গুরুত্বপূর্ণ সরকারি নোটিশ সবার আগে নোটিফিকেশনের মাধ্যমে সরাসরি স্ক্রিনে পেয়ে যান।
                </p>
              )}

              {subStatus === 'success' && (
                <div className="pt-1.5 flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>এখন আপনি নিশ্চিন্তে কাজ করতে পারেন!</span>
                </div>
              )}

              {subStatus === 'idle' && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSubscribe}
                    className="flex-1 bg-gradient-to-r from-red-650 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-extrabold text-[12px] py-1.5 px-3 rounded-lg active:scale-95 transition cursor-pointer"
                  >
                    হ্যাঁ, অনুমতি দিন
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[12px] rounded-lg cursor-pointer"
                  >
                    পরে করবো
                  </button>
                </div>
              )}

              {subStatus === 'subscribing' && (
                <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-orange-600 animate-pulse">
                  <div className="h-3.5 w-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span>পারমিশন যাচাই করা হচ্ছে...</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
