import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function CreateReport() {
  const [form, setForm] = useState({
    sessionRoles: { hod: "", coordinator: "", anchor: "", voteOfThanks: "" },
    classType: [],
  });
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState(null);
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
      setStatus({ type: "error", msg: "Title and Date are required." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const data = new FormData();

      const simpleFields = ["title", "date", "duration", "agenda", "summary", "organizedBy", "speakerName", "speakerDesignation"];
      simpleFields.forEach((k) => {
        if (form[k]) data.append(k, form[k]);
      });

    
      data.append("sessionRoles", JSON.stringify(form.sessionRoles));
      data.append("classType", JSON.stringify(form.classType));

      if (notice) data.append("notice", notice);
      photos.forEach((p) => data.append("photos", p));

      const res = await axios.post("http://localhost:5000/api/reports/create", data);
      const reportId = res.data._id;

      let msg = "Report created successfully!";

      if (email.trim()) {
        await axios.post(`http://localhost:5000/api/reports/email/${reportId}`, {
          to: email.trim(),
        });
        msg += " Email sent to " + email.trim();
      }

      setStatus({ type: "success", msg });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: err.response?.data?.error || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

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

      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Activity Report</h1>
          <p className="text-gray-500 mt-2">Fill in the details below to generate and email your report</p>
        </div>

        {/* Status message */}
        {status && (
          <div
            className={`mb-6 px-5 py-4 rounded-lg text-sm font-medium ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {status.msg}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className={inputClass} placeholder="Event Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" className={inputClass} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input className={inputClass} placeholder="e.g. 2 hours" onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organized By</label>
                <input className={inputClass} placeholder="Department / Committee" onChange={(e) => setForm({ ...form, organizedBy: e.target.value })} />
              </div>
            </div>
          </div>

          {/* SPEAKER INFO */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Speaker Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                <input className={inputClass} placeholder="Full Name" onChange={(e) => setForm({ ...form, speakerName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Designation</label>
                <input className={inputClass} placeholder="e.g. Professor, HOD" onChange={(e) => setForm({ ...form, speakerDesignation: e.target.value })} />
              </div>
            </div>
          </div>

          {/*  CLASS TYPE  */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Target Audience
            </h3>
            <div className="flex flex-wrap gap-3">
              {["FY", "SY", "TY", "BTech", "MTech", "All"].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => handleClassType(cls)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    (form.classType || []).includes(cls)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/*  SESSION ROLES */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Session Roles
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOD</label>
                <input className={inputClass} placeholder="HOD Name" onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, hod: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator</label>
                <input className={inputClass} placeholder="Coordinator Name" onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, coordinator: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anchor</label>
                <input className={inputClass} placeholder="Anchor Name" onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, anchor: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vote of Thanks</label>
                <input className={inputClass} placeholder="Name" onChange={(e) => setForm({ ...form, sessionRoles: { ...form.sessionRoles, voteOfThanks: e.target.value } })} />
              </div>
            </div>
          </div>

          {/*  AGENDA & SUMMARY  */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                <textarea className={inputClass + " min-h-[80px]"} placeholder="Event agenda..." onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea className={inputClass + " min-h-[100px]"} placeholder="Detailed summary of the event..." onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </div>
            </div>
          </div>

          {/* FILE UPLOADS */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Attachments
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Notice</label>
                <input
                  type="file"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition"
                  onChange={(e) => setNotice(e.target.files[0])}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
                <input
                  type="file"
                  multiple
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition"
                  onChange={(e) => setPhotos([...e.target.files])}
                />
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              Email Report
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email (report PDF will be sent here)
            </label>
            <input
              type="email"
              className={inputClass}
              placeholder="e.g. hod@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to skip email sending.</p>
          </div>

          {/*  SUBMIT */}
          <button
            onClick={submit}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white text-lg font-semibold shadow-lg transition ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            }`}
          >
            {loading ? "Generating Report & Sending Email..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
