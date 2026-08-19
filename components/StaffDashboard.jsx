'use client';

import React, { useEffect, useState } from 'react';
import { pusherClient } from '../lib/pusher-client';

export default function StaffDashboard() {
    const [formData, setFormData] = useState({});
    const [status, setStatus] = useState('Inactive in the form');

    useEffect(() => {
        const channel = pusherClient.subscribe('patient-session');

        channel.bind('update-form', (data) => {
            setFormData(data.formData);
            setStatus(data.status);
        });

        return () => {
            pusherClient.unsubscribe('patient-session');
        };
    }, []);

    const getStatusBadge = () => {
        switch (status) {
            case 'Actively filling in':
                return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">🟡 Actively filling in</span>;
            case 'Submitted':
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">🟢 Submitted</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">⚪ Inactive in the form</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 my-8 text-gray-800">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Staff Real-Time View</h2>
                {getStatusBadge()}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded"><strong>First Name:</strong> {formData.firstName || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Middle Name:</strong> {formData.middleName || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Last Name:</strong> {formData.lastName || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>DOB:</strong> {formData.dob || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Gender:</strong> {formData.gender || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Phone:</strong> {formData.phone || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Email:</strong> {formData.email || '-'}</div>
                <div className="p-3 bg-gray-50 rounded col-span-2"><strong>Address:</strong> {formData.address || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Language:</strong> {formData.preferredLanguage || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Nationality:</strong> {formData.nationality || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Emergency Contact:</strong> {formData.emergencyContactName || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Emergency Rel:</strong> {formData.emergencyContactRel || '-'}</div>
                <div className="p-3 bg-gray-50 rounded"><strong>Religion:</strong> {formData.religion || '-'}</div>
            </div>
        </div>
    );
}