/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { AdSetting } from '../types';

interface BannerAdsProps {
  ad: AdSetting;
  className?: string;
}

export default function BannerAds({ ad, className = "" }: BannerAdsProps) {
  const [clickCount, setClickCount] = useState(0);
  const [feedback, setFeedback] = useState(false);

  if (!ad) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClickCount(prev => prev + 1);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2500);
  };

  // If raw AdSense Code snippet is configured and active, render it directly
  if ((ad as any).code && (ad as any).code.trim() !== "") {
    return (
      <div 
        id={`ad-slot-${ad.id}`} 
        className={`w-full overflow-hidden my-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: (ad as any).code }} 
      />
    );
  }

  if (ad.type === 'leaderboard') {
    return (
      <div id={`ad-slot-${ad.id}`} className={`relative w-full overflow-hidden rounded-xl border-2 border-dashed border-orange-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 transition-all hover:border-orange-300 md:p-5 ${className}`}>
        {/* Ad Label */}
        <div className="absolute top-1 right-2 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-orange-600">
          <span>SPONSORED AD / বিজ্ঞাপন</span>
          <Info className="h-3 w-3" />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6 pt-1">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 font-bold text-white shadow-md">
              Ad
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-gray-800 md:text-base leading-tight">
                {ad.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                AdSense High-CTR Responsive Link Unit
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={ad.linkUrl}
              onClick={handleAdClick}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-transform hover:scale-105"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-orange-600/95 text-xs font-bold text-white">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Ad URL Intercepted! Custom tracking: Simulated click recorded ({clickCount})</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar or In-article ad box
  return (
    <div id={`ad-slot-${ad.id}`} className={`relative overflow-hidden rounded-xl border-2 border-dashed border-red-200 bg-white p-4 transition-all hover:border-red-300 shadow-xs ${className}`}>
      {/* Ad Label */}
      <div className="absolute top-1.5 right-2 flex items-center gap-1 text-[10px] font-bold text-red-600">
        <span>SPONSORED AD</span>
        <Info className="h-3 w-3" />
      </div>

      <div className="mb-2">
        <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          রিয়েল টাইম স্পনসর
        </span>
      </div>

      <h4 className="font-sans text-sm font-bold text-gray-900 leading-snug">
        {ad.title}
      </h4>

      <p className="my-2.5 text-xs text-gray-600">
        Google AdSense-এর নিয়মাবলি মেনে সর্বোচ্চ রেভিনিউ জেনারেট করার জন্য এই স্লটটি ডিজাইন করা হয়েছে।
      </p>

      <a
        href={ad.linkUrl}
        onClick={handleAdClick}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-center text-xs font-bold text-white transition-opacity hover:opacity-90"
      >
        <span>{ad.ctaText}</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      {feedback && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-600/95 px-3 text-center text-xs font-bold text-white">
          <div className="flex flex-col items-center gap-1">
            <AlertCircle className="h-5 w-5 animate-bounce" />
            <span>Simulated Ad click tracked!</span>
            <span className="text-[10px] font-normal">Saves CTR data locally.</span>
          </div>
        </div>
      )}
    </div>
  );
}
