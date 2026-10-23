
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const navigate = useNavigate();

  let staff = null;

  try {
    staff = JSON.parse(
      localStorage.getItem("staffUser") || "null"
    );
  } catch {
    staff = null;
  }

  const logout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");

    navigate("/staffpannel/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="flex items-center justify-between bg-slate-950 px-6 py-5 text-white">
        <div>
          <h1 className="text-xl font-bold">
            Staff Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Connect Api
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      <main className="p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">
          Welcome, {staff?.staffName || "Staff Member"}
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Staff Name
            </p>
            <h3 className="mt-2 text-lg font-bold">
              {staff?.staffName || "Not available"}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Email
            </p>
            <h3 className="mt-2 break-words text-lg font-bold">
              {staff?.email || "Not available"}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Designation
            </p>
            <h3 className="mt-2 text-lg font-bold">
              {staff?.designation || "Not specified"}
            </h3>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-bold">
            Staff Information
          </h3>

          <p className="mb-2 text-slate-600">
            CNIC: {staff?.cnicNo || "Not available"}
          </p>

          <p className="text-sm text-slate-500">
            Your staff account is logged in.
          </p>
        </div>
      </main>
    </div>
  );
}
