import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LaporanInfo from '@/models/laporanInfo';
import InternInfo from '../../../models/internInfo';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get('jenis'); // 'kegiatan_harian' atau 'project_akhir'
    const userId = searchParams.get('userId'); // Filter by user
    const divisi = searchParams.get('divisi'); // Filter by divisi
    const role = searchParams.get('role'); // 'admin' atau 'pembimbing'
    const pembimbingId = searchParams.get('pembimbingId'); // ID pembimbing untuk filter
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increase default limit for monitoring
    
    // Default filter
    let filter = {};
    
    // Filter berdasarkan role
    if (role !== 'admin' && role !== 'pembimbing') {
      // Untuk peserta magang, hanya lihat laporan public atau miliknya sendiri
      filter = { $or: [{ isPublic: true }, { userId }] };
    } else if (role === 'pembimbing' && pembimbingId) {
      // Untuk pembimbing, hanya laporan dari anak bimbingannya
      const internInfo = await InternInfo.find({ pembimbing: pembimbingId }).lean();
      const internUserIds = internInfo.map(intern => intern.userId);
      filter = { userId: { $in: internUserIds } };
    }
    // Admin bisa lihat semua laporan (tidak perlu filter tambahan)
    
    if (jenis) filter.jenis = jenis;
    if (userId) filter.userId = userId;
    if (divisi) filter.divisi = divisi;
    
    const skip = (page - 1) * limit;
    
    const laporan = await LaporanInfo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Jika role pembimbing/admin, tambahkan data intern untuk memudahkan monitoring
    if (role === 'admin' || role === 'pembimbing') {
      const userIds = [...new Set(laporan.map(item => item.userId))];
      const interns = await InternInfo
        .find({ userId: { $in: userIds } })
        .lean();
      
      const userIdToIntern = {};
      interns.forEach(intern => {
        userIdToIntern[intern.userId] = intern;
      });
      
      // Tambahkan data intern ke laporan
      laporan.forEach(item => {
        if (userIdToIntern[item.userId]) {
          const intern = userIdToIntern[item.userId];
          item.internInfo = {
            _id: intern._id,
            nim: intern.nim,
            prodi: intern.prodi,
            kampus: intern.kampus
          };
        }
      });
    }
    
    const total = await LaporanInfo.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: laporan,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    // Verify Firebase token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const body = await request.json();
    const { jenis, judul, deskripsi, tanggal, filePdf, filePpt, isPublic, nama, email, divisi } = body;
    
    // Validasi input
    if (!jenis || !judul || !deskripsi || !tanggal) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['kegiatan_harian', 'project_akhir'].includes(jenis)) {
      return NextResponse.json(
        { success: false, message: 'Invalid jenis laporan' },
        { status: 400 }
      );
    }
    
    const newLaporan = new LaporanInfo({
      userId,
      nama,
      email,
      divisi,
      jenis,
      judul,
      deskripsi,
      tanggal: new Date(tanggal),
      filePdf: filePdf || null,
      filePpt: filePpt || null,
      isPublic: isPublic !== false // Default true
    });
    
    await newLaporan.save();
    
    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dibuat',
      data: newLaporan
    });
    
  } catch (error) {
    console.error('Error creating laporan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    
    // Verify Firebase token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const body = await request.json();
    const { id, jenis, judul, deskripsi, tanggal, filePdf, filePpt, isPublic } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Laporan ID required' },
        { status: 400 }
      );
    }
    
    // Cek apakah laporan milik user
    const laporan = await LaporanInfo.findOne({ _id: id, userId });
    if (!laporan) {
      return NextResponse.json(
        { success: false, message: 'Laporan not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Update laporan
    const updateData = {};
    if (jenis) updateData.jenis = jenis;
    if (judul) updateData.judul = judul;
    if (deskripsi) updateData.deskripsi = deskripsi;
    if (tanggal) updateData.tanggal = new Date(tanggal);
    if (filePdf !== undefined) updateData.filePdf = filePdf;
    if (filePpt !== undefined) updateData.filePpt = filePpt;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    updateData.updatedAt = new Date();
    
    await LaporanInfo.findByIdAndUpdate(id, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil diupdate'
    });
    
  } catch (error) {
    console.error('Error updating laporan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    // Verify Firebase token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Laporan ID required' },
        { status: 400 }
      );
    }
    
    // Cek apakah laporan milik user
    const laporan = await LaporanInfo.findOne({ _id: id, userId });
    if (!laporan) {
      return NextResponse.json(
        { success: false, message: 'Laporan not found or unauthorized' },
        { status: 404 }
      );
    }
    
    await LaporanInfo.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Error deleting laporan:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
