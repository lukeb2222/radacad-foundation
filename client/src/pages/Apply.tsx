import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, GraduationCap, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type Referral = { referrerName: string; referrerEmail: string; relationship: string };

// Essay questions per scholarship type
const NEED_BASED_ESSAYS = [
  {
    label: "1. Why are you interested in attending Radical Minds Academy?",
    hint: "How does RadAcad's approach to learning and community fit your educational goals, interests, and learning style?",
  },
  {
    label: "2. How do you demonstrate the values outlined in RadAcad's Code of Conduct?",
    hint: "Describe examples of ownership, curiosity, integrity, responsibility, collaboration, or perseverance in your life.",
  },
  {
    label: "3. What strengths would you bring to the RadAcad community?",
    hint: "How do you contribute positively to groups, support others, and help build a strong community?",
  },
  {
    label: "4. What are your academic, personal, or career goals for the coming year?",
    hint: "How would attending RadAcad help you pursue those goals?",
  },
];

const MERIT_ESSAYS = [
  {
    label: "1. Why are you interested in attending Radical Minds Academy?",
    hint: "How does RadAcad's approach to learning and community fit with your lifestyle, training schedule, personal goals, and the way you learn best?",
  },
  {
    label: "2. How do you demonstrate the values in RadAcad's Code of Conduct?",
    hint: "Reflect on ownership, curiosity, integrity, collaboration, and responsibility — with specific examples.",
  },
  {
    label: "3. Describe your commitment to ski/snowboard training and JHSC values.",
    hint: "How do you embody commitment, teamwork, sportsmanship, fun, and competition in your athletic life?",
  },
  {
    label: "4. What are your academic and athletic goals for this upcoming year?",
    hint: "Be as specific as you can. What do you want to accomplish and how do you plan to get there?",
  },
];

