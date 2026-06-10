import { Link } from "wouter";
import { Heart, GraduationCap, Users, TrendingUp, ArrowRight, BookOpen, Sun, Clock, UserCheck, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/30 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-400/20 blur-3xl" />
        </div>
        <div className="container relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-4 font-medium">
            Empowering Students in Jackson
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            RadAcad <span className="italic text-teal-300">Foundation</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Providing scholarships to families who cannot afford Radical Minds Academy programs.
            Every student deserves access to flexible, personalized education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 text-base">
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
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Education Should Not Be a <span className="italic text-primary">Privilege</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The RadAcad Foundation exists to ensure that financial circumstances never prevent
              students from accessing Radical Minds Academy's flexible, personalized education programs.
              We serve middle and high school students in Jackson, Alpine, Victor, and Driggs who
              need something more flexible, more personal, and more forward-thinking than traditional school.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section-light py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Heart, value: "100%", label: "Goes to Scholars" },
              { icon: Users, value: "50+", label: "Students Supported" },
              { icon: TrendingUp, value: "$200K+", label: "Total Funded" },
              { icon: GraduationCap, value: "2024", label: "Founded" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">What We Fund</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Programs Covered by Our <span className="italic text-primary">Scholarships</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Daytime RadAcad Classes",
                description: "Full-day personalized learning with academic coaching, online school support, small-group classes, and one-on-one instruction.",
              },
              {
                icon: Clock,
                title: "After School Clubs",
                description: "Seasonal enrichment clubs (Fall, Winter, Spring) focused on flexible, personalized learning to help students grow at their own pace.",
              },
              {
                icon: Sun,
                title: "Summer Camps",
                description: "Immersive summer programs combining outdoor adventure with academic enrichment in the Jackson Hole community.",
              },
              {
                icon: UserCheck,
                title: "One-on-One Tutoring",
                description: "Individualized instruction tailored to each student's goals, strengths, and schedule with dedicated academic coaches.",
              },
              {
                icon: Users,
                title: "Small-Group Classes",
                description: "Collaborative learning environments where students work alongside peers in a supportive, in-person setting.",
              },
              {
                icon: Lightbulb,
                title: "Online School Support",
                description: "Academic coaching and support for students enrolled in partner online schools including Virtual Prep Academy, Aeon School, and ICL Academy.",
              },
            ].map((program, i) => (
              <div
                key={i}
                className="card-gradient p-6 text-white hover:scale-[1.02] transition-transform duration-300"
                style={{ borderRadius: "var(--radius)" }}
              >
                <program.icon className="h-10 w-10 text-teal-300 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{program.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RadAcad Section */}
      <section className="section-light py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Why Families Choose <span className="italic text-primary">Radical Minds</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Flexible, Personalized Learning", desc: "Self-paced education tailored to your child's goals, strengths, and schedule." },
              { title: "Built-In Accountability", desc: "Daily coaching, progress tracking, and regular check-ins keep students on track." },
              { title: "Support Beyond Academics", desc: "We build independence and executive function skills to prepare students for real-world responsibilities." },
              { title: "A Real Community in Jackson", desc: "Students learn alongside peers in a supportive, in-person environment." },
              { title: "Designed for Modern Families", desc: "Ideal for homeschool, online school, athletes, and non-traditional learners." },
              { title: "Daily Group Activities", desc: "Rock climbing, backcountry skiing, field trips, and more — education goes beyond the classroom." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-border p-6" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Ready to <span className="italic text-teal-300">School Differently?</span>
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Apply for a scholarship today or support our mission by making a donation.
            Every contribution helps a student access the education they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-semibold px-8">
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
