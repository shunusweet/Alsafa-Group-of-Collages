import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const time = (value) => value ? new Date(value).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";
const dateLabel = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Attandance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

  const loadAttendance = useCallback(async () => {
    setLoading(true); 
    setError("");
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      const { data } = await api.get("/attendance", { params });
      setAttendance(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (err) {
      setAttendance([]);
      setError(err.response?.data?.message || "Unable to load attendance. Please sign in with an administrator account.");
    } finally { 
      setLoading(false); 
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attendance.filter((item) => !q || [item.student?.name, item.student?.fatherName, item.student?.course, item.student?.email, String(item.studentId)].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [attendance, search]);

  const changeStatus = async (item, status) => {
    setBusyId(item.id); 
    setError("");
    try { 
      await api.put(`/attendance/${item.id}`, { status }); 
      await loadAttendance(); 
    }
    catch (err) { 
      setError(err.response?.data?.message || "Unable to update attendance status."); 
    }
    finally { 
      setBusyId(null); 
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete attendance for ${item.student?.name || `student #${item.studentId}`} on ${item.attendanceDate}?`)) return;
    setBusyId(item.id); 
    setError("");
    try { 
      await api.delete(`/attendance/${item.id}`); 
      await loadAttendance(); 
    }
    catch (err) { 
      setError(err.response?.data?.message || "Unable to delete attendance."); 
    }
    finally { 
      setBusyId(null); 
    }
  };

  // ==========================================
  // EXPORT EXCEL / CSV REPORT
  // ==========================================
  const exportToExcel = () => {
    if (filtered.length === 0) {
      setError("No attendance records found to export.");
      return;
    }

    const headers = [
      "Sr #",
      "Student Name",
      "Father Name",
      "Course",
      "Email",
      "Date",
      "Check-In",
      "Check-Out",
      "Method",
      "Status",
    ];

    const rows = filtered.map((item, index) => {
      const student = item.student || {};
      return [
        index + 1,
        `"${String(student.name || `Student #${item.studentId}`).replace(/"/g, '""')}"`,
        `"${String(student.fatherName || "--").replace(/"/g, '""')}"`,
        `"${String(student.course || "--").replace(/"/g, '""')}"`,
        `"${String(student.email || "--").replace(/"/g, '""')}"`,
        `"${String(item.attendanceDate || "--").slice(0, 10)}"`,
        `"${time(item.checkIn)}"`,
        `"${time(item.checkOut)}"`,
        `"${String(item.source || "--").replace(/"/g, '""')}"`,
        `"${String(item.status || "Present")}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Student_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage("Attendance report downloaded successfully!");
    setTimeout(() => setMessage(""), 4000);
  };

  const counts = { 
    total: filtered.length, 
    present: filtered.filter((x) => x.status === "Present").length, 
    late: filtered.filter((x) => x.status === "Late").length, 
    absent: filtered.filter((x) => x.status === "Absent").length 
  };

  const badge = (status) => status === "Present" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : status === "Late" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-rose-100 text-rose-800 border border-rose-200";

  return (
    <AdminLayout title="Student Attendance">
      {/* FontAwesome CDN Link Injector */}
      <div dangerouslySetInnerHTML={{ __html: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />` }} />

      <div className="w-full space-y-6">

        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#198754] to-[#146c43] p-6 md:p-8 text-white shadow-lg lg:flex-row lg:items-center w-full">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
              Administration
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-0.5">
              Student Attendance
            </h1>
            <p className="mt-1 text-sm text-green-100">
              View, filter, update, and manage daily student attendance records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportToExcel}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25 border border-white/25 cursor-pointer"
            >
              <i className="fa-solid fa-file-excel"></i> Download Excel Report
            </button>

            <button
              onClick={() => navigate("/attendance/add")}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#198754] shadow-md transition hover:bg-green-50"
            >
              <span className="text-lg leading-none">+</span> Add Attendance
            </button>
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {/* ================= STATS (Green Background applied) ================= */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
          <Stat title="Records shown" value={counts.total} icon="fa-users" />
          <Stat title="Present" value={counts.present} icon="fa-circle-check" />
          <Stat title="Late" value={counts.late} icon="fa-clock" />
          <Stat title="Absent" value={counts.absent} icon="fa-circle-xmark" />
        </div>

        {/* ================= FILTERS ================= */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm w-full">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
            <p className="text-sm text-gray-400">Filter records by name, date or status.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_200px_180px_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, course, email or ID..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
            <button
              onClick={() => { setSearch(""); setDateFilter(""); setStatusFilter("All"); }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Clear filters
            </button>
          </div>
        </section>

        {/* ================= TABLE (Hover Green Border applied) ================= */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full">
          <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Attendance records</h2>
              <p className="text-xs text-gray-400">Showing {filtered.length} records</p>
            </div>
            <button
              onClick={loadAttendance}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#198754] transition hover:bg-green-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Check-in</th>
                  <th className="px-6 py-4 font-semibold">Check-out</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!loading && filtered.map((item) => {
                  const student = item.student || {};
                  return (
                    <tr key={item.id} className="hover:bg-green-50/30 hover:border-[#198754] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold">
                            {(student.name || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {student.name || `Student #${item.studentId}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {student.fatherName || student.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-700">
                        {student.course || "—"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {dateLabel(item.attendanceDate)}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{time(item.checkIn)}</td>
                      <td className="px-6 py-4 text-gray-600">{time(item.checkOut)}</td>
                      <td className="px-6 py-4 text-gray-600">{item.source || "—"}</td>

                      <td className="px-6 py-4">
                        <select
                          aria-label={`Status for ${student.name || item.studentId}`}
                          value={item.status}
                          disabled={busyId === item.id}
                          onChange={(e) => changeStatus(item, e.target.value)}
                          className={`rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer ${badge(item.status)}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => remove(item)}
                          disabled={busyId === item.id}
                          className="rounded-xl bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 border border-red-200 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {loading && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                      Loading attendance records...
                    </td>
                  </tr>
                )}

                {!loading && !filtered.length && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                      No attendance records match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-xs text-gray-400">
          Showing records returned by the server. Attendance records are unique per student per date.
        </p>

      </div>
    </AdminLayout>
  );
}

function Stat({ title, value, icon }) { 
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50/70 p-5 shadow-sm hover:border-[#198754] transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-3 text-3xl font-bold text-[#198754]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-[#198754] text-lg">
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>
    </div>
  ); 
}