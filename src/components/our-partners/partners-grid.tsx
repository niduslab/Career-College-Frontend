"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { ArrowRight } from "lucide-react";
import PartnerSearch from "@/components/our-partners/partner-search";

import image1 from "@/assets/images/our-partners/image1.webp";
import image2 from "@/assets/images/our-partners/image2.webp";
import image3 from "@/assets/images/our-partners/image3.webp";
import image4 from "@/assets/images/our-partners/image4.webp";
import image5 from "@/assets/images/our-partners/image5.webp";
import image6 from "@/assets/images/our-partners/image6.webp";
import image7 from "@/assets/images/our-partners/image7.webp";
import image8 from "@/assets/images/our-partners/image8.webp";
import image9 from "@/assets/images/our-partners/image9.webp";
import image10 from "@/assets/images/our-partners/image10.webp";
import image11 from "@/assets/images/our-partners/image11.webp";
import image12 from "@/assets/images/our-partners/image12.webp";
import image13 from "@/assets/images/our-partners/image13.webp";
import image14 from "@/assets/images/our-partners/image14.webp";
import image15 from "@/assets/images/our-partners/image15.webp";
import image16 from "@/assets/images/our-partners/image16.webp";
import image17 from "@/assets/images/our-partners/image17.webp";
import image18 from "@/assets/images/our-partners/image18.webp";

interface Partner {
  id: number;
  name: string;
  country: string;
  type: string;
  image: StaticImageData;
}

const ALL_PARTNERS: Partner[] = [
  {
    id: 1,
    name: "Advancing Women Tech",
    country: "United States",
    type: "Industry",
    image: image1,
  },
  {
    id: 2,
    name: "Advancing Women Tech",
    country: "United States",
    type: "Industry",
    image: image2,
  },
  {
    id: 3,
    name: "Adamson University",
    country: "United States",
    type: "University",
    image: image3,
  },
  {
    id: 4,
    name: "Akamai Technologies, Inc. United States",
    country: "United States",
    type: "Industry",
    image: image4,
  },
  {
    id: 5,
    name: "Alberta Machine Intelligence Institute",
    country: "Canada",
    type: "NGO",
    image: image5,
  },
  {
    id: 6,
    name: "28DIGITAL",
    country: "Belgium",
    type: "Industry",
    image: image6,
  },
  {
    id: 7,
    name: "Amazon",
    country: "United States",
    type: "Industry",
    image: image7,
  },
  {
    id: 8,
    name: "American Museum of Natural History",
    country: "United States",
    type: "NGO",
    image: image8,
  },
  {
    id: 9,
    name: "Aptly",
    country: "United States",
    type: "Industry",
    image: image9,
  },
  {
    id: 10,
    name: "Arizona State University",
    country: "United States",
    type: "University",
    image: image10,
  },
  {
    id: 11,
    name: "Adobe",
    country: "United States",
    type: "Industry",
    image: image11,
  },
  {
    id: 12,
    name: "Alfaisal University | KLD",
    country: "Saudi Arabia",
    type: "University",
    image: image12,
  },
  {
    id: 13,
    name: "Arm",
    country: "United States",
    type: "Industry",
    image: image13,
  },
  {
    id: 14,
    name: "Arizona State University",
    country: "United States",
    type: "University",
    image: image14,
  },
  {
    id: 15,
    name: "Automatic Data Processing, Inc. (ADP)",
    country: "United States",
    type: "Industry",
    image: image15,
  },
  {
    id: 16,
    name: "Banco Interamericano de Desarrollo",
    country: "United States",
    type: "Government",
    image: image16,
  },
  {
    id: 17,
    name: "Big Interview",
    country: "United States",
    type: "Industry",
    image: image17,
  },
  {
    id: 18,
    name: "California Institute of the Arts",
    country: "Saudi Arabia",
    type: "University",
    image: image18,
  },
];

const PAGE_SIZE = 12;

export default function PartnersGrid() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [country, setCountry] = useState("All Countries");
  const [query, setQuery] = useState({
    search: "",
    type: "All Types",
    country: "All Countries",
  });
  const [showAll, setShowAll] = useState(false);

  const filtered = ALL_PARTNERS.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(query.search.toLowerCase());
    const matchType = query.type === "All Types" || p.type === query.type;
    const matchCountry =
      query.country === "All Countries" || p.country === query.country;
    return matchSearch && matchType && matchCountry;
  });

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
  const hasMore = filtered.length > PAGE_SIZE;

  function handleSubmit() {
    setQuery({ search, type, country });
    setShowAll(false);
  }

  return (
    <section className="mx-auto max-w-7xl lg:mt-25 mt-10 lg:mb-25 mb-10  px-4 md:px-6 lg:px-8">
      {/* Search bar */}
      <PartnerSearch
        search={search}
        type={type}
        country={country}
        onSearch={setSearch}
        onType={setType}
        onCountry={setCountry}
        onSubmit={handleSubmit}
      />

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {visible.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-start border border-gray-100 rounded-xl p-3 bg-white hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-full h-39.5 relative rounded-lg overflow-hidden mb-3">
                <Image
                  src={partner.image}
                  alt={partner.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <p className="sg-p-default font-semibold text-black leading-snug line-clamp-2">
                {partner.name}
              </p>
              <p className="sg-caption text-(--text-paragraph) mt-1">
                {partner.country}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-gray-400 sg-p-default">
          No partners found.
        </div>
      )}

      {/* Show More / Show Less */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-2 bg-(--primary-700)   text-white font-semibold sg-p-default px-6 py-3.5 rounded-md   transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : "Show More"}
            <ArrowRight
              size={20}
              className={`transition-transform duration-300 ${showAll ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
