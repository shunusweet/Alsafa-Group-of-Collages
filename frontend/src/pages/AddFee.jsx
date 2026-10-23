import { useEffect, useState } from "react";
import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

// ==========================================
// CURRENT MONTH: YYYY-MM
// ==========================================

const getCurrentMonth = () => {
    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0")
    );
};

// ==========================================
// CURRENCY FORMAT
// ==========================================

const formatCurrency = (amount) =>
    "Rs " +
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

// ==========================================
// ADD FEE COMPONENT
// ==========================================

const AddFee = () => {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const [students, setStudents] =
        useState([]);

    const [courses, setCourses] =
        useState([]);

    const [feeAccounts, setFeeAccounts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [formData, setFormData] =
        useState({
            studentId:
                searchParams.get("studentId") || "",
            totalFee: "",
            month: getCurrentMonth(),
            amountPaid: "",
            remarks: ""
        });

    // ==========================================
    // LOAD STUDENTS, COURSES AND EXISTING FEES
    // ==========================================

    useEffect(() => {
        const loadFormData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    studentResponse,
                    courseResponse,
                    feeResponse
                ] = await Promise.all([
                    api.get("/students"),
                    api.get("/courses"),
                    api.get("/fees")
                ]);

                const studentData =
                    studentResponse.data?.students ||
                    studentResponse.data?.data ||
                    [];

                const courseData =
                    courseResponse.data?.courses ||
                    [];

                const feeData =
                    feeResponse.data?.fees ||
                    [];

                setStudents(studentData);
                setCourses(courseData);
                setFeeAccounts(feeData);

                // If opened from a fee record,
                // preselect that student.
                const requestedId =
                    searchParams.get("studentId");

                if (requestedId) {
                    const existing = feeData.find(
                        (fee) =>
                            Number(fee.studentId) ===
                            Number(requestedId)
                    );

                    const paid = existing
                        ? (existing.payments || []).reduce(
                            (sum, payment) =>
                                sum +
                                Number(payment.amountPaid || 0),
                            0
                        )
                        : 0;

                    const balance = existing
                        ? Math.max(
                            0,
                            Number(existing.totalFee) - paid
                        )
                        : 0;

                    setFormData((previous) => ({
                        ...previous,
                        studentId: requestedId,
                        totalFee: existing
                            ? String(existing.totalFee)
                            : "",
                        amountPaid:
                            existing && balance > 0
                                ? balance.toFixed(2)
                                : ""
                    }));
                }
            } catch (err) {
                console.error(
                    "Load Fee Form Data Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load students, courses or fee accounts."
                );
            } finally {
                setLoading(false);
            }
        };

        loadFormData();
    }, [searchParams]);

    // ==========================================
    // SELECTED STUDENT AND FEE ACCOUNT
    // ==========================================

    const selectedStudent = students.find(
        (student) =>
            Number(student.id) ===
            Number(formData.studentId)
    );

    const existingFee = feeAccounts.find(
        (fee) =>
            Number(fee.studentId) ===
            Number(formData.studentId)
    );

    const selectedCourse = courses.find(
        (course) =>
            course.courseName?.trim().toLowerCase() ===
            selectedStudent?.course?.trim().toLowerCase()
    );

    const previousPaid = existingFee
        ? (existingFee.payments || []).reduce(
            (sum, payment) =>
                sum +
                Number(payment.amountPaid || 0),
            0
        )
        : 0;

    const remainingBalance = existingFee
        ? Math.max(
            0,
            Number(existingFee.totalFee) - previousPaid
        )
        : Number(formData.totalFee || 0);

    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "studentId") {
            const fee = feeAccounts.find(
                (item) =>
                    Number(item.studentId) ===
                    Number(value)
            );

            const paid = fee
                ? (fee.payments || []).reduce(
                    (sum, payment) =>
                        sum +
                        Number(payment.amountPaid || 0),
                    0
                )
                : 0;

            const balance = fee
                ? Math.max(
                    0,
                    Number(fee.totalFee) - paid
                )
                : 0;

            setFormData((previous) => ({
                ...previous,
                studentId: value,
                totalFee: fee
                    ? String(fee.totalFee)
                    : "",
                amountPaid:
                    fee && balance > 0
                        ? balance.toFixed(2)
                        : ""
            }));
        } else {
            setFormData((previous) => ({
                ...previous,
                [name]: value
            }));
        }

        setError("");
    };

    // ==========================================
    // SUBMIT MONTHLY PAYMENT
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!selectedStudent) {
            setError("Please select a student.");
            return;
        }

        if (
            !existingFee &&
            Number(formData.totalFee) <= 0
        ) {
            setError(
                "Please enter the student's total fee."
            );
            return;
        }

        const amount = Number(
            formData.amountPaid
        );

        if (!Number.isFinite(amount) || amount <= 0) {
            setError(
                "Payment amount must be greater than zero."
            );
            return;
        }

        if (amount > remainingBalance + 0.001) {
            setError(
                `Payment cannot exceed the remaining balance of ${formatCurrency(remainingBalance)}.`
            );
            return;
        }

        try {
            setSaving(true);

            const response = await api.post(
                "/fees",
                {
                    studentId: Number(
                        formData.studentId
                    ),
                    totalFee: existingFee
                        ? Number(existingFee.totalFee)
                        : Number(formData.totalFee),
                    month: formData.month,
                    amountPaid: amount,
                    remarks: formData.remarks.trim()
                }
            );

            if (response.data?.success) {
                navigate("/fees");
            } else {
                setError(
                    response.data?.message ||
                    "Failed to save fee payment."
                );
            }
        } catch (err) {
            console.error(
                "Save Fee Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Fee could not be saved. Please check the backend."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="Add Fee">

            <div className="space-y-6">

                {/* PAGE HEADER */}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Add Student Fee
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Record a student's monthly payment.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/fees")
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            View Fees
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            ← Back
                        </button>

                    </div>

                </div>

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
                >

                    <h2 className="mb-6 border-b border-gray-100 pb-4 text-lg font-bold text-gray-800">
                        Student and Fee Details
                    </h2>

                    {loading ? (
                        <p className="py-8 text-center text-gray-500">
                            Loading student information...
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {/* SELECT STUDENT */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Select Student *
                                    </label>

                                    <select
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                                    >
                                        <option value="">
                                            Choose student
                                        </option>

                                        {students.map((student) => (
                                            <option
                                                key={student.id}
                                                value={student.id}
                                            >
                                                {student.name}
                                                {" — "}
                                                {student.fatherName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* STUDENT NAME */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Student Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            selectedStudent?.name || ""
                                        }
                                        readOnly
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-gray-700"
                                    />
                                </div>

                                {/* FATHER NAME */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Father Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            selectedStudent?.fatherName || ""
                                        }
                                        readOnly
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-gray-700"
                                    />
                                </div>

                                {/* COURSE / DIPLOMA */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Course / Diploma
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            selectedStudent?.course || ""
                                        }
                                        readOnly
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-gray-700"
                                    />
                                </div>

                                {/* COURSE DURATION */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Course Duration
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            selectedCourse?.courseDuration || ""
                                        }
                                        readOnly
                                        placeholder="Course duration unavailable"
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-gray-700"
                                    />
                                </div>

                                {/* TOTAL FEES */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Total Fees (Rs) *
                                    </label>

                                    <input
                                        type="number"
                                        name="totalFee"
                                        value={formData.totalFee}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="0.01"
                                        required={!existingFee}
                                        disabled={Boolean(existingFee)}
                                        placeholder="Enter total course fee"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                                    />

                                    {existingFee && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Saved total fee cannot be changed here.
                                        </p>
                                    )}
                                </div>

                                {/* PAYMENT MONTH */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Fee Month *
                                    </label>

                                    <input
                                        type="month"
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* AMOUNT PAID */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Amount Paid (Rs) *
                                    </label>

                                    <input
                                        type="number"
                                        name="amountPaid"
                                        value={formData.amountPaid}
                                        onChange={handleChange}
                                        min="0.01"
                                        max={remainingBalance}
                                        step="0.01"
                                        required
                                        placeholder="Enter payment amount"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* REMARKS */}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Remarks
                                    </label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        placeholder="Optional remarks"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                                    />
                                </div>

                            </div>

                            {/* EXISTING ACCOUNT SUMMARY */}

                            {existingFee && (
                                <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-blue-50 p-4 sm:grid-cols-3">

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Previously Paid
                                        </p>

                                        <p className="mt-1 font-bold text-gray-800">
                                            {formatCurrency(previousPaid)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Remaining Balance
                                        </p>

                                        <p className="mt-1 font-bold text-red-700">
                                            {formatCurrency(remainingBalance)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Account Status
                                        </p>

                                        <p className="mt-1 font-bold">
                                            {remainingBalance <= 0
                                                ? "Cleared"
                                                : "Pending"}
                                        </p>
                                    </div>

                                </div>
                            )}

                            {/* BUTTONS */}

                            <div className="mt-6 flex flex-wrap gap-3">

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !selectedStudent ||
                                        (
                                            Boolean(existingFee) &&
                                            remainingBalance <= 0
                                        )
                                    }
                                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Fee Payment"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/fees")
                                    }
                                    className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                            </div>
                        </>
                    )}

                </form>

            </div>
        </AdminLayout>
    );
};

export default AddFee;