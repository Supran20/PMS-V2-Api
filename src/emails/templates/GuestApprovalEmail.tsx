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

interface GuestApprovalEmailProps {
  guestName: string;
  referredBy: string;
  designation?: string;
  hostName?: string;
}

export default function GuestApprovalEmail({
  guestName,
  referredBy,
  designation,
  hostName,
}: GuestApprovalEmailProps) {
  return (
    <Html>
      <Preview>Guest Approval Required</Preview>
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
              Guest Approval Required
            </Heading>

            <Text className="text-base mb-2">Hello Admin,</Text>

            <Text className="text-base mb-4">
              A new guest has been added to the system and requires your
              approval. Details are as follows:
            </Text>

            {/* DETAILS BOX */}
            <Section className="bg-gray-200 p-5 rounded-lg my-5">
              <Text className="text-base mb-1">
                Guest Name: <strong>{guestName}</strong>
              </Text>
              {designation && (
                <Text className="text-base mb-1">
                  Designation: {designation}
                </Text>
              )}
              <Text className="text-base mb-1">Referred By: {referredBy}</Text>
              {hostName && (
                <Text className="text-base mb-1">
                  Assigned Host: {hostName}
                </Text>
              )}
            </Section>

            <Text className="text-base mb-4">
              Please log in to the system to review and approve this guest.
            </Text>

            {/* BUTTON TO DASHBOARD */}
            <Section className="text-center my-6">
              <a
                href="https://rstpms.realstorytime.com/dashboard/guest"
                style={{
                  display: "inline-block",
                  backgroundColor: "#4F46E5",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                Approve Guest
              </a>
            </Section>

            <Text className="text-sm text-gray-500 text-center mt-6">
              If you believe this request is incorrect, please contact the
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
