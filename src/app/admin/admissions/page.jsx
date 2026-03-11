"use client";

import { Trash2, UserRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const streamLabelMap = {
    science: "Science Department",
    commerce: "Commerce Department",
    arts: "Arts Department",
    other: "Other / Not Selected",
};

const PAGE_SIZE = 10;

function resolveStream(admission) {
    return String(admission?.selectedStream || admission?.payload?.selectedStream || "")
        .trim()
        .toLowerCase();
}

function prettyValue(value) {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) return value.join(", ") || "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function parsePercentage(value) {
    const numeric = Number.parseFloat(String(value || "").replaceAll(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : -1;
}

function parseAmount(value) {
    const numeric = Number.parseFloat(String(value || "").replaceAll(/[^\d.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
}

function formatINR(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function resolvePayment(admission) {
    if (admission?.payload?.payment && typeof admission.payload.payment === "object") {
        return admission.payload.payment;
    }
    return null;
}

export default function AdminAdmissionsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentYear = new Date().getFullYear();
    const yearOptions = [
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
        `${currentYear + 1}-${currentYear + 2}`,
    ];

    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState("");
    const [selectedYear, setSelectedYear] = useState(`${currentYear}-${currentYear + 1}`);
    const [selectedDepartmentTab, setSelectedDepartmentTab] = useState("science");
    const [meritThresholds, setMeritThresholds] = useState({
        merit1Min: 80,
        merit2Min: 60,
        merit3Min: 35,
    });
    const [pageByDepartment, setPageByDepartment] = useState({
        science: 1,
        commerce: 1,
        arts: 1,
        other: 1,
    });
    const [selectedPaymentDepartmentTab, setSelectedPaymentDepartmentTab] = useState("all");

    const selectedView = searchParams.get("view") === "payments" ? "payments" : "admissions";

    const departmentTabs = [
        { id: "science", label: "Science" },
        { id: "commerce", label: "Commerce" },
        { id: "arts", label: "Arts" },
        { id: "other", label: "Others" },
    ];

    const paymentDepartmentTabs = [
        { id: "all", label: "All" },
        { id: "science", label: "Science" },
        { id: "commerce", label: "Commerce" },
        { id: "arts", label: "Arts" },
    ];

    const grouped = useMemo(() => {
        const base = {
            science: [],
            commerce: [],
            arts: [],
            other: [],
        };

        admissions.forEach((admission) => {
            const stream = resolveStream(admission);
            if (base[stream]) {
                base[stream].push(admission);
            } else {
                base.other.push(admission);
            }
        });

        return base;
    }, [admissions]);

    const paymentMetrics = useMemo(() => {
        const rows = admissions
            .map((admission) => {
                const payload = admission.payload || {};
                const payment = resolvePayment(admission);
                const stream = resolveStream(admission);
                const studentName =
                    payload.declarationStudentName ||
                    [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ") ||
                    "Student";

                const isPaid = payment?.status === "paid";
                const amount = isPaid
                    ? parseAmount(payment?.amount || payload.formPrice || 0)
                    : parseAmount(payload.formPrice || 0);

                return {
                    id: admission.id,
                    applicationId: admission.applicationId || "-",
                    studentName,
                    email: payload.email || "-",
                    mobile: payload.mobileNumber || "-",
                    department: stream,
                    amount,
                    isPaid,
                    paymentId: payment?.razorpayPaymentId || "-",
                    paidAt: payment?.paidAt || admission.updatedAt || "",
                };
            })
            .sort((a, b) => String(b.paidAt || "").localeCompare(String(a.paidAt || "")));

        const paidRows = rows.filter((row) => row.isPaid);

        const revenueByDepartment = {
            science: 0,
            commerce: 0,
            arts: 0,
        };

        paidRows.forEach((row) => {
            if (row.department === "science") revenueByDepartment.science += row.amount;
            if (row.department === "commerce") revenueByDepartment.commerce += row.amount;
            if (row.department === "arts") revenueByDepartment.arts += row.amount;
        });

        const totalRevenue = paidRows.reduce((sum, row) => sum + row.amount, 0);

        return {
            rows,
            totalRevenue,
            paidCount: paidRows.length,
            pendingCount: Math.max(0, rows.length - paidRows.length),
            revenueByDepartment,
        };
    }, [admissions]);

    const meritByDepartment = useMemo(() => {
        const normalizeRows = (rows) =>
            rows
                .map((admission) => {
                    const payload = admission.payload || {};
                    const percentage = parsePercentage(payload.percentage);
                    const studentName =
                        payload.declarationStudentName ||
                        [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ") ||
                        "Student";

                    return {
                        id: admission.id,
                        studentName,
                        percentage,
                        percentageText: payload.percentage || "-",
                        department: String(admission.selectedStream || payload.selectedStream || "").toUpperCase(),
                    };
                })
                .filter((item) => item.percentage >= 0)
                .sort((a, b) => b.percentage - a.percentage);

        const createBuckets = (rows) => {
            const merit1 = [];
            const merit2 = [];
            const merit3 = [];

            rows.forEach((item) => {
                if (item.percentage >= meritThresholds.merit1Min) {
                    merit1.push(item);
                    return;
                }

                if (item.percentage >= meritThresholds.merit2Min && item.percentage < meritThresholds.merit1Min) {
                    merit2.push(item);
                    return;
                }

                if (item.percentage >= meritThresholds.merit3Min && item.percentage < meritThresholds.merit2Min) {
                    merit3.push(item);
                }
            });

            return { merit1, merit2, merit3 };
        };

        const scienceRows = normalizeRows(grouped.science || []);
        const commerceRows = normalizeRows(grouped.commerce || []);
        const artsRows = normalizeRows(grouped.arts || []);
        const otherRows = normalizeRows(grouped.other || []);

        return {
            science: createBuckets(scienceRows),
            commerce: createBuckets(commerceRows),
            arts: createBuckets(artsRows),
            other: createBuckets(otherRows),
            all: createBuckets(normalizeRows(admissions)),
        };
    }, [admissions, grouped, meritThresholds]);

    const activeMeritBuckets = meritByDepartment[selectedDepartmentTab] || {
        merit1: [],
        merit2: [],
        merit3: [],
    };

    const handleThresholdChange = (key, value) => {
        const numeric = Number(value);
        setMeritThresholds((prev) => ({
            ...prev,
            [key]: Number.isFinite(numeric) ? numeric : prev[key],
        }));
    };

    const applyDefaultThresholds = () => {
        setMeritThresholds({ merit1Min: 80, merit2Min: 60, merit3Min: 35 });
    };
    const totalCount = admissions.length;

    const activeDepartmentRows = grouped[selectedDepartmentTab] || [];
    const totalPages = Math.max(1, Math.ceil(activeDepartmentRows.length / PAGE_SIZE));
    const currentPage = Math.min(pageByDepartment[selectedDepartmentTab] || 1, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedRows = activeDepartmentRows.slice(startIndex, endIndex);

    const filteredPaymentRows = useMemo(() => {
        if (selectedPaymentDepartmentTab === "all") {
            return paymentMetrics.rows;
        }

        return paymentMetrics.rows.filter(
            (row) => row.department === selectedPaymentDepartmentTab
        );
    }, [paymentMetrics.rows, selectedPaymentDepartmentTab]);

    const paymentTotalPages = Math.max(1, Math.ceil(filteredPaymentRows.length / PAGE_SIZE));
    const paymentPage = Math.min(
        Number(searchParams.get("paymentPage") || 1),
        paymentTotalPages
    );
    const paymentStartIndex = (paymentPage - 1) * PAGE_SIZE;
    const paymentEndIndex = paymentStartIndex + PAGE_SIZE;
    const paginatedPaymentRows = filteredPaymentRows.slice(paymentStartIndex, paymentEndIndex);

    const updateView = (view) => {
        const params = new URLSearchParams(searchParams.toString());
        if (view === "payments") {
            params.set("view", "payments");
        } else {
            params.delete("view");
            params.delete("paymentPage");
        }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const handlePaymentPageChange = (newPage) => {
        const safePage = Math.min(Math.max(1, newPage), paymentTotalPages);
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "payments");
        params.set("paymentPage", String(safePage));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage) => {
        setPageByDepartment((prev) => ({
            ...prev,
            [selectedDepartmentTab]: newPage,
        }));
    };

    const loadAdmissions = async () => {
        setLoading(true);
        setError("");

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(`/api/auth/admission?year=${encodeURIComponent(selectedYear)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch admissions");
            }

            setAdmissions(data.admissions || []);
        } catch (err) {
            setError(err.message || "Failed to fetch admissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmissions();
    }, [selectedYear]);

    const downloadBlob = (blob, filename) => {
        const url = globalThis.URL.createObjectURL(blob);
        const link = globalThis.document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        globalThis.URL.revokeObjectURL(url);
    };

    const handleExport = async ({ mode = "both", department = "all" } = {}) => {
        setExporting(true);
        setError("");

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(
                `/api/auth/admission/export?year=${encodeURIComponent(selectedYear)}&mode=${encodeURIComponent(mode)}&department=${encodeURIComponent(department)}&merit1Min=${encodeURIComponent(meritThresholds.merit1Min)}&merit2Min=${encodeURIComponent(meritThresholds.merit2Min)}&merit3Min=${encodeURIComponent(meritThresholds.merit3Min)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to export admissions");
            }

            const blob = await response.blob();
            let suffix = "All_Top";
            if (mode === "top") {
                suffix = "Top";
            } else if (mode === "all") {
                suffix = "All";
            } else if (mode === "merit") {
                suffix = "Merit";
            } else if (mode === "both") {
                suffix = "All_Top_Merit";
            }
            const departmentSuffix = department === "all" ? "All_Departments" : department;
            downloadBlob(blob, `SNK_Admissions_${selectedYear}_${departmentSuffix}_${suffix}.xlsx`);
        } catch (err) {
            setError(err.message || "Failed to export admissions");
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!globalThis.confirm("Delete this admission record?")) return;

        try {
            const token = globalThis.localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login again as admin.");
            }

            const response = await fetch(`/api/auth/admission/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to delete admission");
            }

            setAdmissions((prev) => prev.filter((item) => item.id !== id));
            if (expandedId === id) setExpandedId("");
        } catch (err) {
            setError(err.message || "Failed to delete admission");
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fdf5f5_0%,#f8f6f6_42%,#f4f2f2_100%)] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm md:p-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,auto)] lg:items-end">
                        <div className="max-w-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a1c1c]">Admin Admissions Panel</p>
                            <h5 className="mt-2 text-sm leading-tight font-black text-slate-900 sm:text-md lg:text-xl xl:text-2xl">Department-Wise Admission Records</h5>
                            <p className="mt-2 text-sm text-slate-500">View all student admissions with complete details grouped by selected stream.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <select
                                    value={selectedYear}
                                    onChange={(event) => setSelectedYear(event.target.value)}
                                    className="h-12 min-w-40 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={loadAdmissions}
                                    disabled={loading}
                                    className="h-12 rounded-xl bg-linear-to-r from-[#9f2a2a] via-[#7a1c1c] to-[#5a1414] px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                >
                                    {loading ? "Loading..." : "Refresh Admissions"}
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleExport({ mode: "all" })}
                                    disabled={exporting}
                                    className="h-12 rounded-xl border border-[#7a1c1c]/20 bg-white px-4 text-sm font-semibold text-[#7a1c1c] disabled:opacity-60"
                                >
                                    {exporting ? "Exporting..." : "Export Year List"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExport({ mode: "merit", department: selectedDepartmentTab })}
                                    disabled={exporting}
                                    className="h-12 rounded-xl border border-[#7a1c1c]/20 bg-[#7a1c1c]/10 px-4 text-sm font-semibold text-[#7a1c1c] disabled:opacity-60"
                                >
                                    Export Merit 1/2/3 ({streamLabelMap[selectedDepartmentTab]})
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
                    <div className="mt-4 inline-flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <div className="flex h-12 items-center rounded-xl border border-[#7a1c1c]/10 bg-[#7a1c1c]/5 px-4 text-sm font-semibold text-[#7a1c1c]">
                            Total Admissions: {totalCount}
                        </div>
                        <div className="flex h-12 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
                            Total Revenue: {formatINR(paymentMetrics.totalRevenue)}
                        </div>

                        <button
                            type="button"
                            onClick={() => updateView("admissions")}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${selectedView === "admissions"
                                ? "bg-white text-[#7a1c1c] shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Admissions View
                        </button>
                        <button
                            type="button"
                            onClick={() => updateView("payments")}
                            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${selectedView === "payments"
                                ? "bg-white text-[#7a1c1c] shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Payment History View
                        </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "all", department: "science" })}
                            disabled={exporting}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                            Export Science Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "all", department: "commerce" })}
                            disabled={exporting}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                            Export Commerce Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "all", department: "arts" })}
                            disabled={exporting}
                            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
                        >
                            Export Arts Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport({ mode: "top" })}
                            disabled={exporting}
                            className="h-12 rounded-xl border border-[#7a1c1c]/20 bg-[#7a1c1c]/5 px-4 text-sm font-semibold text-[#7a1c1c] disabled:opacity-60"
                        >
                            Export Top Percentage
                        </button>
                    </div>
                </section>

                {selectedView === "payments" && (
                    <>
                        <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Payment Overview</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                                    {selectedYear}
                                </span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-emerald-800">{formatINR(paymentMetrics.totalRevenue)}</p>
                                </div>
                                <div className="rounded-2xl border border-[#7a1c1c]/15 bg-[#7a1c1c]/5 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a1c1c]">Paid Students</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{paymentMetrics.paidCount}</p>
                                </div>
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending Students</p>
                                    <p className="mt-2 text-2xl font-black text-amber-800">{paymentMetrics.pendingCount}</p>
                                </div>
                                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Science Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(paymentMetrics.revenueByDepartment.science)}</p>
                                </div>
                                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Commerce Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(paymentMetrics.revenueByDepartment.commerce)}</p>
                                </div>
                                <div className="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-pink-700">Arts Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(paymentMetrics.revenueByDepartment.arts)}</p>
                                </div>
                            </div>
                        </section>

                        <section id="payment-history" className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">All Student Payment History</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                                    {filteredPaymentRows.length} students
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {paymentDepartmentTabs.map((tab) => {
                                    const active = tab.id === selectedPaymentDepartmentTab;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPaymentDepartmentTab(tab.id);
                                                handlePaymentPageChange(1);
                                            }}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active
                                                ? "bg-[#7a1c1c] text-white shadow-sm"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredPaymentRows.length === 0 ? (
                                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                    No payment history found for this department in the selected academic year.
                                </div>
                            ) : (
                                <>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full overflow-hidden rounded-2xl border border-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-slate-600">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold">Student</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Application ID</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Department</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Amount</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Payment ID</th>
                                                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedPaymentRows.map((row) => (
                                                    <tr key={row.id} className="border-t border-slate-200 bg-white">
                                                        <td className="px-3 py-2">
                                                            <p className="font-semibold text-slate-900">{row.studentName}</p>
                                                            <p className="text-xs text-slate-500">{row.email} | {row.mobile}</p>
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-700">{row.applicationId}</td>
                                                        <td className="px-3 py-2 uppercase text-slate-700">{row.department || "-"}</td>
                                                        <td className="px-3 py-2 font-semibold text-slate-900">{formatINR(row.amount)}</td>
                                                        <td className="px-3 py-2">
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                                {row.isPaid ? "Paid" : "Pending"}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-700">{row.paymentId}</td>
                                                        <td className="px-3 py-2 text-slate-700">{row.paidAt ? new Date(row.paidAt).toLocaleString("en-GB") : "-"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-medium text-slate-500">
                                            Showing {paymentStartIndex + 1}-{Math.min(paymentEndIndex, filteredPaymentRows.length)} of {filteredPaymentRows.length}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePaymentPageChange(paymentPage - 1)}
                                                disabled={paymentPage === 1}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Prev
                                            </button>

                                            {Array.from({ length: paymentTotalPages }, (_, idx) => idx + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => handlePaymentPageChange(page)}
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${page === paymentPage
                                                        ? "bg-[#7a1c1c] text-white"
                                                        : "border border-slate-200 bg-white text-slate-700"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => handlePaymentPageChange(paymentPage + 1)}
                                                disabled={paymentPage === paymentTotalPages}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )}

                {selectedView !== "payments" && (
                    <>

                        <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Merit Lists (Department Wise)</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-xs font-semibold text-[#7a1c1c]">
                                    {selectedYear} • {streamLabelMap[selectedDepartmentTab]}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Configure and update merit ranges anytime. Changes reflect immediately in display and export.</p>

                            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 1 Minimum %</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={meritThresholds.merit1Min}
                                        onChange={(event) => handleThresholdChange("merit1Min", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 2 Minimum %</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={meritThresholds.merit2Min}
                                        onChange={(event) => handleThresholdChange("merit2Min", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-600">
                                    <span>Merit 3 Minimum %</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={meritThresholds.merit3Min}
                                        onChange={(event) => handleThresholdChange("merit3Min", event.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                    />
                                </label>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={applyDefaultThresholds}
                                        className="h-10 w-full rounded-lg border border-[#7a1c1c]/20 bg-white px-3 text-sm font-semibold text-[#7a1c1c]"
                                    >
                                        Reset Default
                                    </button>
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                                Current ranges: Merit 1 = {meritThresholds.merit1Min}% to 100%, Merit 2 = {meritThresholds.merit2Min}% to {Math.max(0, meritThresholds.merit1Min - 0.01).toFixed(2)}%, Merit 3 = {meritThresholds.merit3Min}% to {Math.max(0, meritThresholds.merit2Min - 0.01).toFixed(2)}%.
                            </p>

                            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                {[
                                    {
                                        title: "Merit 1",
                                        subtitle: `${meritThresholds.merit1Min}% to 100%`,
                                        rows: activeMeritBuckets.merit1,
                                    },
                                    {
                                        title: "Merit 2",
                                        subtitle: `${meritThresholds.merit2Min}% to ${(meritThresholds.merit1Min - 0.01).toFixed(2)}%`,
                                        rows: activeMeritBuckets.merit2,
                                    },
                                    {
                                        title: "Merit 3",
                                        subtitle: `${meritThresholds.merit3Min}% to ${(meritThresholds.merit2Min - 0.01).toFixed(2)}%`,
                                        rows: activeMeritBuckets.merit3,
                                    },
                                ].map((bucket) => (
                                    <div key={bucket.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <h3 className="text-base font-bold text-slate-900">{bucket.title}</h3>
                                        <p className="text-xs text-slate-500">{bucket.subtitle}</p>
                                        <div className="mt-3 space-y-2">
                                            {bucket.rows.length === 0 && (
                                                <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                                                    No students in this merit list.
                                                </p>
                                            )}
                                            {bucket.rows.slice(0, 10).map((row, index) => (
                                                <div key={`${bucket.title}-${row.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-xs font-semibold text-slate-900">{index + 1}. {row.studentName}</p>
                                                    <p className="text-xs text-[#7a1c1c]">{row.percentageText}% • {row.department || "-"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#7a1c1c]/10 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                {departmentTabs.map((tab) => {
                                    const active = tab.id === selectedDepartmentTab;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDepartmentTab(tab.id);
                                                setExpandedId("");
                                            }}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active
                                                ? "bg-[#7a1c1c] text-white shadow-sm"
                                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">{streamLabelMap[selectedDepartmentTab]}</h2>
                                <span className="rounded-full bg-[#7a1c1c]/5 px-3 py-1 text-sm font-semibold text-[#7a1c1c]">
                                    {activeDepartmentRows.length} records
                                </span>
                            </div>

                            {activeDepartmentRows.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                    No admissions in this department.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paginatedRows.map((admission) => {
                                        const studentName =
                                            admission?.payload?.declarationStudentName ||
                                            [
                                                admission?.payload?.firstName,
                                                admission?.payload?.middleName,
                                                admission?.payload?.lastName,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "Student";

                                        const isExpanded = expandedId === admission.id;

                                        return (
                                            <div key={admission.id} className="rounded-2xl border border-slate-200 bg-white">
                                                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7a1c1c] text-white">
                                                            <UserRound className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{studentName}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {admission?.payload?.email || "-"} | {admission?.payload?.mobileNumber || "-"}
                                                            </p>
                                                            <p className="text-xs text-slate-500">Application ID: {admission.applicationId || "-"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedId(isExpanded ? "" : admission.id)}
                                                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                                                        >
                                                            {isExpanded ? "Hide Details" : "View Full Details"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(admission.id)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                                                        <h3 className="mb-3 text-sm font-bold text-slate-800">Submitted Form Data</h3>
                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                            {Object.entries(admission.payload || {}).map(([key, value]) => (
                                                                <div key={key} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{key}</p>
                                                                    <p className="mt-1 wrap-break-word text-sm font-medium text-slate-700">{prettyValue(value)}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <h3 className="mb-3 mt-5 text-sm font-bold text-slate-800">Uploaded Documents</h3>
                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                            {Object.entries(admission.documents || {}).length === 0 && (
                                                                <p className="text-sm text-slate-500">No uploaded documents found.</p>
                                                            )}
                                                            {Object.entries(admission.documents || {}).map(([key, doc]) => (
                                                                <a
                                                                    key={key}
                                                                    href={doc?.url || "#"}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="rounded-xl border border-[#7a1c1c]/10 bg-white px-3 py-2 text-sm font-medium text-[#7a1c1c] hover:bg-[#7a1c1c]/5"
                                                                >
                                                                    {key}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-medium text-slate-500">
                                            Showing {startIndex + 1}-{Math.min(endIndex, activeDepartmentRows.length)} of {activeDepartmentRows.length}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Prev
                                            </button>

                                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => handlePageChange(page)}
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${page === currentPage
                                                        ? "bg-[#7a1c1c] text-white"
                                                        : "border border-slate-200 bg-white text-slate-700"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
