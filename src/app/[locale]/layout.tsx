import HeightProvider from "@/components/iframe/HeightProvider";
import TranslationsProvider from "@/components/TranslationsProvider";
import { FilterProvider } from "@/context/FilterContext";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Removed unused localFont if not used or keep it
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import "../globals.css";
import initTranslations from "../i18n";

const arpona = localFont({
  src: [
    {
      path: "../fonts/ArponaLight.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/ArponaRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ArponaMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/ArponaSemoBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/ArponaBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-arpona",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salon Locator",
  description: "Find the best salons near you.",
};

const i18nNamespaces = ["Common", "Home", "Toasts"];

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${arpona.variable} antialiased bg-background-primary text-text-primary`}
      >
        <HeightProvider>
          <NextTopLoader color="#AA8232" showSpinner={false} />
          <ReactQueryProvider>
            <Suspense fallback={null}>
              <FilterProvider>
                {/* Added storageKey to reset any stuck preferences and ensure system theme is respected */}
                <ThemeProvider
                  attribute="data-theme"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                  storageKey="salon-theme-v1"
                >
                  <TranslationsProvider locale={locale} namespaces={i18nNamespaces} resources={resources}>
                    <div className="flex flex-col font-sans">
                      {/* <NavBar /> */}
                      <main>{children}</main>
                    </div>
                    <Toaster position="top-right" />
                  </TranslationsProvider>
                </ThemeProvider>
              </FilterProvider>
            </Suspense>
          </ReactQueryProvider>
        </HeightProvider>
      </body>
    </html>
  );
}
