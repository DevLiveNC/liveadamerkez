import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cx } from "../cx.js";

function describedBy(id: string, hint?: ReactNode, error?: ReactNode) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/** Etiket + ipucu + hata metnini tek yerde toplar; alan kimliği
 *  verilmezse üretilir ve `aria-describedby` bağlanır. */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
  className?: string;
}) {
  const generated = useId();
  const fieldId = id ?? `alan-${generated}`;
  return (
    <div className={cx("atla-field", className)}>
      <label className="atla-field__label" htmlFor={fieldId}>
        {label}
      </label>
      {children({ id: fieldId, describedBy: describedBy(fieldId, hint, error) })}
      {hint ? (
        <p className="atla-field__hint" id={`${fieldId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="atla-field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  describedBy,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { describedBy?: string }) {
  return (
    <input
      id={id}
      className={cx("atla-field__input", className)}
      aria-describedby={describedBy}
      {...rest}
    />
  );
}

export function SelectField({
  id,
  describedBy,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { describedBy?: string }) {
  return (
    <select
      id={id}
      className={cx("atla-field__input", className)}
      aria-describedby={describedBy}
      {...rest}
    >
      {children}
    </select>
  );
}
