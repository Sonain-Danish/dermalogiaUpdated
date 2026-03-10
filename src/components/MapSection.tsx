"use client";

import { useSalonsData } from "@/lib/hooks/useSalonData";
import { getSalonStatusAndNextTime, resolveSalonImage } from "@/lib/salonUtils";
import { Salon } from "@/types";
import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import clsx from "clsx";
import Image from "next/image";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsArrowRight, BsTelephone } from "react-icons/bs";
import { FiMapPin } from "react-icons/fi";
import { PiGlobeSimpleLight } from "react-icons/pi";

import { useTheme } from "next-themes";
import {
  IoArrowBack,
  IoCalendarOutline,
  IoChevronDown,
  IoEyeOutline,
  IoNavigateOutline,
  IoShareSocialOutline,
  IoStar,
  IoStarHalf,
  IoStarOutline,
} from "react-icons/io5";
import { ShareDialog } from "./ShareDialog";

interface MapSectionProps {
  salons: Salon[];
}

const DEFAULT_CENTER = { lat: 49.8175, lng: 15.473 }; // Czech Republic
const DEFAULT_ZOOM = 7;

const defaultBounds = {
  north: 52.865845, // Top border
  south: 45.962026, // Bottom border
  west: 11.693276, // Left border
  east: 23.211647, // Right border
};

const MAP_STYLES = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7c93a3" }, { lightness: "-10" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#a0a4a5" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#62838e" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#dde3e3" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3f4a51" }, { weight: "0.30" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "poi.attraction",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.business",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.government",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.place_of_worship",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.sports_complex",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: "-100" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#bbcacf" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ lightness: "0" }, { color: "#bbcacf" }, { weight: "0.50" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway.labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.stroke",
    stylers: [{ color: "#a9b4b8" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [
      { invert_lightness: true },
      { saturation: "-7" },
      { lightness: "3" },
      { gamma: "1.80" },
      { weight: "0.01" },
    ],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#a3c7df" }],
  },
];

