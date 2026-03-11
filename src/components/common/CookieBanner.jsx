"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem("cookiesAccepted");
        if (!accepted) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem("cookiesAccepted", "true");
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem("cookiesAccepted", "false");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[999] flex justify-center px-4 pb-4">
            <div className="w-full max-w-3xl rounded-2xl border border-white/70 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.15)] backdrop-blur-sm px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7a1c1c]/10 text-xl">
                    🍪
                </div>

                {/* Text */}
                <div className="flex-1 text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">We use cookies</span> to
                    enhance your browsing experience, analyze site traffic, and improve our
                    services. By clicking &ldquo;Accept&rdquo;, you agree to our use of cookies.
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={decline}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Decline
                    </button>
                    <button
                        onClick={accept}
                        className="rounded-lg bg-[#7a1c1c] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#9f2a2a]"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
