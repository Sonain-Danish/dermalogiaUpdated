"use client";

import { HeroSection } from "@/components/HeroSection";
import { useTranslation } from "react-i18next";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("Home");

  return (
    <div className="bg-background-primary pb-20">
      {/* Breadcrumbs */}
      {/* <div className="bg-background-secondary py-3 border-b border-border-divider">
        <div className="container mx-auto px-4 text-sm font-arpona flex items-center gap-2">
          <span className="text-text-primary">{t("breadcrumbs.home", "Home")}</span>
          <span className="text-text-secondary-1">/</span>
          <span className="text-text-secondary-1">{t("breadcrumbs.salons", "Salons")}</span>
        </div>
      </div> */}

      {/* Hero — mounted once, shared between list & map */}
      <HeroSection />

      {children}
    </div>
  );
}
