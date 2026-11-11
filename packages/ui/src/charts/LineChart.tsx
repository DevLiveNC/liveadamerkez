import { areaPath, polylinePoints } from "./geometry.js";
import { cx } from "../cx.js";

export function LineChart({
  values,
  caption,
  sampleLabel,
  width = 240,
  height = 88,
  className,
}: {
  values: readonly number[];
  caption?: string;
  sampleLabel?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const points = polylinePoints(values, width, height);
  const area = areaPath(values, width, height);
  return (
    <figure className={cx("am-ui-chart", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role={caption ? "img" : "presentation"}
        aria-label={caption}
        aria-hidden={caption ? undefined : true}
      >
        {area ? <path d={area} fill="var(--am-ui-chart-alt)" opacity="0.2" /> : null}
        {points ? (
          <polyline
            points={points}
            fill="none"
            stroke="var(--am-ui-chart)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
      {caption ? (
        <figcaption>
          {caption}
          {sampleLabel ? ` · ${sampleLabel}` : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
