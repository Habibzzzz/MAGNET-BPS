"use client"

import React, { useEffect, useState } from 'react'
import SignOutButton from './signOutButton'
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import Link from 'next/link';
import { auth } from './../app/firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userInternData, setUserInternData] = useState(null);

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

    useEffect(() => {
        if (user && interns.length > 0) {
            const me = interns.find((i) => i.userId === user.uid);
            if (me) {
                setUserInternData(me);
            }
        }
    }, [user, interns]);

    useEffect(() => {
        async function fetchInterns() {
            try {
                const res = await axios.get("/api/intern");
                setInterns(res.data.interns);
            } catch (error) {
                console.error("Failed to fetch interns:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInterns();
    }, []);

    const [quota, setQuota] = useState({ limit: Infinity, used: 0 });

    // useEffect(() => {
    //     async function fetchQuota() {
    //         try {
    //             const res = await axios.get("/api/quota/current");
    //             setQuota(res.data);
    //         } catch (error) {
    //             console.error("Gagal mengambil kuota:", error);
    //         }
    //     }
    //     fetchQuota();
    // }, []);


    const handleBack = () => {
        route.push("/dashboard")
    }

    const activeCount = interns.filter((i) => i.status === "aktif").length;

    return (
        <div>
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-lg border md:max-w-7xl mx-auto border-gray-100 p-2.5 md:p-6 mb-8">
                <div className="flex flex-col md:flex-row items-start sm:items-center justify-between gap-4">
                    <div className='flex flex-row'>
                        <button onClick={handleBack} className='bg-white cursor-pointer hover:bg-zinc-100 border-2 border-blue-500 font-bold mr-5 h-10 md:my-auto mt-9 text-white rounded-lg px-3 py-2'>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ color: '#0290fd' }} />
                        </button>
                        <div>
                            {userInternData && (
                                <p className="text-lg font-medium md:text-left text-center text-gray-600 mb-1">
                                    Hi, {userInternData.nama}
                                </p>
                            )}
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Data Peserta Magang</h1>
                            {isAdmin ? (
                                <p className="text-gray-600 md:block hidden">Kelola data dan monitor aktivitas magang dengan mudah</p>
                            ) : (
                                <p className="text-gray-600 md:block hidden">Temukan data kamu di daftar peserta magang</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:mx-0 mx-auto sm:items-center gap-5 ">
                        {/* <Link href="/addData">
                                <button className="bg-gradient-to-r cursor-pointer from-blue-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlus} />
                                    Tambah Anak Magang
                                </button>
                            </Link> */}

                        <SignOutButton />
                    </div>
                </div>
            </div>
        </div>
    )
}
