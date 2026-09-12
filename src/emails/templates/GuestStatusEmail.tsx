import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Column,
  Img,
  Row,
  Preview,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface GuestStatusEmailProps {
  hostName: string;
  guestName: string;
  status: "approved" | "rejected";
  adminName: string;
  hasGuestImage?: boolean;
}

export default function GuestStatusEmail({
  hostName,
  guestName,
  status,
  adminName,
  hasGuestImage,
}: GuestStatusEmailProps) {
  const title = status === "approved" ? "Guest Approved" : "Guest Rejected";

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
            <Text className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Real Story Time. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
