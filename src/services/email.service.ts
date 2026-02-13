import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw new Error("Failed to send email");
  }
};