export default function Apply() {
  const [scholarshipType, setScholarshipType] = useState<"need_based" | "merit_jhsc" | null>(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Student info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [division, setDivision] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Need-based financial
  const [householdIncome, setHouseholdIncome] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [mfiPercentage, setMfiPercentage] = useState("");
  const [financialAttestation, setFinancialAttestation] = useState(false);

  // Merit-specific
  const [activeJhscMember, setActiveJhscMember] = useState(false);

  // Essays
  const [essay1, setEssay1] = useState("");
  const [essay2, setEssay2] = useState("");
  const [essay3, setEssay3] = useState("");
  const [essay4, setEssay4] = useState("");

  // Parent statement
  const [parentStatement, setParentStatement] = useState("");

  // Referrals/recommendations
  const [referrals, setReferrals] = useState<Referral[]>([
    { referrerName: "", referrerEmail: "", relationship: "" },
  ]);

  const submitMutation = trpc.application.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit application");
    },
  });

  const scrollRef = useScrollAnimation();

  const addReferral = () => {
    setReferrals([...referrals, { referrerName: "", referrerEmail: "", relationship: "" }]);
  };

  const removeReferral = (index: number) => {
    if (referrals.length > 1) {
      setReferrals(referrals.filter((_, i) => i !== index));
    }
  };

  const updateReferral = (index: number, field: keyof Referral, value: string) => {
    const updated = [...referrals];
    updated[index] = { ...updated[index], [field]: value };
    setReferrals(updated);
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = division === "high_school" ? 600 : 300;

  // Steps vary by type
  const getSteps = () => {
    if (scholarshipType === "need_based") {
      return ["Student Info", "Financial Info", "Essays", "Parent Statement", "Recommendations"];
    }
    return ["Student Info", "JHSC Info", "Essays", "Parent Statement", "Recommendations"];
  };

  const totalSteps = 5;

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 1:
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
          toast.error("Please fill in student name and email.");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast.error("Please enter a valid email address.");
          return false;
        }
        if (!gradeLevel) {
          toast.error("Please enter the student's grade level.");
          return false;
        }
        if (!parentName.trim() || !parentEmail.trim()) {
          toast.error("Please fill in parent/guardian name and email.");
          return false;
        }
        return true;
      case 2:
        if (scholarshipType === "need_based") {
          if (!householdIncome.trim() || !householdSize.trim()) {
            toast.error("Please provide household income and size.");
            return false;
          }
          if (!financialAttestation) {
            toast.error("Please confirm the financial need attestation.");
            return false;
          }
        } else {
          if (!activeJhscMember) {
            toast.error("You must be an active JHSC member to apply for this scholarship.");
            return false;
          }
          if (!division) {
            toast.error("Please select your division (Middle School or High School).");
            return false;
          }
        }
        return true;
      case 3:
        if (!essay1.trim()) {
          toast.error("Please answer the first essay question.");
          return false;
        }
        if (!essay2.trim()) {
          toast.error("Please answer the second essay question.");
          return false;
        }
        if (!essay3.trim()) {
          toast.error("Please answer the third essay question.");
          return false;
        }
        if (!essay4.trim()) {
          toast.error("Please answer the fourth essay question.");
          return false;
        }
        return true;
      case 4:
        if (scholarshipType === "need_based" && !parentStatement.trim()) {
          toast.error("Parent/Guardian statement is required for need-based applications.");
          return false;
        }
        return true;
      case 5:
        const validRefs = referrals.filter(
          (r) => r.referrerName.trim() && r.referrerEmail.trim() && r.relationship.trim()
        );
        if (scholarshipType === "merit_jhsc" && validRefs.length === 0) {
          toast.error("A JHSC coach/staff recommendation is required.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;
    const validReferrals = referrals.filter(
      (r) => r.referrerName.trim() && r.referrerEmail.trim() && r.relationship.trim()
    );
    submitMutation.mutate({
      scholarshipType: scholarshipType!,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      gradeLevel: gradeLevel || undefined,
      division: division || undefined,
      currentSchool: currentSchool.trim() || undefined,
      parentName: parentName.trim() || undefined,
      parentEmail: parentEmail.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      householdIncome: householdIncome.trim() || undefined,
      householdSize: householdSize.trim() || undefined,
      mfiPercentage: mfiPercentage || undefined,
      financialAttestation: financialAttestation || undefined,
      activeJhscMember: activeJhscMember || undefined,
      programInterest: scholarshipType === "merit_jhsc" ? "JHSC Merit Scholarship" : "Need-Based Scholarship",
      amountRequested: "0",
      essay: essay1.trim(),
      essay2: essay2.trim() || undefined,
      essay3: essay3.trim() || undefined,
      essay4: essay4.trim() || undefined,
      parentStatement: parentStatement.trim() || undefined,
      referrals: validReferrals,
    });
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-[var(--radacad-teal)]/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-[var(--radacad-teal)]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Application Submitted
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Thank you for applying to the RadAcad Foundation{" "}
              {scholarshipType === "merit_jhsc" ? "JHSC Merit Scholarship" : "Need-Based Scholarship"}.
              Our committee will review your application and contact you at the email address provided.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Scholarship type selection
  if (!scholarshipType) {
    return (
      <div className="min-h-screen flex flex-col" ref={scrollRef}>
        <Navbar />
        <section className="relative pt-32 pb-16 md:pt-36 md:pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <img src="/manus-storage/summer_camp_9578e76c_95548b46.jpg" alt="RadAcad students" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#1a2332]/80" />
          </div>
          <div className="container relative z-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
              Scholarship Application
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Apply for a <span className="italic text-teal-300">Scholarship</span>
            </h1>
            <p className="text-white/80 max-w-xl mx-auto">
              Choose the scholarship type that applies to you.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-heading)" }}>
              Select Your Scholarship Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Need-Based */}
              <Card
                className="cursor-pointer border-2 border-gray-200 hover:border-[var(--radacad-teal)] hover:shadow-lg transition-all group"
                onClick={() => setScholarshipType("need_based")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center bg-[var(--radacad-teal)]/10 group-hover:bg-[var(--radacad-teal)]/20 transition-colors">
                    <Heart className="h-8 w-8 text-[var(--radacad-teal)]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Need-Based Scholarship</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    For families who demonstrate financial need. Automatic 10-20% discounts based on household income,
                    with additional aid available for exceptional need.
                  </p>
                  <ul className="text-xs text-gray-500 text-left space-y-1">
                    <li>• Household financial information required</li>
                    <li>• 4 essay questions (300 words MS / 600 words HS)</li>
                    <li>• Parent/Guardian statement required</li>
                    <li>• Transcript + optional recommendation</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Merit (JHSC) */}
              <Card
                className="cursor-pointer border-2 border-gray-200 hover:border-[var(--radacad-red)] hover:shadow-lg transition-all group"
                onClick={() => setScholarshipType("merit_jhsc")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center bg-[var(--radacad-red)]/10 group-hover:bg-[var(--radacad-red)]/20 transition-colors">
                    <GraduationCap className="h-8 w-8 text-[var(--radacad-red)]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">JHSC Merit Scholarship</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    For active Jackson Hole Ski & Snowboard Club members who demonstrate excellence in academics and athletics.
                    Awards of 25-50% tuition.
                  </p>
                  <ul className="text-xs text-gray-500 text-left space-y-1">
                    <li>• Must be an active JHSC member</li>
                    <li>• 4 essay questions (300 words MS / 600 words HS)</li>
                    <li>• JHSC coach recommendation required</li>
                    <li>• Transcript + optional additional recommendation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const essays = scholarshipType === "merit_jhsc" ? MERIT_ESSAYS : NEED_BASED_ESSAYS;
  const steps = getSteps();

  return (
    <div className="min-h-screen flex flex-col" ref={scrollRef}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/manus-storage/summer_camp_9578e76c_95548b46.jpg" alt="RadAcad students" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1a2332]/80" />
        </div>
        <div className="container relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
            {scholarshipType === "merit_jhsc" ? "JHSC Merit Scholarship" : "Need-Based Scholarship"}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Apply for a <span className="italic text-teal-300">Scholarship</span>
          </h1>
          <button
            onClick={() => { setScholarshipType(null); setStep(1); }}
            className="text-sm text-white/60 hover:text-white underline mt-2"
          >
            ← Choose a different scholarship type
          </button>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors ${
                    i + 1 <= step
                      ? "bg-[var(--radacad-teal)] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden md:block text-xs ml-2 text-gray-600">{label}</span>
                {i < steps.length - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-2 ${i + 1 < step ? "bg-[var(--radacad-teal)]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <section className="py-12 md:py-16 flex-1">
        <div className="container max-w-2xl">
          {/* Step 1: Student Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                Student Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student First Name *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div>
                  <Label>Student Last Name *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div>
                <Label>Student Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@email.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Current Grade Level *</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6th">6th Grade</SelectItem>
                      <SelectItem value="7th">7th Grade</SelectItem>
                      <SelectItem value="8th">8th Grade</SelectItem>
                      <SelectItem value="9th">9th Grade</SelectItem>
                      <SelectItem value="10th">10th Grade</SelectItem>
                      <SelectItem value="11th">11th Grade</SelectItem>
                      <SelectItem value="12th">12th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(307) 555-0000" />
                </div>
              </div>
              <div>
                <Label>Current School (if applicable)</Label>
                <Input value={currentSchool} onChange={(e) => setCurrentSchool(e.target.value)} placeholder="School name" />
              </div>
              <Separator />
              <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Parent/Guardian Name *</Label>
                  <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <Label>Parent/Guardian Email *</Label>
                  <Input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@email.com" />
                </div>
              </div>
              <div>
                <Label>Parent/Guardian Phone</Label>
                <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="(307) 555-0000" />
              </div>
            </div>
          )}

          {/* Step 2: Financial (Need-Based) or JHSC Info (Merit) */}
          {step === 2 && scholarshipType === "need_based" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                Household Financial Information
              </h2>
              <p className="text-sm text-gray-600">
                Families at 100-120% of local Median Family Income (MFI) qualify for a 10% discount.
                Families below 100% MFI qualify for a 20% discount. Additional aid may be available for exceptional need.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Household Income *</Label>
                  <Input value={householdIncome} onChange={(e) => setHouseholdIncome(e.target.value)} placeholder="e.g. $65,000" />
                </div>
                <div>
                  <Label>Household Size *</Label>
                  <Input value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} placeholder="e.g. 4" />
                </div>
              </div>
              <div>
                <Label>Estimated Household Income as % of Local MFI</Label>
                <Select value={mfiPercentage} onValueChange={setMfiPercentage}>
                  <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100_120">100–120% of MFI (10% discount)</SelectItem>
                    <SelectItem value="below_100">Below 100% of MFI (20% discount)</SelectItem>
                    <SelectItem value="not_sure">Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={financialAttestation}
                    onChange={(e) => setFinancialAttestation(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--radacad-teal)]"
                  />
                  <span className="text-sm text-gray-700">
                    I certify that the information provided in this application is accurate to the best of my knowledge
                    and understand that scholarship funds are limited and intended for families with demonstrated financial need. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && scholarshipType === "merit_jhsc" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                JHSC Membership & Division
              </h2>
              <p className="text-sm text-gray-600">
                This scholarship is for active Jackson Hole Ski & Snowboard Club members who demonstrate
                excellence in both academics and athletics.
              </p>
              <div>
                <Label>Division *</Label>
                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle_school">Middle School</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeJhscMember}
                    onChange={(e) => setActiveJhscMember(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--radacad-teal)]"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that I am a current, active member of the Jackson Hole Ski & Snowboard Club. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Essays */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Student Questionnaire
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  {division === "high_school" || (!division && ["9th", "10th", "11th", "12th"].includes(gradeLevel))
                    ? "High School: 600 words max per question"
                    : "Middle School: 300 words max per question"}
                </p>
              </div>
              {[
                { value: essay1, setter: setEssay1 },
                { value: essay2, setter: setEssay2 },
                { value: essay3, setter: setEssay3 },
                { value: essay4, setter: setEssay4 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">{essays[i].label}</Label>
                  <p className="text-xs text-gray-500 italic">{essays[i].hint}</p>
                  <Textarea
                    value={item.value}
                    onChange={(e) => item.setter(e.target.value)}
                    rows={6}
                    placeholder="Write your response here..."
                    className="resize-y"
                  />
                  <p className={`text-xs ${wordCount(item.value) > maxWords ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    {wordCount(item.value)} / {maxWords} words
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Parent Statement */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                Parent/Guardian Statement
              </h2>
              {scholarshipType === "need_based" ? (
                <p className="text-sm text-gray-600">
                  Please explain how receiving this scholarship would impact your family's educational options
                  and ability to attend Radical Minds Academy. Include any additional financial circumstances
                  or context you would like the Scholarship Committee to consider. <strong>(Required)</strong>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Optional, but encouraged. Please share any additional insights about your student that you
                  think the selection committee should consider.
                </p>
              )}
              <Textarea
                value={parentStatement}
                onChange={(e) => setParentStatement(e.target.value)}
                rows={8}
                placeholder="Write the parent/guardian statement here..."
                className="resize-y"
              />
            </div>
          )}

          {/* Step 5: Recommendations */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
                {scholarshipType === "merit_jhsc" ? "Recommendations" : "Recommendation (Optional)"}
              </h2>
              {scholarshipType === "merit_jhsc" ? (
                <p className="text-sm text-gray-600">
                  A letter of recommendation from a JHSC coach or staff member is <strong>required</strong>.
                  You may also provide an additional recommendation from a teacher, mentor, or other reference.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  You may optionally provide a letter of recommendation from a teacher, mentor, or community leader.
                </p>
              )}
              {referrals.map((ref, i) => (
                <Card key={i} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {scholarshipType === "merit_jhsc" && i === 0
                          ? "JHSC Coach/Staff Recommendation (Required)"
                          : `Recommendation ${i + 1}${scholarshipType === "merit_jhsc" ? " (Optional)" : ""}`}
                      </span>
                      {referrals.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeReferral(i)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Name"
                        value={ref.referrerName}
                        onChange={(e) => updateReferral(i, "referrerName", e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={ref.referrerEmail}
                        onChange={(e) => updateReferral(i, "referrerEmail", e.target.value)}
                      />
                      <Input
                        placeholder="Relationship (e.g. JHSC Coach)"
                        value={ref.relationship}
                        onChange={(e) => updateReferral(i, "relationship", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={addReferral} className="gap-2">
                <Plus className="h-4 w-4" /> Add Another Recommendation
              </Button>

              <div className="bg-gray-50 p-4 border border-gray-200 mt-6">
                <p className="text-sm text-gray-700 font-medium mb-2">Required Materials Checklist:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Completed application (this form)</li>
                  <li>• Most recent academic transcript or report card (email to garrett.austen@tetontutors.org)</li>
                  {scholarshipType === "merit_jhsc" && (
                    <li>• Letter of recommendation from a JHSC coach or staff member</li>
                  )}
                  <li>• {scholarshipType === "need_based" ? "Parent/Guardian Statement (included above)" : "(Optional) Additional letter of recommendation"}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <Button onClick={goNext} className="gap-2 bg-[var(--radacad-teal)] hover:bg-[#249e8b] text-white">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="gap-2 bg-[var(--radacad-teal)] hover:bg-[#249e8b] text-white"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Separator() {
  return <div className="border-t border-gray-200 my-4" />;
}
