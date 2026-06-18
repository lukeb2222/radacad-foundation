import { Link } from "wouter";
import { Heart, GraduationCap, Users, ArrowRight, Star, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect } from "react";

export default function Home() {
  const scrollRef = useScrollAnimation();

  useEffect(() => {
    document.title = "RadAcad Foundation | Scholarships for Jackson Hole Students";
  }, []);

  return (
    <div className="min-h-screen flex flex-col" ref={scrollRef}>
      <Navbar />

      {/* Hero Section - Full width image like RadAcad */}
      <section className="relative">
        <div className="w-full h-[500px] md:h-[600px]">
          <img
            src="/manus-storage/teton_mountains_hero_5b3099a7.jpg"
            alt="Grand Teton Mountains in Jackson Hole"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Intro Text Section - like RadAcad's "Flexible Education for Middle & High School" */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h1
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Scholarships for <span className="italic text-[var(--radacad-teal)]">Flexible Education</span> in Jackson
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-4 font-medium">
            RadAcad Foundation provides need-based and merit-based scholarships to students and families attending Radical Minds Academy.
          </p>
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            We believe every middle and high school student in Jackson, Alpine, Victor, and Driggs deserves access to
            personalized, flexible education — regardless of financial circumstances. Scholarships apply to RadAcad daytime classes only (not summer camps, after-school clubs, or monthly memberships).
          </p>
          <Link href="/apply">
            <button className="bg-[var(--radacad-teal)] text-white px-8 py-3 text-sm font-semibold hover:bg-[#249e8b] transition-colors inline-flex items-center gap-2">
              Apply for a Scholarship <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Partners Section - scrolling logos like RadAcad */}
      <section className="py-10 border-y border-gray-100 overflow-hidden">
        <div className="container mb-6">
          <p className="text-center text-sm uppercase tracking-[0.2em] text-gray-500 font-medium">
            RadAcad Online School Partners
          </p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee gap-20 items-center px-8">
            <img src="/manus-storage/virtual_prep_logo_ee0415f7.jpg" alt="Virtual Preparatory Academy" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/aeon_school_logo_3e116bc9.jpg" alt="Aeon School" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/icl_academy_logo_035d333d.jpg" alt="ICL Academy" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/laurel_springs_logo_78c241ec.webp" alt="Laurel Springs" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/virtual_prep_logo_ee0415f7.jpg" alt="Virtual Preparatory Academy" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/aeon_school_logo_3e116bc9.jpg" alt="Aeon School" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/icl_academy_logo_035d333d.jpg" alt="ICL Academy" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
            <img src="/manus-storage/laurel_springs_logo_78c241ec.webp" alt="Laurel Springs" className="h-10 md:h-14 object-contain grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </section>

      {/* Why Choose Section - 5 feature cards like RadAcad's "Why More Families Choose" */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14 animate-on-scroll">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Why More Families Choose <span className="italic text-[var(--radacad-red)]">Radical Minds</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: "Flexible, Personalized Learning", desc: "Self-paced education tailored to your child's goals, strengths, and schedule." },
              { icon: Users, title: "Built-In Accountability", desc: "Daily coaching, progress tracking, and regular check-ins keep students on track." },
              { icon: Heart, title: "Support Beyond Academics", desc: "We build independence and executive function skills to prepare students for real-world responsibilities." },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-8 bg-white border border-gray-200 hover:shadow-md transition-shadow animate-on-scroll animate-on-scroll-delay-${i + 1}`}
              >
                <item.icon className="h-8 w-8 text-[var(--radacad-teal)] mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { icon: Star, title: "A Real Community in Jackson", desc: "Students learn alongside peers in a supportive, in-person environment in the heart of Jackson Hole." },
              { icon: GraduationCap, title: "Designed for Modern Families", desc: "Ideal for homeschool, online school, athletes, and non-traditional learners who need flexibility." },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-8 bg-white border border-gray-200 hover:shadow-md transition-shadow animate-on-scroll animate-on-scroll-delay-${i + 1}`}
              >
                <item.icon className="h-8 w-8 text-[var(--radacad-teal)] mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* A Smarter Way to Learn - gradient section like RadAcad */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: "var(--radacad-gradient)" }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <img
                src="/manus-storage/students_learning_8ffdc173.jpg"
                alt="Students learning at RadAcad"
                className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-full mx-auto border-4 border-white/20"
              />
            </div>
            <div className="text-white animate-on-scroll animate-on-scroll-delay-2">
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                A Smarter <span className="italic">Way to Learn</span>
              </h2>
              <p className="text-lg text-white/90 leading-relaxed mb-6">
                RadAcad combines the flexibility of online school with the support of in-person coaching.
                Our foundation ensures that cost is never a barrier to this innovative approach to education.
              </p>
              <ul className="space-y-3">
                {[
                  "Personalized learning plans for every student",
                  "Weekly group activities and outdoor adventures",
                  "One-on-one academic coaching sessions",
                  "Support for online school coursework",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-white/70 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Group Activities - photo grid like RadAcad */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12 animate-on-scroll">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Weekly Group <span className="italic text-[var(--radacad-teal)]">Activities</span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Beyond academics, RadAcad students enjoy weekly outdoor adventures and group activities in Jackson Hole.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "/manus-storage/rock_climbing_15c08c2f.jpg", label: "ROCK CLIMBING" },
              { src: "/manus-storage/backcountry_skiing_58090314.jpg", label: "BACKCOUNTRY SKIING" },
              { src: "/manus-storage/friday_field_trips_e3171c43.jpg", label: "FRIDAY FIELD TRIPS" },
              { src: "/manus-storage/students_activity_2a3e9e07.jpg", label: "GROUP ACTIVITIES" },
            ].map((activity, i) => (
              <div
                key={i}
                className={`relative group overflow-hidden animate-on-scroll animate-on-scroll-delay-${i + 1}`}
              >
                <img src={activity.src} alt={activity.label} className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold tracking-wider">{activity.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Apply - Step cards like RadAcad's "Tailored Learning Plans" enrollment steps */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14 animate-on-scroll">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How to <span className="italic text-[var(--radacad-teal)]">Apply</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Fill Out Application", desc: "Complete our online form with your personal info, program choice, and financial details." },
              { step: "02", title: "Submit Referrals", desc: "Provide at least one referral from a teacher, mentor, or community leader." },
              { step: "03", title: "Committee Review", desc: "Our review committee evaluates applications and makes scholarship decisions." },
              { step: "04", title: "Start Learning", desc: "Once approved, enroll in your chosen RadAcad program with full or partial scholarship." },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 text-center animate-on-scroll animate-on-scroll-delay-${i + 1}`}
                style={{ background: "var(--radacad-peach)", borderRadius: "0 0 40px 0" }}
              >
                <div className="text-3xl font-bold text-[var(--radacad-teal)] mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container text-center animate-on-scroll">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to <span className="italic text-[var(--radacad-teal)]">School Differently?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Apply for a scholarship today or support our mission by making a donation.
            Every contribution helps a student access the education they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <button className="bg-[var(--radacad-teal)] text-white px-8 py-3 text-sm font-semibold hover:bg-[#249e8b] transition-colors inline-flex items-center gap-2">
                Start Your Application <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/donate">
              <button className="border-2 border-[var(--radacad-teal)] text-[var(--radacad-teal)] px-8 py-3 text-sm font-semibold hover:bg-[var(--radacad-teal)] hover:text-white transition-colors inline-flex items-center gap-2">
                Donate Now <Heart className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
