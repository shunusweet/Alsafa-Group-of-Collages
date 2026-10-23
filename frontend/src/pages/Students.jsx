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
  const words = name.trim().split(" ").filter(Boolean);

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

      if (response.data?.success) {
        setStudents(response.data.students || []);
      } else {
        setStudents(response.data?.students || []);
      }
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
  }, [students, searchTerm, courseFilter]);

  // ===================================================
  // STATS
  // ===================================================

  const maleCount = students.filter(
    (student) =>
      String(student.gender || "").toLowerCase() === "male"
  ).length;

  const femaleCount = students.filter(
    (student) =>
      String(student.gender || "").toLowerCase() === "female"
  ).length;

  // ===================================================
  // SHOW MESSAGE
  // ===================================================

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
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

    setMessage({
      type: "",
      text: "",
    });
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

    // IMAGE
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
      showMessage("error", "New password must be at least 8 characters long.");
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
      // Blank means keep the existing password unchanged.
      if (editForm.password.trim()) {
        formData.append("password", editForm.password);
      }
      formData.append("phone", editForm.phone);
      formData.append("parentPhone", editForm.parentPhone);
      formData.append("gender", editForm.gender);
      formData.append("course", editForm.course);
      formData.append("address", editForm.address);

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
          response.data?.message ||
            "Student update failed."
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
    const nextStatus = student.status === "De-Active" ? "Active" : "De-Active";
    try {
      const response = await api.put(`/students/${student.id}`, {
        status: nextStatus,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to change student status.");
      }

      setStudents((previous) => previous.map((item) =>
        item.id === student.id
          ? { ...item, ...(response.data.student || {}), status: nextStatus }
          : item
      ));
      showMessage("success", `${student.name || "Student"} status changed to ${nextStatus}.`);
    } catch (error) {
      console.error("Toggle student status error:", error);
      showMessage(
        "error",
        error.response?.data?.message || error.message || "Unable to change student status."
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
      const response = await api.delete(
        `/students/${id}`
      );

      if (response.data?.success) {
        setStudents((prev) =>
          prev.filter((student) => student.id !== id)
        );

        showMessage(
          "success",
          "Student deleted successfully."
        );
      } else {
        showMessage(
          "error",
          response.data?.message ||
            "Unable to delete student."
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
  // RESET FILTERS
  // ===================================================

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("");
  };

  const hasFilters =
    searchTerm.trim() !== "" ||
    courseFilter !== "";

  // ===================================================
  // JSX
  // ===================================================

  return (
    <AdminLayout title="Students">

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message.text && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="text-lg">
            {message.type === "success"
              ? "✅"
              : "⚠️"}
          </span>

          {message.text}
        </div>
      )}

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Student Management
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            View, search, edit and manage your students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/students/add")}
          className="
            flex items-center justify-center gap-2
            rounded-xl
            bg-[#075985]
            px-5 py-3
            text-sm font-semibold text-white
            shadow-md
            transition
            hover:bg-[#064e73]
            hover:shadow-lg
          "
        >
          <span className="text-lg">➕</span>
          Add New Student
        </button>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Students
              </p>

              <h4 className="mt-2 text-3xl font-bold text-gray-800">
                {students.length}
              </h4>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              👨‍🎓
            </div>
          </div>
        </div>

        {/* MALE */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Male Students
              </p>

              <h4 className="mt-2 text-3xl font-bold text-gray-800">
                {maleCount}
              </h4>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              👨
            </div>
          </div>
        </div>

        {/* FEMALE */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Female Students
              </p>

              <h4 className="mt-2 text-3xl font-bold text-gray-800">
                {femaleCount}
              </h4>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-2xl">
              👩
            </div>
          </div>
        </div>

        {/* COURSES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Courses
              </p>

              <h4 className="mt-2 text-3xl font-bold text-gray-800">
                {courseOptions.length}
              </h4>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
              📚
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          STUDENT TABLE CARD
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* CARD HEADER */}

        <div className="border-b border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h3 className="text-lg font-bold text-gray-800">
                All Students
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
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

              {/* SEARCH */}

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search student..."
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-gray-50
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-[#075985]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-[#075985]/10
                    sm:w-64
                  "
                />
              </div>

              {/* COURSE */}

              <select
                value={courseFilter}
                onChange={(e) =>
                  setCourseFilter(e.target.value)
                }
                className="
                  rounded-xl
                  border border-gray-300
                  bg-gray-50
                  px-4
                  py-2.5
                  text-sm
                  text-gray-700
                  outline-none
                  transition
                  focus:border-[#075985]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#075985]/10
                "
              >
                <option value="">
                  All Courses
                </option>

                {courseOptions.map((course) => (
                  <option
                    key={course}
                    value={course}
                  >
                    {course}
                  </option>
                ))}
              </select>

              {/* RESET */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    rounded-xl
                    border border-gray-300
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-600
                    transition
                    hover:bg-gray-100
                  "
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#075985]" />

                <p className="text-sm text-gray-500">
                  Loading students...
                </p>
              </div>
            </div>

          ) : filteredStudents.length === 0 ? (

            /* EMPTY */

            <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
                👨‍🎓
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                No Students Found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                {hasFilters
                  ? "No student matches your current search or course filter."
                  : "There are no students registered yet."}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    mt-4
                    rounded-xl
                    bg-gray-800
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-gray-700
                  "
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/students/add")
                  }
                  className="
                    mt-4
                    rounded-xl
                    bg-[#075985]
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-[#064e73]
                  "
                >
                  Add First Student
                </button>
              )}
            </div>

          ) : (

            /* TABLE */

            <table className="min-w-[1750px] w-full">

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Father Name
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    CNIC
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Qualification
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Domicile
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Parent's Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Gender
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Course
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Address
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredStudents.map(
                  (student, index) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* NUMBER */}

                      <td className="px-5 py-4 text-sm font-medium text-gray-500">
                        {index + 1}
                      </td>

                      {/* STUDENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          {student.image ? (
                            <img
                              src={getImageUrl(
                                student.image
                              )}
                              alt={student.name}
                              className="
                                h-11
                                w-11
                                flex-shrink-0
                                rounded-full
                                border
                                border-gray-200
                                object-cover
                              "
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                e.currentTarget.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                          ) : null}

                          <div
                            className={`${
                              student.image
                                ? "hidden"
                                : ""
                            }
                            flex
                            h-11
                            w-11
                            flex-shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#075985]
                            text-sm
                            font-bold
                            text-white`}
                          >
                            {getInitials(
                              student.name
                            )}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-gray-800">
                              {student.name ||
                                "Unnamed Student"}
                            </p>

                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                              {student.email ||
                                "No email"}
                            </p>

                          </div>
                        </div>
                      </td>

                      {/* FATHER */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.fatherName || "-"}
                      </td>

                      {/* CNIC */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.cnic || "-"}
                      </td>

                      {/* QUALIFICATION */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.qualification || "-"}
                      </td>

                      {/* DOMICILE */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.domicile || "-"}
                      </td>

                      {/* PHONE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.phone || "-"}
                      </td>

                      {/* PARENT PHONE */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {student.parentPhone || "-"}
                      </td>

                      {/* GENDER */}

                      <td className="px-5 py-4">

                        {student.gender ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              String(
                                student.gender
                              ).toLowerCase() === "male"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-pink-50 text-pink-700"
                            }`}
                          >
                            {student.gender}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            -
                          </span>
                        )}

                      </td>

                      {/* COURSE */}

                      <td className="px-5 py-4">

                        {student.course ? (
                          <span className="inline-flex max-w-[180px] truncate rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            {student.course}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            -
                          </span>
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

                      {/* STATUS BADGE AND TOGGLE */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            (student.status || "Active") === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {student.status || "Active"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student)}
                            title={student.status === "De-Active" ? "Activate student" : "Deactivate student"}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              student.status === "De-Active"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            {student.status === "De-Active" ? "Set Active" : "Set De-Active"}
                          </button>
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(student)
                            }
                            title="Edit Student"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-50
                              text-blue-600
                              transition
                              hover:bg-blue-100
                            "
                          >
                            ✏️
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteStudent(
                                student.id
                              )
                            }
                            title="Delete Student"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              bg-red-50
                              text-red-600
                              transition
                              hover:bg-red-100
                            "
                          >
                            🗑️
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =================================================
          EDIT STUDENT MODAL
      ================================================= */}

      {editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">

          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between bg-[#075985] px-5 py-4 text-white sm:px-6">

              <div>
                <h3 className="text-lg font-bold">
                  Edit Student
                </h3>

                <p className="mt-0.5 text-xs text-blue-100">
                  Update student information
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={updating}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/10
                  text-xl
                  hover:bg-white/20
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleUpdateStudent}
              className="p-5 sm:p-6"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Student Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter student name"
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  />
                </div>

                {/* FATHER */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Father Name
                  </label>

                  <input
                    type="text"
                    name="fatherName"
                    value={editForm.fatherName}
                    onChange={handleEditChange}
                    placeholder="Enter father name"
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  />
                </div>

                {/* CNIC */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">CNIC Number</label>
                  <input
                    type="text"
                    name="cnic"
                    value={editForm.cnic}
                    onChange={handleEditChange}
                    maxLength={15}
                    placeholder="e.g. 42101-1234567-1"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/10"
                  />
                </div>

                {/* QUALIFICATION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={editForm.qualification}
                    onChange={handleEditChange}
                    placeholder="e.g. Matric, Intermediate"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/10"
                  />
                </div>

                {/* DOMICILE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Domicile</label>
                  <input
                    type="text"
                    name="domicile"
                    value={editForm.domicile}
                    onChange={handleEditChange}
                    placeholder="e.g. Hyderabad, Sindh"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/10"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Enter email"
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  />
                </div>

                {/* PASSWORD: OPTIONAL CHANGE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                    minLength={8}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter at least 8 characters only if you want to change it.
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  />
                </div>

                {/* PARENT PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Parent's Phone Number
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={editForm.parentPhone}
                    onChange={handleEditChange}
                    placeholder="Enter parent's phone number"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/10"
                  />
                </div>

                {/* GENDER */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* COURSE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Course
                  </label>

                  <input
                    type="text"
                    name="course"
                    value={editForm.course}
                    onChange={handleEditChange}
                    placeholder="Enter course"
                    className="
                      w-full
                      rounded-xl
                      border border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  />
                </div>

                {/* STATUS: READ-ONLY CURRENT STATUS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Current Student Status
                  </label>
                  <div className="flex min-h-[46px] items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                        editForm.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {editForm.status === "Active" ? "Active" : "De-Active"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Change student status using the status button in the Students list.
                  </p>
                </div>

                {/* ADDRESS */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows="3"
                    placeholder="Enter student address"
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border border-gray-300
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#075985]
                      focus:ring-2
                      focus:ring-[#075985]/10
                    "
                  />
                </div>

                {/* IMAGE */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Student Image
                  </label>

                  <div className="
                    flex
                    flex-col
                    gap-4
                    rounded-xl
                    border
                    border-dashed
                    border-gray-300
                    bg-gray-50
                    p-4
                    sm:flex-row
                    sm:items-center
                  ">

                    {/* PREVIEW */}

                    {editImagePreview ? (
                      <img
                        src={editImagePreview}
                        alt="Student Preview"
                        className="
                          h-24
                          w-24
                          rounded-xl
                          border
                          border-gray-200
                          object-cover
                        "
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="
                        flex
                        h-24
                        w-24
                        items-center
                        justify-center
                        rounded-xl
                        bg-gray-200
                        text-3xl
                      ">
                        👤
                      </div>
                    )}

                    <div className="flex-1">

                      <input
                        type="file"
                        name="image"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleEditChange}
                        className="
                          w-full
                          text-sm
                          text-gray-600
                          file:mr-4
                          file:rounded-lg
                          file:border-0
                          file:bg-[#075985]
                          file:px-4
                          file:py-2
                          file:text-sm
                          file:font-semibold
                          file:text-white
                          hover:file:bg-[#064e73]
                        "
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        JPG, JPEG, PNG or WEBP.
                        Maximum size: 5MB.
                      </p>

                    </div>
                  </div>
                </div>

              </div>

              {/* BUTTONS */}

              <div className="
                mt-6
                flex
                flex-col-reverse
                gap-3
                border-t
                border-gray-200
                pt-5
                sm:flex-row
                sm:justify-end
              ">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="
                    rounded-xl
                    border
                    border-gray-300
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="
                    rounded-xl
                    bg-[#075985]
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#064e73]
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {updating
                    ? "⏳ Updating..."
                    : "💾 Save Changes"}
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