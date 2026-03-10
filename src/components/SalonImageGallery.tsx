"use client";

import { resolveUrl } from "@/lib/salonUtils";
import { Salon } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SalonImageGalleryProps {
  salon: Salon;
  matchHeight?: boolean;
}

export const SalonImageGallery = ({ salon, matchHeight = false }: SalonImageGalleryProps) => {
  // Determine which images to show
  let rawImages: string[] = [];

  if (salon.logoUrl) {
    rawImages = [salon.logoUrl];
  }
  if (salon.photos && salon.photos.length > 0) {
    rawImages = [...rawImages, ...salon.photos];
  }

  const images = rawImages.length > 0 ? rawImages.map((img) => resolveUrl(img)) : [resolveUrl(undefined)];

  const [currentIndex, setCurrentIndex] = useState(0);
  // State to track failed images by index to avoid mutating props or complex array application
  const [failedImages, setFailedImages] = useState<{ [key: number]: boolean }>({});

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const hasMultipleImages = images.length > 1;

  return (
    <div className="h-full">
      <div
        className={`relative w-full overflow-hidden rounded-lg bg-background-secondary group ${
          matchHeight ? "aspect-4/3 lg:aspect-auto lg:h-full lg:min-h-104.5" : "aspect-4/3 lg:aspect-5/3"
        }`}
      >
        <Image
          src={failedImages[currentIndex] ? "/assets/default_salon_image.png" : images[currentIndex]}
          onError={() => setFailedImages((prev) => ({ ...prev, [currentIndex]: true }))}
          alt={salon.name || "Salon"}
          fill
          className="object-cover transition-all duration-300"
          priority
        />

        {/* Carousel Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-background-secondary/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background-secondary transition-colors z-10"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-6 h-6 text-cta-secondary" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-background-secondary/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background-secondary transition-colors z-10"
              aria-label="Next image"
            >
              <FiChevronRight className="w-6 h-6 text-cta-secondary" />
            </button>
          </>
        )}

        {/* Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-cta-secondary w-6" : "bg-white hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
