/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export default function EligibilityChecker() {
  const [formData, setFormData] = useState({
    age: '25',
    gender: 'female',
    resident: 'yes',
    govJob: 'no',
    familyIncome: 'below3',
    caste: 'general',
  });

  const [result, setResult] = useState<{
    status: 'eligible' | 'not-eligible' | null;
    message: string;
    amount?: string;
    reason?: string[];
  }>({ status: null, message: '' });

  const handleCheck = (e: FormEvent) => {
    e.preventDefault();
    const reasons: string[] = [];
    const ageNum = parseInt(formData.age, 10);

    // Evaluate conditions
    const isFemale = formData.gender === 'female';
    const isResident = formData.resident === 'yes';
    const isNoGovJob = formData.govJob === 'no';
    const acceptableIncome = formData.familyIncome === 'below1' || formData.familyIncome === 'below3';
    const ageOk = ageNum >= 18 && ageNum <= 60;

    if (!isFemale) reasons.push("শুধুমাত্র নারী আবেদনকারীরাই এই প্রকল্পের জন্য যোগ্য।");
    if (!isResident) reasons.push("শুধুমাত্র পশ্চিমবঙ্গের স্থায়ী বাসিন্দারাই অন্নপূর্ণা ভান্ডারের সুবিধা পাবেন।");
    if (!ageOk) reasons.push("আবেদনকারীর বয়স অবশ্যই ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে (আপনার বয়স: " + formData.age + " বছর)।");
    if (!isNoGovJob) reasons.push("পরিবারের কোনো সদস্য সরকারি চাকরিজীবী হলে আবেদন গ্রাহ্য করা হবে না।");
    if (!acceptableIncome) reasons.push("বার্ষিক পারিবারিক আয় ৩ লক্ষ টাকার কম হতে হবে।");

    if (reasons.length === 0) {
      setResult({
        status: 'eligible',
        message: "অভিনন্দন! আপনি 'অন্নপূর্ণা ভান্ডার যোজনা ২০২৬'-এর সমস্ত নিয়ম অনুযায়ী সম্পূর্ণ যোগ্য।",
        amount: "₹৩,০০০ প্রতি মাসে",
      });
    } else {
      setResult({
        status: 'not-eligible',
        message: "দুঃখিত! আপনি প্রকল্পের বর্তমান গাইডলাইন অনুযায়ী আবেদনের যোগ্য নন।",
        reason: reasons,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-md">
      <div className="flex items-center gap-3 border-b border-orange-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white font-bold shadow-md">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-sans text-xl font-bold text-slate-900 dark:text-white">
            অন্নপূর্ণা ভান্ডার যোগ্যতা নিরূপক ২০২৬ (Eligibility Checker)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            সরকারি নিয়ম অনুযায়ী আপনার নিজস্ব প্রোফাইল পরীক্ষা করুন ১ মিনিটে
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <form onSubmit={handleCheck} className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              ১. আপনার সঠিক বয়স কত? (Age)
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData( { ...formData, age: e.target.value })}
              min="1"
              max="120"
              className="w-full text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2.5 px-3 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              ২. আবেদনকারীর লিঙ্গ (Gender)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${formData.gender === 'female' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 font-semibold' : 'border-gray-300 dark:border-slate-700'}`}>
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'female'}
                  onChange={() => setFormData({ ...formData, gender: 'female' })}
                  className="accent-orange-600"
                />
                <span className="text-sm">মহিলা (Female)</span>
              </label>
              <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${formData.gender === 'male' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 font-semibold' : 'border-gray-300 dark:border-slate-700'}`}>
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'male'}
                  onChange={() => setFormData({ ...formData, gender: 'male' })}
                  className="accent-orange-600"
                />
                <span className="text-sm">পুরুষ (Male)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              ৩. আপনি কি পশ্চিমবঙ্গের স্থায়ী বাসিন্দা? (West Bengal Resident)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${formData.resident === 'yes' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 font-semibold' : 'border-gray-300 dark:border-slate-700'}`}>
                <input
                  type="radio"
                  name="resident"
                  checked={formData.resident === 'yes'}
                  onChange={() => setFormData({ ...formData, resident: 'yes' })}
                  className="accent-orange-600"
                />
                <span className="text-sm">হ্যাঁ (Yes)</span>
              </label>
              <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${formData.resident === 'no' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 font-semibold' : 'border-gray-300 dark:border-slate-700'}`}>
                <input
                  type="radio"
                  name="resident"
                  checked={formData.resident === 'no'}
                  onChange={() => setFormData({ ...formData, resident: 'no' })}
                  className="accent-orange-600"
                />
                <span className="text-sm">না (No)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              ৪. পরিবারের কেউ কি সরকারি স্থায়ী কাজ করেন? (Govt. Pension / Job)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${formData.govJob === 'yes' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 font-semibold' : 'border-gray-300 dark:border-slate-700'}`}>
                <input
                  type="radio"
                  name="govJob"
                  checked={formData.govJob === 'yes'}
                  onChange={() => setFormData({ ...formData, govJob: 'yes' })}
                  className="accent-orange-600"
                />
                <span className="text-sm">হ্যাঁ (Yes)</span>
              </label>
              <label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${formData.govJob === 'no' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 font-semibold' : 'border-gray-300 dark:border-slate-700'}`}>
                <input
                  type="radio"
                  name="govJob"
                  checked={formData.govJob === 'no'}
                  onChange={() => setFormData({ ...formData, govJob: 'no' })}
                  className="accent-orange-600"
                />
                <span className="text-sm">না (No)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              ৫. বার্ষিক পারিবারিক আয় কত? (Annual Family Income)
            </label>
            <select
              value={formData.familyIncome}
              onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
              className="w-full text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2.5 px-3 text-gray-900 dark:text-white focus:outline-hidden"
            >
              <option value="below1">১ লক্ষ টাকার নিচে</option>
              <option value="below3">১ লক্ষ থেকে ৩ লক্ষ টাকার মধ্যে</option>
              <option value="above3">৩ লক্ষ টাকার উপরে</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              ৬. জাতিগত শ্রেণী (Caste Category)
            </label>
            <select
              value={formData.caste}
              onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
              className="w-full text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2.5 px-3 text-gray-900 dark:text-white focus:outline-hidden"
            >
              <option value="general">সাধারণ জেনারেল শ্রেণী (General / OBC)</option>
              <option value="sc">তফসিলি জাতি (Scheduled Caste - SC)</option>
              <option value="st">তফসিলি উপজাতি (Scheduled Tribe - ST)</option>
            </select>
          </div>

          <button
            id="calculate-eligibility-btn"
            type="submit"
            className="w-full transition transform active:scale-95 cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-md hover:opacity-95"
          >
            যোগ্যতা গণনা করুন (Check Qualification)
          </button>
        </form>

        {/* Results Side */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {result.status === null ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-orange-50/50 dark:bg-slate-850 p-6 md:p-10 text-center border border-dashed border-orange-200">
              <Calculator className="h-12 w-12 text-orange-400 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                ফলাফল দেখার অপেক্ষায়...
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                বামদিকের ফর্মে আপনার তথ্যগুলি পূরণ করুন এবং &apos;যোগ্যতা গণনা করুন&apos; বাটনে ক্লিক করে ফলাফল দেখুন।
              </p>
            </div>
          ) : result.status === 'eligible' ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-6 border-2 border-emerald-500 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white mb-4">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-2">
                আবেদনের যোগ্য!
              </h4>
              <p className="text-sm text-gray-700 dark:text-emerald-100 leading-relaxed font-semibold mb-4">
                {result.message}
              </p>

              <div className="rounded-lg bg-white dark:bg-slate-800 p-4 border border-emerald-100 dark:border-slate-700 mb-4">
                <div className="text-xs text-gray-400 mb-0.5 uppercase font-medium">আপনার মাসিক প্রদেয় সহায়তা:</div>
                <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{result.amount}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">₹৩০০০ টাকা সরাসরি ব্যাংক একাউন্টে ট্রান্সফার হবে (DBT)</div>
              </div>

              <div className="bg-emerald-600/10 rounded-lg p-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>আপনি আজই অনলাইন আবেদন ট্যাবে গিয়ে প্রয়োজনীয় নথিপত্রসহ আবেদন করতে পারেন।</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-6 border-2 border-red-500 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white mb-4">
                <AlertTriangle className="h-7 w-7 animate-bounce" />
              </div>
              <h4 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">
                আদালত অযোগ্যতা!
              </h4>
              <p className="text-sm text-gray-700 dark:text-red-200 leading-relaxed font-semibold mb-4">
                {result.message}
              </p>

              <div className="rounded-lg bg-red-50/50 dark:bg-slate-800 p-4 border border-red-100 dark:border-slate-705 mb-4 space-y-2">
                <div className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1.5 uppercase">
                  <AlertCircle className="h-4 w-4" />
                  <span>বাতিলের কারণসমূহ:</span>
                </div>
                {result.reason?.map((r, i) => (
                  <div key={i} className="flex gap-2 text-xs text-gray-7 coordinate-gray font-medium text-gray-600 dark:text-gray-350">
                    <span className="text-red-500 font-black">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                গাইডলাইনগুলি সংশোধন হতে পারে। আপনি যদি মনে করেন এই ফলাফল ভুল, তবে আপনার নিকটবর্তী ব্লক ডেভেলপমেন্ট অফিসে (BDO Office) যোগাযোগ করুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
