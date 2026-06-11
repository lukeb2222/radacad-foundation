import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitMutation = trpc.message.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    submitMutation.mutate({ firstName, lastName, email, subject, message });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6" style={{ borderRadius: "var(--radius)" }}>
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Message Sent
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Thank you for reaching out. Our team will respond to your inquiry as soon as possible.
            </p>
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-white" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const scrollRef = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col" ref={scrollRef}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/manus-storage/backcountry_skiing_58090314.jpg" alt="RadAcad outdoor activities" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1a2332]/80" />
        </div>
        <div className="container relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
            Get In Touch
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Contact <span className="italic text-teal-300">Us</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Have questions about our scholarship program? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container max-w-5xl animate-on-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Reach Out
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a href="mailto:garrett.austen@tetontutors.org" className="text-sm text-primary hover:underline">
                        garrett.austen@tetontutors.org
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a href="tel:3072008928" className="text-sm text-primary hover:underline">
                        (307) 200-8928
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        62 Redmond St<br />
                        Jackson, WY 83001
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border bg-muted/30" style={{ borderRadius: "var(--radius)" }}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Serving:</span> Jackson, Alpine, Victor, and Driggs communities.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card style={{ borderRadius: "var(--radius)" }}>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What is this regarding?" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us how we can help..."
                        rows={6}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      {submitMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
