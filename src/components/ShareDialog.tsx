"use client";

import { Salon } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiCopy, FiLink, FiX } from "react-icons/fi";

interface ShareDialogProps {
  salon: Salon;
  isOpen: boolean;
  onClose: () => void;
  // Optional override for the URL to share, otherwise calculates it based on salon
  url?: string;
}

export const ShareDialog = ({ salon, isOpen, onClose, url: overrideUrl }: ShareDialogProps) => {
  const { t } = useTranslation("Home");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (overrideUrl) {
      setShareUrl(overrideUrl);
      return;
    }

    let url = window.location.href;
    // If not on map page with specific salonId, or detail page, try to construct a map link
    // But typically we want to share the link to this salon in our app if possible.
    // Ideally the parent passes the correct deep link.
    // If not, we fallback to Google Maps or generic logic.

    if (salon.placeUrl) {
      url = salon.placeUrl;
    } else if (salon.placeId) {
      url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${salon.placeId}`;
    } else if (salon.location && salon.location.coordinates) {
      const [lng, lat] = salon.location.coordinates;
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    setShareUrl(url);
  }, [salon, overrideUrl]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(t("Link copied"));
  };

  const shareText = `Check out this location: ${salon.name}`;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-background-secondary rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-primary hover:opacity-70 transition-opacity"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Header */}
        <h3 className="font-arpona uppercase tracking-widest text-lg text-text-primary mb-4">
          {t("Share Salon")}
        </h3>

        {/* Subtext */}
        <p className="text-text-secondary-1 font-light text-sm mb-6 leading-relaxed">
          {t("Share Subtitle")}
        </p>

        {/* URL Input */}
        <div className="flex items-center gap-3 border border-border-divider p-3 mb-6 bg-background-primary">
          <FiLink className="w-5 h-5 text-text-secondary-1 shrink-0" />
          <span className="flex-1 truncate text-sm text-text-primary">{shareUrl}</span>
          <button
            onClick={copyToClipboard}
            className="bg-black text-white p-2.5  hover:bg-gray-800 transition-colors shrink-0"
            title={t("Copy Link Button")}
          >
            <FiCopy className="w-4 h-4" />
          </button>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="w-12 h-12 border border-border-divider bg-background-primary flex items-center justify-center text-text-primary transition-all group-hover:border-text-primary group-hover:bg-background-secondary">
              <FaFacebookF className="w-5 h-5" />
            </div>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="w-12 h-12 border border-border-divider bg-background-primary flex items-center justify-center text-text-primary transition-all group-hover:border-text-primary group-hover:bg-background-secondary">
              <FaXTwitter className="w-5 h-5" />
            </div>
          </a>

          <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" className="group">
            <div className="w-12 h-12 border border-border-divider bg-background-primary flex items-center justify-center text-text-primary transition-all group-hover:border-text-primary group-hover:bg-background-secondary">
              <FaInstagram className="w-6 h-6" />
            </div>
          </a>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="w-12 h-12 border border-border-divider bg-background-primary flex items-center justify-center text-text-primary transition-all group-hover:border-text-primary group-hover:bg-background-secondary">
              <FaWhatsapp className="w-6 h-6" />
            </div>
          </a>

          <a
            href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
            className="group"
          >
            <div className="w-12 h-12  border border-border-divider bg-background-primary flex items-center justify-center text-text-primary transition-all group-hover:border-text-primary group-hover:bg-background-secondary">
              <FaEnvelope className="w-5 h-5" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
