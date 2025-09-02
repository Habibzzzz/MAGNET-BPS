"use client";
import { createContext, useContext, useState } from "react";

const AuthActionContext = createContext();

export function AuthActionProvider({ children }) {
    const [loggingOut, setLoggingOut] = useState(false);

    return (
        <AuthActionContext.Provider value={{ loggingOut, setLoggingOut }}>
            {children}
        </AuthActionContext.Provider>
    );
}

export function useAuthAction() {
    return useContext(AuthActionContext);
}
