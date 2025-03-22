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
  const currentPage = React.useMemo(() => {
    const query = qs.parse(queryString, { ignoreQueryPrefix: true });
    const pageParam = query.page;
    return typeof pageParam === "string" ? Number(pageParam) || 1 : 1;
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
  return (
    <div className="my-4 flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className="px-3"
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
