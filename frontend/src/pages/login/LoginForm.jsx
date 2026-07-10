import { useState, useRef } from "react";
import { useAppData } from "../../context/AppDataContext";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

function isValidUsername(u) {
  const v = u.trim();
  if (v.length < 4)  return { ok: false, msg: "Min 4 characters" };
  if (v.length > 15) return { ok: false, msg: "Max 15 characters" };
  if (!/^[a-zA-Z0-9_]+$/.test(v))
    return { ok: false, msg: "Only letters, numbers and underscores" };
  if (!/[a-zA-Z]/.test(v))
    return { ok: false, msg: "Must contain at least one letter" };
  return { ok: true };
}

function getPasswordStrength(p) {
  if (!p) return { score: 0, label: "", color: "" };
  let score = 0;
  if (p.length >= 8)           score++;
  if (p.length >= 12)          score++;
  if (/[A-Z]/.test(p))         score++;
  if (/[a-z]/.test(p))         score++;
  if (/[0-9]/.test(p))         score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 2) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 3) return { score, label: "Fair",   color: "#f59e0b" };
  if (score <= 4) return { score, label: "Good",   color: "#3b82f6" };
  return           { score, label: "Strong", color: "#10b981" };
}

function isValidPassword(p) {
  if (p.length < 8)       return { ok: false, msg: "At least 8 characters" };
  if (!/[A-Z]/.test(p))  return { ok: false, msg: "Include an uppercase letter" };
  if (!/[a-z]/.test(p))  return { ok: false, msg: "Include a lowercase letter" };
  if (!/[0-9]/.test(p))  return { ok: false, msg: "Include a number" };
  return { ok: true };
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
               a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
               a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ── Field input component ─────────────────────────────────────────────────────
function FieldInput({
  label, type = "text", value, onChange, onBlur,
  onKeyDown, placeholder, error, hint,
  dark, suffix, showStrength = false,
  autoComplete, inputRef,
}) {
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Label row */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   7,
      }}>
        <label style={{
          fontSize:   13,
          fontWeight: 600,
          color:      dark ? "rgba(255,255,255,0.65)" : "#3b3469",
        }}>
          {label}
        </label>
        {hint && !error && (
          <span style={{
            fontSize: 11,
            color:    dark ? "rgba(255,255,255,0.28)" : "#a09bbf",
          }}>
            {hint}
          </span>
        )}
        {showStrength && value && strength?.label && (
          <span style={{
            fontSize:   11,
            fontWeight: 600,
            color:      strength.color,
            transition: "color 0.2s",
          }}>
            {strength.label}
          </span>
        )}
      </div>

      {/* Input */}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef} 
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width:        "100%",
            boxSizing:    "border-box",
            padding:      suffix ? "12px 44px 12px 14px" : "12px 14px",
            fontSize:     14,
            fontFamily:   "inherit",
            borderRadius: 12,
            outline:      "none",
            transition:   "border-color 0.15s, box-shadow 0.15s",
            background:   dark
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,255,255,0.85)",
            border: `1.5px solid ${
              error
                ? dark ? "rgba(252,107,107,0.65)" : "#dc2626"
                : dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.18)"
            }`,
            color:     dark ? "rgba(255,255,255,0.88)" : "#1e1b4b",
            boxShadow: error
              ? `0 0 0 3px ${dark ? "rgba(252,107,107,0.15)" : "rgba(220,38,38,0.1)"}`
              : "none",
          }}
          onFocus={e => {
            if (!error) {
              e.target.style.borderColor = dark ? "#a78bfa" : "#7c3aed";
              e.target.style.boxShadow   = dark
                ? "0 0 0 3px rgba(167,139,250,0.2)"
                : "0 0 0 3px rgba(124,58,237,0.12)";
            }
          }}
          onBlurCapture={e => {
            if (!error) {
              e.target.style.borderColor = dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.18)";
              e.target.style.boxShadow = "none";
            } else {
              e.target.style.borderColor = dark ? "rgba(252,107,107,0.65)" : "#dc2626";
              e.target.style.boxShadow = `0 0 0 3px ${dark ? "rgba(252,107,107,0.15)" : "rgba(220,38,38,0.1)"}`;
            }
          }}
        />
        {suffix && (
          <div style={{
            position:       "absolute",
            right:          12,
            top:            "50%",
            transform:      "translateY(-50%)",
            color:          dark ? "rgba(255,255,255,0.38)" : "#a09bbf",
            display:        "flex",
            alignItems:     "center",
          }}>
            {suffix}
          </div>
        )}
      </div>

      {/* Password strength bar */}
      {showStrength && value && (
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              flex:         1,
              height:       3,
              borderRadius: 99,
              background:   strength.score >= i * 1.5
                ? strength.color
                : dark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
              transition:   "background 0.25s",
            }} />
          ))}
        </div>
      )}

      {/* Error container */}
      {error && (
        <div style={{
          display:      "flex",
          alignItems:   "flex-start",
          gap:          6,
          marginTop:    8,
          padding:      "8px 12px",
          borderRadius: 8,
          background:   dark ? "rgba(252,107,107,0.1)" : "rgba(220,38,38,0.06)",
          border: `1px solid ${dark ? "rgba(252,107,107,0.2)" : "rgba(220,38,38,0.15)"}`,
        }}>
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span style={{
            fontSize:   12,
            color:      dark ? "#fc6b6b" : "#dc2626",
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LoginForm({ mounted, signupSuccess, onForgot, onClose }) {
  const {
    isSignup, setIsSignup,
    uname,    setUname,
    pwd,      setPwd,
    authErr,  setAuthErr,
    login,    signup,
    dark, googleLogin,
  } = useAppData();

  // ── Local State ────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for field navigation focus chains
  const emailRef = useRef(null);
  const unameRef = useRef(null);
  const pwdRef   = useRef(null);

  // ── Internal Validation Logic ──────────────────────────────
  function validate() {
    const errs = {};
    if (isSignup) {
      if (!isValidEmail(email)) errs.email = "Enter a valid email address";
      const u = isValidUsername(uname);
      if (!u.ok) errs.uname = u.msg;
      const p = isValidPassword(pwd);
      if (!p.ok) errs.pwd = p.msg;
    } else {
      if (!uname.trim()) errs.uname = "Enter your username or email address";
      if (!pwd) errs.pwd = "Enter your password";
    }
    return errs;
  }

  function handleBlur(field) {
  // Don't show error on blur if field is empty — user may just be tabbing
  const fieldValues = { email, uname, pwd };
  const val = fieldValues[field];
  if (!val || String(val).trim() === "") return;

  setTouched(prev => ({ ...prev, [field]: true }));
  setFieldErrors(prev => ({
    ...prev,
    ...validate(),
  }));
}
  // ── Authentication Submission ──────────────────────────────
  async function handleAuth() {
    setAuthErr("");
    setFieldErrors({}); 
    setTouched({});  
    const errs = validate();
    setFieldErrors(errs);
    setTouched({ email: true, uname: true, pwd: true });
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);

    try {
     if (isSignup) {
  await signup(email);
  setFieldErrors({});
  setTouched({});
  toast.success("Account created! You can now log in ✅");
  setIsSignup(false);   // ← switch to login mode directly
} else {
  await login();
  toast.success("Welcome back! 🎉");
}
    } catch (err) {
  if (err?.status === 409) {
    setAuthErr("");
    if (err?.message?.toLowerCase().includes("email")) {
      setFieldErrors({ email: err.message });
      setTouched(prev => ({ ...prev, email: true }));
    } else if (err?.message?.toLowerCase().includes("username")) {
      setFieldErrors({ uname: err.message });
      setTouched(prev => ({ ...prev, uname: true }));
    }
  } else {
    toast.error(err?.message || "Something went wrong");
  }
} finally {
      setIsSubmitting(false);
    }
  }

  // ── CSS Style Mappings ─────────────────────────────────────
  const glassCard = {
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.78)",
    backdropFilter:       "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: `1.5px solid ${dark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.12)"}`,
    borderRadius:         24,
    padding:              "32px 28px",
    boxShadow: dark ? "0 12px 60px rgba(0,0,0,0.55)" : "0 12px 60px rgba(124,58,237,0.1)",
    width:                "100%",
    maxWidth:             400,
  };

  return (
    <div style={{
      width:          "100%",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      padding:        "0",
      position:       "relative",
      zIndex:         1,
      opacity:        mounted ? 1 : 0,
      transform:      mounted ? "translateY(0)" : "translateY(22px)",
      transition:     "opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        
        {/* Title Container */}
        <div style={{ marginBottom: 24, animation: "fadeDown 0.55s ease 0.1s both" }}>
          <h2 style={{
            margin:        "0 0 1px",
            fontSize:      26,
            fontWeight:    800,
            letterSpacing: -0.5,
            color:         dark ? "rgba(255,255,255,0.92)" : "#1e1b4b",
          }}>
            {isSignup ? "Create account" : "Welcome back 👋"}
          </h2>
        </div>

        {/* Auth Box Layout */}
        <div style={{ ...glassCard, animation: "scaleIn 0.55s ease 0.18s both" }}>
          
          {/* View Tab Toggles */}
          <div style={{
            display:      "flex",
            background:   dark ? "rgba(0,0,0,0.3)" : "rgba(124,58,237,0.06)",
            borderRadius: 14,
            padding:      5,
            marginBottom: 24,
            border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)"}`,
          }}>
            {["Login", "Sign Up"].map((label, i) => {
              const active = isSignup === (i === 1);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setIsSignup(i === 1);
                    setAuthErr("");
                    setFieldErrors({});
                    setTouched({});
                  }}
                  style={{
                    flex:         1,
                    padding:      "10px 0",
                    borderRadius: 10,
                    border:       "none",
                    cursor:       "pointer",
                    fontSize:     13,
                    fontWeight:   active ? 700 : 400,
                    background:   active ? (dark ? "rgba(167,139,250,0.2)" : "#fff") : "transparent",
                    color:        active ? (dark ? "#c4b5fd" : "#7c3aed") : (dark ? "rgba(255,255,255,0.38)" : "#a09bbf"),
                    boxShadow:    active ? (dark ? "0 2px 12px rgba(0,0,0,0.35)" : "0 2px 12px rgba(124,58,237,0.12)") : "none",
                    transition:   "all 0.2s",
                    fontFamily:   "inherit",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Verification Alert Message */}
          {signupSuccess && !isSignup && (
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              padding:      "12px 14px",
              borderRadius: 12,
              marginBottom: 20,
              background:   dark ? "rgba(52,211,153,0.12)" : "rgba(5,150,105,0.08)",
              border: `1px solid ${dark ? "rgba(52,211,153,0.3)" : "rgba(5,150,105,0.2)"}`,
            }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: dark ? "#34d399" : "#059669" }}>
                  Email verified! Account ready.
                </p>
                <p style={{ margin: 0, fontSize: 11, marginTop: 2, color: dark ? "rgba(52,211,153,0.7)" : "#059669" }}>
                  Log in below with your credentials
                </p>
              </div>
            </div>
          )}
          
          {/* Antifill Protection */}
          {isSignup && (
            <>
              <input type="text" style={{ display: "none" }} aria-hidden="true" readOnly />
              <input type="password" style={{ display: "none" }} aria-hidden="true" readOnly />
            </>
          )}

          {/* Input Layer: Email */}
          {isSignup && (
            <FieldInput
              label="Email"
              type="email"
              autoComplete="off"
              inputRef={emailRef}
              value={email}
             onChange={e => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
           setFieldErrors(prev => ({ ...prev, email: undefined }));
             }
             }}
              onBlur={() => handleBlur("email")}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), unameRef.current?.focus())}
              placeholder="you@example.com"
              error={touched.email && fieldErrors.email}
              dark={dark}
            />
          )}

          {/* Input Layer: Username / Credential Key */}
          <FieldInput
            label={isSignup ? "Username" : "Username or Email"}
            value={uname}
            inputRef={unameRef}
            autoComplete={isSignup ? "off" : "username"}
            onChange={e => {
              setUname(e.target.value);
              if (fieldErrors.uname) {
                setFieldErrors(prev => ({ ...prev, uname: undefined }));
              }
            }}
            onBlur={() => handleBlur("uname")}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), pwdRef.current?.focus())}
            placeholder={isSignup ? "e.g. khushneet_k" : "Username or email address"}
            error={touched.uname && fieldErrors.uname}
            hint={isSignup ? "letters, numbers, _ only" : null}
            dark={dark}
          />

          {/* Input Layer: Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              marginBottom:   7,
            }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(255,255,255,0.65)" : "#3b3469" }}>
                Password
              </label>
              {isSignup && pwd && (
                <span style={{ fontSize: 11, fontWeight: 600, color: getPasswordStrength(pwd).color }}>
                  {getPasswordStrength(pwd).label}
                </span>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <input
                ref={pwdRef}
                type={showPwd ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={pwd}
                  data-lpignore="true"
                 data-form-type="other"
                name={isSignup ? `pwd-${Math.random()}` : "password"}
                onChange={e => setPwd(e.target.value)}
                onBlur={() => handleBlur("pwd")}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
                placeholder={isSignup ? "Create a strong password" : "••••••••"}
                style={{
                  width:        "100%",
                  boxSizing:    "border-box",
                  padding:      "12px 44px 12px 14px",
                  fontSize:     14,
                  fontFamily:   "inherit",
                  borderRadius: 12,
                  outline:      "none",
                  transition:   "border-color 0.15s, box-shadow 0.15s",
                  background:   dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.85)",
                  border: `1.5px solid ${
                    touched.pwd && fieldErrors.pwd
                      ? dark ? "rgba(252,107,107,0.65)" : "#dc2626"
                      : dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.18)"
                  }`,
                  color: dark ? "rgba(255,255,255,0.88)" : "#1e1b4b",
                  boxShadow: touched.pwd && fieldErrors.pwd
                    ? `0 0 0 3px ${dark ? "rgba(252,107,107,0.15)" : "rgba(220,38,38,0.1)"}`
                    : "none"
                }}
                onFocus={e => {
                  if (!(touched.pwd && fieldErrors.pwd)) {
                    e.target.style.borderColor = dark ? "#a78bfa" : "#7c3aed";
                    e.target.style.boxShadow   = dark ? "0 0 0 3px rgba(167,139,250,0.2)" : "0 0 0 3px rgba(124,58,237,0.12)";
                  }
                }}
                onBlurCapture={e => {
                  if (!(touched.pwd && fieldErrors.pwd)) {
                    e.target.style.borderColor = dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.18)";
                    e.target.style.boxShadow = "none";
                  } else {
                    e.target.style.borderColor = dark ? "rgba(252,107,107,0.65)" : "#dc2626";
                    e.target.style.boxShadow = `0 0 0 3px ${dark ? "rgba(252,107,107,0.15)" : "rgba(220,38,38,0.1)"}`;
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position:   "absolute",
                  right:      12,
                  top:        "50%",
                  transform:  "translateY(-50%)",
                  background: "transparent",
                  border:     "none",
                  cursor:     "pointer",
                  color:      dark ? "rgba(255,255,255,0.65)" : "#a09bbf",
                  display:    "flex",
                  padding:    0,
                  fontFamily: "inherit",
                }}
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>

            {/* Password Metrics: Score Line Indicators */}
            {isSignup && pwd && (
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex:         1,
                    height:       3,
                    borderRadius: 99,
                    background:   getPasswordStrength(pwd).score >= i * 1.5
                      ? getPasswordStrength(pwd).color
                      : dark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                    transition:   "background 0.25s",
                  }} />
                ))}
              </div>
            )}

            {/* Field Requirement Checks Checklist */}
            {isSignup && (
              <div style={{
                marginTop:    10,
                padding:      "10px 12px",
                borderRadius: 10,
                background:   dark ? "rgba(255,255,255,0.03)" : "rgba(124,58,237,0.04)",
                border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.1)"}`,
              }}>
                {[
                  { label: "At least 8 characters",  met: pwd.length >= 8 },
                  { label: "One uppercase letter",   met: /[A-Z]/.test(pwd) },
                  { label: "One lowercase letter",   met: /[a-z]/.test(pwd) },
                  { label: "One number",             met: /[0-9]/.test(pwd) },
                ].map(req => (
                  <div key={req.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{
                      fontSize:   12,
                      color:      req.met ? (dark ? "#34d399" : "#059669") : (dark ? "rgba(255,255,255,0.3)" : "#a09bbf"),
                      transition: "color 0.2s",
                    }}>
                      {req.met ? "✓" : "○"}
                    </span>
                    <span style={{
                      fontSize:       11,
                      color:          req.met ? (dark ? "#34d399" : "#059669") : (dark ? "rgba(255,255,255,0.35)" : "#a09bbf"),
                      transition:     "color 0.2s",
                      textDecoration: req.met ? "line-through" : "none",
                    }}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message Layout for Password Input Field explicitly */}
            {touched.pwd && fieldErrors.pwd && (
              <div style={{
                display:      "flex",
                alignItems:   "flex-start",
                gap:          6,
                marginTop:    8,
                padding:      "8px 12px",
                borderRadius: 8,
                background:   dark ? "rgba(252,107,107,0.1)" : "rgba(220,38,38,0.06)",
                border: `1px solid ${dark ? "rgba(252,107,107,0.2)" : "rgba(220,38,38,0.15)"}`,
              }}>
                <span style={{ fontSize: 12, color: dark ? "#fc6b6b" : "#dc2626", fontWeight: 500, lineHeight: 1.5 }}>
                  {fieldErrors.pwd}
                </span>
              </div>
            )}
          </div>


          {/* Status Display Alert Block */}
          {authErr && !(isSignup && (fieldErrors.email || fieldErrors.uname)) && (
            <div style={{
              display:      "flex",
              alignItems:   "flex-start",
              gap:          8,
              margin:       "0 0 16px",
              padding:      "10px 14px",
              borderRadius: 10,
              background:   dark ? "rgba(252,107,107,0.1)" : "rgba(220,38,38,0.06)",
              border: `1px solid ${dark ? "rgba(252,107,107,0.25)" : "rgba(220,38,38,0.2)"}`,
            }}>
              <span style={{ fontSize: 13, color: dark ? "#fc6b6b" : "#dc2626", fontWeight: 500, lineHeight: 1.5 }}>
                {authErr}
              </span>
            </div>
          )}

          {/* Interactive Trigger Button Controls */}
          <button
            type="button"
            onClick={handleAuth}
            disabled={isSubmitting}
            style={{
              width:         "100%",
              padding:       "13px",
              fontSize:      14,
              fontWeight:    700,
              borderRadius:  14,
              border:        "none",
              cursor:        isSubmitting ? "not-allowed" : "pointer",
              fontFamily:    "inherit",
              letterSpacing: 0.3,
              opacity:       isSubmitting ? 0.8 : 1,
              background:    dark ? "linear-gradient(135deg,#7c3aed,#06b6d4)" : "linear-gradient(135deg,#7c3aed,#10b981)",
              color:         "#fff",
              boxShadow:     dark ? "0 6px 24px rgba(124,63,245,0.5)" : "0 6px 24px rgba(124,58,237,0.32)",
              transition:    "all 0.18s",
              display:       "flex",
              alignItems:    "center",
              justifyContent: "center",
              gap:           8,
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width:        16,
                  height:       16,
                  borderRadius: "50%",
                  border:       "2px solid rgba(255,255,255,0.3)",
                  borderTop:    "2px solid #fff",
                  animation:    "spin 0.7s linear infinite",
                  flexShrink:   0,
                }} />
                {isSignup ? "Creating..." : "Logging in..."}
              </>
            ) : (
              isSignup ? "Create Account →" : "Login →"
            )}
          </button>

          {/* Divider */}
<div style={{
  display:    "flex",
  alignItems: "center",
  gap:        10,
  margin:     "14px 0",
}}>
  <div style={{
    flex:       1,
    height:     1,
    background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  }} />
  <span style={{
    fontSize: 11,
    color:    dark ? "rgba(255,255,255,0.3)" : "#a09bbf",
  }}>
    or continue with
  </span>
  <div style={{
    flex:       1,
    height:     1,
    background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  }} />
</div>

{/* Google Sign In */}
<div style={{
  display:        "flex",
  justifyContent: "center",
}}>
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      try {
        await googleLogin(credentialResponse.credential);
        toast.success("Signed in with Google! 🎉");
      } catch {
        toast.error("Google sign-in failed");
      }
    }}
    onError={() => toast.error("Google sign-in failed")}
    theme={dark ? "filled_black" : "outline"}
    shape="rectangular"
    size="large"
    text={isSignup ? "signup_with" : "signin_with"}
    width="100%"
  />
</div>

          {/* Layout Redirection Bottom Anchors */}
          <p style={{ textAlign: "center", fontSize: 12, color: dark ? "rgba(255,255,255,0.5)" : "#3a3560", margin: "14px 0 0" }}>
            {isSignup ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setAuthErr("");
                setFieldErrors({});
                setTouched({});
              }}
              style={{
                background: "transparent",
                border:     "none",
                color:      dark ? "#a78bfa" : "#7c3aed",
                fontSize:   12,
                fontWeight: 700,
                cursor:     "pointer",
                padding:    0,
                fontFamily: "inherit",
              }}
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}