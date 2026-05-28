/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, BookOpen, Scale, Info, HelpCircle } from 'lucide-react';

interface LegalPagesProps {
  pageId: 'about' | 'privacy' | 'terms' | 'disclaimer';
}

export default function LegalPages({ pageId }: LegalPagesProps) {
  
  if (pageId === 'about') {
    return (
      <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
        <div className="flex items-center gap-3 border-b border-orange-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white font-bold shadow-md">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
              আমাদের সম্পর্কে (About Us)
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              অন্নপূর্ণা ভান্ডার যোজনা ২০২৬ গাইড পোর্টাল
            </p>
          </div>
        </div>

        <div className="prose prose-orange max-w-none text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed space-y-4">
          <p className="font-semibold text-slate-950 dark:text-white">
            স্বাগতম! www.annapurna-bhandar-2026.org (বা এই ইনফরমেশন পোর্টাল)-এ আসার জন্য ধন্যবাদ।
          </p>
          <p>
            আমাদের প্রধান লক্ষ্য হলো পশ্চিমবঙ্গের মা-বোনেদের কাছে অন্নপূর্ণা ভান্ডার প্রকল্প ২০২৬ সম্পর্কিত সমস্ত সঠিক নিয়াবলী, যোগ্যতা, প্রয়োজনী নথিপত্র এবং অনলাইন আবেদন করার সঠিক পদ্ধতি অত্যন্ত সহজ ভাষায় এবং নির্ভূল তথ্যসহ পৌঁছে দেওয়া।
          </p>
          <p>
            রাজ্যের সাধারণ মহিলারা যাতে কোনো রকম প্রতারণা বা বিভ্রান্তিকর তথ্যের শিকার না হন, তার জন্য আমরা ২৪ ঘণ্টা সদা জাগ্রত থেকে গুরুত্বপূর্ণ পেমেন্ট আপডেট এবং নতুন সরকারি ঘোষণাগুলি সংগ্রহ করে এখানে নিয়মিত প্রকাশ করি।
          </p>
          <div className="bg-orange-50 dark:bg-slate-850 p-4 rounded-lg border-l-4 border-orange-500 text-gray-700 dark:text-gray-350">
            📌 <span className="font-bold">গুরুত্বপূর্ণ ঘোষণা:</span> অনুগ্রহ করে মনে রাখবেন এটি একটি <strong>বেসরকারী তথ্যনির্ভর গাইড পোর্টাল</strong>। এটি সরাসরি পশ্চিমবঙ্গ সরকার বা নারী ও শিশু পুষ্টি কল্যাণ দপ্তরের দ্বারা পরিচালিত কোনো অফিসিয়াল ওয়েবসাইট নয়। আমরা কেবল সাধারণ জনস্বার্থে সরকারি ও গণমাধ্যমে প্রকাশিত খবরের ভিত্তিতে মানুষকে সাহায্য করার ছোট প্রচেষ্টা মাত্র।
          </div>
          <p>
            আমাদের পোর্টালে ব্যবহৃত সমস্ত তথ্যের সত্যতা যাচাইয়ের জন্য অনুগ্রহ করে পশ্চিমবঙ্গ সরকারের অফিসিয়াল পোর্টালেই চোখ রাখুন। কোনো সমস্যা বা অনুসন্ধানের জন্য আপনার এলাকার স্থানীয় বিডিও (BDO) অফিসে যোগাযোগ করতে পারেন।
          </p>
        </div>
      </div>
    );
  }

  if (pageId === 'privacy') {
    return (
      <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
        <div className="flex items-center gap-3 border-b border-orange-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white font-bold shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
              গোপনীয়তা নীতি (Privacy Policy)
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              User Privacy and Security Guidelines
            </p>
          </div>
        </div>

        <div className="prose prose-orange max-w-none text-slate-850 dark:text-slate-200 text-xs md:text-sm leading-relaxed space-y-4">
          <p>
            এই পোর্টালে আপনার গোপনীয়তা রক্ষা করা আমাদের প্রথম দায়িত্ব। আমরা কি ধরনের তথ্য সংগ্রহ করি এবং তা কিভাবে ব্যবহার করি তা নিচে দেওয়া হলো:
          </p>
          <h4 className="font-bold text-slate-950 dark:text-white text-sm">১. কুকিজ ও থার্ড-পার্টি বিজ্ঞাপন (AdSense):</h4>
          <p>
            এই ওয়েবসাইটটি থার্ড-পার্টি বিজ্ঞাপনী সংস্থা (যেমন Google AdSense) ব্যবহার করে বিজ্ঞাপন প্রচার করে থাকে। গুগল সহ অন্য বিজ্ঞাপনী নেটওয়ার্কগুলি তাদের কুকিজ ব্যবহার করে পূর্ববর্তী ভিজিটরদের গতিবিধির ওপর ট্র্যাকিং করে প্রাসঙ্গিক ও পছন্দসই বিজ্ঞাপন প্রচার করে থাকে। আপনি চাইলে ব্রাউজারের সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন।
          </p>
          <h4 className="font-bold text-slate-950 dark:text-white text-sm">২. বেনিফিশিয়ারি ডেটা নিরাপত্তা:</h4>
          <p>
            আমাদের ইন্টারেক্টিভ যোগ্যতা ক্যালকুলেটর বা স্ট্যাটাস চেকার সম্পূর্ণ প্রাক্টিস ও সেমিউলেশন ভিত্তিক। এর মাধ্যমে আপনার দেওয়া কোনো আধার নম্বর বা পারসোনাল আইডি আমাদের কোনো সার্ভারে সংরক্ষণ করা হয় না। আপনার টাইপ করা তথ্য সাথে সাথে রিফ্রেশ করার পর হারিয়ে যায় এবং ১০০% সুরক্ষিত থাকে।
          </p>
          <h4 className="font-bold text-slate-950 dark:text-white text-sm">৩. এক্সটার্নাল লিংক:</h4>
          <p>
            এই পোর্টালে বিভিন্ন সরকারি গুরুত্বপূর্ণ ওয়েবসাইট ও ফর্ম ডাউনলোডের বাহ্যিক ইউআরএল থাকতে পারে। আমরা সেই সমস্ত থার্ড পার্টি ওয়েবসাইটের গোপনীয়তা নীতি বা তথ্যের সত্যতার জন্য দায়বদ্ধ নই। যেকোনো বাহ্যিক লিঙ্ক খোলার সময় সদ্ব্যবহার করুন।
          </p>
        </div>
      </div>
    );
  }

  if (pageId === 'terms') {
    return (
      <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
        <div className="flex items-center gap-3 border-b border-orange-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white font-bold shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
              ব্যবহারের নির্দেশাবলি (Terms & Conditions)
            </h3>
            <p className="text-xs text-gray-405 dark:text-gray-400">
              Standard User Usage Agreement
            </p>
          </div>
        </div>

        <div className="prose prose-orange max-w-none text-slate-850 dark:text-slate-200 text-xs md:text-sm leading-relaxed space-y-4">
          <p>
            এই ওয়েবসাইট বা মোবাইল পোর্টালটি ব্যবহার করার পূর্বে অনুগ্রহ করে ব্যবহারের সাধারণ শর্তাবলী সাবধানে পড়ুন:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>আমাদের পোর্টালে প্রকাশিত তথ্যসমূহ কেবল শিক্ষামূলক ও সচেতনতামূলক উদ্দেশ্যে তৈরি করা হয়েছে।</li>
            <li>অনলাইন পোর্টালে দেওয়া যেকোনো ফর্মের কপি বা স্ট্যাটাস তথ্যের জন্য সরকারি প্রধান গেজেট বা নিয়াবলী মূল রেফারেন্স হিসেবে গণ্য হবে।</li>
            <li>আমাদের পোর্টালে প্রচারিত তথ্যে অনিচ্ছাকৃত ভুলত্রুটি থাকলে কর্তৃপক্ষ তার দায় বহন করবে না, তবে পরামর্শ দিলে তা সংশোধন করা হবে।</li>
            <li>এখানে দেওয়া কমেন্ট বা আলোচনা বোর্ডে কোনো আপত্তিকর বা অশালীন ভাষা ব্যবহার করা সম্পূর্ণ নিষিদ্ধ। অপরাধমূলক আচরণের ক্ষেত্রে আইনি ব্যবস্থা নেওয়া হতে পারে।</li>
          </ul>
        </div>
      </div>
    );
  }

  // Disclaimer Section
  return (
    <div className="rounded-2xl border border-red-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
      <div className="flex items-center gap-3 border-b border-red-100 dark:border-slate-855 pb-4 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-655 text-white font-bold shadow-md bg-gradient-to-tr from-red-600 to-orange-500">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
            অস্বীকৃতিপত্র / দায়মুক্তি (Disclaimer)
          </h3>
          <p className="text-xs text-gray-400">
            Legal Disclaimer for Public Awareness
          </p>
        </div>
      </div>

      <div className="prose prose-orange max-w-none text-slate-850 dark:text-slate-200 text-xs md:text-sm leading-relaxed space-y-4 bg-orange-50/20 dark:bg-slate-950/20 p-5 rounded-xl border-l-4 border-red-500">
        <p className="font-bold text-red-600 dark:text-red-400 text-sm md:text-base">
          ⚠️ অতি গুরুত্বপূর্ণ আইনি ঘোষণা (Legal Warning)
        </p>
        <p>
          ১. এই ওয়েবসাইটটি <strong>অন্নপূর্ণা ভান্ডার যোজনা ২০২৬</strong> সম্পর্কিত সামাজিক সচেতনতা সৃষ্টির লক্ষ্যে তৈরিকৃত একটি নির্দেশিকা পোর্টাল মাত্র। 
        </p>
        <p>
          ২. আমরা নিশ্চিত করছি যে, এই পোর্টালটির সাথে <strong>পশ্চিমবঙ্গ সরকার, কেন্দ্রীয় সরকার বা অন্য কোনো রাজ্য সরকারি দপ্তরের কোনো প্রাতিষ্ঠানিক সম্পর্ক নেই</strong>, এবং এটি পশ্চিমবঙ্গ সরকারের কোনো অফিসিয়াল ওয়েবসাইট নয়।
        </p>
        <p>
          ৩. আমরা সমস্ত তথ্য সংগ্রহ করি সরকারি বিজ্ঞপ্তি, নির্ভরযোগ্য প্রেস রিলিজ এবং সংবাদপত্র থেকে। যেকোনো স্কিমে আবেদন করার আগে আপনার নিজের স্বার্থে অনুগ্রহ করে অফিশিয়াল ওয়েবসাইট থেকে প্রকল্প গাইডলাইনটি মিলিয়ে নিশ্চিত হয়ে নিন।
        </p>
        <p>
          ৪. <strong>মনে রাখবেন:</strong> আবেদন বা আবেদনের কোনো ট্র্যাকিং করতে কখনো কোনো টাকা লেনদেন করবেন না। বা কোনো অজ্ঞাতপরিচয় ব্যক্তির সাথে আধার বা ওটিপি শেয়ার করবেন না।
        </p>
      </div>
    </div>
  );
}
