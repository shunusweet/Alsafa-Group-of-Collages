import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const AddStudent = () => {
  const navigate = useNavigate();

  // ==========================================
  // STUDENT FORM*
  // ==========================================

  const initialFormData = {
    name: "",
    fatherName: "",
    cnic: "",
    qualification: "",
    domicile: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    gender: "Male",
    course: "",
    address: "",
    status: "Active",
    image: null,
  };

  const [formData, setFormData] = useState(initialFormData);

  // ==========================================
  // COURSES*
  // ==========================================

  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);

  // ==========================================
  // IMAGE*
  // ==========================================

  const [imagePreview, setImagePreview] = useState(null);

  // ==========================================
  // STATUS*
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // GET COURSES*
  // ==========================================

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourseLoading(true);
        setErrorMessage("");

        const response = await api.get("/courses");

        if (response.data?.success) {
          setCourses(response.data.courses || []);
        } else {
          setCourses([]);
          setErrorMessage(
            response.data?.message || "Failed to load courses."
          );
        }
      } catch (error) {
        console.error("Get Courses Error:", error);

        setCourses([]);

        setErrorMessage(
          error.response?.data?.message ||
            "Failed to load courses. Please check your backend."
        );
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ==========================================
  // HANDLE INPUT*
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  // ==========================================
  // HANDLE IMAGE*
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    // Check file type*
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    // Check file size*
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");

      e.target.value = "";
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  // ==========================================
  // RESET FORM*
  // ==========================================

  const handleReset = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setErrorMessage("");
    setSuccessMessage("");

    const imageInput = document.getElementById("studentImage");

    if (imageInput) {
      imageInput.value = "";
    }
  };

  // ==========================================
  // SUBMIT FORM*
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // ==========================================
    // FRONTEND VALIDATION*
    // ==========================================

    if (!formData.name.trim()) {
      setErrorMessage("Please enter student name.");
      return;
    }

    if (!formData.fatherName.trim()) {
      setErrorMessage("Please enter father name.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Please enter email address.");
      return;
    }

    if (!formData.password) {
      setErrorMessage("Please enter a student password.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Please enter phone number.");
      return;
    }

    if (!formData.course) {
      setErrorMessage("Please select a course.");
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage("Please enter student address.");
      return;
    }

    if (!formData.image) {
      setErrorMessage("Please upload student image.");
      return;
    }

    // ==========================================
    // START LOADING*
    // ==========================================

    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("fatherName", formData.fatherName.trim());
      data.append("cnic", formData.cnic.trim());
      data.append("qualification", formData.qualification.trim());
      data.append("domicile", formData.domicile.trim());
      data.append("email", formData.email.trim());
      data.append("password", formData.password);
      data.append("phone", formData.phone.trim());
      data.append("parentPhone", formData.parentPhone.trim());
      data.append("gender", formData.gender);
      data.append("course", formData.course);
      data.append("address", formData.address.trim());
      data.append("status", formData.status);
      data.append("image", formData.image);

      // ==========================================
      // API REQUEST*
      // ==========================================

      const response = await api.post("/students", data);

      if (response.data?.success) {
        setSuccessMessage("Student added successfully!");

        setTimeout(() => {
          navigate("/students");
        }, 800);
      } else {
        setErrorMessage(
          response.data?.message || "Failed to add student."
        );
      }
    } catch (error) {
      console.error("Add Student Error:", error);

      if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            "Failed to add student."
        );
      } else {
        setErrorMessage(
          "Server is not responding. Please check your backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI*
  // ==========================================

  return (
    <AdminLayout title="Add Student">
      <div className="w-full">

        {/* ==========================================
            PAGE HEADER*
        ========================================== */}

        <div
          className="
            bg-gradient-to-r
            from-[#198754]
            to-[#146c43]
            rounded-2xl
            p-6 md:p-8
            text-white
            shadow-lg
            mb-6
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
            "
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-white/20
                    flex
                    items-center
                    justify-center
                    text-2xl
                  "
                >
                  <i className="fa-solid fa-user-plus text-white"></i>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Add New Student
                </h1>
              </div>

              <p className="text-green-100">
                Register a new student in the system.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/students")}
              className="
                bg-white
                text-[#198754]
                hover:bg-green-50
                px-5 py-3
                rounded-xl
                font-semibold
                transition-all
                shadow-md
                flex
                items-center
                gap-2
              "
            >
              <i className="fa-solid fa-users"></i>
              View Students
            </button>
          </div>
        </div>

        {/* ==========================================
            ERROR MESSAGE*
        ========================================== */}

        {errorMessage && (
          <div
            className="
              mb-6
              bg-red-50
              border border-red-200
              text-red-700
              px-5 py-4
              rounded-xl
              flex items-start gap-3
            "
          >
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>

            <div>
              <p className="font-semibold">
                Error
              </p>

              <p className="text-sm mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            SUCCESS MESSAGE*
        ========================================== */}

        {successMessage && (
          <div
            className="
              mb-6
              bg-green-50
              border border-green-200
              text-green-700
              px-5 py-4
              rounded-xl
              flex items-start gap-3
            "
          >
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>

            <div>
              <p className="font-semibold">
                Success
              </p>

              <p className="text-sm mt-1">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            FORM CARD*
        ========================================== */}

        <div
          className="
            bg-white
            rounded-2xl
            border border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          {/* ==========================================
              FORM HEADER*
          ========================================== */}

          <div
            className="
              bg-gradient-to-r
              from-[#198754]
              to-[#146c43]
              text-white
              px-6 md:px-8
              py-6
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-12 h-12
                  rounded-xl
                  bg-white/15
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                <i className="fa-solid fa-id-card"></i>
              </div>

              <div>
                <h2 className="font-bold text-xl">
                  Student Information
                </h2>

                <p className="text-sm text-green-100 mt-1">
                  Enter student details below
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              FORM*
          ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8"
          >

            {/* ==========================================
                STUDENT IMAGE*
            ========================================== */}

            <div className="mb-9">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    bg-green-100
                    text-[#198754]
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  <i className="fa-solid fa-camera"></i>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Student Photo
                  </h3>

                  <p className="text-xs text-gray-500">
                    Upload a clear student photograph
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  items-start
                  md:items-center
                  gap-6
                  p-5
                  rounded-2xl
                  bg-gray-50
                  border border-gray-200
                "
              >

                {/* IMAGE PREVIEW */}

                <div
                  className="
                    w-36 h-36
                    rounded-2xl
                    border-2 border-dashed
                    border-gray-300
                    bg-white
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    shadow-sm
                    flex-shrink-0
                  "
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Student Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-3xl">
                        <i className="fa-solid fa-image"></i>
                      </div>

                      <p className="text-xs mt-2 font-medium">
                        No Image
                      </p>
                    </div>
                  )}
                </div>

                {/* FILE INPUT */}

                <div className="flex-1 w-full">
                  <label
                    className="
                      block
                      text-sm
                      font-bold
                      text-gray-700
                      mb-3
                    "
                  >
                    Upload Student Image
                  </label>

                  <input
                    id="studentImage"
                    type="file"
                    name="image"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="
                      w-full
                      px-4 py-3
                      border border-gray-300
                      rounded-xl
                      bg-white
                      cursor-pointer
                      text-sm
                      text-gray-600
                      file:mr-3
                      file:py-2
                      file:px-4
                      file:rounded-lg
                      file:border-0
                      file:bg-green-50
                      file:text-[#198754]
                      file:font-semibold
                      hover:file:bg-green-100
                    "
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-50 text-[#198754] rounded-full text-xs font-medium">
                      JPG
                    </span>

                    <span className="px-3 py-1 bg-green-50 text-[#198754] rounded-full text-xs font-medium">
                      PNG
                    </span>

                    <span className="px-3 py-1 bg-green-50 text-[#198754] rounded-full text-xs font-medium">
                      WEBP
                    </span>

                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Max 5MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==========================================
                PERSONAL INFORMATION*
            ========================================== */}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    bg-green-100
                    text-[#198754]
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  <i className="fa-solid fa-user"></i>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Personal Information
                  </h3>

                  <p className="text-xs text-gray-500">
                    Basic student information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* STUDENT NAME */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                    "
                  />
                </div>

                {/* FATHER NAME */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Father Name
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father name"
                    required
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                    "
                  />
                </div>

                {/* CNIC */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC Number</label>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    placeholder="e.g. 42101-1234567-1"
                    maxLength={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* QUALIFICATION */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. Matric, Intermediate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* DOMICILE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Domicile</label>
                  <input
                    type="text"
                    name="domicile"
                    value={formData.domicile}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad, Sindh"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                    "
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                    "
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password is stored securely as a hash and cannot be viewed later.
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                    "
                  />
                </div>

                {/* PARENT PHONE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent's Phone Number
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Enter parent's phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* GENDER */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      bg-white
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                    "
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* COURSE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    disabled={courseLoading}
                    className="
                      w-full px-4 py-3
                      border border-gray-300
                      rounded-xl
                      bg-white
                      outline-none
                      transition-all
                      focus:border-[#198754]
                      focus:ring-4
                      focus:ring-green-100
                      disabled:bg-gray-100
                      disabled:cursor-not-allowed
                    "
                  >
                    <option value="">
                      {courseLoading
                        ? "Loading courses..."
                        : courses.length === 0
                        ? "No courses available"
                        : "Select Course"}
                    </option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.courseName}>
                        {course.courseName}
                      </option>
                    ))}
                  </select>

                  {!courseLoading && courses.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      Please add a course first.
                    </p>
                  )}
                </div>

              </div>

              {/* STUDENT STATUS */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Student Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="
                    w-full max-w-xl px-4 py-3
                    border border-gray-300
                    rounded-xl
                    bg-white
                    outline-none
                    transition-all
                    focus:border-[#198754]
                    focus:ring-4
                    focus:ring-green-100
                  "
                >
                  <option value="Active">Active</option>
                  <option value="De-Active">De-Active</option>
                </select>

                <div className="mt-3">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                      formData.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* ==========================================
                ADDRESS*
            ========================================== */}

            <div className="border-t border-gray-100 pt-7">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    bg-green-100
                    text-[#198754]
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  <i className="fa-solid fa-location-dot"></i>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Address Information
                  </h3>

                  <p className="text-xs text-gray-500">
                    Enter student's complete address
                  </p>
                </div>
              </div>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter student address"
                rows="4"
                className="
                  w-full px-4 py-3
                  border border-gray-300
                  rounded-xl
                  outline-none
                  resize-none
                  focus:border-[#198754]
                  focus:ring-4
                  focus:ring-green-100
                "
              />
            </div>

            {/* BUTTONS / SUBMIT */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-all"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#198754] text-white hover:bg-[#146c43] font-semibold transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add Student"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddStudent;