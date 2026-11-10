
import { useCallback, useEffect, useState } from "react";
import staffApi from "../services/staffApi";

const formatTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Karachi",
    }
  );
};

function StatCard({ title, value, icon, featured = false, subtitle }) {
  return (
    <div
      className={`group rounded-[22px] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
        featured
          ? "border-emerald-800 bg-gradient-to-br from-[#104b35] to-[#23845b] text-white"
          : "border-slate-100 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-sm font-medium ${
            featured ? "text-emerald-50" : "text-slate-500"
          }`}
        >
          {title}
        </p>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
            featured
              ? "bg-white/15 text-white"
              : "border border-slate-200 bg-white text-[#176747]"
          }`}
        >
          {icon}
        </span>
      </div>

      <h2 className="mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </h2>

      <p
        className={`mt-3 text-xs ${
          featured ? "text-emerald-100" : "text-slate-400"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const style =
    normalized === "present"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "late"
      ? "bg-amber-50 text-amber-700"
      : normalized === "absent"
      ? "bg-red-50 text-red-600"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Not marked"}
    </span>
  );
}

export default function StaffAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await staffApi.get("/staff-attendance/mine");
      setRecords(response.data.records || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleMarkAttendance = async () => {
    try {
      setMarking(true);
      setMessage("");
      setError("");

      const response = await staffApi.post("/staff-attendance/mark");

      setMessage(response.data.message || "Attendance updated.");
      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark attendance."
      );
    } finally {
      setMarking(false);
    }
  };

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const todayRecord = records.find(
    (record) => String(record.attendanceDate).slice(0, 10) === today
  );

  const totalMinutes = records.reduce(
    (sum, record) => sum + Number(record.workingMinutes || 0),
    0
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const completedDays = records.filter(
    (record) => Boolean(record.checkIn && record.checkOut)
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f7f6] p-3 text-slate-900 sm:p-5 lg:p-7">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* Page Heading */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#247653]">
              Staff Portal / Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My Attendance
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your daily check-in, check-out and working hours.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xl text-[#176747]">
              ◷
            </span>

            <div>
              <p className="text-xs text-slate-400">Today's Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(today)}
              </p>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {message && (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            ✓ {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Today's Status"
            value={todayRecord?.status || "Not marked"}
            icon="✓"
            featured
            subtitle="Your current attendance status"
          />

          <StatCard
            title="Check-in Time"
            value={formatTime(todayRecord?.checkIn)}
            icon="◷"
            subtitle="Today's arrival time"
          />

          <StatCard
            title="Total Working Hours"
            value={`${hours}h ${minutes}m`}
            icon="◴"
            subtitle="Combined recorded working time"
          />

          <StatCard
            title="Completed Days"
            value={completedDays}
            icon="▦"
            subtitle="Days with check-in and check-out"
          />
        </section>

        {/* Today's Attendance */}
        <section className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-[#176747]">
                  ◷
                </span>

                <div>
                  <h2 className="text-xl font-bold">
                    Today's Attendance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Record your arrival and departure.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <StatusBadge status={todayRecord?.status} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleMarkAttendance}
              disabled={
                marking || loading || Boolean(todayRecord?.checkOut)
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#176747] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104b35] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">
                {marking
                  ? "◌"
                  : !todayRecord?.checkIn
                  ? "+"
                  : todayRecord?.checkOut
                  ? "✓"
                  : ""}
              </span>

              {marking
                ? "Please wait..."
                : !todayRecord?.checkIn
                ? "Check In"
                : todayRecord?.checkOut
                ? "Attendance Completed"
                : "Check Out"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-[#fbfcfb] p-5 sm:grid-cols-3 sm:p-7">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-medium text-slate-400">
                Attendance Date
              </p>
              <p className="mt-2 font-semibold text-slate-800">
                {formatDate(todayRecord?.attendanceDate || today)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-medium text-slate-400">
                Check-in
              </p>
              <p className="mt-2 font-semibold text-slate-800">
                {formatTime(todayRecord?.checkIn)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-xs font-medium text-slate-400">
                Check-out
              </p>
              <p className="mt-2 font-semibold text-slate-800">
                {formatTime(todayRecord?.checkOut)}
              </p>
            </div>
          </div>

          {todayRecord && (
            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-sm text-slate-500">
                Today's recorded working time
              </p>

              <p className="font-bold text-[#176747]">
                {Math.floor(
                  Number(todayRecord.workingMinutes || 0) / 60
                )}
                h{" "}
                {Number(todayRecord.workingMinutes || 0) % 60}m
              </p>
            </div>
          )}
        </section>

        {/* Attendance History */}
        <section className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-7">
            <div>
              <h2 className="text-xl font-bold">Attendance History</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review your previously recorded attendance.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-[#176747]">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {records.length} Records
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-[#176747]" />
              <p className="mt-4 text-sm text-slate-500">
                Loading attendance...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-[#176747]">
                ▦
              </span>

              <h3 className="mt-4 font-semibold text-slate-800">
                No attendance records yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your attendance history will appear here when records are available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#f8faf8] text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Check-in</th>
                    <th className="px-6 py-4 font-semibold">Check-out</th>
                    <th className="px-6 py-4 font-semibold">Working Hours</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-slate-100 transition hover:bg-[#f8faf8]"
                    >
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-800">
                        {formatDate(record.attendanceDate)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                        {formatTime(record.checkIn)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                        {formatTime(record.checkOut)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 font-medium text-slate-700">
                        {Math.floor(
                          Number(record.workingMinutes || 0) / 60
                        )}
                        h{" "}
                        {Number(record.workingMinutes || 0) % 60}m
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Connect API Staff Portal</p>
          <p>Staff Workspace · Attendance Management</p>
        </footer>
      </div>
    </div>
  );
}
