"use client";
import { useState, useRef } from "react";
import {
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Country } from "country-state-city";

const BENEFITS = [
  "Reach thousands of motivated learners worldwide",
  "Earn revenue every time a student enrols in your course",
  "Build your personal brand and grow your audience",
  "Get dedicated support to create high-quality content",
  "Access tools and analytics to track your impact",
];

const EXPERTISE_AREAS = [
  "Artificial Intelligence",
  "UI/UX Design",
  "Web Development",
  "Marketing",
  "IT & Software",
  "Business & Management",
  "Data Science",
  "Cybersecurity",
  "Other",
];

const getAllCountries = () =>
  Country.getAllCountries().map((c: any) => ({
    name: c.name,
    code: c.isoCode,
  }));

export default function InstructorFormSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    expertise: "",
    country: "",
    linkedIn: "",
    bio: "",
    agreeToComms: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countries] = useState(getAllCountries());
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const expertiseRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="w-full mt-10 py-12 md:py-16 lg:py-20 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left — benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-[32px] md:text-[40px] lg:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] text-(--text-title) mb-4">
                Share Your Knowledge. Inspire the World.
              </h2>
              <p className="sg-p-default text-(--text-paragraph) font-normal leading-relaxed">
                Join Career College as an instructor and help shape the future
                of thousands of learners. Fill in the form and our team will
                reach out within 2 business days.
              </p>
            </div>

            <div>
              <h3 className="sg-h6 font-semibold text-(--text-title) mb-6 lg:mb-8">
                Why teach with us?
              </h3>
              <ul className="space-y-4">
                {BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      size={16}
                      className="text-(--primary-700) shrink-0 mt-0.5"
                    />
                    <span className="text-(--text-paragraph) sg-p-default font-normal leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-gray-200 rounded-2xl p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-(--primary-700)">
                  <CheckCircle size={32} strokeWidth={1.8} />
                </span>
                <h3 className="sg-h5 font-semibold text-(--text-title)">
                  Application Submitted!
                </h3>
                <p className="max-w-80 sg-p-default text-(--text-paragraph)">
                  Thank you for your interest. Our team will review your
                  application and get back to you within 2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block sg-p-default font-semibold text-(--text-title) mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Al Amin"
                    required
                    autoComplete="name"
                    className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block sg-p-default font-semibold text-(--text-title) mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@niduslab.com"
                    required
                    autoComplete="email"
                    className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
                  />
                </div>

                {/* Expertise Area */}
                <div>
                  <label className="block sg-p-default font-semibold text-(--text-title) mb-2">
                    Area of Expertise <span className="text-red-500">*</span>
                  </label>
                  <div ref={expertiseRef} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowExpertiseDropdown((p) => !p)
                      }
                      className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 focus:outline-none text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>
                        {formData.expertise || "Select expertise area"}
                      </span>
                      {showExpertiseDropdown ? (
                        <ChevronUp size={20} className="text-gray-500 shrink-0" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500 shrink-0" />
                      )}
                    </button>
                    {showExpertiseDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {EXPERTISE_AREAS.map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({ ...p, expertise: area }));
                              setShowExpertiseDropdown(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer"
                          >
                            <span className="text-gray-500 sg-p-default">{area}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block sg-p-default font-semibold text-(--text-title) mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div ref={countryRef} className="relative">
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
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
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        {showCountryDropdown ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({ ...p, country: c.name }));
                              setCountrySearch(c.name);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer"
                          >
                            <span className="text-gray-500 sg-p-default">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block sg-p-default font-semibold text-(--text-title) mb-2">
                    LinkedIn Profile{" "}
                    <span className="sg-p-small font-normal text-(--text-paragraph)">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    autoComplete="url"
                    className="w-full h-12 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent"
                  />
                </div>

                {/* Short Bio */}
                <div>
                  <label className="block sg-p-default font-semibold text-(--text-title) mb-2">
                    Short Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Tell us about your background and what you'd like to teach..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--primary-700) focus:border-transparent resize-none"
                  />
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
                    style={{ accentColor: "var(--primary-700)" }}
                  />
                  <label
                    htmlFor="agreeToComms"
                    className="sg-p-default text-(--text-paragraph) leading-relaxed"
                  >
                    I agree to receive updates and communications from Career
                    College. You can unsubscribe at any time.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="h-12 w-full bg-(--primary-700) text-white font-semibold py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 group sg-p-default"
                >
                  Submit Application
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
