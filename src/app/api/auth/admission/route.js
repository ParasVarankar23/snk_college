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

    if (auth.role === "admin") {
        const allSnapshot = await db.ref("admissions").get();
        const admissions = sortByUpdatedAtDesc(allSnapshot.exists() ? allSnapshot.val() : {});
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

    const formData = await request.formData();
    const { payload, error: payloadError } = parsePayloadFromFormData(formData);
    if (payloadError) {
        return Response.json({ error: payloadError }, { status: 400 });
    }

    const db = getAdminDb();
    const existingSnapshot = await db.ref(`admissions/${auth.uid}`).get();
    const existingAdmission = existingSnapshot.exists() ? existingSnapshot.val() : null;
    const documents = await mergeUploadedDocuments({
        formData,
        uid: auth.uid,
        existingDocuments: existingAdmission?.documents,
    });

    const nowIso = new Date().toISOString();
    const admissionData = {
        uid: auth.uid,
        applicationId:
            payload.applicationId ||
            existingAdmission?.applicationId ||
            `FYJC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: payload.status || existingAdmission?.status || "submitted",
        selectedStream: payload.selectedStream || existingAdmission?.selectedStream || "",
        payload: existingAdmission?.payload
            ? {
                ...existingAdmission.payload,
                ...payload,
            }
            : payload,
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
