import Link from 'next/link';

export default function Commerce12thPage() {
    const subjects = [
        {
            name: 'Accountancy',
            type: 'Theory & Practical',
            description: 'Advanced accounting including partnership accounts, company accounts, financial analysis, and cost accounting.',
        },
        {
            name: 'Economics',
            type: 'Theory',
            description: 'Macro and microeconomics, national income, money and banking, government budget, and international trade.',
        },
        {
            name: 'Secretarial Practice',
            type: 'Theory & Practical',
            description: 'Company law, secretarial correspondence, meeting procedures, corporate governance, and stock exchange operations.',
        },
        {
            name: 'Organization of Commerce',
            type: 'Theory',
            description: 'Business environment, entrepreneurship development, international business, and e-commerce applications.',
        },
        {
            name: 'Statistics',
            type: 'Theory & Practical',
            description: 'Statistical methods, probability distributions, hypothesis testing, index numbers, and time series analysis.',
        },
        {
            name: 'English',
            type: 'Theory',
            description: 'Business correspondence, report writing, professional communication, and advanced literature analysis.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link href="/academics" className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-8 group transition-colors duration-200">
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Academics
                </Link>

                {/* Header Section */}
                <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl shadow-2xl p-8 md:p-12 mb-12 text-white">
                    <div className="flex items-center mb-4">
                        <span className="text-6xl mr-6">📊</span>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">12th Commerce</h1>
                            <p className="text-teal-100 text-lg">Advanced Year - Commerce Stream</p>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        The 12th Commerce program offers advanced knowledge in business, finance, and commerce. This critical year prepares
                        students for professional courses like CA, CS, CMA, and entrance exams for BBA, B.Com, and other management programs.
                        The curriculum is designed to develop analytical, quantitative, and business acumen skills.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        With emphasis on practical application and real-world business scenarios, students gain comprehensive understanding
                        of corporate practices, financial management, and statistical analysis. The addition of Statistics equips students
                        with essential quantitative skills crucial for data-driven decision making in modern business environments.
                    </p>
                </div>

                {/* Subjects Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-8 py-6 bg-gradient-to-r from-teal-500 to-green-500">
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
                                    <tr key={subject.name} className="hover:bg-teal-50 transition-colors duration-200">
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
                            <div key={subject.name} className="p-6 hover:bg-teal-50 transition-colors duration-200">
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
                    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-teal-500">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Subjects</h3>
                        <p className="text-3xl font-bold text-teal-600">{subjects.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Practical Subjects</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {subjects.filter(s => s.type.includes('Practical')).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-emerald-500">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Theory Subjects</h3>
                        <p className="text-3xl font-bold text-emerald-600">
                            {subjects.filter(s => s.type === 'Theory').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
