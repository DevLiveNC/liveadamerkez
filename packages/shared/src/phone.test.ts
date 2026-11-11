import { describe, expect, it } from "vitest";
import { maskPhone, toE164 } from "./phone.js";

describe("E.164", () => {
  it("normalizes TR/Kuzey Kıbrıs numbers", () => {
    expect(toE164("0533 111 22 33")).toBe("+905331112233");
    expect(toE164("+90 548 888 23 66")).toBe("+905488882366");
    expect(toE164("905331112233")).toBe("+905331112233");
    expect(toE164("12")).toBeNull();
  });
});

describe("maskPhone", () => {
  it("gizler, tam numarayı bırakmaz", () => {
    expect(maskPhone("+905331112233")).toBe("+9•••33");
    expect(maskPhone("+905331112233")).not.toContain("53311122");
    expect(maskPhone("12")).toBe("••••");
  });
});
