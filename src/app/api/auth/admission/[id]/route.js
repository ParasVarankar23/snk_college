import { deleteCloudinaryAsset, uploadAssetToCloudinary } from "@/lib/cloudinary";
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

function canAccessAdmission(auth, admissionId) {
    return auth.role === "admin" || auth.uid === admissionId;
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

async function mergeUploadedDocuments({ formData, uid, documents }) {
    const nextDocuments = documents ? { ...documents } : {};

    for (const key of FILE_KEYS) {
        const file = formData.get(key);
        if (!file || typeof file === "string") continue;
        if (!file.name || file.size === 0) continue;

        const oldDoc = nextDocuments[key];
        if (oldDoc?.publicId) {
            await deleteCloudinaryAsset(oldDoc.publicId, oldDoc.resourceType || "auto");
        }

        nextDocuments[key] = await uploadIncomingFile(file, uid, key);
    }

    return nextDocuments;
}

export async function GET(request, { params }) {
    const auth = getAuthContext(request);
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!canAccessAdmission(auth, id)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getAdminDb();
    const snapshot = await db.ref(`admissions/${id}`).get();
    if (!snapshot.exists()) {
        return Response.json({ error: "Admission not found" }, { status: 404 });
    }

    return Response.json({ success: true, admission: { id, ...snapshot.val() } }, { status: 200 });
}

export async function PUT(request, { params }) {
    const auth = getAuthContext(request);
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!canAccessAdmission(auth, id)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getAdminDb();
    const snapshot = await db.ref(`admissions/${id}`).get();
    if (!snapshot.exists()) {
        return Response.json({ error: "Admission not found" }, { status: 404 });
    }

    const existing = snapshot.val();
    const formData = await request.formData();

    const { payload, error: payloadError } = parsePayloadFromFormData(formData);
    if (payloadError) {
        return Response.json({ error: payloadError }, { status: 400 });
    }

    const documents = await mergeUploadedDocuments({
        formData,
        uid: id,
        documents: existing.documents,
    });

    const updated = {
        ...existing,
        selectedStream: payload.selectedStream || existing.selectedStream || "",
        status: payload.status || existing.status || "submitted",
        payload: existing.payload
            ? {
                ...existing.payload,
                ...payload,
            }
            : payload,
        documents,
        updatedAt: new Date().toISOString(),
    };

    await db.ref(`admissions/${id}`).set(updated);

    return Response.json(
        { success: true, message: "Admission updated successfully", admission: { id, ...updated } },
        { status: 200 }
    );
}

export async function DELETE(request, { params }) {
    const auth = getAuthContext(request);
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (auth.role !== "admin") {
        return Response.json({ error: "Only admin can delete admission records" }, { status: 403 });
    }

    const { id } = await params;
    const db = getAdminDb();
    const snapshot = await db.ref(`admissions/${id}`).get();
    if (!snapshot.exists()) {
        return Response.json({ error: "Admission not found" }, { status: 404 });
    }

    const admission = snapshot.val();
    const docs = admission?.documents || {};

    for (const key of Object.keys(docs)) {
        const doc = docs[key];
        if (doc?.publicId) {
            await deleteCloudinaryAsset(doc.publicId, doc.resourceType || "auto");
        }
    }

    await db.ref(`admissions/${id}`).remove();

    return Response.json({ success: true, message: "Admission deleted successfully" }, { status: 200 });
}
