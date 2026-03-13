"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelInviteUserEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '';
const VercelInviteUserEmail = ({ username, userImage, invitedByUsername, invitedByEmail, teamName, teamImage, inviteLink, inviteFromIp, inviteFromLocation, }) => {
    const previewText = `Join ${invitedByUsername} on Vercel`;
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Tailwind, { children: (0, jsx_runtime_1.jsxs)(components_1.Body, { className: "mx-auto my-auto bg-white px-2 font-sans", children: [(0, jsx_runtime_1.jsx)(components_1.Preview, { children: previewText }), (0, jsx_runtime_1.jsxs)(components_1.Container, { className: "mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]", children: [(0, jsx_runtime_1.jsx)(components_1.Section, { className: "mt-[32px]", children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: `${baseUrl}/static/vercel-logo.png`, width: "40", height: "37", alt: "Vercel", className: "mx-auto my-0" }) }), (0, jsx_runtime_1.jsxs)(components_1.Heading, { className: "mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black", children: ["Join ", (0, jsx_runtime_1.jsx)("strong", { children: teamName }), " on ", (0, jsx_runtime_1.jsx)("strong", { children: "Vercel" })] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { className: "text-[14px] text-black leading-[24px]", children: ["Hello ", username, ","] }), (0, jsx_runtime_1.jsxs)(components_1.Text, { className: "text-[14px] text-black leading-[24px]", children: [(0, jsx_runtime_1.jsx)("strong", { children: invitedByUsername }), " (", (0, jsx_runtime_1.jsx)(components_1.Link, { href: `mailto:${invitedByEmail}`, className: "text-blue-600 no-underline", children: invitedByEmail }), ") has invited you to the ", (0, jsx_runtime_1.jsx)("strong", { children: teamName }), " team on", ' ', (0, jsx_runtime_1.jsx)("strong", { children: "Vercel" }), "."] }), (0, jsx_runtime_1.jsx)(components_1.Section, { children: (0, jsx_runtime_1.jsxs)(components_1.Row, { children: [(0, jsx_runtime_1.jsx)(components_1.Column, { align: "right", children: (0, jsx_runtime_1.jsx)(components_1.Img, { className: "rounded-full", src: userImage, width: "64", height: "64" }) }), (0, jsx_runtime_1.jsx)(components_1.Column, { align: "center", children: (0, jsx_runtime_1.jsx)(components_1.Img, { src: `${baseUrl}/static/vercel-arrow.png`, width: "12", height: "9", alt: "invited you to" }) }), (0, jsx_runtime_1.jsx)(components_1.Column, { align: "left", children: (0, jsx_runtime_1.jsx)(components_1.Img, { className: "rounded-full", src: teamImage, width: "64", height: "64" }) })] }) }), (0, jsx_runtime_1.jsx)(components_1.Section, { className: "mt-[32px] mb-[32px] text-center", children: (0, jsx_runtime_1.jsx)(components_1.Button, { className: "rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline", href: inviteLink, children: "Join the team" }) }), (0, jsx_runtime_1.jsxs)(components_1.Text, { className: "text-[14px] text-black leading-[24px]", children: ["or copy and paste this URL into your browser:", ' ', (0, jsx_runtime_1.jsx)(components_1.Link, { href: inviteLink, className: "text-blue-600 no-underline", children: inviteLink })] }), (0, jsx_runtime_1.jsx)(components_1.Hr, { className: "mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" }), (0, jsx_runtime_1.jsxs)(components_1.Text, { className: "text-[#666666] text-[12px] leading-[24px]", children: ["This invitation was intended for", ' ', (0, jsx_runtime_1.jsx)("span", { className: "text-black", children: username }), ". This invite was sent from ", (0, jsx_runtime_1.jsx)("span", { className: "text-black", children: inviteFromIp }), ' ', "located in", ' ', (0, jsx_runtime_1.jsx)("span", { className: "text-black", children: inviteFromLocation }), ". If you were not expecting this invitation, you can ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us."] })] })] }) })] }));
};
exports.VercelInviteUserEmail = VercelInviteUserEmail;
exports.VercelInviteUserEmail.PreviewProps = {
    username: 'alanturing',
    userImage: `${baseUrl}/static/vercel-user.png`,
    invitedByUsername: 'Alan',
    invitedByEmail: 'alan.turing@example.com',
    teamName: 'Enigma',
    teamImage: `${baseUrl}/static/vercel-team.png`,
    inviteLink: 'https://vercel.com/teams/invite/foo',
    inviteFromIp: '204.13.186.218',
    inviteFromLocation: 'São Paulo, Brazil',
};
exports.default = exports.VercelInviteUserEmail;
