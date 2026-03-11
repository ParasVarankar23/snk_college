import { getAdminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";
import * as XLSX from "xlsx";

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

function parseStartYearFromAcademicYear(value) {
    const text = String(value || "").trim();
    const match = /(\d{4})/.exec(text);
    return match ? Number(match[1]) : null;
}

function formatAcademicYear(startYear) {
    return `${startYear}-${startYear + 1}`;
}

function normalizeYearFilter(value) {
    const year = parseStartYearFromAcademicYear(value);
    return year ? formatAcademicYear(year) : null;
}

function normalizeDepartment(value) {
    const department = String(value || "all").trim().toLowerCase();
    if (department === "science" || department === "commerce" || department === "arts") {
        return department;
    }
    return "all";
}

function parseMeritThresholds(searchParams) {
    const defaultThresholds = { merit1Min: 80, merit2Min: 60, merit3Min: 35 };

    const merit1Raw = Number(searchParams.get("merit1Min"));
    const merit2Raw = Number(searchParams.get("merit2Min"));
    const merit3Raw = Number(searchParams.get("merit3Min"));

    let merit1Min = Number.isFinite(merit1Raw) ? merit1Raw : defaultThresholds.merit1Min;
    let merit2Min = Number.isFinite(merit2Raw) ? merit2Raw : defaultThresholds.merit2Min;
    let merit3Min = Number.isFinite(merit3Raw) ? merit3Raw : defaultThresholds.merit3Min;

    merit1Min = Math.max(0, Math.min(100, merit1Min));
    merit2Min = Math.max(0, Math.min(100, merit2Min));
    merit3Min = Math.max(0, Math.min(100, merit3Min));

    if (merit2Min >= merit1Min) {
        merit2Min = Math.max(0, merit1Min - 1);
    }

    if (merit3Min >= merit2Min) {
        merit3Min = Math.max(0, merit2Min - 1);
    }

    return { merit1Min, merit2Min, merit3Min };
}

function parsePercentage(value) {
    const num = Number.parseFloat(String(value || "").replaceAll(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : -1;
}

function toAllRows(admissions) {
    return admissions.map((item, idx) => {
        const payload = item.payload || {};
        return {
            SrNo: idx + 1,
            ApplicationID: item.applicationId || "",
            AcademicYear: item.academicYear || payload.academicYear || "",
            Department: String(item.selectedStream || payload.selectedStream || "").toUpperCase(),
            StudentName:
                payload.declarationStudentName ||
                [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" "),
            Email: payload.email || "",
            Mobile: payload.mobileNumber || "",
            Percentage: payload.percentage || "",
            Board: payload.boardName || "",
            Status: item.status || "",
            SubmittedAt: item.updatedAt || "",
        };
    });
}

function toTopRows(admissions) {
    return admissions
        .map((item) => {
            const payload = item.payload || {};
            return {
                ApplicationID: item.applicationId || "",
                StudentName:
                    payload.declarationStudentName ||
                    [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" "),
                Department: String(item.selectedStream || payload.selectedStream || "").toUpperCase(),
                Percentage: payload.percentage || "",
                NumericPercentage: parsePercentage(payload.percentage),
                Email: payload.email || "",
                Mobile: payload.mobileNumber || "",
            };
        })
        .filter((row) => row.NumericPercentage >= 0)
        .sort((a, b) => b.NumericPercentage - a.NumericPercentage)
        .map((row, idx) => ({
            Rank: idx + 1,
            ApplicationID: row.ApplicationID,
            StudentName: row.StudentName,
            Department: row.Department,
            Percentage: row.Percentage,
            Email: row.Email,
            Mobile: row.Mobile,
        }));
}

function toMeritBuckets(admissions, thresholds) {
    const { merit1Min, merit2Min, merit3Min } = thresholds;
    const rows = admissions
        .map((item) => {
            const payload = item.payload || {};
            const percentage = parsePercentage(payload.percentage);
            return {
                ApplicationID: item.applicationId || "",
                StudentName:
                    payload.declarationStudentName ||
                    [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" "),
                Department: String(item.selectedStream || payload.selectedStream || "").toUpperCase(),
                Percentage: payload.percentage || "",
                NumericPercentage: percentage,
                Email: payload.email || "",
                Mobile: payload.mobileNumber || "",
            };
        })
        .filter((row) => row.NumericPercentage >= 0)
        .sort((a, b) => b.NumericPercentage - a.NumericPercentage);

    const merit1 = [];
    const merit2 = [];
    const merit3 = [];

    rows.forEach((row) => {
        const mapped = {
            ApplicationID: row.ApplicationID,
            StudentName: row.StudentName,
            Department: row.Department,
            Percentage: row.Percentage,
            Email: row.Email,
            Mobile: row.Mobile,
        };

        if (row.NumericPercentage >= merit1Min) {
            merit1.push(mapped);
            return;
        }

        if (row.NumericPercentage >= merit2Min && row.NumericPercentage < merit1Min) {
            merit2.push(mapped);
            return;
        }

        if (row.NumericPercentage >= merit3Min && row.NumericPercentage < merit2Min) {
            merit3.push(mapped);
        }
    });

    return {
        merit1: merit1.map((row, idx) => ({ Rank: idx + 1, ...row })),
        merit2: merit2.map((row, idx) => ({ Rank: idx + 1, ...row })),
        merit3: merit3.map((row, idx) => ({ Rank: idx + 1, ...row })),
    };
}

function groupByDepartment(admissions) {
    const groups = {
        science: [],
        commerce: [],
        arts: [],
        other: [],
    };

    admissions.forEach((item) => {
        const stream = String(item.selectedStream || item?.payload?.selectedStream || "")
            .trim()
            .toLowerCase();

        if (groups[stream]) {
            groups[stream].push(item);
        } else {
            groups.other.push(item);
        }
    });

    return groups;
}

function filterAdmissionsByDepartment(admissions, departmentFilter) {
    if (departmentFilter === "all") return admissions;

    return admissions.filter((item) => {
        const stream = String(item.selectedStream || item?.payload?.selectedStream || "")
            .trim()
            .toLowerCase();
        return stream === departmentFilter;
    });
}

function appendMeritSheets(workbook, admissions, departmentFilter, meritThresholds) {
    const meritBuckets = toMeritBuckets(admissions, meritThresholds);
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(meritBuckets.merit1), "Merit_1");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(meritBuckets.merit2), "Merit_2");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(meritBuckets.merit3), "Merit_3");

    if (departmentFilter !== "all") return;

    const departmentGroups = groupByDepartment(admissions);
    const scienceMerits = toMeritBuckets(departmentGroups.science, meritThresholds);
    const commerceMerits = toMeritBuckets(departmentGroups.commerce, meritThresholds);
    const artsMerits = toMeritBuckets(departmentGroups.arts, meritThresholds);
    const otherMerits = toMeritBuckets(departmentGroups.other, meritThresholds);

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(scienceMerits.merit1), "Sci_Merit_1");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(scienceMerits.merit2), "Sci_Merit_2");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(scienceMerits.merit3), "Sci_Merit_3");

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(commerceMerits.merit1), "Com_Merit_1");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(commerceMerits.merit2), "Com_Merit_2");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(commerceMerits.merit3), "Com_Merit_3");

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(artsMerits.merit1), "Arts_Merit_1");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(artsMerits.merit2), "Arts_Merit_2");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(artsMerits.merit3), "Arts_Merit_3");

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(otherMerits.merit1), "Other_Merit_1");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(otherMerits.merit2), "Other_Merit_2");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(otherMerits.merit3), "Other_Merit_3");
}

