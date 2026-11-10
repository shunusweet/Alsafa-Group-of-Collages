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
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE IMAGE
  // =========================
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

    setFormData((previous) => ({
      ...previous,
      courseImage: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  // =========================
  // RESET FORM
  // =========================
  const handleReset = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData(initialFormData);
    setImagePreview(null);
    setMessage({ type: "", text: "" });

    const imageInput = document.getElementById("courseImage");

    if (imageInput) {
      imageInput.value = "";
    }
  };

  // =========================
  // SUBMIT FORM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseName.trim()) {
      setMessage({
        type: "error",
        text: "Course name is required.",
      });
      return;
    }

    if (!formData.courseDuration.trim()) {
      setMessage({
        type: "error",
        text: "Course duration is required.",
      });
      return;
    }

    if (!formData.courseSession.trim()) {
      setMessage({
        type: "error",
        text: "Course session is required.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const data = new FormData();

      data.append(
        "courseName",
        formData.courseName.trim()
      );

      data.append(
        "courseDuration",
        formData.courseDuration.trim()
      );

      data.append(
        "courseSession",
        formData.courseSession.trim()
      );

      data.append(
        "courseDescription",
        formData.courseDescription.trim()
      );

      if (formData.courseImage) {
        data.append(
          "courseImage",
          formData.courseImage
        );
      }

      const response = await api.post(
        "/courses",
        data
      );

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

        const imageInput =
          document.getElementById("courseImage");

        if (imageInput) {
          imageInput.value = "";
        }
      } else {
        setMessage({
          type: "error",
          text:
            response.data?.message ||
            "Failed to add course.",
        });
      }
    } catch (error) {
      console.error("Add Course Error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to add course.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add Course">

      {/* MAIN CONTAINER FULL WIDTH */}
      <div className="w-full">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-[#198754] to-[#146c43] p-6 md:p-8 text-white shadow-lg md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl text-white">
                <i className="fa-solid fa-book-open"></i>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                  Course Management
                </p>

                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  Create New Course
                </h1>
              </div>

            </div>

            <p className="ml-0 text-sm text-green-100 md:ml-[60px]">
              Add and manage courses for your institute.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#198754] transition hover:bg-green-50 shadow-md"
          >
            <i className="fa-solid fa-list-check"></i>
            View Courses
          </button>

        </div>


        {/* ================= MESSAGE ================= */}

        {message.text && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold shadow-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <i className={`fa-solid ${message.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"} text-xl mt-0.5`}></i>
            <div>
              <p className="font-semibold">{message.type === "success" ? "Success" : "Error"}</p>
              <p className="text-sm mt-1">{message.text}</p>
            </div>
          </div>
        )}


        {/* ================= FORM CARD ================= */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">

          {/* CARD HEADER */}

          <div className="border-b border-gray-100 bg-gradient-to-r from-[#198754] to-[#146c43] text-white px-6 md:px-8 py-6">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl text-white">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Course Information
                </h2>

                <p className="mt-1 text-sm text-green-100">
                  Enter complete information about your course.
                </p>
              </div>

            </div>

          </div>


          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8"
          >

            {/* ================= COURSE IMAGE ================= */}

            <div className="mb-9">

              <div className="mb-5 flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-green-100 text-[#198754] flex items-center justify-center text-xl">
                  <i className="fa-solid fa-camera"></i>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Course Image
                  </h3>

                  <p className="text-xs text-gray-500">
                    Upload a clear course photograph
                  </p>
                </div>

              </div>


              <div className="grid gap-6 lg:grid-cols-2 p-5 rounded-2xl bg-gray-50 border border-gray-200">

                {/* IMAGE PREVIEW */}

                <div>

                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Image Preview
                  </p>

                  <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white shadow-sm">

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Course Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">

                        <div className="mb-3 text-4xl">
                          <i className="fa-solid fa-image"></i>
                        </div>

                        <p className="font-medium text-xs text-gray-500">
                          No Image
                        </p>

                      </div>
                    )}

                  </div>

                </div>


                {/* UPLOAD AREA */}

                <div>

                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Upload Course Image
                  </p>

                  <label
                    htmlFor="courseImage"
                    className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-center transition hover:border-[#198754] hover:bg-green-50/20"
                  >

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-xl text-[#198754]">
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>

                    <p className="font-semibold text-gray-700 text-sm">
                      Click to upload image
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      JPG, JPEG, PNG or WEBP (Max 5MB)
                    </p>

                  </label>

                  <input
                    id="courseImage"
                    type="file"
                    name="courseImage"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </div>

              </div>

            </div>


            {/* ================= COURSE DETAILS ================= */}

            <div className="border-t border-gray-100 pt-7">

              <div className="mb-5 flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-green-100 text-[#198754] flex items-center justify-center text-xl">
                  <i className="fa-solid fa-info"></i>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Course Details
                  </h3>

                  <p className="text-xs text-gray-500">
                    Enter basic course information
                  </p>
                </div>

              </div>


              {/* INPUTS */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                {/* COURSE NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Course Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="Enter course name"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />

                </div>


                {/* COURSE DURATION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Course Duration
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="courseDuration"
                    value={formData.courseDuration}
                    onChange={handleChange}
                    placeholder="e.g. 2 Years"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />

                </div>


                {/* COURSE SESSION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Course Session
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="courseSession"
                    value={formData.courseSession}
                    onChange={handleChange}
                    placeholder="e.g. 2026 - 2028"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Course Description
                </label>

                <textarea
                  name="courseDescription"
                  value={formData.courseDescription}
                  onChange={handleChange}
                  placeholder="Write a short description about this course..."
                  rows="4"
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>


            {/* ================= FOOTER BUTTONS ================= */}

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Reset
              </button>


              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#198754] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Adding Course..."
                  : "Save Course"}
              </button>

            </div>


          </form>

        </div>

      </div>

    </AdminLayout>
  );
};

export default AddCourse;