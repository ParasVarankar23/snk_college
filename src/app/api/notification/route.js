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

function toUnixMs(value) {
    const parsed = new Date(value || "").getTime();
    return Number.isFinite(parsed) ? parsed : 0;
}

function sortByTimeDesc(a, b) {
    return toUnixMs(b.createdAt) - toUnixMs(a.createdAt);
}

function normalizeDepartment(value) {
    return String(value || "").trim().toLowerCase();
}

function formatDepartmentLabel(value) {
    const normalized = normalizeDepartment(value);
    if (!normalized) return "-";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function buildAdminNotifications({ feedbackMap, contactMap, admissionsMap }) {
    const feedback = Object.entries(feedbackMap || {}).map(([id, value]) => ({
        id: `feedback-${id}`,
        type: "feedback",
        title: `New feedback from ${value?.name || "Student"}`,
        description: `Rating: ${value?.rating || "-"} / 5`,
        createdAt: value?.createdAt || value?.updatedAt || "",
        href: "/admin/feedback",
    }));

    const contacts = Object.entries(contactMap || {}).map(([id, value]) => ({
        id: `contact-${id}`,
        type: "contact",
        title: `New contact inquiry from ${value?.name || "Visitor"}`,
        description: value?.message || value?.course || "Inquiry received",
        createdAt: value?.createdAt || value?.updatedAt || "",
        href: "/admin/contact",
    }));

    const admissions = Object.entries(admissionsMap || {}).map(([id, value]) => {
        const payload = value?.payload || {};
        const studentName =
            payload?.declarationStudentName ||
            [payload?.firstName, payload?.middleName, payload?.lastName].filter(Boolean).join(" ") ||
            "Student";

        return {
            id: `admission-${id}`,
            type: "admission",
            title: `New admission registration: ${studentName}`,
            description: value?.applicationId || value?.selectedStream || "Admission submitted",
            createdAt: value?.createdAt || value?.updatedAt || "",
            href: "/admin/admissions",
        };
    });

    return [...feedback, ...contacts, ...admissions].sort(sortByTimeDesc);
}

function buildStudentNotifications({ meritMap }) {
    return Object.entries(meritMap || {})
        .map(([id, value]) => ({
            id: `merit-${id}`,
            type: "merit",
            title: `${value?.collegeName || "College"} uploaded a new merit list`,
            description: value?.title || value?.description || "Merit list published",
            createdAt: value?.createdAt || value?.updatedAt || "",
            href: "/merit",
        }))
        .sort(sortByTimeDesc);
}

function buildTeacherNotifications({ studentsMap, teacherDepartment }) {
    const normalizedTeacherDepartment = normalizeDepartment(teacherDepartment);

    return Object.entries(studentsMap || {})
        .map(([id, value]) => {
            const department = normalizeDepartment(value?.department);

            if (normalizedTeacherDepartment && department !== normalizedTeacherDepartment) {
                return null;
            }

            if (!value?.createdAt || !value?.createdBy) {
                return null;
            }

            return {
                id: `student-${id}`,
                type: "student-registration",
                title: `New student registered: ${value?.name || "Student"}`,
                description: `${formatDepartmentLabel(department)} | App ID: ${value?.applicationId || "-"}`,
                createdAt: value?.createdAt || value?.updatedAt || "",
                href: "/teacher/students",
            };
        })
        .filter(Boolean)
        .sort(sortByTimeDesc);
}

function getTypeCounts(notifications) {
    return notifications.reduce((acc, item) => {
        const next = { ...acc };
        next[item.type] = (next[item.type] || 0) + 1;
        return next;
    }, {});
}

function getRoleKey(role) {
    if (role === "admin") return "admin";
    if (role === "teacher") return "teacher";
    return "student";
}

async function getEffectiveRoleContext(db, auth) {
    const usersSnapshot = await db.ref(`users/${auth.uid}`).get();
    const userProfile = usersSnapshot.exists() ? usersSnapshot.val() || {} : {};
    const effectiveRole = String(userProfile?.role || auth.role || "student").trim().toLowerCase();

    return { userProfile, effectiveRole };
}

async function buildNotificationsForRole({ db, effectiveRole, userProfile }) {
    if (effectiveRole === "admin") {
        const [feedbackSnap, contactSnap, admissionsSnap] = await Promise.all([
            db.ref("feedback_items").get(),
            db.ref("contact_inquiries").get(),
            db.ref("admissions").get(),
        ]);

        return buildAdminNotifications({
            feedbackMap: feedbackSnap.exists() ? feedbackSnap.val() : {},
            contactMap: contactSnap.exists() ? contactSnap.val() : {},
            admissionsMap: admissionsSnap.exists() ? admissionsSnap.val() : {},
        });
    }

    if (effectiveRole === "teacher") {
        const studentsSnap = await db.ref("students").get();
        return buildTeacherNotifications({
            studentsMap: studentsSnap.exists() ? studentsSnap.val() : {},
            teacherDepartment: userProfile?.department,
        });
    }

    const meritSnap = await db.ref("merit_notices").get();
    return buildStudentNotifications({
        meritMap: meritSnap.exists() ? meritSnap.val() : {},
    });
}

export async function GET(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getAdminDb();
        const { searchParams } = new URL(request.url);
        const summaryOnly = searchParams.get("summary") === "1";
        const { userProfile, effectiveRole } = await getEffectiveRoleContext(db, auth);
        const roleKey = getRoleKey(effectiveRole);

        const seenSnapshot = await db.ref(`notification_seen/${auth.uid}/${roleKey}`).get();
        const seenAt = seenSnapshot.exists() ? String(seenSnapshot.val() || "") : "";
        const seenAtMs = toUnixMs(seenAt);

        const notifications = await buildNotificationsForRole({ db, effectiveRole, userProfile });

        const unreadCount = notifications.filter((item) => toUnixMs(item.createdAt) > seenAtMs).length;
        const typeCounts = getTypeCounts(notifications);

        if (summaryOnly) {
            return Response.json(
                {
                    success: true,
                    unreadCount,
                    typeCounts,
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                unreadCount,
                seenAt,
                typeCounts,
                notifications,
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const action = String(body?.action || "").trim().toLowerCase();
        if (action !== "mark-seen") {
            return Response.json({ error: "Invalid action" }, { status: 400 });
        }

        const db = getAdminDb();
        const { effectiveRole } = await getEffectiveRoleContext(db, auth);
        const roleKey = getRoleKey(effectiveRole);
        const seenAt = new Date().toISOString();
        await db.ref(`notification_seen/${auth.uid}/${roleKey}`).set(seenAt);

        return Response.json({ success: true, seenAt, unreadCount: 0 }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message || "Failed to update notification status" }, { status: 500 });
    }
}
