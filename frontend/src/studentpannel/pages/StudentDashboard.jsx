import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Studentsidebar from "./Studentsidebar";
import StudentAttendance from "../../pages/StudentAttendance";
import api from "../../services/api";
import SvgRepoIcon from "../../components/SvgRepoIcon";

// =====================================================
// STUDENT SIDEBAR MENU
// =====================================================
const menuItems = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "attendance", icon: "▣", label: "Attendance" },
  { id: "fees", icon: "▤", label: "Fees" },
  { id: "challan", icon: "▧", label: "Fee Challan" },
];

// =====================================================
// PAGE TITLES
// =====================================================
const pageTitles = {
  dashboard: "Dashboard",
  attendance: "My Attendance",
  fees: "Fee Details",
  challan: "Fee Challan",
};

// =====================================================
// NORMALIZE STUDENT DATA
// =====================================================
const normalizeStudent = (student = {}) => ({
  ...student,
  id: student.id ?? student.student_id ?? "",
  name: student.name ?? student.student_name ?? "",
  fatherName: student.fatherName ?? student.father_name ?? "",
  cnic: student.cnic ?? student.cnic_no ?? "",
  email: student.email ?? "",
  phone: student.phone ?? student.mobile_no ?? "",
  course: student.course ?? student.course_name ?? "",
  qualification: student.qualification ?? "",
  domicile: student.domicile ?? "",
  address: student.address ?? "",
  gender: student.gender ?? "",
  status: student.status ?? "",
  image:
    student.image ??
    student.studentImage ??
    student.student_image ??
    "",
});

// =====================================================
// API SERVER URL
// =====================================================
const API_SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

