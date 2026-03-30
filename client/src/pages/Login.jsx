import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") login(); };

  const inputStyle = (field) => ({
    background: focused === field ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
    border: focused === field
      ? "1.5px solid rgba(147,197,253,0.7)"
      : "1.5px solid rgba(255,255,255,0.14)",
    transition: "all 0.25s ease",
    color: "white",
    outline: "none",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,179,237,0.15)" : "none",
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0b0d1e 0%, #0f1940 40%, #1a0a3b 100%)" }}
    >
      {/* Decorative background orbs */}
      <div
        className="absolute pointer-events-none"
        style={{ width: 600, height: 600, borderRadius: "50%", top: "-200px", right: "-200px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ width: 500, height: 500, borderRadius: "50%", bottom: "-150px", left: "-150px", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(99,179,237,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.07) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 md:p-10"
        style={{
          background: "rgba(15,20,55,0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        {/* Logo + Title */}
        <div className="text-center mb-9">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif" }}>Welcome Back</h2>
          <p className="text-sm text-blue-300/60">Activity Report System</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-blue-200/70 mb-2 tracking-wide uppercase" style={{ letterSpacing: "0.08em" }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" style={{ color: focused === "email" ? "#93c5fd" : "rgba(148,163,184,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="faculty@college.edu"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm placeholder-slate-500"
                style={inputStyle("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-blue-200/70 mb-2 tracking-wide uppercase" style={{ letterSpacing: "0.08em" }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" style={{ color: focused === "password" ? "#93c5fd" : "rgba(148,163,184,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3.5 rounded-xl text-sm placeholder-slate-500"
                style={inputStyle("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full mt-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-60 disabled:scale-100 relative overflow-hidden group"
          style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 8px 28px rgba(99,102,241,0.45)" }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)" }}
          />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span className="text-xs text-slate-500">or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Register link */}
        <p className="text-center text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors duration-200"
            style={{ color: "#93c5fd" }}
            onMouseEnter={e => e.target.style.color = "#bfdbfe"}
            onMouseLeave={e => e.target.style.color = "#93c5fd"}
          >
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
