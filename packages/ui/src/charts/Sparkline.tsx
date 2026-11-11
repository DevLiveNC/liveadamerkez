import { polylinePoints } from "./geometry.js";
import { cx } from "../cx.js";

export function Sparkline({
  values,
  caption,
  width = 96,
  height = 28,
  className,
}: {
  values: readonly number[];
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const points = polylinePoints(values, width, height, 1);
  return (
    <svg
      className={cx("am-ui-chart", className)}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role={caption ? "img" : "presentation"}
      aria-label={caption}
      aria-hidden={caption ? undefined : true}
    >
      {points ? (
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}
