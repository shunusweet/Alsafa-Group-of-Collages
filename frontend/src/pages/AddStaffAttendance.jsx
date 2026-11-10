import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

// ==========================================
// LOCAL DATE
// ==========================================
const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const AddStaffAttendance = () => {
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    staffId: "",
    date: getToday(),
    checkIn: "",
    checkOut: "",
    status: "Present",
    remarks: "",
  });

  // ==========================================
  // LOAD STAFF
  // ==========================================
  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/staff");

        const data =
          response.data?.staff ||
          response.data?.staffs ||
          response.data?.data ||
          (Array.isArray(response.data) ? response.data : []);

        setStaffList(data);
      } catch (err) {
        console.error("Load Staff Error:", err);
        setError(
          err.response?.data?.message ||
            "Staff list load nahi hui. Backend API check karein."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SELECTED STAFF
  // ==========================================
  const selectedStaff = staffList.find(
    (staff) =>
      String(staff.id ?? staff.staff_id) === String(formData.staffId)
  );

  const getStaffName = (staff) =>
    staff.staffName ||
    staff.staff_name ||
    staff.name ||
    "Unnamed Staff";

  // ==========================================
  // SAVE ATTENDANCE
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!formData.staffId) {
      setError("Please select a staff member.");
      return;
    }

    if (
      formData.checkIn &&
      formData.checkOut &&
      formData.checkOut <= formData.checkIn
    ) {
      setError("Check-out time must be later than check-in time.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/staff-attendance", {
        staffId: Number(formData.staffId),
        date: formData.date,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        status: formData.status,
        remarks: formData.remarks.trim(),
      });

      if (response.data?.success === false) {
        setError(response.data.message || "Attendance save nahi hui.");
        return;
      }

      setMessage("Staff attendance successfully saved!");
      setTimeout(() => navigate("/staff-attendance"), 700);
    } catch (err) {
      console.error("Save Attendance Error:", err);
      setError(
        err.response?.data?.message ||
          "Attendance save nahi hui. Backend API route check karein."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const handleReset = () => {
    setFormData({
      staffId: "",
      date: getToday(),
      checkIn: "",
      checkOut: "",
      status: "Present",
      remarks: "",
    });
    setError("");
    setMessage("");
  };

  // ==========================================
  // STATUS COLOR
  // ==========================================
  const statusColors = {
    Present: "bg-green-50 text-green-700 border border-green-200",
    Absent: "bg-red-50 text-red-700 border border-red-200",
    Late: "bg-amber-50 text-amber-700 border border-amber-200",
    "Half Day": "bg-purple-50 text-purple-700 border border-purple-200",
    Leave: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  // ==========================================
  // REUSABLE INPUT STYLE
  // ==========================================
  const inputStyle =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60";

  const labelStyle = "mb-2 block text-sm font-semibold text-gray-700";

  // ==========================================
  // UI
  // ==========================================
  return (
    <AdminLayout title="Add Staff Attendance">
      <div className="w-full space-y-6">

        {/* ================= PAGE HEADER ================= */}
        <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-clipboard-user"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Staff Management
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                Add Staff Attendance
              </h1>
              <p className="text-green-100 text-sm mt-1">
                Manage and record daily staff check-in, check-out and attendance status.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/staff-attendance")}
              className="bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 border border-white/25 text-sm"
            >
              <i className="fa-solid fa-list-check"></i>
              View Attendance
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white text-[#198754] hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back
            </button>
          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 w-full">
          {/* TOTAL STAFF */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#198754] to-[#146c43] text-white shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-100">
                Total Staff Members
              </p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-xl text-white">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>
            <h2 className="mt-4 text-4xl font-bold">
              {loading ? "..." : staffList.length}
            </h2>
            <p className="mt-2 text-xs text-green-100">
              Registered staff members
            </p>
          </div>

          {/* SELECTED STAFF */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Selected Staff
              </p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-[#198754]">
                <i className="fa-solid fa-user-check"></i>
              </div>
            </div>
            <h2 className="mt-4 truncate text-2xl font-bold text-gray-900">
              {selectedStaff ? getStaffName(selectedStaff) : "Not Selected"}
            </h2>
            <p className="mt-2 text-xs text-gray-400">
              Current attendance member
            </p>
          </div>

          {/* ATTENDANCE STATUS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Attendance Status
              </p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-[#198754]">
                <i className="fa-solid fa-circle-dot"></i>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${
                  statusColors[formData.status]
                }`}
              >
                {formData.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Selected attendance status
            </p>
          </div>
        </div>

        {/* ================= ERROR / SUCCESS ================= */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {/* ================= MAIN FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full"
        >
          {/* FORM HEADER */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#198754] to-[#146c43] text-white px-6 md:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl text-white">
                <i className="fa-solid fa-user-pen"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold">Attendance Details Form</h2>
                <p className="mt-1 text-sm text-green-100">
                  Enter staff information and daily attendance timings.
                </p>
              </div>
            </div>
          </div>

          {/* FORM CONTENT */}
          <div className="space-y-8 p-6 md:p-8">

            {/* STAFF INFORMATION */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold text-base">
                  01
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    Staff & Date Selection
                  </h3>
                  <p className="text-xs text-gray-500">
                    Choose the employee and record attendance date
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Select Staff Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="staffId"
                    value={formData.staffId}
                    onChange={handleChange}
                    required
                    disabled={loading || staffList.length === 0}
                    className={inputStyle}
                  >
                    <option value="">
                      {loading
                        ? "Loading staff..."
                        : staffList.length === 0
                        ? "No staff available"
                        : "Choose staff member"}
                    </option>

                    {staffList.map((staff) => (
                      <option
                        key={staff.id ?? staff.staff_id}
                        value={staff.id ?? staff.staff_id}
                      >
                        {getStaffName(staff)}
                        {staff.fatherName || staff.father_name
                          ? ` — ${staff.fatherName || staff.father_name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>
                    Attendance Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>
              </div>
            </section>

            {/* ATTENDANCE TIMING */}
            <section className="border-t border-gray-100 pt-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold text-base">
                  02
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    Attendance Timing
                  </h3>
                  <p className="text-xs text-gray-500">
                    Specify check-in and check-out schedule
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>Check-in Time</label>
                  <input
                    type="time"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Staff arrival time
                  </p>
                </div>

                <div>
                  <label className={labelStyle}>Check-out Time</label>
                  <input
                    type="time"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Staff departure time
                  </p>
                </div>
              </div>
            </section>

            {/* STATUS & REMARKS */}
            <section className="border-t border-gray-100 pt-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold text-base">
                  03
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    Status & Remarks
                  </h3>
                  <p className="text-xs text-gray-500">
                    Set attendance status and add optional remarks
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelStyle}>
                    Attendance Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Leave">Leave</option>
                  </select>

                  <div className="mt-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        statusColors[formData.status]
                      }`}
                    >
                      {formData.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter additional attendance remarks..."
                    className={`${inputStyle} resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* FORM FOOTER BUTTONS */}
            <div className="flex flex-col-reverse justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Reset Form
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/staff-attendance")}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || loading || staffList.length === 0}
                  className="rounded-xl bg-[#198754] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving Attendance..." : "Save Attendance"}
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* BOTTOM NOTE */}
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-xs text-green-800 flex items-center gap-3 w-full">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-[#198754]">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <p>
            <strong>Note:</strong> Please verify staff information, attendance date, and check-in/check-out timings before saving the attendance record.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AddStaffAttendance;