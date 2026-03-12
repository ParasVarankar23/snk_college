"use client";

import { Trash2, UserRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const streamLabelMap = {
    science: "Science Department",
    commerce: "Commerce Department",
    arts: "Arts Department",
    other: "Other / Not Selected",
};

const PAGE_SIZE = 10;

const OFFLINE_DOCUMENT_FIELDS = [
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

const DOCUMENT_TEXT_MATCHERS = {
    studentPhoto: ["student photo", "passport size photo", "passport photo"],
    studentSignature: ["student signature"],
    parentSignature: ["parent signature", "parent / guardian signature", "guardian signature"],
    tenthMarksheet: ["10th marksheet", "tenth marksheet", "ssc marksheet"],
    leavingCertificate: ["leaving certificate", "transfer certificate"],
    documentAadhaarCard: ["aadhaar card", "aadhar card"],
    documentBirthCertificate: ["birth certificate"],
    documentCasteCertificate: ["caste certificate"],
    documentIncomeCertificate: ["income certificate"],
    documentDomicileCertificate: ["domicile certificate"],
    documentParentAadhaarCard: ["parent aadhaar card", "parent aadhar card"],
};

const initialOfflineFormState = {
    studentName: "",
    email: "",
    mobileNumber: "",
    selectedStream: "science",
    percentage: "",
    status: "verified-offline",
    paymentStatus: "paid",
    paymentAmount: "200",
    notes: "",
};

const initialEditFormState = {
    id: "",
    studentName: "",
    email: "",
    mobileNumber: "",
    selectedStream: "science",
    percentage: "",
    status: "submitted",
    paymentStatus: "pending",
    paymentAmount: "",
    notes: "",
};

const PDFJS_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs";
const PDFJS_WORKER_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";
let pdfJsModulePromise = null;

const PDF_EXTRACT_FIELDS = {
    fullName: ["full name", "student name", "name of student", "candidate name"],
    gender: ["gender"],
    dob: ["date of birth", "dob"],
    bloodGroup: ["blood group"],
    aadhaar: ["aadhaar number", "aadhar number"],
    mobileNumber: ["mobile number", "student mobile", "contact number"],
    alternateMobile: ["alternate mobile", "alternate mobile number"],
    email: ["email id", "email"],
    nationality: ["nationality"],
    religion: ["religion"],
    casteCategory: ["caste category"],
    subCategory: ["sub category"],
    addressLine1: ["address line 1"],
    addressLine2: ["address line 2"],
    cityTaluka: ["city / taluka", "city taluka"],
    district: ["district"],
    state: ["state"],
    pinCode: ["pin code", "pincode"],
    fatherName: ["father's full name", "father full name", "father name"],
    motherName: ["mother's full name", "mother full name", "mother name"],
    annualFamilyIncome: ["annual family income", "family income"],
    boardName: ["board name"],
    schoolName: ["school name"],
    seatNumber: ["seat / roll number", "seat number", "roll number"],
    passingYear: ["passing year"],
    totalMarks: ["total marks obtained", "total marks"],
    outOfMarks: ["out of marks"],
    percentage: ["percentage", "10th percentage"],
    grade: ["grade"],
    resultStatus: ["result status"],
    mediumOfStudy: ["medium of study"],
    lastSchoolAddress: ["last school address"],
    selectedStream: ["selected stream", "stream"],
    paymentMode: ["payment mode"],
    paymentStatus: ["payment status"],
    paymentAmount: ["amount paid", "payment amount", "fee amount", "form fee"],
};

const EXTRACTED_DETAIL_LABELS = {
    fullName: "Full Name",
    gender: "Gender",
    dob: "Date of Birth",
    bloodGroup: "Blood Group",
    aadhaar: "Aadhaar Number",
    mobileNumber: "Mobile Number",
    alternateMobile: "Alternate Mobile",
    email: "Email",
    nationality: "Nationality",
    religion: "Religion",
    casteCategory: "Caste Category",
    subCategory: "Sub Category",
    addressLine1: "Address Line 1",
    addressLine2: "Address Line 2",
    cityTaluka: "City/Taluka",
    district: "District",
    state: "State",
    pinCode: "Pin Code",
    fatherName: "Father Name",
    motherName: "Mother Name",
    annualFamilyIncome: "Annual Family Income",
    boardName: "Board Name",
    schoolName: "School Name",
    seatNumber: "Seat/Roll Number",
    passingYear: "Passing Year",
    totalMarks: "Total Marks",
    outOfMarks: "Out Of Marks",
    percentage: "Percentage",
    grade: "Grade",
    resultStatus: "Result Status",
    mediumOfStudy: "Medium Of Study",
    lastSchoolAddress: "Last School Address",
    selectedStream: "Selected Stream",
    paymentMode: "Payment Mode",
    paymentStatus: "Payment Status",
    paymentAmount: "Payment Amount",
};

const EXTRACTION_STOP_MARKERS = [
    "FATHER'S OCCUPATION",
    "FATHER'S MOBILE",
    "FATHER'S AADHAAR",
    "MOTHER'S OCCUPATION",
    "MOTHER'S MOBILE",
    "MOTHER'S AADHAAR",
    "GUARDIAN NAME",
    "GUARDIAN RELATION",
    "GUARDIAN CONTACT",
    "10TH ACADEMIC DETAILS",
    "STUDENT PERSONAL DETAILS",
    "PARENT / FAMILY DETAILS",
    "STREAM SELECTION DETAILS",
    "EXTRA INSTITUTIONAL DETAILS",
    "PAYMENT DETAILS",
    "BOARD NAME",
    "SCHOOL NAME",
    "SCHOOL UDISE NO.",
    "SCHOOL UDISE NO",
    "SCHOOL UDISE NUMBER",
    "UDISE NO.",
    "UDISE NUMBER",
    "RESULT STATUS",
    "MEDIUM OF STUDY",
    "LAST SCHOOL ADDRESS",
    "PAYMENT MODE",
    "PAYMENT STATUS",
    "AMOUNT PAID",
    "RECEIPT NUMBER",
];

async function loadPdfJsModule() {
    if (pdfJsModulePromise) {
        return pdfJsModulePromise;
    }

    pdfJsModulePromise = import(/* webpackIgnore: true */ PDFJS_CDN_URL)
        .then((module) => {
            const lib = module?.default || module;
            if (!lib?.getDocument || !lib?.GlobalWorkerOptions) {
                throw new Error("Unable to initialize PDF parser");
            }

            lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN_URL;
            return lib;
        });

    return pdfJsModulePromise;
}

async function extractTextFromPdfFile(file) {
    const pdfjs = await loadPdfJsModule();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => String(item.str || "")).join(" ");
        pages.push(pageText);
    }

    return pages.join("\n");
}

function detectStreamFromText(text) {
    const normalized = String(text || "").toLowerCase();
    if (normalized.includes("commerce")) return "commerce";
    if (normalized.includes("arts")) return "arts";
    if (normalized.includes("science")) return "science";
    return "";
}

function extractFieldByPattern(text, patterns = []) {
    for (const pattern of patterns) {
        const match = pattern.exec(text);
        const value = String(match?.[1] || "").trim();
        if (value) return value;
    }
    return "";
}

