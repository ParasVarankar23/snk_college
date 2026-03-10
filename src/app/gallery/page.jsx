import Image from "next/image";

export default function GalleryPage() {

    const images = [
        "/gallery/img1.jpg",
        "/gallery/img2.jpg",
        "/gallery/img3.jpg",
        "/gallery/img4.jpg",
        "/gallery/img5.jpg",
        "/gallery/img6.jpg",
        "/gallery/img7.jpg",
        "/gallery/img8.jpg",
        "/gallery/img9.jpg",
    ];

    return (
        <section className="bg-gray-50 py-20">

            <div className="max-w-7xl mx-auto px-6">

                {/* TITLE */}
                <div className="text-center mb-14">

                    <h1 className="text-4xl font-bold text-gray-800">
                        College Gallery
                    </h1>

                    <p className="text-gray-600 mt-4">
                        Explore moments and memories from various events and activities
                        at Shri Nanasaheb Kulkarni Kanishta Mahavidyalay.
                    </p>

                </div>

                {/* IMAGE GRID */}
                <div className="grid md:grid-cols-3 gap-6">

                    {images.map((img, index) => (

                        <div
                            key={index}
                            className="overflow-hidden rounded-xl shadow-md group"
                        >

                            <Image
                                src={img}
                                alt="College Event"
                                width={400}
                                height={300}
                                className="w-full h-[250px] object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}