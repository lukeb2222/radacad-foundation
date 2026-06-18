import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API key validation", () => {
  it("should have a valid RESEND_API_KEY configured", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be set").toBeTruthy();
    expect(apiKey!.startsWith("re_"), "RESEND_API_KEY must start with 're_'").toBe(true);
  });

  it("should successfully connect to Resend API", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("Skipping Resend API test: no key configured");
      return;
    }
    const resend = new Resend(apiKey);
    // List domains as a lightweight connectivity check
    const { data, error } = await resend.domains.list();
    expect(error, `Resend API error: ${JSON.stringify(error)}`).toBeNull();
    expect(data).toBeDefined();
    console.log("[Test] Resend API connected. Domains:", data?.data?.length ?? 0);
  }, 10000);
});
