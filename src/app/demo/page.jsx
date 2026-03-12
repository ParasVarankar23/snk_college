"use client";

/* eslint-disable react/prop-types */

import {
    BadgeCheck,
    BookOpen,
    Check,
    FileText,
    GraduationCap,
    IndianRupee,
    Printer,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DOCUMENT_LIST = [
    { key: "studentPhoto", label: "Student Photo" },
    { key: "studentSignature", label: "Student Signature" },
    { key: "parentSignature", label: "Parent Signature" },
    { key: "tenthMarksheet", label: "10th Marksheet" },
    { key: "leavingCertificate", label: "Leaving Certificate" },
    { key: "documentAadhaarCard", label: "Aadhaar Card" },
    { key: "documentBirthCertificate", label: "Birth Certificate" },
    { key: "documentCasteCertificate", label: "Caste Certificate" },
    { key: "documentIncomeCertificate", label: "Income Certificate" },
    { key: "documentDomicileCertificate", label: "Domicile Certificate" },
    { key: "documentParentAadhaarCard", label: "Parent Aadhaar Card" },
];

export default function AdmissionPreviewPage() {
    const router = useRouter();

    const [docStatus, setDocStatus] = useState(
        DOCUMENT_LIST.reduce((acc, doc) => ({ ...acc, [doc.key]: false }), {})
    );

    const toggleDocumentStatus = (key) => {
        setDocStatus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const today = new Date().toLocaleDateString("en-GB");

    const formData = {
        gender: "Female",
        dob: "15/08/2009",
        bloodGroup: "O+",
        aadhaarNumber: "XXXX XXXX XXXX",
        mobileNumber: "8830210723",
        alternateMobileNumber: "8087892925",
        email: "siddhipatil2026@gmail.com",
        nationality: "Indian",
        religion: "Hindu",
        casteCategory: "OBC",
        subCategory: "Bhandari",
        addressLine1: "Borli Panchatan, Tal. Shrivardhan",
        addressLine2: "Dist. Raigad, Maharashtra",
        cityTaluka: "Shrivardhan",
        district: "Raigad",
        state: "Maharashtra",
        pinCode: "402403",

        fatherName: "Abhay Patil",
        fatherOccupation: "Business",
        fatherMobile: "9421160366",
        fatherAadhaar: "XXXX XXXX XXXX",

        motherName: "Shubhangi Patil",
        motherOccupation: "Homemaker",
        motherMobile: "8087892925",
        motherAadhaar: "XXXX XXXX XXXX",

        annualFamilyIncome: "₹ 2,50,000",
        guardianName: "",
        guardianRelation: "",
        guardianContactNumber: "",

        boardName: "Maharashtra State Board",
        schoolName: "Shri Nanasaheb Kulkarni High School",
        schoolUdiseNumber: "27241100001",
        seatNumber: "A210514",
        passingYear: "2026",
        totalMarks: "421",
        outOfMarks: "500",
        percentage: "84.20%",
        grade: "A",
        resultStatus: "Pass",
        mediumOfStudy: "English",
        lastSchoolAddress: "Borli Panchatan, Tal. Shrivardhan, Dist. Raigad",

        reservationCategory: "OBC",
        minorityStatus: "No",
        disabilityStatus: "No",
        emergencyContactNumber: "8087892925",

        selectedStream: "Science",
        mediumSelection: "English",
        transportRequired: "No",
        hostelRequired: "No",
        scholarshipApplicable: "Yes",

        place: "Borli Panchatan",
        declarationDate: today,
        declarationStudentName: "Siddhi Abhay Patil",
        declarationParentName: "Abhay Patil",
    };

    return (
        <div className="print-root min-h-screen bg-[#f3f0f0] px-3 py-4 md:px-5 print:bg-white print:p-0">
            {/* Action Bar */}
            <div className="print-action-bar mx-auto mb-4 flex max-w-[960px] items-center justify-between print:hidden">
                <div>
                    <h1 className="text-lg font-black text-slate-900">Blank Admission Form</h1>
                    <p className="mt-1 text-xs text-slate-500">
                        Click document checkboxes, then print PDF.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#7a1c1c]/20 bg-white px-4 py-2 text-sm font-semibold text-[#7a1c1c] transition hover:bg-[#7a1c1c]/5"
                    >
                        ← Back
                    </button>

                    <button
                        type="button"
                        onClick={() => globalThis.print?.()}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#7a1c1c] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition hover:bg-[#8f2323]"
                    >
                        <Printer className="h-4 w-4" />
                        Print Blank PDF
                    </button>
                </div>
            </div>

            {/* ================= PAGE 1 ================= */}
            <div className="pdf-page pdf-page--first mx-auto mb-5 max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-2xl print:mb-0 print:rounded-none print:shadow-none">
                {/* Header */}
                <div className="border-b-[3px] border-[#7a1c1c] bg-white px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-[20px] font-bold uppercase tracking-[0.28em] text-[#7a1c1c]">
                                Shri Nanasaheb Kulkarni Junior College
                            </p>
                            <h1 className="mt-1 text-[22px] font-black tracking-tight text-slate-900">
                                FYJC / 11th Admission Form
                            </h1>
                            <p className="mt-1 text-[16px] text-slate-500">
                                Borli Panchatan, Tal. Shrivardhan, Dist. Raigad, Maharashtra
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            {/* Passport Photo Box */}
                            <div className="student-photo-box flex h-[170px] w-[130px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-[#7a1c1c]/20 bg-slate-50">
                                <User className="h-11 w-11 text-slate-300" />
                                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                                    Passport
                                </p>
                                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-300">
                                    Size Photo
                                </p>
                            </div>

                            {/* Application ID */}
                            <div className="application-id-box rounded-xl border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-4 py-3">
                                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7a1c1c]">
                                    Application ID
                                </p>
                                <div className="mt-2 h-8 w-[145px] rounded-md border border-dashed border-slate-300 bg-white"></div>

                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-9 text-[10px] font-medium text-slate-600">Year :</span>
                                        <div className="flex h-6 w-[100px] items-center rounded-md border border-dashed border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700">
                                            2026 - 2027
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="w-9 text-[10px] font-medium text-slate-600">Date :</span>
                                        <div className="flex h-6 w-[100px] items-center rounded-md border border-dashed border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700">
                                            {today}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3.5 px-6 py-4">
                    {/* Student Personal Details */}
                    <SectionTitle icon={User} title="Student Personal Details" />
                    <div className="grid grid-cols-4 gap-2">
                        <DataItem label="Full Name" value="Siddhi Abhay Patil" span={2} />
                        <DataItem label="Gender" value={formData.gender} />
                        <DataItem label="Date of Birth" value={formData.dob} />
                        <DataItem label="Blood Group" value={formData.bloodGroup} />
                        <DataItem label="Aadhaar Number" value={formData.aadhaarNumber} />
                        <DataItem label="Mobile Number" value={formData.mobileNumber} />
                        <DataItem label="Alternate Mobile" value={formData.alternateMobileNumber} />
                        <DataItem label="Email ID" value={formData.email} span={2} />
                        <DataItem label="Nationality" value={formData.nationality} />
                        <DataItem label="Religion" value={formData.religion} />
                        <DataItem label="Caste Category" value={formData.casteCategory} />
                        <DataItem label="Sub Category" value={formData.subCategory} />
                        <DataItem label="Address Line 1" value={formData.addressLine1} span={2} />
                        <DataItem label="Address Line 2" value={formData.addressLine2} span={2} />
                        <DataItem label="City / Taluka" value={formData.cityTaluka} />
                        <DataItem label="District" value={formData.district} />
                        <DataItem label="State" value={formData.state} />
                        <DataItem label="PIN Code" value={formData.pinCode} />
                    </div>

                    {/* Parent Details */}
                    <SectionTitle icon={Users} title="Parent / Family Details" />
                    <div className="grid grid-cols-4 gap-2">
                        <DataItem label="Father's Full Name" value={formData.fatherName} span={2} />
                        <DataItem label="Father's Occupation" value={formData.fatherOccupation} />
                        <DataItem label="Father's Mobile" value={formData.fatherMobile} />
                        <DataItem label="Father's Aadhaar" value={formData.fatherAadhaar} />
                        <DataItem label="Mother's Full Name" value={formData.motherName} span={2} />
                        <DataItem label="Mother's Occupation" value={formData.motherOccupation} />
                        <DataItem label="Mother's Mobile" value={formData.motherMobile} />
                        <DataItem label="Mother's Aadhaar" value={formData.motherAadhaar} />
                        <DataItem label="Annual Family Income" value={formData.annualFamilyIncome} />
                        <DataItem label="Guardian Name" value={formData.guardianName} />
                        <DataItem label="Guardian Relation" value={formData.guardianRelation} />
                        <DataItem label="Guardian Contact" value={formData.guardianContactNumber} />
                    </div>

                    {/* 10th Academic Details */}
                    <SectionTitle icon={GraduationCap} title="10th Academic Details" />
                    <div className="grid grid-cols-4 gap-2">
                        <DataItem label="Board Name" value={formData.boardName} />
                        <DataItem label="School Name" value={formData.schoolName} span={2} />
                        <DataItem label="School UDISE No." value={formData.schoolUdiseNumber} />
                        <DataItem label="Seat / Roll Number" value={formData.seatNumber} />
                        <DataItem label="Passing Year" value={formData.passingYear} />
                        <DataItem label="Total Marks Obtained" value={formData.totalMarks} />
                        <DataItem label="Out Of Marks" value={formData.outOfMarks} />
                        <DataItem label="Percentage" value={formData.percentage} />
                        <DataItem label="Grade" value={formData.grade} />
                        <DataItem label="Result Status" value={formData.resultStatus} />
                        <DataItem label="Medium of Study" value={formData.mediumOfStudy} />
                        <DataItem label="Last School Address" value={formData.lastSchoolAddress} span={4} />
                    </div>
                </div>
            </div>

            {/* ================= PAGE 2 ================= */}
            <div className="pdf-page pdf-page--second mx-auto max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-2xl print:rounded-none print:shadow-none">
                {/* Page 2 Header */}
                <div className="border-b-[3px] border-[#7a1c1c] bg-white px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#7a1c1c]">
                                Shri Nanasaheb Kulkarni – Page 2 of 2
                            </p>
                            <h2 className="mt-1 text-[20px] font-black text-slate-900">Admission Summary</h2>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Application ID
                            </p>
                            <div className="mt-1 h-7 w-32 rounded-md border border-dashed border-slate-300 bg-white"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3.5 px-6 py-4">
                    {/* Stream Selection */}
                    <SectionTitle icon={BookOpen} title="Stream Selection Details" />
                    <div className="grid grid-cols-4 gap-2">
                        <DataItem label="Selected Stream" value={formData.selectedStream} span={2} />
                        <DataItem label="Medium Selection" value={formData.mediumSelection} />
                        <DataItem label="Transport Required" value={formData.transportRequired} />
                        <DataItem label="Hostel Required" value={formData.hostelRequired} />
                        <DataItem label="Scholarship Applicable" value={formData.scholarshipApplicable} />
                        <DataItem label="Selected Optional Subjects" value="Physics, Chemistry, Mathematics, Biology, English, Marathi" span={6} />
                    </div>

                    {/* Extra + Payment */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <SectionTitle icon={BadgeCheck} title="Extra Institutional Details" />
                            <div className="grid grid-cols-2 gap-2">
                                <DataItem label="Reservation Category" value={formData.reservationCategory} />
                                <DataItem label="Minority Status" value={formData.minorityStatus} />
                                <DataItem label="Disability / Special Needs" value={formData.disabilityStatus} />
                                <DataItem label="Emergency Contact" value={formData.emergencyContactNumber} />
                            </div>
                        </div>

                        <div>
                            <SectionTitle icon={IndianRupee} title="Payment Details" />
                            <div className="grid grid-cols-2 gap-2">
                                <DataItem label="Payment Mode" value="OFFLINE" highlight />
                                <DataItem label="Payment Status" value="Paid" />
                                <DataItem label="Amount Paid" value="₹ 200" />
                                <DataItem label="Receipt Number" value="" />
                            </div>
                        </div>
                    </div>

                    {/* Documents Checklist */}
                    <SectionTitle icon={FileText} title="Uploaded Documents Checklist" />
                    <div className="grid grid-cols-2 gap-2">
                        {DOCUMENT_LIST.map((doc) => {
                            const isUploaded = docStatus[doc.key];

                            return (
                                <button
                                    type="button"
                                    key={doc.key}
                                    onClick={() => toggleDocumentStatus(doc.key)}
                                    className="flex h-[42px] w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left transition-all duration-200 hover:border-slate-300"
                                >
                                    <span className="pr-3 text-[12px] font-semibold text-slate-800">
                                        {doc.label}
                                    </span>

                                    <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${isUploaded
                                                ? "border-slate-700 bg-slate-700 text-white"
                                                : "border-slate-400 bg-white text-transparent"
                                            }`}
                                    >
                                        <Check className="h-3 w-3" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Declaration */}
                    <SectionTitle icon={ShieldCheck} title="Declaration" />
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[11px] leading-4 text-slate-700">
                            I hereby declare that all the information provided by me is true and correct to the best
                            of my knowledge. I agree to follow the rules and regulations of the college.
                        </p>

                        <div className="mt-2.5 grid grid-cols-4 gap-2">
                            <DataItem label="Place" value={formData.place} />
                            <DataItem label="Date" value={formData.declarationDate} />
                            <DataItem label="Student Name" value={formData.declarationStudentName} />
                            <DataItem label="Parent Name" value={formData.declarationParentName} />
                        </div>
                    </div>

                    {/* Signature Area */}
                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                        <SignatureBox title="Student Signature" />
                        <SignatureBox title="Parent / Guardian Signature" />
                        <SignatureBox title="Principal / Office Verification" />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @page {
                    size: A4 portrait;
                    margin: 4mm;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Hide unwanted UI while printing */
                    header,
                    aside,
                    nav,
                    footer,
                    .print-action-bar,
                    .whatsapp-float,
                    .call-float,
                    .admission-inquiry-btn,
                    .floating-contact,
                    .floating-whatsapp,
                    .floating-call,
                    .contact-floating-icons,
                    .sticky-contact-buttons,
                    .fixed-contact-icons,
                    [data-hide-on-print="true"] {
                        display: none !important;
                    }

                    /* Hide all floating fixed elements */
                    .fixed,
                    .sticky {
                        display: none !important;
                    }

                    html,
                    body {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .print-root {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    .pdf-page {
                        width: 100% !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: hidden !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid-page !important;
                    }

                    .pdf-page--first {
                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .pdf-page--second {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    /* tighter print sizing */
                    .pdf-page .px-6 {
                        padding-left: 14px !important;
                        padding-right: 14px !important;
                    }

                    .pdf-page .py-4 {
                        padding-top: 8px !important;
                        padding-bottom: 8px !important;
                    }

                    .pdf-page .py-3 {
                        padding-top: 7px !important;
                        padding-bottom: 7px !important;
                    }

                    .pdf-page .space-y-3\\.5 > * + * {
                        margin-top: 7px !important;
                    }

                    .pdf-page .gap-2 {
                        gap: 4px !important;
                    }

                    .pdf-page .text-\\[22px\\] {
                        font-size: 16px !important;
                        line-height: 20px !important;
                    }

                    .pdf-page .text-\\[20px\\] {
                        font-size: 15px !important;
                        line-height: 18px !important;
                    }

                    .pdf-page .text-\\[12px\\] {
                        font-size: 8.5px !important;
                        line-height: 10px !important;
                    }

                    .pdf-page .text-\\[11px\\] {
                        font-size: 8px !important;
                        line-height: 10px !important;
                    }

                    .pdf-page .text-\\[10px\\] {
                        font-size: 7px !important;
                        line-height: 9px !important;
                    }

                    .pdf-page .text-\\[9px\\] {
                        font-size: 6.5px !important;
                        line-height: 8px !important;
                    }

                    .pdf-page .text-\\[8px\\] {
                        font-size: 6px !important;
                        line-height: 7px !important;
                    }

                    .pdf-page .student-photo-box {
                        height: 145px !important;
                        width: 108px !important;
                    }

                    .pdf-page .h-\\[170px\\] {
                        height: 145px !important;
                    }

                    .pdf-page .w-\\[130px\\] {
                        width: 108px !important;
                    }

                    .pdf-page .h-\\[42px\\] {
                        height: 30px !important;
                    }

                    .pdf-page .h-12 {
                        height: 24px !important;
                    }

                    .pdf-page .p-3 {
                        padding: 7px !important;
                    }

                    .pdf-page .section-title-row {
                        margin-bottom: 3px !important;
                        padding-bottom: 3px !important;
                    }

                    .pdf-page .section-title-row .h-6 {
                        height: 16px !important;
                        width: 16px !important;
                        min-width: 16px !important;
                    }

                    .pdf-page .section-title-row .h-3\\.5 {
                        height: 9px !important;
                        width: 9px !important;
                    }

                    .pdf-page .section-title-row h3 {
                        font-size: 9px !important;
                        line-height: 11px !important;
                    }
                }
            `}</style>
        </div>
    );
}

/* ---------- Components ---------- */

function DataItem({ label, value, span = 1, highlight = false }) {
    const spanClass =
        span === 4 ? "col-span-4" :
            span === 3 ? "col-span-3" :
                span === 2 ? "col-span-2" :
                    "col-span-1";

    return (
        <div
            className={`data-item-card rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 ${spanClass}`}
        >
            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {label}
            </p>
            <p
                className={`mt-0.5 min-h-[12px] text-[11px] font-medium ${highlight ? "font-bold text-[#7a1c1c]" : "text-slate-900"
                    }`}
            >
                {value || "\u00A0"}
            </p>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="section-title-row mb-1.5 flex items-center gap-1.5 border-b border-slate-200 pb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7a1c1c]/10 text-[#7a1c1c]">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
        </div>
    );
}

function SignatureBox({ title, imageUrl }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
            <div className="flex h-12 items-center justify-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="h-full object-contain" />
                ) : (
                    <span className="text-[10px] italic text-slate-300">Signature</span>
                )}
            </div>
            <p className="mt-1 border-t border-slate-200 pt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {title}
            </p>
        </div>
    );
}