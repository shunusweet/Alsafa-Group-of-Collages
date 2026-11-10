import React from "react";

const Studentsidebar = ({
    student,
    initials,
    menuItems = [],
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    handleLogout,
}) => {
    // =========================================
    // STUDENT IMAGE URL
    // =========================================
    const API_SERVER_URL = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const imageName =
        student?.image ||
        student?.studentImage ||
        student?.student_image ||
        "";

    const studentImage = imageName
        ? imageName.startsWith("http")
            ? imageName
            : `${API_SERVER_URL}/uploads/${String(imageName).replace(/^\/+/, "")}`
        : null;

    // =========================================
    // MENU ICONS
    // Preserve existing icons when provided
    // =========================================
    const getIcon = (item) => {
        if (item.icon) {
            return item.icon;
        }

        const icons = {
            Dashboard: "▦",
            Attendance: "▣",
            Fees: "▤",
            "Fee Challan": "▧",
            "Salary History": "▤",
            Tasks: "▤",
            Calendar: "▢",
            Analytics: "▥",
            Team: "♧",
            Settings: "",
            Help: "ⓘ",
            Logout: "⇥",
        };

        return icons[item.label] || "○";
    };

    // =========================================
    // MENU SECTIONS
    // =========================================
    const mainMenu = menuItems.filter(
        (item) => !["Settings", "Help", "Logout"].includes(item.label)
    );

    const generalMenu = menuItems.filter((item) =>
        ["Settings", "Help"].includes(item.label)
    );

    // =========================================
    // RENDER MENU ITEM
    // =========================================
    const renderMenuItem = (item) => {
        const isActive = activePage === item.id;

        return (
            <button
                key={item.id}
                type="button"
                onClick={() => {
                    setActivePage(item.id);
                    setSidebarOpen(false);
                }}
                className={`group relative flex w-full items-center gap-3
                    rounded-xl px-3 py-3 text-left text-sm
                    transition-all duration-200
                    ${
                        isActive
                            ? "bg-emerald-50 font-semibold text-emerald-700"
                            : "font-medium text-gray-500 hover:bg-gray-100 hover:text-emerald-700"
                    }`}
            >
                {/* Green active indicator */}
                {isActive && (
                    <span className="absolute -left-5 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-emerald-700" />
                )}

                {/* Menu icon */}
                <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center text-xl ${
                        isActive
                            ? "text-emerald-700"
                            : "text-gray-400 group-hover:text-emerald-600"
                    }`}
                >
                    {getIcon(item)}
                </span>

                {/* Menu label */}
                <span className="flex-1 truncate">
                    {item.label}
                </span>

                {/* Optional badge */}
                {item.badge && (
                    <span className="rounded-md bg-emerald-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {item.badge}
                    </span>
                )}

                {item.count !== undefined && item.count !== null && (
                    <span className="rounded-md bg-emerald-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {item.count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <>
            {/* =========================================
                MOBILE OVERLAY
            ========================================= */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* =========================================
                SIDEBAR
            ========================================= */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex
                    w-[240px] flex-col overflow-y-auto
                    border-r border-gray-100 bg-white
                    px-5 py-5 text-gray-800 shadow-sm
                    transition-transform duration-300
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                    lg:translate-x-0`}
            >
                {/* =====================================
                    BRAND
                ===================================== */}
                <div className="mb-8 flex min-h-12 shrink-0 items-center gap-3 px-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-emerald-700 text-emerald-700">
                        <span className="text-xl font-bold">
                            ◎
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-bold tracking-tight text-gray-900">
                            Student Portal
                        </h1>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Your academic space
                        </p>
                    </div>

                    {/* Close button on mobile */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                {/* =====================================
                    STUDENT PROFILE
                    Database image + name + course
                ===================================== */}
                <div className="mb-7 flex min-w-0 items-center gap-3 rounded-xl bg-gray-50 p-3">
                    {/* Student image box */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-emerald-50">
                        {studentImage ? (
                            <img
                                src={studentImage}
                                alt={student?.name || "Student"}
                                className="h-full w-full object-cover"
                                loading="eager"
                                onError={(event) => {
                                    console.error(
                                        "Student image could not load:",
                                        studentImage
                                    );

                                    event.currentTarget.style.display = "none";

                                    const fallback =
                                        event.currentTarget.nextElementSibling;

                                    if (fallback) {
                                        fallback.style.display = "flex";
                                    }
                                }}
                            />
                        ) : null}

                        {/* Fallback initials */}
                        <div
                            className="h-full w-full items-center justify-center text-sm font-bold text-emerald-700"
                            style={{
                                display: studentImage ? "none" : "flex",
                            }}
                        >
                            {initials || "S"}
                        </div>
                    </div>

                    {/* Student details beside image */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">
                            {student?.name ||
                                student?.studentName ||
                                student?.student_name ||
                                "Student"}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                            {student?.course || "Student"}
                        </p>

                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            {student?.status || "Active"}
                        </span>
                    </div>
                </div>

                {/* =====================================
                    MAIN MENU
                ===================================== */}
                <div className="shrink-0">
                    <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Menu
                    </p>

                    <nav className="space-y-1">
                        {mainMenu.map(renderMenuItem)}
                    </nav>
                </div>

                {/* =====================================
                    GENERAL MENU
                ===================================== */}
                {generalMenu.length > 0 && (
                    <div className="mt-8 shrink-0">
                        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            General
                        </p>

                        <nav className="space-y-1">
                            {generalMenu.map(renderMenuItem)}
                        </nav>
                    </div>
                )}

                {/* =====================================
                    BOTTOM SUPPORT CARD
                ===================================== */}
                <div className="mt-auto pt-6">
                    <div className="relative overflow-hidden rounded-2xl bg-[#062a1c] p-4 text-white">
                        {/* Decorative circles */}
                        <div className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full border border-emerald-500/30" />

                        <div className="pointer-events-none absolute -right-3 top-8 h-20 w-20 rounded-full border border-emerald-500/20" />

                        <div className="relative z-10">
                            <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-emerald-800">
                                
                            </div>

                            <h3 className="text-sm font-semibold leading-5">
                                Your Academic
                                <br />
                                Journey
                            </h3>

                            <p className="mt-1 text-[10px] leading-4 text-emerald-100/80">
                                Keep learning and achieve your goals.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    const helpItem = menuItems.find(
                                        (item) => item.label === "Help"
                                    );

                                    if (helpItem) {
                                        setActivePage(helpItem.id);
                                        setSidebarOpen(false);
                                    }
                                }}
                                className="mt-4 w-full rounded-full bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                            >
                                Get Support
                            </button>
                        </div>
                    </div>

                    {/* =================================
                        LOGOUT
                    ================================= */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <span className="flex h-6 w-6 items-center justify-center text-xl">
                            ⇥
                        </span>

                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Studentsidebar;
