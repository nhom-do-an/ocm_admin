"use client";

import { useEffect, useState, useRef, createContext, useContext } from "react";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

type LoaderContextType = {
    startLoading: () => void;
    stopLoading: () => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeRequests, setActiveRequests] = useState(0);
    const [isRouting, setIsRouting] = useState(false);
    const isMountedRef = useRef(false);

    // Đảm bảo không gọi setState sau khi component đã unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // 👉 Khi router chuyển trang
    useEffect(() => {
        const handleStart = () => setIsRouting(true);
        const handleStop = () => setIsRouting(false);

        Router.events.on("routeChangeStart", handleStart);
        Router.events.on("routeChangeComplete", handleStop);
        Router.events.on("routeChangeError", handleStop);

        return () => {
            Router.events.off("routeChangeStart", handleStart);
            Router.events.off("routeChangeComplete", handleStop);
            Router.events.off("routeChangeError", handleStop);
        };
    }, []);

    // 👉 Bắt đầu hoặc kết thúc progress
    useEffect(() => {
        if (isRouting || activeRequests > 0) {
            NProgress.start();
        } else {
            NProgress.done();
        }
    }, [isRouting, activeRequests]);

    const startLoading = () => {
        if (!isMountedRef.current) return;
        setActiveRequests((prev) => prev + 1);
    };

    const stopLoading = () => {
        if (!isMountedRef.current) return;
        setActiveRequests((prev) => Math.max(prev - 1, 0));
    };

    return (
        <LoaderContext.Provider value={{ startLoading, stopLoading }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => {
    const ctx = useContext(LoaderContext);
    if (!ctx) throw new Error("useLoader must be used within LoaderProvider");
    return ctx;
};
