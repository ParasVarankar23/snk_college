import { sendSignupEmail } from "@/lib/emailService";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

const ALLOWED_ASSIGNMENTS = new Set(["science", "commerce", "arts"]);
const ALLOWED_CLASSES = new Set(["11th", "12th", "both"]);

function normalizeAssignment(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeClass(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
    return String(value || "").replaceAll(/\D/g, "");
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeSubjectList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || "").trim())
            .filter(Boolean);
    }

    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function toStaffPayload(record) {
    return {
        id: record?.id,
        authUid: record?.authUid || "",
        name: record?.name || "",
        email: record?.email || "",
        phoneNumber: record?.phoneNumber || "",
        assignDepartment: record?.assignDepartment || "",
        classAssigned: record?.classAssigned || "",
        subjects: Array.isArray(record?.subjects) ? record.subjects : [],
        createdAt: record?.createdAt || "",
        updatedAt: record?.updatedAt || "",
    };
}

function generateTeacherPassword(name) {
    const cleanedName = String(name || "teacher")
        .replaceAll(/[^a-zA-Z]/g, "");

    const rawPrefix = cleanedName
        .slice(0, 4)
        .padEnd(4, "x");

    const prefix = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1).toLowerCase();
    const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const symbols = ["!", "@", "#", "$"];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    return `${prefix}${digits}${symbol}`;
}

function isUserNotFoundError(error) {
    return error?.code === "auth/user-not-found" || error?.errorInfo?.code === "auth/user-not-found";
}

async function upsertTeacherAuthAndProfile({
    adminAuth,
    db,
    email,
    name,
    phoneNumber,
    assignDepartment,
    existingAuthUid,
    issueTemporaryPassword = false,
}) {
    let authUser = null;
    let temporaryPassword = "";

    if (existingAuthUid) {
        authUser = await adminAuth.getUser(existingAuthUid);
    } else {
        try {
            authUser = await adminAuth.getUserByEmail(email);
        } catch (error) {
            if (!isUserNotFoundError(error)) {
                throw error;
            }
        }
    }

    if (!authUser) {
        temporaryPassword = generateTeacherPassword(name);
        authUser = await adminAuth.createUser({
            email,
            password: temporaryPassword,
            displayName: name,
        });
    } else if (issueTemporaryPassword) {
        temporaryPassword = generateTeacherPassword(name);
    }

    const uid = authUser.uid;
    const profileRef = db.ref(`users/${uid}`);
    const profileSnapshot = await profileRef.get();
    const existingProfile = profileSnapshot.exists() ? profileSnapshot.val() || {} : {};
    const existingRole = normalizeClass(existingProfile?.role);

    if (existingRole === "admin") {
        throw new Error("This email is already mapped to an admin account");
    }

    const updatePayload = {
        email,
        displayName: name,
    };

    if (temporaryPassword) {
        updatePayload.password = temporaryPassword;
    }

    await adminAuth.updateUser(uid, updatePayload);

    await profileRef.update({
        name,
        email,
        phone: phoneNumber,
        role: "teacher",
        department: assignDepartment,
        updatedAt: new Date().toISOString(),
        ...(existingProfile?.createdAt ? {} : { createdAt: new Date().toISOString() }),
    });

    return { uid, temporaryPassword };
}

function validateStaffInput(body, { requireId = false } = {}) {
    const id = String(body?.id || "").trim();
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);
    const phoneNumber = normalizePhone(body?.phoneNumber);
    const assignDepartment = normalizeAssignment(body?.assignDepartment);
    const classAssigned = normalizeClass(body?.classAssigned);
    const subjects = normalizeSubjectList(body?.subjects);

    if (requireId && !id) {
        return { error: "Staff ID is required", status: 400 };
    }

    if (!name || !email || !phoneNumber || !assignDepartment || !classAssigned || subjects.length === 0) {
        return {
            error: "Name, email, phone number, assign, class, and at least one subject are required",
            status: 400,
        };
    }

    if (!isValidEmail(email)) {
        return { error: "Please enter a valid email address", status: 400 };
    }

    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
        return { error: "Phone number must be between 10 and 15 digits", status: 400 };
    }

    if (!ALLOWED_ASSIGNMENTS.has(assignDepartment)) {
        return { error: "Invalid assign value. Use science, commerce, or arts.", status: 400 };
    }

    if (!ALLOWED_CLASSES.has(classAssigned)) {
        return { error: "Invalid class value. Use 11th, 12th, or both.", status: 400 };
    }

    return {
        data: {
            id,
            name,
            email,
            phoneNumber,
            assignDepartment,
            classAssigned,
            subjects,
        },
        error: null,
    };
}

