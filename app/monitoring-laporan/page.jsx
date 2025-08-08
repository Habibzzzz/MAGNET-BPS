'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import NavbarGeneral from '@/components/NavbarGeneral';
import { FaFileAlt, FaFilePdf, FaFilePowerpoint, FaEye, FaDownload, FaUser, FaCalendarAlt, FaBuilding, FaSearch } from 'react-icons/fa';

const MonitoringLaporanPage = () => {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'kegiatan_harian', 'project_akhir'
  const [searchTerm, setSearchTerm] = useState('');
  const [mentor, setMentor] = useState(null);
  const [interns, setInterns] = useState([]);

  useEffect(() => {
    if (user) {
      if (userRole !== 'admin' && userRole !== 'pembimbing') {
        router.push('/dashboard');
        return;
      }
      
      // Jika pembimbing, ambil data mentor
      if (userRole === 'pembimbing') {
        fetchMentorData();
      }
      
      fetchLaporan();
    }
  }, [user, userRole, router, filter]);

  const fetchMentorData = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/mentor?userId=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success && data.pembimbing) {
        setMentor(data.pembimbing);
        
        // Ambil data intern yang dibimbing
        const internsResponse = await fetch(`/api/intern?pembimbingId=${data.pembimbing._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const internsData = await internsResponse.json();
        if (internsData.success) {
          setInterns(internsData.interns || []);
        }
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
  };

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      let url = '/api/laporan';
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('jenis', filter);
      }
      
      // Tambahkan parameter role
      params.append('role', userRole);
      if (userRole === 'pembimbing' && mentor?._id) {
        params.append('pembimbingId', mentor._id);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'pembimbing') {
    return null; // Sudah di-handle oleh router.push di useEffect
  }

  return (
    <div>
      <NavbarGeneral 
        title="Monitoring Laporan" 
        subTitle={userRole === 'admin' ? "Pantau semua laporan peserta magang" : "Pantau laporan anak bimbingan Anda"} 
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter & Search */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filter Jenis */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua Laporan
                </button>
                <button
                  onClick={() => setFilter('kegiatan_harian')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'kegiatan_harian' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Kegiatan Harian
                </button>
                <button
                  onClick={() => setFilter('project_akhir')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'project_akhir' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaFileAlt className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Laporan</p>
                  <p className="text-xl font-semibold">{filteredLaporan.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaFileAlt className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Laporan Harian</p>
                  <p className="text-xl font-semibold">
                    {filteredLaporan.filter(item => item.jenis === 'kegiatan_harian').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaFileAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Project Akhir</p>
                  <p className="text-xl font-semibold">
                    {filteredLaporan.filter(item => item.jenis === 'project_akhir').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Laporan List */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat laporan...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Daftar Laporan ({filteredLaporan.length})</h2>
              </div>
              
              {filteredLaporan.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Tidak ada laporan yang sesuai dengan pencarian' : 'Belum ada laporan'}
                  </h3>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredLaporan.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.jenis === 'kegiatan_harian' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.jenis === 'kegiatan_harian' ? 'Kegiatan Harian' : 'Project Akhir'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.tanggal)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.judul}
                          </h3>
                          
                          <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FaUser className="text-gray-400" />
                              <span>{item.nama}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <FaBuilding className="text-gray-400" />
                              <span>{item.divisi}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.deskripsi}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {item.filePdf && (
                            <button
                              onClick={() => handleDownload(item.filePdf, `${item.judul}.pdf`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-sm"
                            >
                              <FaFilePdf />
                              PDF
                            </button>
                          )}
                          
                          {item.filePpt && (
                            <button
                              onClick={() => handleDownload(item.filePpt, `${item.judul}.pptx`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition text-sm"
                            >
                              <FaFilePowerpoint />
                              PPT
                            </button>
                          )}
                          
                          <button
                            onClick={() => router.push(`/laporan-detail/${item._id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-sm"
                          >
                            <FaEye />
                            Detail
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
    </div>
  );
};

export default MonitoringLaporanPage;
