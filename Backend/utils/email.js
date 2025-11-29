// Backend/utils/email.js
import nodemailer from "nodemailer";

// create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Build beautiful HTML for reset password email
 */
export const buildResetPasswordEmail = ({ name, resetUrl }) => {
  const safeName = name || "there";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reset your password - The Page Hub</title>
  </head>
  <body style="margin:0; padding:0; background:#0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0f172a; padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px; background:#020617; border-radius:18px; border:1px solid #1e293b; overflow:hidden;">
            
            <!-- Header / logo -->
            <tr>
              <td style="padding:20px 24px; background:linear-gradient(135deg,#4f46e5,#ec4899);">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:8px; color:#e0f2fe; font-weight:600; font-size:18px;">
                        <span style="display:inline-block; padding:6px 10px; border-radius:999px; background:rgba(15,23,42,0.2); border:1px solid rgba(15,23,42,0.3); font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">The Page Hub</span>
                      </div>
                      <h1 style="margin:12px 0 0 0; font-size:20px; line-height:1.3; color:#f9fafb;">
                        Reset your password
                      </h1>
                      <p style="margin:4px 0 0 0; font-size:13px; color:#e5e7eb;">
                        You recently requested to reset your password.
                      </p>
                    </td>
                    <td align="right" style="vertical-align:top;">
                      <!-- simple book icon style logo -->
                      <div style="width:40px; height:40px; border-radius:12px; background:#0f172a; display:flex; align-items:center; justify-content:center; color:#e5e7eb; font-size:20px; font-weight:700;">
                        📚
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:22px 24px 8px 24px;">
                <p style="margin:0 0 10px 0; font-size:14px; color:#e5e7eb;">
                  Hi ${safeName},
                </p>
                <p style="margin:0 0 12px 0; font-size:13px; color:#9ca3af; line-height:1.6;">
                  We received a request to reset the password for your <strong style="color:#e5e7eb;">The Page Hub</strong> account.
                  Click the button below to choose a new password.
                </p>

                <p style="margin:0 0 18px 0; font-size:12px; color:#f97316;">
                  This link is valid for <strong>15 minutes</strong>. If you didn’t request this, you can safely ignore this email.
                </p>

                <!-- Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${resetUrl}"
                        style="
                          display:inline-block;
                          padding:10px 24px;
                          border-radius:999px;
                          background:linear-gradient(135deg,#4f46e5,#ec4899);
                          color:#f9fafb;
                          font-size:14px;
                          font-weight:600;
                          text-decoration:none;
                          box-shadow:0 10px 30px rgba(79,70,229,0.45);
                        "
                      >
                        Reset password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px 0; font-size:12px; color:#6b7280; line-height:1.5;">
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>
                <p style="margin:0 0 16px 0; font-size:11px; color:#9ca3af; word-break:break-all;">
                  <a href="${resetUrl}" style="color:#60a5fa; text-decoration:none;">${resetUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px 20px 24px; border-top:1px solid #1f2937;">
                <p style="margin:0 0 4px 0; font-size:11px; color:#6b7280;">
                  You’re receiving this email because a password reset was requested for your account.
                </p>
                <p style="margin:0; font-size:11px; color:#4b5563;">
                  © ${new Date().getFullYear()} The Page Hub. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Generic sendEmail helper
 */
export const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
