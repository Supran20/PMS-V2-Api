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
  hostName: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  studio: string;
}

export default function InterviewEmail({
  hostName,
  guestName,
  date,
  startTime,
  endTime,
  studio,
}: InterviewEmailProps) {
  return (
    <Html>
      <Preview>New Interview Assigned</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-10 rounded-lg mx-auto my-10 max-w-[465px]">
            {/* HEADER */}
            <Section className="mb-8">
              <Row className="items-center">
                <Column className="w-[60px]">
                  <Img
                    src="https://rstpms.realstorytime.com/_next/image?url=%2Frst.png&w=256&q=75"
                    width="40"
                    height="40"
                    alt="RST"
                    className="mx-auto"
                  />
                </Column>
              </Row>
            </Section>

            {/* HEADING */}
            <Heading className="text-2xl font-semibold mb-6 text-center">
              New Interview Assigned
            </Heading>

            <Text className="text-base mb-2">Hello {hostName},</Text>

            <Text className="text-base mb-4">
              You have been assigned a new interview. Details below:
            </Text>

            {/* DETAILS BOX */}
            <Section className="bg-gray-200 p-5 rounded-lg my-5">
              <Text className="text-base mb-1">
                Guest: <strong>{guestName}</strong>
              </Text>
              <Text className="text-base mb-1">Date: {date}</Text>
              <Text className="text-base mb-1">
                Time: {startTime} - {endTime}
              </Text>
              <Text className="text-base mb-1">Studio: {studio}</Text>
            </Section>

            <Text className="text-base mb-4">
              Please log in to the system for more details.
            </Text>

            <Text className="text-sm text-gray-500 text-center mt-6">
              If you believe this assignment is incorrect, please contact the
              administrator.
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              © 2026 Your Company. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
