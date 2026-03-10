import { Salon, SalonDayTiming } from "@/types/schema";
import { TFunction } from "i18next";

/**
 * Parses the English relative time string returned by Google Places API
 * (e.g. "a month ago", "3 days ago") and returns the translated equivalent.
 */
export function translateRelativeTime(raw: string, t: TFunction): string {
  if (!raw) return "";

  const s = raw.trim().toLowerCase();

  if (s === "just now") return t("just now");

  // Singular with article: "a minute ago", "an hour ago", "a day ago" …
  const singularMap: Record<string, string> = {
    "a minute ago": "a minute ago",
    "an hour ago": "an hour ago",
    "a day ago": "a day ago",
    "a week ago": "a week ago",
    "a month ago": "a month ago",
    "a year ago": "a year ago",
  };
  if (singularMap[s]) return t(singularMap[s]);

  // Plural: "3 days ago", "2 months ago" …
  const pluralMatch = s.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/);
  if (pluralMatch) {
    const count = parseInt(pluralMatch[1], 10);
    const unit = pluralMatch[2];
    return t(`{{count}} ${unit}s ago`, { count });
  }

  // Fallback – return as-is
  return raw;
}

export const resolveUrl = (url?: string) => {
  if (!url) return "/assets/default_salon_image.png";
  if (url.startsWith("http") || url.startsWith("/")) return url;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (baseUrl) {
    return `${baseUrl}/${url}`.replace(/([^:]\/)\/+/g, "$1");
  }
  return `/${url}`;
};

export const resolveSalonImage = (salon: Salon) => {
  return resolveUrl(
    salon.logoUrl ?? (salon.photos && salon.photos.length > 0 ? salon.photos[0] : "/assets/default_salon_image.png"),
  );
};

export function getSalonStatusAndNextTime(t: TFunction<"Home" | "translation", undefined>, schedule?: SalonDayTiming[]) {
  // --- Input Validation ---
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return {
      status: t("Timing not available"),
      nextTime: null,
    };
  }

  const now = new Date();
  const jsDay = now.getDay();
  // Backend uses 1=Mon ... 7=Sun. JS uses 0=Sun, 1=Mon...
  const currentBackendDay = jsDay === 0 ? 7 : jsDay;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // --- Helpers ---
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const formatTimeStr = (h: number, m: number) => `${h}:${pad2(m)}`;
  const formatNextTime = (hour: number, minute: number, isOpening: boolean) => {
    const timeStr = formatTimeStr(hour, minute);
    return isOpening ? `${t("Opens at")} ${timeStr}` : `${t("Closes at")} ${timeStr}`;
  };

  // --- 1. Check Yesterday (for overnight shifts ending today) ---
  // If today is Monday(1), yesterday was Sunday(7).
  const yesterdayBackendDay = currentBackendDay === 1 ? 7 : currentBackendDay - 1;
  const yesterdaySchedule = schedule.find((entry) => entry?.open?.day === yesterdayBackendDay);

  if (yesterdaySchedule?.open && yesterdaySchedule?.close) {
    const yCloseDay = yesterdaySchedule.close.day || 0;
    const yCloseH = yesterdaySchedule.close.hour || 0;
    const yCloseM = yesterdaySchedule.close.minute || 0;

    // If yesterday's closing day is TODAY, it's an overnight shift ending today.
    if (yCloseDay === currentBackendDay) {
      const yCloseTime = yCloseH * 60 + yCloseM;
      if (currentTimeInMinutes < yCloseTime) {
        return {
          status: t("Open"),
          nextTime: formatNextTime(yCloseH, yCloseM, false),
        };
      }
    }
  }

  // --- 2. Check Today ---
  const todaySchedule = schedule.find((entry) => entry?.open?.day === currentBackendDay);
  if (todaySchedule?.open && todaySchedule?.close) {
    const openH = todaySchedule.open.hour || 0;
    const openM = todaySchedule.open.minute || 0;
    const closeH = todaySchedule.close.hour || 0;
    const closeM = todaySchedule.close.minute || 0;

    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    const openDay = todaySchedule.open.day || 0;
    const closeDay = todaySchedule.close.day || 0;

    // Case A: Normal Hours (Open & Close same day)
    if (closeDay === openDay) {
      // Open?
      if (currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime) {
        return {
          status: t("Open"),
          nextTime: formatNextTime(closeH, closeM, false),
        };
      }
      // Closed (Before Opening)?
      if (currentTimeInMinutes < openTime) {
        return {
          status: t("Closed Status"),
          nextTime: formatNextTime(openH, openM, true),
        };
      }
      // If Closed (After Closing), we cascade to "Find Next Day"
    }
    // Case B: Overnight Hours (Close Day is different)
    else if (closeDay !== openDay) {
      // If overnight, we just need to be passed Opening Time to be "Open" for the rest of the day
      if (currentTimeInMinutes >= openTime) {
        return {
          status: t("Open"),
          nextTime: formatNextTime(closeH, closeM, false),
        };
      }
      // Before Opening?
      if (currentTimeInMinutes < openTime) {
        return {
          status: t("Closed Status"),
          nextTime: formatNextTime(openH, openM, true),
        };
      }
    }
  }

  // --- 3. Find Next Opening Day ---
  // Search the next 6 days (1 to 6 days ahead)
  for (let d = 1; d <= 7; d++) {
    // Determine the target backend day
    let nextDayVal = currentBackendDay + d;
    if (nextDayVal > 7) nextDayVal = nextDayVal % 7;
    if (nextDayVal === 0) nextDayVal = 7; // Should not happen with % 7 logic if careful, but safe 1-7 wrap:
    // (1+1)=2. (6+1)=7. (7+1)=8 -> 8%7=1. Correct.
    // But if current=7, next=8. 8%7=1. Correct.
    // If current=1, next=2.

    // Simpler math using modulus on 0-based then map back
    // (currentBackendDay - 1 + d) % 7 + 1
    const targetBackendDay = ((currentBackendDay - 1 + d) % 7) + 1;

    const nextSchedule = schedule.find((s) => s.open?.day === targetBackendDay);

    if (nextSchedule?.open) {
      const nextH = nextSchedule.open.hour || 0;
      const nextM = nextSchedule.open.minute || 0;

      return {
        status: t("Closed Status"),
        nextTime: formatNextTime(nextH, nextM, true),
      };
    }
  }

  return { status: t("Closed Status"), nextTime: null };
}
