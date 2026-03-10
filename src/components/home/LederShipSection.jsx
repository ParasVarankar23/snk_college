import Image from "next/image";

export default function LeadershipSection() {
    return (
        <section className="bg-white py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* TITLE */}
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Our Leadership
                    </h2>
                    <p className="text-gray-600 mt-3">
                        Dedicated leaders guiding SNK Mahavidyalay towards excellence.
                    </p>
                </div>

                {/* GRID */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

                    {/* CHAIRMAN */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-xl text-center transition">

                        <Image
                            src="/college/chairman.jpg"
                            alt="Ravindra Dada Kulkarni"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Ravindra Dada Kulkarni
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">
                            Chairman
                        </p>

                        <p className="text-sm text-gray-600">
                            Leading the institution with dedication and vision to promote
                            quality education for rural students.
                        </p>

                    </div>

                    {/* PRINCIPAL */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-xl text-center transition">

                        <Image
                            src="/college/principal.jpg"
                            alt="Babasaheb Yalmate"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Babasaheb Yalmate
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">
                            Principal
                        </p>

                        <p className="text-sm text-gray-600">
                            M.A., B.Ed. Dedicated to academic excellence and the holistic
                            development of students.
                        </p>

                    </div>

                    {/* VICE PRINCIPAL */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-xl text-center transition">

                        <Image
                            src="/college/vice-principal.jpg"
                            alt="Vice Principal"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Vice Principal Name
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">
                            Vice Principal
                        </p>

                        <p className="text-sm text-gray-600">
                            Supporting academic administration and student development
                            activities across departments.
                        </p>

                    </div>

                    {/* SUPERVISOR */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-xl text-center transition">

                        <Image
                            src="/college/supervisor.jpg"
                            alt="Supervisor"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-[#7a1c1c]">
                            Supervisor Name
                        </h3>

                        <p className="text-sm text-gray-500 mb-2">
                            Supervisor
                        </p>

                        <p className="text-sm text-gray-600">
                            Ensuring smooth academic operations and maintaining discipline
                            across the college campus.
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}