import { describe, expect, it } from "vitest";
import {
  TEST_LOGIN_DEFAULT_PHONE,
  formatPhoneForDisplay,
  isTestLoginEnabled,
  isTestLoginPhone,
  testLoginPhone,
  testLoginPhones,
} from "./test-login.js";

describe("kodsuz test girişi", () => {
  it("varsayılan numara +90 539 118 02 04", () => {
    expect(TEST_LOGIN_DEFAULT_PHONE).toBe("+905391180204");
    expect(testLoginPhones()).toEqual(["+905391180204"]);
  });

  it("bayrak yoksa açık, off/false/0 değerlerinde kapalı", () => {
    expect(isTestLoginEnabled(undefined)).toBe(true);
    expect(isTestLoginEnabled("")).toBe(true);
    expect(isTestLoginEnabled("on")).toBe(true);
    expect(isTestLoginEnabled("off")).toBe(false);
    expect(isTestLoginEnabled(" FALSE ")).toBe(false);
    expect(isTestLoginEnabled("0")).toBe(false);
  });

  it("numarayı farklı yazımlarla tanır", () => {
    expect(isTestLoginPhone("0539 118 02 04")).toBe(true);
    expect(isTestLoginPhone("+90 539 118 02 04")).toBe(true);
    expect(isTestLoginPhone("905391180204")).toBe(true);
    expect(isTestLoginPhone("0539 118 02 05")).toBe(false);
    expect(isTestLoginPhone("")).toBe(false);
    expect(isTestLoginPhone(null)).toBe(false);
  });

  it("kapalıyken hiçbir numara eşleşmez", () => {
    expect(isTestLoginPhone("+905391180204", { enabledFlag: "off" })).toBe(false);
    expect(testLoginPhone({ enabledFlag: "off" })).toBeNull();
  });

  it("liste ortam değişkeninden okunur, geçersizler atılır", () => {
    expect(testLoginPhones("+90 539 118 02 04; 0555 111 22 33")).toEqual([
      "+905391180204",
      "+905551112233",
    ]);
    expect(testLoginPhones("123,abc")).toEqual([TEST_LOGIN_DEFAULT_PHONE]);
    expect(isTestLoginPhone("+905551112233", { phones: "0555 111 22 33" })).toBe(true);
    expect(isTestLoginPhone("+905391180204", { phones: "0555 111 22 33" })).toBe(false);
  });

  it("görünen biçim okunur", () => {
    expect(formatPhoneForDisplay("+905391180204")).toBe("+90 539 118 02 04");
    expect(formatPhoneForDisplay("bozuk")).toBe("bozuk");
  });
});
