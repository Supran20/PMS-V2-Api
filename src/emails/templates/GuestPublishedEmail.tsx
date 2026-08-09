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
  Link,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface GuestPublishedEmailProps {
  guestName: string;
  hostName: string;
  episode?: number;
  youtubeLink?: string | null;
}

export default function GuestPublishedEmail({
  guestName,
  hostName,
  episode,
  youtubeLink,
}: GuestPublishedEmailProps) {
  return (
    <Html>
      <Preview>Your Real Story Time episode is now live</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-10 rounded-lg mx-auto my-10 max-w-[565px]">
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
              Your Episode Is Live!
            </Heading>

            <Text className="text-base mb-2">Dear {guestName},</Text>

            <Text className="text-base mb-4">
              Great news — your interview with {hostName} on Real Story Time
              {episode ? ` (Episode ${episode})` : ""} has just been published.
              We&apos;d love for you to take a look and share it with your
              network.
            </Text>

            {youtubeLink && (
              <Section className="bg-gray-200 p-5 rounded-lg my-5 text-center">
                <Link
                  href={youtubeLink}
                  className="text-base font-semibold text-blue-600"
                >
                  Watch Your Episode
                </Link>
              </Section>
            )}

            <Text className="text-base mb-4">
              Please take a moment to review it, and let us know if you spot
              anything that needs a correction — simply reply to this email and
              our team will take care of it.
            </Text>

            <Hr className="my-6 border-gray-300" />

            <Text className="text-base mb-4">
              Thank you again for being part of Real Story Time — we hope you
              love how it turned out.
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
