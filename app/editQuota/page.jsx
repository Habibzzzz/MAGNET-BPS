"use client";

import React, { useState } from 'react';

export default function KelolaKuotaPage() {
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [jumlahKuota, setJumlahKuota] = useState(0);

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (jumlahKuota < 0) {
            setMessage('Jumlah kuota tidak boleh negatif.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/quota', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bulan: parseInt(bulan),
                    tahun: parseInt(tahun),
                    jumlahKuota: parseInt(jumlahKuota),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Terjadi kesalahan');
            }

            setMessage(`✅ Kuota untuk ${new Date(0, bulan - 1).toLocaleString('id-ID', { month: 'long' })} ${tahun} berhasil diatur menjadi ${result.jumlahKuota}.`);
        } catch (error) {
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-blue-700 mb-2 text-center">Kelola Kuota Magang</h1>
                <p className="text-gray-600 mb-6 text-center">Pilih bulan dan tahun, lalu masukkan jumlah maksimal kuota magang.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="bulan" className="block text-sm font-medium text-gray-700">Bulan</label>
                        <select
                            id="bulan"
                            value={bulan}
                            onChange={(e) => setBulan(e.target.value)}
                            className="mt-1 w-full p-3 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tahun" className="block text-sm font-medium text-gray-700">Tahun</label>
                        <input
                            type="number"
                            id="tahun"
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="kuota" className="block text-sm font-medium text-gray-700">Jumlah Kuota</label>
                        <input
                            type="number"
                            id="kuota"
                            value={jumlahKuota}
                            onChange={(e) => setJumlahKuota(e.target.value)}
                            required
                            min={0}
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full cursor-pointer py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${isLoading
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isLoading ? 'Menyimpan...' : 'Simpan Kuota'}
                    </button>
                </form>

                {message && (
                    <div
                        className={`mt-5 text-center text-sm font-medium ${message.includes('Error') || message.includes('❌')
                            ? 'text-red-600'
                            : 'text-green-600'
                            }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
