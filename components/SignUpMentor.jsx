'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from './../app/firebase/config';
import { Mail, Lock, User, Hash, Briefcase, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPembimbing() {
    const [form, setForm] = useState({
        nama: '',
        nip: '',
        email: '',
        password: '',
        divisi: '',
    });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [nipError, setNipError] = useState('');
    const router = useRouter();

    const [createUserWithEmailAndPassword, user, loading, signUpError] = useCreateUserWithEmailAndPassword(auth);

    const checkNipExists = async (nip) => {
        try {
            const response = await fetch(`/api/check-nip?nip=${nip}`);
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking NIP:", error);
            return false;
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'nip') {
            if (value.length >= 18) {
                const exists = await checkNipExists(value);
                setNipError(exists ? "NIP sudah terdaftar." : "");
            } else {
                setNipError("");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password.length < 6) {
            setError("Password harus terdiri dari minimal 6 karakter.");
            return;
        }
        if (nipError) {
            setError(nipError);
            return;
        }

        try {
            const cred = await createUserWithEmailAndPassword(form.email, form.password);
            if (cred?.user) {
                const pembimbingData = {
                    userId: cred.user.uid,
                    nama: form.nama,
                    nip: form.nip,
                    email: form.email,
                    divisi: form.divisi,
                };

                const res = await fetch("/api/mentor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pembimbingData),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || "Gagal menyimpan data pembimbing.");
                }
                router.push("/dashboard");
            } else if (signUpError) {
                throw signUpError;
            }
        } catch (err) {
            console.error(err);
            const friendlyMessage = err.code === 'auth/email-already-in-use'
                ? 'Email sudah digunakan oleh akun lain.'
                : err.message || "Terjadi kesalahan saat mendaftar.";
            setError(friendlyMessage);
        }
    };

    const divisionOptions = [
        { value: "Umum", label: "Umum" },
        { value: "Produksi", label: "Produksi" },
        { value: "Sosial", label: "Sosial" },
        { value: "Distribusi", label: "Distribusi" },
        { value: "Nerwilis", label: "Nerwilis" },
        { value: "PTID", label: "PTID" },
        { value: "Sektoral", label: "Sektoral" },
    ];
    return (
        <div className="min-h-screen bg-gray-50 flex flex-row items-center justify-center gap-3">
            {/* Banner Image - sama seperti halaman login */}
            <img src="/assets/image/Banner1.png" alt="Banner" className='w-[55%] h-screen xl:block hidden object-cover' />

            <div className="w-full max-w-xl mx-3 my-5">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <img src="/assets/image/logo.png" alt="logo" className="w-full" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Daftar Akun <span className="text-blue-600">Pembimbing</span>
                        </h1>
                        <p className="text-gray-600">
                            Buat akun untuk mengelola dan memonitor anak magang.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Field Nama, Email, dan Password */}
                        <Field icon={<Mail className="h-5 w-5 text-gray-400" />} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                        <Field
                            icon={<Lock className="h-5 w-5 text-gray-400" />}
                            type={showPwd ? 'text' : 'password'}
                            name="password"
                            placeholder="Password (minimal 6 karakter)"
                            value={form.password}
                            onChange={handleChange}
                            required
                            append={
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600">
                                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            }
                        />

                        {/* Separator dan field khusus pembimbing */}
                        <div className="border-t border-gray-200 pt-6 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5">
                                Data Kepegawaian
                            </h3>
                            <div>
                                {/* Nama Lengkap */}
                                <div className="md:col-span-2 mb-5">
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
                                <Field icon={<Hash className="h-5 w-5 text-gray-400" />} type="text" name="nip" placeholder="NIP (18 digit)" value={form.nip} onChange={handleChange} required maxLength="18" />
                                {nipError && <p className="mt-1 pl-2 text-sm text-red-600">{nipError}</p>}
                            </div>
                            {/* Tim */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tim
                                </label>
                                <select
                                    name="divisi"
                                    value={form.divisi}
                                    onChange={handleChange}
                                    required
                                    className="w-full cursor-pointer px-4 py-3 border rounded-lg"
                                >
                                    <option value="">Pilih Tim</option>
                                    {divisionOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !!nipError}
                            className="w-full cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Mendaftar...
                                </>
                            ) : 'Daftar Sekarang'}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Ini bukan halaman yang tepat?
                        </p>
                        <Link href="/" className="mt-2 inline-block text-blue-600 font-semibold hover:text-blue-700 cursor-pointer">
                            Masuk
                        </Link>
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