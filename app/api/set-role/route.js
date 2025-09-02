import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

export async function POST(request) {
    try {
        const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ message: 'Akses ditolak: Token tidak ditemukan.' }, { status: 401 });
        }

        const decodedToken = await getAuth().verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') {
            return NextResponse.json({ message: 'Akses ditolak: Anda bukan admin.' }, { status: 403 });
        }

        const { uid, role } = await request.json();
        if (!uid || !role) {
            return NextResponse.json({ message: 'UID dan role dibutuhkan.' }, { status: 400 });
        }

        await getAuth().setCustomUserClaims(uid, { role: role });

        return NextResponse.json({ message: `Role berhasil diubah menjadi '${role}' untuk user ${uid}` });

    } catch (error) {
        console.error("Error setting role:", error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server.', error: error.message }, { status: 500 });
    }
}