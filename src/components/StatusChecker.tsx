/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Calendar, 
  ClipboardCheck, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  Smartphone, 
  FileText, 
  Building, 
  Search, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function StatusChecker() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const officialSteps = [
    {
      title: "১. অফিসিয়াল সরকারি পোর্টাল ব্যবহার করুন (Official Web Portal)",
      description: "প্রথমে রাজ্য সরকারের নিজস্ব অফিসিয়াল পোর্টালে (wb.gov.in) ভিজিট করুন। সেখানে 'Track Application' বা 'অ্যাপ্রুভাল সিকিউরিটি' ট্যাবে গিয়ে আপনার প্রাপ্ত রেজিস্ট্রেশন নম্বর বা রেজিস্টার্ড মোবাইল নম্বর দিয়ে ওটিপি দিয়ে নিরাপদে লগইন করে স্ট্যাটাস চেক করুন।"
    },
    {
      title: "২. মোবাইলের এসএমএস ইনবক্স পরীক্ষা করুন (SMS Notification Alert)",
      description: "অন্নপূর্ণা ভান্ডার যোজনার টাকা ব্যাংক অ্যাকাউন্টে জমা হওয়া মাত্রই সরকারের ডিরেক্ট বেনিফিট ট্রান্সফার (DBT) সেল থেকে আপনার রেজিস্টার্ড মোবাইল নম্বরে SMS (যেমন- 'Your DBT payment of ₹3000 is credited...') পাঠানো হয়। আপনার মোবাইলের SMS ইনবক্স নিয়মিত চেক করুন।"
    },
    {
      title: "৩. ব্যাংক পাসবই আপডেট করুন (Bank Passbook Update)",
      description: "সবচেয়ে নির্ভরযোগ্য পদ্ধতি হলো সরাসরি আপনার নির্দিষ্ট ব্যাংক শাখায় বা নিকটবর্তী সিএসপি (CSP) গ্রাহক সেবা কেন্দ্রে গিয়ে আপনার ব্যাংক পাসবইটি প্রিন্ট বা আপডেট করে নেওয়া। মে বা জুন মাসের সরকারি DBT বা অন্নপূর্ণা স্কিমের ক্রেডিট এন্ট্রি সেখানে সহজেই দেখতে পাবেন।"
    },
    {
      title: "৪. নিকটবর্তী সরকারি ক্যাম্প বা কার্যালয়ে যোগাযোগ (BDO/Municipality Help Desk)",
      description: "যদি কোনো কারণে অনলাইন তথ্য না পাওয়া যায়, তবে আপনার এলাকার পঞ্চায়েত অফিস, ব্লক ডেভলপমেন্ট অফিস (BDO Office) অথবা দুয়ারে সরকারের হেল্প ডেস্কে আপনার ভোটার আইডি, আবেদনপত্র এবং আধার নম্বর নিয়ে সরাসরি যোগাযোগ করুন। সেখানে দায়িত্বরত আধিকারিকগণ সরাসরি অফিশিয়াল ডাটাবেজ থেকে আপনার তথ্য যাচাই করে দেবেন।"
    }
  ];

  const dbtFAQs = [
    {
      q: "আমি কীভাবে নিশ্চিত হবো যে আমার ব্যাংক অ্যাকাউন্টে অন্নপূর্ণা ভান্ডারের টাকা সরাসরি আসবে?",
      a: "আপনার ব্যাংক অ্যাকাউন্টের সাথে আধার কার্ড ও মোবাইল নম্বর আধার সিডিং (NPCI Mapping) সচল থাকতে হবে। ব্যাংকে গিয়ে 'ডিবিটি ইনাবল্ড' (DBT Enabled) ফরম জমা করার মাধ্যমে এটি সচল করা যায়।"
    },
    {
      q: "টাকা চেক করার জন্য এই ওয়েবসাইটে কি কোনো আধার নম্বর বা ব্যক্তিগত তথ্য দিতে হবে?",
      a: "না। সরকারি নির্দেশিকা ও গোপনীয়তা রক্ষা আইন অনুযায়ী নাগরিকদের সুরক্ষা নিশ্চিত করতে আমরা কোনো ব্যক্তিগত তথ্য, আধার নম্বর বা ব্যাংক খতিয়ান সংগ্রহ করি না। স্ট্যাটাস চেক করার সঠিক সরকারি পদ্ধতি ও গাইডলাইন আমরা এখানে বিস্তারিত প্রদান করেছি।"
    },
    {
      q: "মোবাইলে SMS না আসলে কি বুঝবো টাকা ঢোকেনি?",
      a: "অনেক সময় মোবাইল টাওয়ার বা সার্ভার জ্যামের কারণে SMS আসতে না-ও পারে। সেক্ষেত্রে সরাসরি ব্যাংক একাউন্টের ব্যালেন্স ও মিনি স্টেটমেন্ট চেক করা সবচেয়ে সহজ পথ।"
    }
  ];

  return (
    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md space-y-8">
      
      {/* Dynamic Header */}
      <div className="flex items-center gap-3 border-b border-orange-100 dark:border-slate-800 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-md bg-gradient-to-tr from-red-600 to-orange-500 shrink-0">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-sans text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
            অন্নপূর্ণা ভান্ডার পেমেন্ট স্ট্যাটাস চেক করার সম্পূর্ণ নির্দেশিকা
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            নিরাপদে ও সঠিক সরকারি নিয়ম মেনে কীভাবে আপনার আবেদনের স্থিতি জানবেন তার বিবরণ
          </p>
        </div>
      </div>

      {/* Safety Notice Warning Banner */}
      <div className="rounded-2xl p-4 bg-orange-50/60 dark:bg-slate-950/40 border border-orange-200/50 dark:border-slate-800 flex items-start gap-3.5">
        <ShieldCheck className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">
            গুরুত্বপূর্ণ আইনি ও নিরাপত্তা ঘোষণা (Important Compliance & Safety Notice)
          </h4>
          <p className="text-xs text-slate-650 dark:text-gray-300 leading-relaxed font-medium">
            নাগরিকদের যেকোনো প্রকার ডেটা লিকেজ বা সাইবার জালিয়াতি থেকে সম্পূর্ণ সুরক্ষিত রাখতে এই পোর্টালে 
            কোনো নাগরিকের <strong>ব্যক্তিগত আইডি কার্ড, ব্যাংক নম্বর, নাম বা রিয়েলটাইম সরকারি পেন্ডিং স্ট্যাটাস</strong> 
            প্রদর্শন বা ইনপুট নেওয়া হয় না। আমরা সর্বদা সরকারি নিয়ম এবং গোপনীয়তা সুরক্ষাকে সর্বোচ্চ প্রাধান্য দিয়ে থাকি। 
            পেমেন্টের অবস্থা জানার সঠিক ও আইনসম্মত পদ্ধতিগুলি নিচে বিশদভাবে বর্ণনা করা হলো।
          </p>
        </div>
      </div>

      {/* Core Educational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Step-by-Step Info Section */}
        <div className="lg:col-span-7 space-y-6">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            <span>আপনার পেমেন্ট চেক করার ৪টি সহজ ও আইনসম্মত উপায়:</span>
          </h4>

          <div className="space-y-4">
            {officialSteps.map((step, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-gray-150 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-950/25 space-y-1.5 transition hover:border-orange-200 dark:hover:border-slate-800"
              >
                <h5 className="text-xs md:text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-slate-850 text-orange-600 dark:text-orange-400 text-[10px] font-black shrink-0">
                    {idx + 1}
                  </span>
                  {step.title}
                </h5>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed pl-7">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Verification Side Guidance */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Bank Checklist */}
          <div className="border border-orange-100/60 dark:border-slate-850 p-5 rounded-2xl bg-orange-50/5 dark:bg-slate-950/10 space-y-5">
            <h4 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>ব্যাংক পেমেন্ট ক্লিয়ারেন্স চেকলিস্ট</span>
            </h4>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-gray-300">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>আপনার ব্যাংক অ্যাকাউন্টটি একটি 'সিঙ্গেল সেভিংস অ্যাকাউন্ট' (Single Account) হওয়া আবশ্যক।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>ব্যাংক অ্যাকাউন্টে KYC সচল থাকতে হবে যাতে লেনদেন কোনোভাবে আটকে না যায়।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>ডিবিটি (DBT) বা আধার সক্রিয় পেমেন্ট মোড অবশ্যই এনাবল থাকতে হবে।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>ব্যাংকের সাথে আপনার যে মোবাইল নম্বরটি লিংকড রয়েছে তা চালু আছে তা নিশ্চিত করুন।</span>
              </div>
            </div>

            {/* Official Portal Redirect Alert */}
            <div className="pt-3 border-t border-orange-100/50 dark:border-slate-850">
              <a 
                href="https://wb.gov.in" 
                target="_blank" 
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-black text-white hover:bg-orange-700 transition shadow-xs cursor-pointer"
              >
                <span>অফিসিয়াল রাজ্যের পোর্টালে যান</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="block text-center text-[10px] text-gray-400 mt-2">
                *আপনাকে অফিসিয়াল সরকারি ডিরেক্টরি সাইটে রিডাইরেক্ট করবে।
              </span>
            </div>
          </div>

          {/* Quick FAQ accordion */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-orange-500" />
              <span>জিজ্ঞাসিত প্রশ্ন উত্তর (FAQ)</span>
            </h4>

            <div className="space-y-2">
              {dbtFAQs.map((faq, idx) => (
                <div key={idx} className="border border-gray-150 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex justify-between items-center p-3 text-left bg-gray-50 dark:bg-slate-950/40 text-slate-850 dark:text-white font-bold text-xs"
                  >
                    <span>{faq.q}</span>
                    <span className="text-orange-500 shrink-0 font-extrabold ml-2">
                      {activeAccordion === idx ? '−' : '+'}
                    </span>
                  </button>
                  {activeAccordion === idx && (
                    <div className="p-3 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-gray-400 leading-relaxed border-t border-gray-150 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
