import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const COMPANY_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "Become an Instructor", href: "/become-instructor" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/all-blogs" },
  { label: "Contact Us", href: "/contact" },
  { label: "Faq", href: "/faq" },
];

const CATEGORY_LINKS = [
  "Artificial Intelligence",
  "UI/UX Design",
  "Marketing",
  "IT & Software",
  "Business",
  "Business",
];

const RESOURCE_LINKS = [
  "FAQ",
  "Support",
  "Privacy Policy",
  "Terms Conditions",
  "Privacy & Policy Us",
];

export function Footer() {
  return (
    <footer className="w-full bg-(--gray-900) text-white">
      <div className="mx-auto w-full max-w-310 px-4 pb-6 pt-12 md:px-6 md:pb-8 md:pt-14 lg:px-8 lg:pb-10 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.65fr_2.85fr] lg:gap-16">
          <div>
            <h2 className="lg:text-[32px] sg-h5 font-semibold text-(--text-white)">
              Career College
            </h2>
            <p className="mt-4 max-w-70 sg-p-small text-white font-normal">
              Career College empowers you with expertled courses, real-world
              projects, and guidance to advance your career.
            </p>

            <h3 className="lg:mt-10 mt-7 lg:text-[20px] sg-p-default font-semibold text-(--text-white)">
              Follow Us
            </h3>
            <div className="lg:mt-6 mt-3 flex items-center lg:gap-4 gap-2">
              <Link
                href="#"
                aria-label="Facebook"
                target="_blank"
                className="inline-flex  h-8 w-8 items-center justify-center rounded-md border border-white text-white transition-colors hover:bg-(--primary-700)"
              >
                <span className="text-[20px] font-semibold">f</span>
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                target="_blank"
                className="inline-flex  h-8 w-8 items-center justify-center rounded-md border border-white text-white transition-colors hover:bg-(--primary-700)"
              >
                <span className="text-[20px] font-bold">X</span>
              </Link>
              <Link
                href="#"
                target="_blank"
                aria-label="LinkedIn"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white text-white transition-colors hover:bg-(--primary-700)"
              >
                <span className="text-[20px] font-semibold">in</span>
              </Link>
            </div>
          </div>

          <div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="lg:text-[24px] sg-p-big font-medium text-(--text-white)">
                  Company
                </h3>
                <ul className="mt-3 lg:mt-6 space-y-4">
                  {COMPANY_LINKS.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="sg-p-small lg:sg-p-default text-white transition-colors hover:text-white/90"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="lg:text-[24px] sg-p-big font-medium text-(--text-white)">
                  Categories
                </h3>
                <ul className="mt-3 lg:mt-6 space-y-4">
                  {CATEGORY_LINKS.map((item, index) => (
                    <li key={`${item}-${index}`}>
                      <Link
                        href="#"
                        className="sg-p-small lg:sg-p-default text-white transition-colors hover:text-white/90"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="lg:text-[24px] sg-p-big font-medium text-(--text-white)">
                  Support
                </h3>
                <ul className="mt-3 lg:mt-6 space-y-4">
                  <li>
                    <span className="inline-flex items-center gap-2 sg-p-small lg:sg-p-default cursor-pointer text-white hover:text-white/90">
                      <Mail size={16} strokeWidth={1.5} color="#ffffff" />
                      <Link
                        href="mailto:info@niduslab.com"
                        className="text-white hover:text-white/90"
                      >
                        info@niduslab.com
                      </Link>
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-2 sg-p-small lg:sg-p-default text-white hover:text-white/90">
                      <Phone size={16} strokeWidth={1.5} color="#ffffff" />
                      <Link
                        href="tel:+13474000135"
                        className="text-white hover:text-white/90"
                      >
                        +1347-400-0135
                      </Link>
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-start gap-2 sg-p-small lg:sg-p-default text-white hover:text-white/90">
                      <MapPin size={16} strokeWidth={1.5} color="#ffffff" />
                      <Link
                        href="https://www.google.com/maps/place/Crescent+Street,+Long+Island+City,+NY+-11106/@40.7459055,-73.9487923,17z/data=!3m1!4b1!4m5!3m4!1s0x89c259af18e7a9f:0x2c8d9b8e7a6c8b2!8m2!3d40.7459055!4d-73.9466036"
                        target="_blank"
                        className="text-white hover:text-white/90"
                      >
                        Crescent Street, Long Island City, NY -11106
                      </Link>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="h-px bg-[#1e2939] mt-6 lg:mt-8 mb-6 lg:mb-8"></div>
            <div>
              <h3 className="lg:text-[24px] sg-p-big font-medium text-(--text-white)">
                Resources
              </h3>
              <ul className="mt-3 lg:mt-6 grid gap-4">
                {RESOURCE_LINKS.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="sg-p-small lg:sg-p-default text-white transition-colors hover:text-white/90"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#1e2939] mt-6 lg:mt-8 mb-6 lg:mb-8"></div>
        <div>
          <p className="sg-caption text-white/80">
            © 2026 Career College. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
