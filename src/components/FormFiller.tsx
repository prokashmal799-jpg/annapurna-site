import React, { useState } from 'react';
import { 
  User, CreditCard, Home, Banknote, FileText, Users, 
  Sparkles, Download, Printer, Eye, Trash2, Plus, 
  ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle, Info,
  HeartPulse, GraduationCap
} from 'lucide-react';

interface ChildSchoolInfo {
  id: string;
  name: string;
  className: string;
  schoolName: string;
  schoolType: string;
}

interface FamilyMember {
  id: string;
  name: string;
  dob: string;
  gender: string;
  relation: string;
  aadhaar: string;
  annapurnaEligible: boolean;
  bankName: string;
  accountNo: string;
  ifsc: string;
  epicNo: string;
  constituency: string;
  employmentType: string;
  panNo: string;
}

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: 'hof',
    name: '',
    dob: '',
    gender: 'female',
    relation: 'পরিবারের প্রধান (HOF)',
    aadhaar: '',
    annapurnaEligible: true,
    bankName: '',
    accountNo: '',
    ifsc: '',
    epicNo: '',
    constituency: '',
    employmentType: 'unorganized',
    panNo: ''
  }
];

export default function FormFiller() {
  const [activeStep, setActiveStep] = useState(1);
  const [hofName, setHofName] = useState('');
  const [hofDob, setHofDob] = useState('');
  const [hofGender, setHofGender] = useState('female');
  const [hofAadhaar, setHofAadhaar] = useState('');
  const [rationCardNo, setRationCardNo] = useState('');
  const [rationType, setRationType] = useState('SPHH');
  const [familyCount, setFamilyCount] = useState<number>(3);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // Section B
  const [hasRationCard, setHasRationCard] = useState('yes');
  const [drawsMonthlyRation, setDrawsMonthlyRation] = useState('yes');
  
  // Section C: Assets
  const [hasPakaHouse, setHasPakaHouse] = useState('no');
  const [ownsLand, setOwnsLand] = useState('no');
  const [landDecimal, setLandDecimal] = useState('');
  const [hasVehicle, setHasVehicle] = useState('no');
  const [vehicleRegNo, setVehicleRegNo] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [hasHealthInsurance, setHasHealthInsurance] = useState('no');

  // Section D: Income
  const [paysTax, setPaysTax] = useState('no');
  const [annualIncome, setAnnualIncome] = useState('48000');

  // Section E: Identity & Other
  const [caaStatus, setCaaStatus] = useState('not_applicable');
  const [caaNo, setCaaNo] = useState('');
  const [hasKcc, setHasKcc] = useState('no');
  const [kccDetails, setKccDetails] = useState('');
  const [hasSirDispute, setHasSirDispute] = useState('no');
  const [sirDisputeDetails, setSirDisputeDetails] = useState('');

  // Members Dynamic list
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  
  // Children School info list
  const [childrenSchoolList, setChildrenSchoolList] = useState<ChildSchoolInfo[]>([]);

  // DBT scheme details
  const [receivedDbtSchemes, setReceivedDbtSchemes] = useState<string[]>([]);

  // Toast / Status state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showBlankFormPreview, setShowBlankFormPreview] = useState(false);

  // Auto-fill mock realistic database with Bengali context for easy test
  const handleAutoFillDemo = () => {
    setHofName('রূপা খাতুন');
    setHofDob('1984-04-12');
    setHofGender('female');
    setHofAadhaar('5432 1098 7654');
    setRationCardNo('DRC9876543');
    setRationType('SPHH');
    setFamilyCount(3);
    setAddress('গ্রাম: পলশন্ডা, পো: রঘুনাথগঞ্জ, জেলা: মুর্শিদাবাদ, পশ্চিমবঙ্গ - ৭৪২২২৫');
    setPhone('৯৮৭৬৫৪৩২১০');

    setHasRationCard('yes');
    setDrawsMonthlyRation('yes');

    setHasPakaHouse('no');
    setOwnsLand('yes');
    setLandDecimal('১২');
    setHasVehicle('no');
    setHasHealthInsurance('yes');

    setPaysTax('no');
    setAnnualIncome('৩৬০০০');

    setCaaStatus('not_applicable');
    setHasKcc('yes');
    setKccDetails('KCC-WB-2026-9876');
    setHasSirDispute('no');

    // Populate family members
    setFamilyMembers([
      {
        id: 'hof',
        name: 'রূপা খাতুন',
        dob: '1984-04-12',
        gender: 'female',
        relation: 'পরিবারের প্রধান (HOF)',
        aadhaar: '5432 1098 7654',
        annapurnaEligible: true,
        bankName: 'State Bank of India',
        accountNo: '34455667788',
        ifsc: 'SBIN0001234',
        epicNo: 'WB/04/023/123456',
        constituency: 'রঘুনাথগঞ্জ - ৫৪',
        employmentType: 'unorganized',
        panNo: 'AXDPK4560H'
      },
      {
        id: 'mb_1',
        name: 'আরিফ শেখ',
        dob: '1980-07-22',
        gender: 'male',
        relation: 'স্বামী (Husband)',
        aadhaar: '8765 4321 0987',
        annapurnaEligible: false,
        bankName: 'State Bank of India',
        accountNo: '31122334455',
        ifsc: 'SBIN0001234',
        epicNo: 'WB/04/023/123457',
        constituency: 'রঘুনাথগঞ্জ - ৫৪',
        employmentType: 'unorganized',
        panNo: ''
      },
      {
        id: 'mb_2',
        name: 'সাবিনা ইয়াসমিন',
        dob: '2015-05-15',
        gender: 'female',
        relation: 'কন্যা (Daughter)',
        aadhaar: '9876 5432 1012',
        annapurnaEligible: true,
        bankName: '',
        accountNo: '',
        ifsc: '',
        epicNo: '',
        constituency: '',
        employmentType: 'unemployed',
        panNo: ''
      }
    ]);

    setChildrenSchoolList([
      {
        id: 'ch_1',
        name: 'সাবিনা ইয়াসমিন',
        className: 'চতুর্থ শ্রেণী',
        schoolName: 'পলশন্ডা প্রাথমিক বিদ্যালয়',
        schoolType: 'government'
      }
    ]);

    setReceivedDbtSchemes(['লক্ষ্মীর ভান্ডার (Laxmir Bhandar)', 'বিনামূল্যে রেশন (Free Ration)']);

    setToastMessage('✅ বাংলায় সমস্ত নমুনা তথ্য সফলভাবে ডেমো ফর্মের মধ্যে ফিল আপ করা হয়েছে!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddField = () => {
    const newId = `mb_${Date.now()}`;
    setFamilyMembers([
      ...familyMembers,
      {
        id: newId,
        name: '',
        dob: '',
        gender: 'female',
        relation: '',
        aadhaar: '',
        annapurnaEligible: false,
        bankName: '',
        accountNo: '',
        ifsc: '',
        epicNo: '',
        constituency: '',
        employmentType: 'unemployed',
        panNo: ''
      }
    ]);
  };

  const handleRemoveField = (id: string) => {
    if (id === 'hof') return;
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const updateMember = (id: string, field: keyof FamilyMember, val: any) => {
    setFamilyMembers(
      familyMembers.map(m => {
        if (m.id === id) {
          return { ...m, [field]: val };
        }
        return m;
      })
    );
  };

  const handleAddChildSchool = () => {
    setChildrenSchoolList([
      ...childrenSchoolList,
      {
        id: `ch_${Date.now()}`,
        name: '',
        className: '',
        schoolName: '',
        schoolType: 'government'
      }
    ]);
  };

  const handleRemoveChildSchool = (id: string) => {
    setChildrenSchoolList(childrenSchoolList.filter(c => c.id !== id));
  };

  const updateChildSchool = (id: string, field: keyof ChildSchoolInfo, val: string) => {
    setChildrenSchoolList(
      childrenSchoolList.map(c => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  };

  const handleSchemeCheckbox = (name: string) => {
    if (receivedDbtSchemes.includes(name)) {
      setReceivedDbtSchemes(receivedDbtSchemes.filter(s => s !== name));
    } else {
      setReceivedDbtSchemes([...receivedDbtSchemes, name]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setHofName('');
    setHofDob('');
    setHofGender('female');
    setHofAadhaar('');
    setRationCardNo('');
    setRationType('SPHH');
    setFamilyCount(3);
    setAddress('');
    setPhone('');
    setHasRationCard('yes');
    setDrawsMonthlyRation('yes');
    setHasPakaHouse('no');
    setOwnsLand('no');
    setLandDecimal('');
    setHasVehicle('no');
    setHasHealthInsurance('no');
    setPaysTax('no');
    setAnnualIncome('48000');
    setCaaStatus('not_applicable');
    setCaaNo('');
    setHasKcc('no');
    setKccDetails('');
    setHasSirDispute('no');
    setSirDisputeDetails('');
    setFamilyMembers(DEFAULT_MEMBERS);
    setChildrenSchoolList([]);
    setReceivedDbtSchemes([]);
    setToastMessage('🧹 ফর্মের সমস্ত তথ্য সম্পূর্ণ রিসেট করা হয়েছে!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const stepsList = [
    { title: 'পারিবারিক পরিচয়', icon: <User className="h-4 w-4" /> },
    { title: 'রেশন ও সম্পদ', icon: <Home className="h-4 w-4" /> },
    { title: 'আয় এবং পেশা', icon: <Banknote className="h-4 w-4" /> },
    { title: 'অন্যান্য নথি', icon: <FileText className="h-4 w-4" /> },
    { title: 'সদস্যদের বিবরণ', icon: <Users className="h-4 w-4" /> },
    { title: 'শিক্ষা ও DBT', icon: <GraduationCap className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Printing Style overrides */}
      <style>{`
        @media print {
          html, body {
            background-color: white !important;
            color: black !important;
          }
          #root > div > header, 
          #root > div > main > div > div:not(.space-y-6),
          nav, aside, footer, button, .no-print,
          #root > div > main > div > h2,
          #root > div > main > div > p,
          #root > div > main > div > div.grid,
          #root > div > main > div > div.bg-amber-50,
          div.rounded-2xl.border.border-orange-100 {
            display: none !important;
          }
          #annapurna-printable-card, #annapurna-blank-printable-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            display: block !important;
            visibility: visible !important;
          }
          body {
            visibility: hidden;
          }
          #annapurna-printable-card *, #annapurna-blank-printable-card * {
            visibility: visible;
          }
        }
      `}</style>

      {/* Toast Warning Ticker component */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 border border-orange-500 animate-slide-in">
          <Sparkles className="h-5 w-5 text-orange-400 animate-spin" />
          <span className="text-xs md:text-sm font-bold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Main Container Form representation */}
      <div className="rounded-2xl border border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-6 md:p-8 space-y-6">
        
        {/* Header Title segment with dynamic actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-orange-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-[10px] font-black tracking-widest text-orange-600 dark:text-orange-400 uppercase font-mono">
                ONLINE FORM WIZARD • ২০২৬
              </span>
            </div>
            <h3 className="font-sans text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
              অফলাইন আবেদন তথ্য পূরণ পোর্টাল
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-normal max-w-2xl font-medium">
              অফিসিয়াল "পারিবারিক তথ্য সংগ্রহের ফর্ম" এর অনুকরণে তৈরি এই ডিজিটাল ফর্মটি পূরণ করতে পারেন। তথ্য সঠিক হলে প্রিন্ট করে জেরক্স বা বিডিও ক্যাম্পে জমা দিতে পারবেন।
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleAutoFillDemo}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 hover:text-white text-zinc-950 font-black text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>বাংলা ডেমো তথ্য অটো-ফিল করুন (Auto Fill)</span>
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1 bg-red-100 dark:bg-slate-950 text-red-600 border border-red-200 dark:border-red-950/50 hover:bg-red-200 font-bold text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>রিসেট ফর্ম</span>
            </button>
          </div>
        </div>

        {/* Dynamic Form Step Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {stepsList.map((step, idx) => {
            const num = idx + 1;
            const isCompleted = activeStep > num;
            const isActive = activeStep === num;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStep(num)}
                className={`flex items-center gap-2 p-3 text-left rounded-xl border text-xs font-bold transition focus:outline-none ${
                  isActive 
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black'
                    : isCompleted
                      ? 'border-emerald-300 dark:border-slate-800 bg-emerald-50/20 dark:bg-slate-950/40 text-emerald-700'
                      : 'border-gray-150 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-500'
                }`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive 
                    ? 'bg-orange-600 text-white'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : num}
                </div>
                <div className="hidden sm:block truncate">
                  <span className="block text-[9px] text-gray-400 font-normal">Step 0{num}</span>
                  <span className="truncate block">{step.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-slate-805 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-600 to-orange-500 h-full transition-all duration-305" 
            style={{ width: `${(activeStep / 6) * 100}%` }}
          />
        </div>

        {/* STEP 1: HOF Personal & Family Identity */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-850">
              <User className="h-4 w-4 text-orange-500" /> ক: পারিবারিক পরিচয় (A. Family Identity Head Details)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">১. পরিবারের প্রধানের নাম (Head of Family Name) *</label>
                <input
                  type="text"
                  required
                  value={hofName}
                  onChange={(e) => {
                    setHofName(e.target.value);
                    updateMember('hof', 'name', e.target.value);
                  }}
                  placeholder="আধার কার্ডে উল্লেখিত সঠিক পুরো নাম"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-505"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">২. জন্ম তারিখ (DOB of HOF) *</label>
                <input
                  type="date"
                  required
                  value={hofDob}
                  onChange={(e) => {
                    setHofDob(e.target.value);
                    updateMember('hof', 'dob', e.target.value);
                  }}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">৩. পরিবারের প্রধানের লিঙ্গ (Gender of HOF) *</label>
                <select
                  value={hofGender}
                  onChange={(e) => {
                    setHofGender(e.target.value);
                    updateMember('hof', 'gender', e.target.value);
                  }}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="female">মহিলা (Female - সর্বাধিক অগ্রাধিকারযোগ্য)</option>
                  <option value="male">পুরুষ (Male)</option>
                  <option value="other">অন্যান্য (Others)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">৪. পরিবারের প্রধানের আধার নং (Aadhaar No) *</label>
                <input
                  type="text"
                  required
                  value={hofAadhaar}
                  onChange={(e) => {
                    setHofAadhaar(e.target.value);
                    updateMember('hof', 'aadhaar', e.target.value);
                  }}
                  placeholder="১২ সংখ্যার নম্বর যেমন: ৫৪৩২ ১০৯৮ ৭৬৫৪"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">৫. ডিজিটাল রেশন কার্ডের পারিবারিক আইডি</label>
                <input
                  type="text"
                  value={rationCardNo}
                  onChange={(e) => setRationCardNo(e.target.value)}
                  placeholder="DRC আইডি (যেমন: এসপিএইচএইচ নম্বরিং কোড)"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">৬. পরিবারের সদস্য সংখ্যা (Family Size)</label>
                <input
                  type="number"
                  value={familyCount}
                  onChange={(e) => setFamilyCount(parseInt(e.target.value) || 1)}
                  placeholder="শুধুমাত্র সংখ্যায়"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">৭. স্থায়ী ঠিকানা (Permanent Address) *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="গ্রাম / পঞ্চায়েত, ডাকঘর, বিডিও ব্লক, জেলা এবং পিন কোড"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-805 dark:text-slate-300">৮. প্রধান মোবাইল নাম্বার (Mobile No) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="১০ সংখ্যার সক্রিয় যোগাযোগের হোয়াটসঅ্যাপ বা মোবাইল"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পরবর্তী ধাপ (Next Step)
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Ration Details & Assets */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-850">
              <Home className="h-4 w-4 text-orange-500" /> খ ও গ: রেশন বিবরণী এবং পারিবারিক সম্পদ (B & C Status)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-2xl border border-gray-150 dark:border-slate-850">
              
              <div className="space-y-3">
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">খ. রেশন কার্ড / খাদ্য ভর্তুকি</h5>
                
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-500">আপনার কি ডিজিটাল রেশন কার্ড রয়েছে?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="hasRation" 
                        value="yes" 
                        checked={hasRationCard === 'yes'} 
                        onChange={() => setHasRationCard('yes')}
                        className="text-orange-600"
                      />
                      <span>হ্যাঁ</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="hasRation" 
                        value="no" 
                        checked={hasRationCard === 'no'} 
                        onChange={() => setHasRationCard('no')}
                        className="text-orange-600"
                      />
                      <span>না</span>
                    </label>
                  </div>
                </div>

                {hasRationCard === 'yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 animate-fade-in">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-400">রেশন কার্ডের ক্যাটাগরি</label>
                      <select
                        value={rationType}
                        onChange={(e) => setRationType(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="AAY">AAY (অন্ত্যোদয় অন্ন যোজনা)</option>
                        <option value="PHH">PHH (অগ্রাধিকার বেনিফিশিয়ারি)</option>
                        <option value="SPHH">SPHH (বিশেষ অগ্রাধিকার বেনিফিশিয়ারি)</option>
                        <option value="RKSY1">RKSY-I</option>
                        <option value="RKSY2">RKSY-II</option>
                        <option value="none">ভর্তুকিহীন কার্ড (Non-subsidized)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <span className="block text-xs font-bold text-gray-500">রেশন দোকান থেকে মাসিক রেশন নিচ্ছেন কিনা?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="drawRation" 
                        value="yes" 
                        checked={drawsMonthlyRation === 'yes'} 
                        onChange={() => setDrawsMonthlyRation('yes')}
                        className="text-orange-600"
                      />
                      <span>হ্যাঁ (তুলছেন)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="drawRation" 
                        value="no" 
                        checked={drawsMonthlyRation === 'no'} 
                        onChange={() => setDrawsMonthlyRation('no')}
                        className="text-orange-600"
                      />
                      <span>না (তুলছেন না)</span>
                    </label>
                  </div>
                </div>

              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">গ. পারিবারিক সম্পদ</h5>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-500">১. আপনার নিজের কি ৩ বা তার বেশি পাকা ঘর রয়েছে?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="paka" value="yes" checked={hasPakaHouse === 'yes'} onChange={() => setHasPakaHouse('yes')} />
                      <span>হ্যাঁ</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="paka" value="no" checked={hasPakaHouse === 'no'} onChange={() => setHasPakaHouse('no')} />
                      <span>না</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-500">২. পারিবারিক চাষযোগ্য জমির মালিকানা আছে কি?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="land" value="yes" checked={ownsLand === 'yes'} onChange={() => setOwnsLand('yes')} />
                      <span>হ্যাঁ</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="land" value="no" checked={ownsLand === 'no'} onChange={() => setOwnsLand('no')} />
                      <span>না</span>
                    </label>
                  </div>
                </div>

                {ownsLand === 'yes' && (
                  <div className="space-y-1 mt-2 animate-fade-in max-w-xs">
                    <label className="block text-[11px] font-bold text-gray-400">মোট জমির পরিমাণ (শতক - Decimals-এ)</label>
                    <input
                      type="text"
                      value={landDecimal}
                      onChange={(e) => setLandDecimal(e.target.value)}
                      placeholder="যেমন: ১২ শতক"
                      className="w-full bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-500">৩. চার চাকার গাড়ি রয়েছে? (ট্র্যাক্টর সহ)</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="car" value="yes" checked={hasVehicle === 'yes'} onChange={() => setHasVehicle('yes')} />
                      <span>হ্যাঁ</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="car" value="no" checked={hasVehicle === 'no'} onChange={() => setHasVehicle('no')} />
                      <span>না</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-500">৪. পরিবারের সদস্যদের স্বাস্থ্যবিমা (Health Insurance) নিয়মিত আছে কি?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="ins" value="yes" checked={hasHealthInsurance === 'yes'} onChange={() => setHasHealthInsurance('yes')} />
                      <span>হ্যাঁ (আছে)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="ins" value="no" checked={hasHealthInsurance === 'no'} onChange={() => setHasHealthInsurance('no')} />
                      <span>না (নেই)</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="bg-gray-100 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-705 font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পূর্ববর্তী ধাপ (Previous)
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পরবর্তী ধাপ (Next)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Income & Profession */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-850">
              <Banknote className="h-4 w-4 text-orange-500" /> ঘ: আয় এবং পেশা বিবরণী (D. Income and Occupation Status)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-2 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-xl border border-gray-150">
                <span className="block text-xs font-bold text-gray-650">কোনো সদস্য কি আয়কর বা পেশাগত কর প্রদান করেন? (P-Tax / Income Tax)</span>
                <p className="text-[10px] text-gray-400">নোট: আয়কর প্রদানকারী সরকারি নিয়মে কোনো সাহায্য বা ৩০০০ টাকা ভাতা পাবেন না।</p>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="radio" name="tax" value="yes" checked={paysTax === 'yes'} onChange={() => setPaysTax('yes')} />
                    <span>হ্যাঁ (প্রদান করেন)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="radio" name="tax" value="no" checked={paysTax === 'no'} onChange={() => setPaysTax('no')} />
                    <span>না (প্রদান করেন না)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-xl border border-gray-150">
                <span className="block text-xs font-bold text-slate-850">পরিবারের প্রধানের মোট বার্ষিক আয় কত? (Family Annual Income) *</span>
                <p className="text-[10px] text-gray-400">নোট: ১২ ডেসিমাল বেশি জমি থাকলে আয়ের সাথে তা অন্তর্ভুক্ত করুন।</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-gray-500">₹</span>
                  <input
                    type="text"
                    required
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    placeholder="বার্ষিক আয় (টাকায়) যেমন: ৪৮০০০"
                    className="w-full bg-slate-105 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">টাকা</span>
                </div>
              </div>

            </div>

            <div className="rounded-xl p-4 bg-yellow-50/50 dark:bg-slate-950/20 text-xs text-yellow-800 dark:text-yellow-300 font-semibold border border-yellow-101 flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <strong>আইনি ঘোষণা:</strong> যদি আপনার বার্ষিক আয় সরকারি নির্ধারিত গরিব উন্নয়ন সীমার ঊর্ধ্বে হয়ে থাকে, তবে অন্নপূর্ণা ভান্ডারে মাসিক ভাতার আবেদন বাতিল বলে গণ্য করা হবে। সঠিক বার্ষিক ইনকাম ডিক্লিয়ার করুন।
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="bg-gray-100 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-705 font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পূর্ববর্তী ধাপ (Previous)
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পরবর্তী ধাপ (Next)
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Other Identity & Disputes */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-slate-850">
              <FileText className="h-4 w-4 text-orange-500" /> ঙ: অন্যান্য পরিচয় নথি এবং অন্নপূর্ণা বিশেষ তথ্য (Other Records)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-xl border border-gray-150">
                <span className="block text-xs font-bold text-slate-850">১. CAAআবেদন-এর বর্তমান অবস্থা কি? (যদি থাকে)</span>
                <select
                  value={caaStatus}
                  onChange={(e) => setCaaStatus(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="not_applicable">প্রযোজ্য নয় (Not Applicable)</option>
                  <option value="applied">আবেদন করা হয়েছে (AppliedBut Pending)</option>
                  <option value="issued">সার্টিফিকেট ইস্যু করা হয়েছে (Certificate Issued)</option>
                </select>

                {caaStatus !== 'not_applicable' && (
                  <div className="space-y-1 mt-2 animate-fade-in">
                    <label className="block text-[11px] font-bold text-gray-400">আবেদন নম্বর অথবা সার্টিফিকেট নম্বর</label>
                    <input
                      type="text"
                      value={caaNo}
                      onChange={(e) => setCaaNo(e.target.value)}
                      placeholder="অধিকর্তার নাম্বার / ARNকোডের বিবরণ"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-xl border border-gray-150">
                <span className="block text-xs font-bold text-slate-850">২. কিষাণ বা অন্যান্য বিশিষ্ট ক্রেডিট কার্ড আছে কি?</span>
                <p className="text-[10px] text-gray-400">KCC, Artisan Credit, Student CC বা মৎসজীবী ক্রেডিট কার্ড</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="radio" name="kcc" value="yes" checked={hasKcc === 'yes'} onChange={() => setHasKcc('yes')} />
                    <span>হ্যাঁ</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="radio" name="kcc" value="no" checked={hasKcc === 'no'} onChange={() => setHasKcc('no')} />
                    <span>না</span>
                  </label>
                </div>

                {hasKcc === 'yes' && (
                  <div className="space-y-1 mt-2 animate-fade-in">
                    <label className="block text-[11px] font-bold text-gray-400">কার্ড ও সংস্থার আইডি নাম্বার</label>
                    <input
                      type="text"
                      value={kccDetails}
                      onChange={(e) => setKccDetails(e.target.value)}
                      placeholder="ক্রেডিট কার্ডের আইডি নম্বরটি লিখুন"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-xl border border-gray-150 md:col-span-2">
                <span className="block text-xs font-bold text-slate-850">৩. যদি SIR ২০২৬ থেকে নাম বাদ পড়ে থাকে, তবে মামলাটি ট্রাইব্যুনালে বিচারাধীন কি না?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="radio" name="sir" value="yes" checked={hasSirDispute === 'yes'} onChange={() => setHasSirDispute('yes')} />
                    <span>হ্যাঁ বিচার চলছে (Pending Dispute)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input type="radio" name="sir" value="no" checked={hasSirDispute === 'no'} onChange={() => setHasSirDispute('no')} />
                    <span>না (অথবা প্রযোজ্য নয়)</span>
                  </label>
                </div>

                {hasSirDispute === 'yes' && (
                  <div className="space-y-1 mt-2 animate-fade-in">
                    <label className="block text-[11px] font-bold text-gray-400">মামলার নম্বর এবং কোর্ট বিবরণী</label>
                    <textarea
                      rows={2}
                      value={sirDisputeDetails}
                      onChange={(e) => setSirDisputeDetails(e.target.value)}
                      placeholder="মামলার ট্র্যাকিং ও বিজ্ঞপ্তির তারিখ সমেত সংক্ষেপ বিবরণ"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="bg-gray-100 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-705 font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পূর্ববর্তী : আয় ও পেশা (Prev)
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পরবর্তী : পারিবারিক সদস্য (Next)
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Dynamic Family Members Details */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-2">
              <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 ">
                <Users className="h-4 w-4 text-orange-500" /> পরিবারের অবশিষ্ট সদস্যদের তালিকা (Family Members List)
              </h4>
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-black cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="h-3 w-3" />
                <span>সদস্য যোগ করুন (Add Member)</span>
              </button>
            </div>
            
            <p className="text-[11px] text-gray-400 font-sans">সংসারের সকল প্রাপ্তবয়স্ক ও অপ্রাপ্তবয়স্ক সদস্যদের নাম, ভোটার নম্বর, ব্যাঙ্ক আইডি সতর্কতার সাথে নথিভুক্ত করুন।</p>

            {familyMembers.map((member, index) => (
              <div 
                key={member.id} 
                className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 p-5 space-y-4 relative font-sans"
              >
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(member.id)}
                    className="absolute top-4 right-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full p-2 cursor-pointer transition"
                    title="সদস্য মুছুন"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {index === 0 ? "১. পরিবারের প্রধান (HOF)" : `${index + 1}. পরিবারের সদস্য`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">সদস্যের নাম (Full Name) *</label>
                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      placeholder="আধার কার্ড অনুযায়ী নাম"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">জন্ম তারিখ (DOB) *</label>
                    <input
                      type="date"
                      required
                      value={member.dob}
                      onChange={(e) => updateMember(member.id, 'dob', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">লিঙ্গ (Gender) *</label>
                    <select
                      value={member.gender}
                      onChange={(e) => updateMember(member.id, 'gender', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="female">মহিলা</option>
                      <option value="male">পুরুষ</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">সম্পর্ক (Relation) *</label>
                    {index === 0 ? (
                      <input
                        type="text"
                        disabled
                        value="পরিবারের প্রধান (HOF)"
                        className="w-full bg-gray-100 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        required
                        value={member.relation}
                        onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                        placeholder="যেমন: স্বামী, ছেলে, পুত্রবধূ, কন্যা"
                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">আধার নম্বর (Aadhaar No) *</label>
                    <input
                      type="text"
                      required
                      value={member.aadhaar}
                      onChange={(e) => updateMember(member.id, 'aadhaar', e.target.value)}
                      placeholder="১২ সংখ্যার আইডি কোড"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">ভোটার আইডি নং (EPIC No)</label>
                    <input
                      type="text"
                      value={member.epicNo}
                      onChange={(e) => updateMember(member.id, 'epicNo', e.target.value)}
                      placeholder="যেমন: WB/04/..."
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">ব্যাংকের নাম (Bank Name)</label>
                    <input
                      type="text"
                      value={member.bankName}
                      onChange={(e) => updateMember(member.id, 'bankName', e.target.value)}
                      placeholder="যেমন: State Bank of India"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">একাউন্ট নং (Account No)</label>
                    <input
                      type="text"
                      value={member.accountNo}
                      onChange={(e) => updateMember(member.id, 'accountNo', e.target.value)}
                      placeholder="একাউন্ট ব্যাংকিং নম্বর লিখুন"
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-slate-805 pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`elig_${member.id}`}
                      checked={member.annapurnaEligible}
                      onChange={(e) => updateMember(member.id, 'annapurnaEligible', e.target.checked)}
                      className="rounded border-gray-300 pr-1.5 focus:ring-orange-500 text-orange-605"
                    />
                    <label htmlFor={`elig_${member.id}`} className="text-xs font-bold text-slate-850 cursor-pointer select-none">
                      এটি কি ₹৩,০০০ টাকা ভাতার জন্য আবদার করা হচ্ছে?
                    </label>
                  </div>
                </div>

              </div>
            ))}

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="bg-gray-100 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-705 font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পূর্ববর্তী : অন্যান্য নথি (Prev)
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(6)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পরবর্তী : শিক্ষা ও DBT (Next)
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Children Schooling and Received DBT Status */}
        {activeStep === 6 && (
          <div className="space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-2">
                <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 ">
                  <GraduationCap className="h-5 w-5 text-orange-500" /> চ: সামাজিক মর্যাদা এবং স্কুলে পড়ুয়া সন্তানদের বিবরণ (Children School Info)
                </h4>
                <button
                  type="button"
                  onClick={handleAddChildSchool}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-black cursor-pointer shadow-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>শিশু যোগ করুন</span>
                </button>
              </div>

              {childrenSchoolList.length === 0 ? (
                <div className="p-5 border border-dashed border-gray-200 dark:border-slate-850 text-center rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-gray-400 text-xs font-sans">
                  পরিবারে বিদ্যালয়ে অধ্যায়নরত কোন শিশু থাকলে \'শিশু যোগ করুন\' ক্লিক করে এন্ট্রি করুন।
                </div>
              ) : (
                <div className="space-y-3 font-sans">
                  {childrenSchoolList.map((child) => (
                    <div key={child.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50/50 dark:bg-slate-950/10 p-4 rounded-xl border border-gray-200">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">শিশুর নাম</label>
                        <input
                          type="text"
                          required
                          value={child.name}
                          onChange={(e) => updateChildSchool(child.id, 'name', e.target.value)}
                          placeholder="শিশুর সম্পূর্ণ নাম"
                          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">শ্রেণী (Class)</label>
                        <input
                          type="text"
                          required
                          value={child.className}
                          onChange={(e) => updateChildSchool(child.id, 'className', e.target.value)}
                          placeholder="যেমন: পঞ্চম শ্রেণী"
                          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">বিদ্যালয়ের নাম (School Name)</label>
                        <input
                          type="text"
                          required
                          value={child.schoolName}
                          onChange={(e) => updateChildSchool(child.id, 'schoolName', e.target.value)}
                          placeholder="স্কুলের সঠিক নাম"
                          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">বিদ্যালয়ের ধরন (Type)</label>
                        <select
                          value={child.schoolType}
                          onChange={(e) => updateChildSchool(child.id, 'schoolType', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                        >
                          <option value="government">সরকারি স্কুল</option>
                          <option value="private">বেসরকারি স্কুল</option>
                        </select>
                      </div>

                      <div className="flex items-end justify-start md:justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveChildSchool(child.id)}
                          className="flex items-center gap-1.5 text-xs text-red-650 hover:text-white font-bold bg-red-50 hover:bg-red-600 border border-red-200 px-3 py-1.5 rounded-lg cursor-pointer transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>মুছুন</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* DBT section */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/25 p-5 rounded-xl border border-gray-150 font-sans">
              <span className="block text-xs font-bold text-slate-850">ছ. পরিবারে প্রাপ্ত অন্যান্য সরকারি DBT যোজনার তালিকা (Received DBT Schemes) *</span>
              <p className="text-[10px] text-gray-400">পরিবারের কোনো সদস্য ইতিমধ্যেই নিচের কোনো সুবিধা পেয়ে থাকলে তার বামপাশের বক্সে টিক দিন:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {[
                  'লক্ষ্মীর ভান্ডার (Laxmir Bhandar)',
                  'জয় বাংলা পেনশন (Jai Bangla Pension)',
                  'কৃষক বন্ধু স্কিম (Krishak Bandhu)',
                  'বিনামূল্যে রেশন (Free Ration)',
                  'বার্ধক্য ভাতা (Old Age Pension)',
                  'প্রধানমন্ত্রী কিষাণ নিধি (PM-Kisan)',
                  'কন্যাশ্রী / ঐক্যশ্রী স্কলারশিপ (Scholarships)',
                  'রূপশ্রী প্রকল্প (Rupashree)'
                ].map((name) => (
                  <label key={name} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-2.5 rounded-lg text-xs font-medium cursor-pointer hover:border-orange-200 select-none">
                    <input
                      type="checkbox"
                      checked={receivedDbtSchemes.includes(name)}
                      onChange={() => handleSchemeCheckbox(name)}
                      className="rounded border-gray-300 focus:ring-orange-500 text-orange-600"
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer controls of STEP 6 */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-850 font-sans">
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="bg-gray-100 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-705 font-bold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
              >
                পূর্ববর্তী ধাপ (Previous)
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(true)}
                  className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-705 text-white font-black text-xs py-2.5 px-5 rounded-xl transition cursor-pointer shadow-md"
                >
                  <Printer className="h-4 w-4" />
                  <span>লাভ কপি এবং প্রিন্ট করুন (Form Print Preview)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('✔️ আবেদনের তথ্য সফলভাবে ডিজিটাল খতিয়ানে নথিবদ্ধ করা হয়েছে!');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white font-black text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
                >
                  দাখিল করুন (Submit Form Copy)
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {showPrintPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-4 no-print flex flex-col items-center justify-start">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 no-print font-sans">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="h-4 w-4 text-orange-500" /> অন্নপূর্ণা তথ্য সংগ্রহ ফর্ম প্রিন্ট প্রিভিউ
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-gray-100 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            <p className="no-print p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350 text-xs font-semibold border border-emerald-150 font-sans">
              💡 <strong>টিপস:</strong> আপনার ব্রাউজারের প্রিন্ট ডায়ালগ বক্সে <strong>"Save as PDF"</strong> অপশন সিলেক্ট করে সরাসরি সম্পূর্ণ রিয়েল-টাইম অটো-ফিল্ড ফর্মটি PDF ফাইল হিসেবে আপনার মোবাইলে বা কম্পিউটারে সহজে ডাউনলোড তথা সেভ করতে পারেন।
            </p>

            {/* Printable Filled Area */}
            <div id="annapurna-printable-card" className="p-4 md:p-8 border border-gray-300 rounded-xl bg-white text-slate-900 selection:bg-orange-100 space-y-6 font-serif max-w-4xl mx-auto shadow-sm print:p-0 print:border-0 text-left">
              
              {/* Stamp Govt Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                <div className="inline-block p-1 bg-slate-100 border border-slate-350 rounded mb-1">
                  <span className="text-[10px] tracking-widest uppercase font-mono px-2 font-bold text-slate-700 font-sans">পশ্চিমবঙ্গ পঞ্চায়েতি রাজ দপ্তর</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-950">অন্নপূর্ণা যোজনা • পশ্চিমবঙ্গ সরকার</h2>
                <h3 className="text-xs font-bold bg-slate-200 text-slate-950 inline-block px-3 py-0.5 rounded font-sans">পারিবারিক তথ্য সংগ্রহের ফর্ম (ডিজিটাল ফিল্ড কপি)</h3>
                <p className="text-[10px] italic text-slate-500 font-sans">অনলাইন পোর্টাল থেকে প্রস্তুতকৃত প্রাতিষ্ঠানিক অনুলিপি</p>
              </div>

              {/* Section A */}
              <div className="space-y-2 text-xs font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">ক. পারিবারিক পরিচিতি বিবরণ (Section A)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div><strong>১. প্রধানের নাম:</strong> {hofName || 'প্রদান করা হয়নি'}</div>
                  <div><strong>২. জন্ম তারিখ:</strong> {hofDob || 'প্রদান করা হয়নি'}</div>
                  <div><strong>৩. প্রধানের লিঙ্গ:</strong> {hofGender === 'female' ? 'মহিলা' : (hofGender === 'male' ? 'পুরুষ' : 'অন্যান্য')}</div>
                  <div><strong>৪. প্রধানের আধার নম্বর:</strong> <span className="font-mono">{hofAadhaar || 'প্রদান করা হয়নি'}</span></div>
                  <div><strong>৫. ডিজিটাল রেশন কার্ড আইডি:</strong> {rationCardNo || 'প্রদান করা হয়নি'} (টাইপ: {rationType})</div>
                  <div><strong>৬. পরিবারের সাকুল্যে সদস্য সংখ্যা:</strong> {familyCount || 'প্রদান করা হয়নি'} জন</div>
                  <div className="md:col-span-2"><strong>৭. স্থায়ী ঠিকানা:</strong> {address || 'প্রদান করা হয়নি'}</div>
                  <div><strong>৮. প্রধান মোবাইল নম্বর:</strong> {phone || 'প্রদান করা হয়নি'}</div>
                </div>
              </div>

              {/* Section B, C & D */}
              <div className="space-y-2 text-xs font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">খ, গ ও ঘ. রেশন, সম্পত্তি এবং আয় বিবরণী</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div><strong>১. রেশন কার্ড আছে কি?</strong> {hasRationCard === 'yes' ? 'হ্যাঁ' : 'না'}</div>
                  <div><strong>২. কার্ড থেকে মাসিক খাদ্যশস্য তুলছেন?</strong> {drawsMonthlyRation === 'yes' ? 'হ্যাঁ' : 'না'}</div>
                  <div><strong>৩. ৩টি বা তার বেশি পাকা ঘর আছে?</strong> {hasPakaHouse === 'yes' ? 'হ্যাঁ' : 'না'}</div>
                  <div><strong>৪. নিজের নামে চাষযোগ্য জমি আছে?</strong> {ownsLand === 'yes' ? `হ্যাঁ (${landDecimal} শতক)` : 'না'}</div>
                  <div><strong>৫. ৪ চাকার বা ভারী যানবাহন আছে?</strong> {hasVehicle === 'yes' ? `হ্যাঁ (${vehicleModel || ''} ${vehicleRegNo || ''})` : 'না'}</div>
                  <div><strong>৬. কোনো সদস্য কি আয়কর প্রদান করেন?</strong> {paysTax === 'yes' ? 'হ্যাঁ' : 'না'}</div>
                  <div className="md:col-span-2"><strong>৭. বার্ষিক আয়:</strong> ₹{annualIncome || '০'} টাকা</div>
                </div>
              </div>

              {/* Section E */}
              <div className="space-y-2 text-xs font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">ঙ. অন্যান্য বিবরণী ও সুবিধা নথিভুক্তকরণ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div><strong>১. CAA স্থিতি:</strong> {caaStatus === 'not_applicable' ? 'প্রযোজ্য নয়' : (caaStatus === 'applied' ? `আবেদিত (ARN: ${caaNo})` : `অর্জিত (নম্বর: ${caaNo})`)}</div>
                  <div><strong>২. কিষাণ / শিল্পী ক্রেডিট কার্ড:</strong> {hasKcc === 'yes' ? `আছে (${kccDetails})` : 'নেই'}</div>
                  <div className="md:col-span-2"><strong>৩. SIR ২০২৬ আপত্তি বিচারাধীন কি না?</strong> {hasSirDispute === 'yes' ? `ট্রাইব্যুনাল বিচারধীন মামলা (মামলা নং: ${sirDisputeDetails})` : 'বিচারাধীন মামলা নেই'}</div>
                </div>
              </div>

              {/* Section F: Family Members Table list */}
              <div className="space-y-3 font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1 font-sans">চ. নিবন্ধিত পারিবারিক সদস্যদের পূর্ণ তালিকা (Family Members Table)</h4>
                <table className="w-full text-[10px] text-left border-collapse border border-slate-350">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="px-2 py-1.5 border-r border-slate-200">ক্রমিক</th>
                      <th className="px-2 py-1.5 border-r border-slate-200">নাম (Name) / সম্পর্ক (Relation)</th>
                      <th className="px-2 py-1.5 border-r border-slate-200">আধার কার্ড (Aadhaar Card)</th>
                      <th className="px-2 py-1.5 border-r border-slate-200">ভোটার আইডি (EPIC NO) / ব্যাংক পাসবুক বিবরণ</th>
                      <th className="px-2 py-1.5">অনুমোদিত ভাতা যোগ্য স্থিতি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.map((m, idx) => (
                      <tr key={m.id} className="border-b border-slate-200">
                        <td className="px-2 py-1 border-r border-slate-200 text-center font-bold">{idx + 1}</td>
                        <td className="px-2 py-1 border-r border-slate-200 font-sans leading-snug">
                          <span className="font-bold text-slate-900 block">{m.name || 'নাম নেই'}</span>
                          <span className="text-[9px] text-gray-500 uppercase">{m.relation || 'প্রধান HOF'} ({m.gender === 'female' ? 'মহিলা' : 'পুরুষ'})</span>
                        </td>
                        <td className="px-2 py-1 border-r border-slate-200 font-mono text-xs">{m.aadhaar || 'নেই'}</td>
                        <td className="px-2 py-1 border-r border-slate-200 font-sans text-[10px] leading-tight text-slate-705">
                          {m.epicNo && <div className="font-semibold text-slate-900">ভোটার: {m.epicNo}</div>}
                          {m.bankName && <div className="text-[9px] text-gray-500">{m.bankName} (A/C: {m.accountNo})</div>}
                        </td>
                        <td className="px-2 py-1 text-[10px]">
                          {m.annapurnaEligible ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-bold font-sans">✓ ৩০০০/- টাকা ভাতা পাবেন</span>
                          ) : (
                            <span className="text-red-700 bg-red-50 px-1 py-0.5 rounded font-bold font-sans">✕ পরিবারের বাকি সদস্য</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section G: Children Schooling List */}
              {childrenSchoolList.length > 0 && (
                <div className="space-y-2 font-sans text-left">
                  <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1 font-sans">ছ. বিদ্যালয়ে অধ্যায়নরত সন্তানাদি</h4>
                  <table className="w-full text-[10px] border border-slate-350">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 font-semibold">
                        <th className="px-2 py-1 border-r border-slate-200">সন্তানের নাম</th>
                        <th className="px-2 py-1 border-r border-slate-200">শ্রেণী</th>
                        <th className="px-2 py-1">বিদ্যালয়ের নাম ও টাইপ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {childrenSchoolList.map((ch, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="px-2 py-1 border-r border-slate-200 font-bold">{ch.name}</td>
                          <td className="px-2 py-1 border-r border-slate-200">{ch.className}</td>
                          <td className="px-2 py-1 font-sans leading-tight">
                            {ch.schoolName} <span className="text-[8px] text-orange-600 block">({ch.schoolType === 'government' ? 'সরকারি' : 'বেসরকারি'})</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section H: DBT List */}
              {receivedDbtSchemes.length > 0 && (
                <div className="space-y-2 font-sans text-left">
                  <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1 font-sans">জ. প্রাপ্ত অন্যান্য সরকারি প্রকল্পের DBT সুবিধা</h4>
                  <div className="flex flex-wrap gap-1">
                    {receivedDbtSchemes.map((sc, idx) => (
                      <span key={idx} className="bg-slate-150 text-slate-850 border-0 text-[10px] px-2 py-1 rounded font-semibold font-mono">
                        ✓ {sc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures & Declarations section */}
              <div className="pt-8 border-t border-slate-400 font-sans">
                <p className="text-[10px] leading-relaxed italic text-slate-600">
                  আমি এই মর্মে সত্য ঘোষণা করছি যে, উপরে প্রদত্ত সমস্ত পারিবারিক তথ্য ও নথিগুলি সম্পূর্ণ সঠিক। যদি ভবিষ্যতে কোনো তথ্য অসত্য বা জালিয়াতি প্রমাণিত হয় তবে সরকার আমার অন্নপূর্ণা ভাতার অনুমোদন সাথে সাথেই বাতিল করে আইনি প্রক্রিয়া শুরু করতে পারবে।
                </p>

                <div className="grid grid-cols-2 gap-4 pt-10 text-xs text-left">
                  <div>
                    <p className="font-bold">তারিখ: ___________________</p>
                    <p className="font-bold mt-2">স্থান: ___________________</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">আবেদনকারীর পূর্ণ দস্তখত বা টিপছাপ</p>
                    <div className="inline-block border border-dashed border-slate-350 h-10 w-40 mt-2 bg-slate-50"></div>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-2 pt-2 border-t border-slate-150 no-print font-sans">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-black text-xs py-3 px-8 rounded-xl transition cursor-pointer shadow-md transform active:scale-95 duration-200"
              >
                <Printer className="h-4 w-4" />
                <span>মুদ্রণ করান (Print Application PDF)</span>
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="bg-gray-150 hover:bg-gray-200 text-slate-800 font-bold text-xs py-3 px-8 rounded-xl transition cursor-pointer shadow-md"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {showBlankFormPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-4 no-print flex flex-col items-center justify-start">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-4 my-8 font-sans">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3 no-print">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="h-4 w-4 text-orange-500" /> অফিশিয়াল অন্নপূর্ণা ফিজিক্যাল ব্ল্যাঙ্ক ফর্ম (Blank Form PDF)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setShowBlankFormPreview(false)}
                  className="bg-gray-150 dark:bg-slate-800 dark:text-white hover:bg-gray-200 text-slate-707 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            <p className="no-print p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350 text-xs font-semibold border border-emerald-150">
              💡 <strong>টিপস:</strong> আপনার ব্রাউজারের প্রিন্ট ডায়ালগ বক্সে <strong>"Save as PDF"</strong> অপশন সিলেক্ট করে সরাসরি সম্পূর্ণ খালি ফিজিক্যাল ফর্মটি ফ্রী-তে PDF ফাইল হিসেবে আপনার মোবাইলে বা কম্পিউটারে সহজে ডাউনলোড তথা সেভ করতে পারেন।
            </p>

            {/* Printable Blank Area */}
            <div id="annapurna-blank-printable-card" className="p-4 md:p-8 border border-gray-300 rounded-xl bg-white text-slate-900 selection:bg-orange-100 space-y-6 font-serif max-w-4xl mx-auto shadow-sm print:p-0 print:border-0 text-left">
              
              {/* Stamp Govt Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                <div className="inline-block p-1 bg-slate-100 border border-slate-350 rounded mb-1">
                  <span className="text-[10px] tracking-widest uppercase font-mono px-2 font-bold text-slate-707 font-sans">পশ্চিমবঙ্গ পঞ্চায়েতি রাজ দপ্তর</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-950 font-sans">অন্নপূর্ণা যোজনা • পশ্চিমবঙ্গ সরকার</h2>
                <h3 className="text-xs font-bold bg-slate-200 text-slate-950 inline-block px-3 py-0.5 rounded font-sans">পারিবারিক তথ্য সংগ্রহের ফর্ম (খালি কপি)</h3>
                <p className="text-[10px] italic text-slate-500 font-sans">অনлайн পোর্টাল থেকে প্রস্তুতকৃত ফিজিক্যাল প্রিন্টআউট অনুলিপি</p>
              </div>

              {/* Section A */}
              <div className="space-y-2 text-xs font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">ক. পারিবারিক পরিচিতি বিবরণ (Section A)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                  <div className="flex items-center"><strong>১. প্রধানের নাম:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                  <div className="flex items-center"><strong>২. জন্ম তারিখ:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                  <div className="flex items-center"><strong>৩. প্রধানের লিঙ্গ:</strong> <span className="ml-2">[ ] মহিলা</span> <span className="ml-2">[ ] পুরুষ</span> <span className="ml-2">[ ] অন্যান্য</span></div>
                  <div className="flex items-center"><strong>৪. প্রধানের আধার নম্বর:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                  <div className="flex items-center"><strong>৫. ডিজিটাল রেশন কার্ড আইডি:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                  <div className="flex items-center"><strong>৬. পরিবারের সদস্য সংখ্যা:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                  <div className="flex items-center md:col-span-2"><strong>৭. স্থায়ী ঠিকানা:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                  <div className="flex items-center"><strong>৮. প্রধান মোবাইল নম্বর:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                </div>
              </div>

              {/* Section B, C & D */}
              <div className="space-y-2 text-xs font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">খ, গ ও ঘ. রেশন, সম্পত্তি এবং আয় বিবরণী</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="flex items-center"><strong>১. রেশন কার্ড আছে কি?</strong> <span className="ml-2">[ ] হ্যাঁ</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center"><strong>২. মাসিক খাদ্যশস্য তুলছেন?</strong> <span className="ml-2">[ ] হ্যাঁ</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center"><strong>৩. ৩টি বা তার বেশি পাকা ঘর আছে?</strong> <span className="ml-2">[ ] হ্যাঁ</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center"><strong>৪. নিজের নামে চাষযোগ্য জমি আছে?</strong> <span className="ml-2">[ ] হ্যাঁ (<span className="border-b border-dotted border-slate-500 w-12 h-4 inline-block"></span> শতক)</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center"><strong>৫. ৪ চাকার বা ভারী যানবাহন আছে?</strong> <span className="ml-2">[ ] হ্যাঁ</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center"><strong>৬. কোনো সদস্য কি আয়কর প্রদান করেন?</strong> <span className="ml-2">[ ] হ্যাঁ</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center md:col-span-2"><strong>৭. বার্ষিক আয় (টাকায়):</strong> ₹ <span className="border-b border-dotted border-slate-500 w-44 h-4 inline-block"></span> টাকা মাত্র (কথায়: <span className="border-b border-dotted border-slate-500 grow h-4 inline-block"></span>)</div>
                </div>
              </div>

              {/* Section E */}
              <div className="space-y-2 text-xs font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">ঙ. অন্যান্য বিবরণী ও সুবিধা নথিভুক্তকরণ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] items-center">
                  <div className="flex items-center"><strong>১. CAA স্থিতি:</strong> <span className="ml-2">[ ] না প্রযোজ্য</span> <span className="ml-2">[ ] আবেদনের চেষ্টা</span></div>
                  <div className="flex items-center"><strong>২. কিষাণ বা শিল্পী ক্রেডিট কার্ড আছে?</strong> <span className="ml-2">[ ] হ্যাঁ</span> <span className="ml-2">[ ] না</span></div>
                  <div className="flex items-center md:col-span-2"><strong>৩. SIR ২০২৬ আপত্তি ট্রাইব্যুনালে বিচারাধীন কি না?</strong> <span className="ml-2">[ ] হ্যাঁ বিচারচলমান</span> <span className="ml-2">[ ] না আপত্তি নেই</span></div>
                  <div className="flex items-center md:col-span-2"><strong>মামলা নম্বর ও কোর্ট বিবরণী:</strong> <span className="border-b border-dotted border-slate-500 grow h-5 ml-1"></span></div>
                </div>
              </div>

              {/* Section F: Family Members Table Grid */}
              <div className="space-y-3 font-sans text-left">
                <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">চ. পরিবারের সদস্যদের পূর্ণ তালিকা (সহৃদয় দস্তখত করে ভরুন)</h4>
                <table className="w-full text-[10px] text-left border-collapse border border-slate-350">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-350 font-bold">
                      <th className="px-2 py-2 border-r border-slate-200 text-center w-12">ক্রমিক</th>
                      <th className="px-2 py-2 border-r border-slate-200">আবেদনকারীর নাম (Family Name)</th>
                      <th className="px-2 py-2 border-r border-slate-200">সম্পর্ক ও লিঙ্গ</th>
                      <th className="px-2 py-2 border-r border-slate-200">আধার কার্ডের নাম্বার (Aadhaar No)</th>
                      <th className="px-2 py-2 border-r border-slate-200">EPIC ভোটার নং</th>
                      <th className="px-2 py-2">ব্যাংক একাউন্ট নম্বর ও IFSC কোড</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="border-b border-slate-200 h-9">
                        <td className="px-2 py-2 border-r border-slate-200 text-center font-bold">{idx + 1}</td>
                        <td className="px-2 py-2 border-r border-slate-200"></td>
                        <td className="px-2 py-2 border-r border-slate-200"></td>
                        <td className="px-2 py-2 border-r border-slate-200"></td>
                        <td className="px-2 py-2 border-r border-slate-200"></td>
                        <td className="px-2 py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[9px] text-slate-400 italic">* প্রথম সারিতে অবশ্যই পরিবারের প্রধানের (HOF) নাম ও আধার কার্ড বিবরণ লিখে তারপর বাকি সদস্যদের লিখতে হবে।</p>
              </div>

              {/* Section G: Children Schooling and DBT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-left">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">ছ. অধ্যায়নরত সন্তানাদির বিবরণ</h4>
                  <table className="w-full text-[10px] border border-slate-350">
                    <thead>
                      <tr className="bg-slate-150 border-b border-slate-350 font-semibold">
                        <th className="px-2 py-1.5 border-r border-slate-200 font-sans">ক্রম</th>
                        <th className="px-2 py-1.5 border-r border-slate-200 text-left font-sans">সন্তানের নাম</th>
                        <th className="px-2 py-1.5 border-r border-slate-200 text-left font-sans">শ্রেণী</th>
                        <th className="px-2 py-1.5 font-sans text-left">প্রতিষ্ঠানের নাম</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <tr key={idx} className="border-b border-slate-200 h-7">
                          <td className="px-2 py-1 border-r border-slate-200 text-center font-sans">{idx + 1}</td>
                          <td className="px-2 py-1 border-r border-slate-200"></td>
                          <td className="px-2 py-1 border-r border-slate-200"></td>
                          <td className="px-2 py-1"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase border-l-4 border-slate-900 pl-2 bg-slate-100 py-1">জ. প্রাপ্ত অন্যান্য সরকারি DBT যোজনার তালিকা</h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-1 font-sans">
                    <span>[ ] লক্ষ্মীর ভান্ডার (Laxmir)</span>
                    <span>[ ] জয় বাংলা পেনশন (Jai Bangla)</span>
                    <span>[ ] কৃষক বন্ধু স্কিম (Krishak)</span>
                    <span>[ ] বিনামূল্যে রেশন (Free Ration)</span>
                    <span>[ ] বার্ধক্য ভাতা (Old Age)</span>
                    <span>[ ] প্রধানমন্ত্রী কিষাণ নিধি</span>
                    <span>[ ] কন্যাশ্রী / ঐক্যশ্রী স্কলারশিপ</span>
                    <span>[ ] রূপশ্রী প্রকল্প (Rupashree)</span>
                  </div>
                </div>
              </div>

              {/* Declaration and Signature */}
              <div className="pt-6 border-t border-slate-400 font-sans text-left">
                <p className="text-[10px] leading-relaxed italic text-slate-600">
                  আমি এই মর্মে সত্য ঘোষণা করছি যে, উপরে প্রদত্ত সমস্ত পারিবারিক তথ্য ও নথিগুলি সম্পূর্ণ সঠিক। যদি ভবিষ্যতে কোনো তথ্য অসত্য বা জালিয়াতি প্রমাণিত হয় তবে সরকার আমার অন্নপূর্ণা ভাতার অনুমোদন সাথে সাথেই বাতিল করে আইনি প্রক্রিয়া শুরু করতে পারবে।
                </p>

                <div className="grid grid-cols-2 gap-4 pt-8 text-xs text-left font-sans">
                  <div>
                    <p className="font-bold">তারিখ: ___________________</p>
                    <p className="font-bold mt-2">স্থান: ___________________</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-950">আবেদনকারীর পূর্ণ দস্তখত বা টিপছাপ</p>
                    <div className="inline-block border border-dashed border-slate-400 h-10 w-40 mt-1.5 bg-slate-50"></div>
                  </div>
                </div>
              </div>

              {/* Official inquiry form section */}
              <div className="mt-6 pt-5 border-t border-dashed border-slate-400 font-sans text-left">
                <h4 className="text-center font-bold text-xs uppercase bg-slate-100 py-1 text-slate-800 rounded mb-3">শুধুমাত্র তদন্তকারী সরকারি আধিকারিক বা GP ব্যবহারের জন্য অনুসন্ধান প্রতিবেদন</h4>
                <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed">
                  <div>
                    <p>[ ] আবেদনকারী যোগ্য হিসেবে সুপারিশ করা হল</p>
                    <p>[ ] আবেদনকারী অযোগ্য / শর্তাবলী পূরণ করেননি</p>
                    <p className="mt-2">তদন্তকারী আধিকারিকের মন্তব্য: ..............................................................</p>
                  </div>
                  <div className="text-right flex flex-col items-end pt-3">
                    <div className="border border-dashed border-slate-350 h-12 w-28 text-center text-[9px] flex items-center justify-center text-slate-400">অফিস সীল মোহর</div>
                    <p className="font-bold mt-2 text-slate-950">আধিকারিকের স্বাক্ষর, তারিখ ও সীলমোহর</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-2 pt-2 border-t border-slate-150 no-print">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs py-3 px-8 rounded-xl transition cursor-pointer shadow-md transform active:scale-95 duration-200 font-sans"
              >
                <Printer className="h-4 w-4" />
                <span>খালি ফর্মটি প্রিন্ট বা PDF সেভ করুন (Print / Save as PDF)</span>
              </button>
              <button
                onClick={() => setShowBlankFormPreview(false)}
                className="bg-gray-150 hover:bg-gray-200 text-slate-805 font-bold text-xs py-3 px-8 rounded-xl transition cursor-pointer shadow-md"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick link button to preview a blank physical form PDF anytime */}
      <div className="no-print bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-dashed border-orange-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
        <div className="space-y-0.5 text-center sm:text-left">
          <h5 className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center justify-center sm:justify-start gap-1">
            <Info className="h-4.5 w-4.5" /> অফিশিয়াল ফিজিক্যাল ব্ল্যাঙ্ক ফর্ম (Blank Application PDF)
          </h5>
          <p className="text-[11px] text-gray-400 font-medium">
            আপনার হাতে এখনো ফিলাপের জন্য কোনো খালি কাগজ বা সরকারি ফর্ম না থাকলে, আপনি সরাসরি এখান থেকে একটি এ ৪ সাইজের মূল ফাঁকা ফর্ম ডাউনলোড বা প্রিন্ট করে হাতে কলমে পূরণ করতে পারেন।
          </p>
        </div>
        <button
          onClick={() => setShowBlankFormPreview(true)}
          className="flex items-center gap-1.5 bg-gradient-to-tr from-amber-650 to-orange-550 hover:from-amber-705 hover:to-orange-605 text-white font-black text-xs py-2.5 px-5 rounded-xl transition cursor-pointer shadow-md transform active:scale-95 duration-200"
        >
          <Download className="h-4 w-4" />
          <span>খালি ফর্ম PDF ডাউনলোড করুন</span>
        </button>
      </div>

    </div>
  );
}
