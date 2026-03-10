import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

const ALLOWED_CATEGORIES = new Set(["annualday", "cultural", "picnic", "scienceexhibition"]);

function normalizeCategory(value) {
    return String(value || "").trim().toLowerCase();
}

function toEventPayload(record) {
    return {
        id: record?.id,
        title: record?.title || "",
        description: record?.description || "",
        category: record?.category || "",
        date: record?.date || "",
        imageUrl: record?.imageUrl || "",
        imagePublicId: record?.imagePublicId || "",
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = normalizeCategory(searchParams.get("category"));

        if (category && !ALLOWED_CATEGORIES.has(category)) {
            return Response.json(
                { error: "Invalid category" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const snapshot = await db.ref("events_items").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, events: [] }, { status: 200 });
        }

        const map = snapshot.val() || {};
        const events = Object.entries(map)
            .map(([id, value]) => toEventPayload({ id, ...value }))
            .filter((e) => !category || e.category === category)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return Response.json({ success: true, events }, { status: 200 });
    } catch (error) {
        console.error("Events GET error:", error);
        return Response.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const category = normalizeCategory(formData.get("category"));
        const date = String(formData.get("date") || "").trim();
        const imageFile = formData.get("image");

        if (!title || !description || !category || !imageFile) {
            return Response.json(
                { error: "Title, description, category, and image are required" },
                { status: 400 }
            );
        }

        if (!ALLOWED_CATEGORIES.has(category)) {
            return Response.json({ error: "Invalid category" }, { status: 400 });
        }

        if (!imageFile.type?.startsWith("image/")) {
            return Response.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadBufferToCloudinary(buffer, `college/events/${category}`);

        const db = getAdminDb();
        const newRef = db.ref("events_items").push();
        const createdAt = new Date().toISOString();

        const event = { title, description, category, date, imageUrl: uploadResult.secure_url, imagePublicId: uploadResult.public_id, createdAt };
        await newRef.set(event);

        return Response.json(
            { success: true, message: "Event added successfully", event: toEventPayload({ id: newRef.key, ...event }) },
            { status: 201 }
        );
    } catch (error) {
        console.error("Events POST error:", error);
        return Response.json({ error: error.message || "Failed to add event" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();

        const id = String(formData.get("id") || "").trim();
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const category = normalizeCategory(formData.get("category"));
        const date = String(formData.get("date") || "").trim();
        const imageFile = formData.get("image");

        if (!id || !title || !description || !category) {
            return Response.json(
                { error: "ID, title, description, and category are required" },
                { status: 400 }
            );
        }

        if (!ALLOWED_CATEGORIES.has(category)) {
            return Response.json({ error: "Invalid category" }, { status: 400 });
        }

        const db = getAdminDb();
        const ref = db.ref(`events_items/${id}`);
        const snapshot = await ref.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        let imageUrl = existing.imageUrl || "";
        let imagePublicId = existing.imagePublicId || "";

        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type?.startsWith("image/")) {
                return Response.json({ error: "Only image files are allowed" }, { status: 400 });
            }
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadBufferToCloudinary(buffer, `college/events/${category}`);

            if (existing.imagePublicId) {
                await deleteCloudinaryImage(existing.imagePublicId);
            }

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updated = { ...existing, title, description, category, date, imageUrl, imagePublicId, updatedAt: new Date().toISOString() };
        await ref.update(updated);

        return Response.json(
            { success: true, message: "Event updated successfully", event: toEventPayload({ id, ...updated }) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Events PUT error:", error);
        return Response.json({ error: error.message || "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Event ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const ref = db.ref(`events_items/${id}`);
        const snapshot = await ref.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        if (existing.imagePublicId) {
            await deleteCloudinaryImage(existing.imagePublicId);
        }

        await ref.remove();

        return Response.json({ success: true, message: "Event deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Events DELETE error:", error);
        return Response.json({ error: error.message || "Failed to delete event" }, { status: 500 });
    }
}
