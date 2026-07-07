"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Country } from "country-state-city";
import { ArrowRight, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import {
  browsePublicInstructors,
  type PublicInstructorListItem,
} from "@/lib/profile-api";
import {
  mediaUrl,
  initialsOf,
} from "@/components/dashboard/settings-shared/helpers";
import { SelectDropdown } from "@/components/common/select-dropdown";
import { ApiError } from "@/lib/api";

const PAGE_SIZE = 12;

const VERIFIED_FILTER_OPTIONS = [
  { value: "", label: "All instructors" },
  { value: "true", label: "Verified only" },
  { value: "false", label: "Unverified only" },
];

export function InstructorsGridSection() {
  const [instructors, setInstructors] = useState<PublicInstructorListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [country, setCountry] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const isVerified =
    verifiedFilter === "" ? undefined : verifiedFilter === "true";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    browsePublicInstructors({
      page: 1,
      page_size: PAGE_SIZE,
      country: country || undefined,
      is_verified: isVerified,
    })
      .then((res) => {
        if (!active) return;
        setInstructors(res.results);
        setHasNext(Boolean(res.next));
        setPage(1);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiError ? err.detail : "Failed to load instructors.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, verifiedFilter]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await browsePublicInstructors({
        page: page + 1,
        page_size: PAGE_SIZE,
        country: country || undefined,
        is_verified: isVerified,
      });
      setInstructors((prev) => [...prev, ...res.results]);
      setHasNext(Boolean(res.next));
      setPage((p) => p + 1);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Failed to load more instructors.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2 className="text-center lg:text-[48px] text-2xl font-semibold text-(--text-title)">
          Meet Our Instructors
        </h2>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div ref={countryRef} className="relative w-56">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search country..."
                value={countryOpen ? countrySearch : country}
                onChange={(e) => setCountrySearch(e.target.value)}
                onFocus={() => {
                  setCountryOpen(true);
                  setCountrySearch("");
                }}
                className="w-full h-12 pl-10 pr-10 rounded-lg border border-(--gray-200) bg-white text-[14px] text-gray-500 placeholder-gray-500 outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                {countryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            {countryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCountry("");
                    setCountrySearch("");
                    setCountryOpen(false);
                  }}
                  className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 cursor-pointer text-gray-500 sg-p-default"
                >
                  All countries
                </button>
                {filteredCountries.length === 0 ? (
                  <p className="px-4 py-3 text-gray-400 sg-p-default">
                    No countries found
                  </p>
                ) : (
                  filteredCountries.map((c) => (
                    <button
                      key={c.isoCode}
                      type="button"
                      onClick={() => {
                        setCountry(c.name);
                        setCountrySearch("");
                        setCountryOpen(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer text-gray-500 sg-p-default"
                    >
                      {c.flag} {c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="w-48">
            <SelectDropdown
              value={verifiedFilter}
              onChange={setVerifiedFilter}
              options={VERIFIED_FILTER_OPTIONS}
              placeholder="All instructors"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-(--primary-700)" />
          </div>
        ) : error ? (
          <p className="mt-10 text-center text-[14px] text-red-500">{error}</p>
        ) : instructors.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-(--gray-400)">
            No public instructor profiles found.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-x-5 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:mt-10 lg:mt-12">
              {instructors.map((instructor) => {
                const photoUrl = mediaUrl(instructor.profile_photo);
                return (
                  <article key={instructor.slug} className="group">
                    <Link href={`/all-instructors-details/${instructor.slug}`}>
                      <div className="relative overflow-hidden rounded-2xl aspect-4/5 bg-(--gray-100) flex items-center justify-center">
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={instructor.full_name}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 295px"
                            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <span className="text-[32px] font-semibold text-(--primary-700)">
                            {initialsOf(instructor.full_name)}
                          </span>
                        )}
                        {instructor.is_verified && (
                          <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                            Verified
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-[18px] lg:text-[24px] font-semibold text-(--text-title) group-hover:underline">
                        {instructor.full_name}
                      </h3>
                    </Link>
                    <p className="mt-1 lg:text-[16px] text-[14px] text-(--text-paragraph) font-normal truncate">
                      {instructor.headline || instructor.specialization.join(", ")}
                    </p>
                    {instructor.country && (
                      <p className="mt-0.5 text-[13px] text-(--gray-400)">
                        {instructor.country}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {hasNext && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 py-3 sg-p-default font-semibold text-white transition-transform duration-300 hover:-translate-y-px disabled:opacity-60"
                >
                  {loadingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Show More
                      <ArrowRight size={20} strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
