import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationAiAnalysis,
  updateApplicationOverallScore,
  getApplicationStats,
  createReferrals,
  getReferralsByApplicationId,
  createDonation,
  getDonations,
  getTotalDonations,
  markDonationThankYou,
  deleteDonation,
  getDonationStats,
  createMessage,
  getMessages,
  markMessageRead,
  archiveMessage,
  unarchiveMessage,
  deleteMessage,
  getMessageStats,
  createApplicationNote,
  getNotesByApplicationId,
  createCommitteeReview,
  getReviewsByApplicationId,
  deleteCommitteeReview,
  getAverageScoreForApplication,
  registerCommitteeMember,
  getCommitteeMembers,
  createCommitteeFile,
  getFilesByApplicationId,
  deleteCommitteeFile,
  createAccessToken,
  validateAccessToken,
  getAccessTokens,
  revokeAccessToken,
  getFundraisingConfig,
  upsertFundraisingConfig,
  getSetting,
  setSetting,
} from "./db";
import { stripe } from "./stripe";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Committee password - stored in settings, default fallback
const COMMITTEE_PASSWORD = "RadAcadFoundation2024";

// Committee access middleware - validates either password or access token
async function validateCommitteeAccess(password?: string, token?: string): Promise<boolean> {
  if (token) {
    return await validateAccessToken(token);
  }
  if (password) {
    const storedPw = await getSetting("committee_password");
    return password === (storedPw || COMMITTEE_PASSWORD);
  }
  return false;
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  application: router({
    submit: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          country: z.string().optional(),
          programInterest: z.string().min(1),
          currentEducation: z.string().optional(),
          employmentStatus: z.string().optional(),
          amountRequested: z.string().min(1),
          financialStatement: z.string().optional(),
          essay: z.string().min(1),
          referrals: z.array(
            z.object({
              referrerName: z.string().min(1),
              referrerEmail: z.string().email(),
              relationship: z.string().min(1),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { referrals: referralData, ...applicationData } = input;
        const appId = await createApplication(applicationData);
        if (referralData.length > 0) {
          await createReferrals(referralData.map((r) => ({ ...r, applicationId: appId })));
        }
        await notifyOwner({
          title: "New Scholarship Application",
          content: `${input.firstName} ${input.lastName} submitted a scholarship application for ${input.programInterest}. Amount requested: $${input.amountRequested}.`,
        });
        return { success: true, id: appId };
      }),
  }),

  donation: router({
    getTotal: publicProcedure.query(async () => {
      const total = await getTotalDonations();
      const config = await getFundraisingConfig();
      return { total, goal: config ? Number(config.goalAmount) : 50000, campaignTitle: config?.campaignTitle || "Scholarship Fund" };
    }),
    createCheckout: publicProcedure
      .input(
        z.object({
          amount: z.number().min(1),
          frequency: z.enum(["one_time", "monthly"]),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          note: z.string().optional(),
          origin: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

        const donationId = await createDonation({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          amount: input.amount.toFixed(2),
          frequency: input.frequency,
          note: input.note || null,
          status: "pending",
        });

        const sessionParams: any = {
          payment_method_types: ["card"],
          mode: input.frequency === "monthly" ? "subscription" : "payment",
          customer_email: input.email,
          success_url: `${input.origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/donate`,
          metadata: {
            donation_id: donationId.toString(),
            donor_name: `${input.firstName} ${input.lastName}`,
            frequency: input.frequency,
          },
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `RadAcad Foundation ${input.frequency === "monthly" ? "Monthly " : ""}Donation`,
                  description: `${input.frequency === "monthly" ? "Monthly donation" : "One-time donation"} to the RadAcad Foundation Scholarship Fund`,
                },
                unit_amount: Math.round(input.amount * 100),
                ...(input.frequency === "monthly" ? { recurring: { interval: "month" } } : {}),
              },
              quantity: 1,
            },
          ],
        };

        const session = await stripe.checkout.sessions.create(sessionParams);

        const { getDb } = await import("./db");
        const db = await getDb();
        if (db) {
          const { donations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await db.update(donations).set({ stripeSessionId: session.id }).where(eq(donations.id, donationId));
        }

        return { url: session.url };
      }),
  }),

  message: router({
    submit: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          subject: z.string().min(1),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createMessage(input);
        await notifyOwner({
          title: "New Contact Message",
          content: `${input.firstName} ${input.lastName} (${input.email}) sent a message: "${input.subject}"`,
        });
        return { success: true, id };
      }),
  }),

  // Committee dashboard routes (password/token protected)
  committee: router({
    validateAccess: publicProcedure
      .input(z.object({ password: z.string().optional(), token: z.string().optional() }))
      .mutation(async ({ input }) => {
        const valid = await validateCommitteeAccess(input.password, input.token);
        return { valid };
      }),

    registerMember: publicProcedure
      .input(z.object({ name: z.string().min(1), email: z.string().email() }))
      .mutation(async ({ input }) => {
        await registerCommitteeMember(input);
        return { success: true };
      }),

    members: publicProcedure.query(async () => {
      return getCommitteeMembers();
    }),

    // Applications
    applications: router({
      list: publicProcedure.query(async () => {
        return getApplications();
      }),
      stats: publicProcedure.query(async () => {
        return getApplicationStats();
      }),
      get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const app = await getApplicationById(input.id);
        if (!app) throw new TRPCError({ code: "NOT_FOUND" });
        const refs = await getReferralsByApplicationId(input.id);
        const notes = await getNotesByApplicationId(input.id);
        const reviews = await getReviewsByApplicationId(input.id);
        const files = await getFilesByApplicationId(input.id);
        const avgScore = await getAverageScoreForApplication(input.id);
        return { ...app, referrals: refs, notes, reviews, files, avgScore };
      }),
      updateStatus: publicProcedure
        .input(z.object({ id: z.number(), status: z.enum(["pending", "under_review", "shortlisted", "approved", "denied"]) }))
        .mutation(async ({ input }) => {
          await updateApplicationStatus(input.id, input.status);
          return { success: true };
        }),
      updateScore: publicProcedure
        .input(z.object({ id: z.number(), score: z.number().min(0).max(100).nullable(), notes: z.string().optional() }))
        .mutation(async ({ input }) => {
          await updateApplicationOverallScore(input.id, input.score, input.notes);
          return { success: true };
        }),
      addNote: publicProcedure
        .input(z.object({
          applicationId: z.number(),
          authorName: z.string().min(1),
          authorEmail: z.string().optional(),
          content: z.string().min(1),
          score: z.number().min(0).max(100).optional(),
        }))
        .mutation(async ({ input }) => {
          await createApplicationNote({
            applicationId: input.applicationId,
            authorName: input.authorName,
            authorEmail: input.authorEmail || null,
            content: input.content,
            score: input.score ?? null,
          });
          return { success: true };
        }),
      aiAnalyze: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const app = await getApplicationById(input.id);
          if (!app) throw new TRPCError({ code: "NOT_FOUND" });
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a scholarship review assistant for the RadAcad Foundation. Analyze the following application and return a JSON object with these fields:
- summary: A brief paragraph summarizing the application
- recommendation: One of "Strong Candidate", "Moderate Candidate", or "Weak Candidate"
- recommendedScore: A number from 0 to 100
- keyPoints: An array of 3-5 key observations
- strengths: An array of strengths
- weaknesses: An array of areas of concern
Be objective, fair, and consider financial need.`,
              },
              {
                role: "user",
                content: `Applicant: ${app.firstName} ${app.lastName}\nProgram: ${app.programInterest}\nAmount Requested: $${app.amountRequested}\nEducation: ${app.currentEducation || "Not specified"}\nEmployment: ${app.employmentStatus || "Not specified"}\nFinancial Statement: ${app.financialStatement || "Not provided"}\nEssay: ${app.essay}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "ai_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    recommendation: { type: "string" },
                    recommendedScore: { type: "number" },
                    keyPoints: { type: "array", items: { type: "string" } },
                    strengths: { type: "array", items: { type: "string" } },
                    weaknesses: { type: "array", items: { type: "string" } },
                  },
                  required: ["summary", "recommendation", "recommendedScore", "keyPoints", "strengths", "weaknesses"],
                  additionalProperties: false,
                },
              },
            },
          });
          const rawContent = response.choices[0]?.message?.content;
          const analysis = typeof rawContent === "string" ? rawContent : JSON.stringify({ summary: "Analysis unavailable", recommendation: "Moderate Candidate", recommendedScore: 50, keyPoints: [], strengths: [], weaknesses: [] });
          await updateApplicationAiAnalysis(input.id, analysis);
          return { analysis };
        }),
    }),

    // Reviews
    reviews: router({
      add: publicProcedure
        .input(z.object({
          applicationId: z.number(),
          reviewerName: z.string().min(1),
          reviewerEmail: z.string().email().optional(),
          score: z.number().min(0).max(100),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await createCommitteeReview({
            applicationId: input.applicationId,
            reviewerName: input.reviewerName,
            reviewerEmail: input.reviewerEmail || null,
            score: input.score,
            notes: input.notes || null,
          });
          return { success: true };
        }),
      listByApplication: publicProcedure
        .input(z.object({ applicationId: z.number() }))
        .query(async ({ input }) => {
          return getReviewsByApplicationId(input.applicationId);
        }),
      delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteCommitteeReview(input.id);
          return { success: true };
        }),
    }),

    // Files
    files: router({
      upload: publicProcedure
        .input(z.object({
          applicationId: z.number(),
          filename: z.string().min(1),
          fileData: z.string(), // base64
          mimeType: z.string(),
          category: z.enum(["report_card", "recommendation", "grades", "other"]),
          description: z.string().optional(),
          uploaderName: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const buffer = Buffer.from(input.fileData, "base64");
          const fileKey = `committee-files/${input.applicationId}/${nanoid()}-${input.filename}`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          await createCommitteeFile({
            applicationId: input.applicationId,
            filename: input.filename,
            fileUrl: url,
            fileKey: fileKey,
            fileSize: buffer.length,
            mimeType: input.mimeType,
            category: input.category,
            description: input.description || null,
            uploaderName: input.uploaderName || null,
          });
          return { success: true, url };
        }),
      listByApplication: publicProcedure
        .input(z.object({ applicationId: z.number() }))
        .query(async ({ input }) => {
          return getFilesByApplicationId(input.applicationId);
        }),
      delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteCommitteeFile(input.id);
          return { success: true };
        }),
    }),

    // Messages
    messages: router({
      list: publicProcedure.query(async () => {
        return getMessages();
      }),
      stats: publicProcedure.query(async () => {
        return getMessageStats();
      }),
      markRead: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await markMessageRead(input.id);
        return { success: true };
      }),
      archive: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await archiveMessage(input.id);
        return { success: true };
      }),
      unarchive: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await unarchiveMessage(input.id);
        return { success: true };
      }),
      delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteMessage(input.id);
        return { success: true };
      }),
    }),

    // Donors
    donors: router({
      list: publicProcedure.query(async () => {
        return getDonations();
      }),
      stats: publicProcedure.query(async () => {
        return getDonationStats();
      }),
      markThankYou: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await markDonationThankYou(input.id);
        return { success: true };
      }),
      delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteDonation(input.id);
        return { success: true };
      }),
      getTotal: publicProcedure.query(async () => {
        const total = await getTotalDonations();
        return { total };
      }),
    }),

    // Access Tokens
    accessTokens: router({
      create: publicProcedure
        .input(z.object({ label: z.string().min(1) }))
        .mutation(async ({ input }) => {
          const token = nanoid(32);
          await createAccessToken({ token, label: input.label });
          return { token, label: input.label };
        }),
      list: publicProcedure.query(async () => {
        return getAccessTokens();
      }),
      revoke: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await revokeAccessToken(input.id);
        return { success: true };
      }),
    }),

    // Fundraising Config
    fundraising: router({
      get: publicProcedure.query(async () => {
        return getFundraisingConfig();
      }),
      update: publicProcedure
        .input(z.object({
          goalAmount: z.string().min(1),
          currentAmount: z.string(),
          campaignTitle: z.string().min(1),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await upsertFundraisingConfig(input);
          return { success: true };
        }),
    }),

    // Settings
    settings: router({
      get: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
        return getSetting(input.key);
      }),
      set: publicProcedure
        .input(z.object({ key: z.string(), value: z.string() }))
        .mutation(async ({ input }) => {
          await setSetting(input.key, input.value);
          return { success: true };
        }),
    }),
  }),

  // Keep admin routes for backward compatibility
  admin: router({
    applications: router({
      list: adminProcedure.query(async () => {
        return getApplications();
      }),
      get: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const app = await getApplicationById(input.id);
        if (!app) throw new TRPCError({ code: "NOT_FOUND" });
        const refs = await getReferralsByApplicationId(input.id);
        const notes = await getNotesByApplicationId(input.id);
        return { ...app, referrals: refs, notes };
      }),
      updateStatus: adminProcedure
        .input(z.object({ id: z.number(), status: z.enum(["pending", "under_review", "shortlisted", "approved", "denied"]) }))
        .mutation(async ({ input }) => {
          await updateApplicationStatus(input.id, input.status);
          return { success: true };
        }),
      addNote: adminProcedure
        .input(z.object({
          applicationId: z.number(),
          authorName: z.string().min(1),
          authorEmail: z.string().optional(),
          content: z.string().min(1),
          score: z.number().min(0).max(100).optional(),
        }))
        .mutation(async ({ input }) => {
          await createApplicationNote({
            applicationId: input.applicationId,
            authorName: input.authorName,
            authorEmail: input.authorEmail || null,
            content: input.content,
            score: input.score ?? null,
          });
          return { success: true };
        }),
      aiAnalyze: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const app = await getApplicationById(input.id);
          if (!app) throw new TRPCError({ code: "NOT_FOUND" });
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a scholarship review assistant. Analyze the following application and provide a brief summary highlighting key strengths, potential concerns, and an overall assessment. Be objective and concise." },
              { role: "user", content: `Applicant: ${app.firstName} ${app.lastName}\nProgram: ${app.programInterest}\nAmount Requested: $${app.amountRequested}\nEducation: ${app.currentEducation || "Not specified"}\nEmployment: ${app.employmentStatus || "Not specified"}\nFinancial Statement: ${app.financialStatement || "Not provided"}\nEssay: ${app.essay}` },
            ],
          });
          const rawContent = response.choices[0]?.message?.content;
          const analysis = typeof rawContent === "string" ? rawContent : "Analysis unavailable";
          await updateApplicationAiAnalysis(input.id, analysis);
          return { analysis };
        }),
    }),
    messages: router({
      list: adminProcedure.query(async () => { return getMessages(); }),
      markRead: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await markMessageRead(input.id); return { success: true }; }),
    }),
    donations: router({
      list: adminProcedure.query(async () => { return getDonations(); }),
      getTotal: adminProcedure.query(async () => { const total = await getTotalDonations(); return { total }; }),
    }),
    settings: router({
      get: adminProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => { return getSetting(input.key); }),
      set: adminProcedure.input(z.object({ key: z.string(), value: z.string() })).mutation(async ({ input }) => { await setSetting(input.key, input.value); return { success: true }; }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
