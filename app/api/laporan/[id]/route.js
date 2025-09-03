import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LaporanInfo from '@/models/laporanInfo';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Verify token (optional for public laporan)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId = null;
    let userRole = 'user';
    
    if (token) {
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        userId = decodedToken.uid;
        userRole = decodedToken.role || 'user';
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
    
    const laporan = await LaporanInfo.findById(id).lean();
    if (!laporan) {
      return NextResponse.json(
        { success: false, message: 'Laporan not found' },
        { status: 404 }
      );
    }
    
    // Cek akses (admin & pembimbing bisa lihat semua)
    if (!laporan.isPublic && userId !== laporan.userId && userRole !== 'admin' && userRole !== 'pembimbing') {
      return NextResponse.json(
        { success: false, message: 'Tidak memiliki akses' },
        { status: 403 }
      );
    }
    
    // Increment views
    await LaporanInfo.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    // Get additional intern data if admin/pembimbing
    if ((userRole === 'admin' || userRole === 'pembimbing') && laporan.userId) {
      try {
        const mongoose = require('mongoose');
        const internInfo = await mongoose.model('Intern').findOne({ userId: laporan.userId }).lean();
        if (internInfo) {
          laporan.internInfo = {
            _id: internInfo._id,
            nim: internInfo.nim,
            prodi: internInfo.prodi,
            kampus: internInfo.kampus
          };
        }
      } catch (error) {
        console.error('Error fetching intern info:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: laporan
    });
    
  } catch (error) {
    console.error('Error fetching laporan detail:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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
    
    const id = params.id;
    const body = await request.json();
    const { action, comment, nama } = body;
    
    const laporan = await LaporanInfo.findById(id);
    if (!laporan) {
      return NextResponse.json(
        { success: false, message: 'Laporan not found' },
        { status: 404 }
      );
    }
    
    if (action === 'like') {
      // Toggle like
      const existingLike = laporan.likes.find(like => like.userId === userId);
      
      if (existingLike) {
        // Unlike
        await LaporanInfo.findByIdAndUpdate(id, {
          $pull: { likes: { userId } }
        });
        return NextResponse.json({
          success: true,
          message: 'Like removed',
          action: 'unliked'
        });
      } else {
        // Like
        await LaporanInfo.findByIdAndUpdate(id, {
          $push: { likes: { userId, tanggal: new Date() } }
        });
        return NextResponse.json({
          success: true,
          message: 'Liked',
          action: 'liked'
        });
      }
    }
    
    if (action === 'comment') {
      if (!comment || !nama) {
        return NextResponse.json(
          { success: false, message: 'Comment and nama required' },
          { status: 400 }
        );
      }
      
      // Get user role from token or from body
      const userRole = decodedToken.role || body.role || 'user';
      
      await LaporanInfo.findByIdAndUpdate(id, {
        $push: {
          comments: {
            userId,
            nama,
            comment,
            role: userRole, // Store user role with comment
            tanggal: new Date()
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Comment added'
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error processing laporan action:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
