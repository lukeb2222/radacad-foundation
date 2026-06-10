import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, TrendingUp, Calendar, CreditCard, Building } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DONATION_TIERS = [
  { amount: 50, label: "Supporter", description: "Help cover course material costs for a student" },
  { amount: 100, label: "Advocate", description: "Fund a week of online training access" },
  { amount: 250, label: "Champion", description: "Cover certification exam fees for a student" },
  { amount: 500, label: "Patron", description: "Sponsor a month of full program access" },
  { amount: 1000, label: "Benefactor", description: "Fund a complete course enrollment" },
  { amount: 5000, label: "Legacy Partner", description: "Make a transformative contribution to the fund" },
];

const GOAL = 500000;

export default function Donate() {
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const { data: totalData } = trpc.donation.getTotal.useQuery();
  const totalRaised = totalData?.total || 0;
  const progress = Math.min((totalRaised / GOAL) * 100, 100);

  const checkoutMutation = trpc.donation.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create checkout session");
    },
  });

  const effectiveAmount = selectedAmount || Number(customAmount) || 0;

  const handleDonate = () => {
    if (!effectiveAmount || effectiveAmount < 1) {
      toast.error("Please select or enter a donation amount");
      return;
    }
    if (!firstName || !lastName || !email) {
      toast.error("Please fill in your name and email");
      return;
    }
    checkoutMutation.mutate({
      amount: effectiveAmount,
      frequency,
      firstName,
      lastName,
      email,
      note: note || undefined,
      origin: window.location.origin,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-16 md:pt-36 md:pb-20">
        <div className="container text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
            Support the Fund
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Invest in Future Data Leaders
          </h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Every contribution helps an aspiring data professional access world-class
            education they otherwise could not afford.
          </p>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-2">
              <TrendingUp className="inline h-4 w-4 mr-1" /> Fundraising Progress
            </p>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Scholarship Fund
            </h2>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                ${totalRaised.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-accent">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>raised of ${GOAL.toLocaleString()} goal</span>
              <span>${(GOAL - totalRaised).toLocaleString()} still needed</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {[
              { icon: Heart, value: "100%", label: "Goes to the Scholar" },
              { icon: Users, value: "50+", label: "Lives Changed" },
              { icon: TrendingUp, value: "$200K+", label: "Annual Award Value" },
              { icon: Calendar, value: "2024", label: "Inaugural Year" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="section-cream py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Tiers */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Choose Your Impact
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select a giving level or enter a custom amount.
              </p>

              {/* Frequency toggle */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={frequency === "one_time" ? "default" : "outline"}
                  onClick={() => setFrequency("one_time")}
                  size="sm"
                >
                  One-Time
                </Button>
                <Button
                  variant={frequency === "monthly" ? "default" : "outline"}
                  onClick={() => setFrequency("monthly")}
                  size="sm"
                >
                  Monthly
                </Button>
              </div>

              {/* Tier grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {DONATION_TIERS.map((tier) => (
                  <button
                    key={tier.amount}
                    onClick={() => {
                      setSelectedAmount(tier.amount);
                      setCustomAmount("");
                    }}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selectedAmount === tier.amount
                        ? "border-accent bg-accent/5 ring-2 ring-accent"
                        : "border-border bg-white hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">${tier.amount.toLocaleString()}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                        {tier.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div>
                <Label className="text-sm font-medium">Custom Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="pl-7"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Right: Info form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-lg">Your Information</h3>
                  <div>
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div>
                    <Label>Note (optional)</Label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Any message you'd like to include"
                      rows={3}
                    />
                  </div>

                  {/* Summary */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Donation</span>
                      <span className="font-semibold">{effectiveAmount > 0 ? `$${effectiveAmount.toLocaleString()}` : "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span>Frequency</span>
                      <span className="font-semibold">{frequency === "monthly" ? "Monthly" : "One-Time"}</span>
                    </div>
                    <Button
                      className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
                      onClick={handleDonate}
                      disabled={checkoutMutation.isPending || effectiveAmount < 1}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {checkoutMutation.isPending ? "Processing..." : "Donate Now"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Secure payment powered by Stripe
                    </p>
                  </div>

                  {/* Bank transfer note */}
                  <div className="bg-muted/50 rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Bank Transfer Available</p>
                        <p className="text-xs text-muted-foreground">
                          For larger donations, you can pay by bank transfer (ACH) at checkout to avoid
                          credit card processing fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Where Donation Goes */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Where Your Donation Goes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Program Tuition", desc: "Covers the complete cost of attending RadAcad's data analytics training programs." },
              { title: "Certification Fees", desc: "Funds official Microsoft and industry certification exam fees for scholars." },
              { title: "Learning Materials", desc: "Provides access to premium datasets, tools, and supplementary learning resources." },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
