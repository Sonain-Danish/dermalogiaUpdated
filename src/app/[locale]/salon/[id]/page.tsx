"use client";

import { FadeIn } from "@/components/FadeIn";
import { SalonActionButtons } from "@/components/SalonActionButtons";
import { SalonImageGallery } from "@/components/SalonImageGallery";
import { SalonLocationMap } from "@/components/SalonLocationMap";
import { SalonOpeningHours } from "@/components/SalonOpeningHours";
import { useSalonById } from "@/lib/hooks/useSalonData";
import { getSalonStatusAndNextTime, translateRelativeTime } from "@/lib/salonUtils";
import { Brand, Certificate, Salon, SalonReview, SalonService } from "@/types/schema";
import { TFunction } from "i18next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BsTelephone } from "react-icons/bs";
import { FiMapPin, FiStar } from "react-icons/fi";
import { PiGlobeSimpleLight } from "react-icons/pi";

export default function SalonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = params.locale as string;

  const { t } = useTranslation("Home");
  const { salon, isLoading, isError } = useSalonById(id);

  const iframeScrollToTop = () => {
    window.parent.postMessage({ type: "scrollToTop" }, "*");
  };

  useEffect(() => {
    iframeScrollToTop();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background-primary flex flex-col gap-10 p-8 animate-pulse">
        <div className="h-4 bg-background-secondary w-1/3 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-video bg-background-secondary rounded" />
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="h-6 bg-background-secondary w-2/3 rounded" />
            <div className="h-4 bg-background-secondary w-full rounded" />
            <div className="h-4 bg-background-secondary w-4/5 rounded" />
            <div className="h-4 bg-background-secondary w-1/2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !salon) {
    notFound();
  }

  const { status, nextTime } = getSalonStatusAndNextTime(t, salon.salonTiming);
  const hasServices = salon.offeredServices && salon.offeredServices.length > 0;
  const hasBrands = salon.brands && salon.brands.length > 0;
  const hasCertificates = salon.certificates && salon.certificates.length > 0;
  const hasReviews = salon.reviews && salon.reviews.length > 0;

  return (
    <div className="bg-background-primary font-sans flex flex-col">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <NextLink
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-text-secondary-1 hover:text-text-primary transition-colors cursor-pointer group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-light uppercase tracking-wider">{t("Back", "Back")}</span>
        </NextLink>
      </div>

      <div className="container mx-auto px-4">
        <FadeIn className="flex flex-col gap-10 lg:gap-16">
          {/* TOP SECTION: Image + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 lg:items-stretch">
            <div className="lg:col-span-6">
              <SalonImageGallery salon={salon} matchHeight />
            </div>

            <div className="lg:col-span-6">
              <div className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex text-text-primary text-xs gap-0.5">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(salon.rating || 0) ? "fill-text-primary text-text-primary" : "text-text-secondary-2"}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-sm text-text-primary">{salon.rating || 0}</span>
                    <span className="text-text-secondary-1 text-sm font-light">
                      ({salon.ratingCount || 0} {t("Reviews").toLowerCase()})
                    </span>
                  </div>

                  <h1 className="text-[26px] font-light font-helvetica leading-tight text-text-primary wrap-break-word">
                    {salon.name}
                  </h1>

                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4.5 h-4.5 mt-1 shrink-0 text-brand-primary" />
                      <div className="flex flex-col">
                        <h3 className="hidden sm:block font-helvetica uppercase tracking-wider text-text-secondary-1">
                          {t("Location Label")}
                        </h3>
                        <span className="text-text-primary font-medium">{salon.address}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <BsTelephone className="w-4.5 h-4.5 mt-1 shrink-0 text-brand-primary" />
                      <div className="flex flex-col">
                        <h3 className="hidden sm:block font-helvetica uppercase tracking-wider text-text-secondary-1">
                          {t("Phone Number")}
                        </h3>
                        <span className="text-text-primary font-medium">{salon.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <PiGlobeSimpleLight className="w-5 h-5 mt-0.5 shrink-0 text-brand-primary" />
                      <div className="flex flex-col">
                        <h3 className="hidden sm:block font-helvetica uppercase tracking-wider text-text-secondary-1">
                          {t("Website")}
                        </h3>
                        <a
                          href={`https://${salon.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-primary font-medium hover:underline line-clamp-2 break-all cursor-pointer"
                        >
                          {salon.website}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Image
                        src="/clock_brand.svg"
                        width={20}
                        height={20}
                        alt="clock icon"
                        className="w-5 h-5 mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col">
                        <h3 className="hidden sm:block font-helvetica uppercase tracking-wider text-text-secondary-1">
                          {t("Opening Hours")}
                        </h3>
                        <SalonOpeningHours status={status} nextTime={nextTime} salonTiming={salon.salonTiming} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <SalonActionButtons salon={salon} />
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP: Content + Map */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start">
            <div className="lg:col-span-7 flex flex-col gap-10">
              <SectionAbout salon={salon} t={t} />
              {hasServices && (
                <>
                  <SectionServices salon={salon} t={t} />
                </>
              )}
              {hasBrands && (
                <>
                  {hasServices && <div className="h-px bg-border-divider w-full" />}
                  <SectionBrands salon={salon} t={t} />
                </>
              )}
              {hasCertificates && (
                <>
                  {(hasServices || hasBrands) && <div className="h-px bg-border-divider w-full" />}
                  <SectionCertification salon={salon} t={t} />
                </>
              )}
              {hasReviews && (
                <>
                  {(hasServices || hasBrands || hasCertificates) && <div className="h-px bg-border-divider w-full" />}
                  <SectionReviews salon={salon} t={t} />
                </>
              )}
            </div>
            <div className="lg:col-span-5">
              <div className="sticky top-8">
                <SalonLocationMap salon={salon} />
              </div>
            </div>
          </div>

          {/* MOBILE: Content */}
          <div className="lg:hidden flex flex-col gap-10 mt-8">
            <SectionAbout salon={salon} t={t} />
            {hasServices && (
              <>
                <SectionServices salon={salon} t={t} />
              </>
            )}
            <SalonLocationMap salon={salon} />
            {hasBrands && (
              <>
                {hasServices && <div className="h-px bg-border-divider w-full" />}
                <SectionBrands salon={salon} t={t} />
              </>
            )}
            {hasCertificates && (
              <>
                {(hasServices || hasBrands) && <div className="h-px bg-border-divider w-full" />}
                <SectionCertification salon={salon} t={t} />
              </>
            )}
            {hasReviews && (
              <>
                {(hasServices || hasBrands || hasCertificates) && <div className="h-px bg-border-divider w-full" />}
                <SectionReviews salon={salon} t={t} />
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

// -- Sub-components --

type ExtendedSalon = Salon & { description?: string };

function SectionAbout({ salon, t }: { salon: ExtendedSalon; t: TFunction }) {
  if (!salon.description) return null;
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl uppercase tracking-widest font-light text-text-primary font-helvetica">
        {t("About Salon")}
      </h3>
      <div className="prose prose-stone max-w-none text-text-body font-light leading-relaxed text-sm lg:text-base">
        <p>{salon.description}</p>
        <p className="mt-4">{t("About Boilerplate")}</p>
      </div>
    </div>
  );
}

function SectionServices({ salon, t }: { salon: Salon; t: TFunction }) {
  const services = salon.offeredServices || [];
  if (services.length === 0) return null;
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl uppercase tracking-widest font-light text-text-primary font-helvetica">
        {t("Services")}
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
        {services.map((service: SalonService, idx: number) => (
          <li key={idx} className="flex items-center gap-3 text-text-body font-light text-sm lg:text-base">
            <span className="w-1 h-1 rounded-full bg-text-primary shrink-0" />
            {service.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionBrands({ salon, t }: { salon: Salon; t: TFunction }) {
  const brands = salon.brands || [];
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl uppercase tracking-widest font-light text-text-primary font-helvetica">{t("Brands")}</h3>
      <div className="flex flex-wrap gap-3">
        {brands.length > 0 ? (
          brands.map((brand: Brand, idx: number) => (
            <span
              key={idx}
              className="px-2 py-1 bg-brand-primary/10 border border-brand-primary/40 text-text-primary text-sm uppercase tracking-wider font-helvetica font-normal"
            >
              {brand.name}
            </span>
          ))
        ) : (
          <span className="text-text-secondary-1 font-light italic text-sm">{t("Brands not available")}</span>
        )}
      </div>
    </div>
  );
}

function SectionCertification({ salon, t }: { salon: Salon; t: TFunction }) {
  const certificates = salon.certificates || [];
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl uppercase tracking-widest font-light text-text-primary font-helvetica">
        {t("Certifications")}
      </h3>
      <div className="flex flex-wrap gap-8">
        {certificates.length > 0 ? (
          certificates.map((cert: Certificate, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center relative">
                <Image src="/certificate.svg" alt="Certificate" fill className="object-contain" />
              </div>
              <span className="font-light text-text-body text-sm md:text-base">{cert.name}</span>
            </div>
          ))
        ) : (
          <span className="text-text-secondary-1 font-light italic text-sm">{t("Certifications not available")}</span>
        )}
      </div>
    </div>
  );
}

function SectionReviews({ salon, t }: { salon: Salon; t: TFunction }) {
  const reviews = salon.reviews || [];
  const params = useParams();
  const locale = params.locale;

  return (
    <div className="flex flex-col gap-6 mb-6">
      <h3 className="text-2xl uppercase tracking-widest font-light text-text-primary font-helvetica">{t("Reviews")}</h3>
      <div className="flex flex-col gap-10">
        {reviews.map((review: SalonReview, idx: number) => {
          const author = review.authorAttribution?.displayName || "Anonymous";
          const avatarLetter = author.charAt(0).toUpperCase();
          const rating = review.rating || 0;
          const reviewText =
            locale == "en"
              ? review.text?.text || review.originalText?.text || ""
              : review.originalText?.text || review.text?.text || "";
          const date = translateRelativeTime(review.relativePublishTimeDescription || "", t);

          return (
            <div key={idx} className="flex gap-4">
              {review.authorAttribution?.photoUri ? (
                <Image
                  src={review.authorAttribution.photoUri}
                  alt={author}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full shrink-0 object-cover border border-border-divider"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-background-secondary shrink-0 flex items-center justify-center text-text-secondary-1 font-medium text-lg border border-border-divider">
                  {avatarLetter}
                </div>
              )}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-text-primary uppercase">{author}</p>
                    <div className="flex text-text-primary text-[10px] mt-1 gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-text-primary" : "fill-none text-text-secondary-2"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {date && <span className="text-sm text-text-secondary-1 font-light shrink-0">{date}</span>}
                </div>
                {reviewText && <p className="text-text-body leading-relaxed font-light">{reviewText}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
