import type { Metadata } from "next";
// eslint-disable-next-line camelcase
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-spaceGrotesk",
});

export const metadata: Metadata = {
    title: "DevFlow",
    description: "Stack Overflow based app",
    icons: {
        icon: "/assets/images/site-logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            appearance={{
                elements: {
                    formButtonPrimary: 'primary-gradient',
                    footerActionLink: 'primary-text-gradient hover:text-primary-500',
                },
            }}
        >
            <html lang="en">
                <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
                    <h1 className="h1-bold">this is a new H1</h1>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
