import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  // Scholarship type
  scholarshipType: mysqlEnum("scholarshipType", ["need_based", "merit_jhsc"]).default("need_based").notNull(),
  // Student info
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  dateOfBirth: varchar("dateOfBirth", { length: 16 }),
  gradeLevel: varchar("gradeLevel", { length: 32 }),
  division: varchar("division", { length: 32 }), // "middle_school" or "high_school" (for merit)
  currentSchool: varchar("currentSchool", { length: 256 }),
  parentName: varchar("parentName", { length: 256 }),
  parentEmail: varchar("parentEmail", { length: 320 }),
  parentPhone: varchar("parentPhone", { length: 32 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 64 }),
  zipCode: varchar("zipCode", { length: 16 }),
  country: varchar("country", { length: 64 }),
  // Need-based financial info
  householdIncome: varchar("householdIncome", { length: 128 }),
  householdSize: varchar("householdSize", { length: 16 }),
  mfiPercentage: varchar("mfiPercentage", { length: 64 }), // "100_120", "below_100", "not_sure"
  financialAttestation: boolean("financialAttestation").default(false),
  // Merit-specific
  activeJhscMember: boolean("activeJhscMember").default(false),
  // Legacy fields kept for backward compat
  programInterest: varchar("programInterest", { length: 256 }).notNull(),
  currentEducation: varchar("currentEducation", { length: 256 }),
  employmentStatus: varchar("employmentStatus", { length: 128 }),
  amountRequested: decimal("amountRequested", { precision: 10, scale: 2 }).notNull(),
  financialStatement: text("financialStatement"),
  // Essays (stored as JSON for multiple questions)
  essay: text("essay").notNull(),
  essay2: text("essay2"),
  essay3: text("essay3"),
  essay4: text("essay4"),
  // Parent/Guardian statement
  parentStatement: text("parentStatement"),
  // Status & review
  status: mysqlEnum("status", ["pending", "under_review", "shortlisted", "approved", "denied"])
    .default("pending")
    .notNull(),
  aiAnalysis: text("aiAnalysis"),
  aiAnalysisGeneratedAt: timestamp("aiAnalysisGeneratedAt"),
  overallScore: int("overallScore"),
  committeeNotes: text("committeeNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  referrerName: varchar("referrerName", { length: 256 }).notNull(),
  referrerEmail: varchar("referrerEmail", { length: 320 }).notNull(),
  relationship: varchar("relationship", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("usd").notNull(),
  frequency: mysqlEnum("frequency", ["one_time", "monthly"]).default("one_time").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
  status: mysqlEnum("donationStatus", ["pending", "completed", "failed", "refunded"])
    .default("pending")
    .notNull(),
  note: text("note"),
  thankYouSent: boolean("thankYouSent").default(false).notNull(),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 256 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const applicationNotes = mysqlTable("applicationNotes", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  authorName: varchar("authorName", { length: 256 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  content: text("content").notNull(),
  score: int("score"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type InsertApplicationNote = typeof applicationNotes.$inferInsert;

export const committeeReviews = mysqlTable("committeeReviews", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  reviewerName: varchar("reviewerName", { length: 256 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  score: int("score").notNull(), // total calculated score (sum of rubric)
  rubricScores: text("rubricScores"), // JSON: {category: score(1-5), ...}
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommitteeReview = typeof committeeReviews.$inferSelect;
export type InsertCommitteeReview = typeof committeeReviews.$inferInsert;

export const committeeMembers = mysqlTable("committeeMembers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  lastLogin: timestamp("lastLogin").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommitteeMember = typeof committeeMembers.$inferSelect;
export type InsertCommitteeMember = typeof committeeMembers.$inferInsert;

export const committeeFiles = mysqlTable("committeeFiles", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  filename: varchar("filename", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 128 }),
  category: mysqlEnum("fileCategory", ["report_card", "recommendation", "grades", "other"])
    .default("other")
    .notNull(),
  description: text("description"),
  uploaderName: varchar("uploaderName", { length: 256 }),
  extractedText: text("extractedText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommitteeFile = typeof committeeFiles.$inferSelect;
export type InsertCommitteeFile = typeof committeeFiles.$inferInsert;

export const dashboardAccessTokens = mysqlTable("dashboardAccessTokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 256 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DashboardAccessToken = typeof dashboardAccessTokens.$inferSelect;
export type InsertDashboardAccessToken = typeof dashboardAccessTokens.$inferInsert;

export const fundraisingConfig = mysqlTable("fundraisingConfig", {
  id: int("id").autoincrement().primaryKey(),
  goalAmount: decimal("goalAmount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("currentAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  campaignTitle: varchar("campaignTitle", { length: 256 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundraisingConfig = typeof fundraisingConfig.$inferSelect;
export type InsertFundraisingConfig = typeof fundraisingConfig.$inferInsert;

export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
