'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NavbarGeneral from '@/components/NavbarGeneral';
import { FaArrowLeft, FaFilePdf, FaFilePowerpoint, FaDownload, FaUser, FaCalendarAlt, FaBuilding, FaEye, FaHeart, FaComment } from 'react-icons/fa';

const DetailLaporanPage = () => {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchLaporanDetail();
    }
  }, [user, id]);

  const fetchLaporanDetail = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/laporan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setLaporan(data.data);
      } else {
        console.error('Error fetching laporan detail:', data.message);
      }
    } catch (error) {
      console.error('Error fetching laporan detail:', error);
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/laporan/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'comment',
          comment: commentText.trim(),
          nama: user.displayName || user.email,
          role: userRole
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCommentText('');
        fetchLaporanDetail(); // Refresh data
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Laporan tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Detail laporan yang Anda cari tidak tersedia atau telah dihapus.</p>
          <button
            onClick={() => router.push('/monitoring-laporan')}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Kembali ke Daftar Laporan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavbarGeneral 
        title="Detail Laporan" 
        subTitle="Informasi lengkap laporan" 
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/monitoring-laporan')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              <FaArrowLeft /> Kembali ke Daftar Laporan
            </button>
          </div>

          {/* Laporan Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  laporan.jenis === 'kegiatan_harian' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {laporan.jenis === 'kegiatan_harian' ? 'Kegiatan Harian' : 'Project Akhir'}
                </span>
                <span className="text-sm text-gray-500">
                  Disubmit pada {formatDate(laporan.createdAt)}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {laporan.judul}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUser className="text-gray-400" />
                  <span>{laporan.nama}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <FaBuilding className="text-gray-400" />
                  <span>{laporan.divisi}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{formatDate(laporan.tanggal)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Deskripsi
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{laporan.deskripsi}</p>
              </div>
            </div>

            {/* Files */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dokumen Terlampir
              </h2>
              
              {!laporan.filePdf && !laporan.filePpt ? (
                <p className="text-gray-500">Tidak ada dokumen terlampir</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {laporan.filePdf && (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                      <FaFilePdf className="text-red-500 text-2xl" />
                      <div>
                        <p className="font-medium text-gray-900">{laporan.judul}.pdf</p>
                        <button
                          onClick={() => handleDownload(laporan.filePdf, `${laporan.judul}.pdf`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-1"
                        >
                          <FaDownload size={14} /> Download
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {laporan.filePpt && (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                      <FaFilePowerpoint className="text-orange-500 text-2xl" />
                      <div>
                        <p className="font-medium text-gray-900">{laporan.judul}.pptx</p>
                        <button
                          onClick={() => handleDownload(laporan.filePpt, `${laporan.judul}.pptx`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-1"
                        >
                          <FaDownload size={14} /> Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="p-6 flex items-center justify-between text-sm text-gray-500 border-b">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <FaEye />
                  <span>{laporan.views || 0} kali dilihat</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <FaHeart className="text-red-500" />
                  <span>{laporan.likes?.length || 0} suka</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <FaComment className="text-blue-500" />
                  <span>{laporan.comments?.length || 0} komentar</span>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Komentar dan Feedback
              </h2>
              
              {laporan.comments && laporan.comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {laporan.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium flex items-center gap-2">
                          <span>{comment.nama}</span>
                          {comment.role && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              comment.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : comment.role === 'pembimbing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {comment.role === 'admin' ? 'Admin' : 
                               comment.role === 'pembimbing' ? 'Pembimbing' : 'Peserta Magang'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.tanggal)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">Belum ada komentar</p>
              )}
              
              {/* Comment Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Tambahkan Komentar</h3>
                <div className="flex flex-col gap-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows="3"
                    placeholder="Berikan komentar atau feedback untuk laporan ini..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className={`self-end px-4 py-2 rounded-lg ${
                      commentText.trim() 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    } transition`}
                  >
                    Kirim Komentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailLaporanPage;
