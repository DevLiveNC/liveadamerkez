import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "section" | "div";
  interactive?: boolean;
  pad?: "md" | "lg";
  children: ReactNode;
};

export function Card({
  as: Tag = "article",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag className={cx("am-card-block", interactive && "am-biz", className)} {...rest}>
      {children}
    </Tag>
  );
}
