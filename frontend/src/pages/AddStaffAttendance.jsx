import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

// Local date in YYYY-MM-DD format
const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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
    remarks: ""
  });

  // ==========================================
  // GET STAFF DATA
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
          (Array.isArray(response.data)
            ? response.data
            : []);

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
  // FORM INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

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
      formData.checkIn === formData.checkOut
    ) {
      setError(
        "Check-in aur check-out time same nahi ho sakte."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await api.post(
        "/staff-attendance",
        {
          staffId: Number(formData.staffId),
          date: formData.date,
          checkIn: formData.checkIn || null,
          checkOut: formData.checkOut || null,
          status: formData.status,
          remarks: formData.remarks.trim()
        }
      );

      if (
        response.data?.success === false
      ) {
        setError(
          response.data.message ||
            "Attendance save nahi hui."
        );
        return;
      }

      // Save ke baad View page par redirect
      navigate("/staff-attendance");
    } catch (err) {
      console.error(
        "Save Staff Attendance Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Attendance save nahi hui. Backend API route check karein."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add Staff Attendance">
      <div className="space-y-6">
        {/* PAGE HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add Staff Attendance
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Staff ki daily attendance record karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/staff-attendance")
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Staff Attendance
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

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
        >
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Attendance Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Staff member, date, timing aur status enter karein.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* STAFF */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Staff *
              </label>

              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                required
                disabled={loading || staffList.length === 0}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
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
                    key={staff.id}
                    value={staff.id}
                  >
                    {staff.staffName || staff.name || "Unnamed Staff"}
                    {staff.fatherName
                      ? ` — ${staff.fatherName}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Status *
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            {/* CHECK-IN */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Check-in Time
              </label>

              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* CHECK-OUT */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Check-out Time
              </label>

              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-red-500"
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

          {/* BUTTONS */}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={
                saving ||
                loading ||
                staffList.length === 0
              }
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Attendance"}
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData({
                  staffId: "",
                  date: getToday(),
                  checkIn: "",
                  checkOut: "",
                  status: "Present",
                  remarks: ""
                })
              }
              disabled={saving}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddStaffAttendance;