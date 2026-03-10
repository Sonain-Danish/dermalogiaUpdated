"use client";

import { ShareDialog } from "@/components/ShareDialog";
import { Salon } from "@/types";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiCalendar, FiGlobe, FiPhone, FiShare } from "react-icons/fi";

interface SalonActionButtonsProps {
  salon: Salon;
}

export const SalonActionButtons = ({ salon }: SalonActionButtonsProps) => {
  const { t } = useTranslation("Home");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    let url = window.location.href;
    if (salon.placeUrl) {
      url = salon.placeUrl;
    } else if (salon.placeId) {
      url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${salon.placeId}`;
    } else if (salon.location && salon.location.coordinates) {
      const [lng, lat] = salon.location.coordinates;
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    setShareUrl(url);
  }, [salon]);

  const handleWebsiteClick = (url?: string) => {
    if (url) {
      // Ensure absolute URL
      const target = url.startsWith("http") ? url : `https://${url}`;
      window.open(target, "_blank");
    } else {
      toast.error(t("Website not available"));
    }
  };

  const handleReservationClick = () => {
    const link = salon.reservationLink || salon.website;
    handleWebsiteClick(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(t("Link copied"));
  };

  const shareText = `Check out this location: ${salon.name}`;

  return (
    <>
      <Toaster position="bottom-center" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {/* Reservation Button - Black */}
        <button
          onClick={handleReservationClick}
          className="bg-cta-bg text-cta-text rounded-sm h-10 flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity hover:cursor-pointer hover:bg-brand-primary duration-300  uppercase tracking-wider text-sm px-1"
        >
          <FiCalendar className="w-3.5 h-3.5" />
          <span className="">{t("Reservation")}</span>
        </button>

        {/* Call Button - White */}
        <a
          href={`tel:${salon.phone}`}
          className="bg-background-primary rounded-sm border border-bta-bg text-text-primary h-10 flex items-center justify-center gap-2 font-medium hover:bg-background-secondary transition-colors  uppercase tracking-wider text-sm px-1"
        >
          <FiPhone className="w-3.5 h-3.5" />
          <span className="">{t("Call")}</span>
        </a>

        {/* Web Button - White */}
        <button
          onClick={() => handleWebsiteClick(salon.website)}
          className="bg-background-primary rounded-sm border border-bta-bg text-text-primary h-10 flex items-center justify-center gap-2 font-medium hover:bg-background-secondary transition-colors hover:cursor-pointer  uppercase tracking-wider text-sm px-1"
        >
          <FiGlobe className="w-3.5 h-3.5" />
          <span className="">{t("Web")}</span>
        </button>

        {/* Share Button - White */}
        <button
          onClick={() => setShowShareDialog(true)}
          className="bg-background-primary rounded-sm border border-bta-bg text-text-primary h-10 flex items-center justify-center gap-2 font-medium hover:bg-background-secondary transition-colors hover:cursor-pointer uppercase tracking-wider text-sm px-1"
        >
          <FiShare className="w-3.5 h-3.5" />
          <span className="">{t("Share")}</span>
        </button>
      </div>

      <ShareDialog salon={salon} isOpen={showShareDialog} onClose={() => setShowShareDialog(false)} url={shareUrl} />
    </>
  );
};
