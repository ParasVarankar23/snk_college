import { deleteCloudinaryAsset, uploadAssetToCloudinary } from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/firebaseAdmin";

const ALLOWED_STANDARDS = new Set(["11th", "12th"]);
const ALLOWED_DEPARTMENTS = new Set(["arts", "commerce", "science"]);

function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
}

function parseSubjects(rawSubjects) {
    try {
        const parsed = JSON.parse(String(rawSubjects || "[]"));
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((subject) => ({
                name: String(subject?.name || "").trim(),
                type: String(subject?.type || "").trim(),
                description: String(subject?.description || "").trim(),
            }))
            .filter((subject) => subject.name && subject.type && subject.description);
    } catch {
        return [];
    }
}

function buildAcademicPayload(record) {
    return {
        id: record?.id,
        standard: record?.standard || "",
        department: record?.department || "",
        title: record?.title || "",
        subtitle: record?.subtitle || "",
        overviewPrimary: record?.overviewPrimary || "",
        overviewSecondary: record?.overviewSecondary || "",
        syllabusUrl: record?.syllabusUrl || "",
        syllabusPublicId: record?.syllabusPublicId || "",
        syllabusFileName: record?.syllabusFileName || "",
        syllabusResourceType: record?.syllabusResourceType || "raw",
        subjects: Array.isArray(record?.subjects) ? record.subjects : [],
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

function matchesSearch(record, search) {
    if (!search) return true;

    const subjectText = (record.subjects || [])
        .map((subject) => `${subject.name} ${subject.type} ${subject.description}`)
        .join(" ");

    return [
        record.standard,
        record.department,
        record.title,
        record.subtitle,
        record.overviewPrimary,
        record.overviewSecondary,
        subjectText,
    ]
        .join(" ")
        .toLowerCase()
        .includes(search);
}

async function ensureUniqueCombination(db, standard, department, excludeId = "") {
    const snapshot = await db.ref("academics_items").get();
    if (!snapshot.exists()) return null;

    const records = snapshot.val() || {};
    return Object.entries(records).find(([id, value]) => {
        if (excludeId && id === excludeId) return false;
        return value?.standard === standard && value?.department === department;
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const standard = normalizeValue(searchParams.get("standard"));
        const department = normalizeValue(searchParams.get("department"));
        const search = normalizeValue(searchParams.get("search"));

        if (standard && !ALLOWED_STANDARDS.has(standard)) {
            return Response.json({ error: "Invalid standard. Use 11th or 12th." }, { status: 400 });
        }

        if (department && !ALLOWED_DEPARTMENTS.has(department)) {
            return Response.json({ error: "Invalid department. Use arts, commerce, or science." }, { status: 400 });
        }

        const db = getAdminDb();
        const snapshot = await db.ref("academics_items").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, courses: [] }, { status: 200 });
        }

        const records = snapshot.val() || {};
        const courses = Object.entries(records)
            .map(([id, value]) => buildAcademicPayload({ id, ...value }))
            .filter((course) => !standard || course.standard === standard)
            .filter((course) => !department || course.department === department)
            .filter((course) => matchesSearch(course, search))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return Response.json({ success: true, courses }, { status: 200 });
    } catch (error) {
        console.error("Academics GET error:", error);
        return Response.json({ error: "Failed to fetch academics" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const standard = normalizeValue(formData.get("standard"));
        const department = normalizeValue(formData.get("department"));
        const title = String(formData.get("title") || "").trim();
        const subtitle = String(formData.get("subtitle") || "").trim();
        const overviewPrimary = String(formData.get("overviewPrimary") || "").trim();
        const overviewSecondary = String(formData.get("overviewSecondary") || "").trim();
        const subjects = parseSubjects(formData.get("subjects"));
        const syllabusFile = formData.get("syllabus");

        if (!ALLOWED_STANDARDS.has(standard) || !ALLOWED_DEPARTMENTS.has(department)) {
            return Response.json({ error: "Valid standard and department are required" }, { status: 400 });
        }

        if (!title || !subtitle || !overviewPrimary || !overviewSecondary || subjects.length === 0 || !syllabusFile) {
            return Response.json(
                { error: "Title, subtitle, both overview sections, subjects, and syllabus are required" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const existingRecord = await ensureUniqueCombination(db, standard, department);
        if (existingRecord) {
            return Response.json(
                { error: `A course already exists for ${standard} ${department}` },
                { status: 400 }
            );
        }

        const syllabusBuffer = Buffer.from(await syllabusFile.arrayBuffer());
        const uploadResult = await uploadAssetToCloudinary({
            buffer: syllabusBuffer,
            folder: `college/academics/${standard}-${department}`,
            mimeType: syllabusFile.type || "application/pdf",
            resourceType: "raw",
        });

        const newRef = db.ref("academics_items").push();
        const createdAt = new Date().toISOString();

        const course = {
            standard,
            department,
            title,
            subtitle,
            overviewPrimary,
            overviewSecondary,
            subjects,
            syllabusUrl: uploadResult.secure_url,
            syllabusPublicId: uploadResult.public_id,
            syllabusFileName: syllabusFile.name || "syllabus.pdf",
            syllabusResourceType: uploadResult.resource_type || "raw",
            createdAt,
        };

        await newRef.set(course);

        return Response.json(
            {
                success: true,
                message: "Academic course added successfully",
                course: buildAcademicPayload({ id: newRef.key, ...course }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Academics POST error:", error);
        return Response.json({ error: error.message || "Failed to add academic course" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();

        const id = String(formData.get("id") || "").trim();
        const standard = normalizeValue(formData.get("standard"));
        const department = normalizeValue(formData.get("department"));
        const title = String(formData.get("title") || "").trim();
        const subtitle = String(formData.get("subtitle") || "").trim();
        const overviewPrimary = String(formData.get("overviewPrimary") || "").trim();
        const overviewSecondary = String(formData.get("overviewSecondary") || "").trim();
        const subjects = parseSubjects(formData.get("subjects"));
        const syllabusFile = formData.get("syllabus");

        if (!id || !ALLOWED_STANDARDS.has(standard) || !ALLOWED_DEPARTMENTS.has(department)) {
            return Response.json({ error: "Valid ID, standard, and department are required" }, { status: 400 });
        }

        if (!title || !subtitle || !overviewPrimary || !overviewSecondary || subjects.length === 0) {
            return Response.json(
                { error: "Title, subtitle, both overview sections, and subjects are required" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const courseRef = db.ref(`academics_items/${id}`);
        const snapshot = await courseRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Academic course not found" }, { status: 404 });
        }

        const existingRecord = await ensureUniqueCombination(db, standard, department, id);
        if (existingRecord) {
            return Response.json(
                { error: `Another course already exists for ${standard} ${department}` },
                { status: 400 }
            );
        }

        const existing = snapshot.val() || {};
        let syllabusUrl = existing.syllabusUrl || "";
        let syllabusPublicId = existing.syllabusPublicId || "";
        let syllabusFileName = existing.syllabusFileName || "";
        let syllabusResourceType = existing.syllabusResourceType || "raw";

        if (syllabusFile && syllabusFile.size > 0) {
            const syllabusBuffer = Buffer.from(await syllabusFile.arrayBuffer());
            const uploadResult = await uploadAssetToCloudinary({
                buffer: syllabusBuffer,
                folder: `college/academics/${standard}-${department}`,
                mimeType: syllabusFile.type || "application/pdf",
                resourceType: "raw",
            });

            if (existing.syllabusPublicId) {
                await deleteCloudinaryAsset(existing.syllabusPublicId, existing.syllabusResourceType || "raw");
            }

            syllabusUrl = uploadResult.secure_url;
            syllabusPublicId = uploadResult.public_id;
            syllabusFileName = syllabusFile.name || existing.syllabusFileName || "syllabus.pdf";
            syllabusResourceType = uploadResult.resource_type || "raw";
        }

        const updatedCourse = {
            ...existing,
            standard,
            department,
            title,
            subtitle,
            overviewPrimary,
            overviewSecondary,
            subjects,
            syllabusUrl,
            syllabusPublicId,
            syllabusFileName,
            syllabusResourceType,
            updatedAt: new Date().toISOString(),
        };

        await courseRef.set(updatedCourse);

        return Response.json(
            {
                success: true,
                message: "Academic course updated successfully",
                course: buildAcademicPayload({ id, ...updatedCourse }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Academics PUT error:", error);
        return Response.json({ error: error.message || "Failed to update academic course" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Academic course ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const courseRef = db.ref(`academics_items/${id}`);
        const snapshot = await courseRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Academic course not found" }, { status: 404 });
        }

        const existing = snapshot.val() || {};

        if (existing.syllabusPublicId) {
            await deleteCloudinaryAsset(existing.syllabusPublicId, existing.syllabusResourceType || "raw");
        }

        await courseRef.remove();

        return Response.json({ success: true, message: "Academic course deleted permanently" }, { status: 200 });
    } catch (error) {
        console.error("Academics DELETE error:", error);
        return Response.json({ error: error.message || "Failed to delete academic course" }, { status: 500 });
    }
}
