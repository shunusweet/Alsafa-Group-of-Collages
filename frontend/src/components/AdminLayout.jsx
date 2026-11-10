
import { useState } from "react";
import Sidebar from "../pages/Sidebar";
import SvgRepoIcon from "./SvgRepoIcon";

const AdminLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Administrator";

  return (
    <div className="min-h-screen w-full bg-[#f3f7f4] text-[#17251d]">

      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN CONTENT */}
      <div className="min-h-screen w-full lg:ml-[260px] lg:w-[calc(100%-260px)]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[76px] w-full items-center justify-between border-b border-[#e5eee7] bg-white/95 px-3 shadow-[0_2px_15px_rgba(23,107,77,0.04)] backdrop-blur-xl sm:px-5 md:px-7">

          {/* LEFT SIDE */}
          <div className="flex min-w-0 items-center gap-3">

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dcebe0] bg-[#eff7f1] text-[#176b4d] transition-all duration-200 hover:bg-[#dcefe2] active:scale-95 lg:hidden"
            >
              <span className="flex w-[19px] flex-col gap-[5px]">
                <span className="h-[2px] w-full rounded-full bg-current" />
                <span className="h-[2px] w-full rounded-full bg-current" />
                <span className="h-[2px] w-full rounded-full bg-current" />
              </span>
            </button>

            {/* PAGE TITLE */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="hidden h-8 w-1 rounded-full bg-gradient-to-b from-[#176b4d] to-[#35a66e] sm:block" />

                <h1 className="truncate text-base font-bold tracking-tight text-[#183b2b] sm:text-xl">
                  {title}
                </h1>
              </div>

              <p className="mt-1 hidden text-[11px] font-medium tracking-wide text-[#84968a] sm:block">
                ALSAFA INSTITUTE &amp; GROUP OF COLLEGES
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-5">

            {/* SEARCH */}
            <div className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-[#e8f0e9] bg-[#f7faf7] px-3 transition-all focus-within:border-[#7cb995] focus-within:bg-white focus-within:shadow-sm md:flex">
              <SvgRepoIcon name="search" size={18} />

              <input
                aria-label="Search records"
                placeholder="Search records..."
                className="w-full bg-transparent text-sm text-[#294535] outline-none placeholder:text-[#9aaa9f]"
              />

              <span className="rounded-md border border-[#e2ebe4] bg-white px-1.5 py-0.5 text-[10px] text-[#8b9b90]">
                /
              </span>
            </div>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              aria-label="Notifications"
              className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#f3f8f4] transition-all hover:border-[#dcebe0] hover:bg-[#e6f3e9]"
            >
              <SvgRepoIcon name="bell" size={19} />

              <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border-2 border-white bg-[#16a05d]" />
            </button>

            {/* DIVIDER */}
            <div className="hidden h-9 w-px bg-[#e8eee9] sm:block" />

            {/* USER PROFILE */}
            <div className="flex items-center gap-2.5">

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#cfe5d5] bg-gradient-to-br from-[#e4f3e8] to-[#cce9d5] shadow-sm">
                <SvgRepoIcon name="profile" size={27} />

                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16a05d]" />
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="max-w-36 truncate text-sm font-bold text-[#204432]">
                  {displayName}
                </p>

                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#84968a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#20a363]" />
                  Administrator
                </p>
              </div>

            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100vh-76px)] w-full overflow-x-hidden p-3 sm:p-5 md:p-6 xl:p-7">

          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>

        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
