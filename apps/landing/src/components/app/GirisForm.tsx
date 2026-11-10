"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { safeAppPath, type SessionRole } from "@ada-merkez/shared";
import { apiBase } from "../../lib/api";

const ROLES: { id: SessionRole; label: string }[] = [
  { id: "customer", label: app.customer },
  { id: "business", label: app.business },
  { id: "admin", label: app.admin },
];

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
  const [mode, setMode] = useState<"login" | "register">(
    defaultRole === "admin" ? "login" : registerDefault ? "register" : "login",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = useMemo(() => safeAppPath(nextPath), [nextPath]);

  const canRegister = role !== "admin";
  const isRegister = canRegister && mode === "register";

  async function sendCode() {
    setError(null);
    if (phone.trim().length < 10) {
      setError(app.invalidPhone);
      return;
    }
    if (isRegister && name.trim().length < 2) {
      setError(app.invalidName);
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
      const body = (await res.json().catch(() => null)) as { ok?: boolean; debugCode?: string; message?: string } | null;
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
    if (code.trim().length < 4) {
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
          name: isRegister ? name.trim() : undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !body?.ok) {
        setError(body?.message ?? app.invalidCode);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError(app.authUnavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="am-auth"
      onSubmit={(event) => {
        event.preventDefault();
        if (sent) void verify();
        else void sendCode();
      }}
    >
      <div className="am-seg" role="tablist" aria-label={app.roleTabs}>
        {ROLES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={role === item.id}
            onClick={() => {
              setRole(item.id);
              if (item.id === "admin") setMode("login");
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {canRegister ? (
        <div className="am-seg" role="group" aria-label={app.signIn} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")}>
            {app.signIn}
          </button>
          <button type="button" aria-pressed={mode === "register"} onClick={() => setMode("register")}>
            {app.signUp}
          </button>
        </div>
      ) : (
        <p className="am-note">{app.adminNoRegister}</p>
      )}

      <p className="am-note">{app.guestHint}</p>

      {isRegister ? (
        <div className="am-field">
          <label htmlFor="ad">{app.name}</label>
          <input
            id="ad"
            name="ad"
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
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder={app.phonePlaceholder}
        />
      </div>

      {sent ? (
        <div className="am-field">
          <label htmlFor="kod">{app.code}</label>
          <input
            id="kod"
            name="kod"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <p className="am-note">{app.codeSent}</p>
          {debugCode ? (
            <p className="am-note">
              {app.codeDev} {debugCode}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="am-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn btn-coral" type="submit" disabled={busy} aria-busy={busy}>
        {busy ? (sent ? app.verifying : app.sendingCode) : sent ? app.verify : app.sendCode}
      </button>
    </form>
  );
}

