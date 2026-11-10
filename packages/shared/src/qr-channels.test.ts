import { describe, expect, it } from "vitest";
import { QR_CHANNELS, resolveQrPath } from "./qr-channels.js";

describe("QR campaign paths", () => {
  it("maps every required channel and hides UTM in the path", () => {
    for (const slug of ["afis", "el-ilani", "masa", "billboard", "uni-stand", "vitrin", "etkinlik"]) {
      const resolved = resolveQrPath([slug]);
      expect(resolved?.channel.slug).toBe(slug);
      expect(resolved?.channel.source).toBe("qr");
      expect(resolved?.channel.medium).toBe("offline");
      expect(QR_CHANNELS[slug]?.content).toBeTruthy();
    }
  });

  it("keeps billboard location and vitrin/masa business id without extra query params", () => {
    expect(resolveQrPath(["billboard", "lefkosa"])?.location).toBe("lefkosa");
    expect(resolveQrPath(["vitrin", "abc"])?.businessId).toBe("abc");
    expect(resolveQrPath(["masa", "xyz"])?.businessId).toBe("xyz");
    expect(resolveQrPath(["bilinmeyen"])).toBeNull();
    expect(resolveQrPath(["afis", "extra"])).toBeNull();
  });
});
