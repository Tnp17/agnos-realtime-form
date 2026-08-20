'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ISO6391 from 'iso-639-1';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
    ArrowLeft,
    Sun,
    Moon,
    User,
    Mail,
    Info,
    Send,
    CheckCircle2,
    MoreVertical
} from 'lucide-react';

const languageOptions = ISO6391.getAllNames().map((name) => ({
    value: ISO6391.getCode(name),
    label: `${name} (${ISO6391.getNativeName(ISO6391.getCode(name))})`,
}));

const getReligionOptions = (lang) => [
    { value: 'buddhism', label: lang === 'en' ? 'Buddhism' : 'พุทธ (Buddhism)' },
    { value: 'islam', label: lang === 'en' ? 'Islam' : 'อิสลาม (Islam)' },
    { value: 'christianity', label: lang === 'en' ? 'Christianity' : 'คริสต์ (Christianity)' },
    { value: 'hinduism', label: lang === 'en' ? 'Hinduism' : 'ฮินดู (Hinduism)' },
    { value: 'sikhism', label: lang === 'en' ? 'Sikhism' : 'ซิกข์ (Sikhism)' },
    { value: 'judaism', label: lang === 'en' ? 'Judaism' : 'ยิว (Judaism)' },
    { value: 'none', label: lang === 'en' ? 'Non-religious' : 'ไม่นับถือศาสนา (Atheism)' },
    { value: 'other', label: lang === 'en' ? 'Other' : 'อื่นๆ (Other)' },
];

const isPhoneValid = (phone) => {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 8 && digitsOnly.length <= 15;
};

// function: Upper case Nationality first index
const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// function: Filter out the numbers
const removeNumbers = (str) => {
    return str.replace(/[0-9]/g, '');
};

