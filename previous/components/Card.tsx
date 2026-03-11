"use client";
import i18nConfig from "@/i18nConfig";
import { convertTo24HourRange, copyToClipboard, salonLogoUrlResolver } from "@/utils/Funtions";
import { Salon, SalonDayTiming } from "@/utils/models/schema-prisma";
import { TFunction } from "i18next";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdOutlineDone } from "react-icons/md";
import SalonRatings from "./SalonRating";

export default function Card({ salon }: { salon: Salon }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { t } = useTranslation();
  const { resolvedTheme, forcedTheme, themes, systemTheme, theme } = useTheme();
  const isDarkTheme = forcedTheme ? forcedTheme == "dark" : resolvedTheme == "dark";
  const timingRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const pathname = usePathname();
  const locale = i18nConfig.locales.find((loc) => pathname.startsWith(`/${loc}`)); // Extract locale prefix if present

  const formatTime = (time: string) => {
    const hours = parseInt(time.substring(0, 2));
    const minutes = time.substring(2);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 === 0 ? 12 : hours % 12; // Convert 24-hour to 12-hour format
    return `${formattedHour}:${minutes} ${period}`;
  };

  const closeModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    // console.log("=====isDarkTheme=====", isDarkTheme);
    // console.log(getSalonStatus(t, salon.salonTiming));
    if (getSalonStatus(t, salon.salonTiming) == "Closed Now") {
      console.log("=====Close=======");
    }
  }, []);

  const shareLocation = () =>
    salon?.placeUrl ??
    `https://www.google.com/maps/search/?api=1&query=${salon?.location?.coordinates[1]},${salon?.location?.coordinates[0]}`;

  function handleClickOutside(event: MouseEvent) {
    console.log("Event Listener triggered for click outside");
    if (timingRef.current && !timingRef.current.contains(event.target as Node)) {
      setShowDetails(false);
    }
  }

  useEffect(() => {
    if (showDetails) {
      document.addEventListener("mouseup", handleClickOutside);
      console.log("Event Listener added for click outside");
    }

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
      console.log("Event Listener removed for click outside");
    };
  }, [showDetails]);

  return (
    <div className="border-b border-b-gray-300">
      <div className="absolute">
        {showModal && (
          <div className="bg-white z-10 relative rounded-md shadow-lg mx-auto text-primary-text p-4 w-[60vw] md:max-w-[460px] left-[15vw] md:left-[30vw] top-30 md:top-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">{t("Share Location")}</h2>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-800">
                ✖
              </button>
            </div>
            <p className="mt-4">
              {t("Share the location of")} <b>{salon.name}</b> {t("with others")}.
            </p>
            <div className=" flex flex-col md:flex-row  gap-4 mt-4">
              <button
                className="px-4 py-2 bg-primary-grey rounded-lg text-white "
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `Check out this location: ${salon.name}, ${shareLocation()}`
                    )}`,
                    "_blank"
                  )
                }
              >
                WhatsApp
              </button>
              <button
                className="px-4 py-2 bg-primary-grey rounded-lg text-white "
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${shareLocation()}`)}`,
                    "_blank"
                  )
                }
              >
                Facebook
              </button>

              <button
                className={`px-4 py-2 ${
                  copiedLink ? "bg-green-600" : "bg-primary-grey"
                } rounded-lg duration-300 text-white flex items-center justify-center`}
                onClick={() => {
                  setCopiedLink(true);
                  setTimeout(() => {
                    setCopiedLink(false);
                  }, 3000);

                  copyToClipboard(`${shareLocation()}`).then(() => {
                    toast.success("Location link copied to clipboard!");
                  });
                }}
              >
                <div
                  className={` ${
                    copiedLink ? "max-w-full opacity-100 " : "max-w-0 opacity-0"
                  } transition-all duration-300 flex`}
                >
                  <MdOutlineDone />
                  <div className="w-2 " />
                </div>
                {t("Copy Link")}
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className={`${
          showModal ? "pointer-events-none opacity-20 blur bg-black/20" : ""
        } custom-md:flex  custom-md:flex-row custom-md:justify-around gap-5 custom-md:gap-10 flex flex-col-reverse w-full items-start  pb-5 mt-5 `}
      >
        {/* Image Section */}
        <div className="flex justify-center md:flex-shrink-0 dark:rounded-lg w-full custom-md:w-auto">
          <div className="relative lg:w-[420px] custom-md:w-[350px] w-full md:max-w-none md:h-[250px] h-[250px] overflow-hidden bg-white">
            <Image
              src={salonLogoUrlResolver(salon.logoUrl)}
              alt={`Image of ${salon.name}`}
              // layout="fill"
              fill
              sizes="100vh"
              className="sm:object-contain object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col flex-grow gap-2.5  ">
          <div
            className={`font-arpona leading-none tracking-[1px] text-lg ${
              isDarkTheme ? "text-white" : "text-primary-grey"
            }`}
          >
            {salon.name}
          </div>

          <div className="lg:grid xl:grid-cols-12 md:flex md:flex-col grid-cols-1 gap-4 text-primary-grey ">
            {/* Salon Info Section */}
            <div className="flex flex-col gap-3 lg:col-span-6 ">
              <SalonRatings
                rating={salon.rating}
                ratingCount={salon.ratingCount}
                color={salon.brands?.some((b) => b.name === "Salon Online") ? "#AA8232" : undefined}
              />

              <div className="flex gap-2 sm:items-start items-center">
                <Image
                  src={isDarkTheme ? "/location_dark.svg" : "/location.svg"}
                  width={24}
                  height={24}
                  alt="Location icon"
                />
                {/* <div className={`flex flex-wrap text-start gap-x-1  ${isDarkTheme ? "text-white" : "text-primary-grey"}`}>
                  {(salon.address ?? "").split(",").map((part, idx, arr) => (
                    <span key={idx} className="whitespace-nowrap">
                      {part.trim()}
                      {idx < arr.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div> */}
                <div className="flex flex-col text-start">
                  {(() => {
                    const address = salon.address ?? "";
                    const postcodeRegex = /\b\d{3}\s?\d{2}\b/;
                    const match = address.match(postcodeRegex);

                    if (match && match.index !== undefined) {
                      const firstPart = address.substring(0, match.index).trim();
                      const secondPart = address.substring(match.index).trim();
                      // Remove trailing comma from first part if exists
                      const cleanFirstPart = firstPart.endsWith(",") ? firstPart.slice(0, -1) : firstPart;

                      return (
                        <>
                          <div>{cleanFirstPart}</div>
                          <div>{secondPart}</div>
                        </>
                      );
                    }

                    // Fallback if no postcode found
                    return <div>{address}</div>;
                  })()}
                </div>
              </div>
              <div className="flex gap-6 items-center">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${salon.location?.coordinates[1]},${salon.location?.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={isDarkTheme ? "/directions_dark.svg" : "/directions.svg"}
                    width={36}
                    height={36}
                    alt="Directions icon"
                    className="cursor-pointer"
                  />
                </a>

                <Image
                  src={isDarkTheme ? "/share_dark.svg" : "/share.svg"}
                  width={36}
                  height={36}
                  alt="Share icon"
                  onClick={closeModal}
                  className="cursor-pointer"
                />

                {typeof salon.website == "string" && salon.website != "" ? (
                  <a
                    href={salon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-link hover:underline"
                  >
                    <Image
                      src={isDarkTheme ? "/Globe_dark.svg" : "/Globe.svg"}
                      width={40}
                      height={40}
                      alt="Share icon"
                      onClick={closeModal}
                      className="cursor-pointer"
                    />
                  </a>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex md:flex-row lg:grid lg:grid-cols-2 lg:col-span-6 lg:items-start md:mt-0 mt-3">
              {/* Additional Info Section */}
              <div className="flex flex-col gap-3 lg:col-span-1 min-w-[180px]">
                {/* Salon Timing */}
                {showSalonStatus(salon.salonTiming) && (
                  <div className="flex gap-2">
                    <Image
                      src={isDarkTheme ? "/clock_dark.svg" : "/clock.svg"}
                      // className="mt-1"
                      width={20}
                      height={20}
                      alt="Clock icon"
                    />
                    <button
                      onClick={() => (showSalonStatus(salon.salonTiming) ? setShowDetails(!showDetails) : {})}
                      className={`text-start  ${
                        showSalonStatus(salon.salonTiming)
                          ? "text-primary-link hover:underline cursor-pointer"
                          : "text-[#7E868C] cursor-not-allowed"
                      }`}
                    >
                      {getSalonStatus(t, salon.salonTiming)}
                    </button>
                  </div>
                )}

                {showDetails && salon.salonTimingWeekdayDescriptions && (
                  <div
                    ref={timingRef}
                    className="absolute mt-7 ml-8 bg-primary-grey dark:bg-white rounded-lg text-white dark:text-primary-grey shadow-lg z-10 min-w-60 px-5 py-3"
                  >
                    <ul className="list-none text-sm">
                      {!salon.salonTimingWeekdayDescriptions ||
                      !Array.isArray(salon.salonTimingWeekdayDescriptions) ||
                      salon.salonTimingWeekdayDescriptions.length == 0 ? (
                        <div>{t("Timing detail not available")}</div>
                      ) : (
                        salon.salonTimingWeekdayDescriptions.map((dayTime, index) => {
                          const split = dayTime?.split(":") ?? [];

                          const day = split.length > 0 ? split[0] : "";
                          const time = dayTime?.replace(day + ":", "").trim() ?? "";

                          return (
                            <li key={index} className="py-1">
                              <div className="font-bold">{t(day)}</div>
                              <div className="">{time == "Closed" ? t(time) : convertTo24HourRange(locale, time)}</div>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}

                {/* Salon Reservation Link */}
                {typeof salon.reservationLink == "string" && salon.reservationLink != "" && (
                  <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 flex items-center justify-center relative">
                      <Image
                        src={isDarkTheme ? "/icon_reservation_dark.svg" : "/icon_reservation.svg"}
                        alt="Website icon"
                        width={22}
                        height={22}
                      />
                    </div>
                    {typeof salon.reservationLink == "string" && salon.reservationLink != "" ? (
                      <a
                        href={salon.reservationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-link hover:underline"
                      >
                        {t("Reserve Now")}
                      </a>
                    ) : (
                      <span className="text-[#7E868C] cursor-not-allowed">{t("Not available")}</span>
                    )}
                  </div>
                )}

                {/* Salon Phone */}
                <div className="flex gap-2 whitespace-nowrap">
                  <Image
                    src={isDarkTheme ? "/phone_dark.svg" : "/phone.svg"}
                    height={18}
                    // className="mt-1.5"
                    width={18}
                    alt="Phone icon"
                  />
                  {salon.phone && salon.phone != "" ? (
                    <a
                      href={`tel:${salon.phone}`}
                      className="text-primary-link hover:underline"
                      title="Call this number"
                    >
                      {salon.phone}
                    </a>
                  ) : (
                    <p className="">{t("Not available")}</p>
                  )}
                </div>
              </div>

              {/* Certifications and Brands Section */}
              <div className=" flex flex-col gap-3 lg:col-span-1  min-w-[200px]">
                {Array.isArray(salon.certificates) && salon?.certificates.length ? (
                  <div className="flex gap-2 ">
                    <Image
                      src={isDarkTheme ? "/certificate_dark.svg" : "/certificate.svg"}
                      width={20}
                      height={20}
                      // className="mt-1"
                      alt="Certificate icon"
                    />
                    <div className="flex flex-wrap text-primary-grey dark:text-white">
                      {Array.isArray(salon.certificates) && salon?.certificates.length
                        ? salon.certificates.map((cert) => cert.name).join(", ")
                        : "No certifications available"}
                    </div>
                  </div>
                ) : (
                  <></>
                )}

                {/* <div className="flex gap-2">
                  <Image
                    src={isDarkTheme ? "/brands_dark.svg" : "/brands.svg"}
                    width={20}
                    height={20}
                    // className="mt-1"
                    alt="Brands icon"
                  />
                  <div className="flex flex-wrap gap-x-1 text-primary-grey dark:text-white">
                    {Array.isArray(salon.brands) && salon.brands.length ? (
                      salon.brands.map((cert, idx, arr) => (
                        <span key={idx} className="whitespace-nowrap">
                          {cert.name}
                          {idx < arr.length - 1 ? "," : ""}
                        </span>
                      ))
                    ) : (
                      <span>No brands available</span>
                    )}
                  </div>
                </div> */}

                {Array.isArray(salon.offeredServices) && salon.offeredServices.length ? (
                  <div className="flex gap-2 items-start">
                    <Image
                      src={isDarkTheme ? "/icon_salon_service_dark.svg" : "/icon_salon_service.svg"}
                      width={20}
                      height={20}
                      alt="Salon Services"
                    />
                    <div className="flex flex-wrap gap-x-1 text-primary-grey dark:text-white">
                      {salon.offeredServices.map((cert, idx, arr) => (
                        <span key={idx} className="whitespace-nowrap">
                          {cert.name}
                          {idx < arr.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function to24Hour(t: string) {
    const [time, modifier] = t.split(/\s+/); // splits "9:00" and "AM"
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}

export function getSalonStatus(t: TFunction<"translation", undefined>, schedule?: SalonDayTiming[]) {
  // --- Input Validation ---
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return t("Time not available");
  }

  // --- Get Current Time Details ---
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // --- Find Schedule for Today and Yesterday ---
  // Need yesterday's schedule to check for overnight shifts ending today
  const yesterdayDay = (currentDay - 1 + 7) % 7; // Wrap around Sunday correctly

  const todaySchedule = schedule.find((entry) => entry?.open?.day === currentDay);
  const yesterdaySchedule = schedule.find((entry) => entry?.open?.day === yesterdayDay);

  // --- Check 1: Is it currently within yesterday's overnight closing time? ---
  if (yesterdaySchedule) {
    const yesterdayOpenHour = yesterdaySchedule?.open?.hour ?? 0;
    const yesterdayCloseHour = yesterdaySchedule?.close?.hour ?? 0;
    const yesterdayCloseMinute = yesterdaySchedule?.close?.minute ?? 0;
    const yesterdayCloseDay = yesterdaySchedule?.close?.day ?? 0; // Use close.day for accuracy
    const yesterdayOpenDay = yesterdaySchedule?.open?.day ?? 0;

    // Check if yesterday's schedule was overnight *and* supposed to end today
    const isOvernightEndingToday = yesterdayCloseHour < yesterdayOpenHour || yesterdayCloseDay !== yesterdayOpenDay;

    if (isOvernightEndingToday && yesterdayCloseDay === currentDay) {
      const yesterdayCloseTimeInMinutes = yesterdayCloseHour * 60 + yesterdayCloseMinute;
      // If current time is before the closing time from yesterday's overnight shift
      if (currentTimeInMinutes < yesterdayCloseTimeInMinutes) {
        return t("Opened Now");
      }
    }
  }

  // --- Check 2: Is today listed in the schedule? ---
  if (!todaySchedule) {
    // If today isn't in the schedule, but we didn't match an overnight period from yesterday, it's closed.
    return t("Closed Now");
  }

  // --- Check 3: Is it currently within today's opening hours? ---
  const todayOpenHour = todaySchedule?.open?.hour ?? 0;
  const todayOpenMinute = todaySchedule?.open?.minute ?? 0;
  const todayCloseHour = todaySchedule?.close?.hour ?? 0;
  const todayCloseMinute = todaySchedule?.close?.minute ?? 0;
  const todayOpenDay = todaySchedule?.open?.day ?? 0;
  const todayCloseDay = todaySchedule?.close?.day ?? 0; // Use close.day for accuracy

  const todayOpenTimeInMinutes = todayOpenHour * 60 + todayOpenMinute;
  const todayCloseTimeInMinutes = todayCloseHour * 60 + todayCloseMinute;

  // Case A: Normal Hours (Opening and closing on the same day)
  // Note: Includes cases like 8:30 to 20:00 OR 00:00 to 02:00 (opening after midnight)
  if (todayCloseDay === todayOpenDay) {
    // Standard check: current time must be >= open time AND < close time
    if (currentTimeInMinutes >= todayOpenTimeInMinutes && currentTimeInMinutes < todayCloseTimeInMinutes) {
      return t("Opened Now");
    }
    // Case B: Overnight Hours (Closing time is on the next day)
    // Example: Open Thursday 16:00 (day 4), Close Friday 01:00 (day 5)
  } else if (todayCloseDay === (todayOpenDay + 1) % 7 || (todayOpenDay === 6 && todayCloseDay === 0)) {
    // Handles Saturday to Sunday wrap
    // If it's an overnight shift starting today, we just need to be after the opening time.
    // The check for the *next* day's early hours was handled by the "yesterdaySchedule" logic above.
    if (currentTimeInMinutes >= todayOpenTimeInMinutes) {
      return t("Opened Now");
    }
  }

  // --- Default: If none of the open conditions were met ---
  return t("Closed Now");
}

export function showSalonStatus(schedule?: SalonDayTiming[]) {
  // --- Input Validation ---
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return false;
  }

  return true;
}
