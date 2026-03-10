import Image from "next/image";

export default function AcademicAchievements() {
    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-12">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Academic Achievements
                    </h1>

                    <p className="text-gray-600 mt-4">
                        Our students consistently achieve excellent academic results
                        and bring pride to the institution.
                    </p>

                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/student1.jpg"
                            alt="Top Student"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Topper - HSC Science
                        </h3>

                        <p className="text-gray-600 text-sm">
                            95% in Board Examination
                        </p>

                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/student2.jpg"
                            alt="Top Student"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Commerce Topper
                        </h3>

                        <p className="text-gray-600 text-sm">
                            93% in HSC Examination
                        </p>

                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/student3.jpg"
                            alt="Top Student"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Arts Topper
                        </h3>

                        <p className="text-gray-600 text-sm">
                            91% in HSC Examination
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}