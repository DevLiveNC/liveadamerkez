import { barRects } from "./geometry.js";
import { cx } from "../cx.js";

export function BarChart({
  values,
  labels,
  caption,
  sampleLabel,
  width = 240,
  height = 88,
  className,
}: {
  values: readonly number[];
  labels?: readonly string[];
  caption?: string;
  sampleLabel?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const bars = barRects(values, width, height - 16);
  const colors = ["var(--am-ui-chart)", "var(--am-ui-chart-alt)", "var(--am-ui-chart-accent)"];
  return (
    <figure className={cx("am-ui-chart", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role={caption ? "img" : "presentation"}
        aria-label={caption}
        aria-hidden={caption ? undefined : true}
      >
        {bars.map((bar, index) => (
          <rect
            key={index}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={4}
            fill={colors[index % colors.length]}
          />
        ))}
      </svg>
      {caption ? (
        <figcaption>
          {caption}
          {sampleLabel ? ` · ${sampleLabel}` : null}
        </figcaption>
      ) : null}
      {labels && labels.length > 0 ? (
        <span className="visually-hidden">
          {labels.map((label, index) => `${label}: ${values.at(index) ?? 0}`).join(", ")}
        </span>
      ) : null}
    </figure>
  );
}
