"use client";

import { setBrand } from "@/app/[locale]/store/brandSlice";
import { fetchSaloons, setLocation, setPlaceId } from "@/app/[locale]/store/saloonSlice";
import { setSearchValue } from "@/app/[locale]/store/searchSalonSlice";
import { ReduxStoreSalonType, ReduxStoreType } from "@/app/[locale]/store/store";
import { GlobalConstants } from "@/utils/constants/global-constants";
import { setParam } from "@/utils/Funtions";
import { Libraries, LoadScript } from "@react-google-maps/api";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Select, { StylesConfig } from "react-select";
import styles from "./custom-styling/Dropdown.module.css"; // Adjust path as needed

const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];

export type ReactSelectOption = {
  value: string;
  label: string;
};

export default function SearchBar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { saloons, loading, error } = useSelector<ReduxStoreType, ReduxStoreSalonType>((state) => state.saloon);
  const selectedBrand = useSelector<ReduxStoreType, string>((state) => state.brand.selectedBrand);
  const [searchSalonOptions, setSearchSalonOptions] = useState<any>([]);
  const [searchSalonValue, setSearchSalonValue] = useState<ReactSelectOption>();
  const [inputValue, setInputValue] = useState("");

  const [brands, setBrands] = useState([selectedBrand]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { t } = useTranslation();
  const autocompleteRef = useRef<google.maps.places.Autocomplete>(null);

  const ReactSelectCustomStyles: StylesConfig = {
    control: (base: any, state: any) => ({
      ...base,
      innerWidth: 400,
      outerWidth: 400,
      borderRadius: 0,
      borderColor: "#FFFFFF",
      boxShadow: null,
      "&:hover": {
        borderColor: "#FFFFFF",
      },
      // ":active": {
      //   backgroundColor: "#000000",
      // },
    }),
    placeholder: (base: any) => ({
      ...base,
      whiteSpace: "nowrap",
    }),
    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
      return {
        ...styles,
        backgroundColor: "#ffffff",
        color: "#7E868C",
        ":active": {
          ...styles[":active"],
          backgroundColor: "#99a1af",
        },
        ":hover": {
          ...styles[":active"],
          backgroundColor: "#e5e7eb",
        },
        fontSize: "14px",
      };
    },
  };

  // Fetch brands from backend and apply URL params
  useEffect(() => {
    setSearchSalonOptions([{ label: t("All"), value: "" }]);

    const fetchBrands = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/salon-services`);
        const data = await response.json();
        const serviceNames = data.map((brand: any) => brand.name); // Extract brand names
        setBrands([GlobalConstants.defaultValues.selectedServiceDefaultValue, ...serviceNames]);
        // Add "Select" at the beginning
      } catch (error) {
        console.error("Error fetching Salon Service:", error);
      }
    };
    fetchBrands();

    const params = new URLSearchParams(searchParams);
    const brandParam = params.get("service");
    const locationParam = params.get("location");

    // Apply brand filter if exists
    if (brandParam && brandParam != "") {
      dispatch(setBrand(brandParam));
    }

    // Apply location filter and fetch saloons
    if (locationParam && locationParam != "") {
      const locationValue = { label: locationParam, value: locationParam };
      setSearchSalonValue(locationValue);
      setInputValue(locationParam);
      dispatch(setSearchValue(locationParam));
      dispatch(setLocation(locationParam));
      dispatch(fetchSaloons({ location: locationParam } as any) as any);
    } else {
      // No params - fetch all saloons
      dispatch(setLocation(null));
      dispatch(fetchSaloons({ location: null } as any) as any);
    }
  }, [dispatch]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef?.current?.getPlace();

    if (place && place.place_id) {
      dispatch(setPlaceId(place.place_id));
      dispatch(fetchSaloons({ location: place.formatted_address, placeId: place.place_id } as any) as any);
    }
  };

  const handleSearch = () => {
    if (searchSalonValue?.value?.trim()) {
      dispatch(setPlaceId(null));
      dispatch(setLocation(searchSalonValue?.value));
      dispatch(fetchSaloons({ location: searchSalonValue?.value } as any) as any);
    }
  };

  const pathname = usePathname();
  const isActive = (path: any) => pathname && pathname.endsWith(path);
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.success(t("Fetching Location!"));
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = `${latitude},${longitude}`;
          dispatch(setLocation(currentLocation));

          const currentLocationCoords = `${latitude},${longitude}`;
          const geocoder = new window.google.maps.Geocoder();
          const languages = ["en", "cz", "sk"];
          const fetchedCityNames = new Set<string>();

          for (const lang of languages) {
            try {
              const response = await geocoder.geocode({
                location: { lat: latitude, lng: longitude },
                language: lang,
              });

              if (response.results && response.results.length > 0) {
                const placeDetails = response.results[0];
                if (placeDetails.address_components) {
                  const cityComponent = placeDetails.address_components.find(
                    (component) => component.types.includes("locality") || component.types.includes("administrative_area_level_2")
                  );
                  if (cityComponent && cityComponent.long_name) {
                    fetchedCityNames.add(cityComponent.long_name);
                  }
                }
              }
            } catch (e: any) {
              console.warn(`Geocoding failed for language ${lang}: ${e.message || e.toString()}`);
            }
          }

          if (fetchedCityNames.size === 0) {
            return;
          }

          const cityNamesArray = Array.from(fetchedCityNames);

          let matchedOption: ReactSelectOption | undefined = undefined;

          for (const option of searchSalonOptions) {
            if (
              option.value &&
              cityNamesArray.some((fetchedCity) => fetchedCity.trim().toLowerCase() === option.value.trim().toLowerCase())
            ) {
              matchedOption = option;
              break;
            }
          }

          if (matchedOption) {
            dispatch(setSearchValue(matchedOption.value)); // Update Redux search state
          }
        },
        (error) => {
          console.error("Error fetching location:", error);

          // * Browser does not have access to location
          switch (error.code) {
            case error.PERMISSION_DENIED: {
              toast.error(t("Unable to fetch location. Please Allow Location Permission."));
              break;
            }
            case error.POSITION_UNAVAILABLE: {
              toast.error(t("Unable to fetch location. Please make sure you have enabled location for Browser in your device."));
              break;
            }
            case error.TIMEOUT: {
              toast.error(t("Unable to fetch location. Unable to find your exact Location."));
              break;
            }
            default: {
              toast.error(t("Unable to fetch location. Please check your permissions."));
              break;
            }
          }
        }
      );
    } else {
      toast.error(t("Geolocation is not supported by your browser."));
    }
  };

  const handleSelectBrand = (brand: string) => {
    dispatch(setBrand(brand)); // Update brand in Redux store
    setShowDropdown(false);
    setBrandParam(brand);
  };

  function setBrandParam(value: string) {
    setParam(
      router,
      searchParams,
      pathname,
      "service",
      value,
      value == GlobalConstants.defaultValues.selectedServiceDefaultValue || !value || value == ""
    );
  }

  const handleDropdownToggle = () => setShowDropdown((prev) => !prev);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleSearchChanged(newValue: { label: string; value: string }) {
    setSearchSalonValue(newValue);
    let value = newValue.value;

    dispatch(setSearchValue(newValue.value));
    setInputValue(newValue.value);

    setParam(router, searchParams, pathname, "location", value, value == t("All") || !value || value == "");
  }

  function handleSearchInputChanged(newValue: any) {
    if (newValue === "") return;

    const val: ReactSelectOption = {
      label: newValue,
      value: newValue,
    };

    setInputValue(newValue);

    setSearchSalonValue(val);
    dispatch(setSearchValue(val.value));
  }

  useEffect(() => {
    if ((saloons?.length ?? 0) == 0) return;

    const options: ReactSelectOption[] = [{ label: t("All"), value: "" }];

    for (let i = 0; i < saloons.length; i++) {
      const val = saloons[i].placeCity;
      if ((val ?? "").trim() == "" || options.find((o) => o.value == val)) continue;

      options.push({
        label: val ?? "",
        value: val ?? "",
      });
    }

    setSearchSalonOptions(options);

    //
  }, [saloons]);

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  }

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mouseup", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="flex md:justify-center  md:gap-4 md:flex-row flex-col items-center text-black px-4">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={GOOGLE_MAPS_LIBRARIES}>
        <div className=" flex md:flex-row flex-col bg-gray-100 dark:bg-gray-700 rounded-lg pt-[1.875rem] md:pb-10 md:pt-[2.625rem] md:px-12 px-[1.875rem] pb-[1.875rem] gap-[0.938rem] w-full md:w-3/4 ">
          {/* Dropdown */}
          <div className="flex md:flex-row w-full flex-col gap-4 items-center  ">
            <div ref={dropdownRef} className="relative w-full">
              <button
                type="button"
                className="bg-white w-full rounded-lg py-[0.875rem] text-primary-grey  px-5 outline-none font-normal cursor-pointer text-left text-sm whitespace-nowrap"
                onClick={handleDropdownToggle}
              >
                {selectedBrand == GlobalConstants.defaultValues.selectedServiceDefaultValue
                  ? t(GlobalConstants.defaultValues.selectedServiceDefaultValue)
                  : selectedBrand}
              </button>
              {showDropdown && (
                <ul
                  className={`absolute bg-white w-full rounded-lg border border-gray-300 mt-1 max-h-60 overflow-auto text-primary-grey z-10 ${styles.customScrollbar}`}
                >
                  {brands.map((brand) => (
                    <li
                      key={brand}
                      className="py-[0.875rem] px-5 tracking-[1px]  cursor-pointer hover:bg-gray-200 text-sm"
                      onClick={() => handleSelectBrand(brand)}
                    >
                      {brand == GlobalConstants.defaultValues.selectedServiceDefaultValue
                        ? t(GlobalConstants.defaultValues.selectedServiceDefaultValue)
                        : brand}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Location Input */}
          <div className="bg-white rounded-lg w-full flex-grow flex items-center px-2">
            <div className="w-full outline-none bg-transparent text-sm min-w-37">
              <Select
                isLoading={!saloons}
                styles={ReactSelectCustomStyles}
                name="Salon"
                options={searchSalonOptions}
                value={searchSalonValue}
                className="w-full outline-none bg-transparent text-sm rounded-lg  "
                classNamePrefix={t("Search Salons")}
                placeholder={t("Search Salons")}
                noOptionsMessage={() => t("No suggestions")}
                onChange={handleSearchChanged as any}
                onInputChange={handleSearchInputChanged}
              />
            </div>
            <button className="ml-1 text-primary-text2 min-w-6 cursor-pointer" type="button" onClick={handleCurrentLocation}>
              <Image src="/my_location.svg" width={22} height={22} alt="Get Current Location" />
            </button>
            {/* )} */}
          </div>

          {/* Search Button */}
          <button
            className="bg-primary-grey tracking-[1px] text-white rounded-lg flex items-center justify-center px-6 py-2 duration-300 cursor-pointer hover:bg-primary-grey/80 text-[1rem]"
            onClick={handleSearch}
          >
            <Image src="/SearchIcon.svg" width={18} height={18} alt="Search Icon" className="mr-2" />
            {loading ? t("Loading") : t("Search")}
          </button>
        </div>
      </LoadScript>
    </div>
  );
}
