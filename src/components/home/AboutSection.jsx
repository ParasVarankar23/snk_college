import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
    return (
        <section className="bg-white py-30">

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                {/* LEFT IMAGE */}
                <div>

                    <Image
                        src="/college/college.jpg"
                        alt="SNK College Campus"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-lg"
                    />

                </div>

                {/* RIGHT TEXT */}
                <div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        About SNK Mahavidyalay
                    </h2>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay Borli Panchatan is
                        dedicated to providing quality education and fostering academic
                        excellence among students. The college focuses on holistic
                        development through modern education, cultural activities, and
                        discipline.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Our institution provides education in Science, Commerce, and Arts
                        streams for 11th and 12th standards while encouraging innovation,
                        leadership, and social responsibility among students.
                    </p>

                    <Link
                        href="/about"
                        className="inline-block px-6 py-3 bg-[#7a1c1c] text-white rounded-lg hover:bg-[#9f2a2a]"
                    >
                        Read More
                    </Link>

                </div>

            </div>

        </section>
    );
}