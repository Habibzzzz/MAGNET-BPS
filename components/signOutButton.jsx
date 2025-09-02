"use client";

import { useRouter } from "next/navigation";
import { auth } from "./../app/firebase/config";
import { signOut } from "firebase/auth";
import { useAuthAction } from "./../context/authContext";
import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function SignOutButton() {
    const router = useRouter();
    const { setLoggingOut } = useAuthAction();
    const [loading, setLoading] = useState(false);
    const [confirmLogOut, setConfirmLogOut] = useState(false);

    const modalOpen = () => {
        setConfirmLogOut(true);
    }

    const logOut = async () => {
        setLoading(true);
        setLoggingOut(true);
        try {
            await signOut(auth);
            router.push("/");
        } catch (e) {
            console.log("Error sign out:", e.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setLoading(false);
    //     }, 5000);

    //     return () => clearTimeout(timer);
    // }, [logOut()])

    return (
        <div>
            <Modal
                isOpen={confirmLogOut}
                onClose={() => setConfirmLogOut(false)}
                title="Konfirmasi Sign Out"
                message="Apakah Anda yakin ingin Sign Out?"
                type="confirmation"
                onConfirm={logOut}
                confirmText="Ya"
                cancelText="Batal"
            /><button
                onClick={modalOpen}
                disabled={loading}
                className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60"
            >
                {loading ? "Logging out..." : "Sign Out"}
            </button>
        </div>
    );
}
