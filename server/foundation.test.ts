import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  createApplication: vi.fn().mockResolvedValue(1),
  getApplications: vi.fn().mockResolvedValue([]),
  getApplicationById: vi.fn().mockResolvedValue(null),
  updateApplicationStatus: vi.fn().mockResolvedValue(undefined),
  updateApplicationAiAnalysis: vi.fn().mockResolvedValue(undefined),
  createReferrals: vi.fn().mockResolvedValue(undefined),
  getReferralsByApplicationId: vi.fn().mockResolvedValue([]),
  createDonation: vi.fn().mockResolvedValue(1),
  getDonations: vi.fn().mockResolvedValue([]),
  getTotalDonations: vi.fn().mockResolvedValue(5000),
  createMessage: vi.fn().mockResolvedValue(1),
  getMessages: vi.fn().mockResolvedValue([]),
  markMessageRead: vi.fn().mockResolvedValue(undefined),
  createApplicationNote: vi.fn().mockResolvedValue(undefined),
  getNotesByApplicationId: vi.fn().mockResolvedValue([]),
  getSetting: vi.fn().mockResolvedValue(null),
  setSetting: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock stripe
vi.mock("./stripe", () => ({
  stripe: null,
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Test analysis" } }],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@radacad.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("application.submit", () => {
  it("creates an application with valid input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.application.submit({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      programInterest: "Power BI Comprehensive",
      amountRequested: "2500",
      essay: "This is my personal statement about why I need this scholarship and how it will help me achieve my career goals in data analytics.",
      referrals: [
        { referrerName: "Jane Smith", referrerEmail: "jane@example.com", relationship: "Manager" },
      ],
    });
    expect(result).toEqual({ success: true, id: 1 });
  });

  it("rejects application with missing required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.application.submit({
        firstName: "",
        lastName: "Doe",
        email: "john@example.com",
        programInterest: "Power BI Comprehensive",
        amountRequested: "2500",
        essay: "My essay",
        referrals: [],
      })
    ).rejects.toThrow();
  });
});

describe("donation.getTotal", () => {
  it("returns the total donations amount", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.donation.getTotal();
    expect(result).toEqual({ total: 5000 });
  });
});

describe("donation.createCheckout", () => {
  it("throws when stripe is not configured", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.donation.createCheckout({
        amount: 100,
        frequency: "one_time",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        origin: "https://example.com",
      })
    ).rejects.toThrow("Stripe not configured");
  });
});

describe("message.submit", () => {
  it("creates a message with valid input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.message.submit({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      subject: "Scholarship question",
      message: "I have a question about the application process.",
    });
    expect(result).toEqual({ success: true, id: 1 });
  });

  it("rejects message with invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.message.submit({
        firstName: "Jane",
        lastName: "Doe",
        email: "not-an-email",
        subject: "Test",
        message: "Test message",
      })
    ).rejects.toThrow();
  });
});

describe("admin routes", () => {
  it("denies access to non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.applications.list()).rejects.toThrow("FORBIDDEN");
  });

  it("denies access to unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.applications.list()).rejects.toThrow();
  });

  it("allows admin to list applications", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.applications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to list messages", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.messages.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to list donations", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.donations.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to get total donations", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.donations.getTotal();
    expect(result).toEqual({ total: 5000 });
  });
});
