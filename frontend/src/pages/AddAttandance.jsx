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

const initialFormData = () => ({
  studentId: "",
  date: getTodayDate(),
  status: "Present",
  notes: "",
});

const AddAttendance = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attendance/students");
      const studentData =
        response.data?.students || response.data?.data || [];

      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(
        err.response?.data?.message ||
          "Students could not be loaded. Please check the backend and login."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const selectStatus = (status) => {
    setFormData((previous) => ({
      ...previous,
      status,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!formData.studentId) {
      setError("Please select a student.");
      return;
    }

    if (!formData.date) {
      setError("Please select an attendance date.");
      return;
    }

    if (!["Present", "Absent", "Late"].includes(formData.status)) {
      setError("Please select a valid attendance status.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/attendance/manual", {
        studentId: Number(formData.studentId),
        date: formData.date,
        status: formData.status,
        notes: formData.notes.trim() || null,
      });

      setMessage(
        response.data?.message || "Student attendance added successfully."
      );
      setFormData(initialFormData());
    } catch (err) {
      console.error("Add attendance error:", err);
      setError(
        err.response?.data?.message ||
          "Attendance could not be saved. Please check the backend routes and database."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData());
    setMessage("");
    setError("");
  };

  const getStudentName = (student) =>
    student?.name ||
    student?.studentName ||
    student?.fullName ||
    `Student #${student?.id ?? ""}`;

  const statusStyles = {
    Present: {
      selected: "border-[#198754] bg-[#198754] text-white shadow-sm",
      normal:
        "border-green-200 bg-green-50 text-[#198754] hover:bg-green-100",
      badge: "bg-green-100 text-green-700",
    },
    Absent: {
      selected: "border-red-600 bg-red-600 text-white shadow-sm",
      normal: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
      badge: "bg-red-100 text-red-700",
    },
    Late: {
      selected: "border-amber-500 bg-amber-500 text-white shadow-sm",
      normal:
        "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
      badge: "bg-amber-100 text-amber-800",
    },
  };

  const inputClassName = `
    w-full px-4 py-3
    border border-gray-300
    rounded-xl
    outline-none
    transition-all
    bg-white
    text-sm
    text-gray-800
    focus:border-[#198754]
    focus:ring-4
    focus:ring-green-100
  `;

  return (
    <AdminLayout title="Add Attendance">
      <div className="w-full">
        {/* PAGE HEADER */}

        <div
          className="
            bg-gradient-to-r
            from-[#198754]
            to-[#146c43]
            rounded-2xl
            p-6 md:p-8
            text-white
            shadow-lg
            mb-6
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
            "
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-white/20
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  <i className="fa-solid fa-calendar-check text-white"></i>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Add Student Attendance
                </h1>
              </div>

              <p className="text-green-100">
                Record daily attendance for students.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/attendance")}
              className="
                bg-white
                text-[#198754]
                hover:bg-green-50
                px-5 py-3
                rounded-xl
                font-semibold
                transition-all
                shadow-md
                flex
                items-center
                gap-2
              "
            >
              <i className="fa-solid fa-list-check"></i>
              View Attendance
            </button>
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm"
          >
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-1">{message}</p>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm"
          >
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* FORM CARD */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#198754] to-[#146c43] text-white px-6 md:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                <i className="fa-solid fa-clipboard-user"></i>
              </div>
              <div>
                <h2 className="font-bold text-xl">Attendance Information</h2>
                <p className="text-sm text-green-100 mt-1">
                  Select a student, date and attendance status.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#198754]" />
                  <p className="text-sm text-gray-500">Loading students...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      className={inputClassName}
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
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
                      className={inputClassName}
                    />
                  </div>

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
                          className={`rounded-xl border px-4 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-200 ${
                            formData.status === status
                              ? statusStyles[status].selected
                              : statusStyles[status].normal
                          }`}
                        >
                          {status === "Present" && (
                            <i className="fa-solid fa-check mr-2"></i>
                          )}
                          {status === "Absent" && (
                            <i className="fa-solid fa-xmark mr-2"></i>
                          )}
                          {status === "Late" && (
                            <i className="fa-solid fa-clock mr-2"></i>
                          )}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      className={`${inputClassName} resize-none`}
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {formData.notes.length}/500 characters
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-green-100 bg-green-50/70 p-4">
                  <span className="text-sm font-medium text-gray-600">
                    Selected Status
                  </span>
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-bold ${statusStyles[formData.status].badge}`}
                  >
                    {formData.status}
                  </span>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-all text-sm"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loading || students.length === 0}
                    className="px-6 py-3 rounded-xl bg-[#198754] text-white hover:bg-[#146c43] font-semibold transition-all text-sm shadow-md disabled:opacity-50"
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

export default AddAttendance;