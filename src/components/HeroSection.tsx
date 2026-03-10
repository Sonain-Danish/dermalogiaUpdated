"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { MapFilterBar } from "./MapFilterBar";

export const HeroSection = () => {
  const { t } = useTranslation("Home");

  return (
    <div className="relative w-full h-101.5 md:h-83.25 bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/assets/hero-bg.png" alt="Hero background" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center pt-8 md:pt-0">
        <div className="absolute top-25 text-center flex flex-col items-center justify-center md:relative md:top-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="whitespace-pre-wrap font-helvetica font-medium text-[32px] md:text-[40px] leading-tight text-white uppercase mb-3 md:mb-4 max-w-3xl px-2 text-center"
          >
            {t("FIND A VERIFIED\nSALON NEAR YOU")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-geist font-light text-sm md:text-base text-gray-200 max-w-2xl "
          >
            {t("Professional salons working with premium brands")}
          </motion.p>
        </div>

        {/* Search Bar - overlapping bottom */}
        <div className="absolute -bottom-45 md:-bottom-32 w-full px-4 z-9999">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <MapFilterBar />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
