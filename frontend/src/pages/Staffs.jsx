import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const API_SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const imageUrl = (value) =>
  !value
    ? ""
    : value.startsWith("http")
    ? value
    : `${API_SERVER_URL}${value.startsWith("/") ? value : `/${value}`}`;

const Staffs = () => {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch Staff Records
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/staff");

      if (response.data?.success) {
        setStaff(response.data.staff || []);
      } else {
        setErrorMessage(
          response.data?.message || "Could not load staff."
        );
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not load staff. Check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Search Staff
  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return staff;

    return staff.filter((item) =>
      [
        item.staffName,
        item.fatherName,
        item.designation,
        item.cnicNo,
        item.mobileNo,
        item.address,
        item.email,
        item.salary,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [staff, searchTerm]);

  // ==========================================
  // EXPORT TO EXCEL (.csv)
  // ==========================================
  const exportToExcel = () => {
    if (filteredStaff.length === 0) {
      setErrorMessage("No staff records available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Staff Name,Father Name,Designation,CNIC,Mobile,Salary,Email,Address\n";

    filteredStaff.forEach((item) => {
      const name = `"${(item.staffName || "").replace(/"/g, '""')}"`;
      const father = `"${(item.fatherName || "").replace(/"/g, '""')}"`;
      const designation = `"${(item.designation || "").replace(/"/g, '""')}"`;
      const cnic = `"${(item.cnicNo || "").replace(/"/g, '""')}"`;
      const mobile = `"${(item.mobileNo || "").replace(/"/g, '""')}"`;
      const salary = `"${item.salary != null ? item.salary : ""}"`;
      const email = `"${(item.email || "").replace(/"/g, '""')}"`;
      const address = `"${(item.address || "").replace(/"/g, '""')}"`;

      csvContent += [name, father, designation, cnic, mobile, salary, email, address].join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Staff records exported to Excel successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Delete Staff
  const deleteItem = async (item) => {
    if (
      !window.confirm(
        `Delete staff record for ${item.staffName}?`
      )
    ) {
      return;
    }

    setDeleteLoading(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.delete(`/staff/${item.id}`);

      if (response.data?.success) {
        setStaff((prev) =>
          prev.filter((row) => row.id !== item.id)
        );
        setSuccessMessage("Staff deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(
          response.data?.message || "Delete failed."
        );
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not delete staff."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <AdminLayout title="Staff Management">
      <div className="w-full space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-users-gear"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                ALSAFA INSTITUTE
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                Staff Management
              </h1>
              <p className="text-green-100 text-sm mt-1">
                Manage staff details, salaries, account credentials, and verification documents.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 border border-white/25 text-sm"
            >
              <i className="fa-solid fa-file-excel"></i>
              Export Excel
            </button>

            <button
              onClick={() => navigate("/staff/add")}
              className="bg-white text-[#198754] hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <i className="fa-solid fa-user-plus"></i>
              Add New Staff
            </button>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 w-full shadow-sm"
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-xl"></i>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="ml-3 font-bold hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 w-full">
          <div className="rounded-2xl p-6 bg-white text-gray-900 border border-gray-100 shadow-sm transition-all duration-300 hover:bg-[#198754] hover:text-white hover:shadow-lg group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 group-hover:text-green-100 font-medium">Total Staff</p>
                <h3 className="mt-2 text-4xl font-bold">{staff.length}</h3>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-green-100">Registered employees</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white text-2xl transition-colors">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white text-gray-900 border border-gray-100 shadow-sm transition-all duration-300 hover:bg-[#198754] hover:text-white hover:shadow-lg group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 group-hover:text-green-100 font-medium">Matching Search</p>
                <h3 className="mt-2 text-4xl font-bold">{filteredStaff.length}</h3>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-green-100">Filtered results</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white text-2xl transition-colors">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white text-gray-900 border border-gray-100 shadow-sm transition-all duration-300 hover:bg-[#198754] hover:text-white hover:shadow-lg group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 group-hover:text-green-100 font-medium">Directory Status</p>
                <h3 className="mt-2 text-4xl font-bold">Active</h3>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-green-100">Updated records</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#198754] group-hover:bg-white/20 group-hover:text-white text-2xl transition-colors">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
            </div>
          </div>
        </div>

        {/* STAFF TABLE CARD */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm w-full">

          {/* TABLE HEADING AND SEARCH */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                All Staff Records
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Search by name, CNIC, mobile, salary, or email.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100 text-gray-800"
              />
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-[#198754]" />
              <p className="mt-4 text-sm font-medium text-gray-500">
                Loading staff records...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 w-full">
              <table className="min-w-[1300px] w-full text-left text-sm">

                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600 border-b border-gray-100">
                  <tr>
                    {[
                      "Staff",
                      "Father Name",
                      "Designation",
                      "CNIC",
                      "Mobile",
                      "Salary",
                      "Email",
                      "Address",
                      "CNIC Front",
                      "CNIC Back",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-4 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-green-50/50 group"
                    >
                      {/* Staff Name and Image */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={imageUrl(item.image)}
                              alt={item.staffName || "Staff"}
                              className="h-11 w-11 rounded-full border-2 border-gray-200 object-cover shadow-sm group-hover:border-[#198754]"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-lg text-[#198754]">
                              <i className="fa-solid fa-user-tie"></i>
                            </div>
                          )}

                          <div className="font-bold text-gray-800 group-hover:text-[#198754]">
                            {item.staffName || "—"}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {item.fatherName || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-green-50 px-3 py-1 font-bold text-[#198754] text-xs">
                          {item.designation || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {item.cnicNo || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {item.mobileNo || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-bold text-[#198754]">
                        {item.salary == null
                          ? "—"
                          : `Rs. ${Number(item.salary).toLocaleString("en-PK")}`}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {item.email || "—"}
                      </td>

                      <td className="max-w-[220px] px-4 py-4 text-gray-600 text-xs">
                        <span className="line-clamp-2">{item.address || "—"}</span>
                      </td>

                      {/* CNIC Front */}
                      <td className="px-4 py-4">
                        {item.cnicImageFront ? (
                          <a
                            href={imageUrl(item.cnicImageFront)}
                            target="_blank"
                            rel="noreferrer"
                            className="whitespace-nowrap font-bold text-[#198754] hover:underline text-xs flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-id-card"></i> View Front
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* CNIC Back */}
                      <td className="px-4 py-4">
                        {item.cnicImageBack ? (
                          <a
                            href={imageUrl(item.cnicImageBack)}
                            target="_blank"
                            rel="noreferrer"
                            className="whitespace-nowrap font-bold text-[#198754] hover:underline text-xs flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-id-card"></i> View Back
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/staff/edit/${item.id}`)
                            }
                            className="rounded-xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-[#198754] hover:bg-[#198754] hover:text-white transition-colors"
                          >
                            <i className="fa-solid fa-pen-to-square mr-1"></i> Edit
                          </button>

                          <button
                            disabled={deleteLoading === item.id}
                            onClick={() => deleteItem(item)}
                            className="rounded-xl bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                          >
                            {deleteLoading === item.id ? (
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

                  {/* Empty State */}
                  {!filteredStaff.length && (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-16 text-center"
                      >
                        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-green-50 text-2xl text-[#198754] mb-3">
                          <i className="fa-solid fa-users-slash"></i>
                        </div>

                        <h3 className="font-bold text-gray-800 text-lg">
                          No Staff Records Found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Try another search or add a new staff member.
                        </p>

                        {!searchTerm && (
                          <button
                            onClick={() => navigate("/staff/add")}
                            className="mt-4 rounded-xl bg-[#198754] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#146c43]"
                          >
                            + Add Staff
                          </button>
                        )}
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          )}

          {/* Refresh Button */}
          {!loading && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={fetchStaff}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
              >
                <i className="fa-solid fa-rotate"></i> Refresh Staff List
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Staffs;