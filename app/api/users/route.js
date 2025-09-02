import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import '../../../lib/firebase-admin';

export async function GET(request) {
    try {
        const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ message: 'Akses ditolak' }, { status: 401 });
        }
        const decodedToken = await getAuth().verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') {
            return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
        }

    
        const userRecords = await getAuth().listUsers(1000);
        const users = userRecords.users.map(user => ({
            uid: user.uid,
            email: user.email,
            nama: user.displayName,
            role: user.customClaims?.role || 'user',
        }));

        return NextResponse.json({ users });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server.', error: error.message }, { status: 500 });
    }
}