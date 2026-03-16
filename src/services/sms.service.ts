import axios from "axios";

export async function sendSms(to: string, message: string) {
  try {
    const response = await axios.post(
      `${process.env.SMS_MAPPER_DOMAIN}`,
      {
        token: process.env.SMS_TOKEN,
        sender: process.env.SMS_SENDER,
        mobile: to,
        message: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "SMS sending failed:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to send SMS");
  }
}
