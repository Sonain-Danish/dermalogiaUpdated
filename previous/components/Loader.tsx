"use client";
import gif from "@/public/logo-animation/animated_logo.gif";
import gifDark from "@/public/logo-animation/animated_logo_dark.gif";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react"; // Import useState and useEffect

export default function Loader() {
  const { resolvedTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // Initialize mounted state

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted, return null or a placeholder to prevent hydration mismatch
  if (!mounted) {
    return <div></div>;
  }

  const isDarkTheme = forcedTheme ? forcedTheme === "dark" : resolvedTheme === "dark";

  return (
    <div className="flex justify-center items-center mt-16">
      {isDarkTheme ? <Image src={gifDark} alt="Loading..." width={300} /> : <Image src={gif} alt="Loading..." width={300} />}
    </div>
  );
}
