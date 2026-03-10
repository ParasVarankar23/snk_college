import Image from "next/image";

export default function LaboratoryPage() {
    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <div className="text-center mb-14">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Science Laboratories
                    </h1>

                    <p className="text-gray-600 mt-3">
                        Our college provides well-equipped laboratories for Science students
                        to perform experiments and gain practical knowledge.
                    </p>

                </div>

                {/* LAB GRID */}
                <div className="grid md:grid-cols-3 gap-10">

                    {/* PHYSICS LAB */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">

                        <Image
                            src="/college/physics-lab.jpg"
                            alt="Physics Laboratory"
                            width={500}
                            height={300}
                            className="w-full h-[220px] object-cover"
                        />

                        <div className="p-6">

                            <h2 className="text-xl font-semibold text-[#7a1c1c]">
                                Physics Laboratory
                            </h2>

                            <p className="text-gray-600 mt-3 text-justify">
                                The Physics Laboratory helps students understand fundamental
                                concepts of physics through practical experiments related to
                                mechanics, electricity, magnetism, and optics.
                            </p>

                        </div>

                    </div>

                    {/* CHEMISTRY LAB */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">

                        <Image
                            src="/college/chemistry-lab.jpg"
                            alt="Chemistry Laboratory"
                            width={500}
                            height={300}
                            className="w-full h-[220px] object-cover"
                        />

                        <div className="p-6">

                            <h2 className="text-xl font-semibold text-[#7a1c1c]">
                                Chemistry Laboratory
                            </h2>

                            <p className="text-gray-600 mt-3 text-justify">
                                The Chemistry Laboratory is equipped for various experiments in
                                organic, inorganic, and physical chemistry, helping students
                                develop practical skills and scientific understanding.
                            </p>

                        </div>

                    </div>

                    {/* BIOLOGY LAB */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">

                        <Image
                            src="/college/biology-lab.jpg"
                            alt="Biology Laboratory"
                            width={500}
                            height={300}
                            className="w-full h-[220px] object-cover"
                        />

                        <div className="p-6">

                            <h2 className="text-xl font-semibold text-[#7a1c1c]">
                                Biology Laboratory
                            </h2>

                            <p className="text-gray-600 mt-3 text-justify">
                                The Biology Laboratory provides facilities for studying plant
                                and animal biology, microscopic observations, and practical
                                experiments that enhance students' understanding of life
                                sciences.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}