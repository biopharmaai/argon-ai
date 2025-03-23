"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchBarSuggest from "./SearchBarSuggest";

export default function HeroSearchSection() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center px-6 pt-32 text-center">
      <h1 className="text-muted-foreground text-4xl font-semibold sm:text-5xl">
        <span className="block font-medium text-[#1B4DED]">
          Trusted AI Knowledge
        </span>
        <span className="block font-bold text-black">Built for Pharma</span>
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-lg">
        Fast, comprehensive and pharma-specific AI <br />
        safely deployed in your organization
      </p>

      <div className="mt-10 w-full max-w-3xl">
        <SearchBarSuggest />
      </div>
    </section>
  );
}
