"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface FilterContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  brandTerm: string;
  setBrandTerm: (term: string) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  updateFilters: (updates: { search?: string; brand?: string; page?: number; limit?: number }) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTermState] = useState(searchParams.get("search") || "");
  const [brandTerm, setBrandTermState] = useState(searchParams.get("brand") || "");
  const [page, setPageState] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimitState] = useState(Number(searchParams.get("limit")) || 9);

  // Sync state with URL params when they change (e.g. back button)
  useEffect(() => {
    setSearchTermState(searchParams.get("search") || "");
    setBrandTermState(searchParams.get("brand") || "");
    setPageState(Number(searchParams.get("page")) || 1);
    setLimitState(Number(searchParams.get("limit")) || 9);
  }, [searchParams]);

  const updateFilters = useCallback(
    (updates: { search?: string; brand?: string; page?: number; limit?: number }) => {
      // 1. Update Local State immediately
      if (updates.search !== undefined) setSearchTermState(updates.search);
      if (updates.brand !== undefined) setBrandTermState(updates.brand);
      if (updates.page !== undefined) setPageState(updates.page);
      if (updates.limit !== undefined) setLimitState(updates.limit);

      // 2. Update URL
      const params = new URLSearchParams(searchParams.toString());

      if (updates.search !== undefined) {
        if (updates.search) params.set("search", updates.search);
        else params.delete("search");
      }

      if (updates.brand !== undefined) {
        if (updates.brand) params.set("brand", updates.brand);
        else params.delete("brand");
      }

      if (updates.page !== undefined) {
        if (updates.page > 1) params.set("page", String(updates.page));
        else params.delete("page");
      }

      if (updates.limit !== undefined) {
        if (updates.limit !== 9) params.set("limit", String(updates.limit));
        else params.delete("limit");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setSearchTerm = (term: string) => {
    updateFilters({ search: term, page: 1 });
  };

  const setBrandTerm = (term: string) => {
    updateFilters({ brand: term, page: 1 });
  };

  const setPage = (newPage: number) => {
    updateFilters({ page: newPage });
  };

  const setLimit = (newLimit: number) => {
    updateFilters({ limit: newLimit });
  };

  return (
    <FilterContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        brandTerm,
        setBrandTerm,
        page,
        setPage,
        limit,
        setLimit,
        updateFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
