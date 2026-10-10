import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

const siteUrl = "https://radio7441.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Radio 7441 FM | Community Radio in Malmesbury & West Coast",
  description:
    "Discover Radio 7441 FM, a community radio station based in Malmesbury serving the West Coast District with music, news, cultural programming and community development.",
  keywords: [
    "Radio 7441 FM", "community radio", "Malmesbury", "West Coast District",
    "Western Cape", "isiXhosa radio", "Swartland", "live radio stream",
  ],
  alternates: { canonical: siteUrl },
  icons: { icon: "/radi7441_logo3.png", apple: "/radi7441_logo3.png" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Radio 7441 FM",
    title: "Radio 7441 FM | Community Radio in Malmesbury & West Coast",
    description:
      "Discover Radio 7441 FM, a community radio station based in Malmesbury serving the West Coast District with music, news, cultural programming and community development.",
    locale: "en_ZA",
    images: [{ url: "/radio7441-logo-color.png", alt: "Radio 7441 FM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radio 7441 FM | Community Radio in Malmesbury & West Coast",
    description:
      "Community radio from Malmesbury serving the West Coast District with music, news and cultural programming.",
    images: ["/radio7441-logo-color.png"],
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "RadioStation",
  name: "Radio 7441 FM",
  description:
    "Community radio station based in Malmesbury serving the West Coast District of the Western Cape with music, news, cultural programming and community development.",
  url: siteUrl,
  email: "frontdesk@radio7441fm.co.za",
  telephone: "+27220220000",
  areaServed: "West Coast District, Western Cape, South Africa",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Malmesbury",
    addressRegion: "Western Cape",
    addressCountry: "ZA",
  },
  sameAs: ["https://radio7441fm.co.za"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
