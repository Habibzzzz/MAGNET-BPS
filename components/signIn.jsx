'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useSignInWithEmailAndPassword,
    useCreateUserWithEmailAndPassword,
} from 'react-firebase-hooks/auth';
import {
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './../app/firebase/config';
import { Eye, EyeOff, Mail, Lock, User, Hash, GraduationCap, Building, Calendar } from 'lucide-react';
import Modal from './Modal';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        nama: "",
        nim: "",
        nik: "",
        prodi: "",
        kampus: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        divisi: "-",
        status: "pending",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [nikError, setNikError] = useState("");
    const [confirmReset, setConfirmReset] = useState(false);
    const [notifSent, setNotifSent] = useState(false);
    const [alert, setAlert] = useState(false);
    const [sendingReset, setSendingReset] = useState(false);
    const router = useRouter();

    const [signInWithEmailAndPassword, user, loading, signInErr] =
        useSignInWithEmailAndPassword(auth);
    const [createUserWithEmailAndPassword, newUser, creating, signUpErr] =
        useCreateUserWithEmailAndPassword(auth);

    const checkNikExists = async (nik) => {
        try {
            const response = await fetch(`/api/check-nik?nik=${nik}`);
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking NIK:", error);
            return false;
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));

        if (name === 'nik') {
            setNikError("");
            if (value.length >= 16) {
                const exists = await checkNikExists(value);
                if (exists) {
                    setNikError("NIK sudah terdaftar, silakan gunakan NIK lain.");
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(form.email, form.password);
            } else {
                const nikExists = await checkNikExists(form.nik);
                if (nikExists) {
                    setError("NIK sudah terdaftar, silakan gunakan NIK lain.");
                    setIsLoading(false);
                    return;
                }

                const cred = await createUserWithEmailAndPassword(form.email, form.password);

                if (cred?.user) {
                    const internData = {
                        ...form,
                        userId: cred.user.uid,
                        createdAt: new Date().toISOString(),
                    };
                    delete internData.password;

                    const res = await fetch("/api/intern", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(internData),
                    });

                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.message || "Gagal menambahkan data intern.");
                    }

                    router.push("/dashboard");
                }
            }
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/dashboard');
            }
        });
        return () => unsubscribe();
    }, [router]);


    const handleForgotPassword = async () => {
        if (!form.email) {
            setAlert(true);
        } else {
            setConfirmReset(true);
        }
    };

    const handleConfirmForgot = async () => {
        if (!form.email) {
            alert("Silakan masukkan email terlebih dahulu");
            return;
        }

        setSendingReset(true);

        try {
            await sendPasswordResetEmail(auth, form.email);
            setConfirmReset(false);
            setNotifSent(true);
        } catch (error) {
            console.error("Error sending password reset email:", error);
            if (error.code === "auth/user-not-found") {
                alert("Email tidak terdaftar.");
            } else if (error.code === "auth/invalid-email") {
                alert("Format email tidak valid.");
            } else if (error.code === "auth/too-many-requests") {
                alert("Terlalu banyak permintaan. Coba lagi nanti.");
            } else {
                alert("Terjadi kesalahan saat mengirim email reset. Coba lagi.");
            }
        } finally {
            setSendingReset(false);
        }
    };

    function getFriendlyError(error) {
        if (!error) return null;
        const code = error.code || "";
        switch (code) {
            case "auth/invalid-email":
                return "Format email tidak valid.";
            case "auth/user-not-found":
                return "Email tidak ditemukan.";
            case "auth/wrong-password":
                return "Password salah.";
            case "auth/email-already-in-use":
                return "Email sudah digunakan.";
            case "auth/weak-password":
                return "Password terlalu lemah. Gunakan minimal 6 karakter.";
            case "auth/invalid-credential":
                return "Gagal login. Password atau email tidak valid.";
            default:
                return "Terjadi kesalahan. Silakan coba lagi.";
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-row items-center justify-center gap-3">
            <Modal
                isOpen={confirmReset}
                onClose={() => setConfirmReset(false)}
                title="Konfirmasi Reset Password"
                message="Apakah Anda yakin ingin mengirimkan link reset password ke email Anda?"
                type="confirmation"
                onConfirm={handleConfirmForgot}
                confirmText="Ya, Kirim"
                cancelText="Batal"
            />
            <Modal
                isOpen={alert}
                onClose={() => setAlert(false)}
                title="Email masih kosong!"
                message="Silahkan masukkan email terlebih dahulu"
                type="notification"
            />
            <Modal
                isOpen={notifSent}
                onClose={() => setNotifSent(false)}
                title="Email Terkirim"
                message={`Link reset password telah dikirim ke ${form.email}. Silakan cek email Anda.`}
                type="notification"
            />
            <img src="assets/image/Banner1.png" alt="Banner" className='w-[55%] h-screen xl:block hidden object-cover' />
            <div className="w-full max-w-xl mx-3 my-5">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <img src="/assets/image/logo.png" alt="logo" className="w-full" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {isLogin ? (
                                <>
                                    Selamat Datang di <span className="text-blue-600">MAGNET!</span>
                                </>
                            ) : (
                                'Daftar Akun & Data Magang'
                            )}
                        </h1>
                        <p className="text-gray-600">
                            {isLogin
                                ? 'Magang dan Monitoring Elektronik Terpadu'
                                : 'Lengkapi data diri dan periode magang Anda'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Field
                            icon={<Mail className="h-5 w-5 text-gray-400" />}
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <Field
                            icon={<Lock className="h-5 w-5 text-gray-400" />}
                            type={showPwd ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            append={
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="text-gray-400 cursor-pointer hover:text-gray-600"
                                >
                                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            }
                        />

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-blue-600 cursor-pointer hover:text-blue-700"
                                >
                                    Lupa password?
                                </button>
                            </div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Data Pribadi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="nama"
                                                    placeholder="Masukkan nama lengkap"
                                                    value={form.nama}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                NIM
                                            </label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="nim"
                                                    placeholder="Nomor Induk Mahasiswa"
                                                    value={form.nim}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                NIK
                                            </label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="nik"
                                                    placeholder="Nomor Induk Kependudukan"
                                                    value={form.nik}
                                                    onChange={handleChange}
                                                    required
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${nikError ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                            </div>
                                            {nikError && (
                                                <p className="mt-1 text-sm text-red-600">{nikError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Program Studi
                                            </label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="prodi"
                                                    placeholder="Contoh: Teknik Informatika"
                                                    value={form.prodi}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Universitas/Kampus
                                            </label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="kampus"
                                                    placeholder="Nama universitas atau kampus"
                                                    value={form.kampus}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Periode Magang
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Mulai
                                            </label>
                                            <input
                                                type="date"
                                                name="tanggalMulai"
                                                value={form.tanggalMulai}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Selesai
                                            </label>
                                            <input
                                                type="date"
                                                name="tanggalSelesai"
                                                value={form.tanggalSelesai}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {(signInErr || signUpErr || error) && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="text-red-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            {error || getFriendlyError(signInErr || signUpErr)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || loading || creating || nikError}
                            className="w-full cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            {(isLoading || loading || creating) ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {isLogin ? 'Masuk...' : 'Mendaftar...'}
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Masuk' : 'Daftar & Simpan Data'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                        </p>
                        <div className='flex flex-col gap-2'>
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setForm({
                                        email: "",
                                        password: "",
                                        nama: "",
                                        nim: "",
                                        nik: "",
                                        prodi: "",
                                        kampus: "",
                                        tanggalMulai: "",
                                        tanggalSelesai: "",
                                        divisi: "-",
                                        status: "pending",
                                    });
                                    setError("");
                                    setNikError("");
                                }}
                                className="mt-2 text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                            >
                                {isLogin ? 'Daftar Sebagai Peserta' : 'Masuk'}
                            </button>
                            {isLogin && (
                                <button
                                    className="mt-2 text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                                    onClick={() => router.push('/sign-upMentor')}
                                >
                                    Daftar Sebagai Pembimbing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-center text-gray-600 text-sm mt-8">
                    © 2025 BPS Kota Bandar Lampung
                </p>
            </div>
        </div>
    );
}

function Field({ icon, append, ...rest }) {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <input
                {...rest}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {append && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {append}
                </div>
            )}
        </div>
    );
}
