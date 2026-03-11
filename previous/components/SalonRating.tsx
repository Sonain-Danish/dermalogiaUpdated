import React from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface RatingStarsProps {
  rating?: number;
  ratingCount?: number;
  className?: string; // Optional className for additional styling
  color?: string;
}

const SalonRatings: React.FC<RatingStarsProps> = ({ rating, ratingCount, className, color = "#FACC15" }) => {
  if (!rating || rating < 0 || rating > 5) {
    return null; // Return null if rating is invalid or not provided
  }

  const fullStarsLength = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0; // Check for a half star
  const emptyStarsLength = 5 - fullStarsLength - (hasHalfStar ? 1 : 0);

  const fullStars = Array.from({ length: fullStarsLength }, (_, index) => (
    <FaStar key={`full-${index}`} color={color} size={20} />
  ));

  const halfStar = hasHalfStar ? <FaStarHalfAlt key="half" color={color} size={20} /> : null;

  const emptyStars = Array.from({ length: emptyStarsLength }, (_, index) => (
    <FaRegStar key={`empty-${index}`} color={color} size={20} />
  ));

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div className="text-gray-500">{rating.toFixed(1)}</div>
      <div className="flex gap-1">
        {" "}
        {/* Reduced gap for stars to look more cohesive */}
        {fullStars}
        {halfStar}
        {emptyStars}
      </div>
      {ratingCount !== undefined && <div className="text-gray-500 text-sm">({ratingCount})</div>}
    </div>
  );
};

export default SalonRatings;