function escapeRegex(value) {
    return String(value || "").replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function buildAllLabelPattern() {
    const labels = Object.values(PDF_EXTRACT_FIELDS)
        .flat()
        .map((label) => escapeRegex(label))
        .sort((a, b) => b.length - a.length);

    return labels.join("|");
}

function extractLabeledField(text, variants, allLabelPattern) {
    for (const variant of variants) {
        const labelPattern = escapeRegex(variant);
        const regex = new RegExp(
            String.raw`${labelPattern}\s*[:-]?\s*([^:]{1,140}?)(?=\s+(?:${allLabelPattern})\b|$)`,
            "i"
        );
        const match = regex.exec(text);
        const value = String(match?.[1] || "")
            .replaceAll(/\s+/g, " ")
            .trim();

        if (value) {
            return value;
        }
    }

    return "";
}

function sanitizeExtractedStudentName(rawValue) {
    const text = String(rawValue || "").trim();
    if (!text) return "";

    const withoutTailLabels = text
        .split(/\b(parent|father|mother|signature|mobile|contact|email|address|stream|department|payment|status|student)\b/i)[0]
        .trim();

    const lettersOnly = withoutTailLabels
        .replaceAll(/[^A-Za-z.\s]/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();

    const words = lettersOnly
        .split(" ")
        .map((word) => word.trim())
        .filter(Boolean)
        .slice(0, 4);

    return words.join(" ");
}

function sanitizeExtractedValue(rawValue) {
    const text = String(rawValue || "")
        .replaceAll(/\s+/g, " ")
        .trim();

    if (!text) return "";

    const upper = text.toUpperCase();
    let cutIndex = upper.length;

    for (const marker of EXTRACTION_STOP_MARKERS) {
        const idx = upper.indexOf(marker);
        if (idx > 0 && idx < cutIndex) {
            cutIndex = idx;
        }
    }

    return text.slice(0, cutIndex).replaceAll(/\s+/g, " ").trim();
}

function parseOfflinePdfDetails(text) {
    const compactText = String(text || "").replaceAll(/\s+/g, " ");
    const allLabelPattern = buildAllLabelPattern();
    const normalizedUpper = compactText.toUpperCase();

    const extracted = {};
    Object.entries(PDF_EXTRACT_FIELDS).forEach(([key, variants]) => {
        extracted[key] = sanitizeExtractedValue(extractLabeledField(compactText, variants, allLabelPattern));
    });

    const email = extracted.email || extractFieldByPattern(compactText, [
        /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
    ]);

    const mobileRaw = extracted.mobileNumber || extractFieldByPattern(compactText, [
        /(?:mobile|phone|contact)\s*(?:number|no\.?)*\s*[:-]?\s*((?:\+91[-\s]?)?[6-9]\d{9})/i,
        /((?:\+91[-\s]?)?[6-9]\d{9})/i,
    ]);
    const mobileNumber = mobileRaw.replaceAll(/[^\d]/g, "").slice(-10);

    const studentNameRaw = extracted.fullName || extractFieldByPattern(compactText, [
        /(?:student\s*name|name\s*of\s*student|candidate\s*name)\s*[:-]?\s*([a-z][a-z .]{2,80})/i,
    ]);
    const studentName = sanitizeExtractedStudentName(studentNameRaw);

    const percentage = extracted.percentage || extractFieldByPattern(compactText, [
        /(?:percentage|percent|%\s*marks)\s*[:-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i,
        /(\d{1,2}(?:\.\d{1,2})?)\s*%/i,
    ]);

    const paymentAmount = extracted.paymentAmount || extractFieldByPattern(compactText, [
        /(?:amount|fee)\s*[:-]?\s*(\d{2,6}(?:\.\d{1,2})?)/i,
        /(?:inr|rs\.?)[\s:]+(\d{2,6}(?:\.\d{1,2})?)/i,
    ]);

    const normalized = compactText.toLowerCase();
    let paymentStatus = String(extracted.paymentStatus || "").toLowerCase();
    if (!paymentStatus) {
        paymentStatus = "pending";
    }
    if (/payment\s*status\s*[:-]?\s*paid|status\s*[:-]?\s*paid|\bpaid\b/i.test(normalized)) {
        paymentStatus = "paid";
    }
    if (/unpaid|pending|not\s+paid|due/i.test(normalized)) {
        paymentStatus = "pending";
    }

    const selectedStream = detectStreamFromText(extracted.selectedStream || compactText);

    const extractedDetails = {
        fullName: studentName,
        gender: extracted.gender,
        dob: extracted.dob,
        bloodGroup: extracted.bloodGroup,
        aadhaar: extracted.aadhaar,
        mobileNumber,
        alternateMobile: extracted.alternateMobile,
        email,
        nationality: extracted.nationality,
        religion: extracted.religion,
        casteCategory: extracted.casteCategory,
        subCategory: extracted.subCategory,
        addressLine1: extracted.addressLine1,
        addressLine2: extracted.addressLine2,
        cityTaluka: extracted.cityTaluka,
        district: extracted.district,
        state: extracted.state,
        pinCode: extracted.pinCode,
        fatherName: extracted.fatherName,
        motherName: extracted.motherName,
        annualFamilyIncome: extracted.annualFamilyIncome,
        boardName: extracted.boardName,
        schoolName: extracted.schoolName,
        seatNumber: extracted.seatNumber,
        passingYear: extracted.passingYear,
        totalMarks: extracted.totalMarks,
        outOfMarks: extracted.outOfMarks,
        percentage,
        grade: extracted.grade,
        resultStatus: extracted.resultStatus,
        mediumOfStudy: extracted.mediumOfStudy,
        lastSchoolAddress: extracted.lastSchoolAddress,
        selectedStream,
        paymentMode: extracted.paymentMode || "offline",
        paymentStatus,
        paymentAmount,
    };

    const detectedDocumentKeys = OFFLINE_DOCUMENT_FIELDS
        .filter((item) => {
            const patterns = DOCUMENT_TEXT_MATCHERS[item.key] || [];
            return patterns.some((pattern) => normalizedUpper.includes(String(pattern).toUpperCase()));
        })
        .map((item) => item.key);

    return {
        studentName,
        email,
        mobileNumber,
        percentage,
        selectedStream,
        paymentStatus,
        paymentAmount,
        extractedDetails,
        detectedDocumentKeys,
    };
}

function resolveStream(admission) {
    return String(admission?.selectedStream || admission?.payload?.selectedStream || "")
        .trim()
        .toLowerCase();
}

function prettyValue(value) {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) return value.join(", ") || "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
        const pairs = Object.entries(value)
            .filter(([, item]) => item !== null && item !== undefined && item !== "")
            .map(([key, item]) => `${key}: ${String(item)}`);
        return pairs.length ? pairs.join(" | ") : "-";
    }
    return String(value);
}

function formatPaymentDetailValue(paymentValue) {
    if (!paymentValue || typeof paymentValue !== "object") return "-";

    const amount = parseAmount(paymentValue.amount || 0);
    if (amount <= 0) return "-";
    return Number.isInteger(amount) ? String(amount) : String(amount.toFixed(2));
}

function resolveDocumentUrl(doc) {
    const baseUrl = String(doc?.url || "").trim();
    if (!baseUrl) return "#";

    const mimeType = String(doc?.mimeType || "").toLowerCase();
    if (mimeType !== "application/pdf") return baseUrl;

    const resourceType = String(doc?.resourceType || "").toLowerCase();

    if (resourceType === "raw") {
        let url = baseUrl;
        if (url.includes("/image/upload/")) {
            url = url.replace("/image/upload/", "/raw/upload/");
        }
        if (!url.includes("/upload/fl_attachment/")) {
            url = url.replace("/upload/", "/upload/fl_attachment/");
        }
        return url;
    }

    return baseUrl;
}

function parsePercentage(value) {
    const numeric = Number.parseFloat(String(value || "").replaceAll(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : -1;
}

function parseAmount(value) {
    const numeric = Number.parseFloat(String(value || "").replaceAll(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
}

function formatINR(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function resolvePayment(admission) {
    if (admission?.payload?.payment && typeof admission.payload.payment === "object") {
        return admission.payload.payment;
    }
    return null;
}

function AdminAdmissionsInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentYear = new Date().getFullYear();
    const yearOptions = [
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
        `${currentYear + 1}-${currentYear + 2}`,
    ];

    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState("");
    const [selectedYear, setSelectedYear] = useState(`${currentYear}-${currentYear + 1}`);
    const [selectedDepartmentTab, setSelectedDepartmentTab] = useState("science");
    const [meritThresholds, setMeritThresholds] = useState({
        merit1Min: "",
        merit2Min: "",
        merit3Min: "",
    });
    const [meritLimits, setMeritLimits] = useState({
        merit1Limit: "",
        merit2Limit: "",
        merit3Limit: "",
    });
    const [pageByDepartment, setPageByDepartment] = useState({
        science: 1,
        commerce: 1,
        arts: 1,
        other: 1,
    });
    const [selectedPaymentDepartmentTab, setSelectedPaymentDepartmentTab] = useState("all");
    const [offlineSubmitting, setOfflineSubmitting] = useState(false);
    const [extractingPdf, setExtractingPdf] = useState(false);
    const [offlineForm, setOfflineForm] = useState(initialOfflineFormState);
    const [offlineFiles, setOfflineFiles] = useState({ offlineFormPdf: null });
    const [extractedDetails, setExtractedDetails] = useState({});
    const [detectedDocumentKeys, setDetectedDocumentKeys] = useState([]);
    const [editingAdmissionId, setEditingAdmissionId] = useState("");
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editForm, setEditForm] = useState(initialEditFormState);

    const selectedView = searchParams.get("view") === "payments" ? "payments" : "admissions";
    const offlineSourceMode = searchParams.get("source") === "offline";

    const departmentTabs = [
        { id: "science", label: "Science" },
        { id: "commerce", label: "Commerce" },
        { id: "arts", label: "Arts" },
        { id: "other", label: "Others" },
    ];

    const paymentDepartmentTabs = [
        { id: "all", label: "All" },
        { id: "science", label: "Science" },
        { id: "commerce", label: "Commerce" },
        { id: "arts", label: "Arts" },
    ];

    const grouped = useMemo(() => {
        const base = {
            science: [],
            commerce: [],
            arts: [],
            other: [],
        };

        admissions.forEach((admission) => {
            const stream = resolveStream(admission);
            if (base[stream]) {
                base[stream].push(admission);
            } else {
                base.other.push(admission);
            }
        });

        return base;
    }, [admissions]);

    const paymentMetrics = useMemo(() => {
        const rows = admissions
            .map((admission) => {
                const payload = admission.payload || {};
                const payment = resolvePayment(admission);
                const stream = resolveStream(admission);
                const studentName =
                    payload.declarationStudentName ||
                    [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ") ||
                    "Student";

                const isPaid = payment?.status === "paid";
                const amount = isPaid
                    ? parseAmount(payment?.amount || payload.formPrice || 0)
                    : parseAmount(payload.formPrice || 0);
                const paymentMode = String(payment?.mode || (admission?.source === "offline" ? "offline" : "online"))
                    .trim()
                    .toLowerCase();

                return {
                    id: admission.id,
                    applicationId: admission.applicationId || "-",
                    studentName,
                    email: payload.email || "-",
                    mobile: payload.mobileNumber || "-",
                    department: stream,
                    amount,
                    isPaid,
                    paymentMode,
                    paymentId: payment?.razorpayPaymentId || "-",
                    paidAt: payment?.paidAt || admission.updatedAt || "",
                };
            })
            .sort((a, b) => String(b.paidAt || "").localeCompare(String(a.paidAt || "")));

        const paidRows = rows.filter((row) => row.isPaid);

        const revenueByDepartment = {
            science: 0,
            commerce: 0,
            arts: 0,
        };

        paidRows.forEach((row) => {
            if (row.department === "science") revenueByDepartment.science += row.amount;
            if (row.department === "commerce") revenueByDepartment.commerce += row.amount;
            if (row.department === "arts") revenueByDepartment.arts += row.amount;
        });

        const totalRevenue = paidRows.reduce((sum, row) => sum + row.amount, 0);
        const offlineRevenue = paidRows
            .filter((row) => row.paymentMode === "offline")
            .reduce((sum, row) => sum + row.amount, 0);
        const onlineRevenue = paidRows
            .filter((row) => row.paymentMode !== "offline")
            .reduce((sum, row) => sum + row.amount, 0);

        return {
            rows,
            totalRevenue,
            onlineRevenue,
            offlineRevenue,
            paidCount: paidRows.length,
            pendingCount: Math.max(0, rows.length - paidRows.length),
            revenueByDepartment,
        };
    }, [admissions]);

    const meritByDepartment = useMemo(() => {
        const normalizeRows = (rows) =>
            rows
                .map((admission) => {
                    const payload = admission.payload || {};
                    const percentage = parsePercentage(payload.percentage);
                    const studentName =
                        payload.declarationStudentName ||
                        [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ") ||
                        "Student";

                    return {
                        id: admission.id,
                        applicationId: admission.applicationId || "-",
                        studentName,
                        percentage,
                        percentageText: payload.percentage || "-",
                        department: String(admission.selectedStream || payload.selectedStream || "").toUpperCase(),
                    };
                })
                .filter((item) => item.percentage >= 0)
                .sort((a, b) => b.percentage - a.percentage);

        const createBuckets = (rows) => {
            const merit1 = [];
            const merit2 = [];
            const merit3 = [];

            const m1Min = meritThresholds.merit1Min === "" ? 0 : Number(meritThresholds.merit1Min);
            const m2Min = meritThresholds.merit2Min === "" ? 0 : Number(meritThresholds.merit2Min);
            const m3Min = meritThresholds.merit3Min === "" ? 0 : Number(meritThresholds.merit3Min);

            rows.forEach((item) => {
                if (item.percentage >= m1Min) {
                    merit1.push(item);
                    return;
                }

                if (item.percentage >= m2Min && item.percentage < m1Min) {
                    merit2.push(item);
                    return;
                }

                if (item.percentage >= m3Min && item.percentage < m2Min) {
                    merit3.push(item);
                }
            });

            return { merit1, merit2, merit3 };
        };

        const scienceRows = normalizeRows(grouped.science || []);
        const commerceRows = normalizeRows(grouped.commerce || []);
        const artsRows = normalizeRows(grouped.arts || []);
        const otherRows = normalizeRows(grouped.other || []);

        return {
            science: createBuckets(scienceRows),
            commerce: createBuckets(commerceRows),
            arts: createBuckets(artsRows),
            other: createBuckets(otherRows),
            all: createBuckets(normalizeRows(admissions)),
        };
    }, [admissions, grouped, meritThresholds]);

    const activeMeritBuckets = meritByDepartment[selectedDepartmentTab] || {
        merit1: [],
        merit2: [],
        merit3: [],
    };

    const handleThresholdChange = (key, value) => {
        const trimmed = String(value).trim();
        if (trimmed === "") {
            setMeritThresholds((prev) => ({ ...prev, [key]: "" }));
            return;
        }
        const numeric = Number(trimmed);
        if (Number.isFinite(numeric) && numeric >= 0) {
            setMeritThresholds((prev) => ({ ...prev, [key]: numeric }));
        }
    };

    const handleMeritLimitChange = (key, value) => {
        const trimmed = String(value || "").trim();
        if (trimmed === "") {
            setMeritLimits((prev) => ({ ...prev, [key]: "" }));
            return;
        }
        const numeric = Number.parseInt(trimmed, 10);
        if (Number.isFinite(numeric) && numeric > 0) {
            setMeritLimits((prev) => ({ ...prev, [key]: numeric }));
        }
    };

    const clearMeritSettings = () => {
        setMeritThresholds({ merit1Min: "", merit2Min: "", merit3Min: "" });
        setMeritLimits({ merit1Limit: "", merit2Limit: "", merit3Limit: "" });
    };

    const buildMeritDocHtml = () => {
        const collegeName = "Shri Nanasaheb Kulkarni Junior College, Borli Panchatan";
        const deptLabel = streamLabelMap[selectedDepartmentTab] || selectedDepartmentTab;
        const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

        const applyLimit = (rows, limitVal) => {
            if (limitVal === "") return { kept: rows, overflow: [] };
            const n = Number(limitVal);
            if (!Number.isFinite(n) || n <= 0) return { kept: rows, overflow: [] };
            return { kept: rows.slice(0, n), overflow: rows.slice(n) };
        };

        const m2Upper = meritThresholds.merit1Min === "" ? "—" : `${meritThresholds.merit1Min}%`;
        const m3Upper = meritThresholds.merit2Min === "" ? "—" : `${meritThresholds.merit2Min}%`;

        // Apply limit to merit1; overflow students cascade into merit2
        const m1Result = applyLimit(activeMeritBuckets.merit1, meritLimits.merit1Limit);
        const merit2WithOverflow = [...m1Result.overflow, ...activeMeritBuckets.merit2];

        // Apply limit to merged merit2; overflow students cascade into merit3
        const m2Result = applyLimit(merit2WithOverflow, meritLimits.merit2Limit);
        const merit3WithOverflow = [...m2Result.overflow, ...activeMeritBuckets.merit3];

        const m3Result = applyLimit(merit3WithOverflow, meritLimits.merit3Limit);

        const buckets = [
            {
                title: "Merit 1",
                number: "1",
                minLabel: meritThresholds.merit1Min === "" ? "No minimum criteria" : `${meritThresholds.merit1Min}% and above`,
                rows: m1Result.kept,
            },
            {
                title: "Merit 2",
                number: "2",
                minLabel: meritThresholds.merit2Min === "" ? "No minimum criteria" : `${meritThresholds.merit2Min}% – ${m2Upper}`,
                rows: m2Result.kept,
            },
            {
                title: "Merit 3",
                number: "3",
                minLabel: meritThresholds.merit3Min === "" ? "No minimum criteria" : `${meritThresholds.merit3Min}% – ${m3Upper}`,
                rows: m3Result.kept,
            },
        ];

        const tableRows = (rows) =>
            rows.length === 0
                ? `<tr><td colspan="4" style="text-align:center;color:#888;padding:20px;font-style:italic;">No students in this merit list.</td></tr>`
                : rows
                    .map(
                        (row, idx) =>
                            `<tr style="background:${idx % 2 === 0 ? "#ffffff" : "#fdf5f5"}">
                                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${idx + 1}</td>
                                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${row.studentName}</td>
                                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#7a1c1c;font-family:monospace;">${row.applicationId}</td>
                                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:600;">${row.percentageText}%</td>
                            </tr>`,
                    )
                    .join("");

        const pageHeader = (bucket) => `
            <div style="text-align:center;padding-bottom:12px;border-bottom:3px double #7a1c1c;margin-bottom:18px;">
                <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7a1c1c;font-weight:700;margin-bottom:6px;">Shri Nanasaheb Kulkarni Junior College</div>
                <div style="font-size:19px;font-weight:800;color:#7a1c1c;">${collegeName}</div>
                <div style="font-size:13px;color:#444;margin-top:5px;font-weight:600;">${deptLabel}</div>
                <div style="font-size:12px;color:#666;margin-top:2px;">Academic Year: <strong>${selectedYear}</strong></div>
            </div>
            <div style="text-align:center;margin:10px 0 14px 0;">
                <div style="display:inline-block;border:2px solid #7a1c1c;padding:6px 32px;border-radius:4px;">
                    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7a1c1c;">Merit List</div>
                    <div style="font-size:22px;font-weight:800;color:#7a1c1c;line-height:1.1;">MERIT ${bucket.number}</div>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#666;margin-bottom:10px;padding:6px 0;border-top:1px solid #f0e0e0;border-bottom:1px solid #f0e0e0;">
                <span>Criteria: <strong>${bucket.minLabel}</strong></span>
                <span>Total Students: <strong>${bucket.rows.length}</strong></span>
                <span>Date: <strong>${dateStr}</strong></span>
            </div>`;

        const sectionsHtml = buckets
            .map(
                (bucket, idx) => `
                    <div style="${idx > 0 ? "page-break-before:always;padding-top:20px;" : ""}">
                        ${pageHeader(bucket)}
                        <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:Arial,sans-serif;">
                            <thead>
                                <tr style="background:#7a1c1c;color:white;">
                                    <th style="padding:10px 12px;text-align:center;width:55px;">Sr.No</th>
                                    <th style="padding:10px 12px;text-align:left;">Student Name</th>
                                    <th style="padding:10px 12px;text-align:left;">Application ID</th>
                                    <th style="padding:10px 12px;text-align:center;">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows(bucket.rows)}</tbody>
                        </table>
                        <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:11px;color:#555;">
                            <div style="text-align:center;">
                                <div style="border-top:1px solid #999;width:160px;margin-bottom:4px;"></div>
                                <div>Class Teacher</div>
                            </div>
                            <div style="text-align:center;">
                                <div style="border-top:1px solid #999;width:160px;margin-bottom:4px;"></div>
                                <div>Principal</div>
                            </div>
                        </div>
                    </div>`,
            )
            .join("");

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Merit List – ${deptLabel} – ${selectedYear}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 20mm; color: #111; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
    @page { size: A4; margin: 15mm; }
  }
</style>
</head>
<body>
  <div class="no-print" style="position:sticky;top:0;background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 0;z-index:100;display:flex;gap:12px;margin-bottom:24px;">
    <button onclick="window.print()" style="background:#7a1c1c;color:white;border:none;padding:9px 22px;border-radius:7px;font-size:14px;font-weight:600;cursor:pointer;">🖨 Print / Save as PDF</button>
    <span style="font-size:12px;color:#666;align-self:center;">Each Merit list starts on a new page when printed.</span>
  </div>
  ${sectionsHtml}
</body>
</html>`;
    };

    const openMeritPrintWindow = () => {
        const html = buildMeritDocHtml();
        const win = globalThis.open("", "_blank", "width=900,height=800");
        if (!win) {
            toast.error("Popup blocked. Please allow popups and try again.");
            return;
        }
        win.document.open();
        win.document.documentElement.innerHTML = html;
        win.document.close();
    };

    const downloadMeritDocHtml = () => {
        const html = buildMeritDocHtml();
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = globalThis.document.createElement("a");
        const deptLabel = streamLabelMap[selectedDepartmentTab] || selectedDepartmentTab;
        a.href = url;
        a.download = `MeritList_${deptLabel.replaceAll(" ", "_")}_${selectedYear}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const totalCount = admissions.length;

    const activeDepartmentRows = grouped[selectedDepartmentTab] || [];
    const totalPages = Math.max(1, Math.ceil(activeDepartmentRows.length / PAGE_SIZE));
    const currentPage = Math.min(pageByDepartment[selectedDepartmentTab] || 1, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedRows = activeDepartmentRows.slice(startIndex, endIndex);

    const filteredPaymentRows = useMemo(() => {
        if (selectedPaymentDepartmentTab === "all") {
            return paymentMetrics.rows;
        }

        return paymentMetrics.rows.filter(
            (row) => row.department === selectedPaymentDepartmentTab
        );
    }, [paymentMetrics.rows, selectedPaymentDepartmentTab]);

    const paymentTotalPages = Math.max(1, Math.ceil(filteredPaymentRows.length / PAGE_SIZE));
    const paymentPage = Math.min(
        Number(searchParams.get("paymentPage") || 1),
        paymentTotalPages
    );
    const paymentStartIndex = (paymentPage - 1) * PAGE_SIZE;
    const paymentEndIndex = paymentStartIndex + PAGE_SIZE;
    const paginatedPaymentRows = filteredPaymentRows.slice(paymentStartIndex, paymentEndIndex);

    const updateView = (view) => {
        const params = new URLSearchParams(searchParams.toString());
        if (view === "payments") {
            params.set("view", "payments");
        } else {
            params.delete("view");
            params.delete("paymentPage");
        }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const handlePaymentPageChange = (newPage) => {
        const safePage = Math.min(Math.max(1, newPage), paymentTotalPages);
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "payments");
        params.set("paymentPage", String(safePage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage) => {
        setPageByDepartment((prev) => ({
            ...prev,
            [selectedDepartmentTab]: newPage,
        }));
    };

    const loadAdmissions = async () => {
        setLoading(true);
        setError("");

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(`/api/auth/admission?year=${encodeURIComponent(selectedYear)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch admissions");
            }

            setAdmissions(data.admissions || []);
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch admissions";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmissions();
    }, [selectedYear]);

    const downloadBlob = (blob, filename) => {
        const url = globalThis.URL.createObjectURL(blob);
        const link = globalThis.document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        globalThis.URL.revokeObjectURL(url);
    };

    const handleExport = async ({ mode = "both", department = "all" } = {}) => {
        setExporting(true);
        setError("");

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(
                `/api/auth/admission/export?year=${encodeURIComponent(selectedYear)}&mode=${encodeURIComponent(mode)}&department=${encodeURIComponent(department)}&merit1Min=${encodeURIComponent(meritThresholds.merit1Min)}&merit2Min=${encodeURIComponent(meritThresholds.merit2Min)}&merit3Min=${encodeURIComponent(meritThresholds.merit3Min)}&merit1Limit=${encodeURIComponent(meritLimits.merit1Limit)}&merit2Limit=${encodeURIComponent(meritLimits.merit2Limit)}&merit3Limit=${encodeURIComponent(meritLimits.merit3Limit)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to export admissions");
            }

            const blob = await response.blob();
            let suffix = "All_Top";
            if (mode === "top") {
                suffix = "Top";
            } else if (mode === "all") {
                suffix = "All";
            } else if (mode === "merit") {
                suffix = "Merit";
            } else if (mode === "both") {
                suffix = "All_Top_Merit";
            }
            const departmentSuffix = department === "all" ? "All_Departments" : department;
            downloadBlob(blob, `SNK_Admissions_${selectedYear}_${departmentSuffix}_${suffix}.xlsx`);
            toast.success("Admissions export downloaded");
        } catch (err) {
            const errorMessage = err.message || "Failed to export admissions";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!globalThis.confirm("Delete this admission record?")) return;

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(`/api/auth/admission/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to delete admission");
            }

            setAdmissions((prev) => prev.filter((item) => item.id !== id));
            if (expandedId === id) setExpandedId("");
            toast.success("Admission deleted successfully");
        } catch (err) {
            const errorMessage = err.message || "Failed to delete admission";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const openEditModal = (admission) => {
        const payment = resolvePayment(admission);
        const payload = admission?.payload || {};
        const studentName =
            payload.declarationStudentName ||
            [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ") ||
            "";

        setEditForm({
            id: admission?.id || "",
            studentName,
            email: payload.email || "",
            mobileNumber: payload.mobileNumber || "",
            selectedStream: resolveStream(admission) || "science",
            percentage: String(payload.percentage || ""),
            status: admission?.status || "submitted",
            paymentStatus: String(payment?.status || "pending"),
            paymentAmount: String(payment?.amount || payload.formPrice || ""),
            notes: String(payload.notes || ""),
        });
        setEditingAdmissionId(admission?.id || "");
    };

    const closeEditModal = () => {
        if (editSubmitting) return;
        setEditingAdmissionId("");
        setEditForm(initialEditFormState);
    };

    const handleEditFieldChange = (key, value) => {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        if (!editingAdmissionId) return;

        if (!editForm.studentName.trim()) {
            toast.error("Student name is required");
            return;
        }

        try {
            setEditSubmitting(true);
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const payload = {
                declarationStudentName: editForm.studentName.trim(),
                email: editForm.email.trim(),
                mobileNumber: editForm.mobileNumber.trim(),
                selectedStream: editForm.selectedStream,
                percentage: editForm.percentage.trim(),
                status: editForm.status,
                notes: editForm.notes.trim(),
                payment: {
                    status: editForm.paymentStatus,
                    mode: "offline",
                    amount: editForm.paymentAmount,
                    paidAt: editForm.paymentStatus === "paid" ? new Date().toISOString() : "",
                    note: "Payment updated by admin",
                },
            };

            const formData = new FormData();
            formData.append("payload", JSON.stringify(payload));

            const response = await fetch(`/api/auth/admission/${editingAdmissionId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update admission");
            }

            setAdmissions((prev) => prev.map((item) => (item.id === editingAdmissionId ? data.admission : item)));
            toast.success("Admission updated successfully");
            setEditingAdmissionId("");
            setEditForm(initialEditFormState);
        } catch (err) {
            const errorMessage = err.message || "Failed to update admission";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleOfflineFieldChange = (key, value) => {
        setOfflineForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleOfflineFileChange = async (key, file) => {
        setOfflineFiles((prev) => ({ ...prev, [key]: file || null }));

        if (key !== "offlineFormPdf" || !file) {
            return;
        }

        try {
            setExtractingPdf(true);
            const text = await extractTextFromPdfFile(file);
            const parsed = parseOfflinePdfDetails(text);
            setExtractedDetails(parsed.extractedDetails || {});
            setDetectedDocumentKeys(Array.isArray(parsed.detectedDocumentKeys) ? parsed.detectedDocumentKeys : []);

            setOfflineForm((prev) => ({
                ...prev,
                studentName: parsed.studentName || prev.studentName,
                email: parsed.email || prev.email,
                mobileNumber: parsed.mobileNumber || prev.mobileNumber,
                percentage: parsed.percentage || prev.percentage,
                selectedStream: parsed.selectedStream || prev.selectedStream,
                paymentStatus: parsed.paymentStatus || prev.paymentStatus,
                paymentAmount: parsed.paymentAmount || prev.paymentAmount,
            }));

            toast.success("PDF scanned and fields auto-filled where detected");
        } catch (error) {
            toast.error(error.message || "Could not auto-read PDF. Please fill manually.");
        } finally {
            setExtractingPdf(false);
        }
    };

    const resetOfflineForm = () => {
        setOfflineForm(initialOfflineFormState);
        setOfflineFiles({ offlineFormPdf: null });
        setExtractedDetails({});
        setDetectedDocumentKeys([]);
    };

    const uploadedDocCount = useMemo(() => {
        return Object.values(offlineFiles).filter(Boolean).length;
    }, [offlineFiles]);

    const handleOfflineSubmit = async (event) => {
        event.preventDefault();

        if (!offlineFiles.offlineFormPdf) {
            toast.error("Offline admission PDF is required");
            return;
        }

        if (!offlineForm.studentName.trim()) {
            toast.error("Student name is required");
            return;
        }

        try {
            setOfflineSubmitting(true);
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const payload = {
                declarationStudentName: offlineForm.studentName.trim(),
                email: offlineForm.email.trim(),
                mobileNumber: offlineForm.mobileNumber.trim(),
                selectedStream: offlineForm.selectedStream,
                percentage: offlineForm.percentage.trim(),
                status: offlineForm.status,
                notes: offlineForm.notes.trim(),
                admissionMode: "offline",
                academicYear: selectedYear,
                payment: {
                    status: offlineForm.paymentStatus,
                    mode: "offline",
                    amount: offlineForm.paymentAmount,
                    paidAt: offlineForm.paymentStatus === "paid" ? new Date().toISOString() : "",
                    note: "Offline payment entry by admin",
                },
            };

            const formData = new FormData();
            formData.append("action", "offline-create");
            formData.append("payload", JSON.stringify(payload));

            Object.entries(offlineFiles).forEach(([key, file]) => {
                if (file) {
                    formData.append(key, file);
                }
            });

            const response = await fetch("/api/auth/admission", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to upload offline admission");
            }

            toast.success(`Offline admission saved. Application ID: ${data?.admission?.applicationId || "Generated"}`);
            resetOfflineForm();
            await loadAdmissions();
        } catch (err) {
            const errorMessage = err.message || "Failed to upload offline admission";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setOfflineSubmitting(false);
        }
    };

    let offlineSubmitLabel = "Save Offline Admission";
    if (offlineSubmitting) {
        offlineSubmitLabel = "Saving...";
    } else if (extractingPdf) {
        offlineSubmitLabel = "Reading PDF...";
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fdf5f5_0%,#f8f6f6_42%,#f4f2f2_100%)] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {offlineSourceMode && selectedView !== "payments" && (
                    <section className="rounded-3xl border border-[#7a1c1c]/15 bg-white p-5 shadow-sm md:p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Offline Registration</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">Upload Offline Admission Packet</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Upload scanned PDF, add payment status, and attach student documents. Application ID will generate automatically.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#7a1c1c]/5 px-4 py-2 text-sm font-semibold text-[#7a1c1c]">
                                Docs Uploaded: {uploadedDocCount}
                            </div>
                        </div>

                        <form onSubmit={handleOfflineSubmit} className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Student Name</span>
                                    <input
                                        type="text"
                                        value={offlineForm.studentName}
                                        onChange={(event) => handleOfflineFieldChange("studentName", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        required
                                    />
                                </label>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Email</span>
                                    <input
                                        type="email"
                                        value={offlineForm.email}
                                        onChange={(event) => handleOfflineFieldChange("email", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    />
                                </label>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Mobile Number</span>
                                    <input
                                        type="text"
                                        value={offlineForm.mobileNumber}
                                        onChange={(event) => handleOfflineFieldChange("mobileNumber", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    />
                                </label>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Department</span>
                                    <select
                                        value={offlineForm.selectedStream}
                                        onChange={(event) => handleOfflineFieldChange("selectedStream", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    >
                                        <option value="science">Science</option>
                                        <option value="commerce">Commerce</option>
                                        <option value="arts">Arts</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>10th Percentage</span>
                                    <input
                                        type="text"
                                        value={offlineForm.percentage}
                                        onChange={(event) => handleOfflineFieldChange("percentage", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    />
                                </label>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Admission Status</span>
                                    <select
                                        value={offlineForm.status}
                                        onChange={(event) => handleOfflineFieldChange("status", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    >
                                        <option value="submitted-offline">Submitted Offline</option>
                                        <option value="verified-offline">Verified Offline</option>
                                        <option value="approved">Approved</option>
                                    </select>
                                </label>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Payment Status</span>
                                    <select
                                        value={offlineForm.paymentStatus}
                                        onChange={(event) => handleOfflineFieldChange("paymentStatus", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    >
                                        <option value="paid">Paid (Offline)</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </label>
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Payment Amount</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={offlineForm.paymentAmount}
                                        onChange={(event) => handleOfflineFieldChange("paymentAmount", event.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                    />
                                </label>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-800">Upload Offline Template PDF (Required)</p>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(event) => handleOfflineFileChange("offlineFormPdf", event.target.files?.[0] || null)}
                                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                    required
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    {extractingPdf
                                        ? "Reading PDF and auto-filling details..."
                                        : "After selecting PDF, system auto-detects name, email, mobile, percentage, stream, and payment details."}
                                </p>
                            </div>

                            {Object.entries(extractedDetails || {}).some(([, value]) => String(value || "").trim()) && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                                    <p className="text-sm font-semibold text-emerald-800">Extracted PDF Details (Preview)</p>
                                    <p className="mt-1 text-xs text-emerald-700">All detected values from your uploaded template are shown below.</p>
                                    <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                        {Object.entries(extractedDetails)
                                            .filter(([, value]) => String(value || "").trim())
                                            .map(([key, value]) => (
                                                <div key={key} className="rounded-xl border border-emerald-200 bg-white px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                                        {EXTRACTED_DETAIL_LABELS[key] || key}
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">{String(value || "-")}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {detectedDocumentKeys.length > 0 && (
                                <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                                    <p className="text-sm font-semibold text-sky-800">Detected Documents From PDF Checklist</p>
                                    <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                        {OFFLINE_DOCUMENT_FIELDS.map((doc) => {
                                            const detected = detectedDocumentKeys.includes(doc.key);
                                            return (
                                                <div
                                                    key={`detected-${doc.key}`}
                                                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${detected
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                        : "border-slate-200 bg-white text-slate-500"
                                                        }`}
                                                >
                                                    {doc.label} {detected ? "(Detected)" : "(Not detected)"}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="mb-2 text-sm font-semibold text-slate-800">Upload Supporting Documents (Admin)</p>
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {OFFLINE_DOCUMENT_FIELDS.map((doc) => {
                                        const isDetected = detectedDocumentKeys.includes(doc.key);
                                        const isUploaded = Boolean(offlineFiles[doc.key]);
                                        let statusText = "Not uploaded";
                                        if (isUploaded) {
                                            statusText = "Uploaded";
                                        } else if (isDetected) {
                                            statusText = "Detected in PDF - upload file now";
                                        }

                                        return (
                                            <label
                                                key={doc.key}
                                                className={`rounded-xl border p-3 text-xs font-semibold uppercase tracking-wide ${isDetected
                                                    ? "border-[#7a1c1c]/25 bg-[#7a1c1c]/5 text-[#7a1c1c]"
                                                    : "border-slate-200 bg-white text-slate-500"
                                                    }`}
                                            >
                                                <span>{doc.label}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(event) => handleOfflineFileChange(doc.key, event.target.files?.[0] || null)}
                                                    className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium normal-case text-slate-700"
                                                />
                                                <span className="mt-1 block text-[11px] font-medium normal-case text-slate-600">
                                                    {statusText}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <span>Verification Notes</span>
                                <textarea
                                    value={offlineForm.notes}
                                    onChange={(event) => handleOfflineFieldChange("notes", event.target.value)}
                                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm normal-case text-slate-800"
                                />
                            </label>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={offlineSubmitting || extractingPdf}
                                    className="h-11 rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                >
                                    {offlineSubmitLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetOfflineForm}
                                    disabled={offlineSubmitting || extractingPdf}
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm md:p-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,auto)] lg:items-end">
                        <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Admin Admissions Panel</p>
                            <h5 className="mt-2 text-sm leading-tight font-black text-slate-900 sm:text-md lg:text-xl xl:text-2xl">Department-Wise Admission Records</h5>
                            <p className="mt-2 text-sm text-slate-500">View all student admissions with complete details grouped by selected stream.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <select
                                    value={selectedYear}
                                    onChange={(event) => setSelectedYear(event.target.value)}
                                    className="h-12 min-w-40 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={loadAdmissions}
                                    disabled={loading}
                                    className="h-12 rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                >
                                    {loading ? "Loading..." : "Refresh Admissions"}
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleExport({ mode: "all" })}
                                    disabled={exporting}
                                    className="h-12 rounded-xl border border-[#7a1c1c]/20 bg-white px-4 text-sm font-semibold text-[#7a1c1c] disabled:opacity-60"
                                >
                                    {exporting ? "Exporting..." : "Export Year List"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExport({ mode: "merit", department: selectedDepartmentTab })}
                                    disabled={exporting}
                                    className="h-12 rounded-xl border border-[#7a1c1c]/20 bg-[#7a1c1c]/10 px-4 text-sm font-semibold text-[#7a1c1c] disabled:opacity-60"
                                >
                                    Export Merit 1/2/3 ({streamLabelMap[selectedDepartmentTab]})
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
                    <div className="mt-4 inline-flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <div className="flex h-12 items-center rounded-xl border border-[#7a1c1c]/10 bg-[#7a1c1c]/5 px-4 text-sm font-semibold text-[#7a1c1c]">
                            Total Admissions: {totalCount}
                        </div>
                        <div className="flex h-12 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
                            Total Revenue: {formatINR(paymentMetrics.totalRevenue)}
                        </div>
                        <div className="flex h-12 items-center rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700">
                            Online Revenue: {formatINR(paymentMetrics.onlineRevenue)}
                        </div>
                        <div className="flex h-12 items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700">
                            Offline Revenue: {formatINR(paymentMetrics.offlineRevenue)}
                        </div>

                        <button
                            type="button"
                            onClick={() => updateView("admissions")}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${selectedView === "admissions"
                                ? "bg-white text-[#7a1c1c] shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Admissions View
                        </button>
                        <button
                            type="button"
                            onClick={() => updateView("payments")}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${selectedView === "payments"
                                ? "bg-white text-[#7a1c1c] shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Payment History View
                        </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "all", department: "science" })}
                            disabled={exporting}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                            Export Science Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "all", department: "commerce" })}
                            disabled={exporting}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                            Export Commerce Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "all", department: "arts" })}
                            disabled={exporting}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                            Export Arts Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "top" })}
                            disabled={exporting}
                            className="h-12 rounded-xl border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-4 text-sm font-semibold text-[#7a1c1c] disabled:opacity-60"
                        >
                            Export Top Percentage
                        </button>
                    </div>
                </section>

                {selectedView === "payments" && (
                    <>
                        <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Payment Overview</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                                    {selectedYear}
                                </span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-emerald-800">{formatINR(paymentMetrics.totalRevenue)}</p>
                                </div>
                                <div className="rounded-2xl border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a1c1c]">Paid Students</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{paymentMetrics.paidCount}</p>
                                </div>
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending Students</p>
                                    <p className="mt-2 text-2xl font-black text-amber-800">{paymentMetrics.pendingCount}</p>
                                </div>
                                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Science Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(paymentMetrics.revenueByDepartment.science)}</p>
                                </div>
                                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Commerce Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(paymentMetrics.revenueByDepartment.commerce)}</p>
                                </div>
                                <div className="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-pink-700">Arts Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(paymentMetrics.revenueByDepartment.arts)}</p>
                                </div>
                            </div>
                        </section>

                        <section id="payment-history" className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">All Student Payment History</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                                    {filteredPaymentRows.length} students
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {paymentDepartmentTabs.map((tab) => {
                                    const active = tab.id === selectedPaymentDepartmentTab;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPaymentDepartmentTab(tab.id);
                                                handlePaymentPageChange(1);
                                            }}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active
                                                ? "bg-[#7a1c1c] text-white shadow-sm"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredPaymentRows.length === 0 ? (
                                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                    No payment history found for this department in the selected academic year.
                                </div>
                            ) : (
                                <>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-slate-600">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold">Student</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Application ID</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Department</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Mode</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Amount</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Payment ID</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedPaymentRows.map((row) => (
                                                    <tr key={row.id} className="border-t border-slate-200 bg-white">
                                                        <td className="px-3 py-2">
                                                            <p className="font-semibold text-slate-900">{row.studentName}</p>
                                                            <p className="text-xs text-slate-500">{row.email} | {row.mobile}</p>
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-700">{row.applicationId}</td>
                                                        <td className="px-3 py-2 uppercase text-slate-700">{row.department || "-"}</td>
                                                        <td className="px-3 py-2 uppercase text-slate-700">{row.paymentMode || "online"}</td>
                                                        <td className="px-3 py-2 font-semibold text-slate-900">{formatINR(row.amount)}</td>
                                                        <td className="px-3 py-2">
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                                {row.isPaid ? "Paid" : "Pending"}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-700">{row.paymentId}</td>
                                                        <td className="px-3 py-2 text-slate-700">{row.paidAt ? new Date(row.paidAt).toLocaleString("en-GB") : "-"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-medium text-slate-500">
                                            Showing {paymentStartIndex + 1}-{Math.min(paymentEndIndex, filteredPaymentRows.length)} of {filteredPaymentRows.length}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePaymentPageChange(paymentPage - 1)}
                                                disabled={paymentPage === 1}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Prev
                                            </button>

                                            {Array.from({ length: paymentTotalPages }, (_, idx) => idx + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => handlePaymentPageChange(page)}
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${page === paymentPage
                                                        ? "bg-[#7a1c1c] text-white"
                                                        : "border border-slate-200 bg-white text-slate-700"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => handlePaymentPageChange(paymentPage + 1)}
                                                disabled={paymentPage === paymentTotalPages}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )}

                {selectedView !== "payments" && (
                    <>

                        <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Merit Lists (Department Wise)</h2>
                                    <p className="mt-1 text-sm text-slate-500">Configure and update merit ranges anytime. Changes reflect immediately in display and export.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                                        {selectedYear} • {streamLabelMap[selectedDepartmentTab]}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={openMeritPrintWindow}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#7a1c1c]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#7a1c1c] hover:bg-[#7a1c1c]/5"
                                    >
                                        🖨 Preview &amp; Print
                                    </button>
                                    <button
                                        type="button"
                                        onClick={downloadMeritDocHtml}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                    >
                                        ⬇ Download for Google Docs
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 1 Minimum %</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={meritThresholds.merit1Min}
                                        onChange={(event) => handleThresholdChange("merit1Min", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 2 Minimum %</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={meritThresholds.merit2Min}
                                        onChange={(event) => handleThresholdChange("merit2Min", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 3 Minimum %</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={meritThresholds.merit3Min}
                                        onChange={(event) => handleThresholdChange("merit3Min", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 1 Student Limit</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={meritLimits.merit1Limit}
                                        onChange={(event) => handleMeritLimitChange("merit1Limit", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 2 Student Limit</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={meritLimits.merit2Limit}
                                        onChange={(event) => handleMeritLimitChange("merit2Limit", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 3 Student Limit</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={meritLimits.merit3Limit}
                                        onChange={(event) => handleMeritLimitChange("merit3Limit", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={clearMeritSettings}
                                        className="h-10 w-full rounded-lg border border-[#7a1c1c]/20 bg-white px-3 text-sm font-semibold text-[#7a1c1c]"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                                Ranges: Merit 1 ≥ {meritThresholds.merit1Min === "" ? "not set" : `${meritThresholds.merit1Min}%`}, Merit 2 ≥ {meritThresholds.merit2Min === "" ? "not set" : `${meritThresholds.merit2Min}%`}, Merit 3 ≥ {meritThresholds.merit3Min === "" ? "not set" : `${meritThresholds.merit3Min}%`}.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Limits: Merit 1 = {meritLimits.merit1Limit === "" ? "no limit" : `${meritLimits.merit1Limit} students`}, Merit 2 = {meritLimits.merit2Limit === "" ? "no limit" : `${meritLimits.merit2Limit} students`}, Merit 3 = {meritLimits.merit3Limit === "" ? "no limit" : `${meritLimits.merit3Limit} students`}.
                            </p>

                            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                {(() => {
                                    const m1Label = meritThresholds.merit1Min === "" ? "No minimum set" : `≥ ${meritThresholds.merit1Min}%`;
                                    const m2Upper = meritThresholds.merit1Min === "" ? "—" : meritThresholds.merit1Min;
                                    const m2Label = meritThresholds.merit2Min === "" ? "No minimum set" : `≥ ${meritThresholds.merit2Min}% < ${m2Upper}%`;
                                    const m3Upper = meritThresholds.merit2Min === "" ? "—" : meritThresholds.merit2Min;
                                    const m3Label = meritThresholds.merit3Min === "" ? "No minimum set" : `≥ ${meritThresholds.merit3Min}% < ${m3Upper}%`;
                                    return [
                                        { title: "Merit 1", subtitle: m1Label, rows: activeMeritBuckets.merit1, limit: meritLimits.merit1Limit },
                                        { title: "Merit 2", subtitle: m2Label, rows: activeMeritBuckets.merit2, limit: meritLimits.merit2Limit },
                                        { title: "Merit 3", subtitle: m3Label, rows: activeMeritBuckets.merit3, limit: meritLimits.merit3Limit },
                                    ];
                                })().map((bucket) => (
                                    <div key={bucket.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <h3 className="text-base font-bold text-slate-900">{bucket.title}</h3>
                                        <p className="text-xs text-slate-500">{bucket.subtitle}</p>
                                        <p className="mt-1 text-[11px] font-medium text-slate-500">Limit: {bucket.limit === "" ? "no limit" : `${bucket.limit} students`}</p>
                                        <div className="mt-3 space-y-2">
                                            {bucket.rows.length === 0 && (
                                                <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                                                    No students in this merit list.
                                                </p>
                                            )}
                                            {(bucket.limit === "" ? bucket.rows : bucket.rows.slice(0, Number(bucket.limit))).map((row, index) => (
                                                <div key={`${bucket.title}-${row.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-xs font-semibold text-slate-900">{index + 1}. {row.studentName}</p>
                                                    <p className="text-xs text-[#7a1c1c]">{row.percentageText}% • {row.department || "-"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                {departmentTabs.map((tab) => {
                                    const active = tab.id === selectedDepartmentTab;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDepartmentTab(tab.id);
                                                setExpandedId("");
                                            }}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active
                                                ? "bg-[#7a1c1c] text-white shadow-sm"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">{streamLabelMap[selectedDepartmentTab]}</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-sm font-semibold text-[#7a1c1c]">
                                    {activeDepartmentRows.length} records
                                </span>
                            </div>

                            {activeDepartmentRows.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                    No admissions in this department.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paginatedRows.map((admission) => {
                                        const studentName =
                                            admission?.payload?.declarationStudentName ||
                                            [
                                                admission?.payload?.firstName,
                                                admission?.payload?.middleName,
                                                admission?.payload?.lastName,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "Student";

                                        const isExpanded = expandedId === admission.id;

                                        return (
                                            <div key={admission.id} className="rounded-2xl border border-slate-200 bg-white">
                                                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7a1c1c] text-white">
                                                            <UserRound className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{studentName}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {admission?.payload?.email || "-"} | {admission?.payload?.mobileNumber || "-"}
                                                            </p>
                                                            <p className="text-xs text-slate-500">Application ID: {admission.applicationId || "-"}</p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                                                                    {admission?.source || "online"}
                                                                </span>
                                                                <span className="rounded-full bg-[#7a1c1c]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#7a1c1c]">
                                                                    {admission?.status || "submitted"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(admission)}
                                                            className="rounded-lg border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-3 py-2 text-xs font-semibold text-[#7a1c1c]"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedId(isExpanded ? "" : admission.id)}
                                                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                                                        >
                                                            {isExpanded ? "Hide Details" : "View Full Details"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(admission.id)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                                                        <h3 className="mb-3 text-sm font-bold text-slate-800">Submitted Form Data</h3>
                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                            {Object.entries(admission.payload || {}).map(([key, value]) => (
                                                                <div key={key} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{key}</p>
                                                                    <p className="mt-1 wrap-break-word text-sm font-medium text-slate-700">
                                                                        {key === "payment" ? formatPaymentDetailValue(value) : prettyValue(value)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <h3 className="mb-3 mt-5 text-sm font-bold text-slate-800">Uploaded Documents</h3>
                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                            {Object.entries(admission.documents || {}).length === 0 && (
                                                                <p className="text-sm text-slate-500">No uploaded documents found.</p>
                                                            )}
                                                            {Object.entries(admission.documents || {}).map(([key, doc]) => (
                                                                <a
                                                                    key={key}
                                                                    href={resolveDocumentUrl(doc)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="rounded-xl border border-[#7a1c1c]/10 bg-white px-3 py-2 text-sm font-medium text-[#7a1c1c] hover:bg-[#7a1c1c]/5"
                                                                >
                                                                    {key}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-medium text-slate-500">
                                            Showing {startIndex + 1}-{Math.min(endIndex, activeDepartmentRows.length)} of {activeDepartmentRows.length}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Prev
                                            </button>

                                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => handlePageChange(page)}
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${page === currentPage
                                                        ? "bg-[#7a1c1c] text-white"
                                                        : "border border-slate-200 bg-white text-slate-700"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {editingAdmissionId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a1c1c]">Edit Admission</p>
                                    <h3 className="mt-1 text-xl font-black text-slate-900">Update Student Admission Details</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editSubmitting}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                                >
                                    Close
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Student Name</span>
                                        <input
                                            type="text"
                                            value={editForm.studentName}
                                            onChange={(event) => handleEditFieldChange("studentName", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                            required
                                        />
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(event) => handleEditFieldChange("email", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        />
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Mobile Number</span>
                                        <input
                                            type="text"
                                            value={editForm.mobileNumber}
                                            onChange={(event) => handleEditFieldChange("mobileNumber", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        />
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Department</span>
                                        <select
                                            value={editForm.selectedStream}
                                            onChange={(event) => handleEditFieldChange("selectedStream", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        >
                                            <option value="science">Science</option>
                                            <option value="commerce">Commerce</option>
                                            <option value="arts">Arts</option>
                                        </select>
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>10th Percentage</span>
                                        <input
                                            type="text"
                                            value={editForm.percentage}
                                            onChange={(event) => handleEditFieldChange("percentage", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        />
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Admission Status</span>
                                        <select
                                            value={editForm.status}
                                            onChange={(event) => handleEditFieldChange("status", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        >
                                            <option value="submitted">Submitted</option>
                                            <option value="submitted-offline">Submitted Offline</option>
                                            <option value="verified-offline">Verified Offline</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Payment Status</span>
                                        <select
                                            value={editForm.paymentStatus}
                                            onChange={(event) => handleEditFieldChange("paymentStatus", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </label>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span>Payment Amount</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.paymentAmount}
                                            onChange={(event) => handleEditFieldChange("paymentAmount", event.target.value)}
                                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm normal-case text-slate-800"
                                        />
                                    </label>
                                </div>

                                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Notes</span>
                                    <textarea
                                        value={editForm.notes}
                                        onChange={(event) => handleEditFieldChange("notes", event.target.value)}
                                        className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm normal-case text-slate-800"
                                    />
                                </label>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={editSubmitting}
                                        className="h-11 rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                    >
                                        {editSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        disabled={editSubmitting}
                                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminAdmissionsPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-slate-500 text-sm">Loading...</p></div>}>
            <AdminAdmissionsInner />
        </Suspense>
    );
}
