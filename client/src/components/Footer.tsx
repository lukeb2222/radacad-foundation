import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img
              src="/manus-storage/radacad_foundation_logo_d430f3e8.png"
              alt="RadAcad Foundation"
              className="h-12 mb-4"
            />
            <p className="text-sm text-gray-600 leading-relaxed">
              Making RadAcad's flexible education accessible to every student in Jackson, regardless of financial circumstances.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-900">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-gray-600 hover:text-[var(--radacad-teal)] no-underline transition-colors">Home</Link>
              <Link href="/apply" className="text-sm text-gray-600 hover:text-[var(--radacad-teal)] no-underline transition-colors">Apply for Scholarship</Link>
              <Link href="/donate" className="text-sm text-gray-600 hover:text-[var(--radacad-teal)] no-underline transition-colors">Donate</Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-[var(--radacad-teal)] no-underline transition-colors">Contact</Link>
              <a href="https://www.radicalmindsacademy.org" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-[var(--radacad-teal)] no-underline transition-colors">
                RadAcad Main Site
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-900">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <a href="mailto:garrett.austen@tetontutors.org" className="hover:text-[var(--radacad-teal)] no-underline transition-colors">
                garrett.austen@tetontutors.org
              </a>
              <a href="tel:3072008928" className="hover:text-[var(--radacad-teal)] no-underline transition-colors">
                (307) 200-8928
              </a>
              <p className="mt-1">Jackson, Wyoming</p>
            </div>
            {/* Social links */}
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--radacad-teal)] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--radacad-teal)] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} RadAcad Foundation. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            This website was made by <span className="text-[var(--radacad-teal)]">Luke Balyasny</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
