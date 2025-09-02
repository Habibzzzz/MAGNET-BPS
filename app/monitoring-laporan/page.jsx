'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useUserRole from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import NavbarGeneral from '@/components/NavbarGeneral';
import { FaFileAlt, FaFilePdf, FaFilePowerpoint, FaEye, FaDownload, FaUser, FaCalendarAlt, FaBuilding, FaSearch, FaFilter, FaChartBar } from 'react-icons/fa';

const MonitoringLaporanPage = () => {
  const { user } = useAuth();
  const { role: userRole, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'kegiatan_harian', 'project_akhir'
  const [searchTerm, setSearchTerm] = useState('');
  const [mentor, setMentor] = useState(null);
  const [interns, setInterns] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (roleLoading) return; // tunggu role siap

    if (userRole !== 'admin' && userRole !== 'pembimbing') {
      router.push('/dashboard');
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const init = async () => {
      try {
        const t = await user.getIdToken();
        if (!isActive) return;
        setToken(t);

        if (userRole === 'pembimbing') {
          const m = await fetchMentorData(t, controller.signal);
          if (!isActive) return;
          await fetchLaporan(t, m?._id, controller.signal);
        } else if (userRole === 'admin') {
          await fetchLaporan(t, undefined, controller.signal);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
        }
      }
    };

    init();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [user, userRole, roleLoading, router]);

  // Re-fetch when filter changes, after token and (if needed) mentor loaded
  useEffect(() => {
    if (!user || roleLoading) return;
    if (!token) return;
    const controller = new AbortController();
    if (userRole === 'pembimbing') {
      if (!mentor?._id) return; // wait mentor ready
      fetchLaporan(token, mentor._id, controller.signal);
    } else if (userRole === 'admin') {
      fetchLaporan(token, undefined, controller.signal);
    }
    return () => controller.abort();
  }, [filter, user, roleLoading, token, mentor, userRole]);

  const fetchMentorData = async (t, signal) => {
    try {
      const response = await fetch(`/api/mentor?userId=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${t}`
        },
        signal
      });
      
      const data = await response.json();
      if (data.success && data.pembimbing) {
        setMentor(data.pembimbing);
        
        // Optional: tunda fetch interns untuk percepat initial load
        // Bisa diaktifkan kalau butuh
        // const internsResponse = await fetch(`/api/intern?pembimbingId=${data.pembimbing._id}`, {
        //   headers: { 'Authorization': `Bearer ${t}` }, signal
        // });
        // const internsData = await internsResponse.json();
        // if (internsData.success) setInterns(internsData.interns || []);

        return data.pembimbing;
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
    return null;
  };

  const fetchLaporan = async (t, pembimbingId, signal) => {
    try {
      setLoading(true);
      let url = '/api/laporan';
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('jenis', filter);
      }
      
      // Tambahkan parameter role
      params.append('role', userRole || '');
      if (userRole === 'pembimbing' && pembimbingId) {
        params.append('pembimbingId', pembimbingId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${t}`
        },
        signal
      });
      
      const data = await response.json();
      if (data.success) {
        setLaporan(data.data);
      }
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredLaporan = laporan.filter(item => {
    if (searchTerm === '') return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (item.judul && item.judul.toLowerCase().includes(searchTermLower)) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTermLower)) ||
      (item.nama && item.nama.toLowerCase().includes(searchTermLower)) ||
      (item.divisi && item.divisi.toLowerCase().includes(searchTermLower))
    );
  });

  if (!user || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat data...</p>
          <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'pembimbing') {
    return null; // Sudah di-handle oleh router.push di useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavbarGeneral 
        title="Monitoring Laporan" 
        subTitle={userRole === 'admin' ? "Pantau semua laporan peserta magang" : "Pantau laporan anak bimbingan Anda"} 
      />
      
      <div className="md:max-w-7xl mx-auto p-2 md:p-4">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaFileAlt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Laporan</p>
                <p className="text-2xl font-bold text-blue-600">{filteredLaporan.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaFileAlt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Laporan Harian</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLaporan.filter(item => item.jenis === 'kegiatan_harian').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaFileAlt className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Project Akhir</p>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredLaporan.filter(item => item.jenis === 'project_akhir').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-3 md:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Jenis */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                <FaFilter className="w-4 h-4" />
                <span>Filter:</span>
              </div>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Semua Laporan
              </button>
              <button
                onClick={() => setFilter('kegiatan_harian')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  filter === 'kegiatan_harian' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Kegiatan Harian
              </button>
              <button
                onClick={() => setFilter('project_akhir')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  filter === 'project_akhir' 
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Project Akhir
              </button>
            </div>
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, judul, atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Laporan List */}
        {loading ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-3 md:p-5 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Memuat laporan...</p>
            <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            <div className="p-3 md:p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <FaFileAlt className="w-5 h-5 text-blue-600" />
                Daftar Laporan ({filteredLaporan.length})
              </h2>
            </div>
            
            {filteredLaporan.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaFileAlt className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Tidak ada laporan yang sesuai dengan pencarian' : 'Belum ada laporan'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {searchTerm ? 'Coba ubah kata kunci pencarian Anda' : 'Laporan akan muncul di sini setelah peserta magang mengunggah laporan'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLaporan.map((item, index) => (
                  <div key={index} className="p-3 md:p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            item.jenis === 'kegiatan_harian' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                              : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200'
                          }`}>
                            {item.jenis === 'kegiatan_harian' ? 'Kegiatan Harian' : 'Project Akhir'}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(item.tanggal)}
                          </span>
                        </div>
                        
                                                 <h3 className="text-base font-bold text-gray-900 mb-3 break-words">
                           {item.judul}
                         </h3>
                        
                        <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <FaUser className="text-blue-500" />
                            <span className="font-medium">{item.nama}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                            <FaBuilding className="text-green-500" />
                            <span className="font-medium">{item.divisi}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.filePdf && (
                          <button
                            onClick={() => handleDownload(item.filePdf, `${item.judul}.pdf`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                          >
                            <FaFilePdf className="w-3.5 h-3.5" />
                            <span className="font-medium">PDF</span>
                          </button>
                        )}
                        
                        {item.filePpt && (
                          <button
                            onClick={() => handleDownload(item.filePpt, `${item.judul}.pptx`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                          >
                            <FaFilePowerpoint className="w-3.5 h-3.5" />
                            <span className="font-medium">PPT</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => router.push(`/laporan-detail/${item._id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                          <span className="font-medium">Detail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringLaporanPage;
