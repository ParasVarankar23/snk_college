import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

function toLeaderPayload(record) {
    return {
        id: record?.id || "",
        name: record?.name || "",
        role: record?.role || "",
        frontDesc: record?.frontDesc || "",
        backDesc: record?.backDesc || "",
        imageUrl: record?.imageUrl || "",
        imagePublicId: record?.imagePublicId || "",
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

export async function GET() {
    try {
        const db = getAdminDb();
        const snapshot = await db.ref("leadership_items").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, leaders: [] }, { status: 200 });
        }

        const map = snapshot.val() || {};
        const leaders = Object.entries(map)
            .map(([id, value]) => toLeaderPayload({ id, ...value }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return Response.json({ success: true, leaders }, { status: 200 });
    } catch (error) {
        console.error("Leadership GET error:", error);
        return Response.json({ error: "Failed to fetch leadership data" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const role = String(formData.get("role") || "").trim();
        const frontDesc = String(formData.get("frontDesc") || "").trim();
        const backDesc = String(formData.get("backDesc") || "").trim();
        const imageFile = formData.get("image");

        if (!name || !role || !frontDesc || !backDesc || !imageFile) {
            return Response.json(
                { error: "Name, role, front description, back description, and image are required" },
                { status: 400 }
            );
        }

        if (!imageFile.type?.startsWith("image/")) {
            return Response.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadBufferToCloudinary(buffer, "college/leadership");

        const db = getAdminDb();
        const newRef = db.ref("leadership_items").push();
        const createdAt = new Date().toISOString();

        const leader = {
            name,
            role,
            frontDesc,
            backDesc,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
            createdAt,
        };

        await newRef.set(leader);

        return Response.json(
            {
                success: true,
                message: "Leadership profile added successfully",
                leader: toLeaderPayload({ id: newRef.key, ...leader }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Leadership POST error:", error);
        return Response.json({ error: error.message || "Failed to add leadership profile" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();

        const id = String(formData.get("id") || "").trim();
        const name = String(formData.get("name") || "").trim();
        const role = String(formData.get("role") || "").trim();
        const frontDesc = String(formData.get("frontDesc") || "").trim();
        const backDesc = String(formData.get("backDesc") || "").trim();
        const imageFile = formData.get("image");

        if (!id || !name || !role || !frontDesc || !backDesc) {
            return Response.json(
                { error: "ID, name, role, front description, and back description are required" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const leaderRef = db.ref(`leadership_items/${id}`);
        const snapshot = await leaderRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Leadership profile not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        let imageUrl = existing.imageUrl || "";
        let imagePublicId = existing.imagePublicId || "";

        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type?.startsWith("image/")) {
                return Response.json({ error: "Only image files are allowed" }, { status: 400 });
            }

            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadBufferToCloudinary(buffer, "college/leadership");

            if (existing.imagePublicId) {
                await deleteCloudinaryImage(existing.imagePublicId);
            }

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updated = {
            ...existing,
            name,
            role,
            frontDesc,
            backDesc,
            imageUrl,
            imagePublicId,
            updatedAt: new Date().toISOString(),
        };

        await leaderRef.set(updated);

        return Response.json(
            {
                success: true,
                message: "Leadership profile updated successfully",
                leader: toLeaderPayload({ id, ...updated }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Leadership PUT error:", error);
        return Response.json({ error: error.message || "Failed to update leadership profile" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Leader ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const leaderRef = db.ref(`leadership_items/${id}`);
        const snapshot = await leaderRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Leadership profile not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        if (existing.imagePublicId) {
            await deleteCloudinaryImage(existing.imagePublicId);
        }

        await leaderRef.remove();

        return Response.json(
            { success: true, message: "Leadership profile deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Leadership DELETE error:", error);
        return Response.json({ error: error.message || "Failed to delete leadership profile" }, { status: 500 });
    }
}
