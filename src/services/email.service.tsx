import nodemailer, { Transporter } from "nodemailer";
import { render } from "@react-email/render";
import OtpEmail from "../emails/templates/otp-email";
import InterviewEmail from "../emails/templates/interview-email";
import GuestApprovalEmail from "../emails/templates/GuestApprovalEmail";
import GuestStatusEmail from "../emails/templates/GuestStatusEmail";

export function generateOtpEmailHtml(otp: string) {
  return render(<OtpEmail otp={otp} />);
}

export async function generateInterviewEmailHtml(
  title: string,
  hostName: string,
  guestName: string,
  date: string,
  startTime: string,
  endTime: string,
  studio: string,
): Promise<string> {
  return await render(
    <InterviewEmail
      title={title}
      hostName={hostName}
      guestName={guestName}
      date={date}
      startTime={startTime}
      endTime={endTime}
      studio={studio}
    />,
  );
}

export async function generateGuestApprovalEmailHtml(
  guestName: string,
  referredBy: string,
  designation?: string,
  hostName?: string,
): Promise<string> {
  return render(
    <GuestApprovalEmail
      guestName={guestName}
      referredBy={referredBy}
      designation={designation}
      hostName={hostName}
    />,
  );
}

export async function generateGuestStatusEmailHtml(
  hostName: string,
  guestName: string,
  status: "approved" | "rejected",
  adminName: string,
): Promise<string> {
  return render(
    <GuestStatusEmail
      hostName={hostName}
      guestName={guestName}
      status={status}
      adminName={adminName}
    />,
  );
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

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string;
  replyTo?: string;
}

/**
 * Send email via Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"RST" <${process.env.GMAIL_USER}>`,
      to: options.to,
      cc: options.cc,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html ?? `<p>${options.text}</p>`,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}
