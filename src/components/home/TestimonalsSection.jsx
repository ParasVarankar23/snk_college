import Image from "next/image";

export default function TestimonialsSection() {
    const testimonials = [
        {
            name: "Rahul Patil",
            image: "/students/student1.jpg",
            rating: 5,
            comment:
                "SNK Mahavidyalay provided me with excellent education and guidance. The teachers are supportive and the environment is perfect for learning.",
        },
        {
            name: "Sneha Kulkarni",
            image: "/students/student2.jpg",
            rating: 4,
            comment:
                "I had a wonderful experience studying here. The college encourages both academic and cultural activities.",
        },
        {
            name: "Amit Deshmukh",
            image: "/students/student3.jpg",
            rating: 5,
            comment:
                "Great facilities and dedicated faculty members. This college helped me build confidence for my future.",
        },
    ];

    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* SECTION TITLE */}
                <div className="text-center mb-14">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Student Testimonials
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Hear what our students say about their experience at SNK Mahavidyalay.
                    </p>

                </div>

                {/* TESTIMONIAL GRID */}
                <div className="grid md:grid-cols-3 gap-8">

                    {testimonials.map((item, index) => (

                        <div
                            key={index}
                            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition"
                        >

                            {/* IMAGE */}
                            <div className="flex justify-center mb-4">

                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />

                            </div>

                            {/* NAME */}
                            <h3 className="text-center font-semibold text-[#7a1c1c]">
                                {item.name}
                            </h3>

                            {/* STAR RATING */}
                            <div className="flex justify-center mt-2 mb-4">

                                {[...Array(item.rating)].map((_, i) => (
                                    <span key={i} className="text-yellow-500 text-lg">
                                        ★
                                    </span>
                                ))}

                            </div>

                            {/* COMMENT */}
                            <p className="text-gray-600 text-sm text-center leading-relaxed">
                                "{item.comment}"
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}