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
    try { const r = await api.get('/attendance/mine'); setRecords(r.data?.attendance || []); }
    catch (e) { setError(e.response?.data?.message || 'Attendance history could not be loaded.'); }
  };
  useEffect(() => {
    if (!localStorage.getItem('studentToken')) { navigate('/student/login', { replace: true }); return; }
    loadRecords();
  }, [navigate]);

  const openCamera = async () => {
    setError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(media); setCameraOpen(true);
      requestAnimationFrame(() => { const video = document.getElementById('attendance-camera'); if (video) { video.srcObject = media; video.play().catch(() => {}); } });
    } catch { setError('Camera access was denied or unavailable. Allow camera permission and use HTTPS or localhost.'); }
  };
  const capturePhoto = () => {
    const video = document.getElementById('attendance-camera');
    if (!video || !video.videoWidth) return setError('Camera is not ready yet. Please try again.');
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = Math.round(640 * video.videoHeight / video.videoWidth);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/jpeg', 0.72));
    stream?.getTracks().forEach(track => track.stop()); setStream(null); setCameraOpen(false);
  };
  const mark = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const r = await api.post('/attendance/mark', { photo: photo || null, source: 'Student Panel' });
      setMessage(r.data?.message || 'Attendance recorded.'); setPhoto(''); await loadRecords();
    } catch (e) { setError(e.response?.data?.message || 'Attendance could not be recorded. Connect to institute Wi-Fi and try again.'); }
    finally { setBusy(false); }
  };
  const stopCamera = () => { stream?.getTracks().forEach(track => track.stop()); setStream(null); setCameraOpen(false); };
  return <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
    <header className="rounded-2xl bg-gradient-to-r from-sky-800 to-sky-600 p-6 text-white shadow"><h1 className="text-2xl font-bold">My Attendance</h1><p className="mt-2 text-sky-100">Check in when you arrive and check out when you leave.</p></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
    {message && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800">Mark today's attendance</h2>
      <p className="mt-1 text-sm text-gray-500">Use institute Wi-Fi. The first successful tap records check-in; the next tap records check-out. A camera photo is optional proof and is not automated face recognition.</p>
      {cameraOpen && <div className="mt-4 space-y-3"><video id="attendance-camera" autoPlay playsInline className="max-h-96 w-full rounded-xl bg-black object-contain"/><div className="flex flex-wrap gap-3"><button onClick={capturePhoto} className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white">Capture photo</button><button onClick={stopCamera} className="rounded-lg border px-4 py-2">Cancel camera</button></div></div>}
      {photo && <div className="mt-4 flex items-center gap-4"><img src={photo} alt="Attendance proof" className="h-24 w-24 rounded-xl object-cover"/><button onClick={() => setPhoto('')} className="text-sm font-semibold text-red-600">Remove photo</button></div>}
      <div className="mt-5 flex flex-wrap gap-3"><button onClick={openCamera} disabled={cameraOpen || busy} className="rounded-xl border border-sky-700 px-5 py-3 font-semibold text-sky-800 disabled:opacity-50">{photo ? 'Retake photo' : 'Open camera (optional)'}</button><button onClick={mark} disabled={busy || cameraOpen} className="rounded-xl bg-sky-700 px-6 py-3 font-bold text-white shadow hover:bg-sky-800 disabled:opacity-50">{busy ? 'Saving…' : 'Scan / Mark Attendance'}</button></div>
    </section>
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="font-bold text-gray-800">Recent attendance</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Date</th><th className="p-4">Check-in</th><th className="p-4">Check-out</th><th className="p-4">Status</th><th className="p-4">Method</th></tr></thead><tbody className="divide-y">{records.map(r => <tr key={r.id}><td className="p-4">{r.attendanceDate || '-'}</td><td className="p-4">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-PK') : '-'}</td><td className="p-4">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-PK') : '-'}</td><td className="p-4">{r.status || '-'}</td><td className="p-4">{r.source || '-'}</td></tr>)}{!records.length && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No attendance records yet.</td></tr>}</tbody></table></div></section>
  </div>;
}
