import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);
  const [photo, setPhoto] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => () => stream?.getTracks().forEach(track => track.stop()), [stream]);

  const loadRecords = async () => {
    try {
      const r = await api.get('/attendance/mine');
      setRecords(r.data?.attendance || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Attendance history could not be loaded.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('studentToken')) {
      navigate('/student/login', { replace: true });
      return;
    }
    loadRecords();
  }, [navigate]);

  const openCamera = async () => {
    setError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(media);
      setCameraOpen(true);
      requestAnimationFrame(() => {
        const video = document.getElementById('attendance-camera');
        if (video) {
          video.srcObject = media;
          video.play().catch(() => {});
        }
      });
    } catch {
      setError('Camera access was denied or unavailable. Allow camera permission and use HTTPS or localhost.');
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById('attendance-camera');
    if (!video || !video.videoWidth) return setError('Camera is not ready yet. Please try again.');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = Math.round((640 * video.videoHeight) / video.videoWidth);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/jpeg', 0.72));
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const mark = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const r = await api.post('/attendance/mark', { photo: photo || null, source: 'Student Panel' });
      setMessage(r.data?.message || 'Attendance recorded.');
      setPhoto('');
      await loadRecords();
    } catch (e) {
      setError(e.response?.data?.message || 'Attendance could not be recorded. Connect to institute Wi-Fi and try again.');
    } finally {
      setBusy(false);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraOpen(false);
  };

  // ===================================================
  // EXPORT TO EXCEL / CSV
  // ===================================================
  const exportToExcel = () => {
    if (records.length === 0) {
      setError('No attendance records available to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Check-In,Check-Out,Status,Method\n";

    records.forEach((r) => {
      const checkInTime = r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-PK') : '-';
      const checkOutTime = r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-PK') : '-';
      const row = [
        `"${r.attendanceDate || '-'}"`,
        `"${checkInTime}"`,
        `"${checkOutTime}"`,
        `"${r.status || '-'}"`,
        `"${r.source || '-'}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Monthly_Attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage('Monthly attendance exported successfully!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 md:p-6">
      {/* PAGE HEADER */}
      <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                <i className="fa-solid fa-calendar-check text-white"></i>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">My Attendance</h1>
            </div>
            <p className="text-green-100">Check in when you arrive and check out when you leave.</p>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            className="bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 border border-white/20 cursor-pointer"
          >
            <i className="fa-solid fa-file-excel"></i>
            Export Excel
          </button>
        </div>
      </div>

      {/* ERROR & MESSAGE */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
          <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {message && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm">
          <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
          <div>
            <p className="font-semibold">Success</p>
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
      )}

      {/* MARK ATTENDANCE SECTION */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-[#198754] flex items-center justify-center text-xl">
            <i className="fa-solid fa-camera"></i>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Mark today's attendance</h2>
            <p className="text-xs text-gray-500">Use institute Wi-Fi. Optional camera verification proof.</p>
          </div>
        </div>

        {cameraOpen && (
          <div className="mt-4 space-y-3">
            <video id="attendance-camera" autoPlay playsInline className="max-h-96 w-full rounded-xl bg-black object-contain" />
            <div className="flex flex-wrap gap-3">
              <button onClick={capturePhoto} className="rounded-xl bg-[#198754] px-5 py-2.5 font-semibold text-white shadow hover:bg-[#146c43] transition">
                Capture photo
              </button>
              <button onClick={stopCamera} className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 transition">
                Cancel camera
              </button>
            </div>
          </div>
        )}

        {photo && (
          <div className="mt-4 flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <img src={photo} alt="Attendance proof" className="h-20 w-20 rounded-xl object-cover border" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Photo attached</p>
              <button onClick={() => setPhoto('')} className="mt-1 text-xs font-semibold text-red-600 hover:underline">
                Remove photo
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={openCamera}
            disabled={cameraOpen || busy}
            className="rounded-xl border border-[#198754] px-5 py-3 font-semibold text-[#198754] hover:bg-green-50 disabled:opacity-50 transition"
          >
            {photo ? 'Retake photo' : 'Open camera (optional)'}
          </button>

          <button
            onClick={mark}
            disabled={busy || cameraOpen}
            className="rounded-xl bg-[#198754] px-6 py-3 font-bold text-white shadow hover:bg-[#146c43] disabled:opacity-50 transition"
          >
            {busy ? 'Saving…' : 'Scan / Mark Attendance'}
          </button>
        </div>
      </section>

      {/* MONTHLY ATTENDANCE TABLE SECTION */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-[#198754] flex items-center justify-center text-xl">
              <i className="fa-solid fa-list-ul"></i>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Monthly Attendance Records</h2>
              <p className="text-xs text-gray-500">Line-by-line view of your recent attendance history</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Check-in</th>
                <th className="p-4">Check-out</th>
                <th className="p-4">Status</th>
                <th className="p-4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-green-50/40 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{r.attendanceDate || '-'}</td>
                  <td className="p-4 text-gray-600">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-PK') : '-'}</td>
                  <td className="p-4 text-gray-600">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-PK') : '-'}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      (r.status || '').toLowerCase() === 'present'
                        ? 'bg-green-100 text-green-700'
                        : (r.status || '').toLowerCase() === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{r.source || '-'}</td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="text-3xl mb-2 text-gray-300">
                      <i className="fa-solid fa-folder-open"></i>
                    </div>
                    No attendance records found for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}