import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DonateSuccess() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Thank You!
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Your generous donation to the RadAcad Foundation Scholarship Fund has been received.
            Your contribution will directly help aspiring data professionals access world-class education.
          </p>
          <Link href="/">
            <Button>
              Return Home <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
