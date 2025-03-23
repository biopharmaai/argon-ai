"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const placeholders = [
  "AUTOMATE COMPETITIVE INTELLIGENCE...",
  "WHAT ABSTRACTS ARE BEING PUBLISHED...",
  "HOW ARE COMPANIES POSITIONING THEIR DRUGS...",
  "WHAT DO DOCTORS CONSIDER WHEN PRESCRIBING...",
];

export default function HeroSearchSection() {
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = placeholders[phraseIndex];
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setCharIndex((prev) => prev - 1);
        } else {
          setCharIndex((prev) => prev + 1);
        }

        if (!isDeleting && charIndex === current.length) {
          setIsDeleting(true);
          setTimeout(() => {}, 1000);
        } else if (isDeleting && charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % placeholders.length);
        }

        setPlaceholder(current.substring(0, charIndex));
      },
      isDeleting ? 40 : 100,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = new FormData(e.currentTarget).get("q") as string;
    router.push(`/search?term=${encodeURIComponent(term)}`);
  };

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

      <form
        onSubmit={handleSubmit}
        className="mt-10 flex w-full max-w-3xl items-center rounded-lg border border-[#1B4DED] bg-white px-4 py-6 shadow-sm focus-within:ring-2 focus-within:ring-[#1B4DED] sm:py-4"
      >
        <Input
          name="q"
          className="w-full border-none px-2 font-mono text-lg tracking-tight focus:ring-0 focus:outline-none"
          placeholder={placeholder}
        />
        <Button
          type="submit"
          className="ml-2 h-9 w-9 rounded-md bg-white hover:bg-gray-100"
          variant="ghost"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
