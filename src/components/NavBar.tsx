"use client";

import clsx from "clsx";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";
import { IoCartOutline, IoHeartOutline, IoMenu, IoPersonOutline, IoSearch } from "react-icons/io5";

export const NavBar = () => {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide navbar on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastScrollY(latest);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={clsx("fixed top-0 left-0 right-0 z-50 w-full bg-background-primary border-b border-border-divider")}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center h-[64px] md:h-auto">
        {/* Desktop Left: Menu & Search */}
        <div className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-2 group">
            <IoMenu className="w-6 h-6" />
            <span className="font-arpona text-sm uppercase font-light tracking-wide group-hover:underline">Menu</span>
          </button>
          <button>
            <IoSearch className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Left: Menu */}
        <div className="md:hidden">
          <button>
            <IoMenu className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NextLink href="/">
            {/* Logo dimensions from Figma: Desktop 208x39, Mobile 177x33 */}
            <div className="relative w-[177px] h-[33px] md:w-[208px] md:h-[40px]">
              <Image src="/assets/logo.svg" alt="Salon Online" fill className="object-contain" priority />
            </div>
          </NextLink>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          {/* Desktop only: Heart */}
          <button className="hidden md:block">
            <IoHeartOutline className="w-6 h-6" />
          </button>

          {/* Account */}
          <button>
            <IoPersonOutline className="w-6 h-6" />
          </button>

          {/* Cart */}
          <button className="relative">
            <IoCartOutline className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              3
            </div>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
