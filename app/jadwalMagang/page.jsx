"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Users, Eye, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

const DAILY_QUOTA = 15;

export default function JadwalMagang() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interns, setInterns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalInterns, setModalInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/intern");
        setInterns(response.data.interns || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const internsByDate = useMemo(() => {
    const map = new Map();
    interns.forEach((intern) => {
      const start = new Date(intern.tanggalMulai);
      const end = new Date(intern.tanggalSelesai);
      let d = new Date(start);
      d.setHours(0, 0, 0, 0);
      while (d <= end) {
        const key = d.toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(intern);
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [interns]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + dir);
    setCurrentDate(newDate);
  };

  const openModal = (date) => {
    setModalDate(date);
    setModalInterns(internsByDate.get(date.toDateString()) || []);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  const formatDate = (date) =>
    date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const getQuotaColor = (count) => {
    const percentage = (count / DAILY_QUOTA) * 100;
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-orange-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getQuotaBgColor = (count) => {
    const percentage = (count / DAILY_QUOTA) * 100;
    if (percentage >= 80) return "bg-red-50 border-red-200";
    if (percentage >= 60) return "bg-orange-50 border-orange-200";
    if (percentage >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  const getQuotaStatus = (count) => {
    const percentage = (count / DAILY_QUOTA) * 100;
    if (percentage >= 80) return "Penuh";
    if (percentage >= 60) return "Hampir Penuh";
    if (percentage >= 40) return "Sedang";
    return "Tersedia";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat jadwal magang...</p>
          <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Jadwal & Kuota Magang
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Pantau ketersediaan slot magang setiap harinya
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Slot per Hari</p>
                <p className="text-2xl font-bold text-blue-600">{DAILY_QUOTA}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Peserta</p>
                <p className="text-2xl font-bold text-green-600">{interns.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigateMonth(-1)} 
                  className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                </h2>
                <button 
                  onClick={() => navigateMonth(1)} 
                  className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Tersedia</span>
                <div className="w-3 h-3 bg-yellow-400 rounded-full ml-3"></div>
                <span className="text-sm">Sedang</span>
                <div className="w-3 h-3 bg-red-400 rounded-full ml-3"></div>
                <span className="text-sm">Penuh</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-3 mb-6">
              {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
                <div key={day} className="text-center">
                  <div className="font-bold text-gray-700 text-sm lg:text-base py-3">
                    {day}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-3">
              {/* Empty cells for first day offset */}
              {(() => {
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                return Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} className="h-28 lg:h-32" />
                ));
              })()}

              {/* Date cells */}
              {days.map((date) => {
                const list = internsByDate.get(date.toDateString()) || [];
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date() && !isToday;
                const quotaPercentage = (list.length / DAILY_QUOTA) * 100;
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      h-28 lg:h-32 border-2 rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer transition-all duration-300
                      ${isToday 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105' 
                        : isPast 
                          ? 'border-gray-200 bg-gray-50/50' 
                          : 'border-gray-200 bg-white/80 hover:border-blue-300 hover:shadow-lg hover:scale-105'
                      }
                      ${list.length > 0 ? 'hover:bg-blue-50/80' : ''}
                    `}
                    onClick={() => openModal(date)}
                  >
                    <div className="flex flex-col items-center w-full">
                      <span className={`
                        font-bold text-lg lg:text-xl mb-2
                        ${isToday ? 'text-blue-700' : 'text-gray-800'}
                      `}>
                        {date.getDate()}
                      </span>
                      
                      <div className="text-center w-full">
                        <div className={`
                          text-xs lg:text-sm font-semibold mb-1 px-2 py-1 rounded-full
                          ${quotaPercentage >= 80 ? 'bg-red-100 text-red-700' : 
                            quotaPercentage >= 60 ? 'bg-orange-100 text-orange-700' : 
                            quotaPercentage >= 40 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'}
                        `}>
                          {list.length}/{DAILY_QUOTA}
                        </div>
                        
                        {list.length > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Eye className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] lg:text-xs text-blue-600 font-medium">Detail</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {modalDate ? formatDate(modalDate) : ""}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Detail peserta magang
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <span className="text-2xl text-gray-400 hover:text-gray-600">&times;</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Kuota Summary */}
              <div className={`mb-6 p-4 rounded-2xl border ${getQuotaBgColor(modalInterns.length)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-gray-600" />
                    <div>
                      <span className="font-semibold text-gray-800">Kuota Terisi</span>
                      <p className="text-sm text-gray-600">{getQuotaStatus(modalInterns.length)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getQuotaColor(modalInterns.length)}`}>
                      {modalInterns.length}/{DAILY_QUOTA}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((modalInterns.length / DAILY_QUOTA) * 100)}% terisi
                    </div>
                  </div>
                </div>
              </div>

              {/* Participant List */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Daftar Peserta:</h3>
                {modalInterns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">Belum ada peserta magang</p>
                    <p className="text-gray-400 text-sm mt-2">di tanggal ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modalInterns.map((intern, idx) => (
                      <div key={intern._id || idx} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-lg mb-1">{intern.nama}</div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Divisi:</span> {intern.divisi || 'Belum ditentukan'}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                              <span>{intern.prodi}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{intern.kampus}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
