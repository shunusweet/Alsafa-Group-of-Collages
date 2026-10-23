import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const API_SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const imageUrl = (value) => !value ? "" : value.startsWith("http") ? value : `${API_SERVER_URL}${value.startsWith("/") ? value : `/${value}`}`;

const Staffs = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff");
      if (response.data?.success) setStaff(response.data.staff || []);
      else setErrorMessage(response.data?.message || "Could not load staff.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Could not load staff. Check backend.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staff;
    return staff.filter((item) => [
      item.staffName, item.fatherName, item.designation, item.cnicNo, item.mobileNo,
      item.address, item.email, item.salary,
    ].some((value) => String(value ?? "").toLowerCase().includes(term)));
  }, [staff, searchTerm]);

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete staff record for ${item.staffName}?`)) return;
    setDeleteLoading(item.id);
    try {
      const response = await api.delete(`/staff/${item.id}`);
      if (response.data?.success) setStaff((prev) => prev.filter((row) => row.id !== item.id));
      else setErrorMessage(response.data?.message || "Delete failed.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Could not delete staff.");
    } finally { setDeleteLoading(null); }
  };

  return (
    <AdminLayout title="Staff Management">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#075985] to-[#064e6f] p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><h1 className="text-2xl font-bold md:text-3xl">Staff Management</h1><p className="mt-2 text-blue-100">Manage staff details, salary and account email.</p></div>
            <button onClick={() => navigate("/staff/add")} className="rounded-xl bg-white px-5 py-3 font-semibold text-[#075985] hover:bg-blue-50">+ Add New Staff</button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4"><p className="text-sm text-blue-100">Total Staff</p><p className="mt-1 text-2xl font-bold">{staff.length}</p></div>
            <div className="rounded-xl bg-white/10 p-4"><p className="text-sm text-blue-100">Matching Search</p><p className="mt-1 text-2xl font-bold">{filteredStaff.length}</p></div>
            <div className="rounded-xl bg-white/10 p-4"><p className="text-sm text-blue-100">Staff List</p><p className="mt-1 text-2xl font-bold">Records</p></div>
          </div>
        </div>

        {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{errorMessage}</div>}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-lg font-bold text-gray-800">All Staff Records</h2><p className="mt-1 text-sm text-gray-500">Search by name, CNIC, mobile, salary or email.</p></div>
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search staff..." className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#075985] focus:ring-4 focus:ring-blue-100 md:max-w-sm" />
          </div>
          {loading ? <div className="py-14 text-center text-gray-500">Loading staff records...</div> :
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-[1300px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600"><tr>
                  {["Staff", "Father Name", "Designation", "CNIC", "Mobile", "Salary", "Email", "Address", "CNIC Front", "CNIC Back", "Actions"].map((heading) => <th key={heading} className="px-4 py-4 font-bold">{heading}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((item) => <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4"><div className="flex items-center gap-3">{item.image ? <img src={imageUrl(item.image)} alt="" className="h-11 w-11 rounded-full border object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-lg">👤</div>}<div className="font-semibold text-gray-800">{item.staffName}</div></div></td>
                    <td className="px-4 py-4">{item.fatherName}</td><td className="px-4 py-4">{item.designation}</td><td className="px-4 py-4 whitespace-nowrap">{item.cnicNo}</td><td className="px-4 py-4 whitespace-nowrap">{item.mobileNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{item.salary == null ? "—" : `Rs. ${Number(item.salary).toLocaleString("en-PK")}`}</td>
                    <td className="px-4 py-4">{item.email || "—"}</td><td className="max-w-[220px] px-4 py-4">{item.address}</td>
                    <td className="px-4 py-4">{item.cnicImageFront ? <a href={imageUrl(item.cnicImageFront)} target="_blank" rel="noreferrer" className="font-semibold text-[#075985] hover:underline">View Front</a> : "—"}</td>
                    <td className="px-4 py-4">{item.cnicImageBack ? <a href={imageUrl(item.cnicImageBack)} target="_blank" rel="noreferrer" className="font-semibold text-[#075985] hover:underline">View Back</a> : "—"}</td>
                    <td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => navigate(`/staff/edit/${item.id}`)} className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-700 hover:bg-blue-100">Edit</button><button disabled={deleteLoading === item.id} onClick={() => deleteItem(item)} className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">{deleteLoading === item.id ? "..." : "Delete"}</button></div></td>
                  </tr>)}
                  {!filteredStaff.length && <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-500">No staff records found.</td></tr>}
                </tbody>
              </table>
            </div>}
        </div>
      </div>
    </AdminLayout>
  );
};
export default Staffs;