function getModeSuffix(mode) {
    if (mode === "all") return "All";
    if (mode === "top") return "Top";
    if (mode === "merit") return "Merit";
    if (mode === "both") return "All_Top_Merit";
    return "All_Top";
}

export async function GET(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin") {
        return Response.json({ error: "Only admin can export admissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const yearFilter = normalizeYearFilter(searchParams.get("year"));
    const mode = String(searchParams.get("mode") || "both").trim().toLowerCase();
    const departmentFilter = normalizeDepartment(searchParams.get("department"));
    const meritThresholds = parseMeritThresholds(searchParams);

    const db = getAdminDb();
    const snapshot = await db.ref("admissions").get();
    const allAdmissions = Object.entries(snapshot.exists() ? snapshot.val() : {}).map(([id, value]) => ({
        id,
        ...value,
    }));

    const filteredByYear = yearFilter
        ? allAdmissions.filter((item) => item.academicYear === yearFilter)
        : allAdmissions;

    const admissions = filterAdmissionsByDepartment(filteredByYear, departmentFilter);

    const allRows = toAllRows(admissions);
    const topRows = toTopRows(admissions);

    const workbook = XLSX.utils.book_new();

    if (mode !== "top") {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allRows), "All_Students");
    }

    if (mode !== "all") {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(topRows), "Top_Percentage");
    }

    if (mode === "merit" || mode === "both") {
        appendMeritSheets(workbook, admissions, departmentFilter, meritThresholds);
    }

    if (workbook.SheetNames.length === 0) {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([]), "Empty");
    }

    const output = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const fileYear = yearFilter || "All_Years";
    const fileDepartment = departmentFilter === "all" ? "All_Departments" : departmentFilter;

    const modeSuffix = getModeSuffix(mode);

    return new Response(output, {
        status: 200,
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename=SNK_Admissions_${fileYear}_${fileDepartment}_${modeSuffix}.xlsx`,
        },
    });
}
