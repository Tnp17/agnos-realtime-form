'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ISO6391 from 'iso-639-1';
import { pusherClient } from '../lib/pusher-client';

const dict = {
    th: {
        systemTitle: "ระบบติดตามข้อมูลผู้ป่วยแบบเรียลไทม์",
        staffPortal: "แดชบอร์ดเจ้าหน้าที่",
        btnBack: "ย้อนกลับ",
        sectionOverview: "สถานะการเชื่อมต่อ",
        statusActive: "กำลังกรอกข้อมูล...",
        statusSubmitted: "ส่งแบบฟอร์มเรียบร้อย",
        statusInactive: "รอดำเนินการ",
        sectionPersonal: "ข้อมูลส่วนบุคคล",
        sectionContact: "ข้อมูลติดต่อและอื่นๆ",
        lblFirstName: "ชื่อจริง",
        lblMiddleName: "ชื่อกลาง",
        lblLastName: "นามสกุล",
        lblDob: "วัน/เดือน/ปี เกิด",
        lblGender: "เพศ",
        lblPhone: "เบอร์โทรศัพท์",
        lblEmail: "อีเมล",
        lblAddress: "ที่อยู่ปัจจุบัน",
        lblLang: "ภาษาที่สะดวก",
        lblNation: "สัญชาติ",
        lblEmergencyName: "ผู้ติดต่อฉุกเฉิน",
        lblEmergencyRel: "ความสัมพันธ์",
        lblReligion: "ศาสนา",
        liveBadge: "เรียลไทม์",
        channelInfo: "ช่องสัญญาณ:"
    },
    en: {
        systemTitle: "Patient Data Real-Time Monitor",
        staffPortal: "Staff Dashboard",
        btnBack: "Back",
        sectionOverview: "Session Status",
        statusActive: "Typing...",
        statusSubmitted: "Submitted",
        statusInactive: "Inactive",
        sectionPersonal: "Personal Details",
        sectionContact: "Contact & Info",
        lblFirstName: "First Name",
        lblMiddleName: "Middle Name",
        lblLastName: "Last Name",
        lblDob: "Date of Birth",
        lblGender: "Gender",
        lblPhone: "Phone Number",
        lblEmail: "Email",
        lblAddress: "Address",
        lblLang: "Preferred Language",
        lblNation: "Nationality",
        lblEmergencyName: "Emergency Contact",
        lblEmergencyRel: "Emergency Relationship",
        lblReligion: "Religion",
        liveBadge: "LIVE",
        channelInfo: "Channel:"
    }
};

