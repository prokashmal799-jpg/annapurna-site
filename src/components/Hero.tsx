/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Award, Flame, Users, ArrowRight, CheckCircle2, FileText, Smartphone } from 'lucide-react';
import { TabId } from '../types';

interface HeroProps {
  onTabChange: (tab: TabId) => void;
}

export default function Hero({ onTabChange }: HeroProps) {
  const [visitorCount, setVisitorCount] = useState({ today: 41258, active: 1845 });
  const [typedText, setTypedText] = useState('');
  const [newsIndex, setNewsIndex] = useState(0);

  const bailingTypingPhrases = [
    "অনলাইন ফর্ম ফিলাপ বিস্তারিত পদ্ধতি... 💻",
    "আজই নিজের যোগ্যতা চেক করে নিন... 🔍",
    "প্রয়োজনীয় নথিপত্রের সম্পূর্ণ তালিকা... 📄",
    "প্রতি মাসে ৩০০০ টাকা সরাসরি ব্যাংক অ্যাকাউন্টে... 💰",
    "আপনার কিস্তির স্ট্যাটাস চেক করুন... ⏳",
    "ভুয়ো ওয়েবসাইট থেকে সাবধান থাকুন... ⚠️"
  ];

  // Simulated live updates for active visitor counters to feel highly authentic.
  useEffect(() => {
    const visitorInterval = setInterval(() => {
      setVisitorCount(prev => ({
        today: prev.today + Math.floor(Math.random() * 5 + 1),
        active: Math.max(900, prev.active + Math.floor(Math.random() * 21 - 10))
      }));
    }, 4000);
    return () => clearInterval(visitorInterval);
  }, []);

  // Simple typing animation logic for Bengali phrases without external library
  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const type = () => {
      const currentPhrase = bailingTypingPhrases[newsIndex];
      
      if (isDeleting) {
        setTypedText(currentPhrase.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypedText(currentPhrase.substring(0, charIndex + 1));
        charIndex++;
      }

      let speed = 100; // standard typing speed
      if (isDeleting) { speed /= 2; } // delete faster

      if (!isDeleting && charIndex === currentPhrase.length) {
        speed = 2000; // hold before delete
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        setNewsIndex(prev => (prev + 1) % bailingTypingPhrases.length);
        speed = 500; // pause before next word
      }

      timer = setTimeout(type, speed);
    };

    timer = setTimeout(type, 800);
    return () => clearTimeout(timer);
  }, [newsIndex]);

  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-12 md:py-20 transition-colors duration-300 border-b border-orange-100 dark:border-slate-800">
      
      {/* Background Animated Gradient Blobs */}
      <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl" aria-hidden="true">
        <div className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-orange-400 to-red-600 opacity-20 dark:opacity-10" style={{
          clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)'
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 text-center">
        {/* Trending badge */}
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-950/40 px-3.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200">
          <Flame className="h-4 w-4 animate-bounce text-red-500" />
          <span>ট্রেন্ডিং আপডেট ২০২৬: অন্নপূর্ণা ভান্ডার ফরম ফিলাপ শুরু হলো</span>
        </div>

        {/* Large Headline */}
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl md:leading-tight">
          <span className="block">পশ্চিমবঙ্গ সরকারি প্রকল্প ২০২৬</span>
          <span className="relative mt-2 inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 font-black drop-shadow-xs dark:drop-shadow-md">
            “অন্নপূর্ণা ভান্ডার যোজনা ২০২৬”
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl font-sans text-base md:text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300">
          “মাসিক ₹৩০০০ সহায়তা, যোগ্যতা, আবেদন ও পেমেন্ট স্ট্যাটাসের সম্পূর্ণ তথ্য”
        </p>

        {/* Bengali typing animation area */}
        <div className="mt-4 flex items-center justify-center min-h-[36px]">
          <p className="bg-slate-100 dark:bg-slate-800/80 rounded-lg px-4 py-1.5 text-xs md:text-sm font-semibold text-orange-600 dark:text-orange-400 border border-orange-200/50 shadow-xs">
            <span className="text-gray-500 dark:text-gray-400 mr-1.5">লাইভ গাইড:</span>
            <span className="font-mono cursor-blink text-slate-800 dark:text-white font-bold">{typedText}</span>
          </p>
        </div>

        {/* Visitor Counter Metrics with Animated Look */}
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-md border border-orange-100 dark:border-slate-850">
          <div className="text-center border-r border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <Users className="h-4 w-4" />
              <span>আজকের পাঠক</span>
            </div>
            <p className="mt-1 font-mono text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              {visitorCount.today.toLocaleString('bn-IN')}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>লাইভ ভিজিটর</span>
            </div>
            <p className="mt-1 font-mono text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              {visitorCount.active.toLocaleString('bn-IN')}
            </p>
          </div>
        </div>

        {/* Animated CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-cta-apply"
            onClick={() => onTabChange('apply')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>অনলাইন আবেদন করুন (Apply Now)</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button
            id="hero-cta-status"
            onClick={() => onTabChange('status')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-orange-500 px-8 py-4 text-base font-bold text-orange-600 dark:text-orange-400 shadow-md transition-all hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span>পেমেন্ট রসিদ চেক করুন (Status)</span>
            <Smartphone className="h-5 w-5" />
          </button>
        </div>

        {/* Floating Quick Navigation Tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold max-w-2xl mx-auto">
          <span className="bg-gray-100 dark:bg-slate-850 px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-100" onClick={() => onTabChange('eligibility')}>#যোগ্যতা নিরূপক</span>
          <span className="bg-gray-100 dark:bg-slate-850 px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-100" onClick={() => onTabChange('documents')}>#প্রয়োজনীয় ফর্ম ডাউনলোড</span>
          <span className="bg-gray-100 dark:bg-slate-850 px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-100" onClick={() => onTabChange('faq')}>#প্রশ্ন ও উত্তর</span>
          <span className="bg-gray-100 dark:bg-slate-850 px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-100" onClick={() => onTabChange('news')}>#মোবাইল লিংক সতর্কতা</span>
        </div>

      </div>
    </section>
  );
}
