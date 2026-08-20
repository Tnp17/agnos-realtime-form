'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function PatientForm() {
    const [mounted, setMounted] = useState(false);
    const [lang, setLang] = useState('th');
    const [isDark, setIsDark] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        preferredLanguage: 'Thai',
        nationality: 'Thai',
        emergencyContactName: '',
        emergencyContactRel: '',
        religion: ''
    });

    const [status, setStatus] = useState('Inactive in the form');
    const timerRef = useRef(null);

    // 1. โหลดค่าธีมและภาษาหลังจาก Component Mount
    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('lang') || 'th';
        const savedTheme = localStorage.getItem('theme') === 'dark';
        setLang(savedLang);
        setIsDark(savedTheme);
    }, []);

    // 2. ซิงค์ Class 'dark' และบันทึกคีย์ theme
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

    const sendRealtimeUpdate = async (updatedData, currentStatus) => {
        await fetch('/api/pusher-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel: 'patient-session',
                event: 'update-form',
                data: { formData: updatedData, status: currentStatus },
            }),
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        setStatus('Actively filling in');

        sendRealtimeUpdate(updated, 'Actively filling in');

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setStatus('Inactive in the form');
            sendRealtimeUpdate(updated, 'Inactive in the form');
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Submitted');
        sendRealtimeUpdate(formData, 'Submitted');
        alert(lang === 'th' ? 'ส่งข้อมูลเรียบร้อยแล้ว!' : 'Form submitted successfully!');
    };

    const content = {
        th: {
            backBtn: 'ย้อนกลับ',
            title: 'แบบฟอร์มลงทะเบียนผู้ป่วย',
            subtitle: 'กรุณากรอกข้อมูลส่วนตัวเพื่อการเข้ามารับบริการ',
            statusLabel: 'สถานะ:',
            statusActive: 'กำลังกรอกข้อมูล...',
            statusInactive: 'ไม่ได้พิมพ์ข้อมูล',
            statusSubmitted: 'ส่งข้อมูลแล้ว',
            secPersonal: 'ข้อมูลส่วนตัว',
            firstName: 'ชื่อจริง *',
            middleName: 'ชื่อกลาง',
            lastName: 'นามสกุล *',
            dob: 'วันเกิด *',
            gender: 'เพศ *',
            genderSelect: 'เลือกเพศ',
            genderMale: 'ชาย',
            genderFemale: 'หญิง',
            genderOther: 'อื่นๆ',
            secContact: 'ข้อมูลการติดต่อ',
            phone: 'เบอร์โทรศัพท์ *',
            email: 'อีเมล *',
            address: 'ที่อยู่ปัจจุบัน *',
            secOther: 'ข้อมูลเพิ่มเติม',
            prefLang: 'ภาษาที่ถนัด',
            nationality: 'สัญชาติ',
            religion: 'ศาสนา',
            secEmergency: 'ผู้ติดต่อฉุกเฉิน',
            emName: 'ชื่อผู้ติดต่อฉุกเฉิน',
            emRel: 'ความสัมพันธ์',
            submitBtn: 'ส่งแบบฟอร์มข้อมูล'
        },
        en: {
            backBtn: 'Back',
            title: 'Patient Registration Form',
            subtitle: 'Please complete your personal details for medical service',
            statusLabel: 'Status:',
            statusActive: 'Actively filling in...',
            statusInactive: 'Inactive',
            statusSubmitted: 'Submitted',
            secPersonal: 'Personal Information',
            firstName: 'First Name *',
            middleName: 'Middle Name',
            lastName: 'Last Name *',
            dob: 'Date of Birth *',
            gender: 'Gender *',
            genderSelect: 'Select Gender',
            genderMale: 'Male',
            genderFemale: 'Female',
            genderOther: 'Other',
            secContact: 'Contact Details',
            phone: 'Phone Number *',
            email: 'Email *',
            address: 'Current Address *',
            secOther: 'Additional Information',
            prefLang: 'Preferred Language',
            nationality: 'Nationality',
            religion: 'Religion',
            secEmergency: 'Emergency Contact',
            emName: 'Emergency Contact Name',
            emRel: 'Relationship',
            submitBtn: 'Submit Form'
        }
    };

    const t = content[lang];

    if (!mounted) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 p-4 sm:p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold shadow-sm transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>{t.backBtn}</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            aria-label="Toggle Theme"
                            className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center cursor-pointer"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>

                        {/* Language Toggle */}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-sm">
                            <button
                                onClick={() => setLang('th')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${lang === 'th'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-black/10 inline-flex items-center justify-center">
                                    <img src="https://flagcdn.com/th.svg" alt="Thai" className="w-full h-full object-cover" />
                                </span>
                                <span>TH</span>
                            </button>

                            <button
                                onClick={() => setLang('en')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${lang === 'en'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-black/10 inline-flex items-center justify-center">
                                    <img src="https://flagcdn.com/gb.svg" alt="UK" className="w-full h-full object-cover" />
                                </span>
                                <span>EN</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Card Wrapper */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl transition-all">

                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Patient Form
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {t.title}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                {t.subtitle}
                            </p>
                        </div>

                        {/* Sync Status Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium w-fit">
                            <span className="text-slate-500 dark:text-slate-400">{t.statusLabel}</span>
                            <span className={`font-semibold ${status === 'Actively filling in' ? 'text-amber-600 dark:text-amber-400' :
                                    status === 'Submitted' ? 'text-emerald-600 dark:text-emerald-400' :
                                        'text-slate-600 dark:text-slate-400'
                                }`}>
                                {status === 'Actively filling in' ? t.statusActive :
                                    status === 'Submitted' ? t.statusSubmitted : t.statusInactive}
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Personal Info */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {t.secPersonal}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.firstName}</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.middleName}</label>
                                    <input name="middleName" value={formData.middleName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.lastName}</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.dob}</label>
                                    <input type="date" required name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.gender}</label>
                                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm">
                                        <option value="">{t.genderSelect}</option>
                                        <option value="Male">{t.genderMale}</option>
                                        <option value="Female">{t.genderFemale}</option>
                                        <option value="Other">{t.genderOther}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {t.secContact}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.phone}</label>
                                    <input type="tel" required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.email}</label>
                                    <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.address}</label>
                                <input required name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                            </div>
                        </div>

                        {/* Section 3: Additional & Emergency */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t.secOther}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.prefLang}</label>
                                    <input name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.nationality}</label>
                                    <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.religion}</label>
                                    <input name="religion" value={formData.religion} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.emName}</label>
                                    <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">{t.emRel}</label>
                                    <input name="emergencyContactRel" value={formData.emergencyContactRel} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>{t.submitBtn}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}