const SalonDetail = ({ salon, onBack }: { salon: Salon; onBack: () => void }) => {
  const { t } = useTranslation("Home");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { status, nextTime } = getSalonStatusAndNextTime(t, salon.salonTiming);
  const [imgSrc, setImgSrc] = useState(resolveSalonImage(salon));
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    setImgSrc(resolveSalonImage(salon));
  }, [salon]);

  // Handle share
  const handleShare = () => {
    setShowShare(true);
  };

  const handleBooking = () => {
    const link = salon.reservationLink || salon.website;
    if (link) {
      window.open(link.startsWith("http") ? link : `https://${link}`, "_blank");
    }
  };

  const handleNavigate = () => {
    if (salon.location?.coordinates) {
      const [lng, lat] = salon.location.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    }
  };

  const handleViewDetails = () => {
    router.push(`/${locale}/salon/${salon.id}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<IoStar key={i} className="w-3.5 h-3.5 text-cta-secondary" />);
      } else if (rating >= i - 0.5) {
        stars.push(<IoStarHalf key={i} className="w-3.5 h-3.5 text-cta-secondary" />);
      } else {
        stars.push(<IoStarOutline key={i} className="w-3.5 h-3.5 text-cta-secondary" />);
      }
    }
    return stars;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background-primary z-50">
        {/* Header Area */}
        <div className="pt-6 px-6 pb-2 shrink-0">
          <div className="flex items-start gap-3 mb-1">
            <button onClick={onBack} className="mt-1 text-text-primary hover:opacity-70 transition-opacity">
              <IoArrowBack className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h2 className="font-helvetica text-text-primary leading-tight">{salon.name}</h2>
            </div>
          </div>
          <div className="pl-9 flex items-center gap-1.5 mb-4">
            <div className="flex">{renderStars(salon.rating || 0)}</div>
            <span className="font-helvetica text-sm font-medium text-text-primary">{salon.rating ?? 0}</span>
            <span className="text-text-secondary-2 text-sm font-helvetica font-light">
              ({salon.ratingCount || 0} {t("reviews")})
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
          {/* Large Image */}
          <div className="relative w-full h-55 mb-8 rounded-sm overflow-hidden">
            <Image
              src={imgSrc}
              alt={salon.name || "Salon"}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              onError={() => setImgSrc("/assets/default-salon.png")}
            />
          </div>

          {/* Info Rows */}
          <div className="space-y-6">
            {/* Address */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-4.5 h-4.5 shrink-0 flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-cta-secondary mt-1" />
                </div>
                <h4 className="font-helvetica  text-text-placeholder/90 font-light">{t("Location Label")}</h4>
              </div>
              <div className="pl-8 font-helvetica text-base text-text-primary leading-normal">
                {(() => {
                  const address = salon.address || "";
                  // Regex for Czech/Slovak postcodes (e.g., 671 75 or 763 61)
                  const postcodeRegex = /\b\d{3}\s?\d{2}\b/;
                  const match = address.match(postcodeRegex);

                  if (match && match.index !== undefined) {
                    const splitIndex = match.index;
                    const line1 = address.substring(0, splitIndex).trim().replace(/,$/, "");
                    const line2 = address.substring(splitIndex).trim();
                    return (
                      <span className="block">
                        {line1}, {line2}
                      </span>
                    );
                  }
                  return <span>{address}</span>;
                })()}
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-4.5 h-4.5 shrink-0 flex items-center justify-center">
                  <BsTelephone className="w-5 h-5 text-cta-secondary mt-1" />
                </div>
                <h4 className="font-helvetica text-text-placeholder/90 font-light">{t("Phone Number")}</h4>
              </div>
              <div className="pl-8">
                {salon.phone ? (
                  <a
                    href={`tel:${salon.phone}`}
                    className="font-helvetica text-base text-text-primary hover:underline hover:text-brand-primary transition-colors"
                  >
                    {salon.phone}
                  </a>
                ) : (
                  <span className="font-helvetica text-base text-text-secondary-1 ">{t("Not available")}</span>
                )}
              </div>
            </div>

            {/* Web */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <PiGlobeSimpleLight className="w-5 h-5 text-cta-secondary mt-0.5" />
                </div>
                <h4 className="font-helvetica text-text-placeholder/90 font-light">{t("Website")}</h4>
              </div>
              <div className="pl-8">
                {salon.website ? (
                  <a
                    href={`https://${salon.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-helvetica text-base text-text-primary hover:underline hover:text-brand-primary transition-colors block break-all"
                  >
                    {salon.website}
                  </a>
                ) : (
                  <span className="font-helvetica text-base text-text-secondary-1">{t("Not available")}</span>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <Image src="/clock_black.svg" width={20} height={20} alt="clock icon" className="w-5 h-5 mt-0.5" />
                </div>
                <h4 className="font-helvetica text-text-placeholder/90">{t("Opening Hours")}</h4>
              </div>
              <div className="pl-8 flex items-center gap-2 cursor-pointer group">
                <span
                  className={clsx(
                    "font-helvetica text-base font-medium",
                    status === t("Open")
                      ? "text-success"
                      : status === t("Timing not available")
                        ? "text-text-secondary-1"
                        : "text-error",
                  )}
                >
                  {status}
                </span>
                {nextTime && (
                  <>
                    <span className="text-text-secondary-1">•</span>
                    <span className="font-helvetica font-light text-sm text-text-primary leading-normal">
                      {nextTime}
                    </span>
                  </>
                )}
                <IoChevronDown className="w-4 h-4 text-text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 pt-2 bg-background-primary mt-auto">
          <div className="flex items-center gap-3 h-13">
            {/* Booking - Primary */}
            <button
              onClick={handleBooking}
              className="flex-1 h-full rounded-sm bg-cta-bg text-cta-text hover:bg-brand-primary duration-300 hover:cursor-pointer flex items-center justify-center  hover:opacity-90 transition-opacity"
            >
              <IoCalendarOutline className="w-6 h-6" />
            </button>

            {/* View - Secondary */}
            <button
              onClick={handleViewDetails}
              className="flex-1 h-full rounded-sm bg-background-primary hover:cursor-pointer border border-cta-bg text-text-primary flex items-center justify-center hover:bg-background-secondary transition-colors"
            >
              <IoEyeOutline className="w-6 h-6" />
            </button>

            {/* Navigate - Secondary */}
            <button
              onClick={handleNavigate}
              className="flex-1 h-full rounded-sm bg-background-primary hover:cursor-pointer border border-cta-bg text-text-primary flex items-center justify-center hover:bg-background-secondary transition-colors"
            >
              <IoNavigateOutline className="w-6 h-6" />
            </button>

            {/* Share - Secondary */}
            <button
              onClick={handleShare}
              className="flex-1 h-full rounded-sm bg-background-primary hover:cursor-pointer border border-cta-bg text-text-primary flex items-center justify-center hover:bg-background-secondary transition-colors"
            >
              <IoShareSocialOutline className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <ShareDialog salon={salon} isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
};

export const MapSection = ({ salons }: MapSectionProps) => {
  const { t } = useTranslation("Home");
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSalonId = searchParams.get("salonId");
  const mapCenterKey = searchParams.get("_mc");

  // Calculate center based on salons if available
  // const center = useMemo(() => {
  //   if (salons.length > 0 && salons[0].location?.coordinates) {
  //     // Return the first salon's location or calculate bounds
  //     // For now, return default or first
  //     return {
  //       lat: salons[0].location.coordinates[1],
  //       lng: salons[0].location.coordinates[0],
  //     };
  //   }
  //   return DEFAULT_CENTER;
  // }, [salons]);

  const handleSalonSelect = (id: string) => {
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("salonId", id);
    // Use replace to prevent history stack buildup if clicking around
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("salonId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectedSalon = selectedSalonId ? salons.find((s) => s.id === selectedSalonId) : null;

  return (
    <div className="relative w-full flex flex-col md:flex-row md:h-179.5 rounded-lg overflow-hidden border border-border-divider bg-background-secondary shadow-lg z-0">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <div className="w-full h-100 md:h-full shrink-0 md:shrink md:flex-1 z-0 order-1 md:order-2">
          <Map
            mapId="31ff707c4c9f51a7"
            id="main-map"
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
            mapTypeControl={false}
            streetViewControl={false}
            className="w-full h-full"
            styles={MAP_STYLES}
            restriction={{
              latLngBounds: defaultBounds,
              strictBounds: true,
            }}
          >
            {salons.map(
              (salon) =>
                salon.location?.coordinates && (
                  <AdvancedMarker
                    key={salon.id}
                    position={{ lat: salon.location.coordinates[1], lng: salon.location.coordinates[0] }}
                    onClick={() => handleSalonSelect(salon.id)}
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
                      <Image
                        src={selectedSalonId === salon.id ? "/BrandsYellow.svg" : "/brands.svg"}
                        alt="Salon Pin"
                        width={40}
                        height={40}
                        className={clsx("drop-shadow-md", selectedSalonId === salon.id ? "scale-125 z-10" : "")}
                      />
                    </div>
                  </AdvancedMarker>
                ),
            )}
            <MapHandler selectedSalonId={selectedSalonId} salons={salons} mapCenterKey={mapCenterKey} />
          </Map>
        </div>

        {/* Sidebar List (Desktop: Left, Mobile: Bottom) */}
        <div
          className={clsx(
            "w-full md:w-85 lg:w-110.5 shrink-0 bg-background-primary shadow-none overflow-hidden flex flex-col border-t md:border-t-0 md:border-r border-border-divider z-10 order-2 md:order-1",
            selectedSalon ? "h-auto md:h-full" : "h-125 md:h-full",
          )}
        >
          {selectedSalon ? (
            <SalonDetail salon={selectedSalon} onBack={handleBack} />
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
              {salons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="text-error font-helvetica text-xl mb-2">{t("No Salons Found!")}</div>
                  <p className="text-text-secondary-1 text-sm">{t("No suggestions")}</p>
                </div>
              ) : (
                salons.map((salon) => {
                  const { status, nextTime } = getSalonStatusAndNextTime(t, salon.salonTiming);
                  return (
                    <div key={salon.id}>
                      <div
                        onClick={() => handleSalonSelect(salon.id)}
                        className={clsx(
                          "py-4 px-6 transition-all cursor-pointer group",
                          selectedSalonId === salon.id
                            ? "bg-background-secondary shadow-sm"
                            : "bg-background-primary hover:bg-background-secondary/50",
                        )}
                      >
                        {/* Brands */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {salon.brands?.slice(0, 3).map((brand, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-brand-primary/10 rounded-sm border border-brand-primary/40 text-primary text-xs font-helvetica uppercase"
                            >
                              {typeof brand === "string" ? brand : brand.name}
                            </span>
                          ))}
                          {salon.brands && salon.brands.length > 3 && (
                            <span className="text-xs text-text-secondary-2 mt-1 rounded-sm">
                              +{salon.brands.length - 3}
                            </span>
                          )}
                        </div>

                        <h3
                          className={clsx(
                            "font-helvetica text-base mb-1 text-text-primary",
                            selectedSalonId === salon.id ? "font-medium" : "font-normal",
                          )}
                        >
                          {salon.name}
                        </h3>
                        <p className="font-helvetica font-light text-base text-text-primary-1 mb-3 truncate">
                          {salon.address}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Image
                              src={resolvedTheme === "dark" ? "/clock_white.svg" : "/clock_black.svg"}
                              width={20}
                              height={20}
                              alt="clock icon"
                              className="w-5 h-5 shrink-0"
                            />
                            <span
                              className={clsx(
                                status === t("Open")
                                  ? "bg-success"
                                  : status === t("Timing not available")
                                    ? ""
                                    : "bg-error",
                              )}
                            />
                            <span
                              className={clsx(
                                "font-helvetica ",
                                status === t("Open")
                                  ? "text-success-text"
                                  : status === t("Timing not available")
                                    ? "text-text-secondary-1"
                                    : "text-error",
                              )}
                            >
                              {status}
                            </span>
                            {nextTime && (
                              <>
                                <span className="text-text-secondary-2">•</span>
                                <span className="font-helvetica font-light text-sm text-text-primary">{nextTime}</span>
                              </>
                            )}
                          </div>

                          {/* Arrow Icon */}
                          <div className="w-8 h-8 rounded-full border border-border-divider flex items-center justify-center group-hover:bg-cta-bg group-hover:text-cta-text transition-colors text-text-primary">
                            <BsArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-border-divider w-full" />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </APIProvider>
    </div>
  );
};

// Helper to pan map
const MapHandler = ({
  selectedSalonId,
  salons,
  mapCenterKey,
}: {
  selectedSalonId: string | null;
  salons: Salon[];
  mapCenterKey: string | null;
}) => {
  const map = useMap();
  const { searchTerm } = useSalonsData();
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Smooth Pan and Zoom
  const smoothPanAndZoom = (center: google.maps.LatLngLiteral | google.maps.LatLng, zoom: number) => {
    if (!map) return;
    if (zoomListenerRef.current) {
      zoomListenerRef.current.remove();
      zoomListenerRef.current = null;
    }
    map.panTo(center);
    zoomListenerRef.current = window.google.maps.event.addListenerOnce(map, "idle", () => {
      map.setZoom(zoom);
      zoomListenerRef.current = null;
    });
  };

  useEffect(() => {
    if (!map || !selectedSalonId) return;
    const salon = salons.find((s) => s.id === selectedSalonId);
    if (salon && salon.location?.coordinates) {
      const center = { lat: salon.location.coordinates[1], lng: salon.location.coordinates[0] };
      smoothPanAndZoom(center, 16);
    }
  }, [map, selectedSalonId, salons]);

  // Handle Search Term Geocoding
  useEffect(() => {
    if (!map || !searchTerm) return;

    // Check if google maps logic is available
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchTerm }, (results, status) => {
        if (status === "OK" && results && results[0]?.geometry?.location) {
          map.moveCamera({
            center: results[0].geometry.location,
            zoom: 13,
          });
        }
      });
    }
    // mapCenterKey changes every time user triggers search — re-centers even on same value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, searchTerm, mapCenterKey]);

  return null;
};
