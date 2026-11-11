import { describe, expect, it } from "vitest";
import { areaPath, barRects, chartMax, polylinePoints } from "./geometry.js";

describe("chart geometry", () => {
  it("avoids divide-by-zero when all values are zero", () => {
    expect(chartMax([])).toBe(1);
    expect(chartMax([0, 0])).toBe(1);
    const bars = barRects([0, 0], 100, 40);
    expect(bars).toHaveLength(2);
    expect(bars.every((bar) => bar.height === 0)).toBe(true);
  });

  it("lays out bars inside the viewBox", () => {
    const bars = barRects([1, 2, 4], 100, 50, 4);
    expect(bars).toHaveLength(3);
    expect(bars[2]?.height).toBe(50);
    expect(bars[0]?.height).toBe(12.5);
    expect(bars.every((bar) => bar.x >= 0 && bar.x + bar.width <= 100.01)).toBe(true);
  });

  it("builds a polyline and area for a sparkline", () => {
    const points = polylinePoints([1, 3, 2], 90, 30);
    expect(points.split(" ")).toHaveLength(3);
    expect(points).not.toMatch(/NaN/);
    const area = areaPath([1, 3, 2], 90, 30);
    expect(area.startsWith("M ")).toBe(true);
    expect(area.endsWith(" Z")).toBe(true);
  });

  it("returns empty geometry for empty input", () => {
    expect(barRects([], 100, 40)).toEqual([]);
    expect(polylinePoints([], 90, 30)).toBe("");
    expect(areaPath([], 90, 30)).toBe("");
  });
});
