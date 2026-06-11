import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DonateSuccess() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-20 pb-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6" style={{ borderRadius: "var(--radius)" }}>
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Thank You <Heart className="inline h-6 w-6 text-primary" />
          </h1>
          <h2 className="text-lg font-semibold text-foreground mb-3">Your Impact Matters</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Your donation has been received. Your generosity directly supports students
            in Jackson who need access to flexible, personalized education at Radical Minds Academy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
            <Link href="/donate">
              <Button className="bg-primary hover:bg-primary/90 text-white">Donate Again</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
