import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import bg from "../assets/college.jpg";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", handleScroll); };
  }, []);

  return (
    <div className="text-white" style={{ fontFamily: "'Georgia', serif" }}>

      {/* ═══════════════════════════════════════
          HERO — Full-Screen College Background
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* College image — fixed attachment creates parallax on scroll */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundAttachment: "fixed",
            transform: `translateY(${scrollY * 0.15}px)`,
            willChange: "transform",
          }}
        />

        {/* Layer 1: Dark tint */}
        <div className="absolute inset-0" style={{ background: "rgba(8,12,35,0.65)" }} />

        {/* Layer 2: Rich gradient from bottom for text clarity */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(8,12,35,0.3) 50%, rgba(8,12,35,0.92) 100%)",
          }}
        />

        {/* Layer 3: Subtle blue vignette on sides */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(15,23,80,0.5) 100%)",
          }}
        />

        {/* ── NAVBAR ── */}
        <nav
          className="relative z-20 flex justify-between items-center px-8 md:px-14 py-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(99,179,237,0.2)", border: "1px solid rgba(99,179,237,0.35)" }}
            >
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-blue-100 tracking-widest uppercase" style={{ letterSpacing: "0.16em" }}>
              Activity Report System
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {[{ label: "Home", to: "/" }, { label: "Reports", to: "/reports" }, { label: "Create", to: "/create" }].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="px-4 py-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            <div className="w-px h-5 mx-2" style={{ background: "rgba(255,255,255,0.18)" }} />
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)" }}
            >
              Register
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 4px 18px rgba(99,102,241,0.45)" }}
            >
              Login
            </Link>
          </div>
        </nav>

        {/* ── HERO CONTENT ── */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pb-28 pt-10">

          {/* Animated badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-widest uppercase"
            style={{
              background: "rgba(99,102,241,0.18)",
              border: "1px solid rgba(99,102,241,0.45)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.6s ease",
              transitionDelay: "0ms",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Final Year Project · Computer Science Department
          </div>

          {/* Heading */}
          <h1
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{
              fontFamily: "'Georgia', serif",
              lineHeight: 1.15,
              textShadow: "0 4px 32px rgba(0,0,0,0.7)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.7s ease",
              transitionDelay: "150ms",
            }}
          >
            Automatic Department
            <br />
            <span style={{
              background: "linear-gradient(90deg, #93c5fd 0%, #a5b4fc 50%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Activity Report System
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="max-w-xl text-base md:text-lg text-blue-100/75 leading-relaxed mb-12"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.7s ease",
              transitionDelay: "280ms",
            }}
          >
            A centralized web platform designed to simplify documentation
            of departmental events — with instant PDF export and email sharing.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-wrap justify-center gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.7s ease",
              transitionDelay: "400ms",
            }}
          >
            <Link
              to="/create"
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 8px 28px rgba(99,102,241,0.5)" }}
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Report
            </Link>
            <Link
              to="/reports"
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.28)", backdropFilter: "blur(8px)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Reports
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-40" style={{ animation: "bob 2.4s ease-in-out infinite" }}>
          <span className="text-xs tracking-widest uppercase text-blue-200" style={{ letterSpacing: "0.18em" }}>Scroll</span>
          <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <section style={{ background: "linear-gradient(90deg,#1e1b4b,#1e3a5f)" }} className="py-10 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "100%", label: "Automated Reports" },
            { value: "PDF", label: "Instant Export" },
            { value: "Email", label: "Direct Sharing" },
            { value: "Secure", label: "Role-Based Access" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-bold mb-1" style={{ background: "linear-gradient(90deg,#93c5fd,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {s.value}
              </div>
              <div className="text-xs text-blue-300/60 tracking-widest uppercase" style={{ letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ OVERVIEW ═══════════ */}
      <section className="bg-white text-gray-800 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-3">About this system</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Project Overview</h2>
            <div className="w-14 h-1 rounded-full bg-indigo-500 mx-auto mt-5" />
          </div>
          <p className="text-center text-gray-600 max-w-2xl mx-auto leading-relaxed mb-16">
            This system automates the preparation of departmental activity reports. Faculty members can enter activity details, upload supporting documents, and generate professionally formatted reports instantly.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🔐", color: "#3b82f6", bg: "#eff6ff", title: "User Authentication", desc: "Secure role-based login for faculty and administrators." },
              { icon: "📋", color: "#6366f1", bg: "#eef2ff", title: "Report Management", desc: "Create, update and manage activity reports efficiently." },
              { icon: "📄", color: "#10b981", bg: "#ecfdf5", title: "Document Generation", desc: "Generate PDF reports and share via email instantly." },
            ].map((card, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default"
                style={{ border: "1.5px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl" style={{ background: card.bg }}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OBJECTIVES ═══════════ */}
      <section className="bg-gray-50 text-gray-800 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-3">Why this system?</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>Project Objectives</h2>
            <div className="w-14 h-1 rounded-full bg-indigo-500 mx-auto mt-5" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Automate preparation of departmental activity reports",
              "Centralized storage for all event documentation",
              "Enable PDF generation and direct email sharing",
              "Reduce manual paperwork and human errors",
              "Improve accessibility and long-term record management",
              "Role-based access control for faculty and admins",
            ].map((obj, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white hover:shadow-md transition-all duration-200 cursor-default" style={{ border: "1.5px solid #f1f5f9" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#eef2ff" }}>
                  <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-20 px-8 text-white" style={{ background: "linear-gradient(135deg,#1e1b4b,#1e3a5f)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">Simple Process</p>
          <h2 className="text-3xl font-bold mb-12" style={{ fontFamily: "'Georgia', serif" }}>How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { step: "01", title: "Login", desc: "Faculty log in securely with role-based credentials." },
              { step: "02", title: "Fill Details", desc: "Enter event info, upload notices and photographs." },
              { step: "03", title: "Generate", desc: "Download PDF or email directly to the department." },
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-4xl font-black mb-3 leading-none" style={{ background: "linear-gradient(90deg,#93c5fd,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Georgia', serif" }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-blue-200/65 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="text-center py-7 text-xs tracking-widest uppercase" style={{ background: "#0b0d1e", color: "rgba(148,163,184,0.5)", letterSpacing: "0.12em" }}>
        © 2026 Automatic Department Activity Report System &nbsp;·&nbsp; Computer Science Department
      </footer>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
}
