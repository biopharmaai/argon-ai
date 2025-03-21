"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getVisiblePages = () => {
    if (totalPages <= 1) return [];

    if (currentPage === 1) {
      return [1, 2, 3].filter((p) => p <= totalPages);
    }

    if (currentPage === totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages].filter((p) => p >= 1);
    }

    return [currentPage - 1, currentPage, currentPage + 1].filter(
      (p) => p >= 1 && p <= totalPages,
    );
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="my-4 flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded border p-2 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded border px-3 py-1 ${
            page === currentPage
              ? "bg-blue-600 font-bold text-white"
              : "bg-white text-gray-800 hover:cursor-pointer hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded border p-2 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
