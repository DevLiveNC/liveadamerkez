import { panel } from "@ada-merkez/copy";

const WEEK_LABELS = Object.values(panel.weekdaysShort);

export function WeekChart({
  values,
  label,
}: {
  values: number[];
  label: string;
}) {
  const maxBar = Math.max(...values, 1);
  return (
    <svg
      className="am-chart"
      viewBox="0 0 420 200"
      role="img"
      aria-label={label}
    >
      {values.map((value, index) => {
        const height = (value / maxBar) * 126;
        const x = 24 + index * 56;
        const y = 160 - height;
        const fill = index === values.length - 1 ? "#0F2C44" : "#0E7C78";
        const day = WEEK_LABELS[index] ?? "";
        return (
          <g key={day}>
            <rect x={x} y={y} width={40} height={height} rx={6} fill={fill} />
            <text
              x={x + 20}
              y={y - 6}
              textAnchor="middle"
              fontSize="11"
              fill="#0A4F4D"
              fontFamily="Inter"
            >
              {value}
            </text>
            <text
              x={x + 20}
              y={180}
              textAnchor="middle"
              fontSize="11"
              fill="#6E5E4E"
              fontFamily="Inter"
            >
              {day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
