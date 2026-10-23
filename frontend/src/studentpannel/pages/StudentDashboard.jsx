
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Studentsidebar from "./Studentsidebar";
import StudentAttendance from "../../pages/StudentAttendance";

const menuItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "attendance", icon: "▦", label: "Attendance" },
    { id: "fees", icon: "▤", label: "Fees" },
    { id: "challan", icon: "▧", label: "Fee Challan" }
];

const StudentDashboard = () => {
    const navigate = useNavigate();

    const [activePage, setActivePage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [student, setStudent] = useState(null);

    useEffect(() => {
        try {
            const savedStudent = localStorage.getItem("studentUser");
            const token = localStorage.getItem("studentToken");

            if (!token || !savedStudent) {
                navigate("/student/login", { replace: true });
                return;
            }

            setStudent(JSON.parse(savedStudent));
        } catch (error) {
            console.error("Unable to load student information:", error);
            localStorage.removeItem("studentUser");
            navigate("/student/login", { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentUser");
        navigate("/student/login", { replace: true });
    };

    if (!student) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="font-medium text-slate-600">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const initials = (student.name || "Student")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

    const pageTitles = {
        dashboard: "Student Dashboard",
        attendance: "My Attendance",
        fees: "Fee Details",
        challan: "Fee Challan"
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            
            <Studentsidebar
                student={student}
                initials={initials}
                menuItems={menuItems}
                activePage={activePage}
                setActivePage={setActivePage}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />



            {/* Main content */}
            <main className="min-h-screen lg:ml-72">

                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl border border-slate-200 p-2.5 text-xl hover:bg-slate-100 lg:hidden"
                            aria-label="Open menu"
                        >
                            ☰
                        </button>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                                {pageTitles[activePage]}
                            </h2>
                            <p className="hidden text-xs text-slate-500 sm:block">
                                Welcome to your academic portal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-slate-800">
                                {student.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Student Account
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-bold text-white ring-4 ring-blue-50">
                            {initials}
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-8">

                    {/* Dashboard page */}
                    {activePage === "dashboard" && (
                        <>
                            {/* Welcome banner */}
                            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-violet-700 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-9">
                                <div className="relative z-10 max-w-2xl">
                                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                                        ✨ STUDENT PORTAL
                                    </span>

                                    <h2 className="mt-5 text-2xl font-extrabold leading-tight sm:text-4xl">
                                        Welcome back, {student.name.split(" ")[0]}!
                                    </h2>

                                    <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
                                        Manage your attendance, review your fees, and access your challan information in one place.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setActivePage("fees")}
                                        className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                                    >
                                        View Fee Details →
                                    </button>
                                </div>

                                <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
                                <div className="pointer-events-none absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                                <div className="pointer-events-none absolute right-10 top-8 hidden text-8xl opacity-20 xl:block">
                                    🎓
                                </div>
                            </section>

                            {/* Summary cards */}
                            <section>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        Academic Overview
                                    </h3>
                                    <span className="text-xs font-medium text-slate-500">
                                        Your account summary
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <SummaryCard
                                        icon="▦"
                                        title="Attendance"
                                        value="—"
                                        subtitle="Attendance data not connected"
                                        color="blue"
                                        onClick={() => setActivePage("attendance")}
                                    />
                                    <SummaryCard
                                        icon="💳"
                                        title="Total Fees"
                                        value="—"
                                        subtitle="Fee data not connected"
                                        color="violet"
                                        onClick={() => setActivePage("fees")}
                                    />
                                    <SummaryCard
                                        icon="✓"
                                        title="Paid Fees"
                                        value="—"
                                        subtitle="Payment data not connected"
                                        color="emerald"
                                        onClick={() => setActivePage("fees")}
                                    />
                                    <SummaryCard
                                        icon="▤"
                                        title="Fee Challan"
                                        value="View"
                                        subtitle="Open your challan section"
                                        color="amber"
                                        onClick={() => setActivePage("challan")}
                                    />
                                </div>
                            </section>

                            {/* Student details + quick links */}
                            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                Student Information
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Your registered profile details
                                            </p>
                                        </div>
                                        <span className="rounded-xl bg-blue-50 px-3 py-2 text-xl text-blue-600">
                                            ♙
                                        </span>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <InfoItem label="Full Name" value={student.name} />
                                        <InfoItem label="Father's Name" value={student.fatherName} />
                                        <InfoItem label="CNIC" value={student.cnic} />
                                        <InfoItem label="Email Address" value={student.email} />
                                        <InfoItem label="Phone Number" value={student.phone} />
                                        <InfoItem label="Course" value={student.course} />
                                        <InfoItem label="Qualification" value={student.qualification} />
                                        <InfoItem label="Domicile" value={student.domicile} />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        Quick Access
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Go directly to a section
                                    </p>

                                    <div className="mt-5 space-y-3">
                                        <QuickLink
                                            icon="▦"
                                            title="Attendance Record"
                                            description="Check your attendance"
                                            onClick={() => setActivePage("attendance")}
                                        />
                                        <QuickLink
                                            icon="💳"
                                            title="Fee Details"
                                            description="Review your fee account"
                                            onClick={() => setActivePage("fees")}
                                        />
                                        <QuickLink
                                            icon="▤"
                                            title="Fee Challan"
                                            description="View challan information"
                                            onClick={() => setActivePage("challan")}
                                        />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Attendance page connected to the attendance API */}
                    {activePage === "attendance" && <StudentAttendance />}

                    {/* Fees page */}
                    {activePage === "fees" && (
                        <SectionCard
                            icon="💳"
                            title="My Fees"
                            description="Review your fee account and payment status."
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <FeeInfo title="Total Fees" value="Not available" />
                                <FeeInfo title="Paid Amount" value="Not available" />
                                <FeeInfo title="Remaining Balance" value="Not available" />
                            </div>
                            <EmptyState
                                icon="💰"
                                title="Fee information will appear here"
                                description="Connect this page to your existing fees and fee payments API to show real student-specific amounts."
                            />
                        </SectionCard>
                    )}

                    {/* Challan page */}
                    {activePage === "challan" && (
                        <SectionCard
                            icon="▤"
                            title="Fee Challan"
                            description="Access your fee challan information."
                        >
                            <EmptyState
                                icon="📄"
                                title="No challan data connected"
                                description="After connecting the challan API, you can display challan number, issue date, due date, amount, payment status, and a print/download option."
                            />
                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                                Your actual challan and payment details will be loaded from the database once the API is connected.
                            </div>
                        </SectionCard>
                    )}

                    {/* Footer */}
                    <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} Student Portal. All rights reserved.
                    </footer>
                </div>
            </main>
        </div>
    );
};

// ==========================================
// SUMMARY CARD
// ==========================================
function SummaryCard({ icon, title, value, subtitle, color, onClick }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        violet: "bg-violet-50 text-violet-600 ring-violet-100",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        amber: "bg-amber-50 text-amber-600 ring-amber-100"
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>
                    <h4 className="mt-3 text-3xl font-extrabold text-slate-900">
                        {value}
                    </h4>
                </div>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ring-1 ${colors[color]}`}>
                    {icon}
                </span>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
                {subtitle}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
                Open section <span className="transition group-hover:translate-x-1">→</span>
            </div>
        </button>
    );
}

// ==========================================
// STUDENT INFORMATION ITEM
// ==========================================
function InfoItem({ label, value }) {
    return (
        <div className="min-w-0 border-b border-slate-100 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                {value || "Not provided"}
            </p>
        </div>
    );
}

// ==========================================
// QUICK LINK
// ==========================================
function QuickLink({ icon, title, description, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
        >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                {icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-800">
                    {title}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                    {description}
                </span>
            </span>
            <span className="text-slate-400">→</span>
        </button>
    );
}

// ==========================================
// SECTION CARD
// ==========================================
function SectionCard({ icon, title, description, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            <div className="pt-6">{children}</div>
        </section>
    );
}

// ==========================================
// EMPTY STATE
// ==========================================
function EmptyState({ icon, title, description }) {
    return (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
            <div className="text-5xl">{icon}</div>
            <h4 className="mt-4 text-base font-bold text-slate-800">
                {title}
            </h4>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}

// ==========================================
// FEE INFORMATION CARD
// ==========================================
function FeeInfo({ title, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-lg font-extrabold text-slate-800">{value}</p>
        </div>
    );
}

export default StudentDashboard;