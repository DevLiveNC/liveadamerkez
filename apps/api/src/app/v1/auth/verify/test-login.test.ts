import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  verifyOtp: vi.fn(), provisionTestAccount: vi.fn(),
}));
vi.mock("@ada-merkez/db", () => ({
  ...mocks, isDatabaseConfigured: () => true,
  createAccount: vi.fn(), findAccountByPhoneRole: vi.fn(),
}));
vi.mock("@ada-merkez/shared/node", () => ({
  isAuthConfigured: () => true, signSession: () => "signed-session",
}));
import { POST } from "./route";
function request(phone: string, role: string, mode = "login") {
  return new Request("https://api.test/v1/auth/verify", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, role, mode }),
  });
}
describe("test phone authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AUTH_TEST_LOGIN", "on");
    vi.stubEnv("AUTH_TEST_PHONES", "");
    mocks.provisionTestAccount.mockImplementation(async (phone, role) => ({ id: "test", phone, role, tenantId: "tenant" }));
  });
  for (const role of ["customer", "business", "admin"]) {
    for (const mode of ["login", "register"]) {
      it(`${role} ${mode} skips OTP`, async () => {
        const response = await POST(request("+90 539 118 02 04", role, mode));
        expect(response.status).toBe(200);
        expect(mocks.provisionTestAccount).toHaveBeenCalledWith("+905391180204", role);
        expect(mocks.verifyOtp).not.toHaveBeenCalled();
      });
    }
  }
  it("rejects other phones without a code", async () => {
    expect((await POST(request("+905391180205", "customer"))).status).toBe(400);
    expect(mocks.provisionTestAccount).not.toHaveBeenCalled();
  });
  it("keeps normal admin registration forbidden", async () => {
    expect((await POST(request("+905391180205", "admin", "register"))).status).toBe(403);
  });
  it("can disable bypass", async () => {
    vi.stubEnv("AUTH_TEST_LOGIN", "off");
    expect((await POST(request("+905391180204", "customer"))).status).toBe(400);
    expect(mocks.provisionTestAccount).not.toHaveBeenCalled();
  });
});
