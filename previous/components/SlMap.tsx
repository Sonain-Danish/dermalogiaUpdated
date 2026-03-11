"use client";

import { setLocation } from "@/app/[locale]/store/saloonSlice";
import { ReduxStoreSalonType, ReduxStoreType } from "@/app/[locale]/store/store";
import i18nConfig from "@/i18nConfig";
import { GlobalConstants } from "@/utils/constants/global-constants";
import { convertTo24HourRange, copyToClipboard, salonLogoUrlResolver } from "@/utils/Funtions";
import { Salon } from "@/utils/models/schema-prisma";
import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdOutlineDone } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getSalonStatus, showSalonStatus } from "./Card";
import Loader from "./Loader";
import SalonRatings from "./SalonRating";

// Helper function for truncating text
const truncateText = (text: string, maxLength: number) => text;
// text?.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;

const mapDefaultZoom = 1;
const mapDefaultCenter = { lat: 49.4, lng: 17.10986 };

const defaultBounds = {
  north: 52.865845, // Top border
  south: 45.962026, // Bottom border
  west: 11.693276, // Left border
  east: 23.211647, // Right border
};

// ====================================================================
// NEW: Create an inner component to manage map-specific logic
// ====================================================================
function MapInner({
  saloons,
  selectedSalon,
  handleMarkerClick,
  location,
}: {
  saloons: Salon[];
  selectedSalon: Salon | null | undefined;
  handleMarkerClick: (salon: Salon) => void;
  location: string | null;
}) {
  const searchSalonValue = useSelector<ReduxStoreType, string>((state) => state.searchSalon.value);
  const map = useMap("main-map"); // Get the map instance!
  const dispatch = useDispatch();

  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Helper to animate smoothly to a target (center + zoom)
  function smoothPanAndZoom(center: google.maps.LatLngLiteral | google.maps.LatLng, zoom: number) {
    if (!map) return;

    // Clear any previous one-time listener
    if (zoomListenerRef.current) {
      zoomListenerRef.current.remove();
      zoomListenerRef.current = null;
    }

    // 1) Smoothly pan to the new center
    map.panTo(center);

    // 2) After pan finishes (idle fires), set zoom (which itself animates)
    zoomListenerRef.current = window.google.maps.event.addListenerOnce(map, "idle", () => {
      map.setZoom(zoom);
      zoomListenerRef.current = null;
    });
  }

  // This useEffect will run when the location prop changes,
  // or when the map instance becomes available.
  useEffect(() => {
    if (!map || !location || typeof location !== "string" || location.trim() === "") {
      return;
    }

    // Use the map instance to imperatively set the center and zoom
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results[0]?.geometry?.location) {
        map.moveCamera({
          center: results[0].geometry.location,
          zoom: 13,
        });
        dispatch(setLocation(null));
      } else {
        console.error("Geocoding failed for location:", location, "with status:", status);
      }
    });
  }, [map, location]); // Dependency array includes map and location

  //
  useEffect(() => {
    if (!map) return;

    if (searchSalonValue == "") {
      map.moveCamera({
        center: mapDefaultCenter,
        zoom: mapDefaultZoom,
      });
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchSalonValue }, (results, status) => {
      if (status === "OK" && results && results[0]?.geometry?.location) {
        map.moveCamera({
          center: results[0].geometry.location,
          zoom: 13,
        });
      } else {
        console.error("Geocoding failed for searchSalonValue:", searchSalonValue, "with status:", status);
      }
    });
  }, [map, searchSalonValue]);

  // This is the content that was previously inside your <Map>
  return (
    <>
      {saloons.map((salon) => {
        if (!salon.location?.coordinates) return null;

        return (
          <AdvancedMarker
            key={salon.id}
            position={{ lat: salon.location.coordinates[1], lng: salon.location.coordinates[0] }}
            onClick={() => onSalonClick(salon)}
          >
            <div style={{ transform: "translate(-50%, -50%)" }}>
              <Image
                src={selectedSalon?.id === salon.id ? "/dermalogica_logo_blue.png" : "/dermalogica_logo.png"}
                alt={`${salon.name} icon`}
                width={40}
                height={40}
              />
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );

  function onSalonClick(salon: Salon) {
    if (salon.location && map) {
      let currentZoom = map.getZoom() ?? 16;
      let zoom = currentZoom;
      if (zoom && zoom < 16) zoom = 16;

      let center = { lat: salon.location.coordinates[1], lng: salon.location.coordinates[0] };

      // If is full map, move marker to a little bit right so that it doesn't collide with the sidebar
      let isFullMap = window.innerWidth >= 768;
      if (isFullMap) {
        center = { lat: salon.location.coordinates[1], lng: salon.location.coordinates[0] - 0.002 };
      }

      if (currentZoom <= 10) {
        map.moveCamera({
          center,
          zoom,
        });
      } else {
        smoothPanAndZoom(center, zoom);
      }
    }

    handleMarkerClick(salon);
  }
}

export default function SlMap() {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme == "dark";

  // State for selected salon
  const [selectedSalon, setSelectedSalon] = useState<Salon>();

  // Redux store data
  const { saloons, loading, error, location } = useSelector<ReduxStoreType, ReduxStoreSalonType>(
    (state) => state.saloon
  );
  const selectedService = useSelector<ReduxStoreType, string>((state) => state.brand.selectedBrand);
  const searchSalonValue = useSelector<ReduxStoreType, string>((state) => state.searchSalon.value);
  const [showDetails, setShowDetails] = useState(false);

  // Memoize the filtered saloons based on selected brand and saloons data
  const filteredSaloons = useMemo(() => {
    if (!saloons) return []; // If saloons is undefined or null, return an empty array

    let filterServices = selectedService != GlobalConstants.defaultValues.selectedServiceDefaultValue;
    let filterName = searchSalonValue != "";

    if (!filterServices && !filterName) {
      // If no brand is selected, return all saloons
      return saloons;
    }

    // Filter saloons based on the selected brand (not if brand is "Select") and value entered (not if value is "")
    return saloons.filter((salon) => {
      if (filterServices && filterName)
        return (
          salon.offeredServices &&
          salon.name &&
          salon.offeredServices.some(
            (service) => service.name.trim().toLowerCase() == selectedService.trim().toLowerCase()
          ) &&
          (salon.name.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) ||
            salon?.address?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true ||
            salon?.placeCity?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true)
        );

      if (filterServices)
        return (
          salon.offeredServices &&
          salon.offeredServices.some(
            (service) => service.name.trim().toLowerCase() == selectedService.trim().toLowerCase()
          )
        );

      if (filterName)
        return (
          salon?.name?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true ||
          salon?.address?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true ||
          salon?.placeCity?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true
        );
    });
  }, [saloons, selectedService, searchSalonValue]);

  // Ensure saloons data is available
  const currentItems = filteredSaloons || [];
  const salon = selectedSalon || currentItems[0] || {}; // Fallback to an empty object

  const handleMarkerClick = (salon: any) => {
    setSelectedSalon(
      (prev) => (prev?.id === salon.id ? undefined : salon) // click same salon -> close, different salon -> switch
    );
  };

  const switchModal = () => {
    setShowModal(!showModal);
  };

  const selectbrandref = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timingRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: any) => {
    if (dialogRef?.current) {
      return;
    }

    if (selectbrandref.current && !selectbrandref.current.contains(event.target)) {
      setSelectedSalon(undefined);
    }
  };

  const shareLocation = () =>
    salon?.placeUrl ??
    (salon?.location?.coordinates
      ? `https://www.google.com/maps/search/?api=1&query=${salon.location.coordinates[1]},${salon.location.coordinates[0]}`
      : "");

  const pathname = usePathname();
  const locale = i18nConfig.locales.find((loc) => pathname.startsWith(`/${loc}`)); // Extract locale prefix if present

  function handleClickOutsideTimeDetail(event: MouseEvent) {
    console.log("Event Listener triggered for click outside");
    if (timingRef.current && !timingRef.current.contains(event.target as Node)) {
      setShowDetails(false);
    }
  }

  useEffect(() => {
    if (showDetails) {
      document.addEventListener("mouseup", handleClickOutsideTimeDetail);
      console.log("Event Listener added for click outside");
    }

    return () => {
      document.removeEventListener("mouseup", handleClickOutsideTimeDetail);
      console.log("Event Listener removed for click outside");
    };
  }, [showDetails]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Wait for initial data load before rendering map
  if (!saloons || saloons.length === 0) {
    return <Loader />;
  }

  return (
    <div className="">
      {showModal && (
        <div ref={dialogRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-md shadow-lg max-w-[460px] mx-auto text-black">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">{t("Share Location")}</h2>
              <button onClick={switchModal} className="text-gray-600 hover:text-gray-800">
                ✖
              </button>
            </div>
            <p className="mt-4">
              {t("Share the location of")} <b>{salon.name}</b> {t("with others")}.
            </p>
            <div className="flex gap-4 mt-4">
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
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      `Check out this location: ${salon.name}, ${shareLocation()}`
                    )}`,
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
        </div>
      )}

      <div className="md:relative md:block flex flex-col  max-w-[1200px] mx-auto ">
        {/* Map Section */}
        <div className="flex justify-center md:mb-10   ">
          <div className="md:w-[90%] w-full px-4 md:px-0">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language={"cs"}>
              <Map
                id="main-map"
                className="w-full h-[400px] md:h-[750px]"
                mapTypeControl={false}
                gestureHandling={"greedy"}
                restriction={{
                  latLngBounds: defaultBounds,
                  strictBounds: true,
                }}
                defaultCenter={mapDefaultCenter} // Sets the initial center
                defaultZoom={mapDefaultZoom} // Sets the initial zoom
                mapId="31ff707c4c9f51a7"
                streetViewControl={false}
                onClick={() => setSelectedSalon(undefined)} // close on map click
              >
                {/* Render the new inner component */}
                <MapInner
                  saloons={currentItems} // `currentItems` is your filtered list
                  selectedSalon={selectedSalon}
                  handleMarkerClick={handleMarkerClick}
                  location={location}
                />
              </Map>
            </APIProvider>

            <div
              className={`relative bottom-16 items-center self-center place-self-center justify-self-center md:hidden ${
                selectedSalon ? "" : "hidden"
              } `}
            >
              <div className="select-none rounded-full bg-black/90 text-white text-center w-10 h-10 shadow-black/20  shadow-lg flex items-center justify-center animate-bounce">
                <div className="rotate-90">{">"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        {selectedSalon && salon && (
          <div
            ref={selectbrandref}
            className="md:absolute md:top-6 md:left-[80px] text-black self-center w-full md:w-auto px-4 md:px-0"
          >
            <div className="bg-white p-3 flex flex-col w-full border-b pb-5 mt-0 gap-5 md:max-w-[356.5px]">
              <button
                onClick={() => {
                  setSelectedSalon(undefined);
                }}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full w-fit px-2 self-end"
              >
                ✖
              </button>
              {/* Image Section */}
              <div className="relative w-full h-[190px] overflow-hidden bg-white">
                <Image
                  src={salonLogoUrlResolver(salon.logoUrl)}
                  alt={`Image of ${salon.name}`}
                  layout="fill"
                  className="sm:object-contain object-cover"
                />
              </div>

              {/* Salon Info */}
              <div>
                <div className="flex flex-col py-3 border-t">
                  <h2
                    className="font-arpona font-medium text-lg cursor-pointer text-primary-grey break-words"
                    title={salon.name || "No name provided"}
                    onClick={() => {
                      if ((salon.name ?? "").trim() == "") return;

                      copyToClipboard(salon.name ?? "").then(() => {
                        toast.success("Copied to clipboard!");
                      });
                    }}
                  >
                    {truncateText(salon.name || "No name provided", 25)}
                  </h2>

                  <SalonRatings
                    rating={salon.rating}
                    ratingCount={salon.ratingCount}
                    className="mb-2"
                    color={salon.brands?.some((b) => b.name === "Salon Online") ? "#AA8232" : undefined}
                  />

                  <div
                    className="flex gap-2 pb-3 cursor-pointer"
                    onClick={() => {
                      if ((salon.address ?? "").trim() == "") return;

                      copyToClipboard(salon.address ?? "").then(() => {
                        toast.success("Copied to clipboard!");
                      });
                    }}
                  >
                    <Image src={"/location.svg"} width={24} height={24} alt="Location icon" />
                    <div className="text-base md:max-w-[300px] text-primary-grey break-words" title={salon.address}>
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
                            <div className="flex flex-col">
                              <div>{cleanFirstPart}</div>
                              <div>{secondPart}</div>
                            </div>
                          );
                        }

                        return <div>{address || "No address provided"}</div>;
                      })()}
                    </div>
                  </div>
                  <div className="flex gap-6 py-4 border-b border-t">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${salon.location?.coordinates[1]},${salon.location?.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/directions.svg"
                        width={36}
                        height={36}
                        alt="Directions icon"
                        className="cursor-pointer"
                      />
                    </a>
                    <Image
                      src={"/share.svg"}
                      width={36}
                      height={36}
                      onClick={switchModal}
                      className="cursor-pointer"
                      alt="Share icon"
                    />
                    {typeof salon.website == "string" && salon.website != "" ? (
                      <a
                        href={salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-link  hover:underline"
                      >
                        <Image src={"/Globe.svg"} width={40} height={40} alt="Share icon" className="cursor-pointer" />
                      </a>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col gap-3 pt-6">
                  {/* Salon Time */}
                  {showSalonStatus(salon.salonTiming) && (
                    <div className="flex gap-2">
                      <Image src={"/clock.svg"} width={24} height={24} alt="Clock icon" />
                      <button
                        onClick={() => (showSalonStatus(salon.salonTiming) ? setShowDetails(!showDetails) : {})}
                        className={`text-start  ${
                          showSalonStatus(salon.salonTiming)
                            ? "text-primary-link hover:underline cursor-pointer"
                            : "text-primary-grey cursor-not-allowed"
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
                                <div className="">
                                  {time == "Closed" ? t(time) : convertTo24HourRange(locale, time)}
                                </div>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Salon Reservation Link */}
                  {typeof salon.reservationLink == "string" && salon.reservationLink != "" && (
                    <div className="flex gap-2 items-center text-primary-grey">
                      <div className="w-6 h-6 flex items-center justify-center relative">
                        <Image src={"/icon_reservation.svg"} alt="Website icon" width={22} height={22} />
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
                        <span className="text-gray-400 cursor-not-allowed">{t("Not available")}</span>
                      )}
                    </div>
                  )}

                  {/* Salon Phone */}
                  <div className="flex gap-2">
                    <Image src={"/phone.svg"} width={24} height={24} alt="Phone icon" />
                    {salon.phone && salon.phone != "" ? (
                      <a
                        href={`tel:${salon.phone}`}
                        className="text-primary-link  hover:underline"
                        title="Call this number"
                      >
                        {salon.phone}
                      </a>
                    ) : (
                      <p className="text-primary-grey">{t("Not available")}</p>
                    )}
                  </div>
                </div>

                {/* Certifications & Brands */}
                <div className="pt-6 flex flex-col gap-3">
                  {salon.certificates && salon.certificates.length > 0 ? (
                    <div className="flex gap-2 text-primary-grey">
                      <Image src={"/certificate.svg"} width={24} height={24} alt="Certificate icon" />
                      <p title={salon.certificates?.map((c) => c.name).join(", ")}>
                        {truncateText(
                          salon.certificates?.map((c) => c.name).join(", ") || "No certificates available",
                          30
                        )}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="flex gap-2 text-primary-grey">
                    <Image src="/brands.png" width={24} height={24} alt="Brands icon" />
                    <p title={salon.brands?.map((c) => c.name).join(", ")}>
                      {truncateText(salon.brands?.map((c) => c.name).join(", ") || "No brands listed", 30)}
                    </p>
                  </div>

                  {Array.isArray(salon.offeredServices) && salon.offeredServices.length ? (
                    <div className="flex gap-2 items-center">
                      <Image src={"/icon_salon_service.svg"} width={24} height={26} alt="Salon Services" />
                      <div className="flex flex-wrap gap-x-1 text-primary-grey">
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
        )}
      </div>
    </div>
  );
}
