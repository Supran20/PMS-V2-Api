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

interface OtpEmailProps {
  otp: string;
}

export default function OtpEmail({ otp }: OtpEmailProps) {
  return (
    <Html>
      <Preview>Your OTP Code</Preview>
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
              Your OTP Code
            </Heading>

            <Text className="text-base mb-4 text-center">
              Use the following One-Time Password to complete your verification.
            </Text>

            {/* OTP BOX */}
            <Section className="bg-gray-200 p-5 rounded-lg text-center my-5">
              <Text className="text-3xl font-bold tracking-widest">{otp}</Text>
            </Section>

            <Text className="text-base text-center mb-4">
              It is valid for <strong>5 minutes</strong>.
            </Text>

            <Text className="text-sm text-gray-500 text-center">
              If you did not request this code, you can safely ignore this
              email.
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
