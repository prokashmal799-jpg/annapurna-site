/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Share2, Bell, MessageSquare, ArrowUp, X, CheckSquare } from 'lucide-react';

export default function FloatingActions() {
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [isJoinedPush, setIsJoinedPush] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);

  useEffect(() => {
    // Check if user has already granted push permission simulation
    const permission = localStorage.getItem('annapurna_push_2026');
    if (!permission) {
      const timer = setTimeout(() => {
        setShowPushNotification(true);
      }, 5000); // prompt after 5 seconds
      return () => clearTimeout(timer);
    } else if (permission === 'allowed') {
      setIsJoinedPush(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show a viral WhatsApp share pop-up occasionally
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsappPopup(true);
    }, 15000); // prompt after 15 seconds
    return () => clearTimeout(timer);
  }, []);

  const handlePushDecision = (allow: boolean) => {
    localStorage.setItem('annapurna_push_2026', allow ? 'allowed' : 'declined');
    setIsJoinedPush(allow);
    setShowPushNotification(false);
  };

  const handleShareOnWhatsapp = () => {
    const text = encodeURIComponent(
      "🔥 সুখবর! পশ্চিমবঙ্গের মহিলাদের জন্য চালু হলো 'অন্নপূর্ণা ভান্ডার যোজনা ২০২৬'। প্রতি মাসে মিলবে ₹৩,০০০ টাকা সরাসরি ব্যাংক খাতায়! আবেদন পদ্ধতি ও পেমেন্ট স্ট্যাটাস নিজের মোবাইল দিয়েই চেক করুন এই লিঙ্কে: " + window.location.href
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setShowWhatsappPopup(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition-transform hover:scale-115 cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Floating WhatsApp Action Sticky */}
      <div className="fixed bottom-20 right-6 z-45 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowWhatsappPopup(true)}
          className="flex h-12 items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 font-bold text-white px-4 shadow-xl transition-all cursor-pointer hover:scale-105"
        >
          <MessageSquare className="h-5 w-5 fill-white" />
          <span className="text-xs md:text-sm">হোয়াটসঅ্যাপে শেয়ার করুন</span>
        </button>
      </div>

      {/* Push Notification Toast Notification alert box */}
      {showPushNotification && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-85 rounded-xl bg-slate-900 border border-slate-800 text-white p-4 shadow-2xl animate-bounce">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Bell className="h-5 w-5 animate-swing" />
            </div>
            <div>
              <h5 className="text-xs font-bold leading-normal">
                পেমেন্ট ও নতুন কিস্তির নোটিফিকেশন পান!
              </h5>
              <p className="mt-1 text-[11px] text-slate-350 leading-relaxed font-semibold">
                আপনি কি অন্নপূর্ণা ভান্ডার যোজনার নতুন পেমেন্ট সংবাদ ও তালিকায় নাম ওঠার খবর সবার আগে ফোনে পেতে চান?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handlePushDecision(true)}
                  className="rounded-lg bg-orange-600 py-1.5 px-3 text-[11px] font-bold text-white shadow-md cursor-pointer hover:bg-orange-700"
                >
                  হ্যাঁ, অনুমতি দিন (Allow)
                </button>
                <button
                  onClick={() => handlePushDecision(false)}
                  className="rounded-lg bg-slate-800 py-1.5 px-2.5 text-[11px] font-bold text-slate-400 cursor-pointer"
                >
                  না, ধন্যবাদ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Sharing Promotion Dialog */}
      {showWhatsappPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl relative border-2 border-emerald-500">
            <button
              onClick={() => setShowWhatsappPopup(false)}
              className="absolute top-4 right-4 text-gray-450 hover:text-gray-700 dark:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <Share2 className="h-8 w-8 animate-pulse" />
              </div>

              <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
                বন্ধুদের সাথে শেয়ার করুন! 📢
              </h3>

              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                “আপনার একটি শেয়ারে কোনো অসচ্ছল মায়ের উপকারে আসতে পারে। প্রতি মাসে ₹৩,০০০ টাকার অন্নপূর্ণা ভান্ডারের এই সরকারি সঠিক খবর হোয়াটসঅ্যাপ বা গ্রুপে শেয়ার করুন!”
              </p>

              <div className="rounded-xl bg-orange-50 dark:bg-slate-850 p-4 text-left border border-orange-200">
                <span className="text-[10px] uppercase font-bold text-orange-600 block mb-1">শেয়ার লিংক গ্যারান্টি:</span>
                <span className="text-xs font-mono font-bold text-slate-750 dark:text-slate-300 line-clamp-1 select-all">
                  {window.location.href}
                </span>
              </div>

              <button
                id="whatsapp-share-modal-btn"
                onClick={handleShareOnWhatsapp}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-103 cursor-pointer"
              >
                <MessageSquare className="h-5 w-5 fill-white" />
                <span>মহিলা গ্রুপে এখনই পাঠান (WhatsApp)</span>
              </button>

              <button
                onClick={() => setShowWhatsappPopup(false)}
                className="text-[11px] text-gray-400 underline"
              >
                পরে শেয়ার করবো
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
