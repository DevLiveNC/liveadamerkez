import { site } from "@ada-merkez/copy";

/** Tek yer tutucu wordmark: /brand/logo.svg — kesin değil. */
export const LOGO_SRC = "/brand/logo.svg";
export const ICON_SRC = "/brand/icon.svg";

type Props = {
  className?: string;
  height?: number;
  inverted?: boolean;
  decorative?: boolean;
};

export function Logo({ className = "brand-logo", height = 32, inverted = false, decorative = false }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={LOGO_SRC}
      alt={decorative ? "" : site.name}
      height={height}
      width={Math.round(height * 2.95)}
      style={inverted ? { filter: "brightness(0) invert(1)", height, width: "auto" } : { height, width: "auto" }}
    />
  );
}
