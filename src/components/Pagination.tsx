import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-16 mb-24">
      {/* Previous Button */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 border border-border-divider hover:cursor-pointer flex items-center justify-center text-text-primary hover:border-text-primary transition-colors"
          aria-label="Previous Page"
        >
          <IoChevronBack />
        </button>
      )}

      {/* Pages */}
      {/* Logic: Always show first, last, current, and neighbors */}
      {/* For this specific design [1] [>] [7], let's try to mimic standard behavior but minimal style */}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        // Show all pages if total is small
        if (totalPages <= 7) {
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 border flex items-center hover:cursor-pointer justify-center font-arpona text-sm transition-colors
                    ${
                      currentPage === page
                        ? "border-text-primary text-text-primary"
                        : "border-border-divider text-text-secondary-1 hover:border-text-primary hover:text-text-primary"
                    }`}
            >
              {page}
            </button>
          );
        }

        // Show start, end, current and dots for larger lists
        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 border flex items-center hover:cursor-pointer justify-center font-arpona text-sm transition-colors
                    ${
                      currentPage === page
                        ? "border-text-primary text-text-primary"
                        : "border-border-divider text-text-secondary-1 hover:border-text-primary hover:text-text-primary"
                    }`}
            >
              {page}
            </button>
          );
        } else if (page === currentPage - 2 || page === currentPage + 2) {
          return (
            <span
              key={page}
              className="w-10 h-10 flex items-center hover:cursor-pointer justify-center text-text-secondary-1"
            >
              ...
            </span>
          );
        }

        return null;
      })}

      {/* Next Button */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 border border-border-divider flex items-center hover:cursor-pointer justify-center text-text-primary hover:border-text-primary transition-colors"
          aria-label="Next Page"
        >
          <IoChevronForward />
        </button>
      )}
    </div>
  );
};
