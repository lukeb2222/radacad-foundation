import { eq, desc, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  applications,
  InsertApplication,
  referrals,
  InsertReferral,
  donations,
  InsertDonation,
  messages,
  InsertMessage,
  applicationNotes,
  InsertApplicationNote,
  siteSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Applications ────────────────────────────────────────────────────────────

export async function createApplication(data: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(applications).values(data);
  return result[0].insertId;
}

export async function getApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).orderBy(desc(applications.createdAt));
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result[0];
}

export async function updateApplicationStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(applications).set({ status: status as any }).where(eq(applications.id, id));
}

export async function updateApplicationAiAnalysis(id: number, analysis: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(applications).set({ aiAnalysis: analysis }).where(eq(applications.id, id));
}

// ─── Referrals ───────────────────────────────────────────────────────────────

export async function createReferrals(data: InsertReferral[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.length === 0) return;
  await db.insert(referrals).values(data);
}

export async function getReferralsByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referrals).where(eq(referrals.applicationId, applicationId));
}

// ─── Donations ───────────────────────────────────────────────────────────────

export async function createDonation(data: InsertDonation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(donations).values(data);
  return result[0].insertId;
}

export async function getDonations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(donations).orderBy(desc(donations.createdAt));
}

export async function getDonationBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(donations).where(eq(donations.stripeSessionId, sessionId)).limit(1);
  return result[0];
}

export async function updateDonationStatus(sessionId: string, status: string, paymentIntentId?: string) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (paymentIntentId) updateData.stripePaymentIntentId = paymentIntentId;
  await db.update(donations).set(updateData as any).where(eq(donations.stripeSessionId, sessionId));
}

export async function getTotalDonations() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: sum(donations.amount) }).from(donations).where(eq(donations.status, "completed"));
  return Number(result[0]?.total || 0);
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markMessageRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
}

// ─── Application Notes ───────────────────────────────────────────────────────

export async function createApplicationNote(data: InsertApplicationNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(applicationNotes).values(data);
}

export async function getNotesByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applicationNotes).where(eq(applicationNotes.applicationId, applicationId)).orderBy(desc(applicationNotes.createdAt));
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  return result[0]?.settingValue || null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteSettings).values({ settingKey: key, settingValue: value }).onDuplicateKeyUpdate({ set: { settingValue: value } });
}
