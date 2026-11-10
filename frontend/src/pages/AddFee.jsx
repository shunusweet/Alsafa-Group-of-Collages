import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const getCurrentMonth = () => {
  const now = new Date();

  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0")
  );
};

const formatCurrency = (amount) =>
  "Rs " +
  Number(amount || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const AddFee = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [feeAccounts, setFeeAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    studentId: searchParams.get("studentId") || "",
    totalFee: "",
    monthlyFee: "",
    month: getCurrentMonth(),
    amountPaid: "",
    remarks: "",
  });

  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [studentResponse, courseResponse, feeResponse] =
          await Promise.all([
            api.get("/students"),
            api.get("/courses"),
            api.get("/fees"),
          ]);

        const studentData =
          studentResponse.data?.students ||
          studentResponse.data?.data ||
          [];

        const courseData =
          courseResponse.data?.courses ||
          courseResponse.data?.data ||
          [];

        const feeData =
          feeResponse.data?.fees ||
          feeResponse.data?.data ||
          [];

        setStudents(studentData);
        setCourses(courseData);
        setFeeAccounts(feeData);

        const requestedId = searchParams.get("studentId");

        if (requestedId) {
          const existing = feeData.find(
            (fee) =>
              Number(fee.studentId) === Number(requestedId)
          );

          const paid = (existing?.payments || []).reduce(
            (sum, payment) =>
              sum + Number(payment.amountPaid || 0),
            0
          );

          const balance = existing
            ? Math.max(0, Number(existing.totalFee) - paid)
            : 0;

          setFormData((previous) => ({
            ...previous,
            studentId: requestedId,
            totalFee: existing
              ? String(existing.totalFee)
              : "",
            monthlyFee: existing
              ? String(existing.monthlyFee || 0)
              : "",
            amountPaid:
              existing && balance > 0
                ? balance.toFixed(2)
                : "",
          }));
        }
      } catch (err) {
        console.error("Load Fee Data Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load fee information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // ==========================================
  // SELECTED RECORDS
  // ==========================================
  const selectedStudent = students.find(
    (student) =>
      Number(student.id) === Number(formData.studentId)
  );

  const existingFee = feeAccounts.find(
    (fee) =>
      Number(fee.studentId) === Number(formData.studentId)
  );

  const selectedCourse = courses.find(
    (course) =>
      course.courseName?.trim().toLowerCase() ===
      selectedStudent?.course?.trim().toLowerCase()
  );

  const previousPaid = (existingFee?.payments || []).reduce(
    (sum, payment) =>
      sum + Number(payment.amountPaid || 0),
    0
  );

  const remainingBalance = existingFee
    ? Math.max(
        0,
        Number(existingFee.totalFee) - previousPaid
      )
    : Number(formData.totalFee || 0);

  // ==========================================
  // HANDLE INPUTS
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "studentId") {
      const fee = feeAccounts.find(
        (item) => Number(item.studentId) === Number(value)
      );

      const paid = (fee?.payments || []).reduce(
        (sum, payment) =>
          sum + Number(payment.amountPaid || 0),
        0
      );

      const balance = fee
        ? Math.max(0, Number(fee.totalFee) - paid)
        : 0;

      setFormData((previous) => ({
        ...previous,
        studentId: value,
        totalFee: fee ? String(fee.totalFee) : "",
        monthlyFee: fee ? String(fee.monthlyFee || 0) : "",
        amountPaid:
          fee && balance > 0 ? balance.toFixed(2) : "",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setError("");
    setSuccessMessage("");
  };

  // ==========================================
  // SUBMIT FEE
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }

    const total = Number(formData.totalFee);
    const monthly = Number(formData.monthlyFee);
    const amount = Number(formData.amountPaid);

    if (!existingFee && (!Number.isFinite(total) || total <= 0)) {
      setError("Please enter a valid total fee.");
      return;
    }

    if (!Number.isFinite(monthly) || monthly < 0) {
      setError("Please enter a valid monthly fee.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    if (amount > remainingBalance + 0.001) {
      setError(
        `Payment cannot exceed remaining balance of ${formatCurrency(
          remainingBalance
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/fees", {
        studentId: Number(formData.studentId),

        totalFee: existingFee
          ? Number(existingFee.totalFee)
          : total,

        monthlyFee: monthly,
        month: formData.month,
        amountPaid: amount,
        remarks: formData.remarks.trim(),
      });

      if (response.data?.success) {
        setSuccessMessage(
          response.data.message ||
            "Fee payment saved successfully."
        );

        setTimeout(() => navigate("/fees"), 700);
      } else {
        setError(
          response.data?.message || "Unable to save fee."
        );
      }
    } catch (err) {
      console.error("Save Fee Error:", err);

      setError(
        err.response?.data?.message ||
          "Fee could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // STYLES
  // ==========================================
  const inputStyle =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100 disabled:bg-gray-100";

  const labelStyle =
    "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <AdminLayout title="Add Fee">
      <div className="w-full space-y-6">

        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#198754] to-[#146c43] p-6 text-white shadow-lg md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-green-100">
              Fee Management
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Add Student Fee
            </h1>

            <p className="mt-2 text-sm text-green-100">
              Manage total fee, monthly fee and student payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/fees")}
            className="rounded-xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/25"
          >
            View Fees
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#198754]" />
            <p className="mt-4 text-sm text-gray-500">
              Loading student information...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="bg-gradient-to-r from-[#198754] to-[#146c43] p-6 text-white">
              <h2 className="text-xl font-bold">
                Fee Collection Form
              </h2>

              <p className="mt-1 text-sm text-green-100">
                Enter student and fee details.
              </p>
            </div>

            <div className="space-y-7 p-6 md:p-8">

              {/* STUDENT INFORMATION */}
              <section>
                <h3 className="mb-5 text-lg font-bold text-gray-800">
                  Student Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                  <div>
                    <label className={labelStyle}>
                      Select Student *
                    </label>

                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className={inputStyle}
                      required
                    >
                      <option value="">Select Student</option>

                      {students.map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.name} - {student.fatherName || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Course
                    </label>

                    <input
                      value={selectedStudent?.course || ""}
                      readOnly
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Course Duration
                    </label>

                    <input
                      value={selectedCourse?.courseDuration || ""}
                      readOnly
                      className={inputStyle}
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100" />

              {/* FEE INFORMATION */}
              <section>
                <h3 className="mb-5 text-lg font-bold text-gray-800">
                  Fee Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                  <div>
                    <label className={labelStyle}>
                      Total Course Fee (Rs) *
                    </label>

                    <input
                      type="number"
                      name="totalFee"
                      min="0"
                      step="0.01"
                      value={formData.totalFee}
                      onChange={handleChange}
                      disabled={Boolean(existingFee)}
                      className={inputStyle}
                      placeholder="Enter total fee"
                      required
                    />

                    {existingFee && (
                      <p className="mt-1 text-xs text-gray-500">
                        Existing total fee cannot be changed here.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Monthly Fees (Rs) *
                    </label>

                    <input
                      type="number"
                      name="monthlyFee"
                      min="0"
                      step="0.01"
                      value={formData.monthlyFee}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="Enter monthly fee"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Payment Month *
                    </label>

                    <input
                      type="month"
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      className={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Amount Paid (Rs) *
                    </label>

                    <input
                      type="number"
                      name="amountPaid"
                      min="0.01"
                      step="0.01"
                      value={formData.amountPaid}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="Enter received amount"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>
                      Remaining Balance
                    </label>

                    <input
                      value={formatCurrency(
                        Math.max(
                          0,
                          remainingBalance -
                            Number(formData.amountPaid || 0)
                        )
                      )}
                      readOnly
                      className={inputStyle}
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100" />

              {/* REMARKS */}
              <section>
                <label className={labelStyle}>
                  Remarks
                </label>

                <textarea
                  name="remarks"
                  rows="3"
                  value={formData.remarks}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="Enter payment remarks..."
                />
              </section>

              {/* BUTTONS */}
              <div className="flex flex-col justify-end gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/fees")}
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#198754] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Fee Payment"}
                </button>
              </div>

            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AddFee;