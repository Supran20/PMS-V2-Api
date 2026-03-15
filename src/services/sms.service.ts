import axios from "axios";

export async function sendSms(to: string, message: string) {
  try {
    const response = await axios.post(
      "https://app.smartsmssolutions.com/io/api/client/v1/sms/",
      {
        token: process.env.SMARTSMS_TOKEN,
        sender: process.env.SMARTSMS_SENDER,
        to: to,
        message: message,
        type: 0,
        routing: 3,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("SMS sending failed:", error);
    throw new Error("Failed to send SMS");
  }
}
