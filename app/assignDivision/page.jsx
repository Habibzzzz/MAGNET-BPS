"use client"

import DivisionData from '@/components/DivisionData'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import SignOutButton from '@/components/signOutButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import NotFound from '../notFound/page';

export default function page() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const route = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const token = await user.getIdTokenResult();
                const admin = token.claims.role === "admin";
                setIsAdmin(admin)
                if (token.claims.role === "admin") {
                    console.log("👑 Ini admin");
                } else {
                    console.log("🙅‍♂️ Bukan admin");
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleBack = () => {
        route.push("/divisi")
    }
    return (
        <div>
            {isAdmin ? (
                <div className='p-6 max-w-full md:max-w-8xl mx-auto'>
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-lg border md:max-w-7xl mx-auto border-gray-100 p-2.5 md:p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-start sm:items-center justify-between gap-4">
                            <div className='flex flex-row'>
                                <button onClick={handleBack} className='bg-white cursor-pointer hover:bg-zinc-100 border-2 border-blue-500 font-bold mr-5 h-10 md:my-auto mt-9 text-white rounded-lg px-3 py-2'>
                                    <FontAwesomeIcon icon={faArrowLeft} style={{ color: '#0290fd' }} />
                                </button>
                                <div>
                                    {user && (
                                        <p className="text-lg font-medium md:text-left text-center text-gray-600 mb-1">
                                            Hi, {user.displayName || user.email}
                                        </p>
                                    )}
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Penempatan Tim</h1>
                                    <p className="text-gray-600 md:block hidden">Kelola penempatan tim anak magang</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:mx-0 mx-auto sm:items-center gap-5 ">
                                <SignOutButton />
                            </div>
                        </div>
                    </div>
                    <DivisionData />
                </div>
            ) : (
                <NotFound />
            )}
        </div>
    )
}
