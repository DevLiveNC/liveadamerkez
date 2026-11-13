"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { panel, ui, yonetimApp } from "@ada-merkez/copy";
import { BottomSheet } from "@ada-merkez/ui";
import { useOnline, usePanelMutation } from "./use-panel-data";

export function PanelIntro({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="pn-intro">
      <div>
        {eyebrow ? <p className="pn-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {children ? <p className="pn-lead">{children}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PanelLoading({ label = panel.loading }: { label?: string }) {
  return (
    <div className="pn-loading" role="status" aria-label={label}>
      <div className="pn-skeleton pn-skeleton--title" />
      <div className="pn-kpis">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="pn-skeleton pn-skeleton--kpi" />
        ))}
      </div>
      <div className="pn-skeleton pn-skeleton--body" />
    </div>
  );
}

export function PanelError({
  message,
  retry,
  compact = false,
}: {
  message: string;
  retry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "pn-error pn-error--compact" : "pn-error"}
      role="alert"
    >
      <strong>{panel.errorTitle}</strong>
      <p>{message || panel.errorBody}</p>
      {message === panel.sessionError ? (
        <Link className="am-btn am-btn--ghost" href="/app/giris">
          {panel.sessionError}
        </Link>
      ) : retry ? (
        <button type="button" className="am-btn am-btn--ghost" onClick={retry}>
          {panel.retry}
        </button>
      ) : null}
    </div>
  );
}

export function PanelEmpty({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="pn-empty">
      <span className="pn-empty-mark" aria-hidden="true">
        —
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {href ? (
        <Link className="am-btn am-btn--ghost" href={href}>
          {action ?? panel.viewAll}
        </Link>
      ) : null}
    </div>
  );
}

export function PanelFeedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  return (
    <>
      {error ? (
        <p className="pn-inline-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="pn-inline-success" role="status">
          {success}
        </p>
      ) : null}
    </>
  );
}

export function SearchField({
  value,
  onChange,
  label = panel.search,
  placeholder = panel.searchHint,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="pn-search">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  label = panel.status,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly (readonly [T, string])[];
  label?: string;
}) {
  return (
    <div className="pn-chips" role="group" aria-label={label}>
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          className={`am-chip${value === id ? " am-chip--on" : ""}`}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="pn-pagination">
      <span>
        {total} {panel.records} · {panel.page} {page + 1}/{pages}
      </span>
      <div>
        <button
          type="button"
          className="am-btn am-btn--ghost am-btn--sm"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          {panel.previous}
        </button>
        <button
          type="button"
          className="am-btn am-btn--ghost am-btn--sm"
          disabled={page + 1 >= pages}
          onClick={() => onChange(page + 1)}
        >
          {panel.next}
        </button>
      </div>
    </div>
  );
}

/** Yıkıcı veya müşteriye dokunan her işlem görünür bir ikinci adım ister. */
export function ConfirmAction({
  label,
  title,
  body,
  confirmLabel,
  action,
  message,
  onDone,
  className = "am-btn am-btn--ghost am-btn--sm",
  disabled = false,
}: {
  label: string;
  title: string;
  body: string;
  confirmLabel?: string;
  action: () => Promise<void>;
  message: string;
  onDone?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const mutation = usePanelMutation();
  const online = useOnline();
  const id = useId();
  const close = () => {
    if (!mutation.busy) setOpen(false);
  };
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled || mutation.busy || !online}
        title={!online ? panel.offlineAction : undefined}
        onClick={() => {
          mutation.setError(null);
          setOpen(true);
        }}
      >
        {mutation.busy ? panel.sending : label}
      </button>
      <BottomSheet
        open={open}
        onClose={close}
        title={title}
        titleId={id}
        closeLabel={panel.close}
        className="pn-confirm-sheet"
      >
        <p className="pn-lead">{body}</p>
        <PanelFeedback error={mutation.error} />
        <div className="pn-confirm-actions">
          <button
            type="button"
            className="am-btn am-btn--ghost"
            disabled={mutation.busy}
            onClick={close}
          >
            {panel.cancel}
          </button>
          <button
            type="button"
            className="am-btn am-btn--primary"
            disabled={mutation.busy || !online}
            onClick={() => {
              void mutation.run(action, message).then((ok) => {
                if (ok) {
                  setOpen(false);
                  onDone?.();
                }
              });
            }}
          >
            {mutation.busy ? panel.sending : (confirmLabel ?? label)}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: panel.pending,
    received: panel.pending,
    review: panel.review,
    confirmed: panel.confirmed,
    approved: panel.confirmed,
    cancelled: panel.cancelledStatus,
    rejected: yonetimApp.statusRejected,
    no_show: panel.noShow,
    active: panel.active,
    inactive: panel.inactive,
  };
  const tone = ["confirmed", "approved", "active"].includes(status)
    ? "confirmed"
    : ["cancelled", "rejected", "no_show", "inactive"].includes(status)
      ? "cancelled"
      : "pending";
  return (
    <span className={`am-badge am-badge--${tone}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function DataToolbar({
  children,
  updated,
  refreshing,
}: {
  children?: ReactNode;
  updated?: Date | null;
  refreshing?: boolean;
}) {
  return (
    <div className="pn-data-toolbar">
      {children}
      <span role="status">
        {refreshing
          ? panel.refreshing
          : updated
            ? `${panel.updated}: ${updated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Nicosia" })}`
            : ui.loading}
      </span>
    </div>
  );
}
