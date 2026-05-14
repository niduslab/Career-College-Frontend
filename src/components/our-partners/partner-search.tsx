"use client";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Country } from "country-state-city";

const TYPES = ["All Types", "University", "Industry", "Government", "NGO"];

const ALL_COUNTRIES = [
  { name: "All Countries", code: "", flag: "" },
  ...Country.getAllCountries().map((c) => ({
    name: c.name,
    code: c.isoCode,
    flag: c.flag ?? "",
  })),
];

interface PartnerSearchProps {
  search: string;
  type: string;
  country: string;
  onSearch: (v: string) => void;
  onType: (v: string) => void;
  onCountry: (v: string) => void;
  onSubmit: () => void;
}

export default function PartnerSearch({
  search,
  type,
  country,
  onSearch,
  onType,
  onCountry,
  onSubmit,
}: PartnerSearchProps) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const typeRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countrySearch
    ? ALL_COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()),
      )
    : ALL_COUNTRIES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (
        countryRef.current &&
        !countryRef.current.contains(e.target as Node)
      ) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus country search input when dropdown opens
  useEffect(() => {
    if (showCountryDropdown) {
      setTimeout(() => countrySearchRef.current?.focus(), 50);
    }
  }, [showCountryDropdown]);

  return (
    <div className="bg-gray-100 rounded-2xl border border-gray-200 px-6 py-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
      {/* Search input */}
      <div className="flex items-center bg-white gap-6 flex-1 md:flex-none md:w-60 lg:w-115.75 border border-gray-200 rounded-lg px-4 py-3.5">
        <Search size={20} className="text-gray-400 shrink-0 " />
        <input
          type="text"
          placeholder="Search partners"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          className="flex-1 outline-none sg-p-default text-(--text-paragraph)  bg-transparent"
        />
      </div>

      {/* Spacer — pushes dropdowns + button to the right on large screens */}
      <div className="hidden lg:flex flex-1" />

      {/* Type dropdown */}
      <div ref={typeRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setShowTypeDropdown((prev) => !prev);
            setShowCountryDropdown(false);
            setCountrySearch("");
          }}
          className="w-full h-full min-w-36 md:min-w-28 lg:min-w-36 flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-4 py-3.5 bg-white sg-p-default text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--primary-700) cursor-pointer"
        >
          <span>{type}</span>
          {showTypeDropdown ? (
            <ChevronUp size={18} className="text-gray-500 shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-gray-500 shrink-0" />
          )}
        </button>
        {showTypeDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onType(t);
                  setShowTypeDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left sg-p-default transition-colors border-b border-gray-100 last:border-b-0 hover:bg-purple-50 ${
                  type === t
                    ? "text-(--primary-700) font-semibold"
                    : "text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Country dropdown */}
      <div ref={countryRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setShowCountryDropdown((prev) => !prev);
            setShowTypeDropdown(false);
          }}
          className="w-full h-full min-w-44 md:min-w-32 lg:min-w-38 xl:min-w-44 flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-4 py-3.5 bg-white sg-p-default text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--primary-700) cursor-pointer"
        >
          <span className="flex items-center gap-2 truncate">
            {country !== "All Countries" &&
              ALL_COUNTRIES.find((c) => c.name === country)?.flag && (
                <span>
                  {ALL_COUNTRIES.find((c) => c.name === country)?.flag}
                </span>
              )}
            <span className="truncate">{country}</span>
          </span>
          {showCountryDropdown ? (
            <ChevronUp size={18} className="text-gray-500 shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-gray-500 shrink-0" />
          )}
        </button>

        {showCountryDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col min-w-56">
            {/* Search inside dropdown */}
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3.5">
                <Search size={20} className="text-gray-400 shrink-0" />
                <input
                  ref={countrySearchRef}
                  type="text"
                  placeholder="Search country..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="flex-1 outline-none sg-p-default text-(--text-paragraph) bg-transparent"
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.code || "all"}
                    type="button"
                    onClick={() => {
                      onCountry(c.name);
                      setShowCountryDropdown(false);
                      setCountrySearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left sg-p-default transition-colors border-b border-gray-100 last:border-b-0 hover:bg-purple-50 ${
                      country === c.name
                        ? "text-(--primary-700) font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {c.flag && <span className="text-base">{c.flag}</span>}
                    <span>{c.name}</span>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 sg-p-default text-gray-400">
                  No countries found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={onSubmit}
        className="bg-(--primary-700) text-white font-semibold sg-p-default px-6 md:px-6 lg:px-6 py-3.5 rounded-lg transition-colors cursor-pointer"
      >
        Search
      </button>
    </div>
  );
}
