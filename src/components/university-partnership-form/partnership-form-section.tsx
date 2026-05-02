"use client";
import { useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Country } from "country-state-city";

const BENEFITS = [
  "Reach learners worldwide and expand visibility",
  "Transform degrees into scalable online programs",
  "Attract new student segments and global talent",
  "Use data insights to improve learning outcomes",
  "Grow your program visibility worldwide",
];

const INSTITUTION_TYPES = [
  "University",
  "College",
  "Technical Institute",
  "Online Academy",
];

// Get all countries from the library
const getAllCountries = () => {
  return Country.getAllCountries().map((country: any) => ({
    name: country.name,
    code: country.isoCode,
  }));
};

export default function PartnershipFormSection() {
  const [formData, setFormData] = useState({
    institutionName: "",
    institutionType: "",
    workEmail: "",
    country: "",
    agreeToComms: false,
  });

  const [countrySearch, setCountrySearch] = useState("");
  const [countries] = useState(getAllCountries());
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // if (!mounted) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCountrySelect = (countryName: string, countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryName,
    }));
    setSelectedCountryName(countryName);
    setCountrySearch(countryName);
    setShowCountryDropdown(false);
  };

  const handleInstitutionSelect = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      institutionType: type,
    }));
    setShowInstitutionDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  return (
    <section className="w-full lg:mt25 mt-10 py-12 md:py-16 lg:py-20 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-[32px] md:text-[40px] lg:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] --text-title  mb-4">
                Bring Your Programs to the World Start Your Global Learning
                Journey
              </h2>
              <p className="sg-p-default --text-paragraph font-normal leading-relaxed">
                Join Career College and collaborate on creating world-class
                learning experiences that reach learners across the globe.
              </p>
            </div>

            {/* Why Partner Section */}
            <div>
              <h3 className="sg-h6 font-semibold --text-title mb-6 lg:mb-8">
                Why partner with us?
              </h3>
              <ul className="space-y-4">
                {BENEFITS.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle
                      size={16}
                      className="text-(--primary-700) shrink-0 mt-0.5"
                    />
                    <span className="--text-paragraph sg-p-default font-normal leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-gray-200 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Institution Name */}
              <div>
                <label className="block sg-p-default font-semibold --text-title mb-2">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="Institution name"
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
                  required
                  autoComplete="organization"
                  suppressHydrationWarning
                />
              </div>

              {/* Institution Type */}
              <div>
                <label className="block sg-p-default font-semibold --text-title mb-2">
                  Institution Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowInstitutionDropdown(!showInstitutionDropdown)
                    }
                    className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent text-left flex items-center justify-between"
                    suppressHydrationWarning
                  >
                    <span>
                      {formData.institutionType || "Select institution type"}
                    </span>
                    <div className="text-gray-500 pointer-events-none">
                      {showInstitutionDropdown ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </button>

                  {/* Dropdown */}
                  {showInstitutionDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {INSTITUTION_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleInstitutionSelect(type)}
                          className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-500">{type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block sg-p-default font-semibold --text-title mb-2">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  placeholder="info@university.com"
                  className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
                  required
                  autoComplete="email"
                  suppressHydrationWarning
                />
              </div>

              {/* Country */}
              <div>
                <label className="block sg-p-default font-semibold --text-title mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Search Input */}
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onFocus={() => setShowCountryDropdown(true)}
                      onClick={() => setShowCountryDropdown(true)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
                      autoComplete="off"
                      suppressHydrationWarning
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                      {showCountryDropdown ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {/* Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() =>
                            handleCountrySelect(country.name, country.code)
                          }
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-500">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeToComms"
                  id="agreeToComms"
                  checked={formData.agreeToComms}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-2xl cursor-pointer mt-0.5"
                  style={{
                    accentColor: "var(--primary-700)",
                  }}
                />
                <label
                  htmlFor="agreeToComms"
                  className="sg-p-default --text-paragraph leading-relaxed"
                >
                  I agree to receive other communications from Coursera. You can
                  unsubscribe from these communications at any time.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="h-12 w-29.75 bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer  transition-colors flex items-center justify-center gap-2 group"
                suppressHydrationWarning
              >
                Submit
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
