import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Img,
  Row,
  Column,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface GuestReapprovalRequestEmailProps {
  guestName: string;
  requestedByName: string;
  triggerSource: "duplicate_guest_attempt" | "repeat_booking";
  proposedHostName?: string;
  hasGuestImage?: boolean;
}

const TRIGGER_COPY: Record<
  GuestReapprovalRequestEmailProps["triggerSource"],
  string
> = {
  duplicate_guest_attempt:
    "A team member attempted to add a guest that already exists in the system.",
  repeat_booking:
    "A team member is trying to book this guest for another interview, and the guest requires re-approval before that can proceed.",
};

export default function GuestReapprovalRequestEmail({
  guestName,
  requestedByName,
  triggerSource,
  proposedHostName,
  hasGuestImage,
}: GuestReapprovalRequestEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-10 rounded-lg mx-auto my-10 max-w-[465px]">
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
              Guest Re-approval Requested
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

            <Text className="text-base mb-2">Dear Admin,</Text>

            <Text className="text-base mb-4">
              {TRIGGER_COPY[triggerSource]}
            </Text>

            <Section className="bg-gray-200 p-5 rounded-lg my-5">
              <Text className="text-base mb-1">
                Guest Name: <strong>{guestName}</strong>
              </Text>
              <Text className="text-base mb-1">
                Requested By: {requestedByName}
              </Text>
              {proposedHostName && (
                <Text className="text-base mb-1">
                  Proposed Host: {proposedHostName}
                </Text>
              )}
            </Section>

            <Text className="text-base mb-4">
              Please log in to the system to review this request.
            </Text>

            <Section className="text-center my-6">
              <a
                href="https://rstpms.realstorytime.com/dashboard/guest-reapprovals"
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
                Review Request
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