export default function StaffDashboard() {
    const [isMounted, setIsMounted] = useState(false);
    const [formData, setFormData] = useState({});
    const [status, setStatus] = useState('Inactive in the form');
    const [isDark, setIsDark] = useState(false);
    const [lang, setLang] = useState('th');

    useEffect(() => {
        setIsMounted(true);
        const savedTheme = localStorage.getItem('theme') === 'dark';
        const savedLang = localStorage.getItem('lang') || 'th';

        setIsDark(savedTheme);
        setLang(savedLang);
    }, []);

    const t = dict[lang] || dict.th;

    // --- Helper Functions สำหรับแปลงค่าแสดงผลตามภาษาของแดชบอร์ด ---

    // 1. แปลงค่าเพศ
    const getGenderText = (genderVal) => {
        if (!genderVal) return null;
        const key = genderVal.toLowerCase();
        const map = {
            male: lang === 'en' ? 'Male' : 'ชาย',
            female: lang === 'en' ? 'Female' : 'หญิง',
            other: lang === 'en' ? 'Other' : 'อื่นๆ'
        };
        return map[key] || genderVal;
    };

    // 2. แปลงค่าภาษาที่สะดวก (ใช้ ISO6391)
    const getLanguageText = (langCode) => {
        if (!langCode) return null;
        const nativeName = ISO6391.getNativeName(langCode);
        const englishName = ISO6391.getName(langCode);

        if (!nativeName && !englishName) return langCode;

        if (lang === 'en') {
            return nativeName ? `${englishName} (${nativeName})` : englishName;
        }
        return englishName ? `${nativeName || englishName} (${englishName})` : nativeName;
    };

    // 3. แปลงค่าศาสนา
    const getReligionText = (relVal) => {
        if (!relVal) return null;
        const key = relVal.toLowerCase();
        const map = {
            buddhism: lang === 'en' ? 'Buddhism' : 'พุทธ (Buddhism)',
            islam: lang === 'en' ? 'Islam' : 'อิสลาม (Islam)',
            christianity: lang === 'en' ? 'Christianity' : 'คริสต์ (Christianity)',
            hinduism: lang === 'en' ? 'Hinduism' : 'ฮินดู (Hinduism)',
            sikhism: lang === 'en' ? 'Sikhism' : 'ซิกข์ (Sikhism)',
            judaism: lang === 'en' ? 'Judaism' : 'ยิว (Judaism)',
            none: lang === 'en' ? 'Non-religious' : 'ไม่นับถือศาสนา (Atheism)'
        };
        return map[key] || relVal;
    };

    useEffect(() => {
        if (!isMounted) return;
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark, isMounted]);

    useEffect(() => {
        if (!isMounted) return;
        localStorage.setItem('lang', lang);
    }, [lang, isMounted]);

    useEffect(() => {
        const channel = pusherClient.subscribe('patient-session');

        channel.bind('update-form', (data) => {
            setFormData(data.formData || {});
            setStatus(data.status);
        });

        return () => {
            pusherClient.unsubscribe('patient-session');
        };
    }, []);

    const getStatusBadge = () => {
        switch (status) {
            case 'Actively filling in':
                return (
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-base font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        {t.statusActive}
                    </span>
                );
            case 'Submitted':
                return (
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-base font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        {t.statusSubmitted}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-base font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                        {t.statusInactive}
                    </span>
                );
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans flex flex-col m-0 p-0">

            {/* Header Bar */}
            <header className="w-full sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 sm:px-10 py-4">
                <div className="w-full flex flex-wrap items-center justify-between gap-4">

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-3 rounded-full bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all border border-slate-300/60 dark:border-slate-700/60 flex items-center justify-center group"
                            title={t.btnBack}
                        >
                            <svg
                                className="w-6 h-6 transition-transform group-hover:-translate-x-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                        </Link>

                        <div className="p-3 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-700 inline-flex items-center justify-center shadow-xs">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
                                    {t.systemTitle}
                                </h1>
                                <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 rounded-md border border-rose-200 dark:border-rose-800 animate-pulse">
                                    {t.liveBadge}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                {t.staffPortal}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 ml-auto sm:ml-0">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-300/60 dark:border-slate-700/60 flex items-center justify-center"
                            title="Toggle Theme"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>
                        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-full border border-slate-300/60 dark:border-slate-700/60">
                            <button
                                onClick={() => {
                                    setLang('th');
                                    localStorage.setItem('lang', 'th');
                                }}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all ${lang === 'th'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs scale-105'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-5 h-5 rounded-full object-cover flex-shrink-0" viewBox="0 0 640 480">
                                    <g fillRule="evenodd" strokeWidth="1pt">
                                        <path fill="#f4f5f8" d="M0 0h640v480H0z" />
                                        <path fill="#2d2a4a" d="M0 160h640v160H0z" />
                                        <path fill="#a51931" d="M0 0h640v80H0zm0 400h640v80H0z" />
                                    </g>
                                </svg>
                                TH
                            </button>
                            <button
                                onClick={() => {
                                    setLang('en');
                                    localStorage.setItem('lang', 'en');
                                }}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all ${lang === 'en'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs scale-105'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <svg className="w-5 h-5 rounded-full object-cover flex-shrink-0" viewBox="0 0 640 480">
                                    <path fill="#00247d" d="M0 0h640v480H0z" />
                                    <path fill="#fff" d="m67.5 0 252.5 189L572.5 0H640v50.5L387.5 240 640 429.5V480h-67.5L320 291 67.5 480H0v-50.5L252.5 240 0 50.5V0h67.5z" />
                                    <path fill="#cf142b" d="M222.5 0 320 73 417.5 0H470l-150 112.5L470 225h-52.5L320 152l-97.5 73H170l150-112.5L170 0h52.5zM0 429.5l150-112.5L0 204.5v225zm640-379L490 163l150 112.5V50.5zM0 50.5l150 112.5L0 275.5V50.5zm640 379L490 317l150-112.5v225z" />
                                    <path fill="#fff" d="M240 0h160v480H240zM0 160h640v160H0z" />
                                    <path fill="#cf142b" d="M266.7 0h106.6v480H266.7zM0 186.7h640v106.6H0z" />
                                </svg>
                                EN
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 w-full px-6 sm:px-10 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            {t.sectionOverview}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
                            {t.channelInfo} <span className="text-blue-600 dark:text-blue-400 font-semibold">patient-session</span>
                        </p>
                    </div>
                    <div>
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Section 1: Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide border-l-4 border-blue-600 pl-3">
                        {t.sectionPersonal}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <DataCard label={t.lblFirstName} value={formData.firstName} />
                        <DataCard label={t.lblMiddleName} value={formData.middleName} />
                        <DataCard label={t.lblLastName} value={formData.lastName} />
                        <DataCard label={t.lblDob} value={formData.dob} />
                        {/* แปลงค่า Gender ตามภาษาเจ้าหน้าที่ */}
                        <DataCard label={t.lblGender} value={getGenderText(formData.gender)} />
                        <DataCard label={t.lblNation} value={formData.nationality} />
                    </div>
                </div>

                {/* Section 2: Contact & Additional Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide border-l-4 border-blue-600 pl-3">
                        {t.sectionContact}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <DataCard label={t.lblPhone} value={formData.phone} />
                        <DataCard label={t.lblEmail} value={formData.email} />
                        {/* แปลงค่า Preferred Language */}
                        <DataCard label={t.lblLang} value={getLanguageText(formData.preferredLanguage)} />
                        {/* แปลงค่า Religion */}
                        <DataCard label={t.lblReligion} value={getReligionText(formData.religion)} />
                        <DataCard label={t.lblAddress} value={formData.address} className="sm:col-span-2 md:col-span-3 lg:col-span-2" />
                        <DataCard label={t.lblEmergencyName} value={formData.emergencyContactName} />
                        <DataCard label={t.lblEmergencyRel} value={formData.emergencyContactRel} />
                    </div>
                </div>

            </main>
        </div>
    );
}

function DataCard({ label, value, className = "" }) {
    return (
        <div className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs ${className}`}>
            <div className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                {label}
            </div>

            <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 break-words">
                {value || <span className="text-slate-400 dark:text-slate-600 font-normal">-</span>}
            </div>
        </div>
    );
}