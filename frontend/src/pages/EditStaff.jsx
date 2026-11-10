import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

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

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition hover:border-[#198754] focus:border-[#198754] focus:ring-4 focus:ring-green-100";
  const fields = [["staffName","Staff Name","text"],["fatherName","Father Name","text"],["designation","Designation","text"],["cnicNo","CNIC Number","text"],["mobileNo","Mobile Number","tel"],["salary","Monthly Salary","number"],["email","Email","email"],["password","New Password (optional)","password"]];

  return (
    <AdminLayout title="Edit Staff">
      {/* FontAwesome CDN Link */}
      <div dangerouslySetInnerHTML={{ __html: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />` }} />

      <div className="w-full space-y-6">

        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#198754] to-[#146c43] p-6 md:p-8 text-white shadow-lg lg:flex-row lg:items-center w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-user-pen"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Staff Management
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-0.5">
                Edit Staff
              </h1>
              <p className="mt-1 text-sm text-green-100">
                Update staff personal details, salary, credentials, and verification images.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/staff")}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25 border border-white/25"
          >
            <i className="fa-solid fa-list-ul"></i> View All Staff
          </button>
        </div>

        {/* ================= ALERTS ================= */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{success}</p>
            </div>
          </div>
        )}

        {/* ================= FORM / LOADING ================= */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-sm">
            Loading staff record...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm w-full">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {fields.map(([key, label, type]) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-2 block text-sm font-semibold text-gray-700">
                    {label}{key !== "password" && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    id={key}
                    name={key}
                    type={type}
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={key === "password" ? "Leave blank to keep current password" : `Enter ${label.toLowerCase()}`}
                    min={key === "salary" ? "0" : undefined}
                    step={key === "salary" ? "0.01" : undefined}
                    minLength={key === "password" ? 8 : undefined}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-semibold text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Enter complete residential address"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[["image", "Staff Image"], ["cnicImageFront", "CNIC Front"], ["cnicImageBack", "CNIC Back"]].map(([key, label]) => (
                <div key={key} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-[#198754]">
                  <label htmlFor={key} className="mb-3 block font-semibold text-gray-700 text-sm">
                    {label}
                  </label>
                  {previews[key] || existingImages[key] ? (
                    <img
                      src={previews[key] || imageUrl(existingImages[key])}
                      alt={label}
                      className="mb-3 h-40 w-full rounded-xl object-contain bg-white border border-gray-100 p-2"
                    />
                  ) : (
                    <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 text-sm">
                      No image uploaded
                    </div>
                  )}
                  <input
                    id={key}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFile(e, key)}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-[#198754] hover:file:bg-green-100 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/staff")}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#198754] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43] disabled:opacity-60"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                {saving ? "Updating Staff..." : "Update Staff Record"}
              </button>
            </div>
          </form>
        )}

      </div>
    </AdminLayout>
  );
};

export default EditStaff;