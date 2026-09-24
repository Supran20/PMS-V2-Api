import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Preview,
  Img,
  Row,
  Column,
  Hr,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface GuestInterviewEmailProps {
  guestName: string;
  hostName: string;
  date: string;
  startTime: string;
  endTime: string;
  studio: string;
}

const formatTime = (time: string) => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (isNaN(hours) || isNaN(minutes)) return time;

  return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function GuestInterviewEmail({
  guestName,
  hostName,
  date,
  startTime,
  endTime,
  studio,
}: GuestInterviewEmailProps) {
  return (
    <Html>
      <Preview>
        You&apos;re confirmed for your interview with Real Story Time
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-10 rounded-lg mx-auto my-10 max-w-[565px]">
            {/* HEADER */}
            <Section className="mb-8">
              <Row className="items-center">
                <Column className="w-[60px]">
                  <Img
                    src="https://rstpms.realstorytime.com/_next/image?url=%2Frst.png&w=256&q=75"
                    width="80"
                    height="40"
                    alt="RST"
                    className="mx-auto"
                  />
                </Column>
              </Row>
            </Section>

            {/* HEADING */}
            <Heading className="text-2xl font-semibold mb-6 text-center">
              Welcome to Real Story Time
            </Heading>

            <Text className="text-base mb-2">Dear {guestName},</Text>

            <Text className="text-base mb-4">
              We are delighted to welcome you to Real Story Time. Thank you for
              taking the time to share your story with us — we&apos;re genuinely
              looking forward to the conversation. Here are the details of your
              upcoming interview:
            </Text>

            {/* DETAILS BOX */}
            <Section className="bg-gray-200 p-5 rounded-lg my-5">
              <Text className="text-base mb-1">
                Host: <strong>{hostName}</strong>
              </Text>
              <Text className="text-base mb-1">Date: {date}</Text>
              <Text className="text-base mb-1">
                Time: {formatTime(startTime)} - {formatTime(endTime)}
              </Text>
              <Text className="text-base mb-1">Studio: {studio}</Text>
            </Section>

            <Text className="text-base mb-4">
              Please plan to arrive a few minutes early so we can settle you in
              comfortably before we begin. If you have any questions in the
              meantime, or if you need to reschedule for any reason, simply
              reply to this email and our team will be happy to help.
            </Text>

            <Hr className="my-6 border-gray-300" />

            <Text className="text-base mb-4">
              We&apos;re honored to have you on Real Story Time, and we
              can&apos;t wait to bring your story to our audience.
            </Text>

            <Text className="text-base mb-6">Warm regards,</Text>
            <Text className="text-base mb-4">The Real Story Time Team</Text>

            <Text className="text-sm text-gray-500 text-center mt-6">
              © {new Date().getFullYear()} Real Story Time. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
