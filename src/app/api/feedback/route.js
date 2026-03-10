import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

function toFeedbackPayload(record) {
    return {
        id: record?.id,
        name: record?.name || "",
        rating: record?.rating || 0,
        description: record?.description || "",
        imageUrl: record?.imageUrl || "",
        imagePublicId: record?.imagePublicId || "",
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

export async function GET() {
    try {
        const db = getAdminDb();
        const snapshot = await db.ref("feedback_items").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, feedbacks: [] }, { status: 200 });
        }

        const feedbackMap = snapshot.val() || {};
        const feedbacks = Object.entries(feedbackMap)
            .map(([id, value]) => toFeedbackPayload({ id, ...value }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return Response.json({ success: true, feedbacks }, { status: 200 });
    } catch (error) {
        console.error("Feedback GET error:", error);
        return Response.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const rating = Number.parseInt(formData.get("rating") || "0", 10);
        const description = String(formData.get("description") || "").trim();
        const imageFile = formData.get("image");

        if (!name || !rating || !description) {
            return Response.json(
                { error: "Name, rating, and description are required" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return Response.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        let imageUrl = "";
        let imagePublicId = "";

        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type?.startsWith("image/")) {
                return Response.json(
                    { error: "Only image files are allowed" },
                    { status: 400 }
                );
            }
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadBufferToCloudinary(buffer, "college/feedback");
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const db = getAdminDb();
        const newRef = db.ref("feedback_items").push();
        const createdAt = new Date().toISOString();

        const feedback = { name, rating, description, imageUrl, imagePublicId, createdAt };
        await newRef.set(feedback);

        return Response.json(
            {
                success: true,
                message: "Feedback submitted successfully",
                feedback: toFeedbackPayload({ id: newRef.key, ...feedback }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Feedback POST error:", error);
        return Response.json(
            { error: error.message || "Failed to submit feedback" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();

        const id = String(formData.get("id") || "").trim();
        const name = String(formData.get("name") || "").trim();
        const rating = Number.parseInt(formData.get("rating") || "0", 10);
        const description = String(formData.get("description") || "").trim();
        const imageFile = formData.get("image");

        if (!id || !name || !rating || !description) {
            return Response.json(
                { error: "ID, name, rating, and description are required" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return Response.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const feedbackRef = db.ref(`feedback_items/${id}`);
        const snapshot = await feedbackRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Feedback not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        let imageUrl = existing.imageUrl || "";
        let imagePublicId = existing.imagePublicId || "";

        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type?.startsWith("image/")) {
                return Response.json(
                    { error: "Only image files are allowed" },
                    { status: 400 }
                );
            }
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadBufferToCloudinary(buffer, "college/feedback");

            if (existing.imagePublicId) {
                await deleteCloudinaryImage(existing.imagePublicId);
            }

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updatedFeedback = {
            ...existing,
            name,
            rating,
            description,
            imageUrl,
            imagePublicId,
            updatedAt: new Date().toISOString(),
        };

        await feedbackRef.update(updatedFeedback);

        return Response.json(
            {
                success: true,
                message: "Feedback updated successfully",
                feedback: toFeedbackPayload({ id, ...updatedFeedback }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Feedback PUT error:", error);
        return Response.json(
            { error: error.message || "Failed to update feedback" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Feedback ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const feedbackRef = db.ref(`feedback_items/${id}`);
        const snapshot = await feedbackRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Feedback not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};

        if (existing.imagePublicId) {
            await deleteCloudinaryImage(existing.imagePublicId);
        }

        await feedbackRef.remove();

        return Response.json(
            { success: true, message: "Feedback deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Feedback DELETE error:", error);
        return Response.json(
            { error: error.message || "Failed to delete feedback" },
            { status: 500 }
        );
    }
}
