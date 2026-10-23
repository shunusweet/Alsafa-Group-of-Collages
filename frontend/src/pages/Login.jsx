import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================
    // HANDLE INPUT
    // =====================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // =====================================
    // HANDLE LOGIN
    // =====================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post(
                "/auth/login",
                formData
            );

            const { token, user } = response.data;

            // Save token
            localStorage.setItem("token", token);

            // Save user
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            // Dashboard
            navigate("/dashboard");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Welcome Back
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Login to Student Management System
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Email */}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Password */}

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Login Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default Login;

