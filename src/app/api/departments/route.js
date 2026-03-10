import { deleteCloudinaryImage, uploadBufferToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

const ALLOWED_DEPARTMENTS = new Set(["science", "commerce", "arts"]);

function normalizeDepartment(value) {
    return String(value || "").trim().toLowerCase();
}

function toTeacherPayload(record) {
    return {
        id: record?.id,
        name: record?.name || "",
        subject: record?.subject || "",
        education: record?.education || "",
        department: record?.department || "",
        imageUrl: record?.imageUrl || "",
        imagePublicId: record?.imagePublicId || "",
        createdAt: record?.createdAt || "",
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const department = normalizeDepartment(searchParams.get("department"));

        if (department && !ALLOWED_DEPARTMENTS.has(department)) {
            return Response.json(
                { error: "Invalid department. Use science, commerce, or arts." },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const snapshot = await db.ref("department_teachers").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, teachers: [] }, { status: 200 });
        }

        const teachersMap = snapshot.val() || {};
        const teachers = Object.entries(teachersMap)
            .map(([id, value]) => toTeacherPayload({ id, ...value }))
            .filter((teacher) => !department || teacher.department === department)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return Response.json({ success: true, teachers }, { status: 200 });
    } catch (error) {
        console.error("Departments GET error:", error);
        return Response.json(
            { error: "Failed to fetch teachers" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const subject = String(formData.get("subject") || "").trim();
        const education = String(formData.get("education") || "").trim();
        const department = normalizeDepartment(formData.get("department"));
        const imageFile = formData.get("image");

        if (!name || !subject || !education || !department || !imageFile) {
            return Response.json(
                { error: "Name, subject, education, department, and image are required" },
                { status: 400 }
            );
        }

        if (!ALLOWED_DEPARTMENTS.has(department)) {
            return Response.json(
                { error: "Invalid department. Use science, commerce, or arts." },
                { status: 400 }
            );
        }

        if (!imageFile.type?.startsWith("image/")) {
            return Response.json(
                { error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadBufferToCloudinary(buffer, `college/departments/${department}`);

        const db = getAdminDb();
        const newRef = db.ref("department_teachers").push();
        const createdAt = new Date().toISOString();

        const teacher = {
            name,
            subject,
            education,
            department,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
            createdAt,
        };

        await newRef.set(teacher);

        return Response.json(
            {
                success: true,
                message: "Teacher added successfully",
                teacher: toTeacherPayload({ id: newRef.key, ...teacher }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Departments POST error:", error);
        return Response.json(
            { error: error.message || "Failed to add teacher" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();

        const id = String(formData.get("id") || "").trim();
        const name = String(formData.get("name") || "").trim();
        const subject = String(formData.get("subject") || "").trim();
        const education = String(formData.get("education") || "").trim();
        const department = normalizeDepartment(formData.get("department"));
        const imageFile = formData.get("image");

        if (!id || !name || !subject || !education || !department) {
            return Response.json(
                { error: "ID, name, subject, education, and department are required" },
                { status: 400 }
            );
        }

        if (!ALLOWED_DEPARTMENTS.has(department)) {
            return Response.json(
                { error: "Invalid department. Use science, commerce, or arts." },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const teacherRef = db.ref(`department_teachers/${id}`);
        const snapshot = await teacherRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Teacher not found" }, { status: 404 });
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
            const uploadResult = await uploadBufferToCloudinary(
                buffer,
                `college/departments/${department}`
            );

            if (existing.imagePublicId) {
                await deleteCloudinaryImage(existing.imagePublicId);
            }

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updatedTeacher = {
            ...existing,
            name,
            subject,
            education,
            department,
            imageUrl,
            imagePublicId,
            updatedAt: new Date().toISOString(),
        };

        await teacherRef.set(updatedTeacher);

        return Response.json(
            {
                success: true,
                message: "Teacher updated successfully",
                teacher: toTeacherPayload({ id, ...updatedTeacher }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Departments PUT error:", error);
        return Response.json(
            { error: error.message || "Failed to update teacher" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const teacherRef = db.ref(`department_teachers/${id}`);
        const snapshot = await teacherRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Teacher not found" }, { status: 404 });
        }

        const teacher = snapshot.val() || {};

        if (teacher.imagePublicId) {
            await deleteCloudinaryImage(teacher.imagePublicId);
        }

        await teacherRef.remove();

        return Response.json(
            { success: true, message: "Teacher permanently deleted" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Departments DELETE error:", error);
        return Response.json(
            { error: error.message || "Failed to delete teacher" },
            { status: 500 }
        );
    }
}
