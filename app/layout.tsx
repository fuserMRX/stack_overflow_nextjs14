import type { Metadata } from 'next';
// eslint-disable-next-line camelcase
import { Inter, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import './globals.css';
import '@/styles/prism.css';
import { ThemeProvider } from 'next-themes';

const inter = Inter({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-spaceGrotesk',
});

export const metadata: Metadata = {
    title: 'Dev Solutions',
    description: 'Stack Overflow based app',
    icons: {
        icon: '/assets/images/site-logo.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
                <ClerkProvider
                    appearance={{
                        elements: {
                            formButtonPrimary: 'primary-gradient',
                            footerActionLink:
                                'primary-text-gradient hover:text-primary-500',
                        },
                    }}
                >
                    <ThemeProvider
                        attribute='class'
                        defaultTheme='system'
                        enableSystem={true}
                    >
                        {children}
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
