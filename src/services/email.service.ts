import nodemailer from "nodemailer";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

const transporter = nodemailer.createTransport({
  host: "email-smtp." + process.env.AWS_DEFAULT_REGION + ".amazonaws.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.AWS_ACCESS_KEY_ID,
    pass: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sendEmail = async (to: string, subject: string, body: string) => {
  await transporter.sendMail({
    from: process.env.ENQUIRY_FROM_MAIL,
    to,
    subject,
    html: body,
  });
};
