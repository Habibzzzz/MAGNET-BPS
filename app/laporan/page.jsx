'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useUserRole from '@/hooks/useUserRole';
import NavbarGeneral from '@/components/NavbarGeneral';
import { FaPlus, FaFileAlt, FaFilePdf, FaFilePowerpoint, FaEye, FaHeart, FaComment, FaEdit, FaTrash, FaDownload, FaUser, FaCalendarAlt, FaBuilding, FaFilter } from 'react-icons/fa';

const LaporanPage = () => {
  const { user } = useAuth();
  const { role: userRole } = useUserRole();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'kegiatan_harian', 'project_akhir'
  const [showModal, setShowModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [formData, setFormData] = useState({
    jenis: 'kegiatan_harian',
    judul: '',
    deskripsi: '',
    tanggal: '',
    filePdf: null,
    filePpt: null,
    isPublic: true
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLaporan();
    }
  }, [user, filter]);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const filterParam = filter !== 'all' ? `?jenis=${filter}` : '';
      
      const response = await fetch(`/api/laporan${filterParam}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = await user.getIdToken();
      
      // Get user data
      const userData = {
        nama: user.displayName || user.email,
        email: user.email,
        divisi: userRole || 'Peserta Magang'
      };
      
      const submitData = {
        ...formData,
        ...userData
      };
      
      const method = selectedLaporan ? 'PUT' : 'POST';
      if (selectedLaporan) {
        submitData.id = selectedLaporan._id;
      }
      
      const response = await fetch('/api/laporan', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      const data = await response.json();
      if (data.success) {
        alert(selectedLaporan ? 'Laporan berhasil diupdate!' : 'Laporan berhasil dibuat!');
        setShowModal(false);
        resetForm();
        fetchLaporan();
      } else {
        alert(data.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error submitting laporan:', error);
      alert('Terjadi kesalahan saat menyimpan laporan');
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return null;
    
    try {
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('userId', user.uid);
      
      const response = await fetch('/api/laporan/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setUploadProgress(prev => ({ ...prev, [type]: 100 }));
        return data.fileUrl;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Error uploading ${type}: ${error.message}`);
      setUploadProgress(prev => ({ ...prev, [type]: -1 }));
      return null;
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file di frontend
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      
      if (file.size > maxSize) {
        // Show modern notification
        setNotification({
          type: 'error',
          title: 'File Terlalu Besar!',
          message: `Ukuran file: ${fileSizeMB} MB (Maksimal: 5 MB). Silakan kompres file atau pilih file yang lebih kecil.`,
          show: true
        });
        
        // Also show alert as fallback
        alert(`❌ File terlalu besar!\n\nUkuran file: ${fileSizeMB} MB\nMaksimal: 5 MB\n\nSilakan kompres file Anda atau pilih file yang lebih kecil.`);
        
        e.target.value = ''; // Reset input
        
        // Auto hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
        
        return;
      }
      
      // Tampilkan konfirmasi ukuran file
      console.log(`📁 File selected: ${file.name} (${fileSizeMB} MB)`);
      
      const fileUrl = await handleFileUpload(file, type);
      if (fileUrl) {
        setFormData(prev => ({
          ...prev,
          [`file${type.charAt(0).toUpperCase() + type.slice(1)}`]: fileUrl
        }));
      }
    }
  };

  const handleLike = async (laporanId) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/laporan/${laporanId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'like'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchLaporan(); // Refresh data
      }
    } catch (error) {
      console.error('Error liking laporan:', error);
    }
  };

  const handleComment = async (laporanId, comment) => {
    if (!comment.trim()) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/laporan/${laporanId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'comment',
          comment: comment.trim(),
          nama: user.displayName || user.email
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchLaporan(); // Refresh data
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleDelete = async (laporanId) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/laporan?id=${laporanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Laporan berhasil dihapus!');
        fetchLaporan();
      }
    } catch (error) {
      console.error('Error deleting laporan:', error);
      alert('Terjadi kesalahan saat menghapus laporan');
    }
  };

  const resetForm = () => {
    setFormData({
      jenis: 'kegiatan_harian',
      judul: '',
      deskripsi: '',
      tanggal: '',
      filePdf: null,
      filePpt: null,
      isPublic: true
    });
    setSelectedLaporan(null);
    setUploadProgress({});
  };

  const openEditModal = (item) => {
    setSelectedLaporan(item);
    setFormData({
      jenis: item.jenis,
      judul: item.judul,
      deskripsi: item.deskripsi,
      tanggal: new Date(item.tanggal).toISOString().split('T')[0],
      filePdf: item.filePdf,
      filePpt: item.filePpt,
      isPublic: item.isPublic
    });
    setShowModal(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavbarGeneral 
        title="Laporan Magang" 
        subTitle="Kelola laporan kegiatan harian dan project akhir Anda" 
      />
      
      {/* Modern Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg border-l-4 ${
            notification.type === 'error' 
              ? 'bg-red-50 border-red-500 text-red-700' 
              : 'bg-green-50 border-green-500 text-green-700'
          } backdrop-blur-sm animate-pulse`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  {notification.type === 'error' ? '⚠️' : '✅'} {notification.title}
                </h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600 ml-3 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                <p className="text-2xl font-bold text-blue-600">{laporan.length}</p>
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
                  {laporan.filter(item => item.jenis === 'kegiatan_harian').length}
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
                    {laporan.filter(item => item.jenis === 'project_akhir').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Add Button */}
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
            
            {/* Add Button */}
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <FaPlus className="w-4 h-4" />
              Tambah Laporan
            </button>
          </div>
        </div>

        {/* Laporan Grid */}
        {loading ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-3 md:p-5 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Memuat laporan...</p>
            <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laporan.map((item) => (
              <LaporanCard
                key={item._id}
                laporan={item}
                currentUser={user}
                userRole={userRole}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
            
            {laporan.length === 0 && (
              <div className="col-span-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-3 md:p-5 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaFileAlt className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada laporan</h3>
                <p className="text-gray-600 text-sm">Mulai buat laporan pertama Anda!</p>
              </div>
            )}
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <LaporanModal
            formData={formData}
            setFormData={setFormData}
            selectedLaporan={selectedLaporan}
            uploadProgress={uploadProgress}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false);
              resetForm();
            }}
            onFileChange={handleFileChange}
          />
        )}
      </div>
    </div>
  );
};

