import { Brand, Salon } from "@/types/schema";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useSalonsData = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const brandTerm = searchParams.get("brand") || "";

  const query = useQuery({
    queryKey: ["salons"],
    queryFn: async (): Promise<Salon[]> => {
      const response = await fetch(`${API_BASE_URL}/api/salons?salonType=SALON_ONLINE`);
      // const response = await fetch(`${API_BASE_URL}/api/salons/dermalogica`);
      if (!response.ok) {
        throw new Error("Failed to fetch salons");
      }

      const payload = await response.json();

      let data = payload;
      // Handle potential wrapper objects gracefully
      if (!Array.isArray(payload) && payload.data && Array.isArray(payload.data)) {
        data = payload.data;
      }

      if (!Array.isArray(data)) {
        console.error("Invalid format: expected an array but got", data);
        return [];
      }

      return data;
    },
    // Don't refetch on window focus since all filtering is local
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredSalons = useMemo(() => {
    if (!query.data) return [];

    let result = query.data.map((salon) => ({
      ...salon,
      address: removeCountryName(salon.address),
    }));

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((salon) => {
        const name = salon.name?.toLowerCase() || "";
        const address = salon.address?.toLowerCase() || "";
        const city = salon.placeCity?.toLowerCase() || "";
        return name.includes(lowerTerm) || address.includes(lowerTerm) || city.includes(lowerTerm);
      });
    }

    if (brandTerm) {
      const lowerBrand = brandTerm.toLowerCase();
      result = result.filter((salon) =>
        salon.brands?.some((b: Brand | string) => {
          // Handle both string array or obj array with name property
          const bName = typeof b === "string" ? b : b.name;
          return bName && bName.toLowerCase() === lowerBrand;
        }),
      );
    }

    return result;
  }, [query.data, searchTerm, brandTerm]);

  return {
    ...query,
    salons: query.data || [],
    allSalons: query.data || [],
    filteredSalons,
    searchTerm,
    brandTerm,
  };
};

export const useSalonById = (id: string) => {
  const query = useQuery({
    queryKey: ["salon", id],
    queryFn: async (): Promise<Salon> => {
      const response = await fetch(`${API_BASE_URL}/api/salons/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch salon with id: ${id}`);
      }
      const data: Salon = await response.json();
      return {
        ...data,
        address: removeCountryName(data.address),
      };
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    salon: query.data ?? null,
  };
};

const removeCountryName = (address?: string): string => {
  if (!address) return "";
  const lastCommaIndex = address.lastIndexOf(",");
  if (lastCommaIndex !== -1) {
    return address.substring(0, lastCommaIndex).trim();
  }
  return address;
};

export const useBrandsData = () => {
  const query = useQuery({
    queryKey: ["brands"],
    queryFn: async (): Promise<Brand[]> => {
      const response = await fetch(`${API_BASE_URL}/api/brands`);
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    brands: query.data || [],
  };
};
