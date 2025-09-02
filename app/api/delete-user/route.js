import { NextResponse } from 'next/server';
import { admin } from '@/app/firebase/admin-config';

export async function POST(request) {
    try {
        const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ message: 'Akses tidak sah' }, { status: 401 });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') {
            return NextResponse.json({ message: 'Akses ditolak: Memerlukan hak admin' }, { status: 403 });
        }

        const { uid: uidToDelete } = await request.json();
        if (!uidToDelete) {
            return NextResponse.json({ message: 'UID pengguna diperlukan' }, { status: 400 });
        }

        if (decodedToken.uid === uidToDelete) {
            return NextResponse.json({ message: 'Admin tidak dapat menghapus akunnya sendiri' }, { status: 400 });
        }

        await admin.auth().deleteUser(uidToDelete);

        return NextResponse.json({ success: true, message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: `Gagal menghapus pengguna: ${error.message}` }, { status: 500 });
    }
}