import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const time = (value) => value ? new Date(value).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";
const dateLabel = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Attandance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

  const loadAttendance = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      const { data } = await api.get("/attendance", { params });
      setAttendance(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (err) {
      setAttendance([]);
      setError(err.response?.data?.message || "Unable to load attendance. Please sign in with an administrator account.");
    } finally { setLoading(false); }
  }, [dateFilter, statusFilter]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attendance.filter((item) => !q || [item.student?.name, item.student?.fatherName, item.student?.course, item.student?.email, String(item.studentId)].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [attendance, search]);

  const changeStatus = async (item, status) => {
    setBusyId(item.id); setError("");
    try { await api.put(`/attendance/${item.id}`, { status }); await loadAttendance(); }
    catch (err) { setError(err.response?.data?.message || "Unable to update attendance status."); }
    finally { setBusyId(null); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete attendance for ${item.student?.name || `student #${item.studentId}`} on ${item.attendanceDate}?`)) return;
    setBusyId(item.id); setError("");
    try { await api.delete(`/attendance/${item.id}`); await loadAttendance(); }
    catch (err) { setError(err.response?.data?.message || "Unable to delete attendance."); }
    finally { setBusyId(null); }
  };

  const counts = { total: filtered.length, present: filtered.filter((x) => x.status === "Present").length, late: filtered.filter((x) => x.status === "Late").length, absent: filtered.filter((x) => x.status === "Absent").length };
  const badge = (status) => status === "Present" ? "bg-emerald-50 text-emerald-700" : status === "Late" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";

  return <AdminLayout title="Student Attendance">
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-slate-800">Student Attendance</h1><p className="mt-1 text-sm text-slate-500">View, filter, update, and manage daily student attendance.</p></div><button onClick={() => navigate("/attendance/add")} className="rounded-xl bg-sky-700 px-5 py-3 font-bold text-white shadow-sm hover:bg-sky-800">+ Add Attendance</button></div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat title="Records shown" value={counts.total} /><Stat title="Present" value={counts.present} /><Stat title="Late" value={counts.late} /><Stat title="Absent" value={counts.absent} /></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_190px_170px_auto]"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, course, email or ID..." className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-600"/><input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3"/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-3"><option>All</option><option>Present</option><option>Late</option><option>Absent</option></select><button onClick={() => { setSearch(""); setDateFilter(""); setStatusFilter("All"); }} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50">Clear filters</button></div></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-800">Attendance records</h2><button onClick={loadAttendance} disabled={loading} className="text-sm font-semibold text-sky-700 disabled:opacity-50">{loading ? "Loading..." : "Refresh"}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-4">Student</th><th className="px-4 py-4">Course</th><th className="px-4 py-4">Date</th><th className="px-4 py-4">Check-in</th><th className="px-4 py-4">Check-out</th><th className="px-4 py-4">Method</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{!loading && filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-4 py-4"><p className="font-semibold text-slate-800">{item.student?.name || `Student #${item.studentId}`}</p><p className="mt-1 text-xs text-slate-500">{item.student?.fatherName || item.student?.email || ""}</p></td><td className="px-4 py-4">{item.student?.course || "—"}</td><td className="px-4 py-4 whitespace-nowrap">{dateLabel(item.attendanceDate)}</td><td className="px-4 py-4">{time(item.checkIn)}</td><td className="px-4 py-4">{time(item.checkOut)}</td><td className="px-4 py-4">{item.source || "—"}</td><td className="px-4 py-4"><select aria-label={`Status for ${item.student?.name || item.studentId}`} value={item.status} disabled={busyId === item.id} onChange={(e) => changeStatus(item, e.target.value)} className={`rounded-full px-3 py-2 text-xs font-bold ${badge(item.status)}`}><option>Present</option><option>Late</option><option>Absent</option></select></td><td className="px-4 py-4"><button onClick={() => remove(item)} disabled={busyId === item.id} className="rounded-lg px-3 py-2 font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Delete</button></td></tr>)}{loading && <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-500">Loading attendance records...</td></tr>}{!loading && !filtered.length && <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-500">No attendance records match these filters.</td></tr>}</tbody></table></div></section>
      <p className="text-xs text-slate-500">Showing up to 1,000 records returned by the server. Attendance records are unique per student per date.</p>
    </div>
  </AdminLayout>;
}

function Stat({ title, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-extrabold text-slate-800">{value}</p></div>; }
