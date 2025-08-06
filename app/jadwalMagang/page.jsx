"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const DAILY_QUOTA = 15;

export default function JadwalMagang() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interns, setInterns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalInterns, setModalInterns] = useState([]);

  useEffect(() => {
    axios.get("/api/intern").then((res) => {
      setInterns(res.data.interns || []);
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Jadwal & Kuota Magang</h1>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded hover:bg-gray-100">
            &#8592;
          </button>
          <span className="font-semibold text-xl">
            {currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded hover:bg-gray-100">
            &#8594;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 bg-white rounded-lg shadow p-4">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
            <div key={d} className="text-center font-bold text-blue-700">{d}</div>
          ))}
          {(() => {
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
            return Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ));
          })()}
          {days.map((date) => {
            const list = internsByDate.get(date.toDateString()) || [];
            return (
              <div
                key={date.toISOString()}
                className="border rounded-lg p-2 min-h-[70px] flex flex-col items-center justify-between hover:bg-blue-50 cursor-pointer"
                onClick={() => openModal(date)}
              >
                <span className="font-bold">{date.getDate()}</span>
                <span className="text-xs text-gray-600">{list.length}/{DAILY_QUOTA} slot</span>
                {list.length > 0 && (
                  <span className="text-[10px] text-blue-500 mt-1">Lihat Detail</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button className="absolute top-2 right-2 p-2" onClick={closeModal}>
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-xl font-bold mb-2 text-center">
              {modalDate ? formatDate(modalDate) : ""}
            </h2>
            <div className="mb-2 text-center text-blue-700 font-semibold">
              Kuota: {modalInterns.length}/{DAILY_QUOTA} slot terisi
            </div>
            <div className="max-h-64 overflow-y-auto">
              {modalInterns.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada peserta magang di tanggal ini.</p>
              ) : (
                <ul className="space-y-2">
                  {modalInterns.map((intern, idx) => (
                    <li key={intern._id || idx} className="border-b py-1">
                      <span className="font-medium">{intern.nama}</span>
                      <span className="text-xs text-gray-500 ml-2">{intern.divisi}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
