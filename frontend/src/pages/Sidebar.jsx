
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Reusable Font Awesome Icon
const FAIcon = ({ name, size = 18 }) => (
  <i
    className={`fa-solid ${name}`}
    style={{ fontSize: size, lineHeight: 1 }}
    aria-hidden="true"
  />
);

// All sidebar menu items and their icons
const groups = [
  {
    label: "Students",
    icon: "fa-user-graduate",
    prefix: "/students",
    items: [
      { label: "Add Student", path: "/students/add", icon: "fa-user-plus" },
      { label: "View Students", path: "/students", icon: "fa-users" },
    ],
  },
  {
    label: "Student Attendance",
    icon: "fa-calendar-check",
    prefix: "/attendance",
    items: [
      { label: "Add Attendance", path: "/attendance/add", icon: "fa-calendar-plus" },
      { label: "View Attendance", path: "/attendance", icon: "fa-calendar-days" },
    ],
  },
  {
    label: "Courses",
    icon: "fa-book-open",
    prefix: "/courses",
    items: [
      { label: "Add Course", path: "/courses/add", icon: "fa-book-medical" },
      { label: "View Courses", path: "/courses", icon: "fa-book" },
    ],
  },
  {
    label: "Staff",
    icon: "fa-users",
    prefix: "/staff",
    items: [
      { label: "Add Staff", path: "/staff/add", icon: "fa-user-plus" },
      { label: "View Staff", path: "/staff", icon: "fa-people-group" },
    ],
  },
  {
    label: "Staff Attendance",
    icon: "fa-clock",
    prefix: "/staff-attendance",
    items: [
      { label: "Add Attendance", path: "/staff-attendance/add", icon: "fa-calendar-plus" },
      { label: "View Attendance", path: "/staff-attendance", icon: "fa-clipboard-check" },
    ],
  },
  {
    label: "Fees",
    icon: "fa-wallet",
    prefix: "/fees",
    items: [
      { label: "Add Fee", path: "/fees/add", icon: "fa-money-bill-transfer" },
      { label: "View Fees", path: "/fees", icon: "fa-file-invoice-dollar" },
    ],
  },
];

const Sidebar = ({
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [opened, setOpened] = useState({});

  // Automatically open current menu
  useEffect(() => {
    const next = {};

    groups.forEach((group) => {
      if (location.pathname.startsWith(group.prefix)) {
        next[group.label] = true;
      }
    });

    setOpened((old) => ({ ...old, ...next }));
  }, [location.pathname]);

  // Navigation
  const go = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const active = (path) => location.pathname === path;

  // Main row style
  const rowClass = (isActive) =>
    `nav-row group relative flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left text-[14px] transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-[#dff1e5] to-[#eef7f0] font-semibold text-[#0f6a42] shadow-[0_4px_14px_rgba(18,107,67,0.10)]"
        : "text-[#66766c] hover:translate-x-1 hover:bg-[#f0f7f2] hover:text-[#0f6a42]"
    }`;

  // Icon background
  const iconTile = (isActive) =>
    `icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-[#16804e] text-white shadow-md shadow-[#16804e]/30"
        : "bg-[#f0f5f1] text-[#5f7267] group-hover:bg-[#dff1e5] group-hover:text-[#0f6a42]"
    }`;

  let enter = 0;
  const nextDelay = () => `${120 + enter++ * 55}ms`;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 animate-[fadeIn_0.3s_ease] bg-[#10271b]/40 backdrop-blur-[3px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#e4ece6] bg-gradient-to-b from-white via-white to-[#f6faf7] px-5 pb-5 pt-6 shadow-[6px_0_32px_rgba(20,50,30,0.06)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div
          className="enter flex h-[64px] shrink-0 items-center gap-3.5 px-1"
          style={{ animationDelay: "0ms" }}
        >
          <div className="brand-logo relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-[#d0e7d8] shadow-sm">
            <img
              src="../../public/alsafa-logo.png.jpeg"
              alt="Al-Safa Institute Logo"
              className="h-full w-full object-contain p-1"
            />

            <span className="brand-ping absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#16804e] ring-2 ring-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-extrabold tracking-tight text-[#183326]">
              Al-Safa <span className="text-[#16804e]">Institute</span>
            </h1>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[2.2px] text-[#9aa99f]">
              MANAGEMENT PORTAL
            </p>
          </div>

          <button
            className="rounded-xl p-2 text-xl leading-none text-[#89968e] transition hover:rotate-90 hover:bg-[#f0f5f1] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}
        <nav
          className="sidebar-scroll mt-7 min-h-0 flex-1 overflow-y-auto pr-1"
          aria-label="Admin navigation"
        >
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[1.8px] text-[#a2ada5]">
            Main Menu
          </p>

          {/* DASHBOARD */}
          <div className="enter" style={{ animationDelay: nextDelay() }}>
            <button
              onClick={() => go("/dashboard")}
              className={`${rowClass(active("/dashboard"))} mb-1`}
            >
              {active("/dashboard") && <span className="active-bar" />}

              <span className={iconTile(active("/dashboard"))}>
                <FAIcon name="fa-gauge-high" />
              </span>

              <span className="flex-1">Dashboard</span>

              {active("/dashboard") && <span className="live-dot" />}
            </button>
          </div>

          <div className="my-5 border-t border-[#eaf0eb]" />

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[1.8px] text-[#a2ada5]">
            Management
          </p>

          {/* MANAGEMENT GROUPS */}
          {groups.map((group) => {
            const isOpen = !!opened[group.label];
            const isGroupActive = location.pathname.startsWith(group.prefix);

            return (
              <div
                key={group.label}
                className="enter mb-1"
                style={{ animationDelay: nextDelay() }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpened((old) => ({
                      ...old,
                      [group.label]: !old[group.label],
                    }))
                  }
                  className={`${rowClass(isGroupActive)} justify-between`}
                >
                  {isGroupActive && <span className="active-bar" />}

                  <span className="flex min-w-0 items-center gap-3.5">
                    <span className={iconTile(isGroupActive)}>
                      <FAIcon name={group.icon} />
                    </span>

                    <span className="truncate">{group.label}</span>
                  </span>
                </button>

                {/* SUBMENU */}
                <div
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen
                      ? "sub-open grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="ml-[34px] mt-1 space-y-1 border-l-2 border-[#dfeae2] py-1 pl-3.5">
                      {group.items.map((item, i) => (
                        <button
                          key={item.path}
                          onClick={() => go(item.path)}
                          style={{ "--d": `${80 + i * 70}ms` }}
                          className={`sub-item group/item flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-300 ${
                            active(item.path)
                              ? "bg-[#e3f3e8] font-semibold text-[#126b43] shadow-sm"
                              : "text-[#78887e] hover:translate-x-1 hover:bg-[#f1f7f2] hover:text-[#126b43]"
                          }`}
                        >
                          <span className="transition-transform duration-300 group-hover/item:scale-110">
                            <FAIcon name={item.icon} size={16} />
                          </span>

                          <span>{item.label}</span>

                          {active(item.path) && (
                            <span className="live-dot ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="my-5 border-t border-[#eaf0eb]" />

          {/* GENERAL */}
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[1.8px] text-[#a2ada5]">
            General
          </p>

          {/* SETTINGS */}
          <div className="enter" style={{ animationDelay: nextDelay() }}>
            <button
              onClick={() => go("/settings")}
              className={`${rowClass(active("/settings"))} mb-1`}
            >
              {active("/settings") && <span className="active-bar" />}

              <span className={iconTile(active("/settings"))}>
                <FAIcon name="fa-gear" />
              </span>

              <span>Settings</span>
            </button>
          </div>

          {/* HELP */}
          <div className="enter" style={{ animationDelay: nextDelay() }}>
            <button
              onClick={() => go("/help")}
              className={`${rowClass(active("/help"))} mb-1`}
            >
              {active("/help") && <span className="active-bar" />}

              <span className={iconTile(active("/help"))}>
                <FAIcon name="fa-headset" />
              </span>

              <span>Help & Support</span>
            </button>
          </div>

          {/* LOGOUT */}
          <div className="enter" style={{ animationDelay: nextDelay() }}>
            <button
              onClick={logout}
              className={`${rowClass(false)} mb-1 hover:!bg-red-50 hover:!text-red-600`}
            >
              <span className="icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f5f1] transition-all duration-300 group-hover:bg-red-100">
                <FAIcon name="fa-right-from-bracket" />
              </span>

              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* STUDENT PORTAL CARD */}
        <div
          className="enter portal-card relative mt-4 shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#103e2a] via-[#0c5638] to-[#087349] p-5 text-white shadow-xl shadow-[#0c5638]/20"
          style={{ animationDelay: "700ms" }}
        >
          <div className="ring-float pointer-events-none absolute -right-9 -top-10 h-36 w-36 rounded-full border border-white/15" />
          <div className="ring-float-slow pointer-events-none absolute -right-2 top-8 h-24 w-24 rounded-full border border-white/10" />
          <div className="shine pointer-events-none absolute inset-0" />

          <div className="relative">
            <div className="portal-icon mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <FAIcon name="fa-user-graduate" size={20} />
            </div>

            <p className="text-[15px] font-bold tracking-wide">
              Student Portal
            </p>

            <p className="mt-1 text-[11px] leading-5 text-green-100/80">
              Access your institute student management portal.
            </p>

            <button
              type="button"
              onClick={() => go("/student/login")}
              className="group/btn mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-[12px] font-bold text-[#126b43] transition-all duration-300 hover:bg-[#e8f5ec] hover:shadow-lg active:scale-[0.97]"
            >
              Open Student Portal

              <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                <FAIcon name="fa-arrow-right" size={12} />
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ANIMATIONS */}
      <style>{`
        .sidebar-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .sidebar-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes enterIn {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .enter {
          opacity: 0;
          animation: enterIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes subIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .sub-open .sub-item {
          animation: subIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--d, 0ms);
        }

        @keyframes barGrow {
          from { transform: translateY(-50%) scaleY(0); }
          to { transform: translateY(-50%) scaleY(1); }
        }

        .active-bar {
          position: absolute;
          left: -20px;
          top: 50%;
          height: 60%;
          width: 4px;
          border-radius: 0 6px 6px 0;
          background: linear-gradient(to bottom, #16804e, #34b873);
          transform: translateY(-50%);
          animation: barGrow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(22,128,78,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(22,128,78,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,128,78,0); }
        }

        .live-dot {
          height: 8px;
          width: 8px;
          border-radius: 9999px;
          background: #16804e;
          animation: livePulse 1.8s ease-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .brand-logo {
          animation: logoFloat 4s ease-in-out infinite;
        }

        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }

        .brand-ping::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #16804e;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes tilePop {
          0% { transform: scale(1) rotate(0); }
          40% { transform: scale(1.12) rotate(-6deg); }
          100% { transform: scale(1) rotate(0); }
        }

        .nav-row:hover .icon-tile {
          animation: tilePop 0.45s ease;
        }

        @keyframes ringFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-8px, 8px) scale(1.06); }
        }

        .ring-float {
          animation: ringFloat 6s ease-in-out infinite;
        }

        .ring-float-slow {
          animation: ringFloat 9s ease-in-out infinite reverse;
        }

        @keyframes shineSweep {
          0% { transform: translateX(-130%) skewX(-20deg); }
          60%, 100% { transform: translateX(230%) skewX(-20deg); }
        }

        .shine::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.14),
            transparent
          );
          animation: shineSweep 5s ease-in-out infinite;
        }

        @keyframes iconBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .portal-icon {
          animation: iconBob 3s ease-in-out infinite;
        }

        .portal-card {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .portal-card:hover {
          transform: translateY(-3px);
        }

        @media (prefers-reduced-motion: reduce) {
          .enter,
          .sub-open .sub-item,
          .active-bar {
            animation: none;
            opacity: 1;
          }

          .brand-logo,
          .brand-ping::after,
          .live-dot,
          .ring-float,
          .ring-float-slow,
          .shine::before,
          .portal-icon {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
