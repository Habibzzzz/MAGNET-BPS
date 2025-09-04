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
    
    // Validasi ukuran file (max 5MB untuk base64 storage)
    const maxSize = 5 * 1024 * 1024; // 5MB (reduced for base64 efficiency)
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum 5MB for Vercel compatibility' },
        { status: 400 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`📤 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Generate base64 data URL for storage (Vercel-compatible)
    const base64 = buffer.toString('base64');
    const mimeType = file.type || (type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log(`✅ Generated base64 data URL (${(dataUrl.length / 1024).toFixed(0)}KB)`);
    
    return NextResponse.json({
      success: true,
      message: 'File processed successfully (stored as base64)',
      fileUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      storageType: 'base64'
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
