"use client";

import { getSalonStatusAndNextTime, resolveSalonImage } from "@/lib/salonUtils";
import { Salon } from "@/types/schema";
import clsx from "clsx";
import { useTheme } from "next-themes";
import Image from "next/image";
import NextLink from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoStar } from "react-icons/io5";
import { OpeningHoursTable } from "./OpeningHoursTable";

interface SalonCardProps {
  salon: Salon;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon }) => {
  const { t, i18n } = useTranslation("Home");
  const { resolvedTheme } = useTheme();
  const currentLocale = i18n.language;
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const timingRef = useRef<HTMLDivElement>(null);

  // Image Error Handling
  const [imgSrc, setImgSrc] = useState(resolveSalonImage(salon));

  // Reset image if salon changes
  useEffect(() => {
    setImgSrc(resolveSalonImage(salon));
  }, [salon]);

  // Helper to render stars based on rating
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <IoStar key={i} className={clsx("w-3 h-3", i < Math.round(rating) ? "text-text-primary" : "text-text-secondary-2")} />
    ));
  };

  const { status, nextTime } = getSalonStatusAndNextTime(t, salon.salonTiming);

  function handleClickOutside(event: MouseEvent) {
    if (timingRef.current && !timingRef.current.contains(event.target as Node)) {
      setShowDetails(false);
    }
  }

  useEffect(() => {
    console.log(salon);
    if (showDetails) {
      document.addEventListener("mouseup", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [showDetails]);

  const handleTimingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (salon.salonTiming?.length) {
      setShowDetails(!showDetails);
    }
  };

  const shareLocation = () =>
    salon?.location?.coordinates
      ? `https://www.google.com/maps/search/?api=1&query=${salon.location.coordinates[1]},${salon.location.coordinates[0]}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLocation());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="relative group w-full max-w-106 mx-auto md:mx-0">
      <NextLink
        onClick={() => {
          console.log(`Navigating to salon ${salon}`);
        }}
        href={`/${currentLocale}/salon/${salon.id}`}
        className="flex flex-col gap-3 cursor-pointer w-full"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-424/298 bg-gray-100 overflow-hidden">
          <Image
            src={imgSrc}
            onError={() => setImgSrc("/assets/default_salon_image.png")}
            alt={`Image of ${salon.name}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Rating Badge (Top Left) */}
          <div className="absolute top-4 left-4 bg-background-primary/95 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="flex items-center gap-0.5">{renderStars(salon.rating ? salon.rating : 0)}</div>
            <span className="font-geist text-xs text-text-primary font-medium">
              {salon.ratingCount} {t("reviews")}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1.5 mt-1">
          {/* Brand Tag */}
          {salon.brands && salon.brands.length > 0 && (
            <div className="flex items-center gap-2 mb-1 overflow-hidden">
              {salon.brands.slice(0, 3).map((brand, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 border border-brand-primary/30 text-sm font-arpona uppercase tracking-wider text-text-primary group-hover:text-brand-primary bg-brand-primary/10 whitespace-nowrap transition-colors duration-300"
                >
                  {typeof brand === "string" ? brand : brand.name}
                </span>
              ))}
              {salon.brands.length > 3 && (
                <span className="px-2 py-0.5 border border-brand-primary/30 text-sm font-arpona uppercase tracking-wider text-text-secondary-1 group-hover:text-brand-primary bg-brand-primary/10 whitespace-nowrap transition-colors duration-300">
                  +{salon.brands.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Name */}
          <h3 className="font-arpona text-base text-text-primary leading-tight group-hover:underline decoration-1 underline-offset-4 truncate">
            {salon.name}
          </h3>

          {/* Address */}
          <div className="font-geist font-light text-base text-text-primary truncate w-full">{salon.address}</div>

          {/* Status & Time */}
          <div className="relative flex items-center gap-2 mt-1 text-sm z-20">
            <Image
              src={resolvedTheme === "dark" ? "/clock_white.svg" : "/clock_black.svg"}
              width={16}
              height={16}
              alt="clock icon"
              className="w-4 h-4"
            />

            <button
              onClick={handleTimingClick}
              className={`font-medium hover:underline font-arpona text-base text-left ${
                status === t("Open")
                  ? "text-success"
                  : status === t("Timing not available")
                    ? "text-text-secondary-1"
                    : "text-error"
              }`}
            >
              {status}
            </button>

            {nextTime && (
              <>
                <span className="text-text-primary">•</span>
                <span className="text-text-primary truncate font-light">{nextTime}</span>
              </>
            )}

            {/* Timing Dropdown */}
            {showDetails && salon.salonTiming && (
              <div
                ref={timingRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute top-8 left-0 bg-background-primary border border-border-divider shadow-xl z-50 min-w-56 p-4 rounded-md animate-in fade-in zoom-in-95 duration-200"
              >
                <OpeningHoursTable salonTiming={salon.salonTiming} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {/* <div className="flex items-center gap-4 mt-1 border-t border-gray-100 dark:border-gray-800 pt-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${salon.location?.coordinates[1]},${salon.location?.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300"
              title={t("Navigate")}
            >
              <IoNavigateOutline className="w-5 h-5" />
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(true);
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300"
              title={t("Share")}
            >
              <IoShareSocialOutline className="w-5 h-5" />
            </button>
            {salon.website && (
              <a
                href={`https://${salon.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300"
                title={t("Website")}
              >
                <IoGlobeOutline className="w-5 h-5" />
              </a>
            )}
          </div> */}
        </div>
      </NextLink>
    </div>
  );
};

// Old function commented out/removed
// export function getSalonStatus...

// End of SalonCard.tsx
