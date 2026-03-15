import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Preview,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface GuestStatusEmailProps {
  hostName: string;
  guestName: string;
  status: "approved" | "rejected";
  adminName: string;
}

export default function GuestStatusEmail({
  hostName,
  guestName,
  status,
  adminName,
}: GuestStatusEmailProps) {
  const title = status === "approved" ? "Guest Approved" : "Guest Rejected";

  return (
    <Html>
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-10 rounded-lg mx-auto my-10 max-w-[465px]">
            <Heading className="text-2xl font-semibold mb-6 text-center">
              {title}
            </Heading>

            <Text>Hello {hostName},</Text>

            <Text>
              The guest <strong>{guestName}</strong> has been{" "}
              <strong>{status}</strong> by <strong>{adminName}</strong>.
            </Text>

            <Section className="bg-gray-200 p-5 rounded-lg my-5">
              <Text>Guest: {guestName}</Text>
              <Text>Status: {status}</Text>
            </Section>

            <Text>Please login to the system for more details.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
