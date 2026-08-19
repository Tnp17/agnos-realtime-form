'use client';

import React, { useState, useRef } from 'react';

export default function PatientForm() {
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
        alert('ส่งข้อมูลเรียบร้อยแล้ว!');
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 my-8 text-gray-800">
            <h2 className="text-2xl font-bold border-b pb-2 text-gray-900">Patient Form</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium">First Name *</label>
                    <input required name="firstName" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Middle Name</label>
                    <input name="middleName" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Last Name *</label>
                    <input required name="lastName" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Date of Birth *</label>
                    <input type="date" required name="dob" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Gender *</label>
                    <select required name="gender" onChange={handleChange} className="w-full border p-2 rounded mt-1">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Phone Number *</label>
                    <input type="tel" required name="phone" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Email *</label>
                    <input type="email" required name="email" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Address *</label>
                <input required name="address" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Preferred Language</label>
                    <input name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Nationality</label>
                    <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Emergency Contact Name</label>
                    <input name="emergencyContactName" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Emergency Relationship</label>
                    <input name="emergencyContactRel" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Religion</label>
                <input name="religion" onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-4">
                Submit Form
            </button>
        </form>
    );
}