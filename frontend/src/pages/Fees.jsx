import { useEffect, useMemo, useState } from "react";
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// ==========================================
// MONTH FORMAT
// ==========================================
const formatMonth = (month) => {
  if (!month) return "--";

  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1, 1);

  return date.toLocaleDateString("en-PK", {
    month: "short",
    year: "numeric",
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

  return Object.entries(monthlyTotals).sort(
    ([monthA], [monthB]) => monthA.localeCompare(monthB)
  );
};

// ==========================================
// FEES COMPONENT
// ==========================================
const Fees = () => {
  const navigate = useNavigate();

  const [feeAccounts, setFeeAccounts] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [clearingId, setClearingId] = useState(null);

  // ==========================================
  // LOAD FEES AND COURSES
  // ==========================================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [feeResponse, courseResponse] = await Promise.all([
        api.get("/fees"),
        api.get("/courses"),
      ]);

      const feesList =
        feeResponse.data?.fees ||
        feeResponse.data?.data ||
        (Array.isArray(feeResponse.data) ? feeResponse.data : []);

      const coursesList =
        courseResponse.data?.courses ||
        courseResponse.data?.data ||
        (Array.isArray(courseResponse.data) ? courseResponse.data : []);

      setFeeAccounts(feesList);
      setCourses(coursesList);
    } catch (err) {
      console.error("Load Fees Error:", err);

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
    const courseName = student?.course || "";

    const course = courses.find(
      (item) =>
        item.courseName?.trim().toLowerCase() ===
        courseName.trim().toLowerCase()
    );

    return course?.courseDuration || "--";
  };

  // ==========================================
  // CALCULATE ACCOUNT TOTALS
  // ==========================================
  const getAccountTotals = (fee) => {
    const totalFee = Number(fee.totalFee || 0);
    const monthlyFee = Number(fee.monthlyFee || 0);

    const payments = fee.payments || [];

    const paid = payments.reduce(
      (sum, payment) =>
        sum + Number(payment.amountPaid || 0),
      0
    );

    const balance = Math.max(0, totalFee - paid);

    return {
      totalFee,
      monthlyFee,
      paid,
      balance,
      status: balance <= 0.005 ? "Cleared" : "Pending",
    };
  };

  // ==========================================
  // FILTER FEES
  // ==========================================
  const filteredFees = useMemo(() => {
    return feeAccounts.filter((fee) => {
      const student = fee.student || fee.studentInfo || {};
      const totals = getAccountTotals(fee);

      const query = search.trim().toLowerCase();

      const matchesSearch = [
        student.name,
        student.fatherName,
        student.course,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      const matchesStatus =
        statusFilter === "All" ||
        totals.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [feeAccounts, search, statusFilter, courses]);

  // ==========================================
  // STATISTICS
  // ==========================================
  const statistics = useMemo(() => {
    const totalAccounts = feeAccounts.length;

    const totalFeeAmount = feeAccounts.reduce(
      (sum, fee) =>
        sum + getAccountTotals(fee).totalFee,
      0
    );

    const totalMonthlyFee = feeAccounts.reduce(
      (sum, fee) =>
        sum + getAccountTotals(fee).monthlyFee,
      0
    );

    const totalCollected = feeAccounts.reduce(
      (sum, fee) =>
        sum + getAccountTotals(fee).paid,
      0
    );

    const totalOutstanding = feeAccounts.reduce(
      (sum, fee) =>
        sum + getAccountTotals(fee).balance,
      0
    );

    const clearedAccounts = feeAccounts.filter(
      (fee) =>
        getAccountTotals(fee).status === "Cleared"
    ).length;

    return {
      totalAccounts,
      totalFeeAmount,
      totalMonthlyFee,
      totalCollected,
      totalOutstanding,
      clearedAccounts,
    };
  }, [feeAccounts]);

  // ==========================================
  // COLLECTION PERCENTAGE
  // ==========================================
  const collectionPercentage =
    statistics.totalFeeAmount > 0
      ? Math.min(
          100,
          Math.round(
            (statistics.totalCollected /
              statistics.totalFeeAmount) *
              100
          )
        )
      : 0;

  // ==========================================
  // DOWNLOAD EXCEL / CSV REPORT
  // ==========================================
  const downloadReport = (type) => {
    const targetStatus =
      type === "cleared" ? "Cleared" : "Pending";

    const dataToExport = feeAccounts.filter(
      (fee) =>
        getAccountTotals(fee).status === targetStatus
    );

    if (dataToExport.length === 0) {
      alert(
        `No ${targetStatus.toLowerCase()} fee records found to export.`
      );
      return;
    }

    const headers = [
      "Sr #",
      "Student Name",
      "Father Name",
      "Course",
      "Duration",
      "Total Fee (Rs)",
      "Monthly Fee (Rs)",
      "Paid Amount (Rs)",
      "Remaining Balance (Rs)",
      "Status",
    ];

    const rows = dataToExport.map((fee, index) => {
      const student = fee.student || fee.studentInfo || {};
      const totals = getAccountTotals(fee);

      return [
        index + 1,
        `"${String(student.name || "--").replace(/"/g, '""')}"`,
        `"${String(student.fatherName || "--").replace(/"/g, '""')}"`,
        `"${String(student.course || "--").replace(/"/g, '""')}"`,
        `"${String(getCourseDuration(student)).replace(/"/g, '""')}"`,
        totals.totalFee,
        totals.monthlyFee,
        totals.paid,
        totals.balance,
        `"${totals.status}"`,
      ];
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `${
        type === "cleared"
          ? "Cleared_Fees_Report"
          : "Remaining_Fees_Report"
      }_${new Date().toISOString().slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // CLEAR REMAINING FEES
  // ==========================================
  const handleClearFees = async (fee) => {
    const totals = getAccountTotals(fee);

    if (totals.balance <= 0) return;

    const student = fee.student || fee.studentInfo || {};
    const studentName = student.name || "this student";

    const confirmed = window.confirm(
      `Clear the remaining fee for ${studentName}?\n\nRemaining balance: ${formatCurrency(
        totals.balance
      )}`
    );

    if (!confirmed) return;

    try {
      setClearingId(fee.id);
      setError("");
      setMessage("");

      const response = await api.post(
        `/fees/${fee.id}/clear`,
        {
          month: getCurrentMonth(),
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
      console.error("Clear Fees Error:", err);

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
      <div className="min-h-screen w-full space-y-5 bg-[#f6f7f6] p-2 sm:p-3">

        {/* PAGE HEADER */}
        <div className="flex w-full flex-col justify-between gap-5 rounded-[24px] bg-white p-5 shadow-sm lg:flex-row lg:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-[#198754]">
              Finance Overview
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
              Fees Management
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage student fees, payments, and download Excel/CSV reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadReport("cleared")}
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-[#198754] shadow-sm transition hover:bg-green-100"
            >
              <i className="fa-solid fa-file-excel"></i>
              Download Cleared Fees
            </button>

            <button
              type="button"
              onClick={() => downloadReport("remaining")}
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100"
            >
              <i className="fa-solid fa-file-excel"></i>
              Download Remaining Fees
            </button>

            <button
              type="button"
              onClick={() => navigate("/fees/add")}
              className="flex items-center gap-2 rounded-xl bg-[#198754] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43]"
            >
              <span>+</span> Add Fee
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            ✓ {message}
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {/* TOTAL ACCOUNTS */}
          <div className="rounded-[22px] bg-gradient-to-r from-[#198754] to-[#146c43] p-5 text-white shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">
                  Fee Accounts
                </p>

                <p className="mt-4 text-4xl font-bold">
                  {statistics.totalAccounts}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-xl text-white">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>

            <div className="mt-4 text-xs text-green-100">
              Total registered accounts
            </div>
          </div>

          {/* TOTAL FEES */}
          <div className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Fees
                </p>

                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {formatCurrency(statistics.totalFeeAmount)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-[#198754]">
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Total course fee amount
            </p>
          </div>

          {/* MONTHLY FEES */}
          <div className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monthly Fees
                </p>

                <p className="mt-4 text-2xl font-bold text-[#198754]">
                  {formatCurrency(statistics.totalMonthlyFee)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-[#198754]">
                <i className="fa-solid fa-calendar-days"></i>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Combined monthly fee amounts
            </p>
          </div>

          {/* COLLECTED */}
          <div className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Collected
                </p>

                <p className="mt-4 text-2xl font-bold text-[#198754]">
                  {formatCurrency(statistics.totalCollected)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-[#198754]">
                <i className="fa-solid fa-circle-check"></i>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              {collectionPercentage}% collection completed
            </p>
          </div>

          {/* OUTSTANDING */}
          <div className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Outstanding Balance
                </p>

                <p className="mt-4 text-2xl font-bold text-red-600">
                  {formatCurrency(statistics.totalOutstanding)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                <i className="fa-solid fa-wallet"></i>
              </div>
            </div>

            <p className="mt-4 text-xs text-red-400">
              Pending student payments
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="w-full rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Search & Filter
            </h2>

            <p className="text-sm text-gray-400">
              Find student fee accounts quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Search Student
              </label>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, father name or course..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fee Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
              >
                <option value="All">All Accounts</option>
                <option value="Pending">Pending Fees</option>
                <option value="Cleared">Cleared Fees</option>
              </select>
            </div>
          </div>
        </div>

        {/* FEE RECORDS TABLE */}
        <div className="w-full overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Student Fee Records
              </h2>

              <p className="text-sm text-gray-400">
                Showing {filteredFees.length} of {feeAccounts.length} accounts
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              ↻ Refresh Records
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1500px] text-left text-sm">

              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Course</th>
                  <th className="px-5 py-4">Duration</th>
                  <th className="px-5 py-4">Total Fee</th>
                  <th className="px-5 py-4">Monthly Fee</th>
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
                      colSpan={11}
                      className="px-5 py-14 text-center text-gray-400"
                    >
                      Loading fee records...
                    </td>
                  </tr>
                ) : filteredFees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-14 text-center text-gray-400"
                    >
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((fee, index) => {
                    const student = fee.student || fee.studentInfo || {};
                    const totals = getAccountTotals(fee);

                    const monthlyPayments = getMonthlyPayments(
                      fee.payments || []
                    );

                    return (
                      <tr
                        key={fee.id}
                        className="align-top transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-5 text-gray-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* STUDENT */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-[#198754]">
                              {(student.name || "S")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-gray-800">
                                {student.name || "--"}
                              </p>

                              <p className="text-xs text-gray-400">
                                Father: {student.fatherName || "--"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* COURSE */}
                        <td className="px-5 py-5 font-medium text-gray-700">
                          {student.course || "--"}
                        </td>

                        {/* DURATION */}
                        <td className="px-5 py-5 text-gray-500">
                          {getCourseDuration(student)}
                        </td>

                        {/* TOTAL FEE */}
                        <td className="px-5 py-5 font-bold text-gray-800">
                          {formatCurrency(totals.totalFee)}
                        </td>

                        {/* MONTHLY FEE */}
                        <td className="px-5 py-5">
                          <span className="whitespace-nowrap rounded-lg border border-green-100 bg-green-50 px-3 py-2 font-bold text-[#198754]">
                            {formatCurrency(totals.monthlyFee)}
                          </span>
                        </td>

                        {/* PAID */}
                        <td className="px-5 py-5 font-bold text-[#198754]">
                          {formatCurrency(totals.paid)}
                        </td>

                        {/* BALANCE */}
                        <td className="px-5 py-5">
                          <span
                            className={
                              totals.balance > 0
                                ? "font-bold text-red-600"
                                : "font-bold text-[#198754]"
                            }
                          >
                            {formatCurrency(totals.balance)}
                          </span>
                        </td>

                        {/* MONTHLY PAYMENTS */}
                        <td className="px-5 py-5">
                          {monthlyPayments.length === 0 ? (
                            <span className="text-gray-400">
                              No payments
                            </span>
                          ) : (
                            <div className="space-y-1.5">
                              {monthlyPayments.map(([month, amount]) => (
                                <div
                                  key={month}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5"
                                >
                                  <span className="text-xs text-gray-500">
                                    {formatMonth(month)}
                                  </span>

                                  <span className="text-xs font-bold text-gray-800">
                                    {formatCurrency(amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                              totals.status === "Cleared"
                                ? "border-green-200 bg-green-100 text-green-700"
                                : "border-amber-200 bg-amber-100 text-amber-700"
                            }`}
                          >
                            {totals.status === "Cleared"
                              ? "✓ Cleared"
                              : "● Pending"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-5">
                          <div className="flex flex-col items-start gap-2">
                            {totals.balance > 0.005 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/fees/add?studentId=${
                                        student.id || fee.studentId
                                      }`
                                    )
                                  }
                                  className="whitespace-nowrap rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-[#198754] transition hover:bg-green-100"
                                >
                                  + Add Payment
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleClearFees(fee)}
                                  disabled={clearingId === fee.id}
                                  className="whitespace-nowrap rounded-xl bg-[#198754] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#146c43] disabled:opacity-50"
                                >
                                  {clearingId === fee.id
                                    ? "Clearing..."
                                    : "✓ Clear Fees"}
                                </button>
                              </>
                            )}

                            {totals.balance <= 0.005 && (
                              <span className="whitespace-nowrap rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-[#198754]">
                                ✓ Fully Paid
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="flex flex-col justify-between gap-2 border-t border-gray-100 px-6 py-4 text-sm text-gray-400 sm:flex-row">
            <span>
              Showing {filteredFees.length} records
            </span>

            <span>
              Total outstanding:{" "}
              <strong className="text-red-600">
                {formatCurrency(statistics.totalOutstanding)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Fees;
