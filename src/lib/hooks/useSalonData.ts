import { Salon, SalonService } from "@/types/schema";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useSalonsData = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const serviceTerm = searchParams.get("service") || "";

  const query = useQuery({
    queryKey: ["salons"],
    queryFn: async (): Promise<Salon[]> => {
      // const response = await fetch(`${API_BASE_URL}/api/salons?salonType=SALON_ONLINE`);
      const response = await fetch(`${API_BASE_URL}/api/salons/dermalogica`);
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

    if (serviceTerm) {
      const lowerService = serviceTerm.toLowerCase();
      result = result.filter((salon) =>
        salon.offeredServices?.some((s: SalonService | string) => {
          // Handle both string array or obj array with name property
          const sName = typeof s === "string" ? s : s.name;
          return sName && sName.toLowerCase() === lowerService;
        }),
      );
    }

    return result;
  }, [query.data, searchTerm, serviceTerm]);

  return {
    ...query,
    salons: query.data || [],
    allSalons: query.data || [],
    filteredSalons,
    searchTerm,
    serviceTerm,
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

export const useServicesData = () => {
  const query = useQuery({
    queryKey: ["services"],
    queryFn: async (): Promise<SalonService[]> => {
      const response = await fetch(`${API_BASE_URL}/api/salon-services`);
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    services: query.data || [],
  };
};
