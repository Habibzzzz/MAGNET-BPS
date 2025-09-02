"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "./../hooks/useAuth";
import { useAuthAction } from "./../context/authContext";

export default function ProtectedRoute({ children }) {
    const { user, checking } = useAuth();
    const { loggingOut } = useAuthAction();
    const router = useRouter();

    useEffect(() => {
        if (!checking && !user && !loggingOut) {
            router.replace("/notFound");
        }
    }, [checking, user, loggingOut, router]);

    if (checking || (!user && !loggingOut)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 animate-pulse">Memeriksa sesi login…</p>
            </div>
        );
    }

    return children;
}

// import { useRouter } from "next/navigation";
// import useUserRole from "./../hooks/useUserRole";
// import useAuth from "@/hooks/useAuth";
// import { useAuthAction } from "./../context/authContext";
// import { useEffect } from "react";

// export default function ProtectedRoute({ children, allowedRoles }) {
//     const { user, checking } = useAuth();
//     const { loggingOut } = useAuthAction();
//     const { role, loading } = useUserRole();
//     const router = useRouter();

//     useEffect(() => {
//         if (!checking && !user && !loggingOut) {
//             router.replace("/notFound");
//         }
//     }, [checking, user, loggingOut, router]);

//     useEffect(() => {
//         if (user && allowedRoles && !loading && !allowedRoles.includes(role)) {
//             router.replace("/notFound"); 
//         }
//     }, [role, loading, user, allowedRoles, router]);

//     if (checking || loading || (!user && !loggingOut)) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <p className="text-gray-500 animate-pulse">Memeriksa akses...</p>
//             </div>
//         );
//     }

//     return children;
// }