// =====================================================
// STUDENT IMAGE URL
// =====================================================
const getStudentImageUrl = (image) => {
  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_SERVER_URL}/uploads/${String(image).replace(/^\/+/, "")}`;
};

// =====================================================
// MAIN STUDENT DASHBOARD
// =====================================================
const StudentDashboard = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // ===================================================
  // LOAD STUDENT PROFILE
  // ===================================================
  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      const token = localStorage.getItem("studentToken");
      const savedStudent = localStorage.getItem("studentUser");

      if (!token || !savedStudent) {
        navigate("/student/login", { replace: true });
        return;
      }

      try {
        const parsedStudent = JSON.parse(savedStudent);

        if (active) {
          setStudent(normalizeStudent(parsedStudent));
        }
      } catch (error) {
        console.error("Invalid saved student profile:", error);
        localStorage.removeItem("studentUser");
        navigate("/student/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/students/me");

        const freshStudent =
          response.data?.student ??
          response.data?.data ??
          response.data;

        if (
          active &&
          freshStudent &&
          typeof freshStudent === "object" &&
          !Array.isArray(freshStudent)
        ) {
          const normalized = normalizeStudent(freshStudent);

          setStudent(normalized);
          localStorage.setItem(
            "studentUser",
            JSON.stringify(normalized)
          );
        }
      } catch (error) {
        console.warn(
          "Could not refresh student profile. Using saved profile.",
          error.response?.data?.message || error.message
        );

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          if (active) {
            localStorage.removeItem("studentToken");
            localStorage.removeItem("studentUser");
            navigate("/student/login", { replace: true });
          }
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      active = false;
    };
  }, [navigate]);

  // ===================================================
  // LOGOUT
  // ===================================================
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    navigate("/student/login", { replace: true });
  };

  // ===================================================
  // NAVIGATION
  // ===================================================
  const handlePageChange = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================
  if (profileLoading && !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          <p className="text-sm font-medium text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!student) return null;

  // ===================================================
  // STUDENT INITIALS AND IMAGE
  // ===================================================
  const initials = (student.name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const studentImage = getStudentImageUrl(student.image);

  // ===================================================
  // SEARCH
  // ===================================================
  const dashboardSections = [
    { id: "attendance", label: "Attendance" },
    { id: "fees", label: "Total Fees" },
    { id: "paidFees", label: "Paid Fees" },
    { id: "challan", label: "Fee Challan" },
  ];

  const filteredSections = dashboardSections.filter((section) =>
    section.label.toLowerCase().includes(searchText.toLowerCase())
  );

  // ===================================================
  // MAIN LAYOUT
  // ===================================================
  return (
    <div className="min-h-screen bg-[#f5f7f5] text-gray-900">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Studentsidebar
        student={student}
        initials={initials}
        menuItems={menuItems}
        activePage={activePage}
        setActivePage={handlePageChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:ml-[240px]">

        {/* =================================================
            TOP NAVBAR
        ================================================= */}
        <header className="sticky top-0 z-20 px-3 pt-3 sm:px-5">
          <div className="flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 shadow-sm sm:px-5">

            {/* Search */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-emerald-50 lg:hidden"
                aria-label="Open menu"
              >
                ☰
              </button>

              <div className="flex w-full max-w-[300px] items-center gap-3 rounded-full border border-gray-100 bg-[#f8f9f8] px-3.5 py-2.5 focus-within:border-emerald-300">
                <span className="text-lg text-gray-600">⌕</span>

                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search sections..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                  aria-label="Search dashboard sections"
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="text-xs text-gray-500 hover:text-emerald-700"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Profile */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                title="Messages"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-lg text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                
              </button>

              <button
                type="button"
                title="Notifications"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-lg text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                ♧
              </button>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-800">
                  {studentImage ? (
                    <img
                      src={studentImage}
                      alt={student.name || "Student"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback =
                          event.currentTarget.nextElementSibling;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}

                  <span
                    className="h-full w-full items-center justify-center"
                    style={{ display: studentImage ? "none" : "flex" }}
                  >
                    {initials || "S"}
                  </span>
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-[160px] truncate text-sm font-semibold text-gray-900">
                    {student.name || "Student"}
                  </p>
                  <p className="mt-0.5 max-w-[160px] truncate text-xs text-gray-500">
                    {student.email || "Student Account"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}
        <div className="mx-auto max-w-[1600px] space-y-5 p-3 sm:p-5">

          {/* PAGE HEADING */}
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                {pageTitles[activePage]}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Plan, manage, and track your academic activities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handlePageChange("attendance")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#104b35] to-[#21845b] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-lg">+</span>
                Attendance
              </button>

              <button
                type="button"
                onClick={() => handlePageChange("fees")}
                className="rounded-full border border-emerald-800 px-5 py-3 text-sm font-medium text-emerald-900 transition hover:bg-emerald-50"
              >
                Fee Details
              </button>
            </div>
          </section>

          {/* =================================================
              DASHBOARD PAGE
          ================================================= */}
          {activePage === "dashboard" && (
            <>
              {/* WELCOME BANNER */}
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#104b35] via-[#176847] to-[#27855e] p-6 text-white sm:p-8">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    STUDENT PORTAL
                  </span>

                  <h2 className="mt-5 text-2xl font-semibold leading-tight sm:text-4xl">
                    Welcome back, {(student.name || "Student").split(" ")[0]}!
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/90">
                    Manage your attendance, review your fees, and access
                    your challan information in one place.
                  </p>

                  <button
                    type="button"
                    onClick={() => handlePageChange("fees")}
                    className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                  >
                    View Fee Details →
                  </button>
                </div>

                <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[30px] border-white/10" />
                <div className="pointer-events-none absolute -bottom-28 right-20 h-64 w-64 rounded-full border-[30px] border-white/10" />

                <div className="pointer-events-none absolute right-12 top-8 hidden text-8xl text-white/10 xl:block">
                  ◉
                </div>
              </section>

              {/* SUMMARY CARDS */}
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Academic Overview
                  </h3>

                  <span className="text-xs text-gray-500">
                    Your account summary
                  </span>
                </div>

                {searchText && (
                  <p className="mb-3 text-xs text-gray-500">
                    Search results for "{searchText}"
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {(!searchText ||
                    "attendance".includes(searchText.toLowerCase())) && (
                    <SummaryCard
                      icon="▦"
                      title="Attendance"
                      value="View"
                      subtitle="Open your attendance record"
                      onClick={() => handlePageChange("attendance")}
                    />
                  )}

                  {(!searchText ||
                    "total fees".includes(searchText.toLowerCase())) && (
                    <SummaryCard
                      icon="▤"
                      title="Total Fees"
                      value="View"
                      subtitle="Open your fee details"
                      onClick={() => handlePageChange("fees")}
                    />
                  )}

                  {(!searchText ||
                    "paid fees".includes(searchText.toLowerCase())) && (
                    <SummaryCard
                      icon="✓"
                      title="Paid Fees"
                      value="View"
                      subtitle="Review your payment information"
                      onClick={() => handlePageChange("fees")}
                    />
                  )}

                  {(!searchText ||
                    "fee challan".includes(searchText.toLowerCase())) && (
                    <SummaryCard
                      icon="▧"
                      title="Fee Challan"
                      value="View"
                      subtitle="Open your challan section"
                      onClick={() => handlePageChange("challan")}
                    />
                  )}

                </div>

                {searchText && filteredSections.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                    <p className="font-medium text-gray-700">
                      No matching sections found.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      className="mt-3 text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </section>

              {/* STUDENT INFORMATION + QUICK ACCESS */}
              <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* STUDENT INFORMATION */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Student Information
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Your registered profile details
                      </p>
                    </div>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-800">
                      ♙
                    </span>
                  </div>

                  {/* STUDENT PROFILE IMAGE */}
                  <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#f7f9f7] p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-emerald-100 font-bold text-emerald-800 shadow-sm">
                      {studentImage ? (
                        <img
                          src={studentImage}
                          alt={student.name || "Student"}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            const fallback =
                              event.currentTarget.nextElementSibling;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}

                      <span
                        className="h-full w-full items-center justify-center"
                        style={{ display: studentImage ? "none" : "flex" }}
                      >
                        {initials || "S"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold text-gray-900">
                        {student.name || "Student"}
                      </h4>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {student.course || "Course not provided"}
                      </p>

                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                        {student.status || "Active"}
                      </span>
                    </div>
                  </div>

                  {/* STUDENT DETAILS */}
                  <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <InfoItem label="Student ID" value={student.id} />
                    <InfoItem label="Full Name" value={student.name} />
                    <InfoItem label="Father's Name" value={student.fatherName} />
                    <InfoItem label="CNIC" value={student.cnic} />
                    <InfoItem label="Email Address" value={student.email} />
                    <InfoItem label="Phone Number" value={student.phone} />
                    <InfoItem label="Course" value={student.course} />
                    <InfoItem label="Qualification" value={student.qualification} />
                    <InfoItem label="Domicile" value={student.domicile} />
                    <InfoItem label="Gender" value={student.gender} />
                    <InfoItem label="Status" value={student.status} />
                    <InfoItem label="Address" value={student.address} />
                  </div>
                </div>

                {/* QUICK ACCESS */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Access
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Open your academic sections
                  </p>

                  <div className="mt-5 space-y-3">
                    <QuickLink
                      icon="▦"
                      title="Attendance Record"
                      description="Check your attendance"
                      onClick={() => handlePageChange("attendance")}
                    />

                    <QuickLink
                      icon="▤"
                      title="Fee Details"
                      description="Review your fee account"
                      onClick={() => handlePageChange("fees")}
                    />

                    <QuickLink
                      icon="▧"
                      title="Fee Challan"
                      description="View challan information"
                      onClick={() => handlePageChange("challan")}
                    />
                  </div>

                  {/* SUPPORT CARD */}
                  <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#104b35] p-5 text-white">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-white/15" />

                    <div className="relative z-10">
                      <div className="text-2xl"><SvgRepoIcon name="users" /></div>

                      <h4 className="mt-3 text-sm font-semibold">
                        Keep Learning
                      </h4>

                      <p className="mt-2 text-xs leading-5 text-emerald-50/80">
                        Stay updated with your attendance and academic
                        records.
                      </p>

                      <button
                        type="button"
                        onClick={() => handlePageChange("attendance")}
                        className="mt-4 w-full rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50"
                      >
                        View Attendance →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ATTENDANCE */}
          {activePage === "attendance" && (
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
              <StudentAttendance />
            </section>
          )}

          {/* FEES */}
          {activePage === "fees" && (
            <SectionCard
              icon="▤"
              title="My Fees"
              description="Review your fee account and payment status."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FeeInfo title="Total Fees" value="Not connected" />
                <FeeInfo title="Paid Amount" value="Not connected" />
                <FeeInfo title="Remaining Balance" value="Not connected" />
              </div>

              <EmptyState
                icon="▤"
                title="Fee information"
                description="Connect your existing fee API to display actual fee amounts and payment records for this student."
              />
            </SectionCard>
          )}

          {/* FEE CHALLAN */}
          {activePage === "challan" && (
            <SectionCard
              icon="▧"
              title="Fee Challan"
              description="Access your fee challan information."
            >
              <EmptyState
                icon="▤"
                title="Challan information"
                description="Connect your existing challan API to display the actual challan number, issue date, due date, amount, payment status, and print or download options."
              />
            </SectionCard>
          )}

          {/* FOOTER */}
          <footer className="border-t border-gray-200 py-5 text-center text-xs text-gray-500">
             {new Date().getFullYear()} Student Portal. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

// =====================================================
// SUMMARY CARD WITH GREEN HOVER EFFECT
// =====================================================
function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative overflow-hidden
        rounded-2xl border border-gray-100
        bg-white p-5 text-left shadow-sm
        transition-all duration-300 ease-in-out

        hover:-translate-y-1
        hover:border-emerald-700
        hover:bg-gradient-to-br
        hover:from-[#104b35]
        hover:to-[#21845b]
        hover:shadow-lg
        hover:shadow-emerald-900/20

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-600
        focus-visible:ring-offset-2
      "
    >
      {/* TITLE AND VALUE */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-emerald-50">
            {title}
          </p>

          <h4 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 transition-colors duration-300 group-hover:text-white">
            {value}
          </h4>
        </div>

        {/* ICON */}
        <span
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full bg-emerald-50 text-xl text-emerald-800
            ring-1 ring-emerald-100
            transition-all duration-300
            group-hover:scale-110
            group-hover:bg-white
            group-hover:text-emerald-800
            group-hover:ring-white/50
          "
        >
          {icon}
        </span>
      </div>

      {/* DESCRIPTION */}
      <p className="relative z-10 mt-4 text-xs leading-5 text-gray-500 transition-colors duration-300 group-hover:text-emerald-50">
        {subtitle}
      </p>

      {/* BOTTOM ACTION */}
      <div className="relative z-10 mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-800 transition-colors duration-300 group-hover:text-white">
          Open section
        </span>

        <span
          className="
            flex h-7 w-7 items-center justify-center
            rounded-full border border-gray-200
            text-sm text-gray-700
            transition-all duration-300
            group-hover:translate-x-1
            group-hover:border-white
            group-hover:bg-white
            group-hover:text-emerald-800
          "
        >
          
        </span>
      </div>
    </button>
  );
}

// =====================================================
// STUDENT INFORMATION ITEM
// =====================================================
function InfoItem({ label, value }) {
  return (
    <div className="min-w-0 border-b border-gray-100 pb-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-gray-800">
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : String(value)}
      </p>
    </div>
  );
}

// =====================================================
// QUICK ACCESS LINK
// =====================================================
function QuickLink({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-800">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-800">
          {title}
        </span>

        <span className="mt-1 block text-xs text-gray-500">
          {description}
        </span>
      </span>

      <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-700">
        →
      </span>
    </button>
  );
}

// =====================================================
// SECTION CARD
// =====================================================
function SectionCard({ icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-800">
          {icon}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-6">{children}</div>
    </section>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================
function EmptyState({ icon, title, description }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-[#f8faf8] px-5 py-12 text-center">
      <div className="text-4xl text-emerald-800">{icon}</div>

      <h4 className="mt-4 text-base font-semibold text-gray-800">
        {title}
      </h4>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

// =====================================================
// FEE INFORMATION CARD
// =====================================================
function FeeInfo({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#f8faf8] p-4">
      <p className="text-xs font-medium text-gray-500">{title}</p>

      <p className="mt-3 text-lg font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

export default StudentDashboard;
