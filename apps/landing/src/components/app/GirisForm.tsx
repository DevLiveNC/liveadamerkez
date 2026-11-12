"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { app, hero, kabuki } from "@ada-merkez/copy";
import {
  authPageUrl,
  OTP_POLICY,
  readNextParam,
  safeAppPath,
  toE164,
  type AuthMode,
  type SessionRole,
} from "@ada-merkez/shared";
import { Logo } from "../Logo";
import { BackButton } from "./BackButton";
import { apiBase } from "../../lib/api";

const ROLES: { id: SessionRole; label: string }[] = [
  { id: "customer", label: app.customer },
  { id: "business", label: app.business },
  { id: "admin", label: app.admin },
];

function balloonFor(role: SessionRole): string {
  if (role === "business") return app.businessBalloon;
  if (role === "admin") return app.adminBalloon;
  return kabuki.hero;
}

function subFor(role: SessionRole): string {
  if (role === "business") return app.businessAuthSub;
  if (role === "admin") return app.adminAuthSub;
  return app.authSub;
}

function syncQuery(role: SessionRole, mode: AuthMode, nextPath: string) {
  if (typeof window === "undefined") return;
  const next =
    readNextParam(new URLSearchParams(window.location.search), nextPath) || nextPath;
  window.history.replaceState(null, "", authPageUrl({ role, mode, next }));
}

