import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const API_SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const imageUrl = (value) => !value ? "" : value.startsWith("http") ? value : `${API_SERVER_URL}${value.startsWith("/") ? value : `/${value}`}`;
const blank = { staffName: "", fatherName: "", designation: "", cnicNo: "", mobileNo: "", address: "", salary: "", email: "", password: "", image: null, cnicImageFront: null, cnicImageBack: null };

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [existingImages, setExistingImages] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await api.get(`/staff/${id}`);
        if (!active) return;
        const item = response.data?.staff;
        if (!item) throw new Error("Staff record not found.");
        setForm({ ...blank, ...item, salary: item.salary ?? "", password: "", image: null, cnicImageFront: null, cnicImageBack: null });
        setExistingImages({ image: item.image, cnicImageFront: item.cnicImageFront, cnicImageBack: item.cnicImageBack });
      } catch (e) { if (active) setError(e.response?.data?.message || e.message || "Could not load staff."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  const handleFile = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose JPG, PNG or WEBP image up to 5MB.");
      e.target.value = "";
      return;
    }
    setForm((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.staffName.trim() || !form.fatherName.trim() || !form.designation.trim() || !form.cnicNo.trim() || !form.mobileNo.trim() || !form.address.trim() || !form.email.trim()) return setError("Please complete all required fields.");
    if (form.password && form.password.length < 8) return setError("New password must be at least 8 characters.");
    if (form.salary === "" || !Number.isFinite(Number(form.salary)) || Number(form.salary) < 0) return setError("Enter a valid salary.");

    const data = new FormData();
    ["staffName", "fatherName", "designation", "cnicNo", "mobileNo", "address", "salary", "email"].forEach((key) => data.append(key, String(form[key]).trim()));
    if (form.password.trim()) data.append("password", form.password);
    ["image", "cnicImageFront", "cnicImageBack"].forEach((key) => { if (form[key]) data.append(key, form[key]); });
    setSaving(true);
    try {
      const response = await api.put(`/staff/${id}`, data);
      if (response.data?.success) { setSuccess("Staff updated successfully."); setTimeout(() => navigate("/staff"), 700); }
      else setError(response.data?.message || "Update failed.");
    } catch (e) { setError(e.response?.data?.message || "Could not update staff."); }
    finally { setSaving(false); }
  };

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#075985] focus:ring-4 focus:ring-blue-100";
  const fields = [["staffName","Staff Name","text"],["fatherName","Father Name","text"],["designation","Designation","text"],["cnicNo","CNIC Number","text"],["mobileNo","Mobile Number","tel"],["salary","Monthly Salary","number"],["email","Email","email"],["password","New Password (optional)","password"]];

  return <AdminLayout title="Edit Staff">
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#075985] to-[#064e6f] p-6 text-white shadow-lg"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">Edit Staff</h1><p className="mt-2 text-blue-100">Update staff details, salary and email.</p></div><button type="button" onClick={() => navigate("/staff")} className="rounded-xl bg-white px-5 py-3 font-semibold text-[#075985]">View All Staff</button></div></div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div>}
      {success && <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">{success}</div>}
      {loading ? <div className="rounded-2xl bg-white p-10 text-center">Loading staff record...</div> : <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map(([key,label,type]) => <div key={key}><label htmlFor={key} className="mb-2 block text-sm font-semibold text-gray-700">{label}{key !== "password" && <span className="text-red-500"> *</span>}</label><input id={key} name={key} type={type} value={form[key] ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={key === "password" ? "Leave blank to keep current password" : `Enter ${label.toLowerCase()}`} min={key === "salary" ? "0" : undefined} step={key === "salary" ? "0.01" : undefined} minLength={key === "password" ? 8 : undefined} className={inputClass} /></div>)}
        </div>
        <div><label htmlFor="address" className="mb-2 block text-sm font-semibold text-gray-700">Address <span className="text-red-500">*</span></label><textarea id="address" rows={3} value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} className={inputClass} /></div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[["image","Staff Image"],["cnicImageFront","CNIC Front"],["cnicImageBack","CNIC Back"]].map(([key,label]) => <div key={key} className="rounded-xl border border-gray-200 p-4"><label htmlFor={key} className="mb-3 block font-semibold text-gray-700">{label}</label>{previews[key] || existingImages[key] ? <img src={previews[key] || imageUrl(existingImages[key])} alt={label} className="mb-3 h-40 w-full rounded-lg object-contain bg-gray-50" /> : <div className="mb-3 flex h-40 items-center justify-center bg-gray-50 text-gray-400">No image</div>}<input id={key} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => handleFile(e,key)} className="w-full text-sm" /></div>)}
        </div>
        <div className="flex justify-end gap-3 border-t pt-6"><button type="button" onClick={() => navigate("/staff")} className="rounded-xl border px-6 py-3 font-semibold text-gray-700">Cancel</button><button disabled={saving} className="rounded-xl bg-[#075985] px-6 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Updating..." : "Update Staff"}</button></div>
      </form>}
    </div>
  </AdminLayout>;
};
export default EditStaff;
