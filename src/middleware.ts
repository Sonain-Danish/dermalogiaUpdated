import { i18nRouter } from "next-i18n-router";
import { NextRequest, NextResponse } from "next/server";
import i18nConfig from "./i18nConfig";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token"); // Get the token from cookies
  const url = request.nextUrl; // Get the URL of the incoming request
  const pathname = url.pathname; // Pathname of the URL

  // Extract locale from the URL
  const locale = i18nConfig.locales.find((loc) => pathname.startsWith(`/${loc}`)); // Extract locale prefix if present

  // Remove the locale prefix from the pathname for route matching
  const pathWithoutLocale = locale ? pathname.replace(`/${locale}`, "") || "/" : pathname;

  // Protected Routes
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/add-saloon-brands",
    "/dashboard/add-saloons",
    "/dashboard/add_partner_saloons",
  ];

  // Check if the path matches a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathWithoutLocale.startsWith(route));

  // Handle unauthenticated access to protected routes
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(`/${locale || i18nConfig.defaultLocale}/login`, request.url)); // Redirect to login page with locale
  }

  // Handle authenticated users trying to access the login page
  if (pathWithoutLocale === "/login" && token) {
    return NextResponse.redirect(new URL(`/${locale || i18nConfig.defaultLocale}/dashboard`, request.url)); // Redirect to dashboard with locale
  }

  // Apply i18n routing for all other paths
  return i18nRouter(request, i18nConfig);
}

// Applies this middleware to specific routes
export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)", // Excludes API and static files
};
