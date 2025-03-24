"use client";

import { Suspense } from "react";
import SearchPageContent from "./components/SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search page...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
