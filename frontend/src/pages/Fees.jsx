import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

// ==========================================
// CURRENT MONTH
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
// MONTH FORMAT
// ==========================================

const formatMonth = (month) => {
    if (!month) {
        return "--";
    }

    const [year, monthNumber] =
        month.split("-").map(Number);

    const date = new Date(
        year,
        monthNumber - 1,
        1
    );

    return date.toLocaleDateString("en-PK", {
        month: "short",
        year: "numeric"
    });
};

// ==========================================
// TOTAL PAYMENTS BY MONTH
// ==========================================

const getMonthlyPayments = (payments = []) => {
    const monthlyTotals = {};

    payments.forEach((payment) => {
        const month = payment.month;

        monthlyTotals[month] =
            (monthlyTotals[month] || 0) +
            Number(payment.amountPaid || 0);
    });

    return Object.entries(monthlyTotals)
        .sort(([monthA], [monthB]) =>
            monthA.localeCompare(monthB)
        );
};

// ==========================================
// VIEW FEES COMPONENT
// ==========================================

const Fees = () => {
    const navigate = useNavigate();

    const [feeAccounts, setFeeAccounts] =
        useState([]);

    const [courses, setCourses] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [clearingId, setClearingId] =
        useState(null);

    // ==========================================
    // LOAD FEES AND COURSES
    // ==========================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                feeResponse,
                courseResponse
            ] = await Promise.all([
                api.get("/fees"),
                api.get("/courses")
            ]);

            setFeeAccounts(
                feeResponse.data?.fees || []
            );

            setCourses(
                courseResponse.data?.courses || []
            );
        } catch (err) {
            console.error(
                "Load Fees Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load fee records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==========================================
    // GET COURSE DURATION
    // ==========================================

    const getCourseDuration = (student) => {
        const courseName =
            student?.course || "";

        const course = courses.find(
            (item) =>
                item.courseName?.trim().toLowerCase() ===
                courseName.trim().toLowerCase()
        );

        return (
            course?.courseDuration ||
            "--"
        );
    };

    // ==========================================
    // CALCULATE ACCOUNT TOTALS
    // ==========================================

    const getAccountTotals = (fee) => {
        const totalFee = Number(
            fee.totalFee || 0
        );

        const payments =
            fee.payments || [];

        const paid = payments.reduce(
            (sum, payment) =>
                sum +
                Number(payment.amountPaid || 0),
            0
        );

        const balance = Math.max(
            0,
            totalFee - paid
        );

        return {
            totalFee,
            paid,
            balance,
            status:
                balance <= 0.005
                    ? "Cleared"
                    : "Pending"
        };
    };

    // ==========================================
    // SEARCH AND FILTER
    // ==========================================

    const filteredFees =
        feeAccounts.filter((fee) => {
            const student =
                fee.student || {};

            const totals =
                getAccountTotals(fee);

            const query =
                search.trim().toLowerCase();

            const matchesSearch = [
                student.name,
                student.fatherName,
                student.course
            ].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(query)
            );

            const matchesStatus =
                statusFilter === "All" ||
                totals.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    // ==========================================
    // STATISTICS
    // ==========================================

    const totalAccounts =
        feeAccounts.length;

    const totalFeeAmount =
        feeAccounts.reduce(
            (sum, fee) =>
                sum +
                getAccountTotals(fee).totalFee,
            0
        );

    const totalCollected =
        feeAccounts.reduce(
            (sum, fee) =>
                sum +
                getAccountTotals(fee).paid,
            0
        );

    const totalOutstanding =
        feeAccounts.reduce(
            (sum, fee) =>
                sum +
                getAccountTotals(fee).balance,
            0
        );

    // ==========================================
    // CLEAR REMAINING FEES
    // ==========================================

    const handleClearFees = async (fee) => {
        const totals =
            getAccountTotals(fee);

        if (totals.balance <= 0) {
            return;
        }

        const studentName =
            fee.student?.name ||
            "this student";

        const confirmed = window.confirm(
            `Clear the remaining fee for ${studentName}?\n\nRemaining balance: ${formatCurrency(totals.balance)}`
        );

        if (!confirmed) {
            return;
        }

        try {
            setClearingId(fee.id);
            setError("");
            setMessage("");

            const response = await api.post(
                `/fees/${fee.id}/clear`,
                {
                    month: getCurrentMonth()
                }
            );

            if (response.data?.success) {
                setMessage(
                    response.data.message ||
                    "Fees cleared successfully."
                );

                await loadData();
            } else {
                setError(
                    response.data?.message ||
                    "Unable to clear fees."
                );
            }
        } catch (err) {
            console.error(
                "Clear Fees Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to clear remaining fees."
            );
        } finally {
            setClearingId(null);
        }
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <AdminLayout title="Fees Management">

            <div className="space-y-6">

                {/* PAGE HEADER */}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Fees Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage student fees, monthly payments and outstanding balances.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/fees/add")
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            + Add Fee
                        </button>

                        <button
                            type="button"
                            onClick={loadData}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            ↻ Refresh
                        </button>

                    </div>

                </div>

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* SUCCESS MESSAGE */}

                {message && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {/* STATISTICS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Fee Accounts
                        </p>

                        <p className="mt-3 text-2xl font-bold text-gray-800">
                            {totalAccounts}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Fees
                        </p>

                        <p className="mt-3 text-2xl font-bold text-gray-800">
                            {formatCurrency(totalFeeAmount)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Collected
                        </p>

                        <p className="mt-3 text-2xl font-bold text-green-700">
                            {formatCurrency(totalCollected)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Outstanding Balance
                        </p>

                        <p className="mt-3 text-2xl font-bold text-red-700">
                            {formatCurrency(totalOutstanding)}
                        </p>
                    </div>

                </div>

                {/* SEARCH AND STATUS FILTER */}

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Search Student
                            </label>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Name, father name or course..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Fee Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
                            >
                                <option value="All">
                                    All Accounts
                                </option>

                                <option value="Pending">
                                    Pending Fees
                                </option>

                                <option value="Cleared">
                                    Cleared Fees
                                </option>
                            </select>
                        </div>

                    </div>

                </div>

                {/* FEE RECORDS TABLE */}

                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

                    <div className="border-b border-gray-100 p-5">

                        <h2 className="text-lg font-bold text-gray-800">
                            Student Fee Records
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Showing {filteredFees.length} of{" "}
                            {feeAccounts.length} accounts
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1350px] text-left text-sm">

                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">#</th>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Course / Diploma</th>
                                    <th className="px-5 py-4">Duration</th>
                                    <th className="px-5 py-4">Total Fee</th>
                                    <th className="px-5 py-4">Paid</th>
                                    <th className="px-5 py-4">Balance</th>
                                    <th className="px-5 py-4">Monthly Payments</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            Loading fee records...
                                        </td>
                                    </tr>
                                ) : filteredFees.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            No fee records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFees.map(
                                        (fee, index) => {
                                            const student =
                                                fee.student || {};

                                            const totals =
                                                getAccountTotals(fee);

                                            const monthlyPayments =
                                                getMonthlyPayments(
                                                    fee.payments || []
                                                );

                                            return (
                                                <tr
                                                    key={fee.id}
                                                    className="align-top hover:bg-gray-50"
                                                >

                                                    <td className="px-5 py-4 text-gray-500">
                                                        {index + 1}
                                                    </td>

                                                    {/* STUDENT */}

                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-gray-800">
                                                            {student.name || "--"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Father:{" "}
                                                            {student.fatherName || "--"}
                                                        </p>
                                                    </td>

                                                    {/* COURSE */}

                                                    <td className="px-5 py-4 text-gray-700">
                                                        {student.course || "--"}
                                                    </td>

                                                    {/* DURATION */}

                                                    <td className="px-5 py-4 text-gray-700">
                                                        {getCourseDuration(student)}
                                                    </td>

                                                    {/* TOTAL FEE */}

                                                    <td className="px-5 py-4 font-semibold text-gray-800">
                                                        {formatCurrency(
                                                            totals.totalFee
                                                        )}
                                                    </td>

                                                    {/* PAID */}

                                                    <td className="px-5 py-4 font-semibold text-green-700">
                                                        {formatCurrency(
                                                            totals.paid
                                                        )}
                                                    </td>

                                                    {/* BALANCE */}

                                                    <td className="px-5 py-4 font-semibold text-red-700">
                                                        {formatCurrency(
                                                            totals.balance
                                                        )}
                                                    </td>

                                                    {/* MONTHLY PAYMENTS */}

                                                    <td className="px-5 py-4">
                                                        {monthlyPayments.length === 0 ? (
                                                            <span className="text-gray-400">
                                                                No payments
                                                            </span>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {monthlyPayments.map(
                                                                    ([month, amount]) => (
                                                                        <div
                                                                            key={month}
                                                                            className="whitespace-nowrap"
                                                                        >
                                                                            <span className="text-gray-500">
                                                                                {formatMonth(month)}:
                                                                            </span>

                                                                            <span className="ml-1 font-semibold text-gray-800">
                                                                                {formatCurrency(amount)}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                totals.status === "Cleared"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                            }`}
                                                        >
                                                            {totals.status}
                                                        </span>
                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col items-start gap-2">

                                                            {totals.balance > 0.005 && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/fees/add?studentId=${student.id}`
                                                                            )
                                                                        }
                                                                        className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                                    >
                                                                        + Add Payment
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleClearFees(fee)
                                                                        }
                                                                        disabled={
                                                                            clearingId === fee.id
                                                                        }
                                                                        className="whitespace-nowrap rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                                    >
                                                                        {clearingId === fee.id
                                                                            ? "Clearing..."
                                                                            : "✓ Clear Fees"}
                                                                    </button>
                                                                </>
                                                            )}

                                                            {totals.balance <= 0.005 && (
                                                                <span className="font-semibold text-green-700">
                                                                    ✓ Fully Paid
                                                                </span>
                                                            )}

                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>
                        </table>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
};

export default Fees;