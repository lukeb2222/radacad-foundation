import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              RadAcad Foundation
            </h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Empowering aspiring data professionals through education scholarships.
              Breaking barriers to world-class data analytics training.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-primary-foreground/70 hover:text-primary-foreground no-underline transition-colors">Home</Link>
              <Link href="/apply" className="text-sm text-primary-foreground/70 hover:text-primary-foreground no-underline transition-colors">Apply</Link>
              <Link href="/donate" className="text-sm text-primary-foreground/70 hover:text-primary-foreground no-underline transition-colors">Donate</Link>
              <Link href="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground no-underline transition-colors">Contact</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <a href="mailto:foundation@radacad.com" className="hover:text-primary-foreground no-underline transition-colors">
                foundation@radacad.com
              </a>
              <p>RadAcad Foundation</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50">
            &copy; {new Date().getFullYear()} RadAcad Foundation. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/50">
            This website was made by Webadi
          </p>
        </div>
      </div>
    </footer>
  );
}
