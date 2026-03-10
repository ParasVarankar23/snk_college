import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

function normalizeSearch(value) {
    return String(value || "").trim().toLowerCase();
}

function toGalleryPayload(record) {
    return {
        id: record?.id,
        description: record?.description || "",
        imageUrl: record?.imageUrl || "",
        imagePublicId: record?.imagePublicId || "",
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = normalizeSearch(searchParams.get("search"));

        const db = getAdminDb();
        const snapshot = await db.ref("gallery_items").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, items: [] }, { status: 200 });
        }

        const itemsMap = snapshot.val() || {};
        const items = Object.entries(itemsMap)
            .map(([id, value]) => toGalleryPayload({ id, ...value }))
            .filter((item) => !search || item.description.toLowerCase().includes(search))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return Response.json({ success: true, items }, { status: 200 });
    } catch (error) {
        console.error("Gallery GET error:", error);
        return Response.json({ error: "Failed to fetch gallery items" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const description = String(formData.get("description") || "").trim();
        const imageFile = formData.get("image");

        if (!description || !imageFile) {
            return Response.json(
                { error: "Description and image are required" },
                { status: 400 }
            );
        }

        if (!imageFile.type?.startsWith("image/")) {
            return Response.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadBufferToCloudinary(buffer, "college/gallery");

        const db = getAdminDb();
        const newRef = db.ref("gallery_items").push();
        const createdAt = new Date().toISOString();

        const galleryItem = {
            description,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
            createdAt,
        };

        await newRef.set(galleryItem);

        return Response.json(
            {
                success: true,
                message: "Gallery image added successfully",
                item: toGalleryPayload({ id: newRef.key, ...galleryItem }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Gallery POST error:", error);
        return Response.json({ error: error.message || "Failed to add gallery item" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();
        const id = String(formData.get("id") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const imageFile = formData.get("image");

        if (!id || !description) {
            return Response.json({ error: "ID and description are required" }, { status: 400 });
        }

        const db = getAdminDb();
        const itemRef = db.ref(`gallery_items/${id}`);
        const snapshot = await itemRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Gallery item not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        let imageUrl = existing.imageUrl || "";
        let imagePublicId = existing.imagePublicId || "";

        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type?.startsWith("image/")) {
                return Response.json({ error: "Only image files are allowed" }, { status: 400 });
            }

            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadBufferToCloudinary(buffer, "college/gallery");

            if (existing.imagePublicId) {
                await deleteCloudinaryImage(existing.imagePublicId);
            }

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updatedItem = {
            ...existing,
            description,
            imageUrl,
            imagePublicId,
            updatedAt: new Date().toISOString(),
        };

        await itemRef.set(updatedItem);

        return Response.json(
            {
                success: true,
                message: "Gallery item updated successfully",
                item: toGalleryPayload({ id, ...updatedItem }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Gallery PUT error:", error);
        return Response.json({ error: error.message || "Failed to update gallery item" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Gallery item ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const itemRef = db.ref(`gallery_items/${id}`);
        const snapshot = await itemRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Gallery item not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        if (existing.imagePublicId) {
            await deleteCloudinaryImage(existing.imagePublicId);
        }

        await itemRef.remove();

        return Response.json(
            { success: true, message: "Gallery item deleted permanently" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Gallery DELETE error:", error);
        return Response.json({ error: error.message || "Failed to delete gallery item" }, { status: 500 });
    }
}
