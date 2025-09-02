"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SignOutButton from "./../../components/signOutButton";

export default function DashboardMentor() {
    const [user, setUser] = useState(null);
    const [isPembimbing, setIsPembimbing] = useState(false);
    // State isAdmin tidak digunakan, bisa dihapus jika tidak perlu
    // const [isAdmin, setIsAdmin] = useState(false); 
    const [mentors, setMentors] = useState([]);
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userMentorData, setUserMentorData] = useState(null);
    const [internCountByMentor, setInternCountByMentor] = useState(0);

    const router = useRouter();

    // --- Langkah 1: Cek status otentikasi dan role pengguna ---
    // Logika ini sudah baik, namun kita bisa membuatnya lebih tegas dalam menangani non-pembimbing.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const token = await user.getIdTokenResult();
                const userRole = token.claims.role;

                if (userRole === "pembimbing") {
                    setIsPembimbing(true);
                } else {
                    // Jika user bukan pembimbing, langsung hentikan loading.
                    // Tampilan akan otomatis menunjukkan "Akses Ditolak".
                    setIsPembimbing(false);
                    setLoading(false);
                }
            } else {
                // Jika tidak ada user yang login, arahkan ke halaman utama.
                router.push('/');
            }
        });
        return () => unsubscribe();
    }, [router]);

    // --- Langkah 2: Ambil data HANYA JIKA user adalah pembimbing ---
    useEffect(() => {
        // Jangan jalankan fetch jika user bukan pembimbing.
        if (!isPembimbing) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // PERBAIKAN: Gunakan endpoint yang konsisten (plural)
                const [mentorRes, internRes] = await Promise.all([
                    axios.get("/api/mentor"),
                    axios.get("/api/intern"),
                ]);

                // Pastikan data yang diterima adalah array
                setMentors(mentorRes.data.pembimbings || []);
                setInterns(internRes.data.interns || []);

            } catch (err) {
                console.error("Gagal mengambil data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isPembimbing]); // Efek ini hanya bergantung pada status isPembimbing

    // --- Langkah 3: Proses data yang sudah diambil ---
    useEffect(() => {
        if (!user || !isPembimbing || mentors.length === 0) return;

        console.log("DEBUG: User UID:", user.uid);
        console.log("DEBUG: Mentors:", mentors);

        const currentMentor = mentors.find((m) => m.userId === user.uid);
        console.log("DEBUG: currentMentor:", currentMentor);

        setUserMentorData(currentMentor);

        if (currentMentor) {
            const count = interns.filter((intern) =>
                intern.pembimbing?._id &&
                String(intern.pembimbing._id) === String(currentMentor._id)
            ).length;
            setInternCountByMentor(count);
        }
    }, [user, mentors, interns, isPembimbing]);


    // Tampilan Loading Awal
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Tampilan Jika Bukan Pembimbing (Akses Ditolak)
    if (!isPembimbing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">⛔ Akses Ditolak</h2>
                    <p className="text-gray-600 mb-6">
                        Halaman ini hanya dapat diakses oleh akun Pembimbing.
                    </p>
                    <button
                        onClick={() => auth.signOut().then(() => router.push('/'))}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Login dengan Akun Lain
                    </button>
                </div>
            </div>
        );
    }

    // Tampilan Dashboard Utama untuk Pembimbing
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Dashboard <span className="text-blue-600">MAGNET</span>
                    </h1>
                    <SignOutButton />
                </div>

                {userMentorData ? (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profil Pembimbing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
                                <p><span className="font-semibold">Nama:</span> {userMentorData.nama}</p>
                                <p><span className="font-semibold">Email:</span> {userMentorData.email}</p>
                                <p><span className="font-semibold">Divisi:</span> {userMentorData.divisi}</p>
                                <p><span className="font-semibold">Jumlah Anak Bimbingan:</span>{" "}
                                    <span className="font-bold text-lg text-blue-600">{internCountByMentor}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Menu Pembimbing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.push("/dataBimbingan")}
                                    className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                                >
                                    👥 Data Anak Bimbingan
                                </button>
                                <button
                                    onClick={() => router.push("/penilaian")}
                                    className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                                >
                                    📝 Penilaian Peserta
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 p-10 bg-white rounded-xl shadow-md">
                        Mencari data profil pembimbing... Jika pesan ini tidak hilang, pastikan akun Anda telah terdaftar sebagai pembimbing oleh admin.
                    </div>
                )}
            </div>
        </div>
    );
}
