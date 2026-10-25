"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";

function EyeIcon({ visible }: { visible: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {visible && <path d="m3 3 18 18" />}
  </svg>;
}

export function AdminLogin() {
  const { data, hydrated, login, status } = usePortfolio();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const message = error || status;

  return <main className="admin-login">
    <div className="login-frame">
      <section className="login-visual" aria-label="Portfolio welcome">
        <Link className="login-brand" href="/" aria-label={`${data.profile.name} portfolio`}>
          <span className="login-brand-mark" aria-hidden="true">KH<span>R</span></span>
          <span>Portfolio<small>{data.profile.name}</small></span>
        </Link>
        <div className="login-welcome">
          <span className="login-kicker">YOUR STORY. YOUR SPACE.</span>
          <h2>Great work.<br /><span>Clearly presented.</span></h2>
          <p>Keep your experience, projects and professional story up to date. All in one place.</p>
        </div>
        <div className="login-art" aria-hidden="true">
          <div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" />
          <div className="login-art-card"><span className="login-art-line" /><span className="login-art-line short" /><div className="login-art-tiles"><i /><i /><i /></div></div>
          <span className="login-art-dot dot-one" /><span className="login-art-dot dot-two" />
        </div>
        <div className="login-visual-footer"><span aria-hidden="true" />A thoughtful space for your professional journey.</div>
      </section>

      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-mobile-brand">Portfolio <span>/ {data.profile.name}</span></div>
        <div className="login-form-card">
          <div className="login-access-badge"><span aria-hidden="true">↗</span> YOUR WORKSPACE</div>
          <h1 id="login-title">Welcome back.</h1>
          <p className="login-intro">Sign in to manage your portfolio<br className="login-desktop-break" /> and publish what’s next.</p>
          <form className="login-form" noValidate aria-busy={submitting} onSubmit={async event => {
            event.preventDefault();
            if (submitting || !hydrated) return;
            if (!password) { setError("Enter your admin password."); input.current?.focus(); return; }
            setSubmitting(true); setError("");
            try { await login(password); setPassword(""); }
            catch (failure) { setError(failure instanceof Error ? failure.message : "Sign-in failed. Please try again."); input.current?.focus(); }
            finally { setSubmitting(false); }
          }}>
            <label htmlFor="admin-password">Admin password</label>
            <div className={`login-password${message ? " has-error" : ""}`}>
              <input ref={input} id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" spellCheck={false} required aria-invalid={Boolean(message)} aria-describedby="login-password-message" value={password} onChange={event => { setPassword(event.target.value); if (error) setError(""); }} />
              <button className="login-visibility" type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls="admin-password" onClick={() => setVisible(current => !current)}><EyeIcon visible={visible} /></button>
            </div>
            <div className="login-message-space"><p id="login-password-message" className={message ? "login-error" : "login-hint"} aria-live="polite">{message || "Use your admin password to access your workspace."}</p></div>
            <button className="login-submit" type="submit" disabled={submitting || !hydrated}>
              {submitting ? <><span className="login-spinner" aria-hidden="true" />Signing in…</> : <><span>{hydrated ? "Sign in" : "Preparing workspace…"}</span><span aria-hidden="true">→</span></>}
            </button>
          </form>
          <div className="login-return"><Link href="/"><span aria-hidden="true">←</span> Back to portfolio</Link><span className="login-return-note">Make your next update count.</span></div>
        </div>
        <p className="login-form-footer">{data.profile.name}<span>Professional portfolio</span></p>
      </section>
    </div>
  </main>;
}