// Komponen LaporanCard
const LaporanCard = ({ laporan, currentUser, userRole, onLike, onComment, onEdit, onDelete }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isOwner = laporan.userId === currentUser.uid;
  const canEditDelete = isOwner || userRole === 'admin'; // Admin bisa edit/delete semua, user hanya miliknya sendiri
  const isLiked = laporan.likes?.some(like => like.userId === currentUser.uid);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment(laporan._id, commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            laporan.jenis === 'kegiatan_harian' 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
              : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200'
          }`}>
            {laporan.jenis === 'kegiatan_harian' ? 'Kegiatan Harian' : 'Project Akhir'}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 break-words">{laporan.judul}</h3>
        </div>
        
        {canEditDelete && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(laporan)}
              className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title={isOwner ? "Edit laporan Anda" : "Edit laporan (Admin)"}
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(laporan._id)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title={isOwner ? "Hapus laporan Anda" : "Hapus laporan (Admin)"}
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{laporan.deskripsi}</p>
      
      {/* Files */}
      <div className="flex gap-2 mb-4">
        {laporan.filePdf && (
          <a
            href={laporan.filePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
          >
            <FaFilePdf className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
        )}
        {laporan.filePpt && (
          <a
            href={laporan.filePpt}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
          >
            <FaFilePowerpoint className="w-3.5 h-3.5" />
            <span>PPT</span>
          </a>
        )}
      </div>

      {/* Meta Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm">
          <FaUser className="text-blue-500 w-3.5 h-3.5" />
          <span className="font-medium text-gray-700">{laporan.nama}</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-sm">
          <FaBuilding className="text-green-500 w-3.5 h-3.5" />
          <span className="font-medium text-gray-700">{laporan.divisi}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
          <FaCalendarAlt className="text-gray-500 w-3.5 h-3.5" />
          <span className="font-medium text-gray-700">{formatDate(laporan.tanggal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(laporan._id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
            }`}
          >
            <FaHeart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{laporan.likes?.length || 0}</span>
          </button>
          
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <FaComment className="w-3.5 h-3.5" />
            <span className="font-medium">{laporan.comments?.length || 0}</span>
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 bg-gray-50 rounded-lg">
            <FaEye className="w-3.5 h-3.5" />
            <span className="font-medium">{laporan.views || 0}</span>
          </div>
        </div>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
            <button
              onClick={handleCommentSubmit}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {laporan.comments && laporan.comments.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4 space-y-2">
          {laporan.comments.slice(-2).map((comment, index) => (
            <div key={index} className="text-sm bg-gray-50 rounded-lg p-2">
              <span className="font-medium text-gray-900">{comment.nama}</span>
              <span className="text-gray-600 ml-2">{comment.comment}</span>
            </div>
          ))}
          {laporan.comments.length > 2 && (
            <p className="text-xs text-gray-500 text-center">dan {laporan.comments.length - 2} komentar lainnya...</p>
          )}
        </div>
      )}
    </div>
  );
};

// Komponen LaporanModal
const LaporanModal = ({ formData, setFormData, selectedLaporan, uploadProgress, onSubmit, onClose, onFileChange }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl border border-white/30">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaFileAlt className="w-5 h-5 text-blue-600" />
            {selectedLaporan ? 'Edit Laporan' : 'Tambah Laporan Baru'}
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Jenis Laporan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Laporan
              </label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData(prev => ({ ...prev, jenis: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                required
              >
                <option value="kegiatan_harian">Kegiatan Harian</option>
                <option value="project_akhir">Project Akhir</option>
              </select>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Laporan
              </label>
              <input
                type="text"
                value={formData.judul}
                onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                placeholder="Masukkan judul laporan"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                placeholder="Deskripsi detail laporan"
                required
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                required
              />
            </div>

            {/* Upload PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF (Opsional)
                <span className="text-xs text-gray-500 ml-2">• Maksimal 5 MB</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => onFileChange(e, 'pdf')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Tips: Kompres PDF jika ukuran lebih dari 5 MB</p>
              {uploadProgress.pdf !== undefined && (
                <div className="mt-2">
                  {uploadProgress.pdf === -1 ? (
                    <p className="text-red-500 text-sm">Upload gagal</p>
                  ) : uploadProgress.pdf === 100 ? (
                    <p className="text-green-500 text-sm">Upload berhasil</p>
                  ) : (
                    <p className="text-blue-500 text-sm">Mengupload... {uploadProgress.pdf}%</p>
                  )}
                </div>
              )}
              {formData.filePdf && (
                <p className="text-sm text-gray-600 mt-1">
                  File: <a href={formData.filePdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat PDF</a>
                </p>
              )}
            </div>

            {/* Upload PPT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PPT (Opsional)
                <span className="text-xs text-gray-500 ml-2">• Maksimal 5 MB</span>
              </label>
              <input
                type="file"
                accept=".ppt,.pptx"
                onChange={(e) => onFileChange(e, 'ppt')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Tips: Kompres PowerPoint jika ukuran lebih dari 5 MB</p>
              {uploadProgress.ppt !== undefined && (
                <div className="mt-2">
                  {uploadProgress.ppt === -1 ? (
                    <p className="text-red-500 text-sm">Upload gagal</p>
                  ) : uploadProgress.ppt === 100 ? (
                    <p className="text-green-500 text-sm">Upload berhasil</p>
                  ) : (
                    <p className="text-blue-500 text-sm">Mengupload... {uploadProgress.ppt}%</p>
                  )}
                </div>
              )}
              {formData.filePpt && (
                <p className="text-sm text-gray-600 mt-1">
                  File: <a href={formData.filePpt} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat PPT</a>
                </p>
              )}
            </div>

            {/* Public/Private */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                Dapat dilihat oleh user lain
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                {selectedLaporan ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;
