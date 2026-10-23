
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import staffApi from "../services/staffApi";

export default function StaffLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await staffApi.post("/staff-auth/login", {
        identifier: identifier.trim(),
        password,
      });

      const { token, staff } = response.data;

      if (!token || !staff) {
        throw new Error("Login response is incomplete.");
      }

      localStorage.setItem("staffToken", token);
      localStorage.setItem("staffUser", JSON.stringify(staff));

      navigate("/staffpannel/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
            S
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Staff Portal
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Login with your registered email or CNIC
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email or CNIC Number
          </label>

          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter email or CNIC"
            autoComplete="username"
            required
            className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
            className="mb-6 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login to Staff Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
