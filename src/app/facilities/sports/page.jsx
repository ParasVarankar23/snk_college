import Image from "next/image";

export default function SportsSection() {
    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                {/* TEXT CONTENT */}
                <div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Sports & Physical Activities
                    </h2>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay encourages students
                        to participate in sports and physical activities for maintaining
                        health, discipline, and teamwork.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        The college organizes various indoor and outdoor sports activities
                        that help students develop physical fitness and competitive spirit.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Students actively participate in sports events, tournaments, and
                        inter-college competitions which promote leadership and teamwork.
                    </p>

                    {/* SPORTS HIGHLIGHTS */}
                    <div className="grid grid-cols-2 gap-6 mt-6">

                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-[#7a1c1c] font-semibold text-lg">Cricket</p>
                            <p className="text-gray-600 text-sm">Outdoor Sport</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-[#7a1c1c] font-semibold text-lg">Kabaddi</p>
                            <p className="text-gray-600 text-sm">Traditional Sport</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-[#7a1c1c] font-semibold text-lg">Volleyball</p>
                            <p className="text-gray-600 text-sm">Team Sport</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-[#7a1c1c] font-semibold text-lg">Athletics</p>
                            <p className="text-gray-600 text-sm">Track & Field</p>
                        </div>

                    </div>

                </div>

                {/* IMAGE */}
                <div>

                    <Image
                        src="/college/sports.jpg"
                        alt="College Sports Activities"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-lg"
                    />

                </div>

            </div>

        </section>
    );
}