"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../app/firebase/config";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                try {
                    const token = await u.getIdTokenResult();
                    setUserRole(token.claims.role || 'intern');
                } catch (error) {
                    console.error('Error getting user role:', error);
                    setUserRole('intern');
                }
            } else {
                setUserRole(null);
            }
            setChecking(false);
        });

        return () => unsub();
    }, []);

    return { user, userRole, checking };
}

export default useAuth;
