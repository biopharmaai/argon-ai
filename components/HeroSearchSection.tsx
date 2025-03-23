import SearchBarSuggest from "./SearchBarSuggest";

export default function HeroSearchSection() {
  return (
    <section className="flex h-screen flex-col items-center justify-center px-6 text-center">
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
