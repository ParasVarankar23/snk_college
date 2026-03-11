"use client";

/* eslint-disable react/prop-types */

import {
    BadgeCheck,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    FileBadge,
    FileText,
    GraduationCap,
    HeartPulse,
    House,
    IdCard,
    IndianRupee,
    Mail,
    Phone,
    Save,
    ShieldCheck,
    Upload,
    User,
    Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const FORM_PRICE_INR = 200;
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise = null;

const FILE_FIELD_KEYS = [
    "studentPhoto",
    "studentSignature",
    "parentSignature",
    "tenthMarksheet",
    "leavingCertificate",
    "documentAadhaarCard",
    "documentBirthCertificate",
    "documentCasteCertificate",
    "documentIncomeCertificate",
    "documentDomicileCertificate",
    "documentParentAadhaarCard",
];

const REQUIRED_UPLOAD_KEYS = [
    "studentPhoto",
    "studentSignature",
    "parentSignature",
    "tenthMarksheet",
    "leavingCertificate",
    "documentAadhaarCard",
];

const streamOptions = [
    {
        value: "science",
        label: "11th Science",
        accent: "from-[#7a1c1c] to-[#5a1414]",
        subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "IT"],
    },
    {
        value: "commerce",
        label: "11th Commerce",
        accent: "from-[#8f2323] to-[#6d1818]",
        subjects: ["Book Keeping", "Economics", "Secretarial Practice", "Mathematics", "IT", "Organization of Commerce"],
    },
    {
        value: "arts",
        label: "11th Arts",
        accent: "from-[#a12b2b] to-[#7a1c1c]",
        subjects: ["History", "Political Science", "Sociology", "Psychology", "Geography", "Economics"],
    },
];

const sectionItems = [
    { id: "student", label: "Student Details", icon: User },
    { id: "family", label: "Parent Details", icon: Users },
    { id: "academic", label: "10th Academics", icon: GraduationCap },
    { id: "stream", label: "Stream Selection", icon: BookOpen },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "payment", label: "Payment", icon: IndianRupee },
    { id: "declaration", label: "Declaration", icon: ShieldCheck },
    { id: "extras", label: "Extra Details", icon: BadgeCheck },
];

const requiredFieldKeys = [
    "firstName",
    "lastName",
    "gender",
    "dob",
    "aadhaarNumber",
    "mobileNumber",
    "email",
    "nationality",
    "religion",
    "casteCategory",
    "addressLine1",
    "cityTaluka",
    "district",
    "state",
    "pinCode",
    "fatherName",
    "fatherOccupation",
    "fatherMobile",
    "motherName",
    "motherOccupation",
    "motherMobile",
    "annualFamilyIncome",
    "boardName",
    "schoolName",
    "seatNumber",
    "passingYear",
    "totalMarks",
    "outOfMarks",
    "percentage",
    "resultStatus",
    "mediumOfStudy",
    "lastSchoolAddress",
    "selectedStream",
    "mediumSelection",
    "transportRequired",
    "hostelRequired",
    "scholarshipApplicable",
    "place",
    "declarationDate",
    "declarationStudentName",
    "declarationParentName",
    "reservationCategory",
    "minorityStatus",
    "disabilityStatus",
    "emergencyContactNumber",
];

const initialFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    aadhaarNumber: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    email: "",
    nationality: "Indian",
    religion: "",
    casteCategory: "",
    subCategory: "",
    addressLine1: "",
    addressLine2: "",
    cityTaluka: "",
    district: "",
    state: "Maharashtra",
    pinCode: "",
    studentPhoto: null,
    studentSignature: null,
    fatherName: "",
    fatherOccupation: "",
    fatherMobile: "",
    fatherAadhaar: "",
    motherName: "",
    motherOccupation: "",
    motherMobile: "",
    motherAadhaar: "",
    annualFamilyIncome: "",
    guardianName: "",
    guardianRelation: "",
    guardianContactNumber: "",
    parentSignature: null,
    boardName: "SSC",
    schoolName: "",
    schoolUdiseNumber: "",
    seatNumber: "",
    passingYear: "2026",
    totalMarks: "",
    outOfMarks: "",
    percentage: "",
    grade: "",
    resultStatus: "Pass",
    mediumOfStudy: "",
    lastSchoolAddress: "",
    tenthMarksheet: null,
    leavingCertificate: null,
    selectedStream: "",
    selectedSubjects: [],
    mediumSelection: "",
    transportRequired: "No",
    hostelRequired: "No",
    scholarshipApplicable: "No",
    documentAadhaarCard: null,
    documentBirthCertificate: null,
    documentCasteCertificate: null,
    documentIncomeCertificate: null,
    documentDomicileCertificate: null,
    documentParentAadhaarCard: null,
    declarationAccepted: false,
    place: "Borli Panchatan",
    declarationDate: new Date().toISOString().slice(0, 10),
    declarationStudentName: "",
    declarationParentName: "",
    reservationCategory: "",
    minorityStatus: "No",
    disabilityStatus: "No",
    emergencyContactNumber: "",
};

