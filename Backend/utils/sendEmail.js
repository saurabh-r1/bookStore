// Backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load .env here so EMAIL_HOST, EMAIL_USER, etc. are available
dotenv.config();

console.log("🔧 sendEmail config:", {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_FROM: process.env.EMAIL_FROM,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,                            // should be smtp.gmail.com
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,                                           // STARTTLS on 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("sendEmail: 'to' is required");

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  console.log("📧 Email sent via nodemailer:", {
    messageId: info.messageId,
    envelope: info.envelope,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  return info;
}
