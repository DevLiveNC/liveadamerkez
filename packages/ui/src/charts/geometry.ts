export function chartMax(values: readonly number[]): number {
  const max = Math.max(0, ...values);
  return max === 0 ? 1 : max;
}

export function barRects(
  values: readonly number[],
  width: number,
  height: number,
  gap = 6,
): { x: number; y: number; width: number; height: number }[] {
  if (values.length === 0 || width <= 0 || height <= 0) return [];
  const max = chartMax(values);
  const barWidth = Math.max(1, (width - gap * (values.length - 1)) / values.length);
  return values.map((value, index) => {
    const barHeight = Math.max(0, (Math.max(0, value) / max) * height);
    return {
      x: index * (barWidth + gap),
      y: height - barHeight,
      width: barWidth,
      height: barHeight,
    };
  });
}

export function polylinePoints(
  values: readonly number[],
  width: number,
  height: number,
  pad = 2,
): string {
  if (values.length === 0 || width <= 0 || height <= 0) return "";
  const max = chartMax(values);
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);
  const step = values.length === 1 ? 0 : innerW / (values.length - 1);
  return values
    .map((value, index) => {
      const x = pad + index * step;
      const y = pad + innerH - (Math.max(0, value) / max) * innerH;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function areaPath(
  values: readonly number[],
  width: number,
  height: number,
  pad = 2,
): string {
  const points = polylinePoints(values, width, height, pad);
  if (!points) return "";
  return `M ${pad} ${height - pad} L ${points} L ${width - pad} ${height - pad} Z`;
}
