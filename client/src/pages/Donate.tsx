import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Calendar, CreditCard, Building, Repeat } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ONE_TIME_TIERS = [
  { amount: 50, label: "Student Materials", description: "Help provide books, supplies, robotics parts, art materials, and project resources for a student." },
  { amount: 145, label: "One Hour of Tutoring", description: "Funds approximately one member-rate hour of one-on-one tutoring or intervention support." },
  { amount: 490, label: "Small Group Class Scholarship", description: "Funds one month of a small-group class such as Science, ELA, Math, Social Studies, Robotics, or Spanish." },
  { amount: 1200, label: "Independent Membership", description: "Provides one month of RadAcad Independent Membership for a student." },
  { amount: 2650, label: "Full Membership Scholarship", description: "Provides one month of full RadAcad membership including coaching, PE, field trips, and community access." },
  { amount: 7000, label: "Transform a School Year", description: "Funds approximately one Wyoming ESA-sized scholarship gap for a student who otherwise could not attend." },
];

const MONTHLY_TIERS = [
  { amount: 25, label: "Learning Partner", description: "Helps fund materials and enrichment." },
  { amount: 50, label: "Club Sponsor", description: "Supports after-school clubs and activities." },
  { amount: 145, label: "Tutoring Sponsor", description: "Provides a recurring hour of tutoring each month." },
  { amount: 490, label: "Class Sponsor", description: "Supports a student's participation in a small-group class." },
  { amount: 1200, label: "Membership Sponsor", description: "Sponsors an Independent Membership student." },
  { amount: 2650, label: "Full Access Sponsor", description: "Sponsors a full RadAcad student each month." },
];

const STRIPE_DONATE_LINK = "https://donate.stripe.com/aFafZj5Qg83mckN5rJa3u00";
const GOAL = 30000;

export default function Donate() {
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { data: totalData } = trpc.donation.getTotal.useQuery();
  const totalRaised = totalData?.total || 0;
  const progress = Math.min((totalRaised / GOAL) * 100, 100);

  const tiers = frequency === "monthly" ? MONTHLY_TIERS : ONE_TIME_TIERS;

  const handleDonate = () => {
    // Open Garrett's Stripe donation link directly
    window.open(STRIPE_DONATE_LINK, "_blank");
  };

  const scrollRef = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col" ref={scrollRef}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] to-[#0f3433]" />
        </div>
        <div className="container relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
            Support Our Mission
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Donate to the <span className="italic text-teal-300">Foundation</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Your contribution directly funds scholarships for students who cannot afford
            Radical Minds Academy programs. Every dollar makes a difference.
          </p>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-16">
        <div className="container max-w-3xl animate-on-scroll">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-2">
              <Heart className="inline h-4 w-4 mr-1" /> Fundraising Progress
            </p>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              2026 Scholarship Fund
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Goal: $30,000 by December 31, 2026</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                ${totalRaised.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-muted overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${progress}%`, borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>raised of ${GOAL.toLocaleString()} goal</span>
              <span>${(GOAL - totalRaised).toLocaleString()} still needed</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { icon: Heart, value: "100%", label: "Goes to the Scholar" },
              { icon: Users, value: "5", label: "Lives Changed" },
              { icon: Calendar, value: "2026", label: "Founded" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="section-light py-16 animate-on-scroll">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Choose Your <span className="text-primary italic">Impact</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Select a giving level to see the impact of your gift.
            </p>
          </div>

          {/* Frequency toggle */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={frequency === "one_time" ? "default" : "outline"}
              onClick={() => { setFrequency("one_time"); setSelectedAmount(null); }}
              size="sm"
              className={frequency === "one_time" ? "bg-primary text-white" : ""}
            >
              One-Time
            </Button>
            <Button
              variant={frequency === "monthly" ? "default" : "outline"}
              onClick={() => { setFrequency("monthly"); setSelectedAmount(null); }}
              size="sm"
              className={frequency === "monthly" ? "bg-primary text-white gap-1" : "gap-1"}
            >
              <Repeat className="h-3 w-3" /> Monthly
            </Button>
          </div>

          {/* Tier grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {tiers.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => setSelectedAmount(tier.amount)}
                className={`text-left p-5 border transition-all ${
                  selectedAmount === tier.amount
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/50"
                }`}
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold">${tier.amount.toLocaleString()}</span>
                  {frequency === "monthly" && <span className="text-xs text-muted-foreground">/month</span>}
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{tier.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
              </button>
            ))}
          </div>

          {/* Donate Button */}
          <div className="max-w-md mx-auto text-center">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
              onClick={handleDonate}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Donate Now
            </Button>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              RadAcad Foundation is a registered 501(c)(3). Donors will receive an email receipt for their records.
              Donations may be tax deductible as allowed by law.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Secure payment powered by Stripe
            </p>
          </div>

          {/* Bank transfer note */}
          <div className="max-w-md mx-auto mt-8">
            <Card style={{ borderRadius: "var(--radius)" }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Bank Transfer or Check</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For larger donations, bank transfers, or checks, contact us at{" "}
                      <a href="mailto:garrett.austen@tetontutors.org" className="text-primary hover:underline">
                        garrett.austen@tetontutors.org
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
