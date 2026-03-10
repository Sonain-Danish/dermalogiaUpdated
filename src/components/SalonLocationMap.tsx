"use client";

import { Salon } from "@/types";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiNavigation } from "react-icons/fi";

const DEFAULT_CENTER = { lat: 50.0755, lng: 14.4378 };
const DEFAULT_ZOOM = 15;
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
    stylers: [{ lightness: "0" }, { color: "#bbcacf" }, { weight: "0.20" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { hue: "#ff0000" }],
  },
  {
    featureType: "road.arterial",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d6d6d6" }, { weight: "0.20" }],
  },
  {
    featureType: "road.local",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "on" }, { color: "#d6d6d6" }, { weight: "0.20" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ visibility: "simplified" }, { color: "#a3ccff" }],
  },
];

export const SalonLocationMap = ({ salon, className }: { salon: Salon; className?: string }) => {
  const { t } = useTranslation("Home");
  const { resolvedTheme } = useTheme();

  // Calculate position
  const position = salon.location?.coordinates
    ? { lat: salon.location.coordinates[1], lng: salon.location.coordinates[0] }
    : DEFAULT_CENTER;

  const handleNavigate = () => {
    let url = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
    if (salon.placeId) {
      url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${salon.placeId}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div
      className={`bg-background-primary rounded-lg overflow-hidden border border-border-divider shadow-sm ${className || ""}`}
    >
      <div className="h-48 w-full bg-background-secondary relative">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .gm-style-cc { display: none !important; }
            a[href^="https://maps.google.com/maps"] { display: none !important; }
            .gmnoprint a, .gmnoprint span { display: none !important; }
            .gm-bundled-control { display: block !important; } /* Ensure zoom control stays visible */
            .gmnoprint div { background: none !important; }
          `,
          }}
        />
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            mapId="31ff707c4c9f51a7"
            id="main-map"
            defaultCenter={position}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling={"greedy"}
            disableDefaultUI={false}
            zoomControl={true}
            scrollwheel={true}
            draggable={true}
            keyboardShortcuts={false}
            className="w-full h-full"
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
            styles={MAP_STYLES}
            restriction={{
              latLngBounds: defaultBounds,
              strictBounds: true,
            }}
          >
            <AdvancedMarker position={position}>
              {/* Custom Marker Pin */}
              <div className="text-brand-primary drop-shadow-md">
                <FiMapPin className="w-8 h-8 fill-brand-primary text-white" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="text-brand-primary flex items-center justify-center shrink-0 mt-1">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 font-arpona">
            <span className="text-text-secondary-1">{t("Location Label")}</span>
            <span className="text-text-primary font-medium leading-tight">{salon.address}</span>
          </div>
        </div>

        <button
          onClick={handleNavigate}
          className="w-full bg-cta-bg text-cta-text h-10 flex hover:cursor-pointer items-center justify-center gap-3 font-medium hover:opacity-90 transition-opacity uppercase tracking-widest"
        >
          <FiNavigation className="w-5 h-5" />
          {t("Navigate")}
        </button>
      </div>
    </div>
  );
};
