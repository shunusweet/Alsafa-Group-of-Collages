
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const initialFormData = {
    courseName: "",
    courseDuration: "",
    courseSession: "",
    courseDescription: "",
    courseImage: null,
};

const AddCourse = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialFormData);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setMessage({
                type: "error",
                text: "Only JPG, JPEG, PNG and WEBP images are allowed.",
            });
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({
                type: "error",
                text: "Image size must be less than 5MB.",
            });
            e.target.value = "";
            return;
        }

        setMessage({ type: "", text: "" });
        setFormData((previous) => ({ ...previous, courseImage: file }));
        setImagePreview(URL.createObjectURL(file));
    };

    const handleReset = () => {
        if (imagePreview?.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setFormData(initialFormData);
        setImagePreview(null);
        setMessage({ type: "", text: "" });

        const imageInput = document.getElementById("courseImage");
        if (imageInput) imageInput.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.courseName.trim()) {
            setMessage({ type: "error", text: "Course name is required." });
            return;
        }

        if (!formData.courseDuration.trim()) {
            setMessage({ type: "error", text: "Course duration is required." });
            return;
        }

        if (!formData.courseSession.trim()) {
            setMessage({ type: "error", text: "Course session is required." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const data = new FormData();

            data.append("courseName", formData.courseName.trim());
            data.append("courseDuration", formData.courseDuration.trim());
            data.append("courseSession", formData.courseSession.trim());
            data.append("courseDescription", formData.courseDescription.trim());

            if (formData.courseImage) {
                data.append("courseImage", formData.courseImage);
            }

            const response = await api.post("/courses", data);

            if (response.data?.success) {
                setMessage({
                    type: "success",
                    text: "Course added successfully!",
                });

                if (imagePreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(imagePreview);
                }

                setFormData(initialFormData);
                setImagePreview(null);

                const imageInput = document.getElementById("courseImage");
                if (imageInput) imageInput.value = "";
            } else {
                setMessage({
                    type: "error",
                    text: response.data?.message || "Failed to add course.",
                });
            }
        } catch (error) {
            console.error("Add Course Error:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to add course.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Add Course">
            <div className="max-w-7xl mx-auto">
                <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                            Create New Course
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Add a new course to your student management system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/courses")}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        📚 View Courses
                    </button>
                </div>

                {message.text && (
                    <div
                        className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
                            message.type === "success"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        <span className="text-lg">
                            {message.type === "success" ? "✅" : "⚠️"}
                        </span>
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#075985] px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📚</span>
                            <div>
                                <h2 className="font-bold">Course Information</h2>
                                <p className="text-xs text-blue-100">
                                    Add complete details about the new course
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 md:p-7">
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-8 w-1 rounded-full bg-[#075985]" />
                                <h3 className="text-lg font-bold text-gray-800">
                                    Course Image
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:grid-cols-2">
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-gray-700">
                                        Image Preview
                                    </p>
                                    <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Course Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <div className="text-5xl">📚</div>
                                                <p className="mt-2 text-xs font-medium">
                                                    No Image Selected
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-semibold text-gray-700">
                                        Upload Course Image
                                    </p>
                                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                                        <input
                                            id="courseImage"
                                            type="file"
                                            name="courseImage"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#075985] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#064e6f]"
                                        />
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {["JPG", "JPEG", "PNG", "WEBP"].map((type) => (
                                                <span
                                                    key={type}
                                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#075985]"
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="mt-3 text-xs text-gray-500">
                                            Maximum file size: 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center gap-3">
                            <div className="h-8 w-1 rounded-full bg-[#075985]" />
                            <h3 className="text-lg font-bold text-gray-800">
                                Course Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Course Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleChange}
                                    placeholder="Enter course name"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#075985] focus:ring-4 focus:ring-blue-100"
                                />
                                <p className="mt-1.5 text-xs text-gray-400">
                                    Example: Medical Lab Technician
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Course Duration <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="courseDuration"
                                    value={formData.courseDuration}
                                    onChange={handleChange}
                                    placeholder="e.g. 2 Years / 6 Months"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#075985] focus:ring-4 focus:ring-blue-100"
                                />
                                <p className="mt-1.5 text-xs text-gray-400">
                                    Enter the complete duration of course.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Course Session <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="courseSession"
                                    value={formData.courseSession}
                                    onChange={handleChange}
                                    placeholder="e.g. 2026–2028"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#075985] focus:ring-4 focus:ring-blue-100"
                                />
                                <p className="mt-1.5 text-xs text-gray-400">
                                    Enter the academic session.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Course Description
                            </label>
                            <textarea
                                name="courseDescription"
                                value={formData.courseDescription}
                                onChange={handleChange}
                                placeholder="Enter course description..."
                                rows="6"
                                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#075985] focus:ring-4 focus:ring-blue-100"
                            />
                            <p className="mt-1.5 text-xs text-gray-400">
                                Add a short description about the course, subjects or program.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                🔄 Reset
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/courses")}
                                disabled={loading}
                                className="rounded-lg bg-gray-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                📚 View Courses
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-[#075985] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#064e6f] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Adding Course..." : "➕ Add Course"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-[#075985]">
                    💡 <strong>Note:</strong> Course name, duration and session are required.
                    Make sure the information is correct before adding the course.
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddCourse;
