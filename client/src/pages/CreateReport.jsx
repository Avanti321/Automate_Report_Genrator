import { useState } from "react";
import axios from "axios";

const emptyReport = () => ({
  title: "",
  date: "",
  duration: "",
  objective: "",
  summary: "",
  organizedBy: "",
  speakerName: "",
  speakerDesignation: "",
  registrationLink: "",
  attendanceLink: "",
  sessionRoles: { hod: "", coordinator: "", anchor: "", voteOfThanks: "" },
  whocanattend: [],
  noticeFiles: [],
  photos: [],
  noticePreviews: [],
  photoPreviews: [],
  email: "",
});

function FilePreview({ previews, label, onRemove }) {
  if (!previews.length) return null;
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2">
        {label} ({previews.length} selected)
      </p>
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative group">
            <img
              src={src}
              alt={`preview-${i}`}
              className="w-20 h-20 object-contain rounded-lg border border-gray-200 shadow-sm bg-gray-50"
            />
            <button
              onClick={() => onRemove(i)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportCard({ index, report, onChange, onRemove, totalReports }) {
  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition text-sm";

  const set = (field, value) => onChange(index, field, value);
  const setRole = (role, value) =>
    onChange(index, "sessionRoles", { ...report.sessionRoles, [role]: value });

  const handleFiles = (e, type) => {
    const files = Array.from(e.target.files);
    const previews = [];
    let loaded = 0;
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews[i] = ev.target.result;
        loaded++;
        if (loaded === files.length) {
          if (type === "notice") {
            onChange(index, "noticeFiles", [...report.noticeFiles, ...files]);
            onChange(index, "noticePreviews", [...report.noticePreviews, ...previews]);
          } else {
            onChange(index, "photos", [...report.photos, ...files]);
            onChange(index, "photoPreviews", [...report.photoPreviews, ...previews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (type, i) => {
    if (type === "notice") {
      onChange(index, "noticeFiles", report.noticeFiles.filter((_, idx) => idx !== i));
      onChange(index, "noticePreviews", report.noticePreviews.filter((_, idx) => idx !== i));
    } else {
      onChange(index, "photos", report.photos.filter((_, idx) => idx !== i));
      onChange(index, "photoPreviews", report.photoPreviews.filter((_, idx) => idx !== i));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <h3 className="text-base font-bold text-gray-800">
            {report.title || `Report ${index + 1}`}
          </h3>
        </div>
        {totalReports > 1 && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-600 text-sm font-medium transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        )}
      </div>

      {/* EVENT DETAILS */}
      <section className="mb-6">
        <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4">
          Event Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project Title *</label>
            <input type="text" className={inputClass} placeholder="e.g. Workshop on Web Development"
              value={report.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
            <input type="date" className={inputClass}
              value={report.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
            <input type="text" className={inputClass} placeholder="e.g. 2:00 PM to 4:00 PM"
              value={report.duration} onChange={(e) => set("duration", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Organized By</label>
            <input type="text" className={inputClass} placeholder="e.g. Department of Computer Science"
              value={report.organizedBy} onChange={(e) => set("organizedBy", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Speaker Name</label>
            <input type="text" className={inputClass}
              value={report.speakerName} onChange={(e) => set("speakerName", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Speaker Designation</label>
            <input type="text" className={inputClass}
              value={report.speakerDesignation} onChange={(e) => set("speakerDesignation", e.target.value)} />
          </div>
        </div>

        {/* Who can attend */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            WHO CAN ATTEND? <span className="text-gray-400">(select one or more)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {["Students", "Faculty Members", "Researchers", "All"].map((cls) => {
              const isAll = cls === "All";
              const selected = isAll
                ? report.whocanattend.includes("All")
                : report.whocanattend.includes(cls) && !report.whocanattend.includes("All");
              const toggle = () => {
                if (isAll) {
                  set("whocanattend", report.whocanattend.includes("All") ? [] : ["All"]);
                } else {
                  const without = report.whocanattend.filter((c) => c !== "All");
                  set("whocanattend", without.includes(cls) ? without.filter((c) => c !== cls) : [...without, cls]);
                }
              };
              return (
                <button key={cls} type="button" onClick={toggle}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? isAll
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {cls}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mb-6">
        <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4">
          Content
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Objective</label>
            <textarea rows={3} className={inputClass} placeholder="State the objective of the event..."
              value={report.objective} onChange={(e) => set("objective", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Summary</label>
            <textarea rows={4} className={inputClass} placeholder="Brief summary of what happened..."
              value={report.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
        </div>
      </section>

      {/* LINKS */}
      <section className="mb-6">
        <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4">
          Links
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Registration Link</label>
            <input type="url" className={inputClass} placeholder="https://..."
              value={report.registrationLink} onChange={(e) => set("registrationLink", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Attendance Link</label>
            <input type="url" className={inputClass} placeholder="https://..."
              value={report.attendanceLink} onChange={(e) => set("attendanceLink", e.target.value)} />
          </div>
        </div>
      </section>

      {/* SESSION ROLES */}
      <section className="mb-6">
        <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4">
          Session Roles
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: "hod", label: "HOD" },
            { key: "coordinator", label: "Coordinator" },
            { key: "anchor", label: "Anchor" },
            { key: "voteOfThanks", label: "Vote of Thanks" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type="text" className={inputClass}
                value={report.sessionRoles[key]}
                onChange={(e) => setRole(key, e.target.value)} />
            </div>
          ))}
        </div>
      </section>

      {/* FILES */}
      <section className="mb-6">
        <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4">
          Attachments
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notice / Circular Photos</label>
            <input type="file" multiple accept="image/*"
              onChange={(e) => handleFiles(e, "notice")}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition" />
            <FilePreview previews={report.noticePreviews} label="Notice photos"
              onRemove={(i) => removeFile("notice", i)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event Photos</label>
            <input type="file" multiple accept="image/*"
              onChange={(e) => handleFiles(e, "photos")}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition" />
            <FilePreview previews={report.photoPreviews} label="Event photos"
              onRemove={(i) => removeFile("photos", i)} />
          </div>
        </div>
      </section>

      {/* EMAIL */}
      <section>
        <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4">
          Email Delivery
        </h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Recipient Email <span className="text-gray-400">(PDF will be sent here)</span>
          </label>
          <input type="email" className={inputClass} placeholder="hod@college.edu"
            value={report.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </section>
    </div>
  );
}

export default function CreateReport() {
  const [reports, setReports] = useState([emptyReport()]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const updateReport = (index, field, value) => {
    setReports((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const addReport = () => setReports((prev) => [...prev, emptyReport()]);

  const removeReport = (index) =>
    setReports((prev) => prev.filter((_, i) => i !== index));

  const submitAll = async () => {
    for (let i = 0; i < reports.length; i++) {
      if (!reports[i].title || !reports[i].date) {
        setResults([
          { index: i, type: "error", msg: `Report ${i + 1}: Title and Date are required.` },
        ]);
        return;
      }
    }

    setLoading(true);
    setResults([]);
    const newResults = [];

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      try {
        const formData = new FormData();
        const { noticeFiles, photos, noticePreviews, photoPreviews, email, ...reportData } = report;
        formData.append("data", JSON.stringify(reportData));
        noticeFiles.forEach((f) => formData.append("noticeFile", f));
        photos.forEach((f) => formData.append("photos", f));

        const res = await axios.post("http://localhost:5000/api/reports", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        let emailMsg = "";
        if (email) {
          try {
            await axios.post(`http://localhost:5000/api/reports/email/${res.data._id}`, { to: email });
            emailMsg = ` | Email sent to ${email}`;
          } catch {
            emailMsg = " | Email delivery failed";
          }
        }

        newResults.push({
          index: i,
          type: "success",
          msg: `Report "${report.title}" generated ✅${emailMsg}`,
        });
      } catch (err) {
        newResults.push({
          index: i,
          type: "error",
          msg: `Report "${report.title || i + 1}" failed: ${err.response?.data?.error || err.message}`,
        });
      }
    }

    setResults(newResults);
    setLoading(false);

    const failedIndexes = new Set(
      newResults.filter((r) => r.type === "error").map((r) => r.index)
    );
    setReports((prev) => prev.map((r, i) => (failedIndexes.has(i) ? r : emptyReport())));
  };

  return (
    <div className="min-h-full bg-gray-50 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Generate Activity Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create one or more reports at once. Each PDF will include all photos and a QR code.
        </p>
      </div>

      <div className="max-w-4xl">
        {/* Result Messages */}
        {results.length > 0 && (
          <div className="mb-6 space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-sm font-medium ${
                  r.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {r.msg}
              </div>
            ))}
          </div>
        )}

        {/* Report Cards */}
        {reports.map((report, index) => (
          <ReportCard
            key={index}
            index={index}
            report={report}
            onChange={updateReport}
            onRemove={removeReport}
            totalReports={reports.length}
          />
        ))}

        {/* Add Report */}
        <button
          onClick={addReport}
          className="w-full py-4 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-500 font-semibold hover:bg-indigo-50 hover:border-indigo-400 transition mb-6 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Report
        </button>

        {/* Submit */}
        <button
          onClick={submitAll}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white text-base font-bold shadow-lg transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95"
          }`}
        >
          {loading
            ? `Generating ${reports.length} Report${reports.length > 1 ? "s" : ""}...`
            : `Generate ${reports.length} Report${reports.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
