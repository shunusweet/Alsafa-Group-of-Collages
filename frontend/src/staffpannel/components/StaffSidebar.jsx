import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import SvgRepoIcon from "../../components/SvgRepoIcon";

const menuItems = [
  {
    name: "Dashboard",
    path: "/staff/dashboard",
    icon: "▦",
  },
  {
    name: "Attendance",
    path: "/staff/attendance",
    icon: "◷",
  },
  {
    name: "Salary History",
    path: "/staff/salary-history",
    icon: "₹",
  },
  {
    name: "Settings",
    path: "/staff/settings",
    icon: <SvgRepoIcon name="settings" />,
  },
];

export default function StaffSidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  let staff = {};

  try {
    staff = JSON.parse(localStorage.getItem("staffUser") || "{}");
  } catch {
    staff = {};
  }

  // Existing staff image URL logic
  const profileImage = staff.image
    ? staff.image.startsWith("http")
      ? staff.image
      : `http://localhost:5000${
          staff.image.startsWith("/") ? "" : "/"
        }${
          staff.image.startsWith("/uploads/")
            ? staff.image
            : staff.image.startsWith("uploads/")
            ? staff.image
            : `uploads/staff/${staff.image}`
        }`
    : "";

  const staffName =
    staff.staff_name || staff.staffName || staff.name || "Staff";

  const designation = staff.designation || "Staff";
  const initial = staffName.charAt(0).toUpperCase();

  const logout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");
    navigate("/staff/login", { replace: true });
  };

  // Staff profile component
  const StaffProfile = () => (
    <div className="mx-4 mt-7 mb-5">
      <div className="flex items-center gap-3">
        {profileImage ? (
          <img
            src={profileImage}
            alt={staffName}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling.style.display = "flex";
            }}
            className="h-11 w-11 shrink-0 rounded-full border border-gray-200 object-cover"
          />
        ) : null}

        <div
          className={`${
            profileImage ? "hidden" : "flex"
          } h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800`}
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {staffName}
          </p>

          <p className="mt-1 truncate text-xs text-gray-500">
            {designation}
          </p>
        </div>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#f7f8f7] text-gray-700">

      {/* Logo and portal name */}
      <div className="flex items-center gap-3 px-5 pt-7 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-green-700 text-xl font-bold text-green-700">
          <img src="../../assets/Alsafa.jpeg"></img>
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-gray-950">
            Alsafa Collage
          </h2>
          <p className="text-[11px] text-gray-500">
            Staff Portal
          </p>
        </div>
      </div>

      {/* Staff details */}
      <StaffProfile />

      {/* Menu heading */}
      <p className="px-6 pb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Menu
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/staff/dashboard"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                isActive
                  ? "bg-green-700 font-semibold text-white shadow-sm"
                  : "text-gray-500 hover:bg-green-50 hover:text-green-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-gray-400 group-hover:text-green-700"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.name}</span>

                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-5 pt-4">
        <div className="rounded-2xl bg-[#e6f3e9] p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-lg text-white">
            ✓
          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            Staff Workspace
          </h3>
          
          <p className="mt-1 text-xs leading-5 text-gray-600">
            Manage your attendance, salary history and profile.
          </p>
        </div>

        <button
          onClick={logout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-7 w-7 items-center justify-center text-lg">
            ⇥
          </span>
          Logout
        </button>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          Alsafa Institute &amp; Group of Colleges
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 p-2 lg:block">
        <div className="h-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile top navbar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg px-3 py-2 text-xl text-gray-700 hover:bg-gray-100"
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-700 font-bold text-green-700">
            <img src="../../assets/Alsafa.jpeg"></img>
          </span>
          <span className="font-bold text-gray-900">Alsafa Staff</span>
        </div>

        {profileImage ? (
          <img
            src={profileImage}
            alt={staffName}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-9 w-9 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
            {initial}
          </span>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-full w-64 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
