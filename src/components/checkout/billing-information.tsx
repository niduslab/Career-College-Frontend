"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Country } from "country-state-city";

const getAllCountries = () =>
  Country.getAllCountries().map((c: any) => ({ name: c.name, code: c.isoCode }));

export default function BillingInformation() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "",
    zip: "",
    street: "",
  });

  const [countries] = useState(getAllCountries);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleCountrySelect = (name: string) => {
    setForm((prev) => ({ ...prev, country: name }));
    setCountrySearch(name);
    setShowCountryDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg bg-gray-50 h-12 px-4 py-2.5 sg-p-default font-normal text-(--text-paragraph) placeholder:text-gray-400 outline-none focus:border-(--primary-500) transition-colors";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="sg-p-big lg:sg-h5 font-semibold text-[#12100e] mb-4">
        Billing Information
      </h2>

      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
              City <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Select Country"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  onFocus={() => setShowCountryDropdown(true)}
                  onClick={() => setShowCountryDropdown(true)}
                  className="w-full h-12 pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 sg-p-default text-(--text-paragraph) placeholder:text-gray-400 outline-none focus:border-(--primary-500) transition-colors"
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  {showCountryDropdown ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </div>
              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c.name)}
                      className="w-full px-4 py-2.5 text-left sg-p-default text-(--text-paragraph) hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
              Zip-code
            </label>
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              placeholder="Enter Zip code"
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 4 */}
        <div>
          <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
            Street, House, Apartment <span className="text-red-500">*</span>
          </label>
          <textarea
            name="street"
            value={form.street}
            onChange={handleChange}
            placeholder="Enter Street Address, House No, Apartment No"
            rows={3}
            className={`${inputCls} resize-none h-auto`}
          />
        </div>
      </div>
    </div>
  );
}
