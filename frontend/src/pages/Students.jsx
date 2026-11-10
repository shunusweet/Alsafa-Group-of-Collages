import { useEffect, useMemo, useState } from "react";
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
// IMAGE URL
// =====================================================

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_SERVER_URL}${
    image.startsWith("/") ? image : `/${image}`
  }`;
};

// =====================================================
// GET INITIALS
// =====================================================

const getInitials = (name = "") => {
  const words = String(name).trim().split(" ").filter(Boolean);

  if (words.length === 0) return "S";

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
};

// =====================================================
// GREEN THEME CLASSES
// =====================================================

const GREEN_BUTTON =
  "bg-[#198754] text-white hover:bg-[#146c43]";

const GREEN_FOCUS =
  "focus:border-[#198754] focus:ring-4 focus:ring-green-100";

const INPUT_CLASS = `
  w-full px-4 py-3
  border border-gray-300
  rounded-xl
  outline-none
  transition-all
  bg-white
  text-sm
  text-gray-800
  ${GREEN_FOCUS}
`;

// =====================================================
// STUDENTS COMPONENT
// =====================================================

const Students = () => {
  const navigate = useNavigate();

  // ===================================================
  // STATES
  // ===================================================

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [cardFilter, setCardFilter] = useState(""); // "total", "male", "female", "active"

  const [editingStudent, setEditingStudent] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    fatherName: "",
    cnic: "",
    qualification: "",
    domicile: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    gender: "",
    course: "",
    address: "",
    status: "Active",
    image: null,
  });

  const [editImagePreview, setEditImagePreview] = useState("");
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [updating, setUpdating] = useState(false);

  // ===================================================
  // FETCH STUDENTS
  // ===================================================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await api.get("/students");

      const studentList =
        response.data?.students ??
        response.data?.data ??
        [];

      setStudents(
        Array.isArray(studentList) ? studentList : []
      );
    } catch (error) {
      console.error("Fetch students error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to load students.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ===================================================
  // COURSE OPTIONS
  // ===================================================

  const courseOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.course)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  // ===================================================
  // FILTER STUDENTS
  // ===================================================

  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return students.filter((student) => {
      // Card Filter Condition
      if (cardFilter === "male" && String(student.gender || "").toLowerCase() !== "male") return false;
      if (cardFilter === "female" && String(student.gender || "").toLowerCase() !== "female") return false;
      if (cardFilter === "active" && String(student.status || "Active").toLowerCase() !== "active") return false;

      const matchesSearch =
        !search ||
        String(student.name || "")
          .toLowerCase()
          .includes(search) ||
        String(student.fatherName || "")
          .toLowerCase()
          .includes(search) ||
        String(student.cnic || "")
          .toLowerCase()
          .includes(search) ||
        String(student.qualification || "")
          .toLowerCase()
          .includes(search) ||
        String(student.domicile || "")
          .toLowerCase()
          .includes(search) ||
        String(student.status || "")
          .toLowerCase()
          .includes(search) ||
        String(student.email || "")
          .toLowerCase()
          .includes(search) ||
        String(student.phone || "")
          .toLowerCase()
          .includes(search) ||
        String(student.parentPhone || "")
          .toLowerCase()
          .includes(search) ||
        String(student.course || "")
          .toLowerCase()
          .includes(search);

      const matchesCourse =
        !courseFilter ||
        String(student.course || "") === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, courseFilter, cardFilter]);

  // ===================================================
  // STUDENT STATISTICS
  // ===================================================

  const maleCount = students.filter(
    (student) =>
      String(student.gender || "").toLowerCase() === "male"
  ).length;

  const femaleCount = students.filter(
    (student) =>
      String(student.gender || "").toLowerCase() === "female"
  ).length;

  const activeStudentsCount = students.filter(
    (student) =>
      String(student.status || "Active").toLowerCase() === "active"
  ).length;

  // ===================================================
  // SHOW MESSAGE
  // ===================================================

  const showMessage = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3500);
  };

  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================

  const openEditModal = (student) => {
    setEditingStudent(student);

    setEditForm({
      name: student.name || "",
      fatherName: student.fatherName || "",
      cnic: student.cnic || "",
      qualification: student.qualification || "",
      domicile: student.domicile || "",
      email: student.email || "",
      password: "",
      phone: student.phone || "",
      parentPhone: student.parentPhone || "",
      gender: student.gender || "",
      course: student.course || "",
      address: student.address || "",
      status: student.status || "Active",
      image: null,
    });

    setEditImagePreview(getImageUrl(student.image));

    setMessage({ type: "", text: "" });
  };

  // ===================================================
  // CLOSE EDIT MODAL
  // ===================================================

  const closeEditModal = () => {
    setEditingStudent(null);

    setEditForm({
      name: "",
      fatherName: "",
      cnic: "",
      qualification: "",
      domicile: "",
      email: "",
      password: "",
      phone: "",
      parentPhone: "",
      gender: "",
      course: "",
      address: "",
      status: "Active",
      image: null,
    });

    setEditImagePreview("");
  };

  // ===================================================
  // EDIT INPUT CHANGE
  // ===================================================

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0];

      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        showMessage(
          "error",
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        );

        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage(
          "error",
          "Image size must be less than 5MB."
        );

        e.target.value = "";
        return;
      }

      setEditForm((prev) => ({
        ...prev,
        image: file,
      }));

      setEditImagePreview(URL.createObjectURL(file));

      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===================================================
  // UPDATE STUDENT
  // ===================================================

  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    if (!editingStudent) return;

    if (!editForm.name.trim()) {
      showMessage("error", "Student name is required.");
      return;
    }

    if (editForm.password && editForm.password.length < 8) {
      showMessage(
        "error",
        "New password must be at least 8 characters long."
      );
      return;
    }

    try {
      setUpdating(true);

      const formData = new FormData();

      formData.append("name", editForm.name);
      formData.append("fatherName", editForm.fatherName);
      formData.append("cnic", editForm.cnic);
      formData.append("qualification", editForm.qualification);
      formData.append("domicile", editForm.domicile);
      formData.append("email", editForm.email);

      if (editForm.password.trim()) {
        formData.append("password", editForm.password);
      }

      formData.append("phone", editForm.phone);
      formData.append("parentPhone", editForm.parentPhone);
      formData.append("gender", editForm.gender);
      formData.append("course", editForm.course);
      formData.append("address", editForm.address);
      formData.append("status", editForm.status);

      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const response = await api.put(
        `/students/${editingStudent.id}`,
        formData
      );

      if (response.data?.success) {
        closeEditModal();

        showMessage(
          "success",
          "Student updated successfully."
        );

        await fetchStudents();
      } else {
        showMessage(
          "error",
          response.data?.message || "Student update failed."
        );
      }
    } catch (error) {
      console.error("Update student error:", error);

      showMessage(
        "error",
        error.response?.data?.message ||
          "Something went wrong while updating student."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ===================================================
  // TOGGLE STUDENT STATUS
  // ===================================================

  const handleToggleStatus = async (student) => {
    const nextStatus =
      student.status === "De-Active" ? "Active" : "De-Active";

    try {
      const response = await api.put(
        `/students/${student.id}`,
        { status: nextStatus }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to change student status."
        );
      }

      setStudents((previous) =>
        previous.map((item) =>
          item.id === student.id
            ? {
                ...item,
                ...(response.data.student || {}),
                status: nextStatus,
              }
            : item
        )
      );

      showMessage(
        "success",
        `${student.name || "Student"} status changed to ${nextStatus}.`
      );
    } catch (error) {
      console.error("Toggle student status error:", error);

      showMessage(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Unable to change student status."
      );
    }
  };

  // ===================================================
  // DELETE STUDENT
  // ===================================================

  const handleDeleteStudent = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/students/${id}`);

      if (response.data?.success) {
        setStudents((previous) =>
          previous.filter((student) => student.id !== id)
        );

        showMessage(
          "success",
          "Student deleted successfully."
        );
      } else {
        showMessage(
          "error",
          response.data?.message || "Unable to delete student."
        );
      }
    } catch (error) {
      console.error("Delete student error:", error);

      showMessage(
        "error",
        error.response?.data?.message ||
          "Something went wrong while deleting student."
      );
    }
  };

  // ===================================================
  // EXPORT TO EXCEL
  // ===================================================

  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      showMessage("error", "No data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Father Name,CNIC,Qualification,Domicile,Email,Phone,Parent Phone,Gender,Course,Address,Status\n";

    filteredStudents.forEach((student, index) => {
      const row = [
        index + 1,
        `"${student.name || ""}"`,
        `"${student.fatherName || ""}"`,
        `"${student.cnic || ""}"`,
        `"${student.qualification || ""}"`,
        `"${student.domicile || ""}"`,
        `"${student.email || ""}"`,
        `"${student.phone || ""}"`,
        `"${student.parentPhone || ""}"`,
        `"${student.gender || ""}"`,
        `"${student.course || ""}"`,
        `"${(student.address || "").replace(/"/g, '""')}"`,
        `"${student.status || "Active"}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage("success", "Students data exported successfully!");
  };

  // ===================================================
  // RESET FILTERS
  // ===================================================

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("");
    setCardFilter("");
  };

  const hasFilters =
    searchTerm.trim() !== "" || courseFilter !== "" || cardFilter !== "";

  // ===================================================
  // JSX
  // ===================================================

  return (
    <AdminLayout title="Students">
      <div className="w-full">
        {/* MESSAGE */}

        {message.text && (
          <div
            role="alert"
            className={`mb-6 flex items-center gap-3 rounded-xl border px-5 py-4 text-sm font-medium shadow-sm ${
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

        {/* PAGE HEADER */}

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
                  <i className="fa-solid fa-user-graduate text-white"></i>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Student Management
                </h1>
              </div>

              <p className="text-green-100">
                View, search, edit and manage your students with ease.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportToExcel}
                className="
                  bg-white/15
                  hover:bg-white/25
                  text-white
                  px-5 py-3
                  rounded-xl
                  font-semibold
                  transition-all
                  shadow-md
                  flex
                  items-center
                  gap-2
                  border border-white/20
                "
              >
                <i className="fa-solid fa-file-excel"></i>
                Export Excel
              </button>

              <button
                type="button"
                onClick={() => navigate("/students/add")}
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
                <i className="fa-solid fa-user-plus"></i>
                Add New Student
              </button>
            </div>
          </div>
        </div>

        {/* STATISTICS CARDS (CLICKABLE & HOVER GREEN) */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div 
            onClick={() => setCardFilter("")}
            className={`bg-white p-6 rounded-2xl border transition-all duration-300 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#198754] hover:shadow-md hover:bg-green-50/20 group ${cardFilter === "" ? "border-[#198754] ring-2 ring-green-100" : "border-gray-100"}`}
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-colors duration-300 flex items-center justify-center text-xl">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{students.length}</h3>
            </div>
          </div>

          <div 
            onClick={() => setCardFilter("male")}
            className={`bg-white p-6 rounded-2xl border transition-all duration-300 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#198754] hover:shadow-md hover:bg-green-50/20 group ${cardFilter === "male" ? "border-[#198754] ring-2 ring-green-100" : "border-gray-100"}`}
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-colors duration-300 flex items-center justify-center text-xl">
              <i className="fa-solid fa-mars"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Male Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{maleCount}</h3>
            </div>
          </div>

          <div 
            onClick={() => setCardFilter("female")}
            className={`bg-white p-6 rounded-2xl border transition-all duration-300 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#198754] hover:shadow-md hover:bg-green-50/20 group ${cardFilter === "female" ? "border-[#198754] ring-2 ring-green-100" : "border-gray-100"}`}
          >
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center text-xl">
              <i className="fa-solid fa-venus"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Female Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{femaleCount}</h3>
            </div>
          </div>

          <div 
            onClick={() => setCardFilter("active")}
            className={`bg-white p-6 rounded-2xl border transition-all duration-300 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#198754] hover:shadow-md hover:bg-green-50/20 group ${cardFilter === "active" ? "border-[#198754] ring-2 ring-green-100" : "border-gray-100"}`}
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#198754] group-hover:bg-[#198754] group-hover:text-white transition-colors duration-300 flex items-center justify-center text-xl">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{activeStudentsCount}</h3>
            </div>
          </div>
        </div>

        {/* ALL STUDENTS TABLE CONTAINER */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* CARD HEADER */}

          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-bold text-xl text-gray-800">
                  All Students List {cardFilter && <span className="text-sm font-normal text-[#198754] bg-green-50 px-3 py-1 rounded-full ml-2">Filtered by: {cardFilter.toUpperCase()}</span>}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Showing{" "}
                  <span className="font-semibold text-[#198754]">
                    {filteredStudents.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {students.length}
                  </span>{" "}
                  students
                </p>
              </div>

              {/* FILTERS */}

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fa-solid fa-search"></i>
                  </span>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search student..."
                    className={`${INPUT_CLASS} pl-11 sm:w-64`}
                  />
                </div>

                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className={`${INPUT_CLASS} sm:w-auto`}
                >
                  <option value="">All Courses</option>

                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-all text-sm"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#198754]" />

                  <p className="text-sm text-gray-500">
                    Loading students...
                  </p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-3xl text-[#198754]">
                  <i className="fa-solid fa-users-slash"></i>
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  No Students Found
                </h3>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {hasFilters
                    ? "No student matches your current search or course filter."
                    : "There are no students registered yet."}
                </p>

                {hasFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${GREEN_BUTTON}`}
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/students/add")}
                    className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${GREEN_BUTTON}`}
                  >
                    Add First Student
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[1750px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {[
                      "#",
                      "Student",
                      "Father Name",
                      "CNIC",
                      "Qualification",
                      "Domicile",
                      "Phone",
                      "Parent's Phone",
                      "Gender",
                      "Course",
                      "Address",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="group transition-colors duration-200 hover:bg-green-50/40"
                    >
                      {/* NUMBER */}
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* STUDENT */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {student.image ? (
                            <img
                              src={getImageUrl(student.image)}
                              alt={student.name || "Student"}
                              className="h-11 w-11 shrink-0 rounded-full border border-gray-200 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                          ) : null}

                          <div
                            className={`${
                              student.image ? "hidden" : ""
                            } flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#198754] text-sm font-bold text-white`}
                          >
                            {getInitials(student.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800 group-hover:text-[#198754]">
                              {student.name || "Unnamed Student"}
                            </p>

                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                              {student.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.fatherName || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.cnic || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.qualification || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.domicile || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.phone || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.parentPhone || "-"}
                      </td>

                      {/* GENDER */}
                      <td className="px-5 py-4">
                        {student.gender ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              String(student.gender).toLowerCase() === "male"
                                ? "bg-green-50 text-[#198754]"
                                : "bg-pink-50 text-pink-700"
                            }`}
                          >
                            {student.gender}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* COURSE */}
                      <td className="px-5 py-4">
                        {student.course ? (
                          <span className="inline-flex max-w-[180px] truncate rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#198754]">
                            {student.course}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* ADDRESS */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p
                          className="truncate text-sm text-gray-600"
                          title={student.address || ""}
                        >
                          {student.address || "-"}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              (student.status || "Active") === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {student.status || "Active"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student)}
                            title={
                              student.status === "De-Active"
                                ? "Activate student"
                                : "Deactivate student"
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              student.status === "De-Active"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {student.status === "De-Active"
                              ? "Set Active"
                              : "Set De-Active"}
                          </button>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            title="Edit Student"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#198754] transition hover:bg-[#198754] hover:text-white"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id)}
                            title="Delete Student"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          EDIT STUDENT MODAL
      ================================================= */}

      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between bg-gradient-to-r from-[#198754] to-[#146c43] px-6 py-5 text-white">
              <div>
                <h3 className="text-lg font-bold">Edit Student</h3>
                <p className="mt-1 text-xs text-green-100">
                  Update student information
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={updating}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleUpdateStudent} className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter student name"
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Father Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={editForm.fatherName}
                    onChange={handleEditChange}
                    placeholder="Enter father name"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC Number</label>
                  <input
                    type="text"
                    name="cnic"
                    value={editForm.cnic}
                    onChange={handleEditChange}
                    placeholder="e.g. 42101-1234567-1"
                    maxLength={15}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={editForm.qualification}
                    onChange={handleEditChange}
                    placeholder="e.g. Matric, Intermediate"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Domicile</label>
                  <input
                    type="text"
                    name="domicile"
                    value={editForm.domicile}
                    onChange={handleEditChange}
                    placeholder="e.g. Hyderabad, Sindh"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Enter email address"
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    placeholder="At least 8 characters"
                    minLength={8}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                    required
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent's Phone Number
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={editForm.parentPhone}
                    onChange={handleEditChange}
                    placeholder="Enter parent's phone number"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    className={INPUT_CLASS}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="course"
                    value={editForm.course}
                    onChange={handleEditChange}
                    required
                    className={INPUT_CLASS}
                  >
                    <option value="">Select Course</option>
                    {courseOptions.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className={INPUT_CLASS}
                  >
                    <option value="Active">Active</option>
                    <option value="De-Active">De-Active</option>
                  </select>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  placeholder="Enter student address"
                  rows="3"
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>

              {/* IMAGE UPLOAD */}
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Update Student Photo</label>
                <div className="flex items-center gap-4">
                  {editImagePreview && (
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                    />
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleEditChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#198754] hover:file:bg-green-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* MODAL BUTTONS */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-all text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className={`px-6 py-3 rounded-xl text-white font-semibold transition-all text-sm shadow-md ${GREEN_BUTTON} disabled:opacity-50`}
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Students;