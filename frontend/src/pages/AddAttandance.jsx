
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AddAttandance = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    date: getTodayDate(),
    status: "Present",
    notes: "",
  });

  // ==========================================
  // FETCH STUDENTS
  // ==========================================

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend route: GET /api/attendance/students
      const response = await api.get("/attendance/students");

      const studentData =
        response.data?.students ||
        response.data?.data ||
        [];

      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (err) {
      console.error("Fetch students error:", err);

      setError(
        err.response?.data?.message ||
          "Students load nahi ho sake. Backend aur login check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // SELECT ATTENDANCE STATUS
  // ==========================================

  const selectStatus = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // SUBMIT ATTENDANCE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.studentId) {
      setError("Please select a student.");
      return;
    }

    if (!formData.date) {
      setError("Please select attendance date.");
      return;
    }

    if (!["Present", "Absent", "Late"].includes(formData.status)) {
      setError("Please select a valid attendance status.");
      return;
    }

    try {
      setSaving(true);

      // IMPORTANT:
      // Backend route POST /api/attendance/manual
      const response = await api.post("/attendance/manual", {
        studentId: Number(formData.studentId),
        date: formData.date,
        status: formData.status,
        notes: formData.notes.trim() || null,
      });

      setMessage(
        response.data?.message ||
          "Student attendance added successfully."
      );

      setFormData({
        studentId: "",
        date: getTodayDate(),
        status: "Present",
        notes: "",
      });
    } catch (err) {
      console.error("Add attendance error:", err);

      setError(
        err.response?.data?.message ||
          "Attendance save nahi hui. Backend routes aur database check karein."
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
      studentId: "",
      date: getTodayDate(),
      status: "Present",
      notes: "",
    });

    setMessage("");
    setError("");
  };

  // ==========================================
  // STUDENT NAME
  // ==========================================

  const getStudentName = (student) => {
    return (
      student?.name ||
      student?.studentName ||
      student?.fullName ||
      `Student #${student?.id ?? ""}`
    );
  };

  // ==========================================
  // STATUS STYLING
  // ==========================================

  const statusStyles = {
    Present: {
      selected: "bg-green-600 text-white border-green-600",
      normal:
        "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      badge: "bg-green-100 text-green-700",
    },
    Absent: {
      selected: "bg-red-600 text-white border-red-600",
      normal:
        "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      badge: "bg-red-100 text-red-700",
    },
    Late: {
      selected: "bg-amber-500 text-white border-amber-500",
      normal:
        "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      badge: "bg-amber-100 text-amber-700",
    },
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <AdminLayout title="Add Attendance">
      <div className="mx-auto max-w-4xl">

        {/* PAGE HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Add Student Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Record daily attendance for students.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠</span>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* FORM CARD */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="bg-[#075985] px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                📋
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Attendance Information
                </h2>

                <p className="text-sm text-blue-100">
                  Select a student, date and attendance status.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="p-5 md:p-6">

            {loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

                <p className="mt-4 text-gray-500">
                  Loading students...
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* STUDENT */}

                  <div>
                    <label
                      htmlFor="studentId"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Select Student
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <select
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select Student</option>

                      {students.map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {getStudentName(student)}
                          {student.course ? ` — ${student.course}` : ""}
                        </option>
                      ))}
                    </select>

                    {students.length === 0 && (
                      <p className="mt-2 text-xs text-red-500">
                        No students found. Add students first.
                      </p>
                    )}
                  </div>

                  {/* ATTENDANCE DATE */}

                  <div>
                    <label
                      htmlFor="date"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Attendance Date
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* ATTENDANCE STATUS */}

                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-gray-700">
                      Attendance Status
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {["Present", "Absent", "Late"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => selectStatus(status)}
                          aria-pressed={formData.status === status}
                          className={`rounded-xl border px-4 py-3 font-semibold transition ${
                            formData.status === status
                              ? statusStyles[status].selected
                              : statusStyles[status].normal
                          }`}
                        >
                          {status === "Present" && "✓ "}
                          {status === "Absent" && "✕ "}
                          {status === "Late" && "◷ "}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NOTES */}

                  <div className="md:col-span-2">
                    <label
                      htmlFor="notes"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Notes (Optional)
                    </label>

                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      maxLength={500}
                      rows={3}
                      placeholder="Enter any attendance remarks..."
                      className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {formData.notes.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* SELECTED STATUS */}

                <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <span className="text-sm font-medium text-gray-600">
                    Selected Status
                  </span>

                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                      statusStyles[formData.status].badge
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>

                {/* BUTTONS */}

                <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() => navigate("/attendance")}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    View Attendance
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loading || students.length === 0}
                    className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddAttandance;
