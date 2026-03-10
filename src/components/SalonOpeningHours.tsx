"use client";

import { SalonDayTiming } from "@/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown } from "react-icons/fi";
import { OpeningHoursTable } from "./OpeningHoursTable";

interface SalonOpeningHoursProps {
  status: string;
  nextTime: string | null;
  salonTiming?: SalonDayTiming[];
}

export const SalonOpeningHours = ({ status, nextTime, salonTiming }: SalonOpeningHoursProps) => {
  const { t } = useTranslation("Home");
  const [isOpen, setIsOpen] = useState(false);

  const hasTiming = salonTiming && salonTiming.length > 0;

  const toggleDropdown = () => {
    if (hasTiming) {
      setIsOpen(!isOpen);
    }
  };

  // Determine color based on status text
  // Note: This relies on the translation matching.
  // Ideally status would be an enum or code, but here we work with the string passed down.
  const isOpened = status === t("Open");
  const isTimingUnavailable = status === t("Timing not available");

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 ${hasTiming ? "cursor-pointer group select-none" : ""}`}
          onClick={toggleDropdown}
        >
          <div className="flex flex-wrap items-center gap-x-2">
            <span
              className={`font-medium ${isOpened ? "text-success" : isTimingUnavailable ? "text-text-secondary-1" : "text-error"}`}
            >
              {status}
            </span>
            {nextTime && (
              <>
                <span className="text-text-secondary-1">•</span>
                <span className="text-text-primary font-light text-sm">{nextTime}</span>
              </>
            )}
          </div>

          {hasTiming && (
            <FiChevronDown
              className={`w-4 h-4 text-text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && hasTiming && (
        <div className="absolute top-full left-10 mt-2 min-w-60 bg-background-primary border border-border-divider rounded-lg shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-100 ">
          <OpeningHoursTable salonTiming={salonTiming} />
        </div>
      )}
    </div>
  );
};
