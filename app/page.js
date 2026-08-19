'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('th');
  const [isDark, setIsDark] = useState(false);

  // 1. โหลดค่าจาก localStorage หลังจาก Mount บน Client เรียบร้อยแล้วเท่านั้น
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('lang') || 'th';
    const savedTheme = localStorage.getItem('theme') === 'dark';
    setLang(savedLang);
    setIsDark(savedTheme);
  }, []);

  // 2. ซิงค์ Class 'dark' บน HTML Element และบันทึกคีย์ theme
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, mounted]);

  // 3. บันทึกคีย์ lang ลง localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
  }, [lang, mounted]);

  const content = {
    th: {
      badge: 'Agnos Health Center',
      title: 'ระบบกรอกข้อมูลผู้ป่วยแบบเรียลไทม์',
      subtitle: 'เลือกช่องทางเข้าใช้งานเพื่อดำเนินการต่อในระบบ',
      patientTag: 'Patient Form',
      patientTitle: 'สำหรับผู้ป่วย',
      patientDesc: 'กรอกข้อมูลประวัติส่วนตัวและอาการเบื้องต้นล่วงหน้า',
      patientBtn: 'กรอกฟอร์ม',
      staffTag: 'Staff Dashboard',
      staffTitle: 'สำหรับเจ้าหน้าที่',
      staffDesc: 'ระบบติดตามสถานะการกรอกข้อมูลของผู้ป่วยแบบ Real-Time',
      staffBtn: 'เข้าสู่แดชบอร์ด',
      footer: 'Secure Encrypted & Synchronized Data Stream',
    },
    en: {
      badge: 'Agnos Health Center',
      title: 'Real-Time Form System',
      subtitle: 'Select your role to proceed into the system',
      patientTag: 'Patient Form',
      patientTitle: 'For Patients',
      patientDesc: 'Pre-fill your personal details and initial medical symptoms',
      patientBtn: 'Fill Form',
      staffTag: 'Staff Dashboard',
      staffTitle: 'For Medical Staff',
      staffDesc: 'Real-time monitoring dashboard for patient form completion',
      staffBtn: 'Go to Dashboard',
      footer: 'Secure Encrypted & Synchronized Data Stream',
    },
  };

  const t = content[lang];

  // ป้องกัน Mismatch ระหว่าง Server กับ Client
  if (!mounted) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950" />;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-between p-6 lg:p-12 transition-colors duration-300 relative">

      {/* Top Controller Bar */}
      <div className="absolute top-6 right-6 lg:top-8 lg:right-12 z-20 flex items-center gap-3">

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center cursor-pointer"
        >
          {isDark ? (
            /* Moon Icon */
            <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            /* Sun Icon */
            <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Language Switcher Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-2 shadow-sm">
          <button
            onClick={() => setLang('th')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${lang === 'th'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-black/10 inline-flex items-center justify-center">
              <img
                src="https://flagcdn.com/th.svg"
                alt="Thai Flag"
                className="w-full h-full object-cover"
              />
            </span>
            <span>TH</span>
          </button>

          <button
            onClick={() => setLang('en')}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${lang === 'en'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-black/10 inline-flex items-center justify-center">
              <img
                src="https://flagcdn.com/gb.svg"
                alt="UK Flag"
                className="w-full h-full object-cover"
              />
            </span>
            <span>EN</span>
          </button>
        </div>
      </div>

      {/* Invisible space */}
      <div className="hidden lg:block h-2" />

      {/* Main Content Container */}
      <div className="max-w-xl sm:max-w-2xl lg:max-w-5xl w-full text-center space-y-10 lg:space-y-12 my-auto">

        {/* Header Section */}
        <div className="space-y-4 lg:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm sm:text-base font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            {t.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.title}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl lg:text-2xl max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">

          {/* Patient Card */}
          <Link
            href="/patient"
            className="group relative p-8 lg:p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center justify-between"
          >
            <div className="space-y-6 flex flex-col items-center w-full">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {t.patientTag}
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                  {t.patientTitle}
                </h2>
                <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs lg:max-w-sm">
                  {t.patientDesc}
                </p>
              </div>
            </div>

            <div className="mt-8 lg:mt-10 w-full py-4 px-6 rounded-2xl bg-blue-600 dark:bg-blue-600 text-white text-base lg:text-lg font-semibold flex items-center justify-center gap-2.5 group-hover:bg-blue-700 transition-colors shadow-sm">
              <span>{t.patientBtn}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          {/* Staff Card */}
          <Link
            href="/staff"
            className="group relative p-8 lg:p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center justify-between"
          >
            <div className="space-y-6 flex flex-col items-center w-full">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {t.staffTag}
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                  {t.staffTitle}
                </h2>
                <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs lg:max-w-sm">
                  {t.staffDesc}
                </p>
              </div>
            </div>

            <div className="mt-8 lg:mt-10 w-full py-4 px-6 rounded-2xl bg-teal-600 dark:bg-teal-600 text-white text-base lg:text-lg font-semibold flex items-center justify-center gap-2.5 group-hover:bg-teal-700 transition-colors shadow-sm">
              <span>{t.staffBtn}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 text-center">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-mono text-slate-500 dark:text-slate-400">
          <svg
            className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>{t.footer}</span>
        </div>
      </footer>

    </main>
  );
}