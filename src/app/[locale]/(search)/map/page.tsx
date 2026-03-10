"use client";

import { MapSection } from "@/components/MapSection";
import { useSalonsData } from "@/lib/hooks/useSalonData";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoChevronForward } from "react-icons/io5";

export default function MapPage() {
  const { t } = useTranslation("Home");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale;

  const { isLoading, filteredSalons } = useSalonsData();

  const handleShowList = () => {
    const currentQuery = searchParams.toString();
    router.push(`/${locale}${currentQuery ? `?${currentQuery}` : ""}`);
  };

  return (
    <div className="container mx-auto px-4 mt-34 md:mt-30 relative z-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10">
        <h2 className="font-helvetica text-2xl md:text-[32px] font-light uppercase text-text-primary">{t("MAP")}</h2>
        <button
          onClick={handleShowList}
          className="flex items-center  gap-2 text-text-primary font-helvetica uppercase text-sm md:text-base group cursor-pointer hover:text-brand-primary hover:border-b-brand-primary duration-300 border-b border-text-primary pb-0.5"
        >
          {t("SHOW LIST")}
          <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Map */}
      {isLoading ? (
        <div className="w-full h-179.5 bg-background-secondary animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-text-secondary-1">{t("Loading")}</div>
        </div>
      ) : filteredSalons.length === 0 ? (
        <div className="w-full h-179.5 bg-background-secondary rounded-lg flex flex-col items-center justify-center p-4">
          <div className="text-error font-helvetica text-xl mb-2">{t("No Salons Found!")}</div>
          <div className="text-text-secondary-1 text-center text-sm">{t("No Salons Found!")}</div>
        </div>
      ) : (
        <MapSection salons={filteredSalons} />
      )}
    </div>
  );
}
