"use client";

import { auth } from "../app/firebase/config";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Pencil, Search, SortAsc, SortDesc, Trash2 } from "lucide-react";
import Link from "next/link";
import Modal from "./Modal";
import { useRouter } from "next/navigation";

export default function MentorTable() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [interns, setInterns] = useState([]);
    const itemsPerPage = 10;

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        mentorId: null,
        mentorInfo: ''
    });

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const token = await user.getIdTokenResult();
                const role = token.claims.role;
                const isAuthorized = role === "admin" || role === "pembimbing";

                setIsAdmin(role === "admin");

                if (!isAuthorized) {
                    router.replace("/notFound");
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                router.replace("/notFound");
            }
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        async function loadMentors() {
            setLoading(true);
            try {
                const res = await axios.get("/api/mentor");
                setMentors(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Gagal memuat data pembimbing:", error);
                setMentors([]);
            } finally {
                setLoading(false);
            }
        }

        loadMentors();
    }, []);

    useEffect(() => {
        async function loadInterns() {
            try {
                const res = await axios.get("/api/intern");
                if (res.data && Array.isArray(res.data.interns)) {
                    setInterns(res.data.interns);
                }
            } catch (error) {
                console.error("Gagal memuat data intern:", error);
            }
        }

        loadInterns();
    }, []);

    const getActiveMenteeCount = (mentorId) => {
        return interns.filter(intern =>
            intern.status === "aktif" &&
            intern.pembimbing &&
            intern.pembimbing._id === mentorId
        ).length;
    };


    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const openDeleteModal = (mentorId, mentorInfo) => {
        setDeleteModal({ isOpen: true, mentorId, mentorInfo });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, mentorId: null, mentorInfo: '' });
    };

    const handleDelete = async () => {
        const { mentorId } = deleteModal;
        if (!mentorId) return;

        try {
            await fetch(`/api/mentor?id=${mentorId}`, {
                method: "DELETE",
            });
            setMentors(mentors.filter(mentor => mentor._id !== mentorId));
        } catch (error) {
            console.error("Error deleting mentor data:", error);
        } finally {
            closeDeleteModal();
        }
    };

    const toggleSortOrder = () =>
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");

    const { paginatedMentors, totalPages } = useMemo(() => {
        const filtered = mentors.filter((m) =>
            m.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.divisi?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const statusOrder = { 'aktif': 1, 'tidak aktif': 2 };
        const sorted = [...filtered].sort((a, b) => {
            const orderA = statusOrder[a.status?.toLowerCase()] || 99;
            const orderB = statusOrder[b.status?.toLowerCase()] || 99;

            if (orderA !== orderB) {
                return sortOrder === "asc" ? orderA - orderB : orderB - orderA;
            }
            return a.nama.localeCompare(b.nama);
        });

        const calculatedTotalPages = Math.ceil(sorted.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

        return { paginatedMentors: paginatedData, totalPages: calculatedTotalPages };
    }, [mentors, searchTerm, sortOrder, currentPage]);

    const getDivisionColor = (divisi) => {
        switch (divisi?.toLowerCase()) {
            case 'umum': return 'text-slate-700 bg-slate-100';
            case 'produksi': return 'text-orange-700 bg-orange-100';
            case 'sosial': return 'text-yellow-700 bg-yellow-100';
            case 'distribusi': return 'text-purple-700 bg-purple-100';
            case 'nerwilis': return 'text-emerald-700 bg-emerald-100';
            case 'ptid': return 'text-blue-700 bg-blue-100';
            case 'sektoral': return 'text-pink-700 bg-pink-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'aktif': return 'text-green-600';
            case 'tidak aktif': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                title="Konfirmasi Penghapusan"
                message={`Apakah Anda yakin ingin menghapus data ini secara permanen?`}
                type="confirmation"
                onConfirm={handleDelete}
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />

            <Card className="border-0 md:max-w-8xl mx-auto">
                <CardHeader>
                    <CardTitle className="mx-auto text-2xl font-bold text-center">
                        Data Pembimbing
                    </CardTitle>

                    <div className="mt-6 grid max-w-4xl mx-auto grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder="Cari nama, NIP, email..." className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        {/* Sort Button */}
                        <button onClick={toggleSortOrder} className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 w-full transition-colors">
                            {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
                            <span>Sort by Status</span>
                        </button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto rounded-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="px-6 py-3 text-center text-sm font-medium bg-neutral-100 text-black">No.</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium bg-neutral-100 text-black">Nama</th>
                                    {isAdmin && (<th className="px-6 py-3 text-center text-sm font-medium bg-neutral-100 text-black">NIP</th>)}
                                    <th className="px-6 py-3 text-center text-sm font-medium bg-neutral-100 text-black">Jumlah Peserta Bimbingan Aktif</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium bg-neutral-100 text-black">Divisi</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium bg-neutral-100 text-black">Status</th>
                                    {isAdmin && (<th className="px-6 py-3 text-center text-sm font-medium bg-neutral-100 text-black">Aksi</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMentors.length > 0 ? (
                                    paginatedMentors.map((mentor, index) => (
                                        <tr key={mentor._id || index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-center">{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                                            <td className="px-6 py-4 font-medium">{mentor.nama}</td>
                                            {isAdmin && (<td className="px-6 py-4 text-center">{mentor.nip}</td>)}
                                            <td className="px-6 py-4 text-center">
                                                {getActiveMenteeCount(mentor._id)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDivisionColor(mentor.divisi)}`}>
                                                    {mentor.divisi || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center capitalize font-semibold ${getStatusColor(mentor.status)}`}>
                                                    {mentor.status}
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        {/* Link to an edit page, assuming the route is /editMentorConfig/:id */}
                                                        {/* <Link href={`/editMentorConfig/${mentor._id}`} className="p-1 rounded-full hover:bg-blue-50" title="Edit">
                                                            <Pencil size={20} className="text-blue-600" />
                                                        </Link> */}
                                                        <button onClick={() => openDeleteModal(mentor._id, mentor.nama)} className="cursor-pointer p-1 rounded-full hover:bg-red-50" title="Delete">
                                                            <Trash2 size={20} className="text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isAdmin ? "7" : "6"} className="text-center text-gray-500 py-10">
                                            Tidak ada data pembimbing yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
                            >
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors ${page === currentPage ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-100"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
