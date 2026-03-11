"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Optional: Add analytics or other logic after iframe loads
  }, [iframeLoaded]);

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl text-center mb-8">
          Find a Salon Near You
        </h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="relative">
            {/* Loading shimmer effect */}
            {!iframeLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>}
            <iframe
              // src="https://salon-locator-app.vercel.app/cs/location-list"
              src="http://localhost:3000/location-list"
              // height="1000" // Adjust as needed. Consider dynamic height based on content.
              height="1000" // Adjust as needed. Consider dynamic height based on content.
              width={"100%"}
              frameBorder="0" // No border
              allowFullScreen
              scrolling="yes"
              loading="lazy"
              onLoad={() => setIframeLoaded(true)} // Set loaded state when iframe loads
              className={`rounded-lg ${iframeLoaded ? "opacity-100" : "opacity-0 transition-opacity duration-500"}`} // Fade in after load
            />
          </div>
        </div>
      </div>
    </div>
  );
}
