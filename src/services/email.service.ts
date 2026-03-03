import nodemailer, { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

/**
 * Lazily initialize transporter.
 * Why: avoids crashing app at startup if env is misconfigured.
 */
function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("GMAIL_USER or GMAIL_PASS not defined in environment");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Send email via Gmail SMTP
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"RST" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html: html ?? `<p>${text}</p>`,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}
