"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getDocFromCache, getDocFromServer } from "firebase/firestore";
import { auth } from "./../app/firebase/config";
import { db } from "./../app/firebase/config";

export default function useUserRole() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                try {
                    // Try cache first to avoid network dependency
                    const cacheSnap = await getDocFromCache(docRef);
                    if (cacheSnap.exists()) {
                        setRole(cacheSnap.data().role);
                        setLoading(false);
                        return;
                    }
                } catch (_) {}
                try {
                    const serverSnap = await getDocFromServer(docRef);
                    if (serverSnap.exists()) {
                        setRole(serverSnap.data().role);
                    }
                } catch (e) {
                    console.warn('Failed to fetch role from server, falling back to default', e);
                }
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { role, loading };
}
