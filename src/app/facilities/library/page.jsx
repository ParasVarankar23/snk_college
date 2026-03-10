import Image from "next/image";

export default function LibrarySection() {
    return (
        <section className="bg-white py-10">

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                {/* IMAGE */}
                <div>

                    <Image
                        src="/college/library.jpg"
                        alt="College Library"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-lg"
                    />

                </div>

                {/* TEXT */}
                <div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        College Library
                    </h2>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        The library at Shri Nanasaheb Kulkarni Kanishta Mahavidyalay is an
                        important center of learning that supports students and teachers in
                        their academic activities.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        The library provides a collection of textbooks, reference books,
                        journals, and other educational resources that help students gain
                        deeper knowledge in their respective subjects.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        A quiet and comfortable reading environment encourages students to
                        develop reading habits and improve their academic performance.
                    </p>

                    {/* LIBRARY INFO BOX */}
                    <div className="grid grid-cols-2 gap-6 mt-6">

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <p className="text-[#7a1c1c] font-semibold text-lg">
                                1000+
                            </p>
                            <p className="text-gray-600 text-sm">
                                Books Available
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <p className="text-[#7a1c1c] font-semibold text-lg">
                                Reading Area
                            </p>
                            <p className="text-gray-600 text-sm">
                                Quiet Study Space
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}