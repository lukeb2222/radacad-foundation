import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "RadAcad Foundation <onboarding@resend.dev>";

export async function sendDonorThankYou({
  to,
  donorName,
  amount,
}: {
  to: string;
  donorName: string;
  amount?: string | number;
}) {
  const formattedAmount = amount
    ? typeof amount === "number"
      ? `$${amount.toFixed(2)}`
      : `$${amount}`
    : null;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Thank you for your donation to RadAcad Foundation!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You — RadAcad Foundation</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#2bb5a0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                RadAcad Foundation
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                Scholarships for Flexible Education in Jackson
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a2332;font-size:26px;font-weight:700;">
                Thank you, ${donorName}!
              </h2>
              <p style="margin:0 0 16px;color:#444;font-size:16px;line-height:1.6;">
                ${
                  formattedAmount
                    ? `Your generous donation of <strong>${formattedAmount}</strong> has been received.`
                    : "Your generous donation has been received."
                }
                We're so grateful for your support.
              </p>
              <p style="margin:0 0 16px;color:#444;font-size:16px;line-height:1.6;">
                Every contribution helps a student in Jackson Hole access personalized, flexible education at
                Radical Minds Academy — regardless of their family's financial circumstances.
              </p>
              <p style="margin:0 0 32px;color:#444;font-size:16px;line-height:1.6;">
                RadAcad Foundation is a 501(c)(3) nonprofit. Your donation may be tax-deductible —
                please retain this email as your receipt.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#2bb5a0;padding:14px 28px;">
                    <a href="https://radacadfnd.org" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
                      Visit RadAcad Foundation →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f0ec;padding:24px 40px;text-align:center;border-top:1px solid #e0e0d8;">
              <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
                RadAcad Foundation · Jackson Hole, Wyoming<br />
                Questions? Reply to this email or visit <a href="https://radacadfnd.org/contact" style="color:#2bb5a0;">radacadfnd.org/contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (error) {
    console.error("[Email] Failed to send donor thank-you:", error);
    return { success: false, error };
  }

  console.log("[Email] Donor thank-you sent:", data?.id);
  return { success: true, id: data?.id };
}
