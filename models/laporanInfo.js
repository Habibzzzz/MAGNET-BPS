import mongoose from 'mongoose';

const laporanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  nama: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  divisi: {
    type: String,
    required: true
  },
  jenis: {
    type: String,
    required: true,
    enum: ['kegiatan_harian', 'project_akhir']
  },
  judul: {
    type: String,
    required: true
  },
  deskripsi: {
    type: String,
    required: true
  },
  tanggal: {
    type: Date,
    required: true
  },
  filePdf: {
    type: String, // URL file PDF
    default: null
  },
  filePpt: {
    type: String, // URL file PPT
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true // Bisa dilihat user lain
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: String,
    tanggal: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: String,
    nama: String,
    comment: String,
    tanggal: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index untuk pencarian
laporanSchema.index({ userId: 1, jenis: 1 });
laporanSchema.index({ isPublic: 1, createdAt: -1 });
laporanSchema.index({ divisi: 1, jenis: 1 });

// Update updatedAt sebelum save
laporanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.LaporanInfo || mongoose.model('LaporanInfo', laporanSchema);
