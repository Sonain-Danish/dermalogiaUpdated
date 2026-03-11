/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";

export function StringtoSentence(str: string): string {
  if (!str) return ""; // Handle null or empty input

  let result = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (i > 0 && char.toUpperCase() === char && str[i - 1].toLowerCase() === str[i - 1]) {
      //Check if current char is uppercase and previous is lowercase
      result += " ";
    }
    result += char;
  }
  return result.trim();
}

export function apiAddID(baseAPI: string, id: string) {
  return baseAPI + "/" + id;
}

export function apiReplaceID(baseAPI: string, id: string) {
  return baseAPI.replace(":id", id);
}

export function salonLogoUrlResolver(url?: string) {
  if (!url || url == "") {
    return "/images/image.png";
  }

  if (url.includes("uploads/")) {
    return process.env.NEXT_PUBLIC_API_BASE_URL + "/" + url;
  }

  return url;
}

// Function to copy text to clipboard
export const copyToClipboard: (text: string) => Promise<boolean> = async (text: string) => {
  const parentMessage = {
    type: "copyToClipboard",
    payload: text,
  };
  window.parent.postMessage(parentMessage, "*");
  await navigator.clipboard.writeText(text);

  return true;
};

export function setParam(
  router: AppRouterInstance,
  searchParams: ReadonlyURLSearchParams,
  pathName: string,
  key: string,
  value: string,
  deleteIf: boolean
) {
  const params = new URLSearchParams(searchParams);

  if (deleteIf) {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  router.push(`${pathName}?${params.toString()}`);
}

export function convertTo24HourRange(locale: string | undefined, timeRange: string) {
  if ((locale != "sk" && locale != "cs") || (!timeRange.includes("AM") && !timeRange.includes("PM"))) {
    return timeRange; // If no range, return as is
  }

  console.log("Converting time range to 24-hour format:", timeRange);
  // Example input: "9:00 AM – 6:00 PM"
  const [start, end] = timeRange.split("–").map((s) => s.trim());

  return `${to24Hour(start)}-${to24Hour(end)}`;
}

function to24Hour(t: string) {
  const [time, modifier] = t.split(/\s+/); // splits "9:00" and "AM"
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
