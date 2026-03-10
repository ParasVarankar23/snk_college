import Image from "next/image";

export default function SportsAchievements() {
    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-12">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Sports Achievements
                    </h1>

                    <p className="text-gray-600 mt-4">
                        Our students actively participate in sports competitions
                        and achieve remarkable success.
                    </p>

                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/sports1.jpg"
                            alt="Cricket Team"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Cricket Championship
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Winner - Inter College Tournament
                        </p>

                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/sports2.jpg"
                            alt="Kabaddi"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Kabaddi Tournament
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Runner Up - District Level
                        </p>

                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/sports3.jpg"
                            alt="Athletics"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Athletics Competition
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Gold Medal - 100m Race
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}