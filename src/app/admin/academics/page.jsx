"use client";

import { Filter, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */

const standardOptions = [
    { label: "11th", value: "11th" },
    { label: "12th", value: "12th" },
];

const departmentOptions = [
    { label: "Arts", value: "arts" },
    { label: "Commerce", value: "commerce" },
    { label: "Science", value: "science" },
];

const subjectTypeOptions = ["Theory", "Theory & Practical"];

const initialSubject = {
    name: "",
    type: "Theory",
    description: "",
};

const initialFormData = {
    standard: "11th",
    department: "arts",
    title: "",
    subtitle: "",
    overviewPrimary: "",
    overviewSecondary: "",
    subjects: [{ ...initialSubject }],
};

export default function AdminAcademicsPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [standardFilter, setStandardFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [syllabusFile, setSyllabusFile] = useState(null);
    const [syllabusName, setSyllabusName] = useState("");

    const stats = useMemo(() => {
        return courses.reduce(
            (acc, course) => {
                acc.total += 1;
                acc[course.standard] = (acc[course.standard] || 0) + 1;
                acc[course.department] = (acc[course.department] || 0) + 1;
                return acc;
            },
            { total: 0, "11th": 0, "12th": 0, arts: 0, commerce: 0, science: 0 }
        );
    }, [courses]);

    const filteredCourses = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesStandard = !standardFilter || course.standard === standardFilter;
            const matchesDepartment = !departmentFilter || course.department === departmentFilter;
            const matchesSearch = !search || [
                course.title,
                course.subtitle,
                course.standard,
                course.department,
                ...(course.subjects || []).map((subject) => subject.name),
            ]
                .join(" ")
                .toLowerCase()
                .includes(search);

            return matchesStandard && matchesDepartment && matchesSearch;
        });
    }, [courses, searchTerm, standardFilter, departmentFilter]);

    const hasActiveFilters = Boolean(searchTerm.trim() || standardFilter || departmentFilter);

    let tableContent = null;
    if (loading) {
        tableContent = (
            <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Loading courses...
                </td>
            </tr>
        );
    } else if (filteredCourses.length === 0) {
        tableContent = (
            <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No academic courses found
                </td>
            </tr>
        );
    } else {
        tableContent = filteredCourses.map((course) => (
            <tr key={course.id} className="border-t border-gray-100 hover:bg-stone-50/80 transition-colors">
                <td className="px-4 py-4 font-semibold text-gray-900">{course.title}</td>
                <td className="px-4 py-4 text-gray-700">{course.standard}</td>
                <td className="px-4 py-4 capitalize text-gray-700">{course.department}</td>
                <td className="px-4 py-4 text-gray-700">{course.subjects?.length || 0}</td>
                <td className="px-4 py-4 text-gray-700 max-w-xs truncate">{course.subtitle}</td>
                <td className="px-4 py-4">
                    {course.syllabusUrl ? (
                        <a
                            href={course.syllabusUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                            View Syllabus
                        </a>
                    ) : (
                        <span className="text-gray-400 text-xs">No file</span>
                    )}
                </td>
                <td className="px-4 py-4 text-gray-500">
                    {new Date(course.updatedAt || course.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openEditModal(course)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(course)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/academics", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch academic courses");
            }

            setCourses(data.courses || []);
        } catch (error) {
            toast.error(error.message || "Failed to load academic courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const resetForm = () => {
        setFormData(initialFormData);
        setSyllabusFile(null);
        setSyllabusName("");
    };

    const closeAddModal = () => {
        resetForm();
        setIsAddModalOpen(false);
    };

    const closeEditModal = () => {
        resetForm();
        setSelectedCourse(null);
        setIsEditModalOpen(false);
    };

    const openEditModal = (course) => {
        setSelectedCourse(course);
        setFormData({
            standard: course.standard,
            department: course.department,
            title: course.title,
            subtitle: course.subtitle,
            overviewPrimary: course.overviewPrimary,
            overviewSecondary: course.overviewSecondary,
            subjects: Array.isArray(course.subjects) && course.subjects.length > 0
                ? course.subjects
                : [{ ...initialSubject }],
        });
        setSyllabusFile(null);
        setSyllabusName(course.syllabusFileName || "");
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (course) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubjectChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            subjects: prev.subjects.map((subject, subjectIndex) => (
                subjectIndex === index ? { ...subject, [field]: value } : subject
            )),
        }));
    };

    const addSubjectRow = () => {
        setFormData((prev) => ({
            ...prev,
            subjects: [...prev.subjects, { ...initialSubject }],
        }));
    };

    const removeSubjectRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            subjects: prev.subjects.length === 1
                ? prev.subjects
                : prev.subjects.filter((_, subjectIndex) => subjectIndex !== index),
        }));
    };

    const handleSyllabusChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSyllabusFile(file);
        setSyllabusName(file.name);
    };

    const buildPayload = (includeId = false) => {
        const payload = new FormData();
        if (includeId && selectedCourse?.id) {
            payload.append("id", selectedCourse.id);
        }

        payload.append("standard", formData.standard);
        payload.append("department", formData.department);
        payload.append("title", formData.title.trim());
        payload.append("subtitle", formData.subtitle.trim());
        payload.append("overviewPrimary", formData.overviewPrimary.trim());
        payload.append("overviewSecondary", formData.overviewSecondary.trim());
        payload.append("subjects", JSON.stringify(formData.subjects));

        if (syllabusFile) {
            payload.append("syllabus", syllabusFile);
        }

        return payload;
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!syllabusFile) {
            toast.error("Syllabus file is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/academics", {
                method: "POST",
                body: buildPayload(),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create course");
            }

            toast.success("Academic course added successfully");
            closeAddModal();
            fetchCourses();
        } catch (error) {
            toast.error(error.message || "Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/academics", {
                method: "PUT",
                body: buildPayload(true),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update course");
            }

            toast.success("Academic course updated successfully");
            closeEditModal();
            fetchCourses();
        } catch (error) {
            toast.error(error.message || "Failed to update course");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCourse?.id) {
            toast.error("Course not found");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/academics?id=${encodeURIComponent(selectedCourse.id)}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete course");
            }

            toast.success("Academic course deleted permanently");
            setIsDeleteModalOpen(false);
            setSelectedCourse(null);
            fetchCourses();
        } catch (error) {
            toast.error(error.message || "Failed to delete course");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f3f1] p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-[28px] border border-stone-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Academics Records</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Academics Management</h1>
                            <p className="mt-2 text-sm text-slate-500">Manage course structure, subjects, and syllabus files in one place.</p>
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#7a1c1c] px-5 font-semibold text-white transition hover:bg-[#9f2a2a]"
                        >
                            <Plus size={18} />
                            Add Academic Course
                        </button>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <StatCard label="Total Courses" value={String(stats.total)} tone="default" />
                    <StatCard label="11th" value={String(stats["11th"])} tone="rose" />
                    <StatCard label="12th" value={String(stats["12th"])} tone="rose" />
                    <StatCard label="Arts" value={String(stats.arts)} tone="blue" />
                    <StatCard label="Commerce" value={String(stats.commerce)} tone="amber" />
                    <StatCard label="Science" value={String(stats.science)} tone="green" />
                </div>

                <section className="rounded-[28px] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
                    <div className="border-b border-stone-200 px-6 py-5">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">All Academic Courses</h2>
                                <p className="mt-1 text-sm text-slate-500">Showing {filteredCourses.length} of {courses.length} records</p>
                            </div>

                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_190px_auto]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search title, department, subject..."
                                        className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
                                    />
                                </div>

                                <FilterSelect
                                    icon={<Filter size={16} />}
                                    value={standardFilter}
                                    onChange={(event) => setStandardFilter(event.target.value)}
                                    placeholder="All Standards"
                                    options={standardOptions}
                                />

                                <FilterSelect
                                    icon={<Filter size={16} />}
                                    value={departmentFilter}
                                    onChange={(event) => setDepartmentFilter(event.target.value)}
                                    placeholder="All Departments"
                                    options={departmentOptions}
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStandardFilter("");
                                        setDepartmentFilter("");
                                    }}
                                    disabled={!hasActiveFilters}
                                    className="h-11 rounded-2xl border border-stone-200 px-4 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 w-full lg:w-auto"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-stone-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Course</th>
                                    <th className="px-4 py-3 text-left font-semibold">Standard</th>
                                    <th className="px-4 py-3 text-left font-semibold">Department</th>
                                    <th className="px-4 py-3 text-left font-semibold">Subjects</th>
                                    <th className="px-4 py-3 text-left font-semibold">Subtitle</th>
                                    <th className="px-4 py-3 text-left font-semibold">Syllabus</th>
                                    <th className="px-4 py-3 text-left font-semibold">Updated</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                    </div>
                </section>
            </div>

            {isAddModalOpen && (
                <AcademicModal
                    heading="Add Academic Course"
                    submitLabel="Save Course"
                    formData={formData}
                    syllabusName={syllabusName}
                    isSubmitting={isSubmitting}
                    onClose={closeAddModal}
                    onSubmit={handleCreate}
                    onFieldChange={handleFieldChange}
                    onSubjectChange={handleSubjectChange}
                    onAddSubject={addSubjectRow}
                    onRemoveSubject={removeSubjectRow}
                    onSyllabusChange={handleSyllabusChange}
                />
            )}

            {isEditModalOpen && (
                <AcademicModal
                    heading="Edit Academic Course"
                    submitLabel="Update Course"
                    formData={formData}
                    syllabusName={syllabusName}
                    isSubmitting={isSubmitting}
                    onClose={closeEditModal}
                    onSubmit={handleUpdate}
                    onFieldChange={handleFieldChange}
                    onSubjectChange={handleSubjectChange}
                    onAddSubject={addSubjectRow}
                    onRemoveSubject={removeSubjectRow}
                    onSyllabusChange={handleSyllabusChange}
                />
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-semibold text-slate-900">Delete Course Permanently</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            This will permanently delete {" "}
                            <span className="font-semibold text-slate-900">{selectedCourse?.title || "this course"}</span>,
                            including its syllabus file from Cloudinary.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedCourse(null);
                                }}
                                className="rounded-2xl border border-stone-200 px-4 py-2 font-medium text-slate-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="rounded-2xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isSubmitting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AcademicModal({
    heading,
    submitLabel,
    formData,
    syllabusName,
    isSubmitting,
    onClose,
    onSubmit,
    onFieldChange,
    onSubjectChange,
    onAddSubject,
    onRemoveSubject,
    onSyllabusChange,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900">{heading}</h3>
                        <p className="mt-1 text-sm text-slate-500">Structure the course, upload syllabus access, and define subject details.</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl px-3 py-2 text-slate-500 hover:bg-stone-100 hover:text-slate-800">
                        X
                    </button>
                </div>

                <form onSubmit={onSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <section className="space-y-5 rounded-3xl border border-stone-200 bg-stone-50/70 p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <SelectField
                                    id="standard"
                                    label="Standard"
                                    name="standard"
                                    value={formData.standard}
                                    onChange={onFieldChange}
                                    options={standardOptions}
                                />
                                <SelectField
                                    id="department"
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={onFieldChange}
                                    options={departmentOptions}
                                />
                            </div>

                            <InputField
                                id="title"
                                label="Course Title"
                                name="title"
                                value={formData.title}
                                onChange={onFieldChange}
                                placeholder="Example: 11th Commerce"
                            />

                            <InputField
                                id="subtitle"
                                label="Subtitle"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={onFieldChange}
                                placeholder="Example: Foundation Year - Commerce Stream"
                            />

                            <TextAreaField
                                id="overviewPrimary"
                                label="Overview Paragraph 1"
                                name="overviewPrimary"
                                value={formData.overviewPrimary}
                                onChange={onFieldChange}
                                placeholder="Write the primary overview paragraph"
                            />

                            <TextAreaField
                                id="overviewSecondary"
                                label="Overview Paragraph 2"
                                name="overviewSecondary"
                                value={formData.overviewSecondary}
                                onChange={onFieldChange}
                                placeholder="Write the secondary overview paragraph"
                            />

                            <div>
                                <label htmlFor="syllabus" className="block text-sm font-medium text-slate-700 mb-2">
                                    Syllabus File
                                </label>
                                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-stone-300 bg-white px-4 py-5 text-center hover:border-[#7a1c1c]/30 hover:bg-rose-50/30">
                                    <span className="text-sm font-medium text-slate-700">
                                        {syllabusName || "Upload syllabus PDF / document"}
                                    </span>
                                    <span className="mt-1 text-xs text-slate-500">Click to choose a syllabus file from your device</span>
                                    <input id="syllabus" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onSyllabusChange} />
                                </label>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-stone-200 bg-white p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-900">Subjects</h4>
                                    <p className="mt-1 text-sm text-slate-500">Add, reorder mentally, and maintain the course subject list.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onAddSubject}
                                    className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-100"
                                >
                                    Add Subject
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                {formData.subjects.map((subject, index) => (
                                    <div key={`${subject.name}-${index}`} className="rounded-[22px] border border-stone-200 bg-stone-50/80 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                                                Subject {index + 1}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveSubject(index)}
                                                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <InputField
                                                id={`subject-name-${index}`}
                                                label="Subject Name"
                                                name={`subject-name-${index}`}
                                                value={subject.name}
                                                onChange={(event) => onSubjectChange(index, "name", event.target.value)}
                                                placeholder="Enter subject name"
                                            />

                                            <SelectField
                                                id={`subject-type-${index}`}
                                                label="Type"
                                                name={`subject-type-${index}`}
                                                value={subject.type}
                                                onChange={(event) => onSubjectChange(index, "type", event.target.value)}
                                                options={subjectTypeOptions.map((type) => ({ label: type, value: type }))}
                                            />

                                            <TextAreaField
                                                id={`subject-description-${index}`}
                                                label="Description"
                                                name={`subject-description-${index}`}
                                                value={subject.description}
                                                onChange={(event) => onSubjectChange(index, "description", event.target.value)}
                                                placeholder="Describe the subject"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-stone-200 px-4 py-2 font-medium text-slate-700 hover:bg-stone-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-2xl bg-[#7a1c1c] px-5 py-2 font-semibold text-white hover:bg-[#9f2a2a] disabled:opacity-60"
                        >
                            {isSubmitting ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({ label, value, tone }) {
    const toneClasses = {
        default: "border-stone-200 text-slate-900",
        rose: "border-rose-200 text-rose-800",
        blue: "border-blue-200 text-blue-800",
        amber: "border-amber-200 text-amber-800",
        green: "border-emerald-200 text-emerald-800",
    };

    return (
        <div className={`rounded-3xl border bg-white p-5 shadow-sm ${toneClasses[tone] || toneClasses.default}`}>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
        </div>
    );
}

function FilterSelect({ icon, value, onChange, placeholder, options }) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {icon}
            </div>
            <select
                value={value}
                onChange={onChange}
                className="h-11 w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50 pl-9 pr-4 outline-none transition focus:border-[#7a1c1c]/30 focus:bg-white"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function InputField({ id, label, name, value, onChange, placeholder }) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-[#7a1c1c]/30 focus:ring-2 focus:ring-[#7a1c1c]/10"
                required
            />
        </div>
    );
}

function SelectField({ id, label, name, value, onChange, options }) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 outline-none transition focus:border-[#7a1c1c]/30 focus:ring-2 focus:ring-[#7a1c1c]/10"
                required
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextAreaField({ id, label, name, value, onChange, placeholder, rows = 4 }) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-[#7a1c1c]/30 focus:ring-2 focus:ring-[#7a1c1c]/10 resize-none"
                required
            />
        </div>
    );
}
