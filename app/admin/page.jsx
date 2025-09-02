"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Save, Users, Crown, UserCheck, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import NavbarGeneral from '@/components/NavbarGeneral';
import ProtectedRoutes from '@/components/ProtectedRoutes';
import NotFound from '../notFound/page';
import Modal from '@/components/Modal';

export default function KelolaRolePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const [deleteUserModal, setDeleteUserModal] = useState({
        isOpen: false,
        user: null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const tokenResult = await user.getIdTokenResult();
                if (tokenResult.claims.role === 'admin') {
                    setCurrentUser(user);
                    setIsAdmin(true);
                } else {
                    router.push('/notFound');
                }
            } else {
                router.push('/notFound');
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        if (isAdmin && currentUser) {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const idToken = await currentUser.getIdToken();
                    const response = await fetch('/api/users', {
                        headers: { 'Authorization': `Bearer ${idToken}` }
                    });
                    if (!response.ok) throw new Error('Gagal mengambil daftar pengguna.');

                    const data = await response.json();
                    setUsers(data.users);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isAdmin, currentUser]);


    const handleRoleChange = (uid, newRole) => {
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole, hasChanged: true } : u));
    };


    const handleSaveRole = async (targetUser) => {
        setSuccess('');
        setError('');
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/set-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ uid: targetUser.uid, role: targetUser.role }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setSuccess(`Role untuk ${targetUser.email} berhasil diubah.`);
            setUsers(users.map(u => u.uid === targetUser.uid ? { ...u, hasChanged: false } : u));
        } catch (err) {
            setError(err.message);
        }
    };

    const openDeleteModal = (user) => {
        setDeleteUserModal({ isOpen: true, user });
    };

    const closeDeleteModal = () => {
        setDeleteUserModal({ isOpen: false, user: null });
    };

    const handleDeleteUser = async () => {
        const userToDelete = deleteUserModal.user;
        if (!userToDelete) return;

        if (userToDelete.uid === currentUser.uid) {
            setError("Anda tidak dapat menghapus akun Anda sendiri.");
            closeDeleteModal();
            return;
        }

        setSuccess('');
        setError('');

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ uid: userToDelete.uid }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Gagal menghapus pengguna.");

            setSuccess(`Pengguna ${userToDelete.email} berhasil dihapus secara permanen.`);
            setUsers(users.filter(u => u.uid !== userToDelete.uid));

        } catch (err) {
            setError(err.message);
        } finally {
            closeDeleteModal();
        }
    };


    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return { color: 'bg-red-100 text-red-700 border-red-200', icon: Crown, text: 'Admin' };
            case 'pembimbing':
                return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: UserCheck, text: 'Pembimbing' };
            default:
                return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: User, text: 'User' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Memuat data pengguna...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <ProtectedRoutes>
            {isAdmin ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                    <div className='p-6 max-w-7xl mx-auto'>
                        <Modal
                            isOpen={deleteUserModal.isOpen}
                            onClose={closeDeleteModal}
                            title="Konfirmasi Hapus Pengguna"
                            message={`Apakah Anda yakin ingin menghapus pengguna ${deleteUserModal.user?.email} secara permanen? Tindakan ini tidak dapat diurungkan.`}
                            type="confirmation"
                            onConfirm={handleDeleteUser}
                            confirmText="Ya, Hapus Permanen"
                            cancelText="Batal"
                        />

                        <NavbarGeneral title="Dashboard Pengelolaan Role" subTitle="Ubah role pengguna untuk memberikan hak akses yang sesuai." />

                        <div className="max-w-6xl mx-auto p-4 sm:p-6 pt-6 sm:pt-8">
                            <div className="mb-6 sm:mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 sm:p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
                                        <ShieldCheck size={24} className="sm:w-7 sm:h-7" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kelola Role Pengguna</h1>
                                        <p className="text-sm sm:text-base text-gray-600 mt-1">Atur hak akses dan permission untuk setiap pengguna</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Pengguna</p>
                                                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.length}</p>
                                            </div>
                                            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                                                <Users className="text-blue-600" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">Admin</p>
                                                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'admin').length}</p>
                                            </div>
                                            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                                                <Crown className="text-red-600" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">Pembimbing</p>
                                                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'pembimbing').length}</p>
                                            </div>
                                            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                                                <UserCheck className="text-purple-600" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-medium text-red-800">Terjadi Kesalahan</p>
                                        <p className="text-red-700 text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-medium text-green-800">Berhasil</p>
                                        <p className="text-green-700 text-sm mt-1">{success}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <Users size={18} className="sm:w-5 sm:h-5" />
                                        Daftar Pengguna
                                    </h2>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Kelola role dan hak akses untuk setiap pengguna</p>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {users.map(user => {
                                        const badge = getRoleBadge(user.role);
                                        const IconComponent = badge.icon;

                                        return (
                                            <div key={user.uid} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                                                {/* Mobile Layout */}
                                                <div className="block sm:hidden">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                                            {user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-800 text-base truncate">{user.email}</h3>
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${badge.color} mt-1`}>
                                                                <IconComponent size={12} />
                                                                {badge.text}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
                                                            UID: {user.uid.substring(0, 8)}...
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-700 block mb-1">Role Pengguna</label>
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm"
                                                            >
                                                                <option value="user">👤 User</option>
                                                                <option value="pembimbing">🎓 Pembimbing</option>
                                                                <option value="admin">👑 Admin</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {user.hasChanged && (
                                                                <button
                                                                    onClick={() => handleSaveRole(user)}
                                                                    className="flex-grow bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                                                                >
                                                                    <Save size={14} />
                                                                    Simpan
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors w-full"
                                                                title="Hapus Pengguna"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Layout */}
                                                <div className="hidden sm:block">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                                                {user.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="font-semibold text-gray-800 text-lg">{user.email}</h3>
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                                                                        <IconComponent size={14} />
                                                                        {badge.text}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-md inline-block">
                                                                    UID: {user.uid}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                                className="border cursor-pointer border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[140px]"
                                                            >
                                                                <option value="user">👤 User</option>
                                                                <option value="pembimbing">🎓 Pembimbing</option>
                                                                <option value="admin">👑 Admin</option>
                                                            </select>

                                                            {user.hasChanged && (
                                                                <button
                                                                    onClick={() => handleSaveRole(user)}
                                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Save size={16} /> Simpan
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="p-2 cursor-pointer bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                                title="Hapus Pengguna"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {users.length === 0 && !loading && (
                                    <div className="text-center py-12">
                                        <Users className="mx-auto text-gray-400 mb-4" size={48} />
                                        <p className="text-gray-600 text-lg">Tidak ada pengguna yang ditemukan</p>
                                        <p className="text-gray-500 text-sm mt-2">Pastikan koneksi berjalan dengan baik</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <NotFound />
            )}
        </ProtectedRoutes>
    );
}