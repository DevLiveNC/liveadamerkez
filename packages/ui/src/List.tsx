import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type ListProps = HTMLAttributes<HTMLUListElement> & {
  children: ReactNode;
};

export function List({ className, children, ...rest }: ListProps) {
  return (
    <ul className={cx(className)} {...rest}>
      {children}
    </ul>
  );
}

export type ListItemProps = LiHTMLAttributes<HTMLLIElement> & {
  href?: string;
  onClick?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
};

export function ListItem({
  href,
  onClick,
  leading,
  trailing,
  title,
  subtitle,
  className,
  ...rest
}: ListItemProps) {
  const inner = (
    <>
      {leading}
      <span className="am-row-body">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </span>
      {trailing}
    </>
  );

  return (
    <li className={cx(className)} {...rest}>
      {href ? (
        <a className="am-row" href={href}>
          {inner}
        </a>
      ) : onClick ? (
        <button type="button" className="am-row" onClick={onClick}>
          {inner}
        </button>
      ) : (
        <div className="am-row">{inner}</div>
      )}
    </li>
  );
}
