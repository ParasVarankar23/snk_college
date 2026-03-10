import Image from "next/image";

export default function ScienceExhibitionPage() {
    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <div className="text-center mb-12">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Science Exhibition
                    </h1>

                    <p className="text-gray-600 mt-4">
                        A platform for students to showcase their creativity,
                        innovation, and scientific knowledge through various
                        projects and experiments.
                    </p>

                </div>

                {/* MAIN IMAGE */}
                <div className="mb-14">

                    <Image
                        src="/events/science-main.jpg"
                        alt="Science Exhibition"
                        width={1200}
                        height={500}
                        className="rounded-xl shadow-lg w-full object-cover"
                    />

                </div>

                {/* ABOUT SECTION */}
                <div className="grid md:grid-cols-2 gap-10 items-center mb-16">

                    <div>

                        <h2 className="text-2xl font-semibold text-[#7a1c1c] mb-4">
                            About the Exhibition
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-4">
                            The Science Exhibition organized by Shri Nanasaheb Kulkarni
                            Kanishta Mahavidyalay encourages students to explore the
                            fascinating world of science through practical models
                            and innovative ideas.
                        </p>

                        <p className="text-gray-600 leading-relaxed">
                            Students present various projects related to physics,
                            chemistry, biology, and environmental science, helping
                            them develop scientific thinking and problem-solving skills.
                        </p>

                    </div>

                    {/* HIGHLIGHTS */}
                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h3 className="text-xl font-semibold mb-4">
                            Exhibition Highlights
                        </h3>

                        <ul className="space-y-3 text-gray-600">

                            <li>🔬 Scientific Models</li>
                            <li>⚡ Physics Experiments</li>
                            <li>🧪 Chemistry Demonstrations</li>
                            <li>🌱 Biology Projects</li>
                            <li>🌍 Environmental Awareness Models</li>

                        </ul>

                    </div>

                </div>

                {/* GALLERY */}
                <div>

                    <h2 className="text-2xl font-semibold text-center mb-10">
                        Exhibition Gallery
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <Image
                            src="/events/science1.jpg"
                            alt="Science Project"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/science2.jpg"
                            alt="Science Project"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/science3.jpg"
                            alt="Science Project"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                    </div>

                </div>

            </div>

        </section>
    );
}