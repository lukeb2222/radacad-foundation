import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/apply", label: "Apply" },
    { href: "/donate", label: "Donate" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Announcement bar - scrolling text like RadAcad */}
      <div className="bg-[var(--radacad-teal)] text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-8 text-sm font-medium">
              Apply for a RadAcad Foundation Scholarship today!
            </span>
          ))}
        </div>
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container flex items-center justify-between h-20">
          <Link href="/" className="flex items-center no-underline">
            <img
              src="/manus-storage/radacad_foundation_logo_d430f3e8.png"
              alt="RadAcad Foundation"
              className="h-14"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-medium no-underline transition-colors ${
                  location === link.href
                    ? "text-[var(--radacad-teal)]"
                    : "text-gray-700 hover:text-[var(--radacad-teal)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className="no-underline bg-[var(--radacad-teal)] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#249e8b] transition-colors"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container py-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[15px] font-medium no-underline ${
                    location === link.href ? "text-[var(--radacad-teal)]" : "text-gray-700"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/apply"
                className="no-underline bg-[var(--radacad-teal)] text-white px-6 py-2.5 text-sm font-semibold text-center"
                onClick={() => setMobileOpen(false)}
              >
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
