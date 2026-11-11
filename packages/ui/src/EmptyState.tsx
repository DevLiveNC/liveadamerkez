import type { ReactNode } from "react";
import { cx } from "./cx.js";

export type EmptyStateProps = {
  title: string;
  body?: string;
  media?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, body, media, action, className }: EmptyStateProps) {
  return (
    <div className={cx("am-empty", className)} role="status">
      {media}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}
