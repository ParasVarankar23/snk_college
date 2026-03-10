export default function Science12thPage() {
    const subjects = [
        {
            name: 'Physics',
            type: 'Theory & Practical',
            description: 'Advanced concepts in electromagnetism, modern physics, semiconductor electronics, and communication systems.',
        },
        {
            name: 'Chemistry',
            type: 'Theory & Practical',
            description: 'In-depth study of organic chemistry, chemical kinetics, electrochemistry, and coordination compounds.',
        },
        {
            name: 'Biology',
            type: 'Theory & Practical',
            description: 'Advanced topics in genetics, biotechnology, ecology, human health, and reproduction in organisms.',
        },
        {
            name: 'Mathematics',
            type: 'Theory',
            description: 'Advanced calculus, differential equations, vectors, probability, linear programming, and matrices.',
        },
        {
            name: 'English',
            type: 'Theory',
            description: 'Advanced literature, critical analysis, essay writing, and professional communication skills.',
        },
        {
            name: 'Computer Science',
            type: 'Theory & Practical',
            description: 'Programming concepts, data structures, algorithms, database management, and software development.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fdf4f4] to-[#f9ecec] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#7a1c1c] to-[#5a1414] rounded-2xl shadow-2xl p-8 md:p-12 mb-12 text-white">
                    <div className="flex items-center mb-4">
                        <span className="text-6xl mr-6">🧪</span>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">12th Science</h1>
                            <p className="text-red-100 text-lg">Advanced Year - Science Stream</p>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        The 12th Science program builds upon the foundation established in 11th standard, offering advanced and
                        specialized knowledge in scientific disciplines. This crucial year prepares students for competitive entrance
                        examinations like JEE, NEET, and other professional courses in engineering, medicine, and research.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        With comprehensive coverage of advanced topics and intensive practical training, our curriculum ensures students
                        are well-prepared for higher education and professional challenges. The addition of Computer Science provides
                        students with essential programming and computational skills highly valued in today's technology-driven world.
                    </p>
                </div>

                {/* Subjects Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-8 py-6 bg-gradient-to-r from-[#7a1c1c] to-[#5a1414]">
                        <h2 className="text-2xl font-bold text-white">Subject Details</h2>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                        Subject Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.map((subject, index) => (
                                    <tr key={subject.name} className="hover:bg-red-50 transition-colors duration-200">
                                        <td className="px-6 py-5">
                                            <div className="text-base font-semibold text-gray-900">{subject.name}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${subject.type.includes('Practical')
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {subject.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-700 text-sm leading-relaxed">
                                            {subject.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {subjects.map((subject, index) => (
                            <div key={subject.name} className="p-6 hover:bg-red-50 transition-colors duration-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${subject.type.includes('Practical')
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {subject.type}
                                </span>
                                <p className="text-gray-700 text-sm leading-relaxed mt-2">{subject.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#7a1c1c]">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Subjects</h3>
                        <p className="text-3xl font-bold text-[#7a1c1c]">{subjects.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Practical Subjects</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {subjects.filter(s => s.type.includes('Practical')).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#7a1c1c]">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Theory Subjects</h3>
                        <p className="text-3xl font-bold text-[#7a1c1c]">
                            {subjects.filter(s => s.type === 'Theory').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
