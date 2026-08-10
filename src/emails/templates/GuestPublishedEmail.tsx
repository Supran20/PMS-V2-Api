import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Preview,
  Img,
  Hr,
  Link,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface GuestPublishedEmailProps {
  guestName: string;
  hostName: string;
  episode?: number;
  youtubeLink?: string | null;
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1).split("/")[0] || null;
    }

    if (
      parsedUrl.hostname === "youtube.com" ||
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "m.youtube.com"
    ) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return videoId;
      }

      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

      if (
        (pathSegments[0] === "shorts" ||
          pathSegments[0] === "embed" ||
          pathSegments[0] === "live") &&
        pathSegments[1]
      ) {
        return pathSegments[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function GuestPublishedEmail({
  guestName,
  hostName,
  episode,
  youtubeLink,
}: GuestPublishedEmailProps) {
  const youtubeVideoId = youtubeLink ? getYouTubeVideoId(youtubeLink) : null;

  const youtubeThumbnail = youtubeVideoId
    ? `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`
    : null;

  return (
    <Html>
      <Preview>Your Real Story Time episode is now live</Preview>

      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="bg-white mx-auto my-10 p-8 max-w-2xl">
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
              <Section className="my-6 text-center">
                {youtubeVideoId && youtubeThumbnail ? (
                  <>
                    <Link
                      href={youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative"
                    >
                      <Img
                        src={youtubeThumbnail}
                        alt="Watch your Real Story Time episode on YouTube"
                        width="560"
                        className="w-full max-w-full rounded-lg border-0"
                      />

                      {/* Play button overlay — table-based so it renders
                          correctly in Gmail/Outlook, which strip
                          position: absolute on divs in many contexts. */}
                      {/* <table
                        role="presentation"
                        width="100%"
                        cellPadding="0"
                        cellSpacing="0"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          borderCollapse: "collapse",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td align="center" valign="middle">
                              <table
                                role="presentation"
                                cellPadding="0"
                                cellSpacing="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        width: "68px",
                                        height: "48px",
                                        backgroundColor: "rgba(0,0,0,0.75)",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 0,
                                          height: 0,
                                          display: "inline-block",
                                          borderTop: "12px solid transparent",
                                          borderBottom:
                                            "12px solid transparent",
                                          borderLeft: "20px solid #ffffff",
                                          marginLeft: "4px",
                                        }}
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table> */}
                    </Link>

                    <Text className="text-sm text-gray-500 mt-3 mb-2">
                      Click the video preview above to watch your episode.
                    </Text>
                  </>
                ) : null}

                <Section className="bg-gray-200 p-5 rounded-lg mt-2">
                  <Link
                    href={youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-blue-600"
                  >
                    Watch Your Episode
                  </Link>
                </Section>
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
