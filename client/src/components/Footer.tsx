import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#1a2e3a] text-white py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <img
              src="/manus-storage/radacad_logo_b7e2f890.png"
              alt="RadAcad Foundation"
              className="h-8 mb-4 brightness-0 invert"
            />
            <p className="text-sm text-white/70 leading-relaxed">
              The RadAcad Foundation provides scholarships to families who cannot afford
              Radical Minds Academy programs. We believe every student in Jackson deserves
              access to flexible, personalized education.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-white/70 hover:text-white no-underline transition-colors">Home</Link>
              <Link href="/apply" className="text-sm text-white/70 hover:text-white no-underline transition-colors">Apply for Scholarship</Link>
              <Link href="/donate" className="text-sm text-white/70 hover:text-white no-underline transition-colors">Donate</Link>
              <Link href="/contact" className="text-sm text-white/70 hover:text-white no-underline transition-colors">Contact</Link>
              <a href="https://www.radicalmindsacademy.org" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white no-underline transition-colors">
                RadAcad Main Site
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/90">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <a href="mailto:garrett.austen@tetontutors.org" className="hover:text-white no-underline transition-colors">
                garrett.austen@tetontutors.org
              </a>
              <a href="tel:3072008928" className="hover:text-white no-underline transition-colors">
                (307) 200-8928
              </a>
              <p className="mt-2">62 Redmond St, Jackson, WY 83001</p>
              <p className="text-xs text-white/50 mt-1">
                Serving Jackson, Alpine, Victor, and Driggs
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} RadAcad Foundation. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            This website was made by Webadi
          </p>
        </div>
      </div>
    </footer>
  );
}
