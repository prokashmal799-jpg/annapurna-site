/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Clock, HelpCircle, Bell, Search, ShieldCheck, Moon, Sun, Award } from 'lucide-react';
import { TabId } from '../types';
import { ALERTS_TICKER } from '../data';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

import { fetchTickers } from '../lib/dbSync';

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [alerts, setAlerts] = useState<string[]>(ALERTS_TICKER);

  // Synchronize dynamic alerts
  useEffect(() => {
    const syncAlerts = async () => {
      try {
        const fetched = await fetchTickers();
        if (fetched && fetched.length > 0) {
          setAlerts(fetched.map(t => t.text));
        }
      } catch (e) {
        console.error("Alerts sync failed, fallback loaded", e);
      }
    };
    syncAlerts();

    // Re-trigger sync on storage write actions
    window.addEventListener('storage', syncAlerts);
    return () => window.removeEventListener('storage', syncAlerts);
  }, []);

  // Slower ticker change
  useEffect(() => {
    if (alerts.length === 0) return;
    const alertInterval = setInterval(() => {
      setActiveAlertIndex(prev => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(alertInterval);
  }, [alerts]);

  // Sync formatted Indian Standard Time or standard UTC
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZone: 'Asia/Kolkata'
      };
      setCurrentDateTime(now.toLocaleDateString('bn-IN', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const isSessionAuth = sessionStorage.getItem('annapurna_session_auth') === 'true';
      const isFbAuth = auth.currentUser !== null;
      setIsAdmin(isFbAuth || isSessionAuth);
    };

    const unsubscribe = onAuthStateChanged(auth, () => {
      checkAdmin();
    });

    window.addEventListener('storage', checkAdmin);
    checkAdmin();

    return () => {
      unsubscribe();
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  const navLinks: { id: TabId; label: string }[] = [
    { id: 'home', label: 'হোম' },
    { id: 'eligibility', label: 'যোগ্যতা' },
    { id: 'form_filler', label: '📄 অফলাইন ফর্ম (PDF)' },
    { id: 'apply', label: 'আবেদন' },
    { id: 'status', label: 'স্ট্যাটাস' },
    { id: 'documents', label: 'নথিপত্র' },
    { id: 'news', label: 'খবর' },
    { id: 'contact', label: 'যোগাযোগ' },
    ...(isAdmin ? [{ id: 'admin' as TabId, label: '🔒 অ্যাডমিন' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-300 border-b-2 border-orange-500">
      {/* Upper Government Branding & Dynamic Information info panel */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-1.5 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Official Emblem lookalike badge or title info */}
          <div className="flex items-center gap-2">
            <span className="animate-pulse bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              নিরাপদ পোর্টাল
            </span>
            <span className="font-semibold text-[11px] md:text-xs">
              পশ্চিমবঙ্গ সামাজিক সহায়তা অনুদান সম্পর্কিত তথ্যকেন্দ্র ২০২৬
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" />
              <span>{currentDateTime || "লোড হচ্ছে..."}</span>
            </span>
            <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
              AdSense Optimized ⚡
            </span>
          </div>
        </div>
      </div>

      {/* Crawling News Update Ticker */}
      <div className="bg-orange-50 dark:bg-slate-800 text-slate-800 dark:text-orange-100 border-b border-orange-200 py-1.5 px-4 overflow-hidden">
        <div className="mx-auto max-w-7xl flex items-center">
          <span className="bg-red-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-sm shrink-0 flex items-center gap-1 mr-3 animate-pulse shadow-sm">
            <Bell className="h-3.5 w-3.5 animate-bounce" />
            <span>নতুন আপডেট:</span>
          </span>
          <div className="w-full relative overflow-hidden h-5">
            <div className="absolute inset-0 flex items-center">
              <p className="text-xs md:text-sm font-medium leading-relaxed truncate animate-bg-gradient">
                {alerts[activeAlertIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation controller */}
      <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand/Logo block */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            {/* Government-inspired logo design */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-amber-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  অন্নপূর্ণা <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">ভান্ডার</span>
                </span>
                <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm">
                  ২০২৬
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Annapurna Bhandar Scheme Information Center
              </p>
            </div>
          </div>

          {/* Search bar inside header to improve SEO/AdSense feel */}
          <div className="hidden lg:flex items-center max-w-xs w-full relative">
            <input
              type="text"
              placeholder="যোজনা তথ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2 pl-3 pr-8 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute right-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Desktop links navigation & dark mode toggle */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <nav className="flex items-center gap-1.5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => {
                    setActiveTab(link.id);
                    setIsOpen(false);
                  }}
                  className={`relative rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition-all duration-300 ${
                    activeTab === link.id
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50/70 dark:hover:bg-slate-800/70 hover:text-orange-600'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {activeTab === link.id && (
                    <motion.span
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Dark mode switcher control with unique design */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Hamburger Menu & Dark mode (Mobile) and Search Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-orange-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 transition duration-300">
          <div className="mb-3 relative">
            <input
              type="text"
              placeholder="খুঁজুন (যেমন: যোগ্যতা, আধার)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2.5 pl-3 pr-8 text-gray-900 dark:text-white"
            />
            <Search className="absolute right-2.5 top-3 h-4 w-4 text-gray-400" />
          </div>
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-link-${link.id}`}
                onClick={() => {
                  setActiveTab(link.id);
                  setIsOpen(false);
                }}
                className={`relative flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  activeTab === link.id
                    ? 'text-white'
                    : 'text-gray-800 dark:text-gray-300 hover:bg-orange-50/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="relative z-10 text-[10px] font-normal opacity-70">➔</span>
                {activeTab === link.id && (
                  <motion.span
                    layoutId="activeMobileNavBackground"
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
