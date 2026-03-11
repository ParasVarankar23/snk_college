import { deleteCloudinaryAsset, uploadAssetToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";

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

function mapMeritRows(snapshotValue) {
    return Object.entries(snapshotValue || {})
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function GET() {
    try {
        const db = getAdminDb();
        const snapshot = await db.ref("merit_notices").get();
        const meritNotices = snapshot.exists() ? mapMeritRows(snapshot.val()) : [];
        return Response.json({ success: true, meritNotices }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message || "Failed to fetch merit notices" }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const collegeName = String(formData.get("collegeName") || "").trim();
        const file = formData.get("file");

        if (!title || !description || !collegeName) {
            return Response.json({ error: "Title, description, and college name are required" }, { status: 400 });
        }

        if (!file || typeof file === "string" || !file.name || file.size === 0) {
            return Response.json({ error: "PDF file is required" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return Response.json({ error: "Only PDF file is allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadAssetToCloudinary({
            buffer,
            folder: "college/merit",
            mimeType: file.type,
            resourceType: "auto",
        });

        const db = getAdminDb();
        const ref = db.ref("merit_notices").push();
        const nowIso = new Date().toISOString();

        const record = {
            title,
            description,
            collegeName,
            fileName: file.name,
            fileUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
            uploadedBy: auth.uid,
            createdAt: nowIso,
            updatedAt: nowIso,
        };

        await ref.set(record);

        return Response.json(
            {
                success: true,
                message: "Merit list uploaded successfully",
                meritNotice: { id: ref.key, ...record },
            },
            { status: 201 }
        );
    } catch (error) {
        return Response.json({ error: error.message || "Failed to upload merit list" }, { status: 500 });
    }
}

export async function DELETE(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Merit ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const meritRef = db.ref(`merit_notices/${id}`);
        const snapshot = await meritRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Merit record not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        if (existing.publicId) {
            await deleteCloudinaryAsset(existing.publicId, "raw");
        }

        await meritRef.remove();

        return Response.json({ success: true, message: "Merit record deleted successfully" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message || "Failed to delete merit record" }, { status: 500 });
    }
}
