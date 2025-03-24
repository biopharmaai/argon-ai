"use client";

import qs from "qs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  queryString: string;
  totalPages: number;
  onPageChange: (newPage: number) => void;
};

export default function Pagination({
  queryString,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const currentPage = useMemo(() => {
    const query = qs.parse(queryString, { ignoreQueryPrefix: true });
    return Number(query.page) || 1;
  }, [queryString]);

  const visiblePages = useMemo(() => {
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
  }, [currentPage, totalPages]);

  return totalPages <= 1 ? null : (
    <div className="my-4 flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First Page"
      >
        First
      </Button>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
        size="icon"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
        size="icon"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last Page"
      >
        Last
      </Button>
    </div>
  );
}
