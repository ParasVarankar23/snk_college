import { uploadAssetToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";

const FILE_KEYS = [
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

function getAuthContext(request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const uid = payload.user_id || payload.uid || payload.sub || null;
        const role = String(payload.role || "student").trim().toLowerCase();
        if (!uid) return null;
        return { uid, role };
    } catch {
        return null;
    }
}

async function uploadIncomingFile(file, uid, fieldName) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadAssetToCloudinary({
        buffer,
        folder: `college/admissions/${uid}`,
        mimeType: file.type || "application/octet-stream",
        resourceType: "auto",
    });

    return {
        fieldName,
        originalName: file.name,
        mimeType: file.type,
        bytes: file.size,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        resourceType: uploaded.resource_type || "auto",
        uploadedAt: new Date().toISOString(),
    };
}

function sortByUpdatedAtDesc(admissionsObject) {
    return Object.entries(admissionsObject || {})
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

function parsePayloadFromFormData(formData) {
    const payloadRaw = formData.get("payload");
    if (!(typeof payloadRaw === "string" && payloadRaw.trim())) {
        return { payload: {}, error: null };
    }

    try {
        return { payload: JSON.parse(payloadRaw), error: null };
    } catch {
        return { payload: null, error: "Invalid payload JSON" };
    }
}

function parseStartYearFromAcademicYear(value) {
    const text = String(value || "").trim();
    const match = /(\d{4})/.exec(text);
    return match ? Number(match[1]) : null;
}

function formatAcademicYear(startYear) {
    return `${startYear}-${startYear + 1}`;
}

function resolveAcademicYearStart({ payload, existingAdmission }) {
    const payloadYear = parseStartYearFromAcademicYear(payload?.academicYear);
    if (payloadYear) return payloadYear;

    const existingYear = parseStartYearFromAcademicYear(existingAdmission?.academicYear);
    if (existingYear) return existingYear;

    return new Date().getFullYear();
}

function parseYearFilter(value) {
    const year = parseStartYearFromAcademicYear(value);
    return year ? formatAcademicYear(year) : null;
}

function normalizeStream(value) {
    const stream = String(value || "").trim().toLowerCase();
    if (stream === "science" || stream === "commerce" || stream === "arts") {
        return stream;
    }
    return "";
}

async function getNextApplicationId(db, startYear) {
    const counterRef = db.ref(`admissionCounters/${startYear}`);
    const transactionResult = await counterRef.transaction((current) => {
        const safeCurrent = Number(current) || 0;
        return safeCurrent + 1;
    });

    const sequence = Number(transactionResult.snapshot.val()) || 1;
    return `${startYear}SNK${String(sequence).padStart(4, "0")}`;
}

async function mergeUploadedDocuments({ formData, uid, existingDocuments }) {
    const documents = existingDocuments ? { ...existingDocuments } : {};

    for (const key of FILE_KEYS) {
        const file = formData.get(key);
        if (!file || typeof file === "string") continue;
        if (!file.name || file.size === 0) continue;
        documents[key] = await uploadIncomingFile(file, uid, key);
    }

    return documents;
}

export async function GET(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const yearFilter = parseYearFilter(searchParams.get("year"));

    if (auth.role === "admin") {
        const allSnapshot = await db.ref("admissions").get();
        const allAdmissions = sortByUpdatedAtDesc(allSnapshot.exists() ? allSnapshot.val() : {});
        const admissions = yearFilter
            ? allAdmissions.filter((item) => item.academicYear === yearFilter)
            : allAdmissions;
        return Response.json({ success: true, admissions }, { status: 200 });
    }

    const mineSnapshot = await db.ref(`admissions/${auth.uid}`).get();
    if (!mineSnapshot.exists()) {
        return Response.json({ success: true, admission: null }, { status: 200 });
    }

    return Response.json(
        {
            success: true,
            admission: {
                id: auth.uid,
                ...mineSnapshot.val(),
            },
        },
        { status: 200 }
    );
}

export async function POST(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "student" && auth.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getAdminDb();
    const formData = await request.formData();
    const action = String(formData.get("action") || "").trim().toLowerCase();

    if (auth.role === "admin") {
        if (action === "offline-create") {
            const { payload, error: payloadError } = parsePayloadFromFormData(formData);
            if (payloadError) {
                return Response.json({ error: payloadError }, { status: 400 });
            }

            const offlinePdf = formData.get("offlineFormPdf");
            if (!offlinePdf || typeof offlinePdf === "string" || !offlinePdf.name || offlinePdf.size === 0) {
                return Response.json({ error: "Offline admission PDF is required" }, { status: 400 });
            }

            const studentName = String(
                payload?.declarationStudentName ||
                [payload?.firstName, payload?.middleName, payload?.lastName].filter(Boolean).join(" ")
            ).trim();
            const studentEmail = String(payload?.email || "").trim();
            const selectedStream = normalizeStream(payload?.selectedStream);

            if (!studentName) {
                return Response.json({ error: "Student name is required" }, { status: 400 });
            }

            if (!selectedStream) {
                return Response.json({ error: "Valid stream is required" }, { status: 400 });
            }

            const academicYearStart = resolveAcademicYearStart({ payload, existingAdmission: null });
            const academicYear = formatAcademicYear(academicYearStart);
            const applicationId = await getNextApplicationId(db, academicYearStart);
            const nowIso = new Date().toISOString();
            const admissionId = db.ref("admissions").push().key;
            const pdfDocument = await uploadIncomingFile(offlinePdf, admissionId, "offlineFormPdf");

            const supportingDocuments = {};
            for (const key of FILE_KEYS) {
                const file = formData.get(key);
                if (!file || typeof file === "string" || !file.name || file.size === 0) {
                    continue;
                }

                supportingDocuments[key] = await uploadIncomingFile(file, admissionId, key);
            }

            const paymentPayload = payload?.payment && typeof payload.payment === "object"
                ? payload.payment
                : {};
            const paymentStatus = String(paymentPayload.status || "pending").trim().toLowerCase() === "paid"
                ? "paid"
                : "pending";
            const paymentAmount = Number.parseFloat(String(paymentPayload.amount || payload?.formPrice || 200));
            const safeAmount = Number.isFinite(paymentAmount) ? paymentAmount : 200;
            const paymentMode = String(paymentPayload.mode || "offline").trim().toLowerCase() || "offline";
            const payment = {
                status: paymentStatus,
                mode: paymentMode,
                amount: safeAmount,
                paidAt: paymentStatus === "paid" ? (paymentPayload.paidAt || nowIso) : "",
                note: String(paymentPayload.note || "").trim(),
            };

            const status = String(payload?.status || "submitted-offline").trim() || "submitted-offline";

            const admissionData = {
                uid: admissionId,
                applicationId,
                academicYear,
                source: "offline",
                status,
                selectedStream,
                payload: {
                    ...payload,
                    declarationStudentName: studentName,
                    email: studentEmail,
                    selectedStream,
                    academicYear,
                    payment,
                },
                documents: {
                    offlineFormPdf: pdfDocument,
                    ...supportingDocuments,
                },
                createdBy: auth.uid,
                createdAt: nowIso,
                updatedAt: nowIso,
            };

            await db.ref(`admissions/${admissionId}`).set(admissionData);

            return Response.json(
                {
                    success: true,
                    message: "Offline admission uploaded successfully",
                    admission: {
                        id: admissionId,
                        ...admissionData,
                    },
                },
                { status: 200 }
            );
        }

        return Response.json({ error: "Invalid admin submission action" }, { status: 400 });
    }

    const { payload, error: payloadError } = parsePayloadFromFormData(formData);
    if (payloadError) {
        return Response.json({ error: payloadError }, { status: 400 });
    }

    const existingSnapshot = await db.ref(`admissions/${auth.uid}`).get();
    const existingAdmission = existingSnapshot.exists() ? existingSnapshot.val() : null;
    const academicYearStart = resolveAcademicYearStart({ payload, existingAdmission });
    const academicYear = formatAcademicYear(academicYearStart);
    const documents = await mergeUploadedDocuments({
        formData,
        uid: auth.uid,
        existingDocuments: existingAdmission?.documents,
    });

    const applicationId =
        existingAdmission?.applicationId ||
        (await getNextApplicationId(db, academicYearStart));

    const nowIso = new Date().toISOString();
    const admissionData = {
        uid: auth.uid,
        applicationId,
        academicYear,
        status: payload.status || existingAdmission?.status || "submitted",
        selectedStream: payload.selectedStream || existingAdmission?.selectedStream || "",
        payload: existingAdmission?.payload
            ? {
                ...existingAdmission.payload,
                ...payload,
                academicYear,
            }
            : { ...payload, academicYear },
        documents,
        createdAt: existingAdmission?.createdAt || nowIso,
        updatedAt: nowIso,
    };

    await db.ref(`admissions/${auth.uid}`).set(admissionData);

    return Response.json(
        {
            success: true,
            message: existingAdmission ? "Admission updated successfully" : "Admission created successfully",
            admission: {
                id: auth.uid,
                ...admissionData,
            },
        },
        { status: 200 }
    );
}
