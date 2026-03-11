"use client";

import i18nConfig from "@/i18nConfig";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function NavBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isActive = (path: any) => pathname && pathname.endsWith(path);

  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");

  const locale = i18nConfig.locales.find((loc) => pathname.startsWith(`/${loc}`)); // Extract locale prefix if present
  const linkPrefix = locale ? "/" + locale + "/" : "/";
  return (
    <div className="flex md:justify-center justify-evenly gap-2">
      <div>
        <Link
          href={`${linkPrefix}location-list` + (searchParams.size == 0 ? "" : "?") + searchParams.toString()}
          className={`p-2 m-2 text-[1rem] tracking-[1px]  ${
            isActive("/location-list") ? "font-normal text-primary-text2" : "font-light text-primary-text2-light"
          }`}
        >
          {t("List of branches")}
        </Link>
        <hr
          className={`${
            isActive("/location-list")
              ? "border-primary-text2 dark:border-white/80 border-[1px] "
              : "border-primary-text2-light/70 border-none"
          }`}
        />
      </div>
      <div>
        <Link
          href={`${linkPrefix}map` + (searchParams.size == 0 ? "" : "?") + searchParams.toString()}
          className={`p-2 m-2 text-[1rem] tracking-[1px] ${
            isActive("/map") ? "font-normal text-primary-text2" : "font-light text-primary-text2-light"
          }`}
        >
          {t("MAP")}
        </Link>
        <hr
          className={`${
            isActive("/map")
              ? "border-primary-text2 dark:border-white/80 border-[1px]"
              : "border-primary-text2-light/70 border-none "
          }`}
        />
      </div>
    </div>
  );
}
