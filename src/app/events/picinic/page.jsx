import Image from "next/image";

export default function PicnicPage() {
    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <div className="text-center mb-12">

                    <h1 className="text-4xl font-bold text-gray-800">
                        College Picnic
                    </h1>

                    <p className="text-gray-600 mt-4">
                        A memorable and enjoyable outing for students organized by
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan.
                    </p>

                </div>

                {/* MAIN IMAGE */}
                <div className="mb-14">

                    <Image
                        src="/events/picnic-main.jpg"
                        alt="College Picnic"
                        width={1200}
                        height={500}
                        className="rounded-xl shadow-lg w-full object-cover"
                    />

                </div>

                {/* ABOUT PICNIC */}
                <div className="grid md:grid-cols-2 gap-10 items-center mb-16">

                    <div>

                        <h2 className="text-2xl font-semibold text-[#7a1c1c] mb-4">
                            About the Picnic
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-4">
                            The college picnic is an exciting event that allows students
                            to relax, socialize, and enjoy time together outside the
                            classroom environment.
                        </p>

                        <p className="text-gray-600 leading-relaxed">
                            Students and teachers participate in various fun activities,
                            games, and group events that strengthen friendships and
                            create memorable experiences.
                        </p>

                    </div>

                    {/* ACTIVITIES */}
                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h3 className="text-xl font-semibold mb-4">
                            Picnic Activities
                        </h3>

                        <ul className="space-y-3 text-gray-600">

                            <li>🌳 Outdoor Games</li>
                            <li>🎵 Music and Dance</li>
                            <li>🍱 Group Lunch</li>
                            <li>📸 Group Photography</li>
                            <li>🎉 Fun Activities & Team Games</li>

                        </ul>

                    </div>

                </div>

                {/* GALLERY */}
                <div>

                    <h2 className="text-2xl font-semibold text-center mb-10">
                        Picnic Photo Gallery
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <Image
                            src="/events/picnic1.jpg"
                            alt="Picnic Photo"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/picnic2.jpg"
                            alt="Picnic Photo"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/picnic3.jpg"
                            alt="Picnic Photo"
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