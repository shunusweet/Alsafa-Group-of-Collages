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
  item?.staff?.staffName ||
  item?.Staff?.staffName ||
  item?.name ||
  "Unknown Staff";

const getFatherName = (item) =>
  item?.fatherName ||
  item?.staff?.fatherName ||
  item?.Staff?.fatherName ||
  "";

const getTime = (value) => {
  if (!value) return "--";

  return String(value).slice(0, 5);
};

// ==========================================
// WORKING HOURS
// ==========================================

const getHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return "--";
  }

  const [inHour, inMinute] =
    String(checkIn)
      .slice(0, 5)
      .split(":")
      .map(Number);

  const [outHour, outMinute] =
    String(checkOut)
      .slice(0, 5)
      .split(":")
      .map(Number);

  let minutes =
    outHour * 60 +
    outMinute -
    (inHour * 60 + inMinute);

  // Supports overnight shifts.
  if (minutes < 0) {
    minutes += 24 * 60;
  }

  return `${Math.floor(minutes / 60)}h ${
    minutes % 60
  }m`;
};

// ==========================================
// DATE FORMAT
// ==========================================

const formatDate = (date) => {
  if (!date) return "--";

  const dateString =
    String(date).slice(0, 10);

  const parsedDate =
    new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};

// ==========================================
// STATUS STYLING
// ==========================================

const statusClass = (status) => {
  const classes = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-amber-100 text-amber-700",
    "Half Day": "bg-purple-100 text-purple-700",
    Leave: "bg-blue-100 text-blue-700"
  };

  return (
    classes[status] ||
    "bg-gray-100 text-gray-700"
  );
};

// ==========================================
// VIEW STAFF ATTENDANCE COMPONENT
// ==========================================

const ViewStaffAttendance = () => {
  const navigate = useNavigate();

  const [attendanceList, setAttendanceList] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filterDate, setFilterDate] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("All");

  const today = getToday();

  // ==========================================
  // LOAD ATTENDANCE RECORDS
  // ==========================================

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get("/staff-attendance");

      const data =
        response.data?.attendance ||
        response.data?.records ||
        response.data?.data ||
        (Array.isArray(response.data)
          ? response.data
          : []);

      setAttendanceList(data);
    } catch (err) {
      console.error(
        "Load Staff Attendance Error:",
        err
      );

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
      const staffName =
        getStaffName(item).toLowerCase();

      const fatherName =
        getFatherName(item).toLowerCase();

      const status =
        item.status ||
        item.attendanceStatus ||
        "";

      const date = String(
        item.date ||
          item.attendanceDate ||
          ""
      ).slice(0, 10);

      const query =
        search.toLowerCase().trim();

      const matchesSearch =
        staffName.includes(query) ||
        fatherName.includes(query);

      const matchesDate =
        !filterDate ||
        date === filterDate;

      const matchesStatus =
        filterStatus === "All" ||
        status === filterStatus;

      return (
        matchesSearch &&
        matchesDate &&
        matchesStatus
      );
    });
  }, [
    attendanceList,
    search,
    filterDate,
    filterStatus
  ]);

  // ==========================================
  // TODAY'S STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    const todayRecords =
      attendanceList.filter(
        (item) =>
          String(
            item.date ||
              item.attendanceDate ||
              ""
          ).slice(0, 10) === today
      );

    return {
      total: todayRecords.length,

      present: todayRecords.filter(
        (item) =>
          (item.status ||
            item.attendanceStatus) ===
          "Present"
      ).length,

      absent: todayRecords.filter(
        (item) =>
          (item.status ||
            item.attendanceStatus) ===
          "Absent"
      ).length,

      late: todayRecords.filter(
        (item) =>
          (item.status ||
            item.attendanceStatus) ===
          "Late"
      ).length
    };
  }, [attendanceList, today]);

  return (
    <AdminLayout title="Staff Attendance">
      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Staff Attendance Records
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Staff ke daily check-in, check-out aur attendance ka record.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/staff-attendance/add")
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Staff Attendance
            </button>

            <button
              type="button"
              onClick={loadAttendance}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Today's Records",
              value: stats.total,
              icon: "📋"
            },
            {
              label: "Present",
              value: stats.present,
              icon: "✅"
            },
            {
              label: "Absent",
              value: stats.absent,
              icon: "❌"
            },
            {
              label: "Late Arrivals",
              value: stats.late,
              icon: "⏰"
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>

                <span className="text-2xl">
                  {item.icon}
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold text-gray-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTER */}

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-800">
              Attendance List
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search staff or father name..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />

              <input
                type="date"
                value={filterDate}
                onChange={(event) =>
                  setFilterDate(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />

              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="Absent">
                  Absent
                </option>

                <option value="Late">
                  Late
                </option>

                <option value="Half Day">
                  Half Day
                </option>

                <option value="Leave">
                  Leave
                </option>
              </select>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Staff Name</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Check-in</th>
                  <th className="px-5 py-4">Check-out</th>
                  <th className="px-5 py-4">Working Hours</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Remarks</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map(
                    (item, index) => {
                      const checkIn =
                        item.checkIn ||
                        item.checkInTime;

                      const checkOut =
                        item.checkOut ||
                        item.checkOutTime;

                      const status =
                        item.status ||
                        item.attendanceStatus;

                      const date =
                        item.date ||
                        item.attendanceDate;

                      return (
                        <tr
                          key={item.id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-800">
                              {getStaffName(item)}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {getFatherName(item)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(date)}
                          </td>

                          <td className="px-5 py-4 font-medium text-green-700">
                            {getTime(checkIn)}
                          </td>

                          <td className="px-5 py-4 font-medium text-red-700">
                            {getTime(checkOut)}
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            {getHours(
                              checkIn,
                              checkOut
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                status
                              )}`}
                            >
                              {status || "Not set"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-gray-500">
                            {item.remarks || "--"}
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
            Showing {filteredAttendance.length} of{" "}
            {attendanceList.length} records
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewStaffAttendance;