"use client";

/* eslint-disable react/prop-types */

import {
    BadgeCheck,
    BookOpen,
    CheckCircle2,
    FileText,
    GraduationCap,
    IndianRupee,
    Printer,
    ShieldCheck,
    User,
    Users,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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

function getLabel(value) {
    if (value === null || value === undefined || String(value).trim() === "") return "N/A";
    return String(value);
}

function formatDate(dateValue) {
    if (!dateValue) return "N/A";
    try {
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return String(dateValue);
        return d.toLocaleDateString("en-GB");
    } catch {
        return String(dateValue);
    }
}

function streamLabel(value) {
    const map = { science: "11th Science", commerce: "11th Commerce", arts: "11th Arts" };
    return map[value] || getLabel(value);
}

export default function AdmissionPreviewPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(null);
    const [applicationId, setApplicationId] = useState("");
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [uploadedDocUrls, setUploadedDocUrls] = useState({});
    const [loading, setLoading] = useState(true);

    const academicYear = useMemo(() => {
        const year = new Date().getFullYear();
        return `${year}-${year + 1}`;
    }, []);

    const admissionDate = useMemo(() => new Date().toLocaleDateString("en-GB"), []);

    useEffect(() => {
        const loadAdmission = async () => {
            const token = globalThis.localStorage?.getItem("authToken");
            if (!token) {
                toast.error("Please login again.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/auth/admission", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok || !data?.admission) {
                    throw new Error(data?.error || "Unable to load admission preview");
                }

                const payload = data.admission.payload || {};
                setFormData(payload);

                if (data.admission.applicationId) {
                    setApplicationId(data.admission.applicationId);
                }

                if (payload?.payment) {
                    setPaymentDetails(payload.payment);
                }

                const docs = data.admission.documents || {};
                setUploadedDocUrls(
                    Object.fromEntries(
                        Object.entries(docs).map(([key, doc]) => [key, doc?.url || ""])
                    )
                );
            } catch (error) {
                toast.error(error.message || "Failed to load preview");
            } finally {
                setLoading(false);
            }
        };

        loadAdmission();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-sm text-slate-500">Loading admission preview…</p>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="rounded-2xl border border-rose-200 bg-white px-8 py-10 text-center shadow">
                    <p className="text-base font-semibold text-rose-600">No admission data found</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Please complete and submit your admission form first.
                    </p>
                </div>
            </div>
        );
    }

    const fullName = [formData.firstName, formData.middleName, formData.lastName]
        .filter(Boolean)
        .join(" ");

    const studentPhotoUrl = uploadedDocUrls.studentPhoto || "";

    return (
        <div className="print-root min-h-screen bg-[#f0eded] px-4 py-6 md:px-8 print:bg-white print:p-0">
            {/* Action Bar — hidden in print */}
            <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between print:hidden">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Admission Form Preview</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review your submitted admission form before printing.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#7a1c1c]/20 bg-white px-5 py-3 text-sm font-semibold text-[#7a1c1c] transition hover:bg-[#7a1c1c]/5"
                    >
                        ← Back to Form
                    </button>
                    <button
                        type="button"
                        onClick={() => globalThis.print?.()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#7a1c1c] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition hover:bg-[#8f2323]"
                    >
                        <Printer className="h-4 w-4" />
                        Download / Print PDF
                    </button>
                </div>
            </div>

            {/* ── PAGE 1 ── */}
            <div className="pdf-page mx-auto mb-10 max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl print:mb-0 print:rounded-none print:shadow-none">
                {/* Header */}
                <div className="border-b-4 border-[#7a1c1c] bg-white px-10 py-7">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#7a1c1c]">
                                Shri Nanasaheb Kulkarni Kanishta Mahavidyalay
                            </p>
                            <h1 className="mt-1.5 text-3xl font-black tracking-tight text-slate-900">
                                FYJC / 11th Admission Form
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Borli Panchatan, Tal. Shrivardhan, Dist. Raigad, Maharashtra
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            {/* Student Photo */}
                            <div className="flex h-24 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-[#7a1c1c]/20 bg-slate-50">
                                {studentPhotoUrl ? (
                                    <img
                                        src={studentPhotoUrl}
                                        alt="Student"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <User className="h-8 w-8 text-slate-300" />
                                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-300">
                                            Photo
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* App ID box */}
                            <div className="rounded-xl border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-5 py-4 text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a1c1c]">
                                    Application ID
                                </p>
                                <p className="mt-1 text-base font-black text-slate-900">
                                    {applicationId || "—"}
                                </p>
                                <div className="mt-2 space-y-0.5">
                                    <p className="text-xs text-slate-500">
                                        Year:{" "}
                                        <span className="font-semibold text-slate-700">{academicYear}</span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Date:{" "}
                                        <span className="font-semibold text-slate-700">{admissionDate}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-7 px-10 py-8">
                    {/* Student Personal Details */}
                    <SectionTitle icon={User} title="Student Personal Details" />
                    <div className="grid grid-cols-4 gap-3">
                        <DataItem label="Full Name" value={fullName} span={2} />
                        <DataItem label="Gender" value={formData.gender} />
                        <DataItem label="Date of Birth" value={formatDate(formData.dob)} />
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
                    <div className="grid grid-cols-4 gap-3">
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

                    {/* Academic Details */}
                    <SectionTitle icon={GraduationCap} title="10th Academic Details" />
                    <div className="grid grid-cols-4 gap-3">
                        <DataItem label="Board Name" value={formData.boardName} />
                        <DataItem label="School Name" value={formData.schoolName} span={2} />
                        <DataItem label="School UDISE No." value={formData.schoolUdiseNumber} />
                        <DataItem label="Seat / Roll Number" value={formData.seatNumber} />
                        <DataItem label="Passing Year" value={formData.passingYear} />
                        <DataItem label="Total Marks" value={formData.totalMarks} />
                        <DataItem label="Out Of Marks" value={formData.outOfMarks} />
                        <DataItem
                            label="Percentage"
                            value={formData.percentage ? `${formData.percentage}%` : "N/A"}
                        />
                        <DataItem label="Grade" value={formData.grade} />
                        <DataItem label="Result Status" value={formData.resultStatus} />
                        <DataItem label="Medium of Study" value={formData.mediumOfStudy} />
                        <DataItem label="Last School Address" value={formData.lastSchoolAddress} span={4} />
                    </div>
                </div>
            </div>

            {/* ── PAGE 2 ── */}
            <div className="pdf-page mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl print:rounded-none print:shadow-none">
                {/* Page 2 Header */}
                <div className="border-b-4 border-[#7a1c1c] bg-white px-10 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#7a1c1c]">
                                Shri Nanasaheb Kulkarni – Page 2 of 2
                            </p>
                            <h2 className="mt-1 text-2xl font-black text-slate-900">Admission Summary</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Application ID
                            </p>
                            <p className="text-base font-black text-[#7a1c1c]">{applicationId || "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-7 px-10 py-8">
                    {/* Stream Selection */}
                    <SectionTitle icon={BookOpen} title="Stream Selection Details" />
                    <div className="grid grid-cols-4 gap-3">
                        <DataItem
                            label="Selected Stream"
                            value={streamLabel(formData.selectedStream)}
                            span={2}
                        />
                        <DataItem label="Medium Selection" value={formData.mediumSelection} />
                        <DataItem label="Transport Required" value={formData.transportRequired} />
                        <DataItem label="Hostel Required" value={formData.hostelRequired} />
                        <DataItem label="Scholarship Applicable" value={formData.scholarshipApplicable} />
                        <DataItem
                            label="Selected Optional Subjects"
                            value={
                                formData.selectedSubjects?.length
                                    ? formData.selectedSubjects.join(", ")
                                    : "None selected"
                            }
                            span={4}
                        />
                    </div>

                    {/* Extra Institutional Details */}
                    <SectionTitle icon={BadgeCheck} title="Extra Institutional Details" />
                    <div className="grid grid-cols-4 gap-3">
                        <DataItem label="Reservation Category" value={formData.reservationCategory} />
                        <DataItem label="Minority Status" value={formData.minorityStatus} />
                        <DataItem label="Disability / Special Needs" value={formData.disabilityStatus} />
                        <DataItem label="Emergency Contact" value={formData.emergencyContactNumber} />
                    </div>

                    {/* Payment Details */}
                    <SectionTitle icon={IndianRupee} title="Payment Details" />
                    <div className="grid grid-cols-4 gap-3">
                        <DataItem
                            label="Payment Status"
                            value={paymentDetails?.status === "paid" ? "Paid ✓" : "Pending"}
                            highlight={paymentDetails?.status === "paid"}
                        />
                        <DataItem
                            label="Amount Paid"
                            value={paymentDetails?.amount ? `Rs ${paymentDetails.amount}` : "Rs 200"}
                        />
                        <DataItem
                            label="Payment ID"
                            value={paymentDetails?.razorpayPaymentId}
                            span={2}
                        />
                        <DataItem label="Payment Method" value="Razorpay" />
                        <DataItem
                            label="Payment Date"
                            value={paymentDetails?.paidAt ? formatDate(paymentDetails.paidAt) : "N/A"}
                        />
                    </div>

                    {/* Documents Checklist */}
                    <SectionTitle icon={FileText} title="Uploaded Documents Checklist" />
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {DOCUMENT_LIST.map((doc) => {
                            const isUploaded = Boolean(uploadedDocUrls[doc.key]);
                            return (
                                <div
                                    key={doc.key}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${isUploaded
                                        ? "border-[#7a1c1c]/15 bg-[#7a1c1c]/5"
                                        : "border-slate-200 bg-slate-50"
                                        }`}
                                >
                                    <span className="text-sm font-medium text-slate-700">{doc.label}</span>
                                    {isUploaded ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#7a1c1c] px-2 py-0.5 text-[10px] font-semibold text-white">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Uploaded
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                            <XCircle className="h-3 w-3" />
                                            Not Uploaded
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Declaration */}
                    <SectionTitle icon={ShieldCheck} title="Declaration" />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm leading-7 text-slate-700">
                            I hereby declare that all the information provided by me is true and correct to the best
                            of my knowledge. I agree to follow the rules and regulations of the college.
                        </p>
                        <div className="mt-5 grid grid-cols-4 gap-3">
                            <DataItem label="Place" value={formData.place} />
                            <DataItem label="Date" value={formatDate(formData.declarationDate)} />
                            <DataItem label="Student Name" value={formData.declarationStudentName} />
                            <DataItem label="Parent Name" value={formData.declarationParentName} />
                        </div>
                    </div>

                    {/* Signature Area */}
                    <div className="grid grid-cols-3 gap-5 pt-4">
                        <SignatureBox title="Student Signature" imageUrl={uploadedDocUrls.studentSignature} />
                        <SignatureBox title="Parent / Guardian Signature" imageUrl={uploadedDocUrls.parentSignature} />
                        <SignatureBox title="Principal / Office Verification" />
                    </div>

                    {/* Footer */}
                    <div className="border-t border-dashed border-slate-300 pt-5 text-center">
                        <p className="text-[11px] text-slate-400">
                            System-generated admission preview · Shri Nanasaheb Kulkarni Kanishta Mahavidyalay,
                            Borli Panchatan · App ID: {applicationId || "—"} · Year: {academicYear}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @page {
                    size: A4 portrait;
                    margin: 8mm;
                }

                @media print {
                    /* Color fidelity */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Hide layout chrome — navbar, sidebar, mobile overlay */
                    header,
                    aside,
                    nav,
                    [class*="print:hidden"] {
                        display: none !important;
                    }

                    /* Break the scroll-prison: every ancestor that clips height */
                    html,
                    body,
                    #__next,
                    #__next > div,
                    #__next > div > div,
                    #__next > div > div > div {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                    }

                    /* The <main> tag has overflow-y-auto + flex-1 — reset it */
                    main {
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                        flex: none !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    body {
                        background: white !important;
                        margin: 0;
                        padding: 0;
                    }

                    /* Each A4 page card */
                    .pdf-page {
                        width: 100%;
                        min-height: 277mm;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: visible !important;
                        page-break-after: always;
                        break-after: page;
                    }

                    .pdf-page:last-of-type {
                        page-break-after: auto;
                        break-after: auto;
                        min-height: unset;
                    }

                    /* Wrapper that holds both pages */
                    .print-root {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-3 border-b-2 border-[#7a1c1c]/10 pb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7a1c1c] text-white shadow-sm">
                <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
        </div>
    );
}

function DataItem({ label, value, span = 1, highlight = false }) {
    const colSpanMap = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4" };
    const colSpanClass = colSpanMap[span] || "col-span-1";

    return (
        <div className={`${colSpanClass} rounded-xl border border-slate-200 bg-white px-3 py-2.5`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p
                className={`mt-0.5 wrap-break-word text-sm font-semibold ${highlight ? "text-[#7a1c1c]" : "text-slate-800"
                    }`}
            >
                {getLabel(value)}
            </p>
        </div>
    );
}

function SignatureBox({ title, imageUrl }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-center">
            <div className="flex h-16 items-center justify-center overflow-hidden border-b border-dashed border-slate-300 pb-2">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-h-14 max-w-full object-contain"
                    />
                ) : null}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-600">{title}</p>
        </div>
    );
}