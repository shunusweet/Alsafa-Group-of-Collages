
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const StudentLogin = () => {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // HANDLE STUDENT LOGIN
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!identifier.trim() || !password) {
            setError(
                "Please enter your student name or CNIC and password."
            );
            return;
        }

        setLoading(true);

        try {
            // Send login request to backend
            const response = await api.post("/student-auth/login", {
                identifier: identifier.trim(),
                password
            });

            const { token, student } = response.data;

            // Validate backend response
            if (!token || !student) {
                setError(
                    "Invalid server response. Please try again."
                );
                return;
            }

            // Save student login separately from admin login
            localStorage.setItem("studentToken", token);
            localStorage.setItem(
                "studentUser",
                JSON.stringify(student)
            );

            // Navigate directly to Student Dashboard
            navigate("/student/dashboard", {
                replace: true
            });

        } catch (err) {
            console.error(
                "Student Login Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                "Login failed. Please check your name/CNIC and password."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOGIN UI
    // ==========================================
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">

            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-blue-900/10">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#075985] to-blue-700 px-6 py-9 text-center text-white">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl shadow-lg">
                        
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Student Portal
                    </h1>

                    <p className="mt-2 text-sm text-blue-100">
                        Login to access your student account
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6 sm:p-8"
                >

                    {/* Error Message */}
                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-base"></span>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Student Name / CNIC */}
                    <div>
                        <label
                            htmlFor="identifier"
                            className="mb-2 block text-sm font-bold text-slate-700"
                        >
                            Student Name or CNIC
                        </label>

                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            autoComplete="username"
                            value={identifier}
                            onChange={(e) =>
                                setIdentifier(e.target.value)
                            }
                            placeholder="Enter your name or CNIC"
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            required
                            disabled={loading}
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Enter the exact name or CNIC registered in your student record.
                        </p>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-bold text-slate-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                required
                                disabled={loading}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#075985] to-blue-700 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:from-[#064e6f] hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login to Student Portal
                                <span>→</span>
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-500">
                        Please use the credentials registered with your institute.
                    </p>

                </form>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
                    <p className="text-xs text-slate-500">
                        Student Management System
                    </p>
                </div>

            </div>
        </div>
    );
};

export default StudentLogin;