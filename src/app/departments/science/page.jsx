import Image from "next/image";

export default function ScienceTeachersSection() {

    const teachers = [
        {
            name: "Anju Madam",
            subject: "Biology & Chemistry",
            education: "M.Sc., B.Ed.",
            image: "/teachers/anju.jpg",
        },
        {
            name: "Khopkar Sir",
            subject: "Mathematics & Physics",
            education: "M.Sc., B.Ed.",
            image: "/teachers/khopkar.jpg",
        },
        {
            name: "Srushti Madam",
            subject: "English",
            education: "M.Sc., B.Ed.",
            image: "/teachers/srushti.jpg",
        },
        {
            name: "Dhakane Madam",
            subject: "Marathi",
            education: "M.Sc., B.Ed.",
            image: "/teachers/dhakane.jpg",
        },
    ];

    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Science Department Teachers
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Our dedicated teachers guide students with knowledge, discipline,
                        and academic excellence.
                    </p>

                </div>

                {/* TEACHERS GRID */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">

                    {teachers.map((teacher, index) => (

                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
                        >

                            <Image
                                src={teacher.image}
                                alt={teacher.name}
                                width={160}
                                height={160}
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