import type { ComponentType, ReactNode } from "react";

/** Gezinme bağlantısını dışarıdan verilebilir kılar.
 *  packages/ui Next'e bağımlı değil: uygulama kendi `Link` bileşenini geçer,
 *  geçilmezse düz `<a>` kullanılır. */
export type LinkLikeProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page";
  "aria-pressed"?: boolean;
  "aria-disabled"?: boolean;
  tabIndex?: number;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export type LinkRender = ComponentType<LinkLikeProps>;

export function linkTag(link?: LinkRender) {
  return (link ?? "a") as ComponentType<LinkLikeProps>;
}
