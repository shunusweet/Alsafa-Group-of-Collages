
import React from "react";

const Studentsidebar = ({
    student,
    initials,
    menuItems,
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    handleLogout,
}) => {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
            {/* Brand */}
            <div className="flex h-24 items-center gap-3 border-b border-white/10 px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl shadow-lg">
                    🎓
                </div>

                <div>
                    <h1 className="text-lg font-extrabold tracking-wide">
                        Student Portal
                    </h1>
                    <p className="mt-1 text-xs text-slate-400">
                        Your academic space
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
                    aria-label="Close menu"
                >
                    ✕
                </button>
            </div>

            {/* Student Profile */}
            <div className="mx-4 mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-bold">
                    {student.image ? (
                        <img
                            src={
                                student.image.startsWith("http")
                                    ? student.image
                                    : `http://localhost:5000/uploads/${student.image.replace(/^\/+/, "")}`
                            }
                            alt={student.name || "Student"}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        initials
                    )}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                        {student.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                        {student.course || "Student"}
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                        ● {student.status || "Active"}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="px-4 pt-8">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Main Menu
                </p>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setActivePage(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                                activePage === item.id
                                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                                    : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                            }`}
                        >
                            <span className="flex h-7 w-7 items-center justify-center text-xl">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>

                            {activePage === item.id && (
                                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Help Card */}
            <div className="mx-4 mt-auto mb-5 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 to-violet-600/20 p-4">
                <div className="mb-2 text-2xl">💬</div>

                <h3 className="text-sm font-bold">
                    Need assistance?
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                    Contact your institute administration for help with your account.
                </p>
            </div>

            {/* Logout */}
            <button
                type="button"
                onClick={handleLogout}
                className="mx-4 mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >
                <span className="text-xl">↪</span>
                Logout
            </button>
        </aside>
    );
};

export default Studentsidebar;
