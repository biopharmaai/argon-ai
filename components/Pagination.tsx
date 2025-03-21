"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "qs";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = qs.parse(searchParams.toString());
    const pageFromUrl = parseInt((q.page as string) || "1");
    setCurrentPage(pageFromUrl);
  }, [searchParams]);

  const updatePage = (page: number) => {
    const q = qs.parse(searchParams.toString());
    q.page = page;
    const newQS = qs.stringify(q);
    router.push(`?${newQS}`);
  };

  const getVisiblePages = () => {
    if (totalPages <= 1) return [1];
    if (currentPage === 1)
      return [1, 2, Math.min(3, totalPages)].filter((p) => p <= totalPages);
    if (currentPage === totalPages)
      return [Math.max(totalPages - 2, 1), totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      <button
        onClick={() => updatePage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded border ${
          currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => updatePage(page)}
          className={`px-3 py-1 rounded border ${
            page === currentPage
              ? "bg-blue-600 text-white font-bold"
              : "hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => updatePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded border ${
          currentPage === totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
