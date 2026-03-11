"use client";

import { PhoneCall } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingContact() {
    const phone = "919309940782";

    return (
        <div className="fixed bottom-6 right-4 z-[990] flex flex-col items-center gap-3">
            {/* Call Button */}
            <a
                href={`tel:+${phone}`}
                aria-label="Call us"
                className="group flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 shadow-[0_8px_25px_rgba(14,165,233,0.35)] transition-all duration-300 hover:scale-110 hover:bg-sky-600"
            >
                <PhoneCall className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-6" strokeWidth={2.5} />
            </a>

            {/* WhatsApp Button */}
            <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-110 hover:bg-[#1ebe5d]"
            >
                <FaWhatsapp className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-6" />
            </a>
        </div>
    );
}