import { getAdminDb } from "@/lib/firebaseAdmin";

function toContactPayload(record) {
    return {
        id: record?.id,
        name: record?.name || "",
        email: record?.email || "",
        phone: record?.phone || "",
        course: record?.course || "",
        department: record?.department || "",
        message: record?.message || "",
        status: record?.status || "new",
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

export async function GET() {
    try {
        const db = getAdminDb();
        const snapshot = await db.ref("contact_inquiries").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, inquiries: [] }, { status: 200 });
        }

        const map = snapshot.val() || {};
        const inquiries = Object.entries(map)
            .map(([id, value]) => toContactPayload({ id, ...value }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return Response.json({ success: true, inquiries }, { status: 200 });
    } catch (error) {
        console.error("Contact GET error:", error);
        return Response.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();
        const phone = String(body.phone || "").trim();
        const course = String(body.course || "").trim();
        const department = String(body.department || "").trim();
        const message = String(body.message || "").trim();

        if (!name || !email || !phone || !course || !department) {
            return Response.json(
                { error: "Name, email, phone, course, and department are required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json({ error: "Invalid email address" }, { status: 400 });
        }

        const db = getAdminDb();
        const newRef = db.ref("contact_inquiries").push();
        const createdAt = new Date().toISOString();

        const inquiry = { name, email, phone, course, department, message, status: "new", createdAt };
        await newRef.set(inquiry);

        return Response.json(
            {
                success: true,
                message: "Inquiry submitted successfully",
                inquiry: toContactPayload({ id: newRef.key, ...inquiry }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Contact POST error:", error);
        return Response.json(
            { error: error.message || "Failed to submit inquiry" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();

        const id = String(body.id || "").trim();
        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();
        const phone = String(body.phone || "").trim();
        const course = String(body.course || "").trim();
        const department = String(body.department || "").trim();
        const message = String(body.message || "").trim();
        const status = String(body.status || "new").trim();

        if (!id || !name || !email || !phone || !course || !department) {
            return Response.json(
                { error: "ID, name, email, phone, course, and department are required" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const ref = db.ref(`contact_inquiries/${id}`);
        const snapshot = await ref.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Inquiry not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};
        const updated = {
            ...existing,
            name,
            email,
            phone,
            course,
            department,
            message,
            status,
            updatedAt: new Date().toISOString(),
        };

        await ref.update(updated);

        return Response.json(
            {
                success: true,
                message: "Inquiry updated successfully",
                inquiry: toContactPayload({ id, ...updated }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Contact PUT error:", error);
        return Response.json(
            { error: error.message || "Failed to update inquiry" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Inquiry ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const ref = db.ref(`contact_inquiries/${id}`);
        const snapshot = await ref.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Inquiry not found" }, { status: 404 });
        }

        await ref.remove();

        return Response.json(
            { success: true, message: "Inquiry deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Contact DELETE error:", error);
        return Response.json(
            { error: error.message || "Failed to delete inquiry" },
            { status: 500 }
        );
    }
}
