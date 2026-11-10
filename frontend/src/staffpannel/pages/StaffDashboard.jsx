import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import staffApi from "../services/staffApi";
import SvgRepoIcon from "../../components/SvgRepoIcon";

const getStaffName = (staff) =>
  staff?.staff_name ||
  staff?.staffName ||
  staff?.name ||
  "Staff Member";

const getInitials = (name) =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const API_SERVER_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (/^https?:\/\//i.test(path)) return path;

  const cleanPath = path.replace(/^\/+/, "");

  return `${API_SERVER_URL}/${
    cleanPath.startsWith("uploads/")
      ? cleanPath
      : `uploads/staff/${cleanPath}`
  }`;
}

function Icon({ children }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ec] text-xl text-[#176344]">
      {children}
    </span>
  );
}

function DashboardCard({ icon, title, value, subtitle, featured }) {
  return (
    <div
      className={`rounded-2xl border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
        featured
          ? "border-[#176344] bg-gradient-to-br from-[#104c34] to-[#21845a] text-white"
          : "border-slate-100 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm font-medium ${
            featured ? "text-green-50" : "text-slate-500"
          }`}
        >
          {title}
        </p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
            featured
              ? "bg-white/15 text-white"
              : "bg-[#e8f4ec] text-[#176344]"
          }`}
        >
          {icon}
        </span>
      </div>

      <h3 className="mt-4 break-words text-2xl font-bold sm:text-3xl">
        {value}
      </h3>

      <p
        className={`mt-3 text-xs ${
          featured ? "text-green-100" : "text-slate-400"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function QuickAction({ icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-[#8fc6a6] hover:shadow-md sm:p-5"
    >
      <Icon>{icon}</Icon>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-800 group-hover:text-[#176344]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>

      <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#176344]">
        
      </span>
    </Link>
  );
}

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staffUser") || "null");
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!localStorage.getItem("staffToken")) {
        navigate("/staff/login", { replace: true });
        return;
      }

      try {
        const response = await staffApi.get("/staff-portal/me");
        const profile = response.data?.staff;

        if (!profile) {
          throw new Error("Staff profile response is empty.");
        }

        if (active) {
          setStaff(profile);
          localStorage.setItem("staffUser", JSON.stringify(profile));
          setError("");
        }
      } catch (err) {
        if (!active) return;

        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem("staffToken");
          localStorage.removeItem("staffUser");
          navigate("/staff/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
            "Profile load nahi ho saka. API connection check karein."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  const name = getStaffName(staff);
  const designation = staff?.designation || "Staff Member";
  const email = staff?.email || "Email not added";
  const phone =
    staff?.mobile_no ||
    staff?.mobileNo ||
    staff?.phone ||
    "Not added";
  const cnic = staff?.cnic_no || staff?.cnicNo || "Not added";
  const salary = staff?.salary;

  const profileImage = getImageUrl(staff?.image);

  const salaryText =
    salary !== undefined && salary !== null && salary !== ""
      ? `Rs. ${Number(salary).toLocaleString("en-PK")}`
      : "Not set";

  return (
    <div className="min-h-screen bg-[#f5f7f5] p-3 text-slate-900 sm:p-5 lg:p-7">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* Top Navigation */}
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-white bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#176344] text-xl font-bold text-white">
              A
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                STAFF PORTAL
              </h2>
              <p className="text-xs text-slate-400">
                Alsafa Institute & Group of Colleges
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <Link
              to="/staff/settings"
              title="Account Settings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-[#f8faf8] text-lg hover:bg-[#e8f4ec]"
            >
              
            </Link>

            <div className="flex min-w-0 items-center gap-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-11 w-11 rounded-full border-2 border-[#d6eadc] object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcefe2] font-bold text-[#176344]">
                  {getInitials(name) || "S"}
                </div>
              )}

              <div className="min-w-0">
                <p className="max-w-48 truncate text-sm font-semibold">
                  {name}
                </p>
                <p className="max-w-48 truncate text-xs text-slate-400">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#238058]">
              CONNECT API / STAFF WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your staff profile, attendance and salary information.
            </p>
          </div>

          <Link
            to="/staff/attendance"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#176344] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104c34]"
          >
            <span>＋</span> My Attendance
          </Link>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <strong>Connection notice:</strong> {error}
          </div>
        )}

        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#104c34] via-[#176344] to-[#25845b] p-6 text-white shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
                ● STAFF WORKSPACE
              </span>

              <p className="mt-5 text-sm text-green-100">
                Welcome back!
              </p>

              <h2 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                Hello, {name}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-green-50/90">
                Your personal workspace is ready. Access your profile,
                attendance records and salary information from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/staff/attendance"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#176344] transition hover:bg-green-50"
                >
                  View Attendance →
                </Link>

                <Link
                  to="/staff/settings"
                  className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  My Profile
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:min-w-64 md:flex-col md:text-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-20 w-20 rounded-2xl border-2 border-white/30 object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold sm:h-24 sm:w-24">
                  {getInitials(name) || "S"}
                </div>
              )}

              <div className="min-w-0">
                <p className="break-words font-bold">{name}</p>
                <p className="mt-1 text-sm text-green-100">
                  {designation}
                </p>
                <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs">
                  ● Active Staff Profile
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Account Overview */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Account Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your registered staff information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              icon={<SvgRepoIcon name="profile" />}
              title="Designation"
              value={designation}
              subtitle="Your current staff role"
              featured
            />

            <DashboardCard
              icon={<SvgRepoIcon name="profile" />}
              title="Monthly Salary"
              value={salaryText}
              subtitle="Salary recorded in your profile"
            />

            <DashboardCard
              icon={<SvgRepoIcon name="profile" />}
              title="Phone Number"
              value={phone}
              subtitle="Registered contact information"
            />

            <DashboardCard
              icon={<SvgRepoIcon name="profile" />}
              title="CNIC Number"
              value={cnic}
              subtitle="Registered identification"
            />
          </div>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <div>
              <h2 className="text-xl font-bold">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Open the section you need.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuickAction
                icon={<SvgRepoIcon name="profile" />}
                title="My Attendance"
                description="View your attendance records."
                to="/staff/attendance"
              />

              <QuickAction
                icon={<SvgRepoIcon name="profile" />}
                title="Salary History"
                description="Review your salary payment records."
                to="/staff/salary-history"
              />

              <QuickAction
                icon={<SvgRepoIcon name="profile" />}
                title="My Profile"
                description="View your registered staff details."
                to="/staff/settings"
              />

              <QuickAction
                icon={<SvgRepoIcon name="profile" />}
                title="Account Settings"
                description="Access your account settings."
                to="/staff/settings"
              />
            </div>
          </div>

          {/* Profile Summary */}
          <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Profile Summary</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Your account details
                </p>
              </div>
              <Icon><SvgRepoIcon name="profile" /></Icon>
            </div>

            {loading && (
              <p className="mt-4 text-xs text-slate-400">
                Updating profile...
              </p>
            )}

            <div className="mt-6 space-y-5">
              <ProfileField label="Full Name" value={name} />
              <ProfileField label="Designation" value={designation} />
              <ProfileField label="Email Address" value={email} />
              <ProfileField label="Phone Number" value={phone} />
            </div>

            <Link
              to="/staff/settings"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-[#176344] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#104c34]"
            >
              Manage Profile →
            </Link>
          </aside>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Alsafa Institute & Group of Colleges</p>
          <p>Staff Workspace · Profile & Account Management</p>
        </footer>
      </div>
    </div>
  );
}
