"use client";

import { GlobalConstants } from "@/utils/constants/global-constants";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ReduxStoreSalonType, ReduxStoreType } from "../app/[locale]/store/store";
import Card from "./Card";
import Loader from "./Loader";

export default function LocationList() {
  const { saloons, loading, error } = useSelector<ReduxStoreType, ReduxStoreSalonType>((state) => state.saloon);
  const selectedService = useSelector<ReduxStoreType, string>((state) => state.brand.selectedBrand);
  const searchSalonValue = useSelector<ReduxStoreType, string>((state) => state.searchSalon.value);

  const { t } = useTranslation();

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
          salon.offeredServices.some((service) => service.name.trim().toLowerCase() == selectedService.trim().toLowerCase()) &&
          (salon.name.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) ||
            salon?.address?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true ||
            salon?.placeCity?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true)
        );

      if (filterServices)
        return (
          salon.offeredServices &&
          salon.offeredServices.some((service) => service.name.trim().toLowerCase() == selectedService.trim().toLowerCase())
        );

      if (filterName)
        return (
          salon?.name?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true ||
          salon?.address?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true ||
          salon?.placeCity?.trim().toLowerCase().includes(searchSalonValue.trim().toLowerCase()) == true
        );
    });
  }, [saloons, selectedService, searchSalonValue]);

  // // Pagination state
  // const [itemsPerPage, setItemsPerPage] = useState(5);
  // const [currentPage, setCurrentPage] = useState(1);

  // // Total pages based on filtered saloons
  // const totalPages = Math.ceil(filteredSaloons.length / 5);

  // // Get current page items (Recomputed when filteredSaloons or page changes)
  // const currentItems = useMemo(() => {
  //   return filteredSaloons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // }, [filteredSaloons, currentPage, itemsPerPage]);

  // const scrollToTop = () => {
  //   window.parent.postMessage({ type: "scrollToTop" }, "*");
  // };

  // const handlePageChange = (page: any) => {
  //   if (page >= 1 && page <= totalPages) {
  //     setCurrentPage(page);
  //     setItemsPerPage(5);
  //     scrollToTop();
  //   }
  // };
  // const handleLoadMore = () => {
  //   if (currentPage >= totalPages) return;
  //   setItemsPerPage(itemsPerPage + 3);
  // };
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredSaloons.length / itemsPerPage);

  // Safely compute items for current page
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSaloons.slice(start, end);
  }, [filteredSaloons, currentPage, itemsPerPage]);

  // Load more = increase items per page
  const handleLoadMore = () => {
    const newItemsPerPage = itemsPerPage + 3;
    const newTotalPages = Math.ceil(filteredSaloons.length / newItemsPerPage);

    setItemsPerPage(newItemsPerPage);

    // If currentPage exceeds new total pages, clamp it
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
      setCurrentPageParam(newTotalPages);
    }
  };

  // Pagination change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setCurrentPageParam(page);
      scrollToTop();
    }
  };

  function setCurrentPageParam(page: number) {
    const value = page.toString();
    // setParam(router, searchParams, pathname, "page", value, !value || value == "");
  }

  const scrollToTop = () => {
    window.parent.postMessage({ type: "scrollToTop" }, "*");
  };

  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  return (
    <div className="flex flex-col md:gap-6 items-center justify-center pb-1">
      {/* Show loading state */}
      {loading && <Loader />}
      {/* Show error state */}
      {/* {error && <p className="text-red-500">Error: {error}</p>} */}
      {/* Show saloons */}
      {!loading && !error && filteredSaloons.length > 0 && (
        <>
          <div className="w-full px-4">
            {currentItems.map((salon, index) => (
              <Card key={index} salon={salon} />
            ))}
          </div>

          {/* Load More */}
          {currentItems.length != filteredSaloons.length && (
            <div>
              <button
                className=" text-base tracking-[1px] rounded-lg bg-primary-grey px-20 text-white py-3 mt-4 md:mt-0 cursor-pointer"
                onClick={handleLoadMore}
              >
                {t("Load more")}
              </button>
            </div>
          )}

          {/* Pagination controls */}
          <div className="flex gap-2 mt-4 justify-center text-primary-text2">
            <button
              className={`px-4 py-2 border rounded-lg cursor-pointer ${currentPage === 1 ? "hidden" : "block"}`}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              1
            </button>
            <button
              className={`px-4 py-2 border rounded-lg cursor-pointer ${currentPage === 1 ? "hidden" : "block"}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <button className={`px-4 py-2 border rounded-lg`}>{currentPage}</button>
            <button
              className={`px-4 py-2 border rounded-lg cursor-pointer ${currentPage === totalPages ? "hidden" : "block"}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
            <button
              className={`px-4 py-2 border rounded-lg cursor-pointer ${currentPage === totalPages ? "hidden" : "block"}`}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              {totalPages}
            </button>
          </div>
        </>
      )}
      {/* Show message if no saloons are found */}
      {!loading && !error && filteredSaloons.length === 0 && <p className="text-primary-text2-light">{t("No Salons Found!")}</p>}
    </div>
  );
}
