
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

// =====================================================
// API SERVER URL
// =====================================================
const API_SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

// =====================================================
// IMAGE URL HELPER
// =====================================================
const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_SERVER_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

// =====================================================
// COURSES COMPONENT
// =====================================================
const Courses = () => {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Edit form
  const [editFormData, setEditFormData] = useState({
    courseName: "",
    courseDuration: "",
    courseSession: "",
    courseDescription: "",
    courseImage: null,
  });

  const [editImagePreview, setEditImagePreview] = useState(null);

  // ===================================================
  // GET COURSES
  // ===================================================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/courses");

      if (response.data?.success) {
        setCourses(
          Array.isArray(response.data.courses)
            ? response.data.courses
            : []
        );
      } else {
        setCourses([]);
        setErrorMessage(
          response.data?.message || "Failed to load courses."
        );
      }
    } catch (error) {
      console.error("Get Courses Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load courses. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ===================================================
  // SEARCH
  // ===================================================
  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      course.courseName?.toLowerCase().includes(search) ||
      course.courseDuration?.toLowerCase().includes(search) ||
      course.courseSession?.toLowerCase().includes(search) ||
      course.courseDescription?.toLowerCase().includes(search)
    );
  });

  // ===================================================
  // EDIT INPUT CHANGE
  // ===================================================
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  // ===================================================
  // EDIT IMAGE CHANGE
  // ===================================================
  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");

      e.target.value = "";
      return;
    }

    setErrorMessage("");

    if (
      editImagePreview &&
      editImagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(editImagePreview);
    }

    const preview = URL.createObjectURL(file);

    setEditFormData((previous) => ({
      ...previous,
      courseImage: file,
    }));

    setEditImagePreview(preview);
  };

  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================
  const handleEdit = (course) => {
    setSelectedCourse(course);

    setEditFormData({
      courseName: course.courseName || "",
      courseDuration: course.courseDuration || "",
      courseSession: course.courseSession || "",
      courseDescription: course.courseDescription || "",
      courseImage: null,
    });

    setEditImagePreview(
      course.courseImage ? getImageUrl(course.courseImage) : null
    );

    setShowEditModal(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // ===================================================
  // CLOSE EDIT MODAL
  // ===================================================
  const handleCloseEdit = () => {
    if (
      editImagePreview &&
      editImagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(editImagePreview);
    }

    setShowEditModal(false);
    setSelectedCourse(null);

    setEditFormData({
      courseName: "",
      courseDuration: "",
      courseSession: "",
      courseDescription: "",
      courseImage: null,
    });

    setEditImagePreview(null);
    setErrorMessage("");
  };

  // ===================================================
  // UPDATE COURSE
  // ===================================================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedCourse) return;

    if (!editFormData.courseName.trim()) {
      setErrorMessage("Course name is required.");
      return;
    }

    if (!editFormData.courseDuration.trim()) {
      setErrorMessage("Course duration is required.");
      return;
    }

    if (!editFormData.courseSession.trim()) {
      setErrorMessage("Course session is required.");
      return;
    }

    try {
      setEditLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const data = new FormData();

      data.append("courseName", editFormData.courseName.trim());
      data.append("courseDuration", editFormData.courseDuration.trim());
      data.append("courseSession", editFormData.courseSession.trim());
      data.append(
        "courseDescription",
        editFormData.courseDescription.trim()
      );

      if (editFormData.courseImage) {
        data.append("courseImage", editFormData.courseImage);
      }

      const response = await api.put(
        `/courses/${selectedCourse.id}`,
        data
      );

      if (response.data?.success) {
        handleCloseEdit();

        setSuccessMessage(
          response.data?.message || "Course updated successfully!"
        );

        await fetchCourses();

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrorMessage(
          response.data?.message || "Failed to update course."
        );
      }
    } catch (error) {
      console.error("Update Course Error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to update course."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ===================================================
  // DELETE COURSE
  // ===================================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.delete(`/courses/${id}`);

      if (response.data?.success) {
        setCourses((previous) =>
          previous.filter((course) => course.id !== id)
        );

        setSuccessMessage(
          response.data?.message || "Course deleted successfully!"
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrorMessage(
          response.data?.message || "Failed to delete course."
        );
      }
    } catch (error) {
      console.error("Delete Course Error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to delete course."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================
  if (loading) {
    return (
      <AdminLayout title="Courses">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div
              className="
                mx-auto h-14 w-14 animate-spin rounded-full
                border-4 border-[#075985] border-t-transparent
              "
            />

            <p className="mt-4 font-medium text-gray-600">
              Loading courses...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================
  return (
    <AdminLayout title="Courses">
      <div className="mx-auto max-w-[1500px]">
        {/* PAGE HEADER */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📚
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  Course Management
                </h1>

                <p className="mt-1 text-gray-500">
                  Add, edit and manage all courses
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/courses/add")}
              className="rounded-xl bg-[#075985] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#064e6f]"
            >
              + Add New Course
            </button>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            <span className="text-xl">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Total Courses",
              count: courses.length,
              subtitle: "Courses available",
              icon: "📚",
              bg: "bg-blue-50",
            },
            {
              title: "Search Results",
              count: filteredCourses.length,
              subtitle: "Matching courses",
              icon: "🔎",
              bg: "bg-green-50",
            },
            {
              title: "Course Library",
              count: courses.length,
              subtitle: "Active records",
              icon: "🎓",
              bg: "bg-purple-50",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h3 className="mt-1 text-3xl font-bold text-gray-800">
                    {item.count}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.subtitle}
                  </p>
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} text-2xl`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Course List
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all registered courses
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔎
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search course..."
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/20"
              />
            </div>
          </div>
        </div>

        {/* COURSE TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                All Courses
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Total Courses:{" "}
                <span className="font-semibold text-[#075985]">
                  {filteredCourses.length}
                </span>
              </p>
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
                📚
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-800">
                {courses.length === 0
                  ? "No Courses Found"
                  : "No Matching Courses"}
              </h3>

              <p className="mt-2 text-gray-500">
                {courses.length === 0
                  ? "Start by adding your first course."
                  : "Try searching with a different course name."}
              </p>

              {courses.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/courses/add")}
                  className="mt-5 rounded-xl bg-[#075985] px-6 py-3 font-semibold text-white transition hover:bg-[#064e6f]"
                >
                  + Add Course
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Course Session
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Description
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.map((course, index) => (
                    <tr
                      key={course.id}
                      className="transition hover:bg-blue-50/40"
                    >
                      <td className="px-6 py-5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                          {index + 1}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {course.courseImage ? (
                            <img
                              src={getImageUrl(course.courseImage)}
                              alt={course.courseName || "Course"}
                              className="h-16 w-16 rounded-xl border border-gray-200 object-cover shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                              📚
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-gray-800">
                              {course.courseName}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Course ID: {course.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                          ⏱️ {course.courseDuration || "Not specified"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex whitespace-nowrap items-center rounded-lg bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700">
                          🎓 {course.courseSession || "Not specified"}
                        </span>
                      </td>

                      <td className="max-w-[400px] px-6 py-5">
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {course.courseDescription ||
                            "No description available"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
                            disabled={deleteLoading === course.id}
                            className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteLoading === course.id
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BOTTOM NOTE */}
        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-[#075985]">
          💡 <strong>Note:</strong> You can add, edit and delete courses
          from this page. Course images should be JPG, JPEG, PNG or WEBP
          and maximum 5MB.
        </div>
      </div>

      {/* EDIT COURSE MODAL */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#075985] px-6 py-5 text-white">
              <div>
                <h2 className="text-xl font-bold md:text-2xl">
                  Edit Course
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  Update course information
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={editLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleUpdate} className="p-6 md:p-8">
              {/* IMAGE */}
              <div className="mb-7">
                <label className="mb-3 block text-sm font-bold text-gray-700">
                  Course Image
                </label>

                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-32 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                    {editImagePreview ? (
                      <img
                        src={editImagePreview}
                        alt="Course Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl">📚</div>
                        <p className="mt-1 text-xs text-gray-400">
                          No Image
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleEditImageChange}
                      className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      JPG, JPEG, PNG or WEBP — Maximum 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUTS */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* COURSE NAME */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Course Name
                  </label>

                  <input
                    type="text"
                    name="courseName"
                    value={editFormData.courseName}
                    onChange={handleEditChange}
                    required
                    placeholder="Enter course name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/20"
                  />
                </div>

                {/* COURSE DURATION */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Course Duration
                  </label>

                  <input
                    type="text"
                    name="courseDuration"
                    value={editFormData.courseDuration}
                    onChange={handleEditChange}
                    required
                    placeholder="e.g. 2 Years"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/20"
                  />
                </div>

                {/* COURSE SESSION */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Course Session <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="courseSession"
                    value={editFormData.courseSession}
                    onChange={handleEditChange}
                    required
                    placeholder="e.g. 2026–2028"
                    maxLength={30}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/20"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Enter the academic session, for example 2026–2028.
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Course Description
                </label>

                <textarea
                  name="courseDescription"
                  value={editFormData.courseDescription}
                  onChange={handleEditChange}
                  rows="6"
                  placeholder="Enter course description"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/20"
                />
              </div>

              {/* BUTTONS */}
              <div className="mt-7 flex flex-col justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={editLoading}
                  className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-[#075985] px-6 py-3 font-semibold text-white transition hover:bg-[#064e6f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editLoading ? "Updating..." : "Update Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Courses;
