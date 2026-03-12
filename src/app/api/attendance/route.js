import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";

const ALLOWED_DEPARTMENTS = new Set(["science", "commerce", "arts"]);
const ALLOWED_ATTENDANCE_STATUS = new Set(["present", "absent", "leave"]);
const DEFAULT_SUBJECT = "general";
const SUBJECTS_BY_DEPARTMENT = {
    science: ["physics", "chemistry", "biology", "maths", "english", "marathi"],
    commerce: ["account", "secretarial practice", "organization of commerce", "economics", "english", "marathi"],
    arts: ["english", "marathi", "geography", "history", "political science", "economics"],
};

function normalizeDepartment(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeRole(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeSubject(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) return DEFAULT_SUBJECT;

    if (normalized === "mathematics") return "maths";
    if (normalized === "accounts") return "account";
    if (normalized === "sp") return "secretarial practice";
    if (normalized === "oc") return "organization of commerce";
    return normalized;
}

function getDepartmentSubjects(department) {
    const key = normalizeDepartment(department);
    const subjects = SUBJECTS_BY_DEPARTMENT[key] || [];
    return subjects.map((item) => normalizeSubject(item));
}

function normalizeSubjectList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => normalizeSubject(item))
            .filter(Boolean);
    }

    return String(value || "")
        .split(",")
        .map((item) => normalizeSubject(item))
        .filter(Boolean);
}

function getTodayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

function getAuthContext(request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const uid = payload.user_id || payload.uid || payload.sub || null;
        const role = normalizeRole(payload.role || "student");
        if (!uid) return null;
        return { uid, role };
    } catch {
        return null;
    }
}

async function getUserProfile(db, uid) {
    const snapshot = await db.ref(`users/${uid}`).get();
    return snapshot.exists() ? snapshot.val() || {} : {};
}

