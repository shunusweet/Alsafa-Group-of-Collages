import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    activeStudents: 0,
    courses: 0,
    staff: 0,
    activeStaff: 0,
    feeAccounts: 0,
    loading: true,
  });

  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get("/students"),
          api.get("/courses"),
          api.get("/staff"),
          api.get("/fees"),
        ]);

        if (!mounted) return;

        const extractRows = (result) => {
          if (result.status !== "fulfilled") return [];
          const data = result.value?.data;
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.students)) return data.students;
          if (Array.isArray(data?.courses)) return data.courses;
          if (Array.isArray(data?.staff)) return data.staff;
          if (Array.isArray(data?.fees)) return data.fees;
          return [];
        };

        const students = extractRows(results[0]);
        const courses = extractRows(results[1]);
        const staff = extractRows(results[2]);
        const fees = extractRows(results[3]);

        const activeStudents = students.filter(
          (s) => String(s.status || "").toLowerCase().replace(/-/g, "") === "active"
        ).length;

        const activeStaff = staff.filter(
          (s) => String(s.status || "active").toLowerCase().replace(/-/g, "") === "active"
        ).length;

        setStats({
          students: students.length,
          activeStudents,
          courses: courses.length,
          staff: staff.length,
          activeStaff,
          feeAccounts: fees.length,
          loading: false,
        });

        setRecentStudents(students.slice(-5).reverse());
      } catch (error) {
        console.error("Dashboard Load Error:", error);
        if (mounted) {
          setStats((s) => ({ ...s, loading: false }));
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const today = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const maxValue = useMemo(
    () => Math.max(stats.students, stats.courses, stats.staff, stats.feeAccounts, 1),
    [stats]
  );

  const metricCards = [
    {
      label: "Total Students",
      value: stats.students,
      note: `${stats.activeStudents} active students`,
      icon: "fa-users",
      primary: true,
      path: "/students",
    },
    {
      label: "Total Courses",
      value: stats.courses,
      note: "Available programs",
      icon: "fa-book-open",
      path: "/courses",
    },
    {
      label: "Total Staff",
      value: stats.staff,
      note: `${stats.activeStaff} active staff`,
      icon: "fa-user-tie",
      path: "/staff",
    },
    {
      label: "Fee Accounts",
      value: stats.feeAccounts,
      note: "Student fee records",
      icon: "fa-wallet",
      path: "/fees",
    },
  ];

  const quickLinks = [
    { title: "Add Student", detail: "Register a new student", icon: "fa-user-plus", path: "/students/add" },
    { title: "Student Records", detail: "View student information", icon: "fa-users-line", path: "/students" },
    { title: "Add Course", detail: "Create a new course", icon: "fa-book-medical", path: "/courses/add" },
    { title: "Add Staff", detail: "Register a staff member", icon: "fa-user-shield", path: "/staff/add" },
    { title: "Record Fee", detail: "Add a student payment", icon: "fa-money-bill-wave", path: "/fees/add" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="w-full space-y-6">

        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#198754] to-[#146c43] p-6 md:p-8 text-white shadow-lg lg:flex-row lg:items-center w-full">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
              Administration
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-0.5">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-green-100">
              Manage your institute operations and records from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/students/add")}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#198754] shadow-md transition hover:bg-green-50"
            >
              <span className="text-lg leading-none">+</span> Add Student
            </button>
            <div className="rounded-xl bg-white/15 px-4 py-3 text-xs font-semibold text-white border border-white/25 shadow-sm">
              {today}
            </div>
          </div>
        </div>

        {/* ================= METRIC CARDS ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
          {metricCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.path)}
              className={`group rounded-2xl p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                card.primary
                  ? "bg-gradient-to-br from-[#198754] to-[#146c43] text-white"
                  : "bg-white text-gray-900 border border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-sm font-medium ${card.primary ? "text-green-100" : "text-gray-500"}`}>
                  {card.label}
                </span>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${
                    card.primary
                      ? "bg-white/20 text-white shadow-inner"
                      : "bg-green-50 text-[#198754]"
                  }`}
                >
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
              </div>

              <div className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                {stats.loading ? "—" : card.value}
              </div>

              <p className={`mt-3 text-xs ${card.primary ? "text-green-100" : "text-gray-400"}`}>
                {stats.loading ? "Loading records…" : card.note}
              </p>
            </button>
          ))}
        </div>

        {/* ================= ANALYTICS & QUICK ACTIONS ================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 w-full">
          {/* ANALYTICS */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-100 xl:col-span-7 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Institution Analytics</h2>
                <p className="mt-0.5 text-xs text-gray-400">Current records overview</p>
              </div>
              <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-[#198754]">
                ● Live data
              </span>
            </div>

            <div className="mt-8 grid grid-cols-4 items-end gap-3 sm:gap-6">
              {metricCards.map((item) => {
                const n =
                  item.label === "Total Students"
                    ? stats.students
                    : item.label === "Total Courses"
                    ? stats.courses
                    : item.label === "Total Staff"
                    ? stats.staff
                    : stats.feeAccounts;

                const h = stats.loading
                  ? 20
                  : Math.max(15, Math.round((n / maxValue) * 100));

                return (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div className="flex h-44 w-full items-end justify-center rounded-xl bg-gray-50 p-2 border border-gray-100">
                      <div
                        className={`w-full max-w-[48px] rounded-lg transition-all ${
                          item.primary ? "bg-[#198754]" : "bg-emerald-400"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-center text-xs font-medium text-gray-500">
                      {item.label.replace("Total ", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-100 xl:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                <p className="mt-0.5 text-xs text-gray-400">Common management tasks</p>
              </div>
              <span className="text-xs font-semibold text-[#198754]">Shortcuts</span>
            </div>

            <div className="space-y-2">
              {quickLinks.map((item) => (
                <button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50 border border-transparent hover:border-gray-100"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#198754]">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.detail}</p>
                  </div>
                  <span className="text-lg text-gray-400">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RECENT STUDENTS TABLE ================= */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-6 md:p-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recently Added Students</h2>
              <p className="mt-0.5 text-xs text-gray-400">Latest student records available in the system</p>
            </div>
            <button
              onClick={() => navigate("/students")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#198754] transition hover:bg-green-50"
            >
              View all students
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-xs text-gray-400">
                      Loading student records…
                    </td>
                  </tr>
                ) : recentStudents.length ? (
                  recentStudents.map((student, index) => (
                    <tr key={student.id || student.studentId || index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold">
                            {(student.name || student.fullName || student.studentName || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {student.name || student.fullName || student.studentName || "Student"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {student.email || student.cnic || "Student record"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {student.course || student.courseName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-[#198754] border border-green-200">
                          {student.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-xs text-gray-400">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;