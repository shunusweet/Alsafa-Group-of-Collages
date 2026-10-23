
import { useState } from "react";
import Sidebar from "../pages/Sidebar";

const AdminLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:ml-64 min-h-screen">
        {/* =====================================================
            TOP NAVBAR
        ===================================================== */}

        <nav
          className="
            h-[72px]
            bg-white
            border-b border-gray-200
            flex items-center justify-between
            px-4 md:px-6
            sticky top-0
            z-30
            shadow-sm
          "
        >
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="flex items-center gap-4">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                lg:hidden
                w-10 h-10
                rounded-lg
                bg-blue-50
                text-blue-600
                flex items-center justify-center
                hover:bg-blue-100
                transition
              "
            >
              ☰
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {title}
              </h2>

              <p className="text-xs text-gray-400 hidden sm:block">
                Student Management System
              </p>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="flex items-center gap-3 md:gap-4">
            {/* NOTIFICATION */}

            <button
              type="button"
              className="
                relative
                w-10 h-10
                rounded-lg
                bg-gray-50
                hover:bg-blue-50
                text-gray-600
                flex items-center justify-center
                transition
              "
            >
              🔔

              <span
                className="
                  absolute
                  top-1.5 right-1.5
                  w-2 h-2
                  bg-red-500
                  rounded-full
                "
              ></span>
            </button>

            {/* USER */}

            <div className="flex items-center gap-3">
              <div
                className="
                  w-10 h-10
                  rounded-full
                  bg-blue-600
                  text-white
                  flex items-center justify-center
                "
              >
                👤
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-700">
                  {user?.name || "Administrator"}
                </p>

                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>

              <span className="text-gray-400 hidden sm:block">
                ▼
              </span>
            </div>
          </div>
        </nav>

        {/* =====================================================
            PAGE CONTENT
        ===================================================== */}

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

