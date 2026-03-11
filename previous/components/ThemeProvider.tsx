"use client";

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";
import { useSearchParams } from "next/navigation";

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");

  const forcedTheme = theme == "light" ? "light" : theme == "dark" ? "dark" : undefined;

  return (
    <NextThemesProvider {...props} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  );
}
