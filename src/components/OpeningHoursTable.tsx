"use client";

import { SalonDayTiming } from "@/types";
import { useTranslation } from "react-i18next";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type DayKey = (typeof DAYS)[number];

interface OpeningHoursTableProps {
  salonTiming?: SalonDayTiming[];
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (h?: number, m?: number) => (h !== undefined && m !== undefined ? `${h}:${pad(m)}` : "00:00");

export const OpeningHoursTable = ({ salonTiming, className }: OpeningHoursTableProps) => {
  const { t } = useTranslation("Home");

  const currentJsDay = new Date().getDay();

  return (
    <ul className={`flex flex-col gap-2 ${className ?? ""}`}>
      {DAYS.map((dayKey: DayKey, index) => {
        const dayId = index + 1; // 1=Mon … 7=Sun
        const dayTiming = salonTiming?.find((s) => s.open?.day === dayId);

        const timeText =
          dayTiming?.open && dayTiming?.close
            ? `${fmt(dayTiming.open.hour, dayTiming.open.minute)} – ${fmt(dayTiming.close.hour, dayTiming.close.minute)}`
            : t("Closed Status");

        const isToday = currentJsDay === (dayId === 7 ? 0 : dayId);

        return (
          <li
            key={dayKey}
            className={`text-sm flex justify-between items-center gap-6 ${isToday ? "font-semibold text-text-primary" : "font-light text-text-body"}`}
          >
            <span className="whitespace-nowrap min-w-20">{t(dayKey)}</span>
            <span className={`whitespace-nowrap ${!dayTiming?.open ? "text-text-secondary-1" : ""}`}>{timeText}</span>
          </li>
        );
      })}
    </ul>
  );
};