export default function PatientForm() {
    const [lang, setLang] = useState('th');
    const [darkMode, setDarkMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const initialFormState = {
        firstName: '',
        middleName: '',
        lastName: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        language: '',
        nationality: '',
        religion: '',
        otherReligion: '',
        emergencyContactName: '',
        emergencyRelationship: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    const checkIsFormDirty = (data) => {
        return Object.entries(data).some(([key, val]) => {
            if (!val) return false;
            const strVal = String(val).trim();

            if (key === 'phone') {
                const cleanPhone = strVal.replace(/^\+\d{1,3}/, '').trim();
                return cleanPhone.length > 0;
            }

            return strVal !== '';
        });
    };

    const sendPusherUpdate = async (updatedData, currentStatus) => {
        const payloadData = {
            firstName: updatedData.firstName || '',
            middleName: updatedData.middleName || '',
            lastName: updatedData.lastName || '',
            dob: updatedData.birthDate || '',
            gender: updatedData.gender || '',
            phone: updatedData.phone || '',
            email: updatedData.email || '',
            address: updatedData.address || '',
            preferredLanguage: updatedData.language || '',
            nationality: updatedData.nationality || '',
            religion: updatedData.religion === 'other' ? updatedData.otherReligion : (updatedData.religion || ''),
            emergencyContactName: updatedData.emergencyContactName || '',
            emergencyContactRel: updatedData.emergencyRelationship || '',
        };

        try {
            await fetch('/api/pusher-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel: 'patient-session',
                    event: 'update-form',
                    data: {
                        formData: payloadData,
                        status: currentStatus,
                    },
                }),
            });
        } catch (error) {
            console.error('Failed to send pusher update:', error);
        }
    };

    useEffect(() => {
        setIsMounted(true);

        const savedLang = localStorage.getItem('lang') || 'th';
        const savedTheme = localStorage.getItem('theme') === 'dark';

        setLang(savedLang);
        setDarkMode(savedTheme);

        if (savedTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.removeItem('patient_form_data');
        setFormData(initialFormState);

        sendPusherUpdate(initialFormState, 'Inactive');
    }, []);

    const changeLanguage = (newLang) => {
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    const toggleDarkMode = () => {
        const nextTheme = !darkMode;
        setDarkMode(nextTheme);
        localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
        if (nextTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleFieldChange = (name, value) => {
        const updated = { ...formData, [name]: value };
        setFormData(updated);

        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }

        const hasValue = checkIsFormDirty(updated);
        const currentStatus = hasValue ? 'Actively filling in' : 'Inactive';

        sendPusherUpdate(updated, currentStatus);
    };

    const validateForm = () => {
        const newErrors = {};
        const reqMsg = lang === 'en' ? 'This field is required' : 'จำเป็นต้องกรอกข้อมูลนี้';
        const invalidPhoneMsg = lang === 'en' ? 'Invalid phone number' : 'หมายเลขโทรศัพท์ไม่ถูกต้อง';
        const invalidEmailMsg = lang === 'en' ? 'Invalid email format' : 'รูปแบบอีเมลไม่ถูกต้อง';

        if (!formData.firstName.trim()) newErrors.firstName = reqMsg;
        if (!formData.lastName.trim()) newErrors.lastName = reqMsg;
        if (!formData.birthDate) newErrors.birthDate = reqMsg;
        if (!formData.gender) newErrors.gender = reqMsg;

        if (!formData.phone || !isPhoneValid(formData.phone)) {
            newErrors.phone = invalidPhoneMsg;
        }

        if (!formData.address.trim()) newErrors.address = reqMsg;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email || !formData.email.trim()) {
            newErrors.email = reqMsg;
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = invalidEmailMsg;
        }

        if (formData.religion === 'other' && !formData.otherReligion?.trim()) {
            newErrors.otherReligion = reqMsg;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await sendPusherUpdate(formData, 'Submitted');
            setShowSuccessModal(true);
        }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        setFormData(initialFormState);
        setErrors({});
        sendPusherUpdate(initialFormState, 'Inactive');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isFormDirty = checkIsFormDirty(formData);

    const customSelectStyles = (hasError) => ({
        control: (styles, { isFocused }) => ({
            ...styles,
            backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
            borderColor: hasError
                ? '#ef4444'
                : isFocused
                    ? '#2563eb'
                    : darkMode
                        ? '#334155'
                        : '#f1f5f9',
            borderRadius: '0.75rem',
            padding: '2px 4px',
            boxShadow: isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
            '&:hover': {
                borderColor: hasError ? '#ef4444' : '#2563eb',
            },
        }),
        menu: (styles) => ({
            ...styles,
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            zIndex: 50,
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isSelected
                ? '#2563eb'
                : isFocused
                    ? darkMode
                        ? '#334155'
                        : '#eff6ff'
                    : 'transparent',
            color: isSelected ? '#ffffff' : darkMode ? '#f8fafc' : '#0f172a',
            cursor: 'pointer',
        }),
        singleValue: (styles) => ({
            ...styles,
            color: darkMode ? '#f8fafc' : '#0f172a',
        }),
        input: (styles) => ({
            ...styles,
            color: darkMode ? '#f8fafc' : '#0f172a',
        }),
        placeholder: (styles) => ({
            ...styles,
            color: '#94a3b8',
            fontSize: '0.875rem',
        }),
    });

    const t = {
        th: {
            back: 'ย้อนกลับ',
            tag: 'Patient Form',
            title: 'แบบฟอร์มกรอกข้อมูลผู้ป่วย',
            subtitle: 'กรุณากรอกข้อมูลของท่านเพื่อการเข้ารับบริการ',
            statusNotTyped: 'ไม่ได้พิมพ์ข้อมูล',
            statusTyping: 'กำลังกรอกข้อมูล...',
            personalInfo: 'ข้อมูลส่วนตัว',
            firstName: 'ชื่อจริง',
            middleName: 'ชื่อกลาง',
            lastName: 'นามสกุล',
            birthDate: 'วันเกิด',
            gender: 'เพศ',
            selectGender: 'เลือกเพศ',
            male: 'ชาย',
            female: 'หญิง',
            otherGender: 'อื่นๆ',
            contactInfo: 'ข้อมูลการติดต่อ',
            phone: 'เบอร์โทรศัพท์',
            email: 'อีเมล',
            address: 'ที่อยู่ปัจจุบัน',
            additionalInfo: 'ข้อมูลเพิ่มเติม',
            language: 'ภาษาที่ถนัด',
            nationality: 'สัญชาติ',
            religion: 'ศาสนา',
            emergencyContact: 'ชื่อผู้ติดต่อฉุกเฉิน',
            relationship: 'ความสัมพันธ์',
            langPlaceholder: 'เลือกหรือพิมพ์ภาษาที่ต้องการ',
            relPlaceholder: 'เลือกศาสนา',
            otherRelSpecify: 'ระบุศาสนาเพิ่มเติม...',
            submit: 'ส่งแบบฟอร์มข้อมูล',
            modalTitle: 'ส่งข้อมูลเรียบร้อยแล้ว',
            modalDesc: 'ระบบได้รับข้อมูลของคุณแล้ว ขอบคุณสำหรับการกรอกข้อมูล',
            modalBtn: 'ตกลง',
        },
        en: {
            back: 'Back',
            tag: 'Patient Form',
            title: 'Patient Form',
            subtitle: 'Please fill in your information for medical services',
            statusNotTyped: 'Inactive',
            statusTyping: 'Typing...',
            personalInfo: 'Personal Information',
            firstName: 'First Name',
            middleName: 'Middle Name',
            lastName: 'Last Name',
            birthDate: 'Date of Birth',
            gender: 'Gender',
            selectGender: 'Select Gender',
            male: 'Male',
            female: 'Female',
            otherGender: 'Other',
            contactInfo: 'Contact Information',
            phone: 'Phone Number',
            email: 'Email',
            address: 'Address',
            additionalInfo: 'Additional Information',
            language: 'Language',
            nationality: 'Nationality',
            religion: 'Religion',
            emergencyContact: 'Emergency Contact',
            relationship: 'Relationship',
            langPlaceholder: 'Select language',
            relPlaceholder: 'Select religion',
            otherRelSpecify: 'Specify religion...',
            submit: 'Submit',
            modalTitle: 'Submission Successful',
            modalDesc: 'Your information has been successfully received. Thank you.',
            modalBtn: 'OK',
        },
    }[lang];

    if (!isMounted) return null;

    return (
        <div className={`min-h-screen py-8 px-4 transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navbar Controls - Mobile Responsive Menu */}
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium shadow-xs transition"
                    >
                        <ArrowLeft size={16} />
                        <span>{t.back}</span>
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 flex flex-col gap-3 z-50">
                                <div className="flex items-center justify-between px-2 py-0 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
                                    <button
                                        type="button"
                                        onClick={toggleDarkMode}
                                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                    >
                                        {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between px-2 pt-1">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Language</span>
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                                        <button
                                            type="button"
                                            onClick={() => changeLanguage('th')}
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${lang === 'th' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            TH
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => changeLanguage('en')}
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            EN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 mb-2">
                                • {t.tag}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.subtitle}</p>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 font-medium self-start sm:self-center">
                            Status: <span className={isFormDirty ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-500"}>
                                {isFormDirty ? t.statusTyping : t.statusNotTyped}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8" noValidate>

                        {/* Section 1: Personal Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-lg">
                                <User size={20} />
                                <h2>{t.personalInfo}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.firstName} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleFieldChange('firstName', removeNumbers(e.target.value))}
                                        className={`w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition ${errors.firstName ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'}`}
                                    />
                                    {errors.firstName && <p className="mt-1 text-sm text-red-500 font-medium">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.middleName}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.middleName}
                                        onChange={(e) => handleFieldChange('middleName', removeNumbers(e.target.value))}
                                        className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.lastName} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleFieldChange('lastName', removeNumbers(e.target.value))}
                                        className={`w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition ${errors.lastName ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'}`}
                                    />
                                    {errors.lastName && <p className="mt-1 text-sm text-red-500 font-medium">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.birthDate} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        lang={lang}
                                        value={formData.birthDate}
                                        onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                                        className={`w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition dark:[color-scheme:dark] 
                                            ${!formData.birthDate ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'} 
                                            ${errors.birthDate ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'}`}
                                    />
                                    {errors.birthDate && <p className="mt-1 text-sm text-red-500 font-medium">{errors.birthDate}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.gender} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleFieldChange('gender', e.target.value)}
                                        className={`w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition 
                                            ${!formData.gender ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'} 
                                            ${errors.gender ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'}`}
                                    >
                                        <option value="" className="text-slate-400">{t.selectGender}</option>
                                        <option value="male" className="text-slate-900 dark:text-slate-100">{t.male}</option>
                                        <option value="female" className="text-slate-900 dark:text-slate-100">{t.female}</option>
                                        <option value="other" className="text-slate-900 dark:text-slate-100">{t.otherGender}</option>
                                    </select>
                                    {errors.gender && <p className="mt-1 text-sm text-red-500 font-medium">{errors.gender}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Info*/}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-lg">
                                <Mail size={20} />
                                <h2>{t.contactInfo}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.phone} <span className="text-red-500">*</span>
                                    </label>
                                    <PhoneInput
                                        defaultCountry="th"
                                        value={formData.phone}
                                        onChange={(phone) => handleFieldChange('phone', phone)}
                                        formatNumber={true}
                                        className="w-full"
                                        inputClassName={`!w-full !h-[46px] !text-sm !bg-slate-50 dark:!bg-slate-800 !text-inherit !rounded-r-xl !border-slate-100 dark:!border-slate-800 focus:!border-blue-500 ${errors.phone ? '!border-red-500' : ''}`}
                                        countrySelectorStyleProps={{
                                            buttonClassName: `!h-[46px] !rounded-l-xl !border-slate-100 dark:!border-slate-800 !bg-slate-50 dark:!bg-slate-800 !px-3 ${errors.phone ? '!border-red-500' : ''}`,
                                        }}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-500 font-medium">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.email} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value.toLowerCase().trim())}
                                        placeholder="example@domain.com"
                                        className={`w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition ${errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'}`}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500 font-medium">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t.address} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                    className={`w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition ${errors.address ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900'}`}
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-500 font-medium">{errors.address}</p>}
                            </div>
                        </div>

                        {/* Section 3: Additional Info */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-lg">
                                <Info size={20} />
                                <h2>{t.additionalInfo}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.language}
                                    </label>
                                    <Select
                                        options={languageOptions}
                                        isSearchable
                                        placeholder={t.langPlaceholder}
                                        styles={customSelectStyles(false)}
                                        value={languageOptions.find((opt) => opt.value === formData.language) || null}
                                        onChange={(opt) => handleFieldChange('language', opt ? opt.value : '')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.nationality}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nationality}
                                        onChange={(e) => {
                                            let val = removeNumbers(e.target.value);
                                            if (lang === 'en') {
                                                val = capitalizeFirstLetter(val);
                                            }
                                            handleFieldChange('nationality', val);
                                        }}
                                        className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.religion}
                                    </label>
                                    <Select
                                        options={getReligionOptions(lang)}
                                        isSearchable
                                        placeholder={t.relPlaceholder}
                                        styles={customSelectStyles(!!errors.otherReligion)}
                                        value={getReligionOptions(lang).find((opt) => opt.value === formData.religion) || null}
                                        onChange={(opt) => {
                                            const val = opt ? opt.value : '';
                                            const updated = { ...formData, religion: val, otherReligion: val === 'other' ? formData.otherReligion : '' };
                                            setFormData(updated);

                                            const hasValue = checkIsFormDirty(updated);
                                            sendPusherUpdate(updated, hasValue ? 'Actively filling in' : 'Inactive');
                                        }}
                                    />

                                    {formData.religion === 'other' && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                placeholder={t.otherRelSpecify}
                                                value={formData.otherReligion}
                                                onChange={(e) => handleFieldChange('otherReligion', removeNumbers(e.target.value))}
                                                className={`w-full rounded-xl p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border outline-none transition ${errors.otherReligion ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
                                            />
                                            {errors.otherReligion && <p className="mt-1 text-sm text-red-500 font-medium">{errors.otherReligion}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.emergencyContact}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emergencyContactName}
                                        onChange={(e) => handleFieldChange('emergencyContactName', removeNumbers(e.target.value))}
                                        className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t.relationship}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emergencyRelationship}
                                        onChange={(e) => handleFieldChange('emergencyRelationship', removeNumbers(e.target.value))}
                                        className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.99]"
                            >
                                <span>{t.submit}</span>
                                <Send size={18} className="rotate-45" />
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 size={36} />
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t.modalTitle}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t.modalDesc}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleConfirmSuccess}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold py-3 px-4 rounded-xl shadow-md transition active:scale-[0.98] text-sm"
                        >
                            {t.modalBtn}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}