import Image from "next/image";

export default function CulturalSection() {
    return (
        <section className="bg-white py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* SECTION TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Cultural Programs
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Our college encourages students to showcase their talents through
                        various cultural activities and performances.
                    </p>

                </div>

                {/* CULTURAL IMAGE */}
                <div className="mb-14">

                    <Image
                        src="/events/cultural-main.jpg"
                        alt="Cultural Program"
                        width={1200}
                        height={500}
                        className="rounded-xl shadow-lg w-full object-cover"
                    />

                </div>

                {/* CONTENT */}
                <div className="grid md:grid-cols-2 gap-10 items-center">

                    <div>

                        <h3 className="text-2xl font-semibold text-[#7a1c1c] mb-4">
                            Celebrating Talent & Creativity
                        </h3>

                        <p className="text-gray-600 leading-relaxed mb-4">
                            Cultural programs are an important part of student life at
                            Shri Nanasaheb Kulkarni Kanishta Mahavidyalay. These programs
                            give students an opportunity to express their creativity and
                            artistic talents.
                        </p>

                        <p className="text-gray-600 leading-relaxed">
                            The college organizes various cultural events including dance,
                            drama, music performances, and traditional celebrations that
                            bring together students, teachers, and the community.
                        </p>

                    </div>

                    {/* ACTIVITIES */}
                    <div className="bg-gray-50 p-8 rounded-xl shadow-md">

                        <h3 className="text-xl font-semibold mb-4">
                            Activities Included
                        </h3>

                        <ul className="space-y-3 text-gray-600">

                            <li>💃 Traditional & Modern Dance</li>
                            <li>🎤 Singing & Music Performances</li>
                            <li>🎭 Drama & Stage Acts</li>
                            <li>🎨 Art & Creativity Programs</li>
                            <li>🎉 Festival Celebrations</li>

                        </ul>

                    </div>

                </div>

                {/* GALLERY */}
                <div className="mt-16">

                    <h3 className="text-2xl font-semibold text-center mb-10">
                        Cultural Event Gallery
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">

                        <Image
                            src="/events/cultural1.jpg"
                            alt="Cultural Event"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/cultural2.jpg"
                            alt="Cultural Event"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/cultural3.jpg"
                            alt="Cultural Event"
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