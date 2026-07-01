"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Country, State, City } from "country-state-city";
export interface LocationValue {
  country: string;
  state: string;
  city: string;
}

interface LocationSelectProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}

const TRIGGER_CLS =
  "w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 focus:outline-none text-left flex items-center justify-between cursor-pointer disabled:bg-(--gray-50) disabled:cursor-not-allowed";
const PANEL_CLS =
  "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto";
const ITEM_CLS =
  "w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer text-gray-500 sg-p-default";
const LABEL_CLS = "block sg-p-small font-normal text-(--text-title) mb-2";

function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  onOutside: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

export function LocationSelect({ value, onChange }: LocationSelectProps) {
  const countries = useMemo(() => Country.getAllCountries(), []);

  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useClickOutside(countryRef, () => setOpenCountry(false));
  useClickOutside(stateRef, () => setOpenState(false));
  useClickOutside(cityRef, () => setOpenCity(false));

  const selectedCountry = useMemo(
    () => countries.find((c) => c.name === value.country),
    [countries, value.country],
  );
  const states = useMemo(
    () =>
      selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : [],
    [selectedCountry],
  );
  const selectedState = useMemo(
    () => states.find((s) => s.name === value.state),
    [states, value.state],
  );
  const cities = useMemo(
    () =>
      selectedCountry && selectedState
        ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
        : [],
    [selectedCountry, selectedState],
  );

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const stateIsFreeText = !!selectedCountry && states.length === 0;
  const cityIsFreeText =
    !!selectedCountry &&
    (states.length === 0 || (!!selectedState && cities.length === 0));

  const TEXT_CLS =
    "w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent disabled:bg-(--gray-50) disabled:cursor-not-allowed";

  return (
    <>
      {/* Country — searchable */}
      <div>
        <label className={LABEL_CLS}>Country</label>
        <div ref={countryRef} className="relative">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search country..."
              value={openCountry ? countrySearch : value.country}
              onChange={(e) => setCountrySearch(e.target.value)}
              onFocus={() => {
                setOpenCountry(true);
                setCountrySearch("");
              }}
              className="w-full h-12 pl-10 pr-10 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {openCountry ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
          </div>
          {openCountry && (
            <div className={PANEL_CLS}>
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
                      onChange({ country: c.name, state: "", city: "" });
                      setCountrySearch("");
                      setOpenCountry(false);
                    }}
                    className={ITEM_CLS}
                  >
                    {c.flag} {c.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* State — dropdown when the country has states, else free text */}
      <div>
        <label className={LABEL_CLS}>State / Province</label>
        {stateIsFreeText ? (
          <input
            type="text"
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            placeholder="Enter state / province"
            className={TEXT_CLS}
          />
        ) : (
          <div ref={stateRef} className="relative">
            <button
              type="button"
              disabled={!selectedCountry}
              onClick={() => setOpenState((p) => !p)}
              className={TRIGGER_CLS}
            >
              <span>{value.state || "Select state"}</span>
              {openState ? (
                <ChevronUp size={20} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronDown size={20} className="text-gray-500 shrink-0" />
              )}
            </button>
            {openState && states.length > 0 && (
              <div className={PANEL_CLS}>
                {states.map((s) => (
                  <button
                    key={s.isoCode}
                    type="button"
                    onClick={() => {
                      onChange({ ...value, state: s.name, city: "" });
                      setOpenState(false);
                    }}
                    className={ITEM_CLS}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* City — dropdown when cities exist, else free text */}
      <div>
        <label className={LABEL_CLS}>City</label>
        {cityIsFreeText ? (
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Enter city"
            className={TEXT_CLS}
          />
        ) : (
          <div ref={cityRef} className="relative">
            <button
              type="button"
              disabled={!selectedState}
              onClick={() => setOpenCity((p) => !p)}
              className={TRIGGER_CLS}
            >
              <span>{value.city || "Select city"}</span>
              {openCity ? (
                <ChevronUp size={20} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronDown size={20} className="text-gray-500 shrink-0" />
              )}
            </button>
            {openCity && cities.length > 0 && (
              <div className={PANEL_CLS}>
                {cities.map((c) => (
                  <button
                    key={`${c.name}-${c.latitude}`}
                    type="button"
                    onClick={() => {
                      onChange({ ...value, city: c.name });
                      setOpenCity(false);
                    }}
                    className={ITEM_CLS}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
