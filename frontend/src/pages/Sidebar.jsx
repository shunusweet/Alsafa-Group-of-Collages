import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen = false, setSidebarOpen = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentAttendanceOpen, setStudentAttendanceOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffAttendanceOpen, setStaffAttendanceOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/students")) setStudentsOpen(true);
    if (path.startsWith("/attendance")) setStudentAttendanceOpen(true);
    if (path.startsWith("/courses")) setCoursesOpen(true);
    if (path === "/staff" || path.startsWith("/staff/")) setStaffOpen(true);
    if (path.startsWith("/staff-attendance")) setStaffAttendanceOpen(true);
    if (path.startsWith("/fees")) setFeesOpen(true);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (prefix) => location.pathname.startsWith(prefix);

  const mainMenuClass = (active = false) =>
    `mb-1 flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const subMenuClass = (active = false) =>
    `flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`;

  const renderDropdown = ({ label, icon, isOpen, setIsOpen, active, items }) => (
    <div className="mb-1" key={label}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={mainMenuClass(active)}
      >
        <span className="flex items-center gap-3">
          <span aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </span>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="ml-5 mt-1 space-y-1 border-l border-gray-700 pl-3">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavigation(item.path)}
              className={subMenuClass(isActive(item.path))}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-[#07111f] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center border-b border-gray-800 px-5">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl" aria-hidden="true">
            🎓
          </div>
          <div>
            <h1 className="text-lg font-bold">Student System</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-xl text-gray-400 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="h-[calc(100vh-72px)] overflow-y-auto p-3" aria-label="Admin navigation">
          <p className="px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500">Main Menu</p>

          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className={mainMenuClass(isActive("/dashboard"))}
          >
            <span className="flex items-center gap-3"><span aria-hidden="true">▣</span><span>Dashboard</span></span>
          </button>

          {renderDropdown({
            label: "Students", icon: "👥", isOpen: studentsOpen, setIsOpen: setStudentsOpen,
            active: isSectionActive("/students"),
            items: [
              { label: "Add Student", path: "/students/add", icon: "＋" },
              { label: "View Students", path: "/students", icon: "☷" }
            ]
          })}

          {renderDropdown({
            label: "Student Attendance", icon: "📋", isOpen: studentAttendanceOpen,
            setIsOpen: setStudentAttendanceOpen, active: isSectionActive("/attendance"),
            items: [
              { label: "Add Attendance", path: "/attendance/add", icon: "＋" },
              { label: "View Attendance", path: "/attendance", icon: "☷" },
            ]
          })}

          {renderDropdown({
            label: "Courses", icon: "📚", isOpen: coursesOpen, setIsOpen: setCoursesOpen,
            active: isSectionActive("/courses"),
            items: [
              { label: "Add Course", path: "/courses/add", icon: "＋" },
              { label: "View Courses", path: "/courses", icon: "☷" }
            ]
          })}

          {renderDropdown({
            label: "Staff", icon: "👨‍💼", isOpen: staffOpen, setIsOpen: setStaffOpen,
            active: location.pathname === "/staff" || location.pathname.startsWith("/staff/"),
            items: [
              { label: "Add Staff", path: "/staff/add", icon: "＋" },
              { label: "View Staff", path: "/staff", icon: "☷" }
            ]
          })}

          {renderDropdown({
            label: "Staff Attendance", icon: "🕒", isOpen: staffAttendanceOpen,
            setIsOpen: setStaffAttendanceOpen, active: isSectionActive("/staff-attendance"),
            items: [
              { label: "Add Attendance", path: "/staff-attendance/add", icon: "＋" },
              { label: "View Attendance", path: "/staff-attendance", icon: "☷" }
            ]
          })}

          {renderDropdown({
            label: "Fees", icon: "💰", isOpen: feesOpen, setIsOpen: setFeesOpen,
            active: isSectionActive("/fees"),
            items: [
              { label: "Add Fee", path: "/fees/add", icon: "＋" },
              { label: "View Fees", path: "/fees", icon: "☷" }
            ]
          })}

          <button
            type="button"
            onClick={() => handleNavigation("/settings")}
            className={mainMenuClass(isActive("/settings"))}
          >
            <span className="flex items-center gap-3"><span aria-hidden="true">⚙</span><span>Settings</span></span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10"
          >
            <span aria-hidden="true">↪</span><span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
