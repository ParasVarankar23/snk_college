import Image from "next/image";

export default function AwardsPage() {
    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-12">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Awards & Honors
                    </h1>

                    <p className="text-gray-600 mt-4">
                        The college has received several awards for excellence in
                        education, sports, and cultural activities.
                    </p>

                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/award1.jpg"
                            alt="Best College Award"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Best Junior College Award
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Excellence in Education
                        </p>

                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/award2.jpg"
                            alt="Cultural Award"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Cultural Excellence Award
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Outstanding Cultural Programs
                        </p>

                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md text-center">

                        <Image
                            src="/achievements/award3.jpg"
                            alt="Sports Award"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Sports Achievement Award
                        </h3>

                        <p className="text-gray-600 text-sm">
                            Inter College Sports Champion
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}