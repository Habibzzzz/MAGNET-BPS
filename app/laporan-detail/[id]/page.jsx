'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NavbarGeneral from '@/components/NavbarGeneral';
import { FaArrowLeft, FaFilePdf, FaFilePowerpoint, FaDownload, FaUser, FaCalendarAlt, FaBuilding, FaEye, FaHeart, FaComment, FaFileAlt, FaShare } from 'react-icons/fa';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat data...</p>
          <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat detail laporan...</p>
          <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaFileAlt className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Laporan tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Detail laporan yang Anda cari tidak tersedia atau telah dihapus.</p>
          <button
            onClick={() => router.push('/monitoring-laporan')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Kembali ke Daftar Laporan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavbarGeneral 
        title="Detail Laporan" 
        subTitle="Informasi lengkap laporan" 
      />
      
             <div className="md:max-w-7xl mx-auto p-2 md:p-4">
         
         {/* Back Button */}
         <div className="mb-6">
          <button
            onClick={() => router.push('/monitoring-laporan')}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <FaArrowLeft className="w-5 h-5" />
            <span>Kembali ke Daftar Laporan</span>
          </button>
        </div>

        {/* Laporan Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
                     {/* Header */}
           <div className="p-3 md:p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
             <div className="flex items-center gap-3 mb-4">
               <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                 laporan.jenis === 'kegiatan_harian' 
                   ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                   : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200'
               }`}>
                 {laporan.jenis === 'kegiatan_harian' ? 'Kegiatan Harian' : 'Project Akhir'}
               </span>
               <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                 {formatDate(laporan.createdAt)}
               </span>
             </div>
             
             <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
               {laporan.judul}
             </h1>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                 <FaUser className="text-blue-500 w-4 h-4" />
                 <div>
                   <p className="text-xs text-gray-600">Peserta</p>
                   <p className="font-semibold text-gray-900 text-sm">{laporan.nama}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                 <FaBuilding className="text-green-500 w-4 h-4" />
                 <div>
                   <p className="text-xs text-gray-600">Divisi</p>
                   <p className="font-semibold text-gray-900 text-sm">{laporan.divisi}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                 <FaCalendarAlt className="text-purple-500 w-4 h-4" />
                 <div>
                   <p className="text-xs text-gray-600">Tanggal</p>
                   <p className="font-semibold text-gray-900 text-sm">{formatDate(laporan.tanggal)}</p>
                 </div>
               </div>
             </div>
           </div>

                     {/* Content */}
           <div className="p-3 md:p-5 border-b border-gray-200">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
               <FaFileAlt className="w-5 h-5 text-blue-600" />
               Deskripsi Laporan
             </h2>
             <div className="prose max-w-none">
               <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">{laporan.deskripsi}</p>
             </div>
           </div>

                     {/* Files */}
           <div className="p-3 md:p-5 border-b border-gray-200">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
               <FaDownload className="w-5 h-5 text-green-600" />
               Dokumen Terlampir
             </h2>
             
             {!laporan.filePdf && !laporan.filePpt ? (
               <div className="text-center py-8">
                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                   <FaFileAlt className="w-6 h-6 text-gray-400" />
                 </div>
                 <p className="text-gray-500 text-sm">Tidak ada dokumen terlampir</p>
               </div>
             ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {laporan.filePdf && (
                    <div className="flex items-center gap-2 p-2">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <FaFilePdf className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-xs">{laporan.judul}.pdf</p>
                        <button
                          onClick={() => handleDownload(laporan.filePdf, `${laporan.judul}.pdf`)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs mt-0.5 font-medium"
                        >
                          <FaDownload size={10} /> Download PDF
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {laporan.filePpt && (
                    <div className="flex items-center gap-2 p-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <FaFilePowerpoint className="text-white w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-xs">{laporan.judul}.pptx</p>
                        <button
                          onClick={() => handleDownload(laporan.filePpt, `${laporan.judul}.pptx`)}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-xs mt-0.5 font-medium"
                        >
                          <FaDownload size={10} /> Download PPT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
             )}
           </div>

                     {/* Stats */}
           <div className="p-3 md:p-5 flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                 <FaEye className="text-blue-500 w-4 h-4" />
                 <span className="font-medium text-xs">{laporan.views || 0} kali dilihat</span>
               </div>
               
               <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                 <FaHeart className="text-red-500 w-4 h-4" />
                 <span className="font-medium text-xs">{laporan.likes?.length || 0} suka</span>
               </div>
               
               <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                 <FaComment className="text-blue-500 w-4 h-4" />
                 <span className="font-medium text-xs">{laporan.comments?.length || 0} komentar</span>
               </div>
             </div>
           </div>

                     {/* Comments */}
           <div className="p-3 md:p-5">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
               <FaComment className="w-5 h-5 text-blue-600" />
               Komentar dan Feedback
             </h2>
             
             {laporan.comments && laporan.comments.length > 0 ? (
               <div className="space-y-4 mb-6">
                 {laporan.comments.map((comment, index) => (
                   <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                     <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                           <FaUser className="w-4 h-4 text-white" />
                         </div>
                         <div>
                           <div className="font-semibold text-gray-900 text-sm">{comment.nama}</div>
                           {comment.role && (
                             <span className={`text-xs px-1.5 py-0.5 rounded-full ${
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
                       </div>
                       <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                         {formatDate(comment.tanggal)}
                       </span>
                     </div>
                     <p className="text-gray-700 leading-relaxed text-sm">{comment.comment}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 mb-6">
                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                   <FaComment className="w-6 h-6 text-gray-400" />
                 </div>
                 <p className="text-gray-500 text-sm">Belum ada komentar</p>
                 <p className="text-gray-400 text-xs mt-1">Jadilah yang pertama memberikan feedback</p>
               </div>
             )}
             
             {/* Comment Form */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
               <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                 <FaComment className="w-4 h-4 text-blue-600" />
                 Tambahkan Komentar
               </h3>
               <div className="space-y-3">
                 <textarea
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   rows="3"
                   placeholder="Berikan komentar atau feedback untuk laporan ini..."
                   className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                 ></textarea>
                 <div className="flex justify-end">
                   <button
                     onClick={handleComment}
                     disabled={!commentText.trim()}
                     className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                       commentText.trim() 
                         ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm hover:shadow-md' 
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
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
