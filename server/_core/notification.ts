import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

const OWNER_EMAIL = "garrett.austen@tetontutors.org";
const FROM_EMAIL = "RadAcad Foundation <onboarding@resend.dev>";

/**
 * Sends an owner notification email via Resend.
 * Returns true on success, false if the service is unavailable.
 * Validation errors bubble up as TRPCErrors.
 */
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  const resendKey = ENV.resendApiKey || process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[Notification] RESEND_API_KEY not set — skipping owner notification");
    return false;
  }

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `[RadAcad Foundation] ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #2bb5a0; margin-bottom: 16px;">${title}</h2>
          <div style="background: #f9f9f7; border-left: 4px solid #2bb5a0; padding: 16px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #333;">
${content}
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #888;">
            This is an automated notification from RadAcad Foundation.
          </p>
        </div>
      `.trim(),
    });

    if (error) {
      console.warn("[Notification] Resend error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Failed to send owner notification:", error);
    return false;
  }
}