function mapStudents(studentsMap) {
    return Object.entries(studentsMap || {})
        .map(([id, value]) => ({
            id,
            name: value?.name || "",
            email: value?.email || "",
            department: normalizeDepartment(value?.department),
            applicationId: value?.applicationId || "",
            uid: value?.uid || "",
            createdAt: value?.createdAt || "",
            updatedAt: value?.updatedAt || "",
        }))
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

function flattenAttendanceRows(attendanceMap) {
    const rows = [];
    const hasSpecificByDateStudent = new Set();

    for (const [date, entriesByStudent] of Object.entries(attendanceMap || {})) {
        for (const [levelKey, value] of Object.entries(entriesByStudent || {})) {
            if (value && typeof value === "object" && Object.hasOwn(value, "status")) {
                continue;
            }

            const subject = normalizeSubject(levelKey);
            if (subject === DEFAULT_SUBJECT) {
                continue;
            }

            for (const [studentId] of Object.entries(value || {})) {
                hasSpecificByDateStudent.add(`${date}__${studentId}`);
            }
        }
    }

    for (const [date, entriesByStudent] of Object.entries(attendanceMap || {})) {
        for (const [levelKey, value] of Object.entries(entriesByStudent || {})) {
            if (value && typeof value === "object" && Object.hasOwn(value, "status")) {
                const isShadowedLegacy = hasSpecificByDateStudent.has(`${date}__${levelKey}`);
                if (isShadowedLegacy) {
                    continue;
                }

                rows.push({
                    id: `${date}_${DEFAULT_SUBJECT}_${levelKey}`,
                    date,
                    subject: normalizeSubject(value?.subject),
                    studentId: levelKey,
                    studentName: value?.studentName || "",
                    email: value?.email || "",
                    department: normalizeDepartment(value?.department),
                    status: value?.status || "",
                    markedBy: value?.markedBy || "",
                    markedByRole: value?.markedByRole || "",
                    markedAt: value?.markedAt || "",
                });
                continue;
            }

            const subject = normalizeSubject(levelKey);
            for (const [studentId, child] of Object.entries(value || {})) {
                rows.push({
                    id: `${date}_${subject}_${studentId}`,
                    date,
                    subject,
                    studentId,
                    studentName: child?.studentName || "",
                    email: child?.email || "",
                    department: normalizeDepartment(child?.department),
                    status: child?.status || "",
                    markedBy: child?.markedBy || "",
                    markedByRole: child?.markedByRole || "",
                    markedAt: child?.markedAt || "",
                });
            }
        }
    }

    return rows.sort((a, b) => String(b.markedAt || "").localeCompare(String(a.markedAt || "")));
}

function parseJsonBody(request) {
    return request
        .json()
        .catch(() => ({}));
}

async function getNextStudentApplicationId(db) {
    const year = new Date().getFullYear();
    const counterRef = db.ref(`studentCounters/${year}`);
    const transactionResult = await counterRef.transaction((current) => (Number(current) || 0) + 1);
    const sequence = Number(transactionResult.snapshot.val()) || 1;
    return `STD${year}${String(sequence).padStart(4, "0")}`;
}

function generateStudentPassword(name) {
    const prefix = String(name || "student")
        .toLowerCase()
        .replaceAll(/[^a-z]/g, "")
        .slice(0, 4)
        .padEnd(4, "s");
    const digits = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    return `${prefix}${digits}@`;
}

function isUserNotFoundError(error) {
    return error?.code === "auth/user-not-found" || error?.errorInfo?.code === "auth/user-not-found";
}

function isEmailAlreadyExistsError(error) {
    return (
        error?.code === "auth/email-already-exists" ||
        error?.errorInfo?.code === "auth/email-already-exists"
    );
}

async function ensureAuthUserForStudent({ adminAuth, existingUid, email, name }) {
    const normalizedEmail = normalizeEmail(email);

    if (existingUid) {
        try {
            const updated = await adminAuth.updateUser(existingUid, {
                email: normalizedEmail,
                displayName: name,
            });
            return { user: updated, created: false };
        } catch (error) {
            if (isEmailAlreadyExistsError(error)) {
                throw new Error("Email is already used by another account");
            }

            if (!isUserNotFoundError(error)) {
                throw new Error("Failed to update auth user");
            }
        }
    }

    try {
        const existing = await adminAuth.getUserByEmail(normalizedEmail);
        return { user: existing, created: false };
    } catch (error) {
        if (!isUserNotFoundError(error)) {
            throw new Error("Failed to lookup auth user");
        }
    }

    const temporaryPassword = generateStudentPassword(name);
    try {
        const created = await adminAuth.createUser({
            email: normalizedEmail,
            password: temporaryPassword,
            displayName: name,
        });
        return { user: created, created: true };
    } catch {
        throw new Error("Failed to create auth user");
    }
}

async function removeStudentAttendanceRecords(db, studentId) {
    const attendanceSnapshot = await db.ref("attendance").get();
    if (!attendanceSnapshot.exists()) {
        return;
    }

    const attendanceMap = attendanceSnapshot.val() || {};
    const removals = [];

    for (const [date, entriesByStudent] of Object.entries(attendanceMap)) {
        if (!entriesByStudent || typeof entriesByStudent !== "object") {
            continue;
        }

        if (Object.hasOwn(entriesByStudent, studentId)) {
            removals.push(db.ref(`attendance/${date}/${studentId}`).remove());
        }

        for (const [levelKey, value] of Object.entries(entriesByStudent)) {
            if (!value || typeof value !== "object") {
                continue;
            }

            if (Object.hasOwn(value, "status")) {
                continue;
            }

            if (Object.hasOwn(value, studentId)) {
                removals.push(db.ref(`attendance/${date}/${levelKey}/${studentId}`).remove());
            }
        }
    }

    if (removals.length > 0) {
        await Promise.all(removals);
    }
}

async function registerStudentsInBulk({ db, adminAuth, students, createdByUid }) {
    const studentsSnapshot = await db.ref("students").get();
    const existingStudentsMap = studentsSnapshot.exists() ? studentsSnapshot.val() : {};
    const existingStudents = mapStudents(existingStudentsMap);
    const byEmail = new Map(existingStudents.map((row) => [normalizeEmail(row.email), row]));
    const byApplicationId = new Map(
        existingStudents
            .filter((row) => String(row.applicationId || "").trim())
            .map((row) => [String(row.applicationId).trim().toUpperCase(), row])
    );
    const seenNewApplicationIds = new Set();

    const results = {
        createdCount: 0,
        updatedCount: 0,
        failed: [],
    };

    for (let index = 0; index < students.length; index += 1) {
        const row = students[index] || {};
        const name = String(row.name || "").trim();
        const email = normalizeEmail(row.email);
        const department = normalizeDepartment(row.department);
        const providedApplicationId = String(row.applicationId || "").trim().toUpperCase();

        if (!name || !email || !department) {
            results.failed.push({ row: index + 1, error: "Name, email, and department are required" });
            continue;
        }

        if (!isValidEmail(email)) {
            results.failed.push({ row: index + 1, error: "Invalid email format" });
            continue;
        }

        if (!ALLOWED_DEPARTMENTS.has(department)) {
            results.failed.push({ row: index + 1, error: "Invalid department" });
            continue;
        }

        let authUser = null;
        let temporaryPassword = "";
        try {
            authUser = await adminAuth.getUserByEmail(email);
        } catch (error) {
            if (!isUserNotFoundError(error)) {
                results.failed.push({ row: index + 1, error: "Failed to lookup auth user" });
                continue;
            }
        }

        if (!authUser) {
            temporaryPassword = generateStudentPassword(name);
            try {
                authUser = await adminAuth.createUser({
                    email,
                    password: temporaryPassword,
                    displayName: name,
                });
            } catch {
                results.failed.push({ row: index + 1, error: "Failed to create auth user" });
                continue;
            }
        }

        const existingStudent = byEmail.get(email);
        const existingByApplication = providedApplicationId
            ? byApplicationId.get(providedApplicationId)
            : null;

        if (!existingStudent && existingByApplication) {
            results.failed.push({ row: index + 1, error: "Application ID already exists" });
            continue;
        }

        if (!existingStudent && providedApplicationId && seenNewApplicationIds.has(providedApplicationId)) {
            results.failed.push({ row: index + 1, error: "Duplicate application ID in upload" });
            continue;
        }

        const applicationId =
            String(existingStudent?.applicationId || "").trim() ||
            providedApplicationId ||
            (await getNextStudentApplicationId(db));
        const nowIso = new Date().toISOString();
        const uid = authUser.uid;

        const studentPayload = {
            name,
            email,
            department,
            uid,
            applicationId,
            updatedAt: nowIso,
            createdBy: createdByUid,
            ...(existingStudent?.createdAt ? { createdAt: existingStudent.createdAt } : { createdAt: nowIso }),
        };

        const studentId = existingStudent?.id || db.ref("students").push().key;
        await db.ref(`students/${studentId}`).set(studentPayload);
        await db.ref(`users/${uid}`).update({
            name,
            email,
            role: "student",
            department,
            applicationId,
            studentId,
            updatedAt: nowIso,
            createdAt: nowIso,
        });

        if (existingStudent) {
            results.updatedCount += 1;
        } else {
            results.createdCount += 1;
            seenNewApplicationIds.add(applicationId.toUpperCase());
            byApplicationId.set(applicationId.toUpperCase(), { id: studentId, applicationId });
        }
    }

    return results;
}

function canManageAttendance(role) {
    return role === "admin" || role === "teacher";
}

async function getTeacherAssignedSubjects(db, authUid, email) {
    const snapshot = await db.ref("staff").get();
    if (!snapshot.exists()) {
        return [];
    }

    const staffMap = snapshot.val() || {};
    const targetEmail = normalizeEmail(email);

    const subjects = Object.values(staffMap)
        .filter((row) => {
            const rowUid = String(row?.authUid || "").trim();
            const rowEmail = normalizeEmail(row?.email);
            return rowUid === authUid || (targetEmail && rowEmail === targetEmail);
        })
        .flatMap((row) => normalizeSubjectList(row?.subjects));

    const unique = Array.from(new Set(subjects));
    return unique;
}

export async function GET(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getAdminDb();
        const profile = await getUserProfile(db, auth.uid);
        const role = normalizeRole(profile?.role || auth.role);
        const userDepartment = normalizeDepartment(profile?.department);
        const userEmail = normalizeEmail(profile?.email);
        const { searchParams } = new URL(request.url);
        const type = String(searchParams.get("type") || "attendance").trim().toLowerCase();

        if (type === "teacher-meta") {
            if (role !== "teacher") {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const departmentSubjects = getDepartmentSubjects(userDepartment);
            const assignedSubjects = await getTeacherAssignedSubjects(db, auth.uid, profile?.email);
            let teacherSubjects = assignedSubjects;

            if (departmentSubjects.length > 0) {
                const matched = assignedSubjects.filter((item) => departmentSubjects.includes(item));
                teacherSubjects = matched.length > 0 ? matched : departmentSubjects;
            }

            if (teacherSubjects.length === 0) {
                teacherSubjects = [DEFAULT_SUBJECT];
            }

            return Response.json(
                {
                    success: true,
                    subjects: teacherSubjects,
                    assignedSubjects,
                    departmentSubjects,
                    department: userDepartment,
                },
                { status: 200 }
            );
        }

        if (type === "students") {
            const studentsSnapshot = await db.ref("students").get();
            const students = studentsSnapshot.exists() ? mapStudents(studentsSnapshot.val()) : [];
            const requestedDepartment = normalizeDepartment(searchParams.get("department"));

            let filtered = students;
            if (role === "teacher") {
                filtered = students.filter((row) => row.department === userDepartment);
            } else if (role === "student") {
                filtered = students.filter((row) => row.uid === auth.uid || normalizeEmail(row.email) === userEmail);
            } else if (requestedDepartment) {
                filtered = students.filter((row) => row.department === requestedDepartment);
            }

            return Response.json({ success: true, students: filtered }, { status: 200 });
        }

        if (type === "summary") {
            if (role !== "student") {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const studentsSnapshot = await db.ref("students").get();
            const students = studentsSnapshot.exists() ? mapStudents(studentsSnapshot.val()) : [];
            const ownStudent = students.find((row) => row.uid === auth.uid || normalizeEmail(row.email) === userEmail) || null;

            const attendanceSnapshot = await db.ref("attendance").get();
            const allRows = attendanceSnapshot.exists() ? flattenAttendanceRows(attendanceSnapshot.val()) : [];
            const ownRows = ownStudent
                ? allRows.filter((row) => row.studentId === ownStudent.id)
                : [];
            const effectiveDepartment = normalizeDepartment(ownStudent?.department || userDepartment);
            const departmentSubjects = getDepartmentSubjects(effectiveDepartment);

            const totals = ownRows.reduce(
                (acc, row) => {
                    const normalizedStatus = String(row.status || "").toLowerCase();
                    if (normalizedStatus === "present") acc.present += 1;
                    if (normalizedStatus === "absent") acc.absent += 1;
                    if (normalizedStatus === "leave") acc.leave += 1;
                    return acc;
                },
                { present: 0, absent: 0, leave: 0 }
            );

            return Response.json(
                {
                    success: true,
                    student: ownStudent,
                    attendance: ownRows,
                    totals,
                    departmentSubjects,
                },
                { status: 200 }
            );
        }

        const dateFilter = String(searchParams.get("date") || "").trim();
        const subjectFilter = normalizeSubject(searchParams.get("subject"));
        const hasSubjectFilter = String(searchParams.get("subject") || "").trim().length > 0;
        const requestedDepartment = normalizeDepartment(searchParams.get("department"));
        const requestedStudentId = String(searchParams.get("studentId") || "").trim();

        const attendanceSnapshot = await db.ref("attendance").get();
        const allRows = attendanceSnapshot.exists() ? flattenAttendanceRows(attendanceSnapshot.val()) : [];

        let filtered = allRows;
        if (role === "teacher") {
            filtered = filtered.filter((row) => row.department === userDepartment);
        }

        if (role === "student") {
            const studentsSnapshot = await db.ref("students").get();
            const students = studentsSnapshot.exists() ? mapStudents(studentsSnapshot.val()) : [];
            const ownStudent = students.find((row) => row.uid === auth.uid || normalizeEmail(row.email) === userEmail);
            filtered = ownStudent ? filtered.filter((row) => row.studentId === ownStudent.id) : [];
        }

        if (dateFilter) {
            filtered = filtered.filter((row) => row.date === dateFilter);
        }

        if (hasSubjectFilter) {
            filtered = filtered.filter((row) => normalizeSubject(row.subject) === subjectFilter);
        }

        if (requestedDepartment && role === "admin") {
            filtered = filtered.filter((row) => row.department === requestedDepartment);
        }

        if (requestedStudentId) {
            filtered = filtered.filter((row) => row.studentId === requestedStudentId);
        }

        return Response.json({ success: true, attendance: filtered }, { status: 200 });
    } catch (error) {
        console.error("Attendance GET error:", error);
        return Response.json({ error: error.message || "Failed to fetch attendance" }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await parseJsonBody(request);
        const type = String(body?.type || "").trim().toLowerCase();

        const db = getAdminDb();
        const profile = await getUserProfile(db, auth.uid);
        const role = normalizeRole(profile?.role || auth.role);

        if (type === "bulk-register-students") {
            if (role !== "admin") {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const students = Array.isArray(body?.students) ? body.students : [];
            if (students.length === 0) {
                return Response.json({ error: "At least one student is required" }, { status: 400 });
            }

            const adminAuth = getAdminAuth();
            const result = await registerStudentsInBulk({
                db,
                adminAuth,
                students,
                createdByUid: auth.uid,
            });

            return Response.json(
                {
                    success: true,
                    message: "Student bulk registration completed",
                    ...result,
                },
                { status: 200 }
            );
        }

        if (type === "create-student") {
            if (role !== "admin") {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const name = String(body?.name || "").trim();
            const email = normalizeEmail(body?.email);
            const department = normalizeDepartment(body?.department);
            const providedApplicationId = String(body?.applicationId || "").trim().toUpperCase();

            if (!name || !email || !department) {
                return Response.json({ error: "Name, email and department are required" }, { status: 400 });
            }

            if (!isValidEmail(email)) {
                return Response.json({ error: "Invalid email format" }, { status: 400 });
            }

            if (!ALLOWED_DEPARTMENTS.has(department)) {
                return Response.json({ error: "Invalid department" }, { status: 400 });
            }

            const studentsSnapshot = await db.ref("students").get();
            const students = studentsSnapshot.exists() ? mapStudents(studentsSnapshot.val()) : [];
            const emailExists = students.some((row) => normalizeEmail(row.email) === email);
            if (emailExists) {
                return Response.json({ error: "Student email already exists" }, { status: 409 });
            }

            if (providedApplicationId) {
                const appExists = students.some(
                    (row) => String(row.applicationId || "").trim().toUpperCase() === providedApplicationId
                );
                if (appExists) {
                    return Response.json({ error: "Application ID already exists" }, { status: 409 });
                }
            }

            const adminAuth = getAdminAuth();
            const authResult = await ensureAuthUserForStudent({
                adminAuth,
                existingUid: "",
                email,
                name,
            });
            const uid = authResult.user.uid;
            const applicationId = providedApplicationId || (await getNextStudentApplicationId(db));
            const nowIso = new Date().toISOString();
            const studentId = db.ref("students").push().key;

            await db.ref(`students/${studentId}`).set({
                name,
                email,
                department,
                uid,
                applicationId,
                createdAt: nowIso,
                updatedAt: nowIso,
                createdBy: auth.uid,
            });

            await db.ref(`users/${uid}`).update({
                name,
                email,
                role: "student",
                department,
                applicationId,
                studentId,
                updatedAt: nowIso,
                createdAt: nowIso,
            });

            return Response.json(
                {
                    success: true,
                    message: "Student created successfully",
                    student: {
                        id: studentId,
                        name,
                        email,
                        department,
                        applicationId,
                        uid,
                    },
                },
                { status: 200 }
            );
        }

        if (type === "update-student") {
            if (role !== "admin") {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const studentId = String(body?.studentId || "").trim();
            const name = String(body?.name || "").trim();
            const email = normalizeEmail(body?.email);
            const department = normalizeDepartment(body?.department);
            const providedApplicationId = String(body?.applicationId || "").trim().toUpperCase();

            if (!studentId) {
                return Response.json({ error: "studentId is required" }, { status: 400 });
            }

            if (!name || !email || !department) {
                return Response.json({ error: "Name, email and department are required" }, { status: 400 });
            }

            if (!isValidEmail(email)) {
                return Response.json({ error: "Invalid email format" }, { status: 400 });
            }

            if (!ALLOWED_DEPARTMENTS.has(department)) {
                return Response.json({ error: "Invalid department" }, { status: 400 });
            }

            const studentSnapshot = await db.ref(`students/${studentId}`).get();
            if (!studentSnapshot.exists()) {
                return Response.json({ error: "Student not found" }, { status: 404 });
            }

            const current = studentSnapshot.val() || {};
            const studentsSnapshot = await db.ref("students").get();
            const students = studentsSnapshot.exists() ? mapStudents(studentsSnapshot.val()) : [];

            const emailExists = students.some(
                (row) => row.id !== studentId && normalizeEmail(row.email) === email
            );
            if (emailExists) {
                return Response.json({ error: "Student email already exists" }, { status: 409 });
            }

            if (providedApplicationId) {
                const appExists = students.some(
                    (row) =>
                        row.id !== studentId &&
                        String(row.applicationId || "").trim().toUpperCase() === providedApplicationId
                );
                if (appExists) {
                    return Response.json({ error: "Application ID already exists" }, { status: 409 });
                }
            }

            const adminAuth = getAdminAuth();
            const authResult = await ensureAuthUserForStudent({
                adminAuth,
                existingUid: String(current?.uid || "").trim(),
                email,
                name,
            });

            const uid = authResult.user.uid;
            const nowIso = new Date().toISOString();
            const applicationId =
                providedApplicationId ||
                String(current?.applicationId || "").trim().toUpperCase() ||
                (await getNextStudentApplicationId(db));

            await db.ref(`students/${studentId}`).update({
                name,
                email,
                department,
                uid,
                applicationId,
                updatedAt: nowIso,
            });

            await db.ref(`users/${uid}`).update({
                name,
                email,
                role: "student",
                department,
                applicationId,
                studentId,
                updatedAt: nowIso,
            });

            return Response.json(
                {
                    success: true,
                    message: "Student updated successfully",
                    student: {
                        id: studentId,
                        name,
                        email,
                        department,
                        applicationId,
                        uid,
                    },
                },
                { status: 200 }
            );
        }

        if (type === "delete-student") {
            if (role !== "admin") {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const studentId = String(body?.studentId || "").trim();
            if (!studentId) {
                return Response.json({ error: "studentId is required" }, { status: 400 });
            }

            const studentSnapshot = await db.ref(`students/${studentId}`).get();
            if (!studentSnapshot.exists()) {
                return Response.json({ error: "Student not found" }, { status: 404 });
            }

            const current = studentSnapshot.val() || {};
            const uid = String(current?.uid || "").trim();

            await db.ref(`students/${studentId}`).remove();
            await removeStudentAttendanceRecords(db, studentId);

            if (uid) {
                const userRef = db.ref(`users/${uid}`);
                const userSnapshot = await userRef.get();
                if (userSnapshot.exists()) {
                    const user = userSnapshot.val() || {};
                    if (normalizeRole(user?.role) === "student") {
                        await userRef.remove();
                    } else {
                        await userRef.update({
                            studentId: null,
                            updatedAt: new Date().toISOString(),
                        });
                    }
                }
            }

            return Response.json({ success: true, message: "Student deleted successfully" }, { status: 200 });
        }

        if (type === "mark-attendance") {
            if (!canManageAttendance(role)) {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            const date = String(body?.date || getTodayIsoDate()).trim();
            const subject = normalizeSubject(body?.subject);
            const entries = Array.isArray(body?.entries) ? body.entries : [];
            const requestedDepartment = normalizeDepartment(body?.department);
            const teacherDepartment = normalizeDepartment(profile?.department);
            const effectiveDepartment = role === "teacher" ? teacherDepartment : requestedDepartment;
            const validDepartmentSubjects = getDepartmentSubjects(effectiveDepartment);

            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return Response.json({ error: "Valid date is required (YYYY-MM-DD)" }, { status: 400 });
            }

            if (!effectiveDepartment || !ALLOWED_DEPARTMENTS.has(effectiveDepartment)) {
                return Response.json({ error: "Valid department is required" }, { status: 400 });
            }

            if (validDepartmentSubjects.length > 0 && !validDepartmentSubjects.includes(subject)) {
                return Response.json({ error: "Selected subject is not valid for this department" }, { status: 400 });
            }

            if (entries.length === 0) {
                return Response.json({ error: "Attendance entries are required" }, { status: 400 });
            }

            const studentsSnapshot = await db.ref("students").get();
            const students = studentsSnapshot.exists() ? mapStudents(studentsSnapshot.val()) : [];
            const studentsById = new Map(students.map((row) => [row.id, row]));
            const dateSubjectRef = db.ref(`attendance/${date}/${subject}`);
            const nowIso = new Date().toISOString();
            let markedCount = 0;

            for (const entry of entries) {
                const studentId = String(entry?.studentId || "").trim();
                const status = String(entry?.status || "").trim().toLowerCase();

                if (!studentId || !ALLOWED_ATTENDANCE_STATUS.has(status)) {
                    continue;
                }

                const student = studentsById.get(studentId);
                if (!student) {
                    continue;
                }

                if (student.department !== effectiveDepartment) {
                    continue;
                }

                // Remove legacy flat node at attendance/{date}/{studentId} to avoid duplicate "general" rows.
                await db.ref(`attendance/${date}/${studentId}`).remove();

                await dateSubjectRef.child(studentId).set({
                    studentId,
                    studentName: student.name,
                    email: student.email,
                    department: student.department,
                    subject,
                    status,
                    markedBy: auth.uid,
                    markedByRole: role,
                    markedAt: nowIso,
                });

                markedCount += 1;
            }

            return Response.json(
                {
                    success: true,
                    message: "Attendance saved successfully",
                    markedCount,
                },
                { status: 200 }
            );
        }

        return Response.json({ error: "Invalid request type" }, { status: 400 });
    } catch (error) {
        console.error("Attendance POST error:", error);
        return Response.json(
            { error: error.message || "Failed to process attendance request" },
            { status: 500 }
        );
    }
}