function findDuplicateStaff(staffMap, { email, phoneNumber }, excludeId = "") {
    const normalizedExcludeId = String(excludeId || "").trim();

    return Object.entries(staffMap || {}).find(([recordId, value]) => {
        if (normalizedExcludeId && recordId === normalizedExcludeId) {
            return false;
        }

        const currentEmail = normalizeEmail(value?.email);
        const currentPhone = normalizePhone(value?.phoneNumber);
        return currentEmail === email || currentPhone === phoneNumber;
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const assignDepartmentFilter = normalizeAssignment(searchParams.get("assign"));
        const classFilter = normalizeClass(searchParams.get("class"));
        const searchTerm = String(searchParams.get("search") || "").trim().toLowerCase();

        const db = getAdminDb();
        const snapshot = await db.ref("staff").get();

        if (!snapshot.exists()) {
            return Response.json({ success: true, staff: [] }, { status: 200 });
        }

        const staffMap = snapshot.val() || {};
        const staff = Object.entries(staffMap)
            .map(([id, value]) => toStaffPayload({ id, ...value }))
            .filter((member) => {
                const matchesAssign = !assignDepartmentFilter || member.assignDepartment === assignDepartmentFilter;
                const matchesClass = !classFilter || member.classAssigned === classFilter;
                const matchesSearch =
                    !searchTerm ||
                    [
                        member.name,
                        member.email,
                        member.phoneNumber,
                        member.assignDepartment,
                        member.classAssigned,
                        member.subjects.join(" "),
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(searchTerm);

                return matchesAssign && matchesClass && matchesSearch;
            })
            .sort((a, b) =>
                String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
            );

        return Response.json({ success: true, staff }, { status: 200 });
    } catch (error) {
        console.error("Staff GET error:", error);
        return Response.json({ error: "Failed to fetch staff data" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const validated = validateStaffInput(body);

        if (validated.error) {
            return Response.json({ error: validated.error }, { status: validated.status });
        }

        const db = getAdminDb();
        const adminAuth = getAdminAuth();
        const snapshot = await db.ref("staff").get();
        const existingMap = snapshot.exists() ? snapshot.val() : {};
        const duplicate = findDuplicateStaff(existingMap, validated.data);

        if (duplicate) {
            return Response.json(
                { error: "A staff record with this email or phone number already exists" },
                { status: 409 }
            );
        }

        const account = await upsertTeacherAuthAndProfile({
            adminAuth,
            db,
            email: validated.data.email,
            name: validated.data.name,
            phoneNumber: validated.data.phoneNumber,
            assignDepartment: validated.data.assignDepartment,
            issueTemporaryPassword: true,
        });

        const newRef = db.ref("staff").push();
        const nowIso = new Date().toISOString();

        const payload = {
            authUid: account.uid,
            name: validated.data.name,
            email: validated.data.email,
            phoneNumber: validated.data.phoneNumber,
            assignDepartment: validated.data.assignDepartment,
            classAssigned: validated.data.classAssigned,
            subjects: validated.data.subjects,
            createdAt: nowIso,
            updatedAt: nowIso,
        };

        await newRef.set(payload);

        let emailWarning = "";
        if (account.temporaryPassword) {
            try {
                await sendSignupEmail(
                    validated.data.email,
                    validated.data.name,
                    account.temporaryPassword
                );
                console.info("Staff credentials email sent:", {
                    email: validated.data.email,
                    staffName: validated.data.name,
                });
            } catch (emailError) {
                console.error("Staff signup email error:", emailError);
                console.warn("Staff credentials email failed:", {
                    email: validated.data.email,
                    staffName: validated.data.name,
                });
                emailWarning = "Staff created, but failed to send credentials email";
            }
        }

        return Response.json(
            {
                success: true,
                message: "Staff registered successfully",
                staff: toStaffPayload({ id: newRef.key, ...payload }),
                warning: emailWarning || null,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Staff POST error:", error);
        return Response.json(
            { error: error.message || "Failed to register staff" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const validated = validateStaffInput(body, { requireId: true });

        if (validated.error) {
            return Response.json({ error: validated.error }, { status: validated.status });
        }

        const db = getAdminDb();
        const adminAuth = getAdminAuth();
        const staffRef = db.ref(`staff/${validated.data.id}`);
        const existingSnapshot = await staffRef.get();

        if (!existingSnapshot.exists()) {
            return Response.json({ error: "Staff record not found" }, { status: 404 });
        }

        const allSnapshot = await db.ref("staff").get();
        const allMap = allSnapshot.exists() ? allSnapshot.val() : {};
        const duplicate = findDuplicateStaff(allMap, validated.data, validated.data.id);

        if (duplicate) {
            return Response.json(
                { error: "Another staff record already uses this email or phone number" },
                { status: 409 }
            );
        }

        const existing = existingSnapshot.val() || {};

        const account = await upsertTeacherAuthAndProfile({
            adminAuth,
            db,
            email: validated.data.email,
            name: validated.data.name,
            phoneNumber: validated.data.phoneNumber,
            assignDepartment: validated.data.assignDepartment,
            existingAuthUid: existing.authUid,
        });

        const updatedPayload = {
            ...existing,
            authUid: account.uid,
            name: validated.data.name,
            email: validated.data.email,
            phoneNumber: validated.data.phoneNumber,
            assignDepartment: validated.data.assignDepartment,
            classAssigned: validated.data.classAssigned,
            subjects: validated.data.subjects,
            updatedAt: new Date().toISOString(),
        };

        await staffRef.set(updatedPayload);

        return Response.json(
            {
                success: true,
                message: "Staff updated successfully",
                staff: toStaffPayload({ id: validated.data.id, ...updatedPayload }),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Staff PUT error:", error);
        return Response.json(
            { error: error.message || "Failed to update staff" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = String(searchParams.get("id") || "").trim();

        if (!id) {
            return Response.json({ error: "Staff ID is required" }, { status: 400 });
        }

        const db = getAdminDb();
        const staffRef = db.ref(`staff/${id}`);
        const snapshot = await staffRef.get();

        if (!snapshot.exists()) {
            return Response.json({ error: "Staff record not found" }, { status: 404 });
        }

        const staff = snapshot.val() || {};
        await staffRef.remove();

        if (staff.authUid) {
            await db.ref(`users/${staff.authUid}`).remove();
            try {
                await getAdminAuth().deleteUser(staff.authUid);
            } catch (error) {
                if (!isUserNotFoundError(error)) {
                    throw error;
                }
            }
        }

        return Response.json(
            { success: true, message: "Staff record deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Staff DELETE error:", error);
        return Response.json(
            { error: error.message || "Failed to delete staff" },
            { status: 500 }
        );
    }
}
