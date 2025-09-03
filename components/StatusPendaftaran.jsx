'use client';

import { useState } from 'react';
import { AlertCircle, Clock, X, User, GraduationCap, Building, Calendar, FileSearch } from 'lucide-react';

export default function StatusPendaftaran() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchStatusData = async () => {
        if (dataLoaded) return; // Jangan fetch lagi kalau udah ada data
        
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/status-pendaftaran');
            
            if (!response.ok) {
                throw new Error('Gagal mengambil data status pendaftaran');
            }
            
            const result = await response.json();
            
            if (result.success) {
                setStatusData(result.data);
                setDataLoaded(true);
            } else {
                throw new Error(result.message || 'Gagal memuat data');
            }
        } catch (err) {
            console.error('Error fetching status data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        if (!dataLoaded) {
            fetchStatusData();
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderModalContent = () => {
        if (loading) {
            return (
                <div className="p-8">
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Memuat data status pendaftaran...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (!statusData || (statusData.pending.length === 0 && statusData.ditolak.length === 0)) {
            return (
                <div className="p-8">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold text-lg">✓</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-800">Tidak Ada Pendaftaran Menunggu</h3>
                                <p className="text-green-600 text-sm">Semua pendaftaran sudah diproses</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const totalPending = statusData.pending.length;
        const totalDitolak = statusData.ditolak.length;

        return (
            <div className="max-h-[70vh] overflow-y-auto">
                {/* Summary Stats */}
                <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-700">{totalPending}</p>
                                    <p className="text-sm text-orange-600">Menunggu Persetujuan</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <X className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-700">{totalDitolak}</p>
                                    <p className="text-sm text-red-600">Ditolak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Lists */}
                <div className="p-6">
                    {/* Pending Section */}
                    {totalPending > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Menunggu Persetujuan ({totalPending})
                            </h4>
                            <div className="space-y-3">
                                {statusData.pending.map((intern, index) => (
                                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span className="font-semibold text-gray-900">{intern.nama}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <GraduationCap className="w-3 h-3" />
                                                        <span>{intern.nim} • {intern.prodi}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Building className="w-3 h-3" />
                                                        <span>{intern.kampus}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 md:col-span-2">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formatDate(intern.tanggalMulai)} - {formatDate(intern.tanggalSelesai)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejected Section */}
                    {totalDitolak > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <X className="w-4 h-4 text-red-500" />
                                Ditolak ({totalDitolak})
                            </h4>
                            <div className="space-y-3">
                                {statusData.ditolak.map((intern, index) => (
                                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span className="font-semibold text-gray-900">{intern.nama}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <GraduationCap className="w-3 h-3" />
                                                        <span>{intern.nim} • {intern.prodi}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Building className="w-3 h-3" />
                                                        <span>{intern.kampus}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 md:col-span-2">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formatDate(intern.tanggalMulai)} - {formatDate(intern.tanggalSelesai)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                                Ditolak
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleOpenModal}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                <FileSearch className="w-4 h-4" />
                Cek Status Pendaftaran
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl border border-white/30">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FileSearch className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Status Pendaftaran Magang</h3>
                                    <p className="text-sm text-gray-600">Data pendaftaran yang menunggu proses</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </>
    );
}