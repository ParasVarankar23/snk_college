import Link from "next/link";

export default function AdmissionPage() {
    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* PAGE TITLE */}
                <div className="text-center mb-14">

                    <h1 className="text-4xl font-bold text-gray-800">
                        Admission Process
                    </h1>

                    <p className="text-gray-600 mt-4">
                        Follow the steps below to apply for admission to
                        Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan.
                    </p>

                </div>

                {/* STEP GRID */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* STEP 1 */}
                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h2 className="text-xl font-semibold text-[#7a1c1c] mb-3">
                            Step 1: Online Registration
                        </h2>

                        <p className="text-gray-600">
                            Students must first complete the online registration through the
                            official Maharashtra / Mumbai University junior college admission
                            portal.
                        </p>

                        <Link
                            href="https://mahafyjcadmissions.in"
                            className="text-[#7a1c1c] font-medium mt-3 inline-block"
                        >
                            Visit Admission Portal →
                        </Link>

                    </div>

                    {/* STEP 2 */}
                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h2 className="text-xl font-semibold text-[#7a1c1c] mb-3">
                            Step 2: Choose the College
                        </h2>

                        <p className="text-gray-600">
                            During the online admission process, select
                            <strong>
                                {" "}Shri Nanasaheb Kulkarni Kanishta Mahavidyalay,
                                Borli Panchatan
                            </strong>{" "}
                            as your preferred college.
                        </p>

                    </div>

                    {/* STEP 3 */}
                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h2 className="text-xl font-semibold text-[#7a1c1c] mb-3">
                            Step 3: Document Verification
                        </h2>

                        <p className="text-gray-600">
                            After selection, students must visit the college office for
                            document verification with required documents.
                        </p>

                    </div>

                    {/* STEP 4 */}
                    <div className="bg-white p-8 rounded-xl shadow-md">

                        <h2 className="text-xl font-semibold text-[#7a1c1c] mb-3">
                            Step 4: Admission Confirmation
                        </h2>

                        <p className="text-gray-600">
                            After successful verification and fee payment, the admission will
                            be confirmed and students will officially become part of the
                            college.
                        </p>

                    </div>

                </div>

                {/* REQUIRED DOCUMENTS */}
                <div className="mt-16 bg-white p-10 rounded-xl shadow-md">

                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Required Documents
                    </h2>

                    <ul className="list-disc pl-6 space-y-2 text-gray-600">

                        <li>10th Marksheet (SSC)</li>
                        <li>School Leaving Certificate</li>
                        <li>Caste Certificate (if applicable)</li>
                        <li>Aadhar Card Copy</li>
                        <li>Passport Size Photographs</li>

                    </ul>

                </div>

            </div>

        </section>
    );
}