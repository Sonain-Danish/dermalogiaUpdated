"use client";

import { useSalonsData, useServicesData } from "@/lib/hooks/useSalonData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiTargetLock } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";

export const MapFilterBar = () => {
  const { t } = useTranslation("Home");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { allSalons, searchTerm, serviceTerm } = useSalonsData();
  const { services: availableServices } = useServicesData();

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isLocating, setIsLocating] = useState(false);

  // New States for dynamic fetching
  const [salonSuggestions, setSalonSuggestions] = useState<string[]>([]);
  const [showSalonDropdown, setShowSalonDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Keep local search synced with searchParams if needed
  useEffect(() => {
    if (searchTerm !== localSearch) {
      setLocalSearch(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const updateURL = (search: string, service: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) params.set("search", search);
    else params.delete("search");

    if (service) params.set("service", service);
    else params.delete("service");

    // Reset pagination typically
    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Derive city suggestions from store data
  React.useEffect(() => {
    if (allSalons.length > 0) {
      // Extract unique cities
      const suggestions = new Set<string>();

      allSalons.forEach((s) => {
        // Priority 1: Use placeCity from backend if available
        if (s.placeCity && s.placeCity.trim()) {
          suggestions.add(s.placeCity.trim());
          return;
        }

        // Priority 2: Parse from Address (Fallback)
        if (s.address) {
          const parts = s.address.split(",");
          if (parts.length > 1) {
            let cityPart = parts[parts.length - 1].trim();
            cityPart = cityPart
              .replace(/\d{2}-\d{3}/, "") // Zip codes
              .replace(/\d{3}\s\d{2}/, "")
              .replace(/\b\d+\b/g, "")
              .trim();
            cityPart = cityPart.replace(/[,.]/g, "").trim();

            if (cityPart) suggestions.add(cityPart);
          } else {
            // Try to guess city if no comma (rare)
            suggestions.add(s.address.trim());
          }
        }
      });

      // Sort alphabetically
      const sortedCities = Array.from(suggestions).sort();
      // Prepend "All"
      setSalonSuggestions([t("All"), ...sortedCities]);
    }
  }, [allSalons, t]);

  const triggerSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set("search", term);
    else params.delete("search");
    if (serviceTerm) params.set("service", serviceTerm);
    else params.delete("service");
    params.delete("page");
    // Always bump _mc so MapHandler re-centers even when the same location is reselected
    params.set("_mc", Date.now().toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSalonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setShowSalonDropdown(true);
  };

  const handleSalonSuggestionClick = (val: string) => {
    const valueToUse = val === t("All") ? "" : val;
    setLocalSearch(valueToUse);
    triggerSearch(valueToUse); // Sets searchTerm (placeholder)
    setShowSalonDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSalonDropdown(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowSalonDropdown(false);
      triggerSearch(localSearch);
    }
  };

  // Toggle dropdown when arrow is clicked
  const handleArrowClick = () => {
    setShowSalonDropdown(!showSalonDropdown);
  };

  const handleServiceArrowClick = () => {
    setShowServiceDropdown(!showServiceDropdown);
  };

  const handleServiceSelect = (service: string) => {
    updateURL(searchTerm, service);
    setShowServiceDropdown(false);
  };

  const handleServiceBlur = () => {
    setTimeout(() => setShowServiceDropdown(false), 200);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t("Geolocation is not supported by your browser"));
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use Google Geocoding API via REST
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            console.error("Google Maps API Key not found");
            setIsLocating(false);
            return;
          }

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
          );
          const data = await response.json();

          if (data.status === "OK" && data.results && data.results.length > 0) {
            // Try to find the city (locality)
            let city = "";
            for (const component of data.results[0].address_components) {
              if (component.types.includes("locality")) {
                city = component.long_name;
                break;
              }
            }

            // Fallback to administrative_area_level_2 or 1 if locality not found
            if (!city) {
              for (const component of data.results[0].address_components) {
                if (component.types.includes("administrative_area_level_2")) {
                  city = component.long_name;
                  break;
                }
              }
            }

            // Fallback to formatted address if specific city extraction fails but unlikely
            const locationString = city || data.results[0].formatted_address;

            // Update global search (which sets placeholder)
            triggerSearch(locationString);
            setLocalSearch(locationString);
          } else {
            console.error("Geocoding failed:", data.status);
          }
        } catch (error) {
          console.error("Error during reverse geocoding:", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        // Optionally show specific errors
        if (error.code === error.PERMISSION_DENIED) {
          alert(
            t("Please allow location access to use this feature.", "Please allow location access to use this feature."),
          );
        }
      },
    );
  };

  // Filter suggestions
  const filteredSuggestions = salonSuggestions.filter((s) => {
    if (localSearch === "" || localSearch === t("All", "All")) return true;

    // If the input matches exactly one of the suggestions (e.g. user selected it), show all
    // BUT only if user hasn't just typed it. This is hard to distinguish without extra state.
    // simpler: If exact match, just show all. User can backspace to filter again.
    const isExactMatch = salonSuggestions.some((suggestion) => suggestion.toLowerCase() === localSearch.toLowerCase());
    if (isExactMatch) return true;

    return s.toLowerCase().includes(localSearch.toLowerCase()) && s !== localSearch;
  });

  return (
    <div className="bg-white dark:bg-background-secondary rounded-lg shadow-[0px_24px_60px_0px_rgba(0,0,0,0.12)] px-6 py-[19.5px] flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full max-w-212.25 mx-auto relative z-10 border -translate-y-20 border-border-divider">
      {/* Search Input Section */}
      <div className="flex-1 w-full relative z-50">
        <div className="flex items-center gap-4 h-full">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="font-helvetica text-base text-text-primary text-start leading-none ">
              {t("Location Label")}
            </label>
            <div className="relative flex items-center w-full h-full">
              <input
                type="text"
                value={localSearch}
                onChange={handleSalonInputChange}
                onFocus={() => setShowSalonDropdown(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={searchTerm || t("Search Location")}
                className="w-full bg-transparent text-text-placeholder font-geist text-base md:text-sm outline-none placeholder:text-text-placeholder dark:placeholder:text-text-placeholder placeholder:font-medium placeholder:opacity-100 placeholder:leading-tight leading-tight"
              />
              {/* Clear button if typed something or if there is a search term */}
              {(localSearch || searchTerm) && (
                <button
                  onClick={() => {
                    setLocalSearch("");
                    triggerSearch("");
                  }}
                  className="absolute right-0 mr-6 text-text-secondary-1 hover:text-text-primary text-xs uppercase font-medium"
                >
                  {/* Optional: Add clear functionality visually if desired, but user just wants placeholder behavior */}
                </button>
              )}
            </div>
          </div>
          {/* Target Icon */}
          <div
            className={`shrink-0 text-cta-secondary cursor-pointer hover:opacity-70 flex items-center justify-center  ${isLocating ? "animate-pulse opacity-50 cursor-wait" : ""}`}
            title={t("My Location")}
            onClick={isLocating ? undefined : handleMyLocation}
          >
            <BiTargetLock className="w-6 h-6" />
          </div>
        </div>

        {/* Salon Autocomplete Dropdown */}
        {showSalonDropdown && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-background-secondary border border-border-divider rounded-lg shadow-[0px_8px_24px_0px_#0000001F] mt-1 z-1001 max-h-60 overflow-y-auto [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-scrollbar dark:[&::-webkit-scrollbar-thumb]:bg-scrollbar [&::-webkit-scrollbar]:w-1.5">
            {filteredSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-border-divider cursor-pointer text-base md:text-sm font-geist font-light text-text-primary text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => handleSalonSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Mobile Divider */}
        <div className="h-px w-full bg-border-divider mt-4 md:hidden" />
      </div>

      {/* Desktop Vertical Divider */}
      <div className="w-px h-12 bg-border-divider hidden md:block" />

      {/* Service Select Section */}
      <div className="flex-1 flex flex-col gap-1.5            w-full relative z-40">
        <label className="font-helvetica text-base text-text-primary block text-start leading-none">
          {t("Service Label")}
        </label>
        <div className="relative flex items-center justify-between cursor-pointer" onClick={handleServiceArrowClick}>
          <input
            type="text"
            readOnly
            value={serviceTerm || ""}
            placeholder={t("Select Service")}
            className="w-full bg-transparent text-text-placeholder font-geist text-base md:text-sm outline-none placeholder:text-text-placeholder dark:placeholder:text-text-placeholder placeholder:font-medium placeholder:opacity-100 placeholder:leading-tight leading-tightpy-[2px] cursor-pointer"
            onBlur={handleServiceBlur}
          />
        </div>

        {/* Service Dropdown */}
        {showServiceDropdown && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-background-secondary border border-border-divider rounded-lg shadow-[0px_8px_24px_0px_#0000001F] mt-1 z-1001 max-h-60 overflow-y-auto [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-scrollbar dark:[&::-webkit-scrollbar-thumb]:bg-scrollbar [&::-webkit-scrollbar]:w-1.5">
            <div
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-border-divider cursor-pointer text-base md:text-sm font-geist font-light text-text-primary text-left transition-colors first:rounded-t-lg"
              onClick={() => handleServiceSelect("")}
            >
              {t("Select Service")}
            </div>
            {availableServices.length > 0 ? (
              availableServices.map((s, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-border-divider cursor-pointer text-base md:text-sm font-geist font-light text-text-primary text-left transition-colors last:rounded-b-lg"
                  onClick={() => handleServiceSelect(s.name)}
                >
                  {s.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-text-secondary-1">{t("Loading services...")}</div>
            )}
          </div>
        )}
      </div>

      {/* Button */}
      <button
        onClick={() => triggerSearch(localSearch)}
        className="bg-cta-bg text-cta-text font-helvetica rounded-lg hover:cursor-pointer uppercase pr-6 pl-3 py-2 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full md:w-auto min-w-45"
      >
        <CiSearch className="w-5 h-5" />
        <span>{t("Find Salons")}</span>
      </button>
    </div>
  );
};
