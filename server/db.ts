import { eq, desc, sum, and, sql } from "drizzle-orm";
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
  committeeReviews,
  InsertCommitteeReview,
  committeeMembers,
  InsertCommitteeMember,
  committeeFiles,
  InsertCommitteeFile,
  dashboardAccessTokens,
  InsertDashboardAccessToken,
  fundraisingConfig,
  siteSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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
    const values: InsertUser = { openId: user.openId };
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
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
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
  await db.update(applications).set({ aiAnalysis: analysis, aiAnalysisGeneratedAt: new Date() }).where(eq(applications.id, id));
}

export async function updateApplicationOverallScore(id: number, score: number | null, notes?: string) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { overallScore: score };
  if (notes !== undefined) updateData.committeeNotes = notes;
  await db.update(applications).set(updateData as any).where(eq(applications.id, id));
}

export async function getApplicationStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, under_review: 0, shortlisted: 0, approved: 0, denied: 0 };
  const all = await db.select().from(applications);
  return {
    total: all.length,
    pending: all.filter(a => a.status === "pending").length,
    under_review: all.filter(a => a.status === "under_review").length,
    shortlisted: all.filter(a => a.status === "shortlisted").length,
    approved: all.filter(a => a.status === "approved").length,
    denied: all.filter(a => a.status === "denied").length,
  };
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

export async function markDonationThankYou(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(donations).set({ thankYouSent: true }).where(eq(donations.id, id));
}

export async function deleteDonation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(donations).where(eq(donations.id, id));
}

export async function getDonationStats() {
  const db = await getDb();
  if (!db) return { total: 0, pendingThankYou: 0, thankYouSent: 0 };
  const all = await db.select().from(donations).where(eq(donations.status, "completed"));
  return {
    total: all.length,
    pendingThankYou: all.filter(d => !d.thankYouSent).length,
    thankYouSent: all.filter(d => d.thankYouSent).length,
  };
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

export async function archiveMessage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isArchived: true }).where(eq(messages.id, id));
}

export async function unarchiveMessage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isArchived: false }).where(eq(messages.id, id));
}

export async function deleteMessage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(messages).where(eq(messages.id, id));
}

export async function getMessageStats() {
  const db = await getDb();
  if (!db) return { total: 0, unread: 0, read: 0, archived: 0 };
  const all = await db.select().from(messages);
  return {
    total: all.filter(m => !m.isArchived).length,
    unread: all.filter(m => !m.isRead && !m.isArchived).length,
    read: all.filter(m => m.isRead && !m.isArchived).length,
    archived: all.filter(m => m.isArchived).length,
  };
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

// ─── Committee Reviews ───────────────────────────────────────────────────────

export async function createCommitteeReview(data: InsertCommitteeReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(committeeReviews).values(data);
}

export async function getReviewsByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(committeeReviews).where(eq(committeeReviews.applicationId, applicationId)).orderBy(desc(committeeReviews.createdAt));
}

export async function deleteCommitteeReview(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(committeeReviews).where(eq(committeeReviews.id, id));
}

export async function getAverageScoreForApplication(applicationId: number) {
  const db = await getDb();
  if (!db) return null;
  const reviews = await db.select().from(committeeReviews).where(eq(committeeReviews.applicationId, applicationId));
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
  return Math.round(avg);
}

// ─── Committee Members ───────────────────────────────────────────────────────

export async function registerCommitteeMember(data: InsertCommitteeMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(committeeMembers).values(data).onDuplicateKeyUpdate({ set: { name: data.name, lastLogin: new Date() } });
}

export async function getCommitteeMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(committeeMembers).orderBy(desc(committeeMembers.lastLogin));
}

// ─── Committee Files ─────────────────────────────────────────────────────────

export async function createCommitteeFile(data: InsertCommitteeFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(committeeFiles).values(data);
}

export async function getFilesByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(committeeFiles).where(eq(committeeFiles.applicationId, applicationId)).orderBy(desc(committeeFiles.createdAt));
}

export async function deleteCommitteeFile(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(committeeFiles).where(eq(committeeFiles.id, id));
}

// ─── Dashboard Access Tokens ─────────────────────────────────────────────────

export async function createAccessToken(data: InsertDashboardAccessToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dashboardAccessTokens).values(data);
}

export async function validateAccessToken(token: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(dashboardAccessTokens)
    .where(and(eq(dashboardAccessTokens.token, token), eq(dashboardAccessTokens.isActive, true)))
    .limit(1);
  if (result.length > 0) {
    await db.update(dashboardAccessTokens).set({ lastUsed: new Date() }).where(eq(dashboardAccessTokens.id, result[0].id));
    return true;
  }
  return false;
}

export async function getAccessTokens() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dashboardAccessTokens).orderBy(desc(dashboardAccessTokens.createdAt));
}

export async function revokeAccessToken(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(dashboardAccessTokens).set({ isActive: false }).where(eq(dashboardAccessTokens.id, id));
}

// ─── Fundraising Config ──────────────────────────────────────────────────────

export async function getFundraisingConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fundraisingConfig).where(eq(fundraisingConfig.isActive, true)).limit(1);
  return result[0] || null;
}

export async function upsertFundraisingConfig(data: { goalAmount: string; currentAmount: string; campaignTitle: string; description?: string }) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(fundraisingConfig).where(eq(fundraisingConfig.isActive, true)).limit(1);
  if (existing.length > 0) {
    await db.update(fundraisingConfig).set({
      goalAmount: data.goalAmount,
      currentAmount: data.currentAmount,
      campaignTitle: data.campaignTitle,
      description: data.description || null,
    }).where(eq(fundraisingConfig.id, existing[0].id));
  } else {
    await db.insert(fundraisingConfig).values({
      goalAmount: data.goalAmount,
      currentAmount: data.currentAmount,
      campaignTitle: data.campaignTitle,
      description: data.description || null,
    });
  }
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
