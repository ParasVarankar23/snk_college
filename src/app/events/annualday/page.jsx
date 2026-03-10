import Image from "next/image";

export default function AnnualDayPage() {
    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <div className="text-center mb-12">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Annual Day Celebration
                    </h1>

                    <p className="text-gray-600 mt-4">
                        A joyful celebration of achievements, culture, and talent at
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan.
                    </p>

                </div>

                {/* EVENT IMAGE */}
                <div className="mb-14">

                    <Image
                        src="/events/annual-day.jpg"
                        alt="Annual Day Event"
                        width={1200}
                        height={500}
                        className="rounded-xl shadow-lg w-full object-cover"
                    />

                </div>

                {/* ABOUT EVENT */}
                <div className="grid md:grid-cols-2 gap-10 items-center mb-16">

                    <div>

                        <h2 className="text-2xl font-semibold text-[#7a1c1c] mb-4">
                            About the Event
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-4">
                            The Annual Day celebration is one of the most important events of
                            the college. It provides students with an opportunity to showcase
                            their talents through cultural programs, performances, and
                            academic achievements.
                        </p>

                        <p className="text-gray-600 leading-relaxed">
                            Students participate in dance, drama, music, and speeches while
                            awards and certificates are presented to outstanding students for
                            their achievements in academics, sports, and extracurricular
                            activities.
                        </p>

                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            Event Highlights
                        </h3>

                        <ul className="space-y-3 text-gray-600">

                            <li>🎭 Cultural Performances</li>
                            <li>🏆 Prize Distribution Ceremony</li>
                            <li>🎤 Guest Speeches</li>
                            <li>💃 Dance and Music Performances</li>
                            <li>🎓 Student Achievements Recognition</li>

                        </ul>

                    </div>

                </div>

                {/* GALLERY */}
                <div>

                    <h2 className="text-2xl font-semibold text-center mb-10">
                        Event Gallery
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <Image
                            src="/events/annual1.jpg"
                            alt="Annual Day Photo"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/annual2.jpg"
                            alt="Annual Day Photo"
                            width={400}
                            height={250}
                            className="rounded-lg shadow-md object-cover"
                        />

                        <Image
                            src="/events/annual3.jpg"
                            alt="Annual Day Photo"
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