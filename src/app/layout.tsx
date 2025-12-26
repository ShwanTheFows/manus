import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qmed - Plateforme d'Excellence en Médecine, alimentée par l'IA",
  description: "Qmed vous aide à vous préparer gratuitement aux examens médicaux grâce à des QCM intelligents alimentés par l'IA. Profitez de contenu de qualité, personnalisé et adapté à votre programme pour maximiser votre réussite académique.",
  openGraph: {
    title: "Qmed - Votre Partenaire d'Excellence en Médecine, alimenté par l'IA",
    description: "Qmed vous aide à vous préparer gratuitement aux examens médicaux grâce à des QCM personnalisés et alimentés par l'IA. Préparez-vous efficacement avec des tests adaptés à votre programme et bénéficiez d'une expérience d'apprentissage de qualité.",
    url: "/", // Laisser générique pour ne pas dépendre d'un domaine spécifique
    siteName: "Qmed",
    images: [
      {
        url: "/imgs/layout.jpg", // Utilisation d'un chemin relatif
        width: 1200,
        height: 630,
        alt: "Qmed - Préparation en médecine avec des QCM intelligents alimentés par l'IA"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qmed - Votre Partenaire d'Excellence en Médecine, alimenté par l'IA",
    description: "Préparez-vous gratuitement aux examens médicaux avec Qmed, votre plateforme d'apprentissage alimentée par l'IA, pour des QCM adaptés et personnalisés.",
    creator: "@Qmed",
    images: "/imgs/layout.jpg" // Chemin relatif pour Twitter également
  },
  alternates: {
    canonical: "/" // Garde l'URL relative
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* SEO & OpenGraph Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Qmed Team" />
        <meta name="keywords" content="QCM médecine, préparation examens, intelligence artificielle, plateforme médicale" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Qmed - Votre Partenaire d'Excellence en Médecine, alimenté par l'IA" />
        <meta property="og:description" content="Qmed vous aide à vous préparer gratuitement aux examens médicaux grâce à des QCM intelligents alimentés par l'IA." />
        <meta property="og:image" content="/imgs/layout.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Qmed - Votre Partenaire d'Excellence en Médecine, alimenté par l'IA" />
        <meta name="twitter:description" content="Préparez-vous gratuitement aux examens médicaux avec Qmed, votre plateforme d'apprentissage alimentée par l'IA." />
        <meta name="twitter:image" content="/imgs/layout.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="/" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
