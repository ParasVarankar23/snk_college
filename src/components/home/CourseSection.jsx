import Link from "next/link";

export default function CoursesSection() {
    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* SECTION TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Courses We Offer
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Explore the streams available at SNK Mahavidyalay for your academic journey.
                    </p>

                </div>

                {/* COURSES GRID */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* SCIENCE */}
                    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-center">

                        <div className="text-5xl mb-4">🔬</div>

                        <h3 className="text-xl font-semibold text-[#7a1c1c]">
                            Science
                        </h3>

                        <p className="text-gray-600 mt-4">
                            Focus on Physics, Chemistry, Biology, and Mathematics with
                            practical laboratory learning.
                        </p>

                        <Link
                            href="/departments/science"
                            className="inline-block mt-6 text-[#7a1c1c] font-medium hover:underline"
                        >
                            Learn More →
                        </Link>

                    </div>

                    {/* COMMERCE */}
                    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-center">

                        <div className="text-5xl mb-4">💼</div>

                        <h3 className="text-xl font-semibold text-[#7a1c1c]">
                            Commerce
                        </h3>

                        <p className="text-gray-600 mt-4">
                            Learn accounting, economics, and business studies to build a strong
                            foundation for business careers.
                        </p>

                        <Link
                            href="/departments/commerce"
                            className="inline-block mt-6 text-[#7a1c1c] font-medium hover:underline"
                        >
                            Learn More →
                        </Link>

                    </div>

                    {/* ARTS */}
                    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 text-center">

                        <div className="text-5xl mb-4">🎨</div>

                        <h3 className="text-xl font-semibold text-[#7a1c1c]">
                            Arts
                        </h3>

                        <p className="text-gray-600 mt-4">
                            Explore humanities and social sciences while developing creativity,
                            communication, and critical thinking.
                        </p>

                        <Link
                            href="/departments/arts"
                            className="inline-block mt-6 text-[#7a1c1c] font-medium hover:underline"
                        >
                            Learn More →
                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
}