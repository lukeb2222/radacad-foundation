import { Link } from "wouter";
import { Heart, GraduationCap, Users, TrendingUp, ArrowRight, BookOpen, Award, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-4 font-medium">
            Empowering Through Education
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            RadAcad Foundation
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Breaking financial barriers to world-class data analytics education.
            We provide scholarships to aspiring professionals who cannot afford
            RadAcad's training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 text-base">
                Apply for Scholarship
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/donate">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 text-base">
                Support the Fund
                <Heart className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Data Skills Should Not Be a Privilege
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The RadAcad Foundation exists to ensure that financial circumstances never prevent
              talented individuals from accessing world-class data analytics education. Through
              our scholarship program, we fund tuition for RadAcad's comprehensive training
              courses in Power BI, data modeling, DAX, and advanced analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section-cream py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Heart, value: "100%", label: "Goes to Scholars" },
              { icon: Users, value: "50+", label: "Scholarships Awarded" },
              { icon: TrendingUp, value: "$200K+", label: "Total Funded" },
              { icon: GraduationCap, value: "2024", label: "Founded" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Covered */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-3">What We Fund</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Programs Covered by Our Scholarships
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Power BI Comprehensive",
                description: "Master Power BI from basics to advanced DAX, data modeling, and visualization. Full certification preparation included.",
              },
              {
                icon: BarChart3,
                title: "Data Analytics Bootcamp",
                description: "Intensive training covering the complete data analytics pipeline \u2014 from data preparation to storytelling with insights.",
              },
              {
                icon: Award,
                title: "Advanced DAX & Modeling",
                description: "Deep-dive into complex DAX patterns, star schema design, and enterprise-level data architecture.",
              },
            ].map((program, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <program.icon className="h-10 w-10 text-accent mb-5" />
                <h3 className="text-xl font-bold text-foreground mb-3">{program.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Apply for a scholarship today or support our mission by making a donation.
            Every contribution changes a life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                Start Your Application
              </Button>
            </Link>
            <Link href="/donate">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                Donate Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
