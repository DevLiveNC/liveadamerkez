import { site } from "@ada-merkez/copy";

export const LOGO_SRC = "/brand/logo.svg";
export const LOGO_KOYU_SRC = "/brand/logo-koyu.svg";
export const ICON_SRC = "/brand/icon.svg";

type Props = {
  className?: string;
  height?: number;
  inverted?: boolean;
  decorative?: boolean;
};

export function Logo({ className = "logo-h", height = 32, inverted = false, decorative = false }: Props) {
  const src = inverted ? LOGO_KOYU_SRC : LOGO_SRC;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt={decorative ? "" : site.name}
      height={height}
      width={Math.round(height * 6.2)}
      style={{ height, width: "auto" }}
    />
  );
}
