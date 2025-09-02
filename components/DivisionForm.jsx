"use client"

import { faTruckField } from '@fortawesome/free-solid-svg-icons';
import { ArrowLeft, Building, Calendar, CheckCircle, GraduationCap, Hash, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import SuccessModal from './SuccessModal';

export default function DivisionForm({ id, nama, divisi }) {

    const [newNama, setNewNama] = useState(nama);
    const [newDivisi, setNewDivisi] = useState(divisi);
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleDivisiChange = (e) => setNewDivisi(e.target.value);

    const route = useRouter();

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/intern/${id}`, {
                    cache: 'no-store',
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await res.json();
                setInterns(data.interns);
            } catch (error) {
                console.error("Error loading data: ", error);
                console.log('FETCHING:', `api/intern/${id}`);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInterns();
    }, [id]);

    const handleBack = () => {
        setLoading(true);
        route.push('/assignDivision');
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className='text-red-500'>Error: {error}</div>;
    }


    const divisionOptions = [
        { value: "Umum", label: "Umum" },
        { value: "Produksi", label: "Produksi" },
        { value: "Sosial", label: "Sosial" },
        { value: "Distribusi", label: "Distribusi" },
        { value: "Nerwilis", label: "Nerwilis" },
        { value: "PTID", label: "PTID" },
        { value: "Sektoral", label: "Sektoral" },
    ];

    // const statusOptions = [
    //     { value: "aktif", label: "Aktif", color: "text-green-600" },
    //     { value: "selesai", label: "Selesai", color: "text-blue-600" },
    //     { value: "dikeluarkan", label: "Dikeluarkan", color: "text-red-600" },
    //     { value: "pending", label: "Pending", color: "text-yellow-600" },
    // ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/api/intern/${id}`, {
                method: 'PUT',
                headers: {
                    'Conten-Type': 'application/json',
                },
                body: JSON.stringify({
                    newDivisi
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menyimpan data peserta magang');
            }
            setShowSuccessModal(true);

        } catch (error) {
            console.log('Error', error);
            alert('Terjadi kesalahan saat menyimpan data');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBack}
                        className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Kembali</span>
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Penempatan Tim Anak Magang</h1>
                        <p className="text-gray-600">Lengkapi formulir di bawah untuk memilih penempatan Tim</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Informasi Peserta Magang
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nama */}
                                    <div className="md:col-span-2">
                                        <label className="block text-md font-medium text-gray-700 mb-2">
                                            Nama Lengkap
                                        </label>
                                        <div className="relative">
                                            <div className='text-4xl font-bold text-center p-2'>{newNama}</div>
                                        </div>
                                    </div>

                                    {/* NIM */}
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            NIM
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="nim"
                                                placeholder="Nomor Induk Mahasiswa"
                                                value={newNim}
                                                onChange={(e) => setNewNim(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div> */}

                                    {/* Program Studi */}
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Program Studi
                                        </label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="prodi"
                                                placeholder="Contoh: Teknik Informatika"
                                                value={newProdi}
                                                onChange={(e) => setNewProdi(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div> */}

                                    {/* Universitas */}
                                    {/* <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Universitas/Kampus
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="kampus"
                                                placeholder="Nama universitas atau kampus"
                                                value={newKampus}
                                                onChange={(e) => setNewKampus(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div> */}
                                </div>
                            </div>

                            {/* Timeline Section */}
                            {/* <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Periode Magang
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    Tanggal Mulai
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            name="tanggalMulai"
                                            value={newTanggalMulai}
                                            onChange={handleTanggalMulaiChange}
                                            required
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>

                                    Tanggal Selesai
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            name="tanggalSelesai"
                                            value={newTanggalSelesai}
                                            onChange={handleTanggalSelesaiChange}
                                            required
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div> */}

                            {/* Assignment Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                    Penempatan & Status
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Tim */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tim
                                        </label>
                                        <select
                                            name="tim"
                                            value={newDivisi}
                                            onChange={handleDivisiChange}
                                            required
                                            className="w-full cursor-pointer px-4 py-3 border rounded-lg"
                                        >
                                            <option value="">Pilih Tim</option>
                                            {divisionOptions.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={newStatus}
                                            onChange={handleStatusChange}
                                            required
                                            className="w-full px-4 py-3 border rounded-lg"
                                        >
                                            {statusOptions.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="text-red-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={20} />
                                                Perbarui Data
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Tim Berhasil Diupdate!"
                message="Selamat, data berhasil diperbarui."
                buttonText="Lihat Semua Data"
                redirectUrl="/assignDivision"
            />
        </div>
    )
}
