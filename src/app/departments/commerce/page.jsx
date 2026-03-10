import Image from "next/image";

export default function CommerceTeachersSection() {

    const teachers = [
        {
            name: "Patil Sir",
            subject: "Accountancy",
            education: "M.Com., B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "Joshi Madam",
            subject: "Secretarial Practice (SP)",
            education: "M.Com., B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "Kulkarni Sir",
            subject: "Organization of Commerce (OC)",
            education: "M.Com., B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "Deshmukh Madam",
            subject: "Economics",
            education: "M.A. Economics, B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "Srushti Madam",
            subject: "English",
            education: "M.A. English, B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "Dhakane Madam",
            subject: "Marathi",
            education: "M.A. Marathi, B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "More Sir",
            subject: "Accountancy",
            education: "M.Com., B.Ed.",
            image: "/college/supervisor.jpg",
        },
        {
            name: "Shinde Madam",
            subject: "Economics",
            education: "M.A. Economics, B.Ed.",
            image: "/college/supervisor.jpg",
        },
    ];

    return (
        <section className="bg-gray-50 py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Commerce Department Teachers
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Experienced teachers guiding students in commerce education and
                        preparing them for professional careers.
                    </p>

                </div>

                {/* GRID */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

                    {teachers.map((teacher, index) => (

                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
                        >

                            <Image
                                src={teacher.image}
                                alt={teacher.name}
                                width={140}
                                height={140}
                                className="mx-auto rounded-full mb-4 object-cover"
                            />

                            <h3 className="text-lg font-semibold text-[#7a1c1c]">
                                {teacher.name}
                            </h3>

                            <p className="text-gray-600 text-sm mt-2">
                                Subject: {teacher.subject}
                            </p>

                            <p className="text-gray-500 text-sm mt-1">
                                Education: {teacher.education}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}