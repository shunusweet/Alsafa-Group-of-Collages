import { useEffect, useState } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

// =====================================================
// API SERVER URL HELPER
// =====================================================
const API_SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${API_SERVER_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    courseName: "",
    courseDuration: "",
    courseSession: "",
    courseDescription: "",
    courseImage: null,
  });
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Delete State
  const [deleteLoading, setDeleteLoading] = useState(null);

  // ===================================================
  // FETCH COURSES
  // ===================================================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await api.get("/courses");

      if (response.data?.success) {
        setCourses(Array.isArray(response.data.courses) ? response.data.courses : []);
      } else {
        setCourses([]);
        setErrorMessage(response.data?.message || "Failed to load courses.");
      }
    } catch (error) {
      console.error("Get Courses Error:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to load courses from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ===================================================
  // SEARCH FILTER
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
  // EXPORT TO EXCEL (.csv)
  // ===================================================
  const exportToExcel = () => {
    if (filteredCourses.length === 0) {
      setErrorMessage("No course records available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Course Name,Duration,Session,Description\n";

    filteredCourses.forEach((c) => {
      const name = `"${(c.courseName || "").replace(/"/g, '""')}"`;
      const duration = `"${(c.courseDuration || "").replace(/"/g, '""')}"`;
      const session = `"${(c.courseSession || "").replace(/"/g, '""')}"`;
      const desc = `"${(c.courseDescription || "").replace(/"/g, '""')}"`;

      csvContent += [name, duration, session, desc].join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Course_Library_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Courses exported to Excel successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ===================================================
  // EDIT HANDLERS
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

  const handleCloseEdit = () => {
    if (editImagePreview && editImagePreview.startsWith("blob:")) {
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
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");
      return;
    }

    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditFormData((prev) => ({ ...prev, courseImage: file }));
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      setEditLoading(true);
      setErrorMessage("");

      const data = new FormData();
      data.append("courseName", editFormData.courseName.trim());
      data.append("courseDuration", editFormData.courseDuration.trim());
      data.append("courseSession", editFormData.courseSession.trim());
      data.append("courseDescription", editFormData.courseDescription.trim());
      if (editFormData.courseImage) {
        data.append("courseImage", editFormData.courseImage);
      }

      const response = await api.put(`/courses/${selectedCourse.id}`, data);

      if (response.data?.success) {
        handleCloseEdit();
        setSuccessMessage("Course updated successfully!");
        await fetchCourses();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.data?.message || "Failed to update course.");
      }
    } catch (error) {
      console.error("Update Course Error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update course.");
    } finally {
      setEditLoading(false);
    }
  };

  // ===================================================
  // DELETE HANDLER
  // ===================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      setDeleteLoading(id);
      setErrorMessage("");

      const response = await api.delete(`/courses/${id}`);

      if (response.data?.success) {
        setCourses((prev) => prev.filter((item) => item.id !== id));
        setSuccessMessage("Course deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.data?.message || "Failed to delete course.");
      }
    } catch (error) {
      console.error("Delete Course Error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to delete course.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Course Library">
        <div className="flex min-h-[70vh] items-center justify-center p-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-[#198754]" />
            <p className="mt-4 text-sm font-medium text-gray-500">Loading courses portal...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Course Library">
      <div className="w-full space-y-6">
        {/* PAGE HEADER */}
        <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Course Library</h1>
              <p className="text-green-100 text-sm mt-1">
                Browse, edit, delete academic programs, and export data.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            className="bg-white text-[#198754] hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm self-start md:self-auto group"
          >
            <i className="fa-solid fa-file-excel group-hover:scale-110 transition-transform"></i>
            Export Excel Data
          </button>
        </div>

        {/* NOTIFICATIONS */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full">
          <div className="rounded-2xl p-6 bg-white text-gray-900 border border-gray-100 shadow-sm transition-all duration-300 hover:bg-[#198754] hover:text-white hover:shadow-lg group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 group-hover:text-green-100 font-medium">Total Courses</p>
                <h3 className="mt-2 text-4xl font-bold">{courses.length}</h3>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-green-100">All available programs</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white text-2xl transition-colors">
                <i className="fa-solid fa-book-open"></i>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white text-gray-900 border border-gray-100 shadow-sm transition-all duration-300 hover:bg-[#198754] hover:text-white hover:shadow-lg group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 group-hover:text-green-100 font-medium">Matching Courses</p>
                <h3 className="mt-2 text-4xl font-bold">{filteredCourses.length}</h3>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-green-100">Filtered results</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white text-2xl transition-colors">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white text-gray-900 border border-gray-100 shadow-sm transition-all duration-300 hover:bg-[#198754] hover:text-white hover:shadow-lg group sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 group-hover:text-green-100 font-medium">Library Status</p>
                <h3 className="mt-2 text-4xl font-bold">Active</h3>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-green-100">Updated catalog</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white text-2xl transition-colors">
                <i className="fa-solid fa-bookmark"></i>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Search Course Catalog</h2>
              <p className="text-xs text-gray-500">Find courses by name, duration, session or keywords</p>
            </div>

            <div className="relative w-full md:w-[420px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search course title or session..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
              />
            </div>
          </div>
        </div>

        {/* COURSE TABLE CARD */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 w-full">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-[#198754] to-[#146c43] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl text-white">
                <i className="fa-solid fa-list-ul"></i>
              </div>
              <div>
                <h2 className="font-bold text-lg">Course Records</h2>
                <p className="text-xs text-green-100">Displaying {filteredCourses.length} programs</p>
              </div>
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="rounded-xl bg-white/20 hover:bg-white/30 text-white px-4 py-2 text-xs font-semibold transition"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-2xl text-[#198754] mb-3">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {courses.length === 0 ? "No Courses Found" : "No Matching Courses"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {courses.length === 0 ? "No course programs have been added yet." : "Try searching with different terms."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">Course Details</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Session</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.map((course, index) => (
                    <tr 
                      key={course.id} 
                      className="transition-colors hover:bg-green-50/70 group"
                    >
                      <td className="p-4 font-bold text-gray-600 group-hover:text-[#198754]">
                        {index + 1}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {course.courseImage ? (
                            <img
                              src={getImageUrl(course.courseImage)}
                              alt={course.courseName || "Course"}
                              className="h-12 w-12 rounded-xl border border-gray-200 object-cover shadow-sm group-hover:border-[#198754]"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-lg text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-colors">
                              <i className="fa-solid fa-book"></i>
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800 group-hover:text-[#198754]">
                              {course.courseName}
                            </p>
                            <p className="text-xs text-gray-400">ID: {course.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-colors">
                          <i className="fa-regular fa-clock"></i>
                          {course.courseDuration || "N/A"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 group-hover:bg-green-100 group-hover:text-[#198754] transition-colors">
                          <i className="fa-regular fa-calendar"></i>
                          {course.courseSession || "N/A"}
                        </span>
                      </td>

                      <td className="max-w-[280px] p-4 text-xs text-gray-600 group-hover:text-gray-900">
                        <p className="line-clamp-2">
                          {course.courseDescription || "No course details available."}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="rounded-xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-[#198754] hover:bg-[#198754] hover:text-white transition-colors"
                          >
                            <i className="fa-solid fa-pen-to-square mr-1"></i> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
                            disabled={deleteLoading === course.id}
                            className="rounded-xl bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                          >
                            {deleteLoading === course.id ? (
                              "Deleting..."
                            ) : (
                              <>
                                <i className="fa-solid fa-trash mr-1"></i> Delete
                              </>
                            )}
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
      </div>

      {/* EDIT MODAL */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-[#198754] to-[#146c43] px-6 py-5 text-white">
              <div>
                <h2 className="text-lg font-bold">Edit Course</h2>
                <p className="text-xs text-green-100">Update course details and image</p>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={editLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-xl hover:bg-white/30 transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="p-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Course Image</label>
                <div className="flex flex-col gap-4 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center border border-gray-200">
                  <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-white sm:w-28">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <i className="fa-solid fa-image text-xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="w-full flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleEditImageChange}
                      className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-[#198754] outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">JPG, JPEG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Course Name *</label>
                <input
                  type="text"
                  name="courseName"
                  value={editFormData.courseName}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-[#198754] focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Duration *</label>
                  <input
                    type="text"
                    name="courseDuration"
                    value={editFormData.courseDuration}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-[#198754] focus:ring-2 focus:ring-green-100 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Session *</label>
                  <input
                    type="text"
                    name="courseSession"
                    value={editFormData.courseSession}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-[#198754] focus:ring-2 focus:ring-green-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  name="courseDescription"
                  value={editFormData.courseDescription}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-[#198754] focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={editLoading}
                  className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-[#198754] px-6 py-2 text-sm font-semibold text-white hover:bg-[#146c43] transition shadow-md disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}