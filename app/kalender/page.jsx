"use client"

import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { ChevronLeft, ChevronRight, User, Calendar, Building, GraduationCap, MapPin, Clock, Mail, Hash, X } from 'lucide-react';
import NavbarGeneral from '@/components/NavbarGeneral';
import axios from 'axios';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";

// Fungsi untuk menormalkan tanggal (menghilangkan komponen waktu)
const normalizeDate = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const InternCalendar = () => {
  const DAILY_QUOTA = 15;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [interns, setInterns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayDetail, setDayDetail] = useState({
    isOpen: false,
    date: null,
    interns: [],
  });
  const [previousDayDetail, setPreviousDayDetail] = useState({
    isOpen: false,
    date: null,
    interns: [],
  });
  const [canViewDetail, setCanViewDetail] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const token = await user.getIdTokenResult();
      const role = token.claims.role;
      setCanViewDetail(role === "admin" || role === "pembimbing");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/intern');

        if (!response.ok) {
          throw new Error('Gagal mengambil data intern');
        }

        const data = await response.json();

        const processedData = data.interns.map(intern => ({
          ...intern,
          tanggalMulai: new Date(intern.tanggalMulai),
          tanggalSelesai: new Date(intern.tanggalSelesai)
        }));

        setInterns(processedData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching intern data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, []);

  const internsByDate = useMemo(() => {
    const dateMap = new Map();
    if (!interns || interns.length === 0) return dateMap;

    interns.forEach(intern => {
      const startDate = normalizeDate(intern.tanggalMulai);
      const endDate = normalizeDate(intern.tanggalSelesai);

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toDateString();

        if (!dateMap.has(dateString)) {
          dateMap.set(dateString, []);
        }
        dateMap.get(dateString).push(intern);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return dateMap;
  }, [interns]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(1);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleInternClick = (intern) => {
    if (!canViewDetail) return;
    // Simpan data modal detail harian sebelum membuka modal detail peserta
    setPreviousDayDetail({
      isOpen: true,
      date: dayDetail.date,
      interns: dayDetail.interns,
    });
    setSelectedIntern(intern);
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIntern(null);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) return 'Invalid Date';
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'selesai': return 'bg-blue-100 text-blue-800';
      case 'dikeluarkan': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuotaColor = (count) => {
    if (count >= 10) return "text-red-600";
    if (count >= 7) return "text-orange-600";
    if (count >= 4) return "text-yellow-600";
    return "text-green-600";
  };

  const statusPriority = {
    'pending': 1,
    'aktif': 2,
    'selesai': 3,
    'dikeluarkan': 4
  };


  const days = getDaysInMonth(currentDate);

  if (loading) {
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen"><div className="text-lg text-red-600">Error: {error}</div></div>;
  }

  const openDayDetailModal = (date, internsForDate) => {
    setDayDetail({
      isOpen: true,
      date: date,
      interns: internsForDate,
    });
  };

  const closeDayDetailModal = () => {
    setDayDetail({ isOpen: false, date: null, interns: [] });
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto p-6">
        {/* Modal untuk Daftar Intern Harian */}
        {dayDetail.isOpen && (
          <div className="fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
              {/* Header Modal */}
              <div className="p-6 border-b flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {formatDate(dayDetail.date)}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                    <span>
                      <span className="font-semibold text-blue-600">{dayDetail.interns.length}</span> / {DAILY_QUOTA} Slot Terisi
                    </span>
                    <span className="font-semibold text-green-600">
                      {Math.max(0, DAILY_QUOTA - dayDetail.interns.length)} Slot Tersisa
                    </span>
                  </div>
                </div>
                                 <button 
                   onClick={() => {
                     closeDayDetailModal();
                     setPreviousDayDetail({ isOpen: false, date: null, interns: [] });
                   }} 
                   className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

                             {/* Konten (Daftar Nama) */}
               <div className="p-6 overflow-y-auto">
                 <ul className="space-y-3">
                   {dayDetail.interns.map(intern => (
                     <li key={intern._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                       <span className="font-medium text-gray-800">{intern.nama}</span>
                                               {canViewDetail && (
                          <button
                            onClick={() => {
                              handleInternClick(intern);
                            }}
                            className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors font-medium"
                          >
                            Lihat Detail
                          </button>
                        )}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        )}
        <NavbarGeneral title="Kalender Jadwal Peserta Magang" subTitle="Pantau setiap tanggal dari periode setiap peserta magang" />
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          {/* Judul */}
          <h1 className="text-3xl font-bold text-gray-900">Kalender Magang</h1>

          {/* Kontainer untuk Navigasi dan Legenda */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-6">

            {/* Legenda Pewarnaan */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-white border border-gray-300"></div>
                <span className="text-sm text-gray-600">Hari Kerja</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div>
                <span className="text-sm text-gray-600">Akhir Pekan</span>
              </div>
            </div>

            {/* Navigasi Bulan */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 min-w-[12rem] text-center">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Legenda Pewarnaan Status Intern */}
        <div className="flex flex-wrap items-center space-x-4 mt-2">
          {[
            { label: 'Aktif', className: 'bg-green-100 text-green-800' },
            { label: 'Selesai', className: 'bg-blue-100 text-blue-800' },
            { label: 'Dikeluarkan', className: 'bg-red-100 text-red-800' },
            { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded ${item.className}`}></span>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>


        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {daysOfWeek.map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr">
            {days.map((date, index) => {
              const internsForDate = date ? internsByDate.get(date.toDateString()) || [] : [];
              const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-32 border-b border-r border-gray-200 p-2 flex flex-col justify-between ${!date ? 'bg-gray-50'
                    : isWeekend ? 'bg-red-50 hover:bg-red-100'
                      : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  {date && (
                    <>
                      {/* Konten atas */}
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </div>
                        {internsForDate.length > 0 && (
                          <div className="text-center">
                            <span className={`text-xs font-semibold ${getQuotaColor(internsForDate.length)}`}>
                              {internsForDate.length} peserta
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tombol Detail di bawah */}
                      <div className="mt-2">
                        {internsForDate.length > 0 && (
                          <button
                            onClick={() => openDayDetailModal(date, internsForDate)}
                            className="w-full cursor-pointer text-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            Lihat Detail
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedIntern && (
          <div className="fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
                             <div className="p-6 border-b flex justify-between items-center">
                                   <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        closeModal();
                        setDayDetail(previousDayDetail);
                      }}
                      className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Kembali 
                    </button>
                  </div>
                 <h3 className="text-2xl font-bold text-gray-900">Detail Magang</h3>
                                   <button 
                    onClick={() => {
                      closeModal();
                      setDayDetail({ isOpen: false, date: null, interns: [] });
                    }} 
                    className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Data Diri */}
                    {[
                      { icon: User, label: 'Nama', value: selectedIntern.nama },
                      { icon: Hash, label: 'NIM', value: selectedIntern.nim },
                      { icon: GraduationCap, label: 'Program Studi', value: selectedIntern.prodi },
                      { icon: Building, label: 'Kampus', value: selectedIntern.kampus },
                      { icon: Mail, label: 'Email', value: selectedIntern.email },
                    ].map((item, idx) => item.value && (
                      <div key={idx} className="flex items-start space-x-3">
                        <item.icon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                          <p className="font-semibold">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {/* Info Magang */}
                    {[
                      { icon: Calendar, label: 'Tanggal Mulai', value: formatDate(selectedIntern.tanggalMulai) },
                      { icon: Calendar, label: 'Tanggal Selesai', value: formatDate(selectedIntern.tanggalSelesai) },
                      { icon: Building, label: 'Divisi', value: selectedIntern.divisi },
                      { icon: User, label: 'Pembimbing', value: selectedIntern.pembimbing?.nama || '-' },
                    ].map((item, idx) => item.value && (
                      <div key={idx} className="flex items-start space-x-3">
                        <item.icon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                          <p className="font-semibold">{item.value}</p>
                        </div>
                      </div>
                    ))}
                                         {selectedIntern.status && (
                       <div className="flex items-start space-x-3">
                         <Clock className="w-5 h-5 text-gray-500 mt-1" />
                         <div>
                           <p className="text-sm text-gray-500">Status</p>
                           <p><span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIntern.status)}`}>
                             {selectedIntern.status.charAt(0).toUpperCase() + selectedIntern.status.slice(1)}
                           </span></p>
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default InternCalendar;

