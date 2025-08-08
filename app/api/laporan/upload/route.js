import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
    
    // Validasi ukuran file (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum 50MB' },
        { status: 400 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Buat nama file unik
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const safeFileName = `${userId}_${timestamp}${fileExtension}`;
    
    // Buat direktori jika belum ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'laporan');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Simpan file
    const filePath = path.join(uploadDir, safeFileName);
    await writeFile(filePath, buffer);
    
    // Return URL file
    const fileUrl = `/uploads/laporan/${safeFileName}`;
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl,
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
