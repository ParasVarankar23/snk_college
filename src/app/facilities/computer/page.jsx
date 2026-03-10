import Image from "next/image";

export default function ComputerSection() {
    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                {/* IMAGE */}
                <div>

                    <Image
                        src="/college/computer-lab.jpg"
                        alt="Computer Lab"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-lg"
                    />

                </div>

                {/* TEXT */}
                <div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Computer Laboratory
                    </h2>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        The Computer Laboratory at Shri Nanasaheb Kulkarni Kanishta
                        Mahavidyalay provides students with modern computing facilities to
                        enhance their digital knowledge and technical skills.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        The lab is equipped with <strong>20 computers</strong> that help
                        students learn computer fundamentals, internet usage, and basic
                        software applications essential for modern education.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-4">
                        The department is guided by <strong>Patange Madam</strong>, who
                        serves as the Head of the Computer Section and ensures that
                        students receive proper guidance in computer education.
                    </p>

                    {/* INFO BOX */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">

                        <p className="text-gray-700">
                            <span className="font-semibold text-[#7a1c1c]">
                                Head of Department:
                            </span>{" "}
                            Patange Madam
                        </p>

                        <p className="text-gray-700 mt-2">
                            <span className="font-semibold text-[#7a1c1c]">
                                Total Computers:
                            </span>{" "}
                            20 Systems
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}