function inputClass(hasError) {
    return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition ${hasError
        ? "border-rose-300 ring-2 ring-rose-100"
        : "border-slate-200 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/10"
        }`;
}

function mergeLoadedPayloadIntoForm(prev, payload) {
    const safePayload = payload || {};
    const allowedEntries = Object.entries(safePayload).filter(
        ([key]) => key in prev && !FILE_FIELD_KEYS.includes(key)
    );

    return {
        ...prev,
        ...Object.fromEntries(allowedEntries),
    };
}

function loadRazorpayScript() {
    if (typeof globalThis === "undefined") return Promise.resolve(false);
    if (globalThis.Razorpay) return Promise.resolve(true);
    if (razorpayScriptPromise) return razorpayScriptPromise;

    razorpayScriptPromise = new Promise((resolve) => {
        const script = globalThis.document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        globalThis.document.body.appendChild(script);
    });

    return razorpayScriptPromise;
}

function openRazorpayCheckout(options) {
    return new Promise((resolve, reject) => {
        try {
            const razorpay = new globalThis.Razorpay({
                ...options,
                handler: (response) => resolve(response),
                modal: {
                    ondismiss: () => reject(new Error("Payment popup was closed")),
                },
            });

            razorpay.on("payment.failed", (response) => {
                reject(new Error(response?.error?.description || "Payment failed"));
            });

            razorpay.open();
        } catch {
            reject(new Error("Unable to open Razorpay checkout"));
        }
    });
}

export default function AdmissionFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [savedDraft, setSavedDraft] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingAdmission, setLoadingAdmission] = useState(false);
    const [paymentInProgress, setPaymentInProgress] = useState(false);
    const [uploadedDocKeys, setUploadedDocKeys] = useState([]);
    const [serverMessage, setServerMessage] = useState("");
    const [formData, setFormData] = useState(initialFormState);
    const [applicationId, setApplicationId] = useState("Will be generated on submit");
    const [paymentDetails, setPaymentDetails] = useState(null);

    const currentAcademicYear = useMemo(() => {
        const year = new Date().getFullYear();
        return `${year}-${year + 1}`;
    }, []);

    const activeSection = useMemo(() => {
        const section = searchParams.get("section");
        return sectionItems.some((item) => item.id === section) ? section : "student";
    }, [searchParams]);

    const activeSectionMeta = useMemo(
        () => sectionItems.find((item) => item.id === activeSection) || sectionItems[0],
        [activeSection]
    );

    const fullName = useMemo(() => {
        return [formData.firstName, formData.middleName, formData.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
    }, [formData.firstName, formData.middleName, formData.lastName]);

    const getCompletedRequiredFields = (data) => {
        return requiredFieldKeys.filter((key) => {
            const value = data[key];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "string") return value.trim().length > 0;
            return Boolean(value);
        }).length;
    };

    const completionCount = useMemo(() => {
        const completedRequiredFields = getCompletedRequiredFields(formData);

        const baselineRequiredFields = getCompletedRequiredFields(initialFormState);

        const normalizedRequiredFields = Math.max(0, completedRequiredFields - baselineRequiredFields);

        const totalRequiredFields = Math.max(1, requiredFieldKeys.length - baselineRequiredFields);

        const completedUploads = REQUIRED_UPLOAD_KEYS.filter((key) => {
            const localFile = formData[key];
            return localFile instanceof File || uploadedDocKeys.includes(key);
        }).length;

        const declarationCompleted = formData.declarationAccepted ? 1 : 0;

        const completed = normalizedRequiredFields + completedUploads + declarationCompleted;
        const total = totalRequiredFields + REQUIRED_UPLOAD_KEYS.length + 1;

        return { completed, total };
    }, [formData, uploadedDocKeys]);

    const progressPercent = Math.max(
        0,
        Math.min(100, Math.round((completionCount.completed / completionCount.total) * 100))
    );

    const subjectOptions = useMemo(() => {
        const selectedStream = streamOptions.find((item) => item.value === formData.selectedStream);
        return selectedStream?.subjects || [];
    }, [formData.selectedStream]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setSavedDraft(false);
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (name, file) => {
        setSavedDraft(false);
        if (file) {
            setUploadedDocKeys((prev) => (prev.includes(name) ? prev : [...prev, name]));
        }
        setFormData((prev) => ({
            ...prev,
            [name]: file || null,
        }));
    };

    const toggleSubject = (subject) => {
        setFormData((prev) => {
            const exists = prev.selectedSubjects.includes(subject);
            return {
                ...prev,
                selectedSubjects: exists
                    ? prev.selectedSubjects.filter((item) => item !== subject)
                    : [...prev.selectedSubjects, subject],
            };
        });
    };

    const handleStreamSelect = (streamValue) => {
        setSavedDraft(false);
        setFormData((prev) => ({
            ...prev,
            selectedStream: streamValue,
            selectedSubjects: [],
        }));
    };

    const handleCancel = () => {
        setFormData({
            ...initialFormState,
            declarationDate: new Date().toISOString().slice(0, 10),
        });
        setSubmitAttempted(false);
        setSavedDraft(false);
        setUploadedDocKeys([]);
        setServerMessage("");
        setApplicationId("Will be generated on submit");
        setPaymentDetails(null);
        router.replace("/user/admission?section=student", { scroll: false });
    };

    const handleSaveDraft = () => {
        setSavedDraft(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitAttempted(true);

        const isValid = requiredFieldKeys.every((key) => Boolean(formData[key])) && formData.declarationAccepted;
        if (!isValid) {
            setServerMessage("Please complete all required fields before submission.");
            return;
        }

        const token = globalThis.localStorage.getItem("authToken");
        if (!token) {
            setServerMessage("Please login again to submit admission details.");
            return;
        }

        setSubmitting(true);
        setServerMessage("");

        try {
            let verifiedPayment = paymentDetails;

            if (verifiedPayment?.status !== "paid") {
                setPaymentInProgress(true);
                const orderResponse = await fetch("/api/razorpay", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const orderData = await orderResponse.json();
                if (!orderResponse.ok) {
                    throw new Error(orderData.error || "Failed to create payment order");
                }

                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    throw new Error("Unable to load Razorpay checkout script");
                }

                const paymentResponse = await openRazorpayCheckout({
                    key: orderData.keyId,
                    amount: orderData.amountInPaise,
                    currency: orderData.currency,
                    name: "SNK Junior College",
                    description: `FYJC Admission Form Fee (Rs ${FORM_PRICE_INR})`,
                    order_id: orderData.order?.id,
                    prefill: {
                        name: fullName || undefined,
                        email: formData.email || undefined,
                        contact: formData.mobileNumber || undefined,
                    },
                    notes: {
                        stream: formData.selectedStream || "",
                        academicYear: currentAcademicYear,
                    },
                    theme: {
                        color: "#7a1c1c",
                    },
                });

                const verifyResponse = await fetch("/api/razorpay", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(paymentResponse),
                });

                const verifyData = await verifyResponse.json();
                if (!verifyResponse.ok) {
                    throw new Error(verifyData.error || "Payment verification failed");
                }

                verifiedPayment = verifyData.payment;
                setPaymentDetails(verifyData.payment);
            }

            const payload = {
                ...Object.fromEntries(
                    Object.entries(formData).filter(([key]) => !FILE_FIELD_KEYS.includes(key))
                ),
                academicYear: currentAcademicYear,
                status: "submitted",
                payment: verifiedPayment,
                formPrice: FORM_PRICE_INR,
            };

            const submitData = new FormData();
            submitData.append("payload", JSON.stringify(payload));

            FILE_FIELD_KEYS.forEach((key) => {
                const file = formData[key];
                if (file instanceof File) {
                    submitData.append(key, file);
                }
            });

            const response = await fetch("/api/auth/admission", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: submitData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to submit admission form");
            }

            if (data?.admission?.applicationId) {
                setApplicationId(data.admission.applicationId);
            }
            if (data?.admission?.documents) {
                setUploadedDocKeys(Object.keys(data.admission.documents));
            }

            setServerMessage("Payment successful and admission form submitted successfully.");
        } catch (error) {
            setServerMessage(error.message || "Failed to submit admission form");
        } finally {
            setPaymentInProgress(false);
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const loadMyAdmission = async () => {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) return;

            setLoadingAdmission(true);
            try {
                const response = await fetch("/api/auth/admission", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                const data = await response.json();
                if (!response.ok || !data?.admission) return;

                const payload = data.admission.payload || {};
                setFormData((prev) => mergeLoadedPayloadIntoForm(prev, payload));
                setUploadedDocKeys(Object.keys(data.admission.documents || {}));
                if (payload?.payment?.status === "paid") {
                    setPaymentDetails(payload.payment);
                }
                if (data.admission.applicationId) {
                    setApplicationId(data.admission.applicationId);
                }
            } catch {
                // Keep form usable even if load fails.
            } finally {
                setLoadingAdmission(false);
            }
        };

        loadMyAdmission();
    }, []);

    const hasError = (fieldName) => submitAttempted && !formData[fieldName];

    let submitButtonLabel = `Pay Rs ${FORM_PRICE_INR} & Submit`;
    if (paymentInProgress) {
        submitButtonLabel = `Processing Payment (Rs ${FORM_PRICE_INR})...`;
    } else if (submitting) {
        submitButtonLabel = "Submitting...";
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fdf5f5_0%,#fbf8f8_38%,#f6f3f3_100%)] px-4 py-6 md:px-6 xl:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="overflow-hidden rounded-[28px] border border-[#7a1c1c]/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                    <div className="relative px-6 py-8 md:px-8 lg:px-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,28,28,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(159,42,42,0.12),transparent_28%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#7a1c1c]/10 bg-[#7a1c1c]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a1c1c]">
                                    Online Admission Portal
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Shri Nanasaheb Kulkarni Kanishta Mahavidyalay, Borli Panchatan</p>
                                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                                        FYJC / 11th Admission Form
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                                        Complete your online admission form for the selected academic year with accurate personal,
                                        academic, document, and declaration details.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-105">
                                <InfoBadge label="Application ID" value={applicationId} icon={IdCard} />
                                <InfoBadge label="Admission Date" value={new Date().toLocaleDateString("en-GB")} icon={CalendarDays} />
                                <InfoBadge label="Academic Year" value={currentAcademicYear} icon={GraduationCap} />
                            </div>
                        </div>

                        <div className="relative mt-8 rounded-2xl border border-[#7a1c1c]/10 bg-slate-50/80 p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Application Progress</p>
                                    <p className="text-xs text-slate-500">Live progress updates as you fill fields and upload required documents.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#7a1c1c] shadow-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {progressPercent}% completed
                                </div>
                            </div>
                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#7a1c1c]/10">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-[#a12b2b] via-[#7a1c1c] to-[#5a1414] transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#7a1c1c]/10 bg-white px-6 py-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#7a1c1c]">Current Admission Section</p>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7a1c1c] text-white shadow-lg shadow-[#7a1c1c]/15">
                                    <activeSectionMeta.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{activeSectionMeta.label}</h2>
                                    <p className="text-sm text-slate-500">Switch sections from the Admission dropdown in the sidebar.</p>
                                </div>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#7a1c1c]/5 px-4 py-2 text-sm font-semibold text-[#7a1c1c]">
                            Step {sectionItems.findIndex((item) => item.id === activeSection) + 1} of {sectionItems.length}
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeSection === "student" && (
                        <SectionCard
                            id="student"
                            icon={User}
                            title="Student Personal Details"
                            subtitle="Enter complete personal identity, communication, and residential information."
                        >
                            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                                <div className="space-y-5">
                                    <UploadField label="Student Passport Size Photo" fieldName="studentPhoto" file={formData.studentPhoto} onFileChange={handleFileChange} />
                                    <UploadField label="Student Signature Upload" fieldName="studentSignature" file={formData.studentSignature} onFileChange={handleFileChange} />
                                    <div className="rounded-2xl border border-[#7a1c1c]/10 bg-[#7a1c1c]/5 p-4 text-sm text-slate-600">
                                        <p className="font-semibold text-[#7a1c1c]">Form Preview Note</p>
                                        <p className="mt-2">Your full name auto-displays below based on the entered first, middle, and last name.</p>
                                        <p className="mt-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-800">{fullName || "Full name will appear here"}</p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required hasError={hasError("firstName")} />
                                    <InputField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                                    <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required hasError={hasError("lastName")} />
                                    <DisplayField label="Full Name" value={fullName || "Auto-generated from the entered name"} />
                                    <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} required hasError={hasError("gender")} options={["Male", "Female", "Other"]} />
                                    <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} required hasError={hasError("dob")} />
                                    <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
                                    <InputField label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required hasError={hasError("aadhaarNumber")} />
                                    <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required hasError={hasError("mobileNumber")} icon={Phone} />
                                    <InputField label="Alternate Mobile Number" name="alternateMobileNumber" value={formData.alternateMobileNumber} onChange={handleChange} icon={Phone} />
                                    <InputField label="Email ID" type="email" name="email" value={formData.email} onChange={handleChange} required hasError={hasError("email")} icon={Mail} />
                                    <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} required hasError={hasError("nationality")} />
                                    <InputField label="Religion" name="religion" value={formData.religion} onChange={handleChange} required hasError={hasError("religion")} />
                                    <InputField label="Caste Category" name="casteCategory" value={formData.casteCategory} onChange={handleChange} required hasError={hasError("casteCategory")} />
                                    <InputField label="Sub Category" name="subCategory" value={formData.subCategory} onChange={handleChange} />
                                    <InputField label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required hasError={hasError("addressLine1")} icon={House} className="md:col-span-2" />
                                    <InputField label="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="md:col-span-2" />
                                    <InputField label="City / Taluka" name="cityTaluka" value={formData.cityTaluka} onChange={handleChange} required hasError={hasError("cityTaluka")} />
                                    <InputField label="District" name="district" value={formData.district} onChange={handleChange} required hasError={hasError("district")} />
                                    <InputField label="State" name="state" value={formData.state} onChange={handleChange} required hasError={hasError("state")} />
                                    <InputField label="PIN Code" name="pinCode" value={formData.pinCode} onChange={handleChange} required hasError={hasError("pinCode")} />
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "family" && (
                        <SectionCard
                            id="family"
                            icon={Users}
                            title="Family / Parent Details"
                            subtitle="Provide parent, guardian, and financial details for admission records."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <InputField label="Father’s Full Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required hasError={hasError("fatherName")} />
                                <InputField label="Father’s Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} required hasError={hasError("fatherOccupation")} />
                                <InputField label="Father’s Mobile Number" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} required hasError={hasError("fatherMobile")} icon={Phone} />
                                <InputField label="Father’s Aadhaar Number" name="fatherAadhaar" value={formData.fatherAadhaar} onChange={handleChange} />
                                <InputField label="Mother’s Full Name" name="motherName" value={formData.motherName} onChange={handleChange} required hasError={hasError("motherName")} />
                                <InputField label="Mother’s Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} required hasError={hasError("motherOccupation")} />
                                <InputField label="Mother’s Mobile Number" name="motherMobile" value={formData.motherMobile} onChange={handleChange} required hasError={hasError("motherMobile")} icon={Phone} />
                                <InputField label="Mother’s Aadhaar Number" name="motherAadhaar" value={formData.motherAadhaar} onChange={handleChange} />
                                <InputField label="Annual Family Income" name="annualFamilyIncome" value={formData.annualFamilyIncome} onChange={handleChange} required hasError={hasError("annualFamilyIncome")} />
                                <InputField label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                                <InputField label="Guardian Relation" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} />
                                <InputField label="Guardian Contact Number" name="guardianContactNumber" value={formData.guardianContactNumber} onChange={handleChange} icon={Phone} />
                                <div className="md:col-span-2">
                                    <UploadField label="Parent / Guardian Signature Upload" fieldName="parentSignature" file={formData.parentSignature} onFileChange={handleFileChange} compact />
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "academic" && (
                        <SectionCard
                            id="academic"
                            icon={GraduationCap}
                            title="10th Academic Details"
                            subtitle="Fill in the SSC / CBSE / ICSE academic record details exactly as per documents."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <SelectField label="Board Name" name="boardName" value={formData.boardName} onChange={handleChange} required hasError={hasError("boardName")} options={["SSC", "CBSE", "ICSE", "Other"]} />
                                <InputField label="School Name" name="schoolName" value={formData.schoolName} onChange={handleChange} required hasError={hasError("schoolName")} />
                                <InputField label="School UDISE Number" name="schoolUdiseNumber" value={formData.schoolUdiseNumber} onChange={handleChange} />
                                <InputField label="Seat Number / Roll Number" name="seatNumber" value={formData.seatNumber} onChange={handleChange} required hasError={hasError("seatNumber")} />
                                <InputField label="Passing Year" name="passingYear" value={formData.passingYear} onChange={handleChange} required hasError={hasError("passingYear")} />
                                <InputField label="Total Marks Obtained" name="totalMarks" value={formData.totalMarks} onChange={handleChange} required hasError={hasError("totalMarks")} />
                                <InputField label="Out Of Marks" name="outOfMarks" value={formData.outOfMarks} onChange={handleChange} required hasError={hasError("outOfMarks")} />
                                <InputField label="Percentage" name="percentage" value={formData.percentage} onChange={handleChange} required hasError={hasError("percentage")} />
                                <InputField label="Grade" name="grade" value={formData.grade} onChange={handleChange} />
                                <SelectField label="Result Status" name="resultStatus" value={formData.resultStatus} onChange={handleChange} required hasError={hasError("resultStatus")} options={["Pass", "ATKT"]} />
                                <InputField label="Medium of Study" name="mediumOfStudy" value={formData.mediumOfStudy} onChange={handleChange} required hasError={hasError("mediumOfStudy")} />
                                <InputField label="Last School Address" name="lastSchoolAddress" value={formData.lastSchoolAddress} onChange={handleChange} required hasError={hasError("lastSchoolAddress")} className="md:col-span-2" />
                                <UploadField label="Upload 10th Marksheet" fieldName="tenthMarksheet" file={formData.tenthMarksheet} onFileChange={handleFileChange} compact />
                                <UploadField label="Upload Leaving Certificate / Transfer Certificate" fieldName="leavingCertificate" file={formData.leavingCertificate} onFileChange={handleFileChange} compact />
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "stream" && (
                        <SectionCard
                            id="stream"
                            icon={BookOpen}
                            title="Stream Selection"
                            subtitle="Select your desired FYJC stream and choose the preferred optional subjects."
                        >
                            <div className="grid gap-5 lg:grid-cols-3">
                                {streamOptions.map((stream) => {
                                    const isSelected = formData.selectedStream === stream.value;

                                    return (
                                        <button
                                            key={stream.value}
                                            type="button"
                                            onClick={() => handleStreamSelect(stream.value)}
                                            className={`group rounded-2xl border p-5 text-left transition ${isSelected
                                                ? "border-[#7a1c1c] bg-[#7a1c1c]/5 shadow-lg shadow-[#7a1c1c]/10"
                                                : "border-slate-200 bg-white hover:-translate-y-1 hover:border-[#7a1c1c]/30 hover:shadow-md"
                                                }`}
                                        >
                                            <div className={`inline-flex rounded-full bg-linear-to-r px-3 py-1 text-xs font-semibold text-white ${stream.accent}`}>
                                                {stream.label}
                                            </div>
                                            <p className="mt-4 text-sm text-slate-600">Premium curriculum with subject flexibility and college guidance support.</p>
                                            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <CircleDot className={`h-4 w-4 ${isSelected ? "text-[#7a1c1c]" : "text-slate-300 group-hover:text-[#9f2a2a]"}`} />
                                                {isSelected ? "Selected for application" : "Click to select stream"}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.selectedStream && (
                                <div className="mt-8 rounded-2xl border border-[#7a1c1c]/10 bg-slate-50 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Optional Subjects</h3>
                                    <p className="mt-1 text-sm text-slate-500">Choose optional subjects for your selected stream.</p>
                                    <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {subjectOptions.map((subject) => {
                                            const checked = formData.selectedSubjects.includes(subject);
                                            return (
                                                <label
                                                    key={subject}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${checked
                                                        ? "border-[#7a1c1c] bg-[#7a1c1c]/5 text-[#7a1c1c]"
                                                        : "border-slate-200 bg-white text-slate-700 hover:border-[#7a1c1c]/30"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleSubject(subject)}
                                                        className="h-4 w-4 rounded border-slate-300 text-[#7a1c1c] focus:ring-[#7a1c1c]"
                                                    />
                                                    <span className="text-sm font-medium">{subject}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                <SelectField label="Medium Selection" name="mediumSelection" value={formData.mediumSelection} onChange={handleChange} required hasError={hasError("mediumSelection")} options={["English", "Marathi"]} />
                                <SelectField label="Transport Required?" name="transportRequired" value={formData.transportRequired} onChange={handleChange} required hasError={hasError("transportRequired")} options={["Yes", "No"]} />
                                <SelectField label="Hostel Required?" name="hostelRequired" value={formData.hostelRequired} onChange={handleChange} required hasError={hasError("hostelRequired")} options={["Yes", "No"]} />
                                <SelectField label="Scholarship Applicable?" name="scholarshipApplicable" value={formData.scholarshipApplicable} onChange={handleChange} required hasError={hasError("scholarshipApplicable")} options={["Yes", "No"]} />
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "documents" && (
                        <SectionCard
                            id="documents"
                            icon={FileText}
                            title="Document Upload Section"
                            subtitle="Upload all required supporting documents in JPG, PNG, or PDF format up to 2MB each."
                        >
                            <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-700">
                                <p className="font-semibold">Upload Guidelines</p>
                                <p className="mt-1">Allowed file types: JPG, PNG, PDF. Maximum size: 2MB. Student photo, signatures, marksheet, and leaving certificate are already uploaded once in previous sections.</p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                <UploadField label="Aadhaar Card" fieldName="documentAadhaarCard" file={formData.documentAadhaarCard} onFileChange={handleFileChange} compact />
                                <UploadField label="Birth Certificate" fieldName="documentBirthCertificate" file={formData.documentBirthCertificate} onFileChange={handleFileChange} compact />
                                <UploadField label="Caste Certificate" fieldName="documentCasteCertificate" file={formData.documentCasteCertificate} onFileChange={handleFileChange} compact />
                                <UploadField label="Income Certificate" fieldName="documentIncomeCertificate" file={formData.documentIncomeCertificate} onFileChange={handleFileChange} compact />
                                <UploadField label="Domicile Certificate" fieldName="documentDomicileCertificate" file={formData.documentDomicileCertificate} onFileChange={handleFileChange} compact />
                                <UploadField label="Parent Aadhaar Card" fieldName="documentParentAadhaarCard" file={formData.documentParentAadhaarCard} onFileChange={handleFileChange} compact />
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "payment" && (
                        <SectionCard
                            id="payment"
                            icon={IndianRupee}
                            title="Admission Payment"
                            subtitle="Review the form fee and complete payment to enable final submission."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="rounded-2xl border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a1c1c]">Form Fee</p>
                                    <p className="mt-3 text-3xl font-black text-slate-900">Rs {FORM_PRICE_INR}</p>
                                    <p className="mt-2 text-sm text-slate-600">One-time admission processing payment via Razorpay.</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-semibold text-slate-800">Payment Status</p>
                                    <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentDetails?.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                        {paymentDetails?.status === "paid" ? "Paid" : "Pending"}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-600">
                                        {paymentDetails?.status === "paid"
                                            ? `Payment ID: ${paymentDetails.razorpayPaymentId}`
                                            : "Click the Pay & Submit button below to open Razorpay checkout."}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "declaration" && (
                        <SectionCard
                            id="declaration"
                            icon={ShieldCheck}
                            title="Declaration Section"
                            subtitle="Review and confirm the declaration before submitting the application."
                        >
                            <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <div className={`rounded-2xl border px-5 py-4 transition ${submitAttempted && !formData.declarationAccepted ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"}`}>
                                    <div className="flex items-start gap-4">
                                        <input
                                            id="declarationAccepted"
                                            type="checkbox"
                                            name="declarationAccepted"
                                            checked={formData.declarationAccepted}
                                            onChange={handleChange}
                                            className="mt-1 h-5 w-5 rounded border-slate-300 text-[#7a1c1c] focus:ring-[#7a1c1c]"
                                        />
                                        <label htmlFor="declarationAccepted" className="cursor-pointer">
                                            <p className="font-semibold text-slate-800">Declaration</p>
                                            <p className="mt-1 text-sm leading-7 text-slate-600">
                                                I hereby declare that all the information provided by me is true and correct to the best of my knowledge.
                                                I agree to follow the rules and regulations of the college.
                                            </p>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InputField label="Place" name="place" value={formData.place} onChange={handleChange} required hasError={hasError("place")} />
                                    <InputField label="Date" type="date" name="declarationDate" value={formData.declarationDate} onChange={handleChange} required hasError={hasError("declarationDate")} />
                                    <InputField label="Student Name" name="declarationStudentName" value={formData.declarationStudentName} onChange={handleChange} required hasError={hasError("declarationStudentName")} />
                                    <InputField label="Parent Name" name="declarationParentName" value={formData.declarationParentName} onChange={handleChange} required hasError={hasError("declarationParentName")} />
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === "extras" && (
                        <SectionCard
                            id="extras"
                            icon={BadgeCheck}
                            title="Extra Professional Fields"
                            subtitle="Complete the final institutional information required for admission processing."
                        >
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                <DisplayField label="Application ID" value={applicationId} />
                                <DisplayField label="Admission Date" value={new Date().toLocaleDateString("en-GB")} />
                                <DisplayField label="Academic Year" value="2026-27" />
                                <InputField label="Reservation Category" name="reservationCategory" value={formData.reservationCategory} onChange={handleChange} required hasError={hasError("reservationCategory")} />
                                <SelectField label="Minority Status" name="minorityStatus" value={formData.minorityStatus} onChange={handleChange} required hasError={hasError("minorityStatus")} options={["Yes", "No"]} />
                                <SelectField label="Disability / Special Needs" name="disabilityStatus" value={formData.disabilityStatus} onChange={handleChange} required hasError={hasError("disabilityStatus")} options={["Yes", "No"]} />
                                <InputField label="Emergency Contact Number" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required hasError={hasError("emergencyContactNumber")} icon={HeartPulse} />
                            </div>
                        </SectionCard>
                    )}

                    <div className="sticky bottom-4 z-20 rounded-2xl border border-[#7a1c1c]/10 bg-white/95 p-4 shadow-[0_18px_50px_rgba(122,28,28,0.12)] backdrop-blur">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Ready to continue?</p>
                                <p className="text-xs text-slate-500">Form fee: Rs {FORM_PRICE_INR}. You can save draft or pay and submit after reviewing all sections.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#7a1c1c]/30 hover:text-[#7a1c1c]"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || paymentInProgress}
                                    className="rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7a1c1c]/20 transition hover:brightness-110"
                                >
                                    {submitButtonLabel}
                                </button>
                            </div>
                        </div>
                        {submitAttempted && (
                            <p className={`mt-3 text-sm ${requiredFieldKeys.every((key) => formData[key]) && formData.declarationAccepted ? "text-emerald-600" : "text-rose-600"}`}>
                                {requiredFieldKeys.every((key) => formData[key]) && formData.declarationAccepted
                                    ? "Frontend validation preview complete. The form UI is ready for integration with backend submission."
                                    : "Please complete all required fields and accept the declaration before final submission."}
                            </p>
                        )}
                        {savedDraft && !submitAttempted && (
                            <p className="mt-3 text-sm text-[#7a1c1c]">Draft saved locally in the UI preview state for this session.</p>
                        )}
                        {loadingAdmission && (
                            <p className="mt-3 text-sm text-slate-600">Loading your previous admission details...</p>
                        )}
                        {serverMessage && (
                            <p className="mt-3 text-sm text-slate-700">{serverMessage}</p>
                        )}
                        {paymentDetails?.status === "paid" && (
                            <p className="mt-2 text-xs text-emerald-700">
                                Payment completed: Rs {paymentDetails.amount} (Payment ID: {paymentDetails.razorpayPaymentId})
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

function SectionCard({ id, icon: IconComponent, title, subtitle, children }) {
    return (
        <section id={id} className="overflow-hidden rounded-[28px] border border-[#7a1c1c]/10 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-linear-to-r from-white to-[#7a1c1c]/5 px-6 py-5 md:px-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7a1c1c] text-white shadow-lg shadow-[#7a1c1c]/15">
                        <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                    </div>
                </div>
            </div>
            <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
        </section>
    );
}

function InfoBadge({ label, value, icon: IconComponent }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <IconComponent className="h-4 w-4 text-[#7a1c1c]" />
                {label}
            </div>
            <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
        </div>
    );
}

function FieldShell({ label, required, className = "", children }) {
    return (
        <div className={className}>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function InputField({ label, required = false, hasError = false, className = "", icon: IconComponent, ...props }) {
    return (
        <FieldShell label={label} required={required} className={className}>
            <div className="relative">
                {IconComponent && <IconComponent className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
                <input {...props} className={`${inputClass(hasError)} ${IconComponent ? "pl-11" : ""}`} />
            </div>
            {hasError && <p className="mt-2 text-xs font-medium text-rose-500">This field is required.</p>}
        </FieldShell>
    );
}

function SelectField({ label, required = false, hasError = false, options = [], className = "", ...props }) {
    return (
        <FieldShell label={label} required={required} className={className}>
            <select {...props} className={inputClass(hasError)}>
                <option value="">Select an option</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            {hasError && <p className="mt-2 text-xs font-medium text-rose-500">Please select an option.</p>}
        </FieldShell>
    );
}

function DisplayField({ label, value }) {
    return (
        <div>
            <p className="mb-2 block text-sm font-semibold text-slate-700">{label}</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {value}
            </div>
        </div>
    );
}

function UploadField({ label, fieldName, file, onFileChange, compact = false }) {
    return (
        <div>
            <p className="mb-2 block text-sm font-semibold text-slate-700">{label}</p>
            <label className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#7a1c1c]/20 bg-linear-to-br from-[#7a1c1c]/5 to-white text-center transition hover:border-[#7a1c1c]/45 hover:shadow-md ${compact ? "min-h-40 p-5" : "min-h-52 p-6"}`}>
                <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) => onFileChange(fieldName, event.target.files?.[0] || null)}
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7a1c1c] text-white shadow-lg shadow-[#7a1c1c]/15">
                    <Upload className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">Upload file</p>
                <p className="mt-1 text-xs text-slate-500">Drag and drop or click to browse</p>
                <p className="mt-3 text-xs text-slate-400">JPG, PNG, PDF up to 2MB</p>
                {file && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <FileBadge className="h-3.5 w-3.5" />
                        {file.name}
                    </div>
                )}
            </label>
        </div>
    );
}
