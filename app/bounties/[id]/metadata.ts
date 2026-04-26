import type { Metadata } from "next";

interface GenerateMetadataProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { id } = await params;

  // Fetch bounty data for OG image
  // Note: In production, you'd fetch from your API/database
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustera.app";

  // Default OG image with bounty ID (the API will fetch actual data)
  const ogImageUrl = `${baseUrl}/api/og?bountyId=${id}`;

  return {
    title: "TRUSTERA | BOUNTY DETAILS",
    description: "View bounty details and submit your work on Trustera",
    openGraph: {
      title: "TRUSTERA | ONCHAIN BOUNTY",
      description: "Hunt this bounty and get paid onchain on Trustera",
      url: `${baseUrl}/bounties/${id}`,
      siteName: "Trustera",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Trustera Bounty",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "TRUSTERA | ONCHAIN BOUNTY",
      description: "Hunt this bounty and get paid onchain on Trustera",
      images: [ogImageUrl],
      creator: "@maaztwts",
    },
  };
}
