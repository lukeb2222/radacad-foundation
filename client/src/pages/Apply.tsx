import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Referral = { referrerName: string; referrerEmail: string; relationship: string };

export default function Apply() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [programInterest, setProgramInterest] = useState("");
  const [currentEducation, setCurrentEducation] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [financialStatement, setFinancialStatement] = useState("");
  const [essay, setEssay] = useState("");
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

  const handleSubmit = () => {
    const validReferrals = referrals.filter(
      (r) => r.referrerName && r.referrerEmail && r.relationship
    );
    submitMutation.mutate({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      country: country || undefined,
      programInterest,
      currentEducation: currentEducation || undefined,
      employmentStatus: employmentStatus || undefined,
      amountRequested,
      financialStatement: financialStatement || undefined,
      essay,
      referrals: validReferrals,
    });
  };

  const totalSteps = 5;

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Application Submitted
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Thank you for applying to the RadAcad Foundation Scholarship. Our committee
              will review your application and contact you at the email address provided.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-16 md:pt-36 md:pb-20">
        <div className="container text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">
            Scholarship Application
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Apply for Funding
          </h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Complete the application below to be considered for a RadAcad Foundation scholarship.
            All fields marked with * are required.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {["Personal Info", "Program", "Financial", "Essay", "Referrals"].map((label, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step > i + 1
                      ? "bg-green-500 text-white"
                      : step === i + 1
                      ? "bg-accent text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline text-xs ml-2 text-muted-foreground">{label}</span>
                {i < 4 && <div className="w-8 sm:w-12 h-0.5 bg-muted mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="py-12 flex-1">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Program */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-6">Program Interest</h2>
                  <div>
                    <Label htmlFor="program">Which RadAcad program are you applying for? *</Label>
                    <Select value={programInterest} onValueChange={setProgramInterest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Power BI Comprehensive">Power BI Comprehensive</SelectItem>
                        <SelectItem value="Data Analytics Bootcamp">Data Analytics Bootcamp</SelectItem>
                        <SelectItem value="Advanced DAX & Modeling">Advanced DAX & Modeling</SelectItem>
                        <SelectItem value="Full Stack Data Professional">Full Stack Data Professional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="education">Current Education Level</Label>
                    <Select value={currentEducation} onValueChange={setCurrentEducation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Some College">Some College</SelectItem>
                        <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                        <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                        <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                        <SelectItem value="Doctorate">Doctorate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="employment">Employment Status</Label>
                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employed Full-Time">Employed Full-Time</SelectItem>
                        <SelectItem value="Employed Part-Time">Employed Part-Time</SelectItem>
                        <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Financial */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-6">Financial Information</h2>
                  <div>
                    <Label htmlFor="amount">Amount of Funding Requested (USD) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amountRequested}
                      onChange={(e) => setAmountRequested(e.target.value)}
                      placeholder="e.g. 2500"
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the total amount you need to cover program tuition and materials.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="financial">Financial Statement</Label>
                    <Textarea
                      id="financial"
                      value={financialStatement}
                      onChange={(e) => setFinancialStatement(e.target.value)}
                      placeholder="Please describe your current financial situation and why you need scholarship assistance..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Explain your financial circumstances and why you are unable to cover the program costs.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Essay */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-6">Personal Statement</h2>
                  <div>
                    <Label htmlFor="essay">Essay / Personal Statement *</Label>
                    <Textarea
                      id="essay"
                      value={essay}
                      onChange={(e) => setEssay(e.target.value)}
                      placeholder="Tell us about yourself, your goals, and how this scholarship will help you achieve them..."
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 200 words. Tell us about your background, career goals, and how data analytics
                      education will impact your life and community.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Referrals */}
              {step === 5 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-6">Referrals</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please provide at least one referral who can speak to your character and qualifications.
                  </p>
                  {referrals.map((ref, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Referral {index + 1}</span>
                        {referrals.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeReferral(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={ref.referrerName}
                          onChange={(e) => updateReferral(index, "referrerName", e.target.value)}
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <Label>Email Address *</Label>
                        <Input
                          type="email"
                          value={ref.referrerEmail}
                          onChange={(e) => updateReferral(index, "referrerEmail", e.target.value)}
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <Label>Relationship *</Label>
                        <Input
                          value={ref.relationship}
                          onChange={(e) => updateReferral(index, "relationship", e.target.value)}
                          placeholder="e.g. Manager, Professor, Mentor"
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addReferral} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Another Referral
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {step > 1 ? (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                ) : (
                  <div />
                )}
                {step < totalSteps ? (
                  <Button onClick={() => setStep(step + 1)}>
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="bg-accent hover:bg-accent/90"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
