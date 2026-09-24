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
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface InterviewEmailProps {
  title: string;
  hostName: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  studio: string;
  hasGuestImage?: boolean;
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

export default function InterviewEmail({
  title,
  hostName,
  guestName,
  date,
  startTime,
  endTime,
  studio,
  hasGuestImage,
}: InterviewEmailProps) {
  return (
    <Html>
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-10 rounded-lg mx-auto my-10 max-w-[465px]">
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
              {title}
            </Heading>

            {hasGuestImage && (
              <Section className="text-center mb-6">
                <Img
                  src="cid:guestImage"
                  width="80"
                  height="80"
                  alt={guestName}
                  className="mx-auto rounded-full"
                  style={{ objectFit: "cover" }}
                />
              </Section>
            )}

            <Text className="text-base mb-2">Hello {hostName},</Text>

            <Text className="text-base mb-4">
              You have been assigned a new guest request. Kindly review the
              details provided below.
            </Text>

            {/* DETAILS BOX */}
            <Section className="bg-gray-200 p-5 rounded-lg my-5">
              <Text className="text-base mb-1">
                Guest: <strong>{guestName}</strong>
              </Text>
              <Text className="text-base mb-1">Date: {date}</Text>
              <Text className="text-base mb-1">
                Time: {formatTime(startTime)} - {formatTime(endTime)}
              </Text>
              <Text className="text-base mb-1">Studio: {studio}</Text>
            </Section>

            <Text className="text-base mb-4">
              Please login to the system for more details.
            </Text>

            <Text className="text-sm text-gray-500 text-center mt-6">
              If you believe this assignment is incorrect, please contact the
              administrator.
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Real Story Time. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
