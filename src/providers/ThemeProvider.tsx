"use client";

import i18nConfig from "@/i18nConfig";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Component to sync URL query params (theme, locale) with app state
function AppStateSync() {
  const searchParams = useSearchParams();
  const { setTheme, theme: currentTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Sync Theme from URL
    const themeParam = searchParams.get("theme");
    if ((themeParam === "light" || themeParam === "dark") && themeParam !== currentTheme) {
      setTheme(themeParam);
    }

    // 2. Sync Locale from URL (e.g. ?cs, ?sk)
    // Check if any available locale (except maybe default?) is present as a query key
    const availableLocales = i18nConfig.locales;
    const requestedLocaleParam = availableLocales.find((loc) => searchParams.has(loc));

    if (requestedLocaleParam) {
      // Logic to switch locale path
      const segments = pathname.split("/").filter(Boolean);
      const firstSegment = segments[0];
      let newPath = "";

      if (firstSegment && availableLocales.includes(firstSegment)) {
        // We are at a path with explicit locale (e.g. /en/...)
        if (firstSegment !== requestedLocaleParam) {
          // Replace the locale segment
          segments[0] = requestedLocaleParam;
          newPath = `/${segments.join("/")}`;
        }
      } else {
        // We are at a path without explicit locale (e.g. /salon/...) -> Default locale is likely active
        // If requested locale is different from default (implied), or we just want to force explicit path
        // For simplicity, we just prepend the requested locale to force the switch
        newPath = `/${requestedLocaleParam}${pathname === "/" ? "" : pathname}`;
      }

      if (newPath) {
        // Construct new Search Params (removing the locale flag)
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete(requestedLocaleParam);

        const queryString = newSearchParams.toString();
        const fullUrl = queryString ? `${newPath}?${queryString}` : newPath;

        router.replace(fullUrl);
      }
    }
  }, [searchParams, setTheme, currentTheme, pathname, router]);

  return null;
}

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <AppStateSync />
      {children}
    </NextThemesProvider>
  );
}
