import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccountString = process.env.GOOGLE_CREDENTIALS;

if (!getApps().length) {
    initializeApp({
        credential: cert(JSON.parse(serviceAccountString)),
    });
}

export async function verifyFirebaseToken(request) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Token tidak ditemukan di Authorization header");
    }

    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error("Token tidak valid: " + error.message);
    }
}
