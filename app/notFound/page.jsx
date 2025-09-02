"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../app/firebase/config';

export default function NotFound() {
    const route = useRouter();

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8 relative">
                    <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none animate-pulse">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-bounce">
                            🔍
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Oops! Halaman Tidak Ditemukan
                    </h1>
                    <p className="text-gray-600 text-lg mb-2">
                        Sepertinya halaman yang Anda cari tidak dapat ditemukan.
                    </p>
                    <p className="text-gray-500 mb-8">
                        Cek kembali URL yang Anda masukkan atau silahkan login terlebih dahulu untuk mengakses halaman ini.
                    </p>

                    {/* PERBAIKAN: Tombol ditampilkan secara kondisional */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {authLoading ? (
                            <div className="h-[48px]"></div>
                        ) : user ? (
                            <>
                                <button onClick={() => route.push('/dashboard')} className="bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                                    Kembali ke Dashboard
                                </button>
                            </>
                        ) : (
                            <button onClick={() => route.push('/')} className="cursor-pointer bg-white text-blue-500 border-2 hover:bg-zinc-100 border-blue-500 px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                                Kembali ke Halaman Login
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Jika masalah terus berlanjut, silakan hubungi administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}