export function GirisForm({
  defaultRole,
  registerDefault,
  nextPath,
}: {
  defaultRole: SessionRole;
  registerDefault: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<SessionRole>(defaultRole);
  const [mode, setMode] = useState<AuthMode>(registerDefault ? "register" : "login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminInvite = role === "admin" && mode === "register";
  const isRegister = role !== "admin" && mode === "register";
  const invalid = Boolean(error);

  useEffect(() => {
    void document.fonts?.ready.then(() => {
      const ok =
        document.fonts.check('700 22px "Plus Jakarta Sans"') &&
        document.fonts.check("400 16px Inter");
      document.documentElement.dataset.fonts = ok ? "ready" : "missing";
    });
  }, []);

  useEffect(() => {
    const root = document.querySelector(".am-auth--page");
    if (!(root instanceof HTMLElement)) return;
    const viewport = window.visualViewport;
    const sync = () => {
      const layoutH = window.innerHeight;
      const visH = viewport?.height ?? layoutH;
      const offset = viewport?.offsetTop ?? 0;
      const inset = Math.max(0, Math.round(layoutH - visH - offset));
      root.style.setProperty("--am-keyboard-inset", `${inset}px`);
    };
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    sync();
    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      root.style.removeProperty("--am-keyboard-inset");
    };
  }, []);

  function selectRole(nextRole: SessionRole) {
    setRole(nextRole);
    setError(null);
    setSent(false);
    setCode("");
    syncQuery(nextRole, mode, nextPath);
  }

  function selectMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setSent(false);
    setCode("");
    syncQuery(role, nextMode, nextPath);
  }

  async function sendCode() {
    setError(null);
    if (!toE164(phone)) {
      setError(app.invalidPhone);
      return;
    }
    const base = apiBase();
    if (!base) {
      setError(app.authUnavailable);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${base}/v1/otp/request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), purpose: "login" }),
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        debugCode?: string;
        message?: string;
      } | null;
      if (!res.ok || !body?.ok) {
        setError(body?.message ?? app.authUnavailable);
        return;
      }
      setSent(true);
      setDebugCode(typeof body.debugCode === "string" ? body.debugCode : null);
    } catch {
      setError(app.authUnavailable);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    if (code.trim().length !== OTP_POLICY.codeLength) {
      setError(app.invalidCode);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/app/api/oturum", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
          role,
          mode: isRegister ? "register" : "login",
          name: isRegister && name.trim().length >= 2 ? name.trim() : undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        code?: string;
      } | null;
      if (!res.ok || !body?.ok) {
        if (body?.code === "ACCOUNT_NOT_FOUND") {
          setError(body.message ?? app.invalidCode);
        } else if (res.status === 401 || body?.code === "INVALID") {
          setError(app.codeMismatch);
        } else {
          setError(body?.message ?? app.codeMismatch);
        }
        return;
      }
      const next =
        typeof window === "undefined"
          ? safeAppPath(nextPath)
          : readNextParam(new URLSearchParams(window.location.search), nextPath);
      router.replace(next);
      router.refresh();
    } catch {
      setError(app.authUnavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="am-auth am-auth--page">
      <aside className="am-auth-aside">
        <Logo className="wordmark" height={36} />
        <p className="am-kicker">{hero.kicker}</p>
        <h1>{app.authTitle}</h1>
        <p className="lede">{app.authLead}</p>
        <div className="am-greet">
          <div className="am-greet-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/maskot/kabuki-selam-512.webp"
              width={280}
              height={280}
              alt={kabuki.alt}
            />
          </div>
          <div className="am-balloon">
            <p>{balloonFor(role)}</p>
          </div>
        </div>
      </aside>
      <div className="am-auth-card">
        <form
          className="am-auth-panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (adminInvite) return;
            if (sent) void verify();
            else void sendCode();
          }}
        >
          <BackButton fallback="/app" label={app.back} className="am-auth-back" />

          <div className="am-seg" role="tablist" aria-label={app.roleTabs}>
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={role === item.id ? "is-on" : undefined}
                aria-selected={role === item.id}
                onClick={() => selectRole(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="am-seg" role="group" aria-label={app.signIn}>
            <button
              type="button"
              className={mode === "login" ? "is-on" : undefined}
              aria-pressed={mode === "login"}
              onClick={() => selectMode("login")}
            >
              {app.signIn}
            </button>
            <button
              type="button"
              className={mode === "register" ? "is-on" : undefined}
              aria-pressed={mode === "register"}
              onClick={() => selectMode("register")}
            >
              {app.signUp}
            </button>
          </div>

          <div className="am-auth-body">
            <h2>{mode === "register" ? app.signUp : app.signIn}</h2>
            <p className="sub">{adminInvite ? app.adminNoRegister : subFor(role)}</p>

            {adminInvite ? null : (
              <>
                {error ? (
                  <p className="am-error" role="alert">
                    {error}
                  </p>
                ) : null}

                {isRegister ? (
                  <div className="am-field">
                    <label htmlFor="ad">{app.nameOptional}</label>
                    <input
                      id="ad"
                      name="ad"
                      className="am-input"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={app.namePlaceholder}
                    />
                  </div>
                ) : null}

                <div className="am-field">
                  <label htmlFor="telefon">{app.phone}</label>
                  <input
                    id="telefon"
                    name="telefon"
                    className="am-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    aria-invalid={invalid || undefined}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={app.phonePlaceholder}
                  />
                  <p className="am-subtle">{app.phoneHint}</p>
                </div>

                {sent ? (
                  <div className="am-field">
                    <label htmlFor="kod">{app.code}</label>
                    <input
                      id="kod"
                      name="kod"
                      className="am-input"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={OTP_POLICY.codeLength}
                      pattern="\d{6}"
                      value={code}
                      aria-invalid={invalid || undefined}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, OTP_POLICY.codeLength))}
                    />
                    <p className="am-subtle">{app.codeSent}</p>
                    {debugCode ? (
                      <p className="am-subtle">
                        {app.codeDev} {debugCode}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {adminInvite ? (
            <div className="am-auth-actions">
              <button
                className="am-btn am-btn--ghost am-btn--block"
                type="button"
                onClick={() => selectMode("login")}
              >
                {app.backToSignIn}
              </button>
            </div>
          ) : (
            <div className="am-auth-actions">
              <button
                className="am-btn am-btn--accent am-btn--block"
                type="submit"
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? <span className="am-spinner" aria-hidden="true" /> : null}
                {busy ? (sent ? app.verifying : app.sendingCode) : sent ? app.verify : app.sendCode}
              </button>
              <p className="am-subtle">{app.guestHint}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
