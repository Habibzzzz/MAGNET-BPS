import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/app/firebase/config';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'pdf' atau 'ppt'
    const userId = formData.get('userId');
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    if (!type || !['pdf', 'ppt'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Use pdf or ppt' },
        { status: 400 }
      );
    }
    
    // Validasi file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = {
      pdf: ['.pdf'],
      ppt: ['.ppt', '.pptx']
    };
    
    const isValidExtension = validExtensions[type].some(ext => fileName.endsWith(ext));
    if (!isValidExtension) {
      return NextResponse.json(
        { success: false, message: `Invalid file extension for ${type}` },
        { status: 400 }
      );
    }
    
    // Validasi ukuran file (max 100MB for Firebase Storage)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum 100MB' },
        { status: 400 }
      );
    }
    
    // Upload ke Firebase Storage
    const storage = getStorage(app);
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const safeFileName = `${userId}_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `laporan/${type}/${safeFileName}`);
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload file
    console.log(`📤 Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Firebase Storage...`);
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`✅ Upload successful: ${downloadURL}`);
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to Firebase Storage',
      fileUrl: downloadURL,
      fileName: file.name,
      fileSize: file.size
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
