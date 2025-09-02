"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../app/firebase/config";

export default function useUserRole() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const res = await fetch('/api/auth/verify-token', {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: 'no-store'
                    });
                    const data = await res.json();
                    if (data?.success && data?.role) {
                        setRole(data.role);
                    }
                } catch (e) {
                    console.warn('Role fetch via verify-token failed', e);
                }
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { role, loading };
}
