import { useEffect, useMemo, useState } from "react";
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
// STAFF INFORMATION HELPERS
// ==========================================
const getStaffName = (item) =>
  item?.staffName ||
  item?.staff_name ||
  item?.staff?.staffName ||
  item?.staff?.staff_name ||
  item?.Staff?.staffName ||
  item?.Staff?.staff_name ||
  item?.name ||
  "Unknown Staff";

const getFatherName = (item) =>
  item?.fatherName ||
  item?.father_name ||
  item?.staff?.fatherName ||
  item?.staff?.father_name ||
  item?.Staff?.fatherName ||
  item?.Staff?.father_name ||
  "";

const getTime = (value) => {
  if (!value) return "--";
  return String(value).slice(0, 5);
};

// ==========================================
// WORKING HOURS
// ==========================================
const getHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "--";

  const [inHour, inMinute] = String(checkIn)
    .slice(0, 5)
    .split(":")
    .map(Number);

  const [outHour, outMinute] = String(checkOut)
    .slice(0, 5)
    .split(":")
    .map(Number);

  let minutes =
    outHour * 60 +
    outMinute -
    (inHour * 60 + inMinute);

  if (minutes < 0) minutes += 24 * 60;

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

// ==========================================
// DATE FORMAT
// ==========================================
const formatDate = (date) => {
  if (!date) return "--";

  const dateString = String(date).slice(0, 10);
  const parsedDate = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==========================================
// STATUS STYLING
// ==========================================
const statusClass = (status) => {
  const classes = {
    Present: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Absent: "bg-red-50 text-red-700 border-red-100",
    Late: "bg-amber-50 text-amber-700 border-amber-100",
    "Half Day": "bg-purple-50 text-purple-700 border-purple-100",
    Leave: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return classes[status] || "bg-gray-100 text-gray-600 border-gray-200";
};

// ==========================================
// STAT CARD WITH GREEN HOVER
// ==========================================
const StatCard = ({ label, value, icon, dark = false, subtitle }) => {
  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 shadow-sm ${
        dark
          ? "border-transparent bg-gradient-to-br from-[#198754] to-[#146c43] text-white shadow-lg"
          : "border-gray-100 bg-white text-gray-900 hover:bg-[#198754] hover:text-white hover:shadow-lg group"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-sm font-medium ${
            dark ? "text-green-100" : "text-gray-500 group-hover:text-green-100"
          }`}
        >
          {label}
        </p>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
            dark
              ? "bg-white/20 text-white"
              : "bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white"
          }`}
        >
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </h2>

      <p
        className={`mt-2 text-xs ${
          dark ? "text-green-100" : "text-gray-400 group-hover:text-green-100"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
};

// ==========================================
// VIEW STAFF ATTENDANCE COMPONENT
// ==========================================
const ViewStaffAttendance = () => {
  const navigate = useNavigate();

  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const today = getToday();

  // ==========================================
  // LOAD ATTENDANCE RECORDS
  // ==========================================
  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/staff-attendance");

      const data =
        response.data?.attendance ||
        response.data?.records ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      setAttendanceList(data);
    } catch (err) {
      console.error("Load Staff Attendance Error:", err);
      setError(
        err.response?.data?.message ||
          "Attendance load nahi hui. Backend API routes check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // ==========================================
  // FILTER ATTENDANCE
  // ==========================================
  const filteredAttendance = useMemo(() => {
    return attendanceList.filter((item) => {
      const staffName = getStaffName(item).toLowerCase();
      const fatherName = getFatherName(item).toLowerCase();

      const status =
        item.status ||
        item.attendanceStatus ||
        item.attendance_status ||
        "";

      const date = String(
        item.date ||
          item.attendanceDate ||
          item.attendance_date ||
          ""
      ).slice(0, 10);

      const query = search.toLowerCase().trim();

      const matchesSearch =
        staffName.includes(query) ||
        fatherName.includes(query);

      const matchesDate =
        !filterDate || date === filterDate;

      const matchesStatus =
        filterStatus === "All" || status === filterStatus;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [attendanceList, search, filterDate, filterStatus]);

  // ==========================================
  // TODAY'S STATISTICS
  // ==========================================
  const stats = useMemo(() => {
    const todayRecords = attendanceList.filter(
      (item) =>
        String(
          item.date ||
            item.attendanceDate ||
            item.attendance_date ||
            ""
        ).slice(0, 10) === today
    );

    const getStatus = (item) =>
      item.status ||
      item.attendanceStatus ||
      item.attendance_status;

    return {
      total: todayRecords.length,
      present: todayRecords.filter((item) => getStatus(item) === "Present").length,
      absent: todayRecords.filter((item) => getStatus(item) === "Absent").length,
      late: todayRecords.filter((item) => getStatus(item) === "Late").length,
    };
  }, [attendanceList, today]);

  // ==========================================
  // EXPORT TO EXCEL (.csv)
  // ==========================================
  const exportToExcel = () => {
    if (filteredAttendance.length === 0) {
      setError("No attendance records available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Staff Name,Father Name,Date,Check-In,Check-Out,Working Hours,Status,Remarks\n";

    filteredAttendance.forEach((item) => {
      const name = `"${getStaffName(item).replace(/"/g, '""')}"`;
      const father = `"${getFatherName(item).replace(/"/g, '""')}"`;
      const dateVal = `"${formatDate(item.date || item.attendanceDate || item.attendance_date)}"`;
      const checkIn = `"${getTime(item.checkIn || item.checkInTime || item.check_in)}"`;
      const checkOut = `"${getTime(item.checkOut || item.checkOutTime || item.check_out)}"`;
      const hours = `"${getHours(item.checkIn || item.checkInTime || item.check_in, item.checkOut || item.checkOutTime || item.check_out)}"`;
      const status = `"${item.status || item.attendanceStatus || item.attendance_status || "N/A"}"`;
      const remarks = `"${(item.remarks || "").replace(/"/g, '""')}"`;

      csvContent += [name, father, dateVal, checkIn, checkOut, hours, status, remarks].join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Attendance exported to Excel successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================
  const resetFilters = () => {
    setSearch("");
    setFilterDate("");
    setFilterStatus("All");
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <AdminLayout title="Staff Attendance">
      <div className="w-full space-y-6">

        {/* PAGE HEADER */}
        <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Staff Management
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                Staff Attendance
              </h1>
              <p className="text-green-100 text-sm mt-1">
                Monitor staff check-in, check-out times, and daily attendance records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm border border-white/30"
            >
              <i className="fa-solid fa-file-excel"></i>
              Export Excel Data
            </button>

            <button
              type="button"
              onClick={loadAttendance}
              disabled={loading}
              className="bg-white text-[#198754] hover:bg-green-50 px-5 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <i className="fa-solid fa-rotate"></i>
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/staff-attendance/add")}
              className="bg-white text-[#198754] hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <i className="fa-solid fa-plus"></i>
              Add Attendance
            </button>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 w-full">
          <StatCard
            label="Today's Records"
            value={stats.total}
            icon="fa-clipboard-list"
            dark={true}
            subtitle="Total attendance entries today"
          />
          <StatCard
            label="Present Staff"
            value={stats.present}
            icon="fa-user-check"
            subtitle="Staff marked present today"
          />
          <StatCard
            label="Absent Staff"
            value={stats.absent}
            icon="fa-user-xmark"
            subtitle="Staff marked absent today"
          />
          <StatCard
            label="Late Arrivals"
            value={stats.late}
            icon="fa-clock"
            subtitle="Staff arriving late today"
          />
        </div>

        {/* ATTENDANCE TABLE CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full">
          
          {/* SEARCH & FILTERS HEADER */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Attendance Records
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Search, filter and view all staff attendance entries.
                </p>
              </div>

              <div className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-[#198754]">
                {filteredAttendance.length} Records Found
              </div>
            </div>

            {/* FILTERS */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              
              {/* SEARCH */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Search Staff
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search staff or father name..."
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* DATE FILTER */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Filter By Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(event) => setFilterDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                />
              </div>

              {/* STATUS FILTER */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Filter By Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

            </div>

            {/* RESET */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#198754] transition hover:underline flex items-center gap-1.5"
              >
                <i className="fa-solid fa-rotate-right"></i> Clear All Filters
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-4 font-semibold">#</th>
                  <th className="px-5 py-4 font-semibold">Staff Member</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Check-in</th>
                  <th className="px-5 py-4 font-semibold">Check-out</th>
                  <th className="px-5 py-4 font-semibold">Working Hours</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Remarks</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#198754]" />
                        <p className="text-sm text-gray-500 font-medium">Loading attendance records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-2xl text-[#198754]">
                          <i className="fa-solid fa-folder-open"></i>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          No Attendance Records Found
                        </h3>
                        <p className="max-w-sm text-sm text-gray-500">
                          No records match your search query or selected filters.
                        </p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-sm font-semibold text-[#198754] hover:underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((item, index) => {
                    const checkIn =
                      item.checkIn ||
                      item.checkInTime ||
                      item.check_in;

                    const checkOut =
                      item.checkOut ||
                      item.checkOutTime ||
                      item.check_out;

                    const status =
                      item.status ||
                      item.attendanceStatus ||
                      item.attendance_status;

                    const date =
                      item.date ||
                      item.attendanceDate ||
                      item.attendance_date;

                    return (
                      <tr
                        key={item.id || index}
                        className="transition-colors hover:bg-green-50/50 group"
                      >
                        <td className="px-5 py-4 font-semibold text-gray-500 group-hover:text-[#198754]">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 font-bold text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-colors">
                              {getStaffName(item).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 group-hover:text-[#198754]">
                                {getStaffName(item)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {getFatherName(item) || "Staff Member"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-gray-600 font-medium">
                          {formatDate(date)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-bold text-[#198754]">
                            {getTime(checkIn)}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-bold text-red-600">
                            {getTime(checkOut)}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            {getHours(checkIn, checkOut)}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusClass(status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {status || "Not Set"}
                          </span>
                        </td>

                        <td className="max-w-[200px] px-5 py-4 text-xs text-gray-600">
                          <span className="block truncate" title={item.remarks || ""}>
                            {item.remarks || "--"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="flex flex-col justify-between gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">
              Showing <strong className="text-gray-800">{filteredAttendance.length}</strong> of{" "}
              <strong className="text-gray-800">{attendanceList.length}</strong> attendance records
            </p>
            <p className="text-xs font-bold text-[#198754]">
              Staff Attendance Portal
            </p>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default ViewStaffAttendance;