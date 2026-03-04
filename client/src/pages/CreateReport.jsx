import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function CreateReport() {
  const [form, setForm] = useState({
    title: "",
    date: "",
    duration: "",
    agenda: "",
    summary: "",
    organizedBy: "",
    speakerName: "",
    speakerDesignation: "",
    sessionRoles: { hod: "", coordinator: "", anchor: "", voteOfThanks: "" },
    classType: [],
  });
  
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState([]); 
  const [photos, setPhotos] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); 

  const handleClassType = (value) => {
    const current = form.classType || [];
    if (current.includes(value)) {
      setForm({ ...form, classType: current.filter((c) => c !== value) });
    } else {
      setForm({ ...form, classType: [...current, value] });
    }
  };

  const submit = async () => {
  if (!form.title || !form.date) {
    setStatus({ type: "error", msg: "Please fill required fields." });
    return;
  }

  setLoading(true);
  setStatus(null);

  const data = new FormData();
  data.append("data", JSON.stringify(form));

  // limit notice to 5
  if (notice.length > 5) {
    setStatus({ type: "error", msg: "Maximum 5 notice photos allowed." });
    setLoading(false);
    return;
  }

  notice.forEach((file) => {
    data.append("noticeFile", file);
  });

  photos.forEach((file) => {
    data.append("photos", file);
  });

  try {
    const res = await axios.post(
      "http://localhost:5000/api/reports",
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    setStatus({ type: "success", msg: "Report Generated Successfully ✅" });

    // Reset form
    setForm({
      title: "",
      date: "",
      duration: "",
      agenda: "",
      summary: "",
      organizedBy: "",
      speakerName: "",
      speakerDesignation: "",
      sessionRoles: { hod: "", coordinator: "", anchor: "", voteOfThanks: "" },
      classType: [],
    });

    setNotice([]);
    setPhotos([]);
    setEmail("");
  } catch (err) {
    setStatus({
      type: "error",
      msg: err.response?.data?.error || "Report generation failed ❌",
    });
  } finally {
    setLoading(false);
  }
};

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

  return (
     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Top bar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Activity Report System
        </Link>
        <div className="space-x-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition">
            Dashboard
          </Link>
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">
            Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-50">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800">Generate Activity Report</h2>
            <p className="text-gray-500 mt-2">Fill in the details below to automate your college report generation.</p>
          </div>

          {status && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium animate-pulse ${
              status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {status.msg}
            </div>
          )}

          {/* BASIC INFO */}
          <div className="space-y-6 mb-10">
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Workshop on Web Development"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2:00 PM to 4:00 PM"
                  className={inputClass}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organized By</label>
                <input
                  type="text"
                  placeholder="e.g. Department of Computer Science"
                  className={inputClass}
                  value={form.organizedBy}
                  onChange={(e) => setForm({ ...form, organizedBy: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.speakerName}
                  onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Designation</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.speakerDesignation}
                  onChange={(e) => setForm({ ...form, speakerDesignation: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SESSION ROLES */}
          <div className="space-y-6 mb-10">
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">Session Conducted By</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="HOD Name"
                className={inputClass}
                value={form.sessionRoles.hod}
                onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, hod: e.target.value } })}
              />
              <input
                type="text"
                placeholder="Coordinator Name"
                className={inputClass}
                value={form.sessionRoles.coordinator}
                onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, coordinator: e.target.value } })}
              />
              <input
                type="text"
                placeholder="Anchor Name"
                className={inputClass}
                value={form.sessionRoles.anchor}
                onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, anchor: e.target.value } })}
              />
              <input
                type="text"
                placeholder="Vote of Thanks"
                className={inputClass}
                value={form.sessionRoles.voteOfThanks}
                onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, voteOfThanks: e.target.value } })}
              />
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="space-y-6 mb-10">
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">Content</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
              <textarea
                className={inputClass}
                rows="3"
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea
                className={inputClass}
                rows="5"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* PHOTOS SECTION */}
          <div className="space-y-6 mb-10">
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">Upload Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Report Photos</label>
                <input
                  type="file"
                  multiple //
                  onChange={(e) => setNotice(Array.from(e.target.files))} //
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Event Photos</label>
                <input
                  type="file"
                  multiple //
                  onChange={(e) => setPhotos(Array.from(e.target.files))} //
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition"
                />
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">Email Delivery</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email (PDF will be sent here)</label>
            <input
              type="email"
              className={inputClass}
              placeholder="hod@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={submit}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white text-lg font-semibold shadow-lg transition ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.01]"
            }`}
          >
            {loading ? "Generating Report..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
