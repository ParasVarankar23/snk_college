import Image from "next/image";

export default function ArtsTeachersSection() {

    const teachers = [
        {
            name: "Patil Madam",
            subject: "History",
            education: "M.A. History, B.Ed.",
            image: "/teachers/arts1.jpg",
        },
        {
            name: "Kulkarni Sir",
            subject: "Geography",
            education: "M.A. Geography, B.Ed.",
            image: "/teachers/arts2.jpg",
        },
        {
            name: "Deshmukh Madam",
            subject: "Political Science",
            education: "M.A. Political Science, B.Ed.",
            image: "/teachers/arts3.jpg",
        },
        {
            name: "Shinde Sir",
            subject: "Economics",
            education: "M.A. Economics, B.Ed.",
            image: "/teachers/arts4.jpg",
        },
        {
            name: "Dhakane Madam",
            subject: "Marathi",
            education: "M.A. Marathi, B.Ed.",
            image: "/teachers/arts5.jpg",
        },
        {
            name: "Srushti Madam",
            subject: "English",
            education: "M.A. English, B.Ed.",
            image: "/teachers/arts6.jpg",
        },
        {
            name: "More Sir",
            subject: "Sociology",
            education: "M.A. Sociology, B.Ed.",
            image: "/teachers/arts7.jpg",
        },
        {
            name: "Joshi Madam",
            subject: "Psychology",
            education: "M.A. Psychology, B.Ed.",
            image: "/teachers/arts8.jpg",
        },
    ];

    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Arts Department Teachers
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Dedicated teachers helping students explore humanities and social
                        sciences with strong academic guidance.
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