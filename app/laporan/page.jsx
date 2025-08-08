'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NavbarGeneral from '@/components/NavbarGeneral';
import { FaPlus, FaFileAlt, FaFilePdf, FaFilePowerpoint, FaEye, FaHeart, FaComment, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

const LaporanPage = () => {
  const { user, userRole } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavbarGeneral 
        title="Laporan Magang" 
        subTitle="Kelola laporan kegiatan harian dan project akhir Anda" 
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Semua Laporan
              </button>
              <button
                onClick={() => setFilter('kegiatan_harian')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'kegiatan_harian' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kegiatan Harian
              </button>
              <button
                onClick={() => setFilter('project_akhir')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'project_akhir' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Project Akhir
              </button>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus /> Tambah Laporan
            </button>
          </div>

          {/* Laporan Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat laporan...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laporan.map((item) => (
                <LaporanCard
                  key={item._id}
                  laporan={item}
                  currentUser={user}
                  onLike={handleLike}
                  onComment={handleComment}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
              
              {laporan.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada laporan</h3>
                  <p className="text-gray-600">Mulai buat laporan pertama Anda!</p>
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
    </div>
  );
};

// Komponen LaporanCard
const LaporanCard = ({ laporan, currentUser, onLike, onComment, onEdit, onDelete }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isOwner = laporan.userId === currentUser.uid;
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            laporan.jenis === 'kegiatan_harian' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {laporan.jenis === 'kegiatan_harian' ? 'Kegiatan Harian' : 'Project Akhir'}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mt-2">{laporan.judul}</h3>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(laporan)}
              className="text-blue-500 hover:text-blue-700"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(laporan._id)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-600 mb-4 line-clamp-3">{laporan.deskripsi}</p>
      
      {/* Files */}
      <div className="flex gap-2 mb-4">
        {laporan.filePdf && (
          <a
            href={laporan.filePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
          >
            <FaFilePdf /> PDF
          </a>
        )}
        {laporan.filePpt && (
          <a
            href={laporan.filePpt}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm"
          >
            <FaFilePowerpoint /> PPT
          </a>
        )}
      </div>

      {/* Meta Info */}
      <div className="text-sm text-gray-500 mb-4">
        <p>Oleh: {laporan.nama}</p>
        <p>Divisi: {laporan.divisi}</p>
        <p>Tanggal: {formatDate(laporan.tanggal)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(laporan._id)}
            className={`flex items-center gap-1 ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <FaHeart className={isLiked ? 'fill-current' : ''} />
            <span>{laporan.likes?.length || 0}</span>
          </button>
          
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
          >
            <FaComment />
            <span>{laporan.comments?.length || 0}</span>
          </button>
          
          <div className="flex items-center gap-1 text-gray-500">
            <FaEye />
            <span>{laporan.views || 0}</span>
          </div>
        </div>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="mt-4 border-t pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
            <button
              onClick={handleCommentSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      {laporan.comments && laporan.comments.length > 0 && (
        <div className="mt-4 border-t pt-4 space-y-2">
          {laporan.comments.slice(-2).map((comment, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-gray-900">{comment.nama}</span>
              <span className="text-gray-600 ml-2">{comment.comment}</span>
            </div>
          ))}
          {laporan.comments.length > 2 && (
            <p className="text-xs text-gray-500">dan {laporan.comments.length - 2} komentar lainnya...</p>
          )}
        </div>
      )}
    </div>
  );
};

// Komponen LaporanModal
const LaporanModal = ({ formData, setFormData, selectedLaporan, uploadProgress, onSubmit, onClose, onFileChange }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {selectedLaporan ? 'Edit Laporan' : 'Tambah Laporan Baru'}
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Jenis Laporan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Laporan
              </label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData(prev => ({ ...prev, jenis: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Upload PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF (Opsional)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => onFileChange(e, 'pdf')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              </label>
              <input
                type="file"
                accept=".ppt,.pptx"
                onChange={(e) => onFileChange(e, 'ppt')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
