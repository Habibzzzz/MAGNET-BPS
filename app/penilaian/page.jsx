"use client";

import NavbarGeneral from "@/components/NavbarGeneral";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { auth } from "./../firebase/config";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/app/firebase/config";
import axios from "axios";

export default function PenilaianPage() {
    const [interns, setInterns] = useState([]);
    const [user, setUser] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPembimbing, setIsPembimbing] = useState(false);
    const [currentMentor, setCurrentMentor] = useState(null);
    const [mentor, setMentor] = useState([]);
    const [form, setForm] = useState({
        komunikasi: '',
        kerjaTim: '',
        kedisiplinan: '',
        inisiatif: '',
        tanggungJawab: '',
        catatan: '',
    });
    const [assessments, setAssessments] = useState([]);

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const token = await user.getIdTokenResult();
                const admin = token.claims.role === "admin";
                const pembimbing = token.claims.role === "pembimbing";
                setIsAdmin(admin);
                setIsPembimbing(pembimbing);
                if (token.claims.role === "pembimbing") {
                    console.log("ini pembimbing");
                } else {
                    console.log("ini bukan pembimbing")
                }
                if (token.claims.role === "admin") {
                    console.log("👑 Ini admin");
                } else {
                    console.log("🙅‍♂️ Bukan admin");
                }
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function fetchMentors() {
            try {
                const res = await axios.get("/api/mentor");
                setMentor(res.data);
            } catch (error) {
                console.error("Failed to fetch mentors:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMentors();
    }, []);

    useEffect(() => {
        if (user && mentor && mentor.length > 0) {
            const me = mentor.find((m) => m.userId === user.uid);
            if (me) {
                setCurrentMentor(me);
            }
        }
    }, [user, mentor])

    useEffect(() => {
        if (!currentMentor) {
            if (!auth.currentUser) setLoading(false);
            return;
        }

        const fetchInterns = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/intern");

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                const myFinishedMentees = (data.interns || []).filter(
                    (i) => i.status === "selesai" && i.pembimbing?._id === currentMentor._id
                );

                setInterns(myFinishedMentees);
            } catch (error) {
                console.error("Error fetching interns:", error);
                alert("Gagal memuat data peserta magang. Silakan coba lagi.");
                setInterns([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInterns();
    }, [currentMentor]);

    console.log("HEY", currentMentor)

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await fetch('/api/assessment');
                const data = await res.json();
                if (data.success) {
                    setAssessments(data.assessments);
                }
            } catch (error) {
                console.error("Gagal memuat data penilaian:", error);
            }
        };

        fetchAssessments();
    }, []);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const requiredFields = ['komunikasi', 'kerjaTim', 'kedisiplinan', 'inisiatif', 'tanggungJawab'];
        const emptyFields = requiredFields.filter(field => !form[field] || form[field] === '');

        if (emptyFields.length > 0) {
            alert('Semua field penilaian harus diisi!');
            return;
        }

        const invalidValues = requiredFields.filter(field => {
            const value = parseInt(form[field]);
            return isNaN(value) || value < 0 || value > 100;
        });

        if (invalidValues.length > 0) {
            alert('Nilai harus berupa angka antara 0-100!');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch("/api/assessment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    internId: selected._id,
                    aspekNilai: {
                        komunikasi: parseInt(form.komunikasi),
                        kerjaTim: parseInt(form.kerjaTim),
                        kedisiplinan: parseInt(form.kedisiplinan),
                        inisiatif: parseInt(form.inisiatif),
                        tanggungJawab: parseInt(form.tanggungJawab),
                        catatan: form.catatan,
                    },
                    penilai: currentMentor._id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setAssessments(prev => [...prev, result.assessment]);
            alert("Penilaian berhasil disimpan!");
            setSelected(null);
            setForm({
                komunikasi: '',
                kerjaTim: '',
                kedisiplinan: '',
                inisiatif: '',
                tanggungJawab: '',
                catatan: '',
            });
        } catch (error) {
            console.error("Error submitting assessment:", error);
            alert(`Terjadi kesalahan saat menyimpan penilaian: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const getAssessmentByInternId = (internId) => {
        return assessments.find(a => a.internId === internId);
    };

    const getTotalNilai = (aspekNilai) => {
        if (!aspekNilai) return null;
        const values = Object.values(aspekNilai).filter(val => typeof val === "number");
        if (values.length === 0) return "-";
        const total = values.reduce((a, b) => a + b, 0);
        return Math.round(total / values.length);
    };


    const getFieldLabel = (field) => {
        const labels = {
            komunikasi: "Komunikasi",
            kerjaTim: "Kerja Tim",
            kedisiplinan: "Kedisiplinan",
            inisiatif: "Inisiatif",
            tanggungJawab: "Tanggung Jawab"
        };
        return labels[field] || field;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data peserta magang...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <NavbarGeneral title="Penilaian Peserta Magang" subTitle="Berikan penilaian untuk peserta magang bimbingan Anda" />

                    {/* Intern List */}
                    <div className="bg-white rounded-lg shadow-sm mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Daftar Peserta Bimbingan (Selesai)</h2>
                            <p className="text-sm text-gray-600 mt-1">Pilih peserta yang akan dinilai dari daftar di bawah ini.</p>
                        </div>
                        <div className="p-6">
                            {interns.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Anak Bimbingan</h3>
                                    <p className="text-gray-500">Tidak ada data peserta magang bimbingan Anda yang telah selesai.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Muat Ulang
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {interns.map((intern) => (
                                        <div key={intern._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium text-sm">
                                                        {intern.nama?.charAt(0).toUpperCase() || 'M'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{intern.nama}</p>
                                                    <p className="text-sm text-gray-600">{intern.divisi}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Nilai: {
                                                            getAssessmentByInternId(intern._id)
                                                                ? `${getTotalNilai(getAssessmentByInternId(intern._id).aspekNilai)}`
                                                                : "Belum dinilai"
                                                        }
                                                    </p>

                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelected(intern)}
                                                className="px-4 py-2 bg-blue-600 cursor-pointer text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                {getAssessmentByInternId(intern._id) ? 'Edit Nilai' : 'Beri Nilai'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assessment Form */}
                    {selected && (
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-medium text-sm">
                                            {selected.nama?.charAt(0).toUpperCase() || 'M'}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Penilaian untuk {selected.nama}</h2>
                                        <p className="text-sm text-gray-600">{selected.divisi}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {["komunikasi", "kerjaTim", "kedisiplinan", "inisiatif", "tanggungJawab"].map((field) => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {getFieldLabel(field)}
                                            </label>
                                            <input
                                                type="number"
                                                name={field}
                                                min="0"
                                                max="100"
                                                value={form[field]}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="0-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catatan
                                    </label>
                                    <textarea
                                        name="catatan"
                                        value={form.catatan}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Berikan catatan tambahan untuk peserta magang..."
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 cursor-pointer bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Menyimpan...
                                            </div>
                                        ) : (
                                            'Simpan Penilaian'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}