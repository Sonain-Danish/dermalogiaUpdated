"use client";

import { Pagination } from "@/components/Pagination";
import { SalonCard } from "@/components/SalonCard";
import { useSalonsData } from "@/lib/hooks/useSalonData";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronForward } from "react-icons/io5";

export default function Home() {
  const { t } = useTranslation("Home");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale;

  const { isLoading, filteredSalons, searchTerm, brandTerm } = useSalonsData();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const salonGridRef = useRef<HTMLDivElement>(null);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setLimit(9);
  }, [searchTerm, brandTerm]);

  const total = filteredSalons.length;
  const offset = (page - 1) * limit;
  const currentSalons = filteredSalons.slice(offset, offset + limit);
  const currentTotalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setLimit(9);
    if (salonGridRef.current) {
      const headerOffset = 100;
      const elementPosition = salonGridRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 9);
  };

  const handleShowMap = () => {
    const currentQuery = searchParams.toString();
    router.push(`/${locale}/map${currentQuery ? `?${currentQuery}` : ""}`);
  };

  const iframeScrollToTop = () => {
    window.parent.postMessage({ type: "scrollToTop" }, "*");
  };

  useEffect(() => {
    iframeScrollToTop();
  }, [page]);

  return (
    <section className="container mx-auto px-4 mt-34 md:mt-30 mb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10">
        <h2 className="font-helvetica text-2xl md:text-[32px] font-light uppercase text-text-primary">
          {t("Partner Salons")}
        </h2>
        <button
          onClick={handleShowMap}
          className="flex items-center  gap-2 text-text-primary font-helvetica uppercase text-sm md:text-base group cursor-pointer hover:text-brand-primary hover:border-b-brand-primary duration-300 border-b border-text-primary pb-0.5"
        >
          {t("Show Map")}
          <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid / Skeleton / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 animate-pulse">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-full aspect-424/298 bg-gray-200" />
              <div className="h-4 bg-gray-200 w-3/4" />
              <div className="h-3 bg-gray-200 w-1/2" />
            </div>
          ))}
        </div>
      ) : currentSalons.length > 0 ? (
        <div
          ref={salonGridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 transition-opacity duration-300"
        >
          {currentSalons.map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-secondary-1 font-helvetica">{t("No Salons Found!")}</div>
      )}

      {/* Load More */}
      {currentSalons.length < total && limit < total && (
        <div className="flex justify-center mt-12">
          <button
            className="font-helvetica font-medium text-base border tracking-[1px] border-text-primary text-text-primary px-20 py-3 uppercase hover:bg-text-primary hover:text-background-primary transition-colors cursor-pointer"
            onClick={handleLoadMore}
          >
            {t("LOAD MORE")}
          </button>
        </div>
      )}

      {currentTotalPages > 1 && (
        <Pagination currentPage={page} totalPages={currentTotalPages} onPageChange={handlePageChange} />
      )}
    </section>
  );
}
