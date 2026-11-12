import type { FormEvent, ReactNode } from "react";
import { cx } from "../cx.js";
import { UiIcon } from "../icons.js";

/** Arama kapsülü. `role="search"` ve `type="search"` korunur:
 *  ekran okuyucu ve testler arama kutusunu bununla bulur. */
export function SearchInput({
  action,
  name = "q",
  defaultValue = "",
  placeholder,
  ariaLabel,
  hidden,
  action2,
  className,
  onSubmit,
}: {
  action: string;
  name?: string;
  defaultValue?: string;
  placeholder: string;
  ariaLabel: string;
  hidden?: Record<string, string>;
  action2?: ReactNode;
  className?: string;
  /** İstemci tarafı arama (tam sayfa yenilemesi yerine SPA geçişi). */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form action={action} role="search" className={cx("am-search", "atla-search", className)} onSubmit={onSubmit}>
      <UiIcon name="search" className="am-icon atla-search__icon" />
      <input
        className="am-search-input atla-search__input"
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {hidden
        ? Object.entries(hidden).map(([key, value]) =>
            value ? <input key={key} type="hidden" name={key} value={value} /> : null,
          )
        : null}
      {action2}
    </form>
  );
}
