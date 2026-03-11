"use client";

export default function FloatingContact() {
    const phone = "919309940782";

    return (
        <div className="fixed bottom-6 right-4 z-[990] flex flex-col items-center gap-3">
            {/* Call Button */}
            <a
                href={`tel:+${phone}`}
                aria-label="Call us"
                className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                style={{ background: "radial-gradient(circle at 35% 35%, #60c0f8, #1a8fe3)" }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="h-6 w-6"
                >
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                </svg>
            </a>

            {/* WhatsApp Button */}
            <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                style={{ background: "radial-gradient(circle at 35% 35%, #6be06b, #25d366)" }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    fill="white"
                    className="h-7 w-7"
                >
                    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.5L4 29l7.748-1.797A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm5.894 16.634c-.247.694-1.457 1.325-2 1.372-.543.048-1.06.26-3.572-.744-2.98-1.188-4.9-4.234-5.047-4.428-.148-.194-1.2-1.594-1.2-3.04 0-1.447.758-2.156 1.027-2.45.268-.294.586-.368.781-.368.195 0 .39.002.561.01.18.008.421-.069.66.503.247.587.838 2.032.912 2.18.073.147.122.32.024.514-.098.194-.147.314-.293.484-.147.17-.308.38-.44.51-.146.144-.298.3-.128.588.17.288.757 1.249 1.626 2.023 1.118 1.001 2.06 1.312 2.35 1.46.288.147.457.122.626-.073.17-.195.731-.853.926-1.147.194-.293.389-.244.657-.147.268.098 1.703.805 1.995.951.293.147.487.22.56.342.073.122.073.706-.174 1.4z" />
                </svg>
            </a>
        </div>
    );
}
