"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Users, Eye } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat jadwal magang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section dengan tombol back */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800">
                Jadwal & Kuota Magang
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Pantau ketersediaan slot magang setiap harinya
            </p>
          </div>
          
          <div className="w-32"></div> {/* Spacer untuk balance */}
        </div>

        {/* Navigation dan Statistik */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateMonth(-1)} 
                className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <span className="text-2xl font-bold text-gray-800">
                {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
              </span>
              <button 
                onClick={() => navigateMonth(1)} 
                className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Statistik */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {DAILY_QUOTA}
                </div>
                <div className="text-sm text-gray-600">Slot per Hari</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {interns.length}
                </div>
                <div className="text-sm text-gray-600">Total Peserta</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div key={d} className="text-center font-bold text-blue-700 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for first day offset */}
            {(() => {
              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
              return Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ));
            })()}

            {/* Date cells */}
            {days.map((date) => {
              const list = internsByDate.get(date.toDateString()) || [];
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date() && !isToday;
              
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    h-24 border-2 rounded-xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-200
                    ${isToday 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : isPast 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }
                    ${list.length > 0 ? 'hover:bg-blue-50' : ''}
                  `}
                  onClick={() => openModal(date)}
                >
                  <span className={`font-bold text-lg ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {date.getDate()}
                  </span>
                  <div className="text-center">
                    <span className={`text-xs font-semibold ${getQuotaColor(list.length)}`}>
                      {list.length}/{DAILY_QUOTA} slot
                    </span>
                    {list.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] text-blue-500 font-medium">Detail</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
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
            <div className="p-6 overflow-y-auto">
              {/* Kuota Summary */}
              <div className={`mb-6 p-4 rounded-xl ${getQuotaBgColor(modalInterns.length)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-800">Kuota Terisi</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getQuotaColor(modalInterns.length)}`}>
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
                <h3 className="font-semibold text-gray-800 mb-3">Daftar Peserta:</h3>
                {modalInterns.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Belum ada peserta magang di tanggal ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modalInterns.map((intern, idx) => (
                      <div key={intern._id || idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">{intern.nama}</div>
                            <div className="text-sm text-gray-600">{intern.divisi || 'Belum ditentukan'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">{intern.prodi}</div>
                            <div className="text-xs text-gray-500">{intern.kampus}</div>
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
