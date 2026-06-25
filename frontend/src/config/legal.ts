// ─── Legal page content ─────────────────────────────────────────────────────
// Plain-data definitions for the Terms of Service and Privacy Policy pages.
// Kept here so the page components stay presentational and the copy is easy to
// review and revise without touching JSX.

export interface LegalSection {
  /** Stable id used for the in-page anchor / table of contents. */
  id: string;
  heading: string;
  /** Each entry is rendered as a paragraph. */
  paragraphs?: string[];
  /** Optional bulleted list rendered after the paragraphs. */
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  /** Short line under the title. */
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

// The date the documents were last revised. Update when copy changes.
export const LEGAL_LAST_UPDATED = "June 25, 2026";

// A single point of contact referenced across both documents.
export const LEGAL_CONTACT_EMAIL = "support@nearly.app";

// ─── Terms of Service ───────────────────────────────────────────────────────

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  intro:
    "These terms govern your use of Nearly — the hyperlocal marketplace that connects homeowners with verified local service professionals.",
  lastUpdated: LEGAL_LAST_UPDATED,
  sections: [
    {
      id: "acceptance",
      heading: "1. Acceptance of these terms",
      paragraphs: [
        "Nearly (\"Nearly\", \"we\", \"us\", or \"our\") operates an online platform that helps homeowners (\"Customers\") discover, book, and pay verified local service professionals (\"Providers\") for home services such as plumbing, electrical work, and cleaning.",
        "By creating an account, browsing listings, booking a service, or otherwise using the platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use Nearly.",
        "You must be at least 18 years old and able to form a legally binding contract to use Nearly.",
      ],
    },
    {
      id: "marketplace-role",
      heading: "2. Our role as a marketplace",
      paragraphs: [
        "Nearly is a neutral marketplace. We provide the technology that lets Customers and Providers find each other, agree on work, communicate, and transact. We are not a party to the service agreement between a Customer and a Provider, and we do not ourselves perform any home services.",
        "Providers are independent professionals, not employees, agents, or contractors of Nearly. While we verify Provider identity and documents during onboarding, we do not guarantee the quality, safety, legality, or outcome of any work performed.",
      ],
    },
    {
      id: "accounts",
      heading: "3. Accounts and eligibility",
      paragraphs: [
        "To book or offer services you must register for an account and choose a role — Customer or Provider. You agree to provide accurate, current, and complete information and to keep it up to date.",
        "You are responsible for safeguarding your login credentials and for all activity that occurs under your account. Notify us promptly if you suspect any unauthorized use.",
      ],
      bullets: [
        "Providers must complete profile setup, including service categories, service area, hourly rate, and verification documents, before their listing can be approved.",
        "Provider accounts are reviewed by our team and may be approved or rejected at our discretion.",
        "We may suspend or terminate accounts that violate these terms or that we reasonably believe pose a risk to the community.",
      ],
    },
    {
      id: "bookings",
      heading: "4. Bookings and service delivery",
      paragraphs: [
        "Customers may request a service by selecting a Provider, date, time, address, and optional notes or photos. A booking moves through a transparent lifecycle: Requested, Confirmed, In Progress, and Completed.",
        "Providers may accept or reject incoming requests and are expected to update job progress honestly and promptly. A booking is only a binding engagement between the Customer and Provider once the Provider confirms it.",
        "You agree to communicate respectfully and to provide safe, lawful, and reasonable working conditions. Any agreement on scope, schedule, or price beyond what is captured in the platform is between the Customer and Provider directly.",
      ],
    },
    {
      id: "payments",
      heading: "5. Payments, pricing, and fees",
      paragraphs: [
        "Pricing for a booking is based on the Provider's stated rate and the agreed scope of work. Customers pay for completed jobs through our payment partner, Razorpay. Payments are confirmed using cryptographic signature verification, so a payment cannot be marked successful unless it genuinely cleared.",
        "Nearly may charge service or platform fees, which will be disclosed before you confirm a payment. Unless required by law, payments are processed in the currency shown at checkout and you are responsible for any applicable taxes.",
        "We do not store your full card or banking details; these are handled by our PCI-compliant payment processor. Refunds, where applicable, are handled in line with our cancellation guidance and the agreement between the Customer and Provider.",
      ],
    },
    {
      id: "reviews",
      heading: "6. Reviews and content",
      paragraphs: [
        "After a job is paid, a Customer may leave one review per booking. Reviews must be honest, based on a genuine experience, and free of unlawful, abusive, or misleading content.",
        "You retain ownership of the content you submit — including reviews, photos, and profile information — but you grant Nearly a worldwide, royalty-free license to host, display, and use that content to operate and promote the platform.",
        "We may moderate, flag, or remove content that violates these terms, and our admins may review or remove listings and reviews to keep the marketplace trustworthy.",
      ],
    },
    {
      id: "conduct",
      heading: "7. Acceptable use",
      paragraphs: [
        "You agree not to misuse the platform. In particular, you may not:",
      ],
      bullets: [
        "Circumvent the platform to avoid fees or evade safety and verification measures.",
        "Post false, fraudulent, infringing, or harmful content, or impersonate another person.",
        "Attempt to access accounts, data, or systems you are not authorized to use.",
        "Scrape, reverse engineer, or disrupt the platform or its infrastructure.",
        "Use Nearly for any unlawful, discriminatory, or unsafe purpose.",
      ],
    },
    {
      id: "disclaimers",
      heading: "8. Disclaimers and limitation of liability",
      paragraphs: [
        "Nearly is provided on an \"as is\" and \"as available\" basis. To the maximum extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose and the quality or outcome of any service booked through the platform.",
        "Because the service relationship is between Customers and Providers, Nearly is not liable for the acts, omissions, or work of any Provider or the conduct of any Customer. To the extent permitted by law, our total liability arising from your use of the platform is limited to the fees you paid to Nearly in the three months preceding the claim.",
      ],
    },
    {
      id: "termination",
      heading: "9. Suspension and termination",
      paragraphs: [
        "You may stop using Nearly at any time. We may suspend or terminate your access if you breach these terms, create risk to others, or as required by law. Provisions that by their nature should survive termination — including payment obligations, disclaimers, and limitations of liability — will continue to apply.",
      ],
    },
    {
      id: "changes",
      heading: "10. Changes to these terms",
      paragraphs: [
        "We may update these terms from time to time. When we make material changes, we will update the \"last updated\" date and, where appropriate, notify you in the app. Your continued use of Nearly after changes take effect means you accept the revised terms.",
      ],
    },
    {
      id: "contact",
      heading: "11. Contact us",
      paragraphs: [
        `If you have questions about these terms, reach us at ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

// ─── Privacy Policy ─────────────────────────────────────────────────────────

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  intro:
    "This policy explains what information Nearly collects, how we use it, and the choices you have when using our home-services marketplace.",
  lastUpdated: LEGAL_LAST_UPDATED,
  sections: [
    {
      id: "overview",
      heading: "1. Overview",
      paragraphs: [
        "Nearly (\"we\", \"us\", or \"our\") respects your privacy. This policy describes how we collect, use, share, and protect personal information when you use our platform as a Customer, Provider, or visitor.",
        "By using Nearly, you agree to the practices described here. If you do not agree, please do not use the platform.",
      ],
    },
    {
      id: "information-we-collect",
      heading: "2. Information we collect",
      paragraphs: [
        "We collect information you provide directly, information generated as you use the platform, and information from the partners who help us operate it.",
      ],
      bullets: [
        "Account information: name, email address, password, and your chosen role (Customer or Provider).",
        "Provider details: bio, city and service area, hourly rate, service categories, cover photo, and verification documents.",
        "Booking information: service address, date and time, notes, and photos you attach to a booking or work update.",
        "Payment information: transaction records and confirmation data from Razorpay. We do not store full card or bank account numbers.",
        "Reviews and ratings you submit or receive.",
        "Technical data: device, browser, IP address, and usage activity such as pages viewed and actions taken.",
        "Communications: messages you send through in-app chat and any support requests.",
      ],
    },
    {
      id: "how-we-use",
      heading: "3. How we use your information",
      bullets: [
        "To create and manage your account and authenticate your sessions.",
        "To enable bookings, match Customers with Providers, and show relevant listings near you.",
        "To process payments and verify their authenticity.",
        "To power real-time features such as booking timelines, chat, and notifications.",
        "To moderate reviews and provider applications and keep the marketplace safe and trustworthy.",
        "To provide support, respond to your requests, and send service-related communications.",
        "To detect, prevent, and address fraud, abuse, and security issues.",
        "To comply with legal obligations and enforce our terms.",
      ],
    },
    {
      id: "sharing",
      heading: "4. How we share information",
      paragraphs: [
        "We share information only as needed to operate the platform. We do not sell your personal information.",
      ],
      bullets: [
        "Between Customers and Providers: when you book or accept a job, we share the details needed to deliver it — such as name, service address, booking notes, and attached photos.",
        "Service providers: we use trusted partners to run Nearly, including Razorpay (payments), Cloudinary (image hosting), Neon and PostgreSQL hosting (database), Railway (backend hosting), and Vercel (frontend hosting).",
        "Legal and safety: we may disclose information to comply with the law, enforce our terms, or protect the rights, property, and safety of our users and the public.",
        "Business transfers: information may be transferred as part of a merger, acquisition, or sale of assets, subject to this policy.",
      ],
    },
    {
      id: "image-uploads",
      heading: "5. Images and uploaded files",
      paragraphs: [
        "Photos you upload — including provider cover photos, booking attachments, and work-update images — are stored with our image partner, Cloudinary, rather than on our core servers. Only share images you have the right to share, and avoid including sensitive personal information in them.",
      ],
    },
    {
      id: "cookies",
      heading: "6. Cookies and sessions",
      paragraphs: [
        "We use cookies and similar technologies, primarily to keep you signed in through secure session cookies and to remember your preferences. Disabling essential cookies may prevent parts of the platform from working.",
      ],
    },
    {
      id: "retention",
      heading: "7. Data retention",
      paragraphs: [
        "We keep personal information for as long as your account is active and for as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we delete or anonymize it.",
      ],
    },
    {
      id: "security",
      heading: "8. Security",
      paragraphs: [
        "We use technical and organizational safeguards to protect your information, including encrypted connections, role-based access controls on every endpoint, and signature verification for payments. No system is perfectly secure, so we cannot guarantee absolute security, but we work to protect your data and to respond promptly to incidents.",
      ],
    },
    {
      id: "your-rights",
      heading: "9. Your rights and choices",
      paragraphs: [
        "Depending on where you live, you may have rights over your personal information.",
      ],
      bullets: [
        "Access, correct, or update your account and profile information at any time from within the app.",
        "Request a copy or deletion of your personal information, subject to legal limits.",
        "Object to or restrict certain processing, and withdraw consent where processing is based on consent.",
        "Manage notification preferences for non-essential communications.",
      ],
    },
    {
      id: "children",
      heading: "10. Children's privacy",
      paragraphs: [
        "Nearly is not intended for anyone under 18, and we do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will take appropriate steps to remove it.",
      ],
    },
    {
      id: "changes",
      heading: "11. Changes to this policy",
      paragraphs: [
        "We may update this policy as our service evolves. We will revise the \"last updated\" date and, for material changes, provide additional notice where appropriate. Your continued use of Nearly after changes take effect means you accept the updated policy.",
      ],
    },
    {
      id: "contact",
      heading: "12. Contact us",
      paragraphs: [
        `If you have questions about this policy or your data, contact us at ